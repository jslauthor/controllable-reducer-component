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
// in that precedence (controlled always overrides reducer, which overrides props)
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
