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

const mergePropsWithState = (props, state) => {
  const { controlledProps } = props;
  return controlledProps.reduce((values, key) => {
    if (props[key] !== undefined) {
      assoc(key, props[key], values);
    }
    return values;
  }, state);
};

const throwIfNotPojo = state => {
  if (!isPojo(state)) {
    throw new Error(
      "ControlledReducerProvider reducer state must be a plain JavaScript Object type."
    );
  }
};

export const makeReducer = reducer => props => (state, action) => {
  const mergedState = mergePropsWithState(props, state);
  const reducedState = reducer(mergedState, action);
  return mergePropsWithState(props, reducedState);
}

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

  const mergedState = mergePropsWithState(props, reducerDefaultState);

  // Use the merged props as the reducer's initial state
  return reducer(mergedState, INIT);
});

