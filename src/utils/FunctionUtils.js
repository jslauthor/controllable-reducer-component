export const arr = [];

// Call a function if it exists
export const callFn = (fn = null) => (...args) => {
  if (typeof fn === 'function') {
    fn(...args);
  }
};

export const assoc = (prop, val, obj) => {
  var result = {};
  for (var p in obj) {
    result[p] = obj[p];
  }
  result[prop] = val;
  return result;
}