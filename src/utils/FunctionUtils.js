export const arr = [];

// Call a function if it exists
export const callFn = (fn = null) => (...args) => {
  if (typeof fn === 'function') {
    fn(...args);
  }
};
