import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import YAML from 'yaml';

import { AppModule } from 'src/app.module';
import { beforeAll, afterAll, it, describe } from 'vitest';

describe('OpenAPI', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
