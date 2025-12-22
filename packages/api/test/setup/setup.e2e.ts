import { beforeAll, afterAll } from 'vitest';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, Client } from 'pg';
import { execSync } from 'child_process';

let testDb: StartedPostgreSqlContainer;
let testRedis: StartedRedisContainer;
let prisma: PrismaClient;
let dbClient: Client;
let testPool: Pool;

beforeAll(async () => {
  // Start Postgres container
  testDb = await new PostgreSqlContainer('postgres:18').start();

  dbClient = new Client({
    host: testDb.getHost(),
    port: testDb.getPort(),
    database: testDb.getDatabase(),
    user: testDb.getUsername(),
    password: testDb.getPassword(),
  });

  await dbClient.connect();

  const connectionUri = testDb.getConnectionUri();

  // Run Prisma migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: connectionUri },
  });

  // Set up Prisma client
  testPool = new Pool({ connectionString: connectionUri });
  const adapter = new PrismaPg(testPool);
  prisma = new PrismaClient({ adapter });

  await prisma.$connect();

  // Start Redis container
  testRedis = await new RedisContainer('redis:8.4.0').start();
}, 60000);

afterAll(async () => {
  await prisma.$disconnect();
  await testPool.end();
  await dbClient.end();
  await testDb.stop();
  await testRedis.stop();
});

// Export for use in tests
export { prisma, dbClient, testRedis };
