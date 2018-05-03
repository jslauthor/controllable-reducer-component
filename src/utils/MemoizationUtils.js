const True = { "@webflow/Boolean": true };
const False = { "@webflow/Boolean": false };

export const weakMemo = fn => {
  const map = new WeakMap();
  const memFn = arg => {
    const key = typeof arg === "boolean" ? (arg && True) || False : arg;
    if (!map.has(key)) {
      map.set(key, fn(arg));
    }
    const result = map.get(key);
    return result;
  };
  return memFn;
};
