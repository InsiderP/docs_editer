import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend on localhost:8080
  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true,
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully!');
  });

  const config = new DocumentBuilder()
    .setTitle('Google Docs Replica API')
    .setDescription('API documentation for Auth and Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
