import { writeFileSync } from 'fs';
import YAML from 'yaml';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
  OpenAPIObject,
} from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Nexus API')
    .setDescription('The backend e-commerce API for Nexus store')
    .setVersion('1.0')
    .addTag('nexus')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document: OpenAPIObject = SwaggerModule.createDocument(
    app,
    config,
    options,
  );
  const yamlDocument = YAML.stringify(document);

  writeFileSync('openapi.yaml', yamlDocument);
  console.log('OpenAPI spec generated as openapi.yaml');

  await app.close();
}

generate().catch((err) => {
  console.error('❌ Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
