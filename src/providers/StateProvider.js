import React from "react";
import { assoc, callFn } from "../utils/FunctionUtils";
import { getDefaultName } from "../utils/StringUtils";
import { throwIfNotPojo } from "../utils/ErrorUtils";

const noop = () => {};
const REDUCED_STATE = "reducedState";
const DID_WARN_FOR_CONTROL_CHANGE = "didWarnForControlChange";
const CONTROLLABLE_PROPS = "controllableProps";

const mergePropsWithState = controllableProps => (props, state) => {
  if (state === undefined) {
    return state;
  }
  
  return controllableProps.reduce((state, key) => {
    const defaultKey = getDefaultName(key);
    if (props[key] !== undefined) {
      return assoc(key, props[key], state);
    } else if (
      props[defaultKey] !== undefined &&
      state[key] === undefined
    ) {
      return assoc(key, props[defaultKey], state);
    }
    return state;
  }, state);
};

const checkForControlChange = (prevProps, nextProps) => key =>
  prevProps[key] !== undefined && nextProps[key] === undefined;

const warnForControlChange = (prevProps, nextProps, state = {}) => {
  if (state[DID_WARN_FOR_CONTROL_CHANGE] === false) {
    return assoc(
      DID_WARN_FOR_CONTROL_CHANGE,
      state,
      state[CONTROLLABLE_PROPS].every(checkForControlChange(nextProps, state))
    );
  }
  return state;
};

export const makeControllableReducer = (controllableProps = []) => {
  const merge = mergePropsWithState(controllableProps); // merges defaults, too
  return (reducer = noop) => (props = {}) => (state, action) => {
    state !== undefined && throwIfNotPojo(state);
    const mergedState = merge(props, state); // ovewrite controlled props
    let newState = reducer(mergedState, action); // reduce the state
    newState = merge(props, newState); // ovewrite controlled props
    newState = assoc(CONTROLLABLE_PROPS, controllableProps, newState); // record controllable props
    return newState;
  };
};

const isEqual = (a, b) => a !== b;

const filterBy = (keys = [], state) =>
  keys.reduce((newState, key) => ({ [key]: state[key] }), {});

const reduceState = (props, reducedState, action) => {
  const { reducer: makeReducer } = props;
  const reducer = makeReducer(props);
  return reducer(reducedState, action);
};

const emitStateChange = (
  { isEqual: isEqualProp, onStateChange },
  prevState,
  newState
) => () => {
  const isEqualFn = isEqualProp || isEqual;
  isEqualFn(prevState, newState) &&
    callFn(
      onStateChange,
      // Only emit controlled keys so the result
      // can be {...result} back into the component
      filterBy(newState[CONTROLLABLE_PROPS], newState)
    );
};

// MediatorPattern https://en.wikipedia.org/wiki/Mediator_pattern
// TODO: Only emit the controlled state so you can {...state} back into the component ?
// TODO: Add isEqual prop to docs

class StateProvider extends React.Component {
  state = {
    [REDUCED_STATE]: undefined,
    [CONTROLLABLE_PROPS]: [],
    [DID_WARN_FOR_CONTROL_CHANGE]: false
  };

  // TODO: Do we need to emit a change event when reduceState is called on load?
  constructor(props) {
    super(props);
    this.state[REDUCED_STATE] = reduceState(this.props, undefined, {
      type: "INIT"
    });
    emitStateChange(this.props, undefined, this.state[REDUCED_STATE])();
  }

  // TODO: Test for control change error
  // TODO: Write an api tester to ensure components match what they say they will? like jest for it
  // TODO: Do we need to test this against suspense, et al?

  static getDerivedStateFromProps = (nextProps, prevState) => {
    warnForControlChange(this.props, nextProps, prevState);
    return nextProps.autoMergeProps 
      ? mergePropsWithState(prevState[CONTROLLABLE_PROPS])(nextProps, prevState)
      : null
  };

  dispatch = action => {
    const previousState = this.state[REDUCED_STATE];
    const reducedState = reduceState(
      this.props,
      this.state[REDUCED_STATE],
      action
    );
    this.setState(
      {
        [REDUCED_STATE]: reducedState
      },
      emitStateChange(this.props, previousState, reducedState)
    );
  };

  render() {
    const { children, defaultChildren } = this.props;
    const renderChildren = children || defaultChildren;
    return renderChildren({
      ...(callFn(this.props.mapDispatchToActions)(this.dispatch) || {}),
      ...this.props,
      ...this.state[REDUCED_STATE]
    });
  }
}

export default StateProvider;
