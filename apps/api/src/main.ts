import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://localhost:8080',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Lendr API')
        .setDescription('Lendr API description')
        .setVersion('1.0')
        .addGlobalResponse({
            status: 404,
            description: 'Not Found',
        })
        .addGlobalResponse({
            status: 500,
            description: 'Internal Server Error',
        })
        .addSecurity('basic', {
            type: 'http',
            scheme: 'basic',
        })
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.API_PORT ?? 3000;
    await app.listen(port).catch((err) => {
        Logger.error(err);
    });

    Logger.log(`🚀 Application is running on port http://localhost:${port}`);
    Logger.log(`Swagger is running on port http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
    Logger.error(err);
});
