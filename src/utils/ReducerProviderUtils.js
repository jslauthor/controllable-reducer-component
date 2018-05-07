import { getChangeHandler, getDefaultName } from "./StringUtils";
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

// If we have a default value and the reducer supplied default state, we must delete it for components
// like <input /> that don't also follow the rule of "no value allowed if there is a default value"

export const getReducedState = state => {
  getControlledProps(state).forEach(key => {
    const changeHandlerName = getChangeHandler(key);
    if (state[getDefaultName(key)]) {
      delete state[key];
      delete state[changeHandlerName];
    }
  });
  return state;
};
