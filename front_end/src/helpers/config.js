export const CONFIG = __CONFIG__;

export function get(key) {
  if (!(key in __CONFIG__)) {
    throw new Error(`Variable ${key} not found in config.`);
  }
  return __CONFIG__[key];
}
