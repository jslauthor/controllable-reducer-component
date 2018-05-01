export const noop = () => {};
// Call a function if it exists
export const callFn = (fn = null) => (...args) => {
  fn ? fn(...args) : noop;
};
