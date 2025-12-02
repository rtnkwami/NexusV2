/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import YAML from 'yaml';

import { newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { beforeAll, afterAll, it, describe } from 'vitest';

describe('OpenAPI (no external DB)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const db = newDb();

    db.public.registerFunction({
      name: 'version',
      implementation: () => 'PostgreSQL 18.0',
    });

    db.public.registerFunction({
      name: 'current_database',
      implementation: () => 'test_db',
    });

    const ds: DataSource = await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: ['../src/**/*.entity{.ts,.js}'],
      synchronize: true,
    });
    await ds.initialize();
    await ds.synchronize();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(ds)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('writes openapi.yaml', () => {
    const config = new DocumentBuilder()
      .setTitle('Nexus API')
      .setDescription('The backend e-commerce API for Nexus store')
      .setVersion('1.0')
      .addTag('nexus')
      .addBearerAuth()
      .addGlobalResponse({
        status: 500,
        description: 'Internal server error',
        schema: {
          properties: {
            statusCode: { type: 'number', example: 500 },
            message: { type: 'string', example: 'Internal Server Error' },
          },
        },
      })
      .build();

    const doc = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_c, m) => m,
    });

    writeFileSync('openapi.yaml', YAML.stringify(doc), 'utf8');
  });
});
