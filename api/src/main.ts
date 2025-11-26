import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
  });

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

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
