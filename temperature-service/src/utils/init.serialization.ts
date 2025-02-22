import {
  BadRequestException,
  CallHandler,
  ClassSerializerContextOptions,
  ClassSerializerInterceptor,
  ExecutionContext,
  INestApplication,
  Injectable,
  PlainLiteralObject,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import 'reflect-metadata';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import config from '~/config.parser';

const validationTransformationOptions = {
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  whitelist: true,
  forbidUnknownValues: false,
};
export const initValidation = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      ...validationTransformationOptions,
      exceptionFactory: (errors) => {
        const result = errors.reduce(mapErrors, {});
        console.log('validation error', result);
        return new BadRequestException({
          reason: 'ValidationError',
          errors: result,
          message: 'Some fields have errors',
        });
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
};

@Injectable()
export class TransformInterceptor extends ClassSerializerInterceptor {
  override intercept(context: ExecutionContext, next: CallHandler): any {
    const handlerFunc = context.getHandler();
    const responseMetadata = Reflect.getMetadata('swagger/apiResponse', handlerFunc);
    const responseType = responseMetadata && (Object.values(responseMetadata)?.find((m: any) => m.type) as any)?.type;
    const o: any = this.defaultOptions;
    o.type = responseType;
    o.isArray = responseMetadata?.default?.isArray;
    Object.assign(o, validationTransformationOptions);
    return super.intercept(context, next);
  }

  override async serialize(
    response: PlainLiteralObject | Array<PlainLiteralObject>,
    options: ClassSerializerContextOptions & { isArray: boolean },
  ): Promise<PlainLiteralObject | Array<PlainLiteralObject>> {
    const instance = options.type
      ? plainToInstance(options.type, this.serializeData(response), {
          ...options,
          enableCircularCheck: true,
        })
      : response;
    const responseErrors =
      instance &&
      (options.isArray
        ? (await Promise.all(instance.map((i) => validate(i, validationTransformationOptions))))
            .flatMap((x) => x)
            .filter((x) => x)
        : await validate(instance, validationTransformationOptions));
    if (responseErrors?.length) {
      console.warn(
        `Response view validation errors: ${options.type?.name} has ${responseErrors.length} errors in ${responseErrors
          .map((e: any) => e.property)
          .join(', ')}`,
      );
      if (process.env['VERBOSE']) {
        console.warn(JSON.stringify({ responseErrors }, null, 2));
      }
      if (config.nodeEnv === 'test') {
        throw new Error(
          `Response view validation errors: ${options.type?.name} has ${responseErrors.length} errors in ${responseErrors}`,
        );
      }
    }

    return super.serialize(instance, options);
  }

  private serializeData(data: any): any {
    if (data instanceof Object && typeof data.toObject === 'function') {
      data = data.toObject();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.serializeData(item));
    }

    if (data instanceof Object) {
      for (const key in data) {
        // eslint-disable-next-line no-prototype-builtins
        if (data.hasOwnProperty(key)) {
          data[key] = this.serializeData(data[key]);
        }
      }
    }

    return data;
  }
}

const reduceErrors = (errors: ValidationError[]) => {
  return errors.reduce(mapErrors, {});
};

const mapErrors = (m: any, error: ValidationError) => {
  m[error.property] = error.constraints
    ? Object.values(error.constraints)
    : reduceErrors(error.children as ValidationError[]);
  return m;
};
