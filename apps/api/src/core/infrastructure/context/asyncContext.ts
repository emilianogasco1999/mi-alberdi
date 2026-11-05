import { AsyncLocalStorage } from 'node:async_hooks';

export interface AppAsyncContext {
  userId?: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<AppAsyncContext>();

export const getCurrentUserId = (): string | undefined => {
  return asyncLocalStorage.getStore()?.userId;
};

