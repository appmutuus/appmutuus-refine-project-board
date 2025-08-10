export function log(...args) {
  console.log(...args);
}

export function error(...args) {
  console.error(...args);
}

export const logger = { log, error };
