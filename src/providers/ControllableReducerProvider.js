import React from "react";
import PropTypes from "prop-types";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";
import { weakMemo } from "../utils/MemoizationUtils";

const arr = [];
const titleCase = str => str.charAt(0).toUpperCase() + str.substr(1);
const getChangeHandler = str => `on${titleCase(str)}Change`;
const getDefaultName = str => `default${titleCase(str)}`;
const sentenceJoin = arr =>
  arr.reduce(
    (str, value, index) =>
      str +
      value +
      (index === arr.length - 2
        ? `, and `
        : index !== arr.length - 1 && arr.length !== 0
          ? `, `
          : ``),
    ""
  );

const invariantForMissingAndDefaultProps = weakMemo(props => state => {
  const controlledProps = getControlledProps(props);
  // TODO: Only fire for dev here __DEV__ here
  if (controlledProps.length === 0 || state === null) {
    return;
  }

  const missingHandlers = controlledProps.reduce((acc, prop) => {
    const handlerProp = getChangeHandler(prop);
    if (state[prop] !== undefined && props[handlerProp] === undefined) {
      acc.push(handlerProp);
    }
    return acc;
  }, []);

  // Display warning if a controlled prop is supplied without an onChange handler
  warning(
    missingHandlers.length === 0,
    `To take control over this component,` + ` Controllable requires %s!`,
    sentenceJoin(missingHandlers)
  );

  const conflictingDefaults = controlledProps.reduce(
    (acc, prop) => {
      const defaultProp = getDefaultName(prop);
      if (state[prop] !== undefined && props[defaultProp] !== undefined) {
        acc[0].push(prop);
        acc[1].push(defaultProp);
      }
      return acc;
    },
    [[], []] // Pair? lol
  );

  // Display warning if a controlled prop is supplied with a default value
  warning(
    conflictingDefaults[0].length === 0,
    `Controllable components require a controlled prop or a default prop, but not both.` +
      ` Select either %s, or %s for this component!`,
    sentenceJoin(conflictingDefaults[0]),
    sentenceJoin(conflictingDefaults[1])
  );
});

const invariantForControlChange = (prevState = {}, nextProps = {}, key) => {
  if (prevState[key]) {
    warning(
      nextProps[key] !== undefined,
      `A component must remain controlled once a parent component supplies a managed property. The following property was under control, but now is no longer: ${key}`
    );
  }
};

const getSafeValue = weakMemo(value => (Array.isArray(value) && value) || arr);
const getControlledProps = weakMemo(({ controlledProps } = {}) =>
  getSafeValue(controlledProps)
);

const noop = () => {};
// Call a function if it exists
const callFn = (fn = null) => (...args) => {
  fn ? fn(...args) : noop;
};

const getControlledMetadata = weakMemo(({ controlledPropsFlags }) => {
  const controlledProps = Array.from(controlledPropsFlags);
  return {
    controlledProps,
    isControlled: controlledProps.length > 0
  };
});

// TODO: Write tests for this
// TODO: Write docs for this

class ControllableReducer extends React.Component {
  state = {
    reducerState: {},
    controlledPropsFlags: new Set()
  };

  constructor(props) {
    super(props);
    this.state.reducerState = this.props.reducer(this.props.initialState, {
      type: "INIT"
    });
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const derivedState = getControlledProps(nextProps).reduce((state, key) => {
      // Controllers of controlled components should never relinquish control
      if (nextProps[key] !== undefined) {
        state.controlledPropsFlags = prevState.controlledPropsFlags.add(key);
      }
      const keyIsControlled = state.controlledPropsFlags.has(key);
      if (keyIsControlled) {
        // Throw warning if parent relinquishes control of any property
        invariantForControlChange(prevState.reducerState, nextProps, key);
      }
      // Assign incoming property to internal state
      if (prevState.reducerState[key] !== nextProps[key] && keyIsControlled) {
        state.reducerState = { ...state.reducerState, [key]: nextProps[key] };
      }
      return state;
    }, prevState);
    if (nextProps != null) {
      invariantForMissingAndDefaultProps(nextProps)(derivedState);
    }
    return derivedState !== prevState ? derivedState : null;
  };

  dispatch = action => {
    action.metadata = {
      ...action.metadata,
      ...getControlledMetadata(this.state)
    };
    // This updates the state using the reducer and calls all controlled
    // change handlers if a change occurred
    this.setState(
      { reducerState: this.props.reducer(this.state.reducerState, action) },
      () => {
        // TODO: Check if previous state is same as new state and abort here
        getControlledProps(this.props).forEach(key => {
          if (
            this.props[key] !== this.state.reducerState[key] &&
            this.state.controlledPropsFlags.has(key)
          ) {
            callFn(this.props[getChangeHandler(key)])(
              this.state.reducerState[key]
            );
          }
        });
      }
    );
  };

  render() {
    return this.props.children({
      dispatch: this.dispatch,
      ...this.props,
      ...this.state.reducerState,
      ...getControlledMetadata(this.state)
    });
  }
}

ControllableReducer.displayName = "ControllableReducer";

ControllableReducer.propTypes = {
  controlledProps: PropTypes.array.isRequired,
  initialState: PropTypes.object,
  reducer: PropTypes.func.isRequired
};

export default ControllableReducer;
