import { applyEnvConfig } from '@ljobse/appsettings-loader';
import srcConfig from './configs/config.json';

const mergeNestedObjects: any = (obj1: any, obj2: any) =>
  Object.assign(
    {},
    obj1,
    ...Object.keys(obj2).map((key) => ({
      [key]: obj2[key] && typeof obj2[key] === 'object' ? mergeNestedObjects(obj1[key], obj2[key]) : obj2[key],
    })),
  );

const processConfig = <T>(srcConfig: T, localConfigFetcher: () => Partial<T>): T => {
  let localConfig;
  if (['local', 'test', 'benchmark'].includes(process.env.NODE_ENV ?? '')) {
    try {
      localConfig = localConfigFetcher();
    } catch {
      console.error('No local config found');
    }
  }
  let config = applyEnvConfig(srcConfig);
  if (process.env.NODE_ENV !== 'production' && localConfig) {
    config = mergeNestedObjects(applyEnvConfig(config), applyEnvConfig(localConfig));
  }
  return config;
};

const config = processConfig(srcConfig, () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(`./configs/config.${process.env.NODE_ENV}.json`),
);

export { config };
export default config;
