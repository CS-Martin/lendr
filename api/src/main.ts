import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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

    const port = process.env.PORT ?? 3000;
    await app.listen(port).catch((err) => {
        Logger.error(err);
    });

    Logger.log(`🚀 Application is running on port http://localhost:${port}`);
    Logger.log(`Swagger is running on port http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
    Logger.error(err);
});
