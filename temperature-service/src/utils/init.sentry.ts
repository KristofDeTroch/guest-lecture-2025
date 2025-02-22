import { Injectable, type NestMiddleware } from '@nestjs/common';
import {
  consoleIntegration,
  expressIntegration,
  getCurrentScope,
  httpIntegration,
  init,
  nestIntegration,
  setUser,
} from '@sentry/nestjs';
import { NextFunction, Request, Response } from 'express';
import config from '~/config.parser';

@Injectable()
export class SentryContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req['token']?.userId) {
      setUser({ id: req['token'].userId, ip_address: req.ip });
    }

    next();
  }
}

const prismaErrorsToMap = ['PrismaClientKnownRequestError', 'PrismaClientValidationError'];

export const initSentry = () => {
  if (!config.sentry.isEnabled) return;

  init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    maxValueLength: 5000,
    release: config.commitHash,
    sampleRate: config.sentry.sampleRate,
    tracesSampleRate: config.sentry.tracesSampleRate,
    profilesSampleRate: config.sentry.profilesSampleRate,

    integrations: [nestIntegration(), httpIntegration(), expressIntegration(), consoleIntegration()],
    beforeSend(event) {
      const error = event.exception?.values?.[0];
      if (prismaErrorsToMap.includes(error?.type ?? '')) {
        const lastLine =
          error!.value
            ?.split('\n')
            .filter((x) => !!x)
            .pop()
            ?.trim() ?? 'PrismaClientValidationError';

        error!.type = lastLine;
        error!.value = `${error?.[0]?.type}: ${lastLine} \n ${error!.value}`;
        const transactionName = getCurrentScope().getScopeData().transactionName;
        event.fingerprint = [event.transaction || transactionName || 'unknown-transaction', lastLine];
      }

      if (event.type === 'transaction' && event.transaction) {
        const is404 = event.contexts?.response?.status_code === 404;

        const ignoredPaths = ['/health'];
        const shouldIgnorePath = ignoredPaths.some((path) => event.transaction?.includes(path));

        if (is404 || shouldIgnorePath) {
          return null;
        }
      }
      return event;
    },
  });
};
