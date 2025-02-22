import { glob } from 'glob';
import * as path from 'node:path';

type ClassType<T> = new () => T;

/**
 * Import all classes within a list of directories (js files)
 * @param directories directories glob to scan for classes
 * @returns Array of class types
 *
 * @category Helpers
 */
export const importClasses = <TClassType = any>(
  directories: string[],
  tsNode: boolean = false,
): [ClassType<TClassType>] => {
  const allFiles = directories.reduce((allDirs, dir) => {
    return allDirs.concat(glob.sync(path.normalize(dir)));
  }, [] as string[]);

  const dirs = allFiles
    .filter((file) => file.endsWith(tsNode ? '.ts' : '.js'))
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    .map((file) => require(path.resolve(file)));

  return loadFileClasses(dirs, []);
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const loadFileClasses = (exported: any, allLoaded: Function[]) => {
  if (typeof exported === 'function') {
    allLoaded.push(exported);
  } else if (Array.isArray(exported)) {
    exported.forEach((i: any) => loadFileClasses(i, allLoaded));
  } else if (typeof exported === 'object' && exported !== null) {
    Object.keys(exported).forEach((key) => loadFileClasses(exported[key], allLoaded));
  }
  return allLoaded as any;
};
