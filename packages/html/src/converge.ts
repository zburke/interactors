import { performance } from 'performance-api';
import { globals } from '@interactors/globals'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function converge<T>(fn: () => T): Promise<T> {
  let startTime = performance.now();
  while(true) {
    try {
      return fn();
    } catch(e) {
      let diff = performance.now() - startTime;
      if(diff > globals.interactorTimeout) {
        throw e;
      } else {
        await wait(1);
      }
    }
  }
}
