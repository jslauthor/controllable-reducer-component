// import { getChangeHandler, getDefaultName } from "./StringUtils";
import { weakMemo } from "./MemoizationUtils";
import { arr, assoc } from "./FunctionUtils";

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

const proto = Object.prototype;
const gpo = Object.getPrototypeOf;

const isPojo = obj => {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  return gpo(obj) === proto;
};

const INIT = { type: "INIT" };

const addKeyToState = (state = {}, key, value) =>
  assoc(key, value, state);

const getMergedState = (reducerDefaultState, props) => {
  const { controlledProps } = props;
  return controlledProps.reduce((values, key) => {
    if (props[key] !== undefined) {
      return addKeyToState(values, key, props[key]);
    }
    return values;
  }, reducerDefaultState);
};

const throwIfNotPojo = state => {
  if (!isPojo(state)) {
    throw new Error(
      "ControlledReducerProvider reducer state must be a plain JavaScript Object type."
    );
  }
};

// getInitialState attempts to 
// 1) use a provided initialState,
// Or, 2) merge any controlledProps values into the default reducer state
export const getInitialState = weakMemo(props => {
  const { initialState, reducer } = props;
  // If initialState exists, use it to hydrate the reducer
  if (initialState !== undefined) {
    return reducer(initialState, INIT);
  }
  // Take the default state and merge the props into it
  const reducerDefaultState = reducer(undefined, INIT);
  throwIfNotPojo(reducerDefaultState);

  const mergedState = getMergedState(reducerDefaultState, props);

  // Use the merged props as the reducer's initial state
  return reducer(mergedState, INIT);
});
