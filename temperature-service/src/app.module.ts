import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { PublisherService } from './services/publiser.service';
import { importClasses } from './utils/import.classes';
import { HeadersInterceptor } from './utils/init.headers';
import { initSentry, SentryContextMiddleware } from './utils/init.sentry';

// Sentry must initialized before the module is defined. Otherwise the integration will not work.
initSentry();

const commandHandlers = importClasses([`${__dirname}/**/*.handler.js`]);
const controllers = importClasses([`${__dirname}/**/*.controller.js`]);
console.log(`Loading ${commandHandlers.length} handlers: ${commandHandlers.map((h) => h.name).join(', ')}`);
console.log(`Loading ${controllers.length} controllers: ${controllers.map((h) => h.name).join(', ')}`);

@Module({
  imports: [SentryModule.forRoot()],
  controllers,
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HeadersInterceptor,
    },
    PublisherService,
    ...commandHandlers,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SentryContextMiddleware).forRoutes('*');
  }
}
