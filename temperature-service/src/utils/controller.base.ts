import { Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export abstract class BaseController {
  constructor(@Inject(ModuleRef) public readonly moduleRef: ModuleRef) {}

  protected with<T>(handler: new (...args: any[]) => T): T {
    return this.moduleRef.get(handler);
  }
}
