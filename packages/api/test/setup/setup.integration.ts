import { beforeAll, afterAll } from 'vitest';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, Client } from 'pg';
import { execSync } from 'child_process';

let testDb: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let dbClient: Client;

beforeAll(async () => {
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

  // Create PrismaService instance pointing to test database
  const testPool = new Pool({ connectionString: connectionUri });
  const adapter = new PrismaPg(testPool);
  prisma = new PrismaClient({ adapter });

  await prisma.$connect();

  console.log('Test database connected');
}, 60000); // 60 second timeout for container startup

afterAll(async () => {
  await prisma.$disconnect();
  await dbClient.end();
  await testDb.stop();
  console.log('Test database stopped');
});

// Export for use in tests
export { prisma, dbClient };
