// import { getChangeHandler, getDefaultName } from "./StringUtils";
import { weakMemo } from "./MemoizationUtils";
import { arr } from "./FunctionUtils";

export const getSafeValue = weakMemo(
  value => (Array.isArray(value) && value) || arr
);
export const getControlledProps = weakMemo(({ controlledProps } = {}) =>
  getSafeValue(controlledProps)
);

export const getControlledMetadata = weakMemo(({ controlledPropsFlags }) => {
  const controlledProps = Array.from(controlledPropsFlags);
  return {
    controlledProps,
    isControlled: controlledProps.length > 0
  };
});

// This merges the props, reducer state, and controlled props' values
// in that order (controlled always overrides reducer, which overrides props)
export const getReducedState = (props, state) => {
  const { controlledPropsFlags, reducerState } = state;
  const controlledPropsValues = Array.from(controlledPropsFlags).reduce(
    (values, key) => ({
      ...values,
      [key]: props[key]
    }),
    {}
  );
  return { ...props, ...reducerState, ...controlledPropsValues };
};


var proto = Object.prototype;
var gpo = Object.getPrototypeOf;

const isPojo = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  return gpo(obj) === proto;
}

const INIT = { type: "INIT" };

// getInitialState attempts to 1) use a provided initialState, 
// or 2) merge any controlledProps values into the default reducer state
export const getInitialState = weakMemo(props => {
  const { initialState, controlledProps, reducer } = props;
  // If initialState exists, use it to hydrate the reducer
  if (initialState !== undefined) {
    return reducer(initialState, INIT);
  }
  // Take the default state and merge the props into it
  const reducerDefaultState = reducer(undefined, INIT);
  if (!isPojo(reducerDefaultState)) {
    throw new Error('ControlledReducerProvider reducers may only be of a plain javascript object type.');
  }

  const mergedState = controlledProps.reduce((values, key) => {
    if (props[key] !== undefined) {
      values = values ? values : {};
      return {
        ...values,
        [key]: props[key]
      };
    }

    return values;
  }, reducerDefaultState);

  // Use the merged props as the reducer's initial state
  return reducer(mergedState, INIT);
});
