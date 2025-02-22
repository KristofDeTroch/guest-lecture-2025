import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

export function initDocs(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('System Zero API')
    .setDescription('API description')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  if (process.env.GENERATE_OPENAPI_TEST_JSON === 'true') {
    const location = `${process.cwd()}/openapi.json`.replace('/dist', '');
    writeFileSync(location, JSON.stringify(document, null, 2));
    console.log(`generated new openApi spec at ${location}, exiting with code 0`);
    process.exit(0);
  }

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: '/openapi.json',
    customSiteTitle: 'System Zero API Docs',
  });
}
