import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { FirebaseAuthGuard } from 'src/auth/auth.guard';
import { BypassAuthGuard } from './auth.override';
import { DataSource } from 'typeorm';

export default async function createTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(FirebaseAuthGuard)
    .useClass(BypassAuthGuard)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      whitelist: true,
    }),
  );

  await app.init();

  const datasource = app.get(DataSource);

  return { app, datasource };
}
