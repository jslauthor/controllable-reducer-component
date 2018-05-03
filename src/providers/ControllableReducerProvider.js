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
      `Once controlled, a component must remain controlled.
            The following value was under control, but now is no longer: ${key}`
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

// TODO: Write tests for this
// TODO: Write docs for this
// TODO: Add isControlled to metadata in action for reducer

class ControllableReducer extends React.Component {
  state;

  constructor(props) {
    super(props);
    this.state = this.props.reducer(this.props.initialState, { type: "INIT" });
  }

  isControlled = weakMemo(controlledProps =>
    controlledProps.some(prop => this.state[prop] !== undefined)
  );

  getControlledPropsInUse = weakMemo(controlledProps =>
    controlledProps.filter(prop => this.state[prop])
  );

  getControlledMetadata = weakMemo(props => ({
    controlledProps: this.getControlledPropsInUse(getControlledProps(props)),
    isControlled: this.isControlled(getControlledProps(props))
  }));

  static getDerivedStateFromProps = (nextProps, prevState = {}) => {
    const derivedState = getControlledProps(nextProps).reduce((state, key) => {
      invariantForControlChange(prevState, nextProps, key);
      if (prevState[key] !== nextProps[key] && nextProps[key] !== undefined) {
        prevState[key] = nextProps[key];
        return prevState;
      }
      return state;
    }, null);
    if (nextProps != null) {
      invariantForMissingAndDefaultProps(nextProps)(derivedState);
    }
    return derivedState;
  };

  dispatch = action => {
    action.metadata = {
      ...action.metadata,
      ...this.getControlledMetadata(this.props)
    };
    // This updates the state using the reducer and calls all controlled
    // change handlers if a change occurred
    this.setState(this.props.reducer(this.state, action), () => {
      // TODO: Check if previous state is same as new state and abort here
      getControlledProps(this.props).forEach(key => {
        if (this.props[key] !== this.state[key]) {
          callFn(this.props[getChangeHandler(key)])(this.state);
        }
      });
    });
  };

  render() {
    return this.props.children({
      dispatch: this.dispatch,
      ...this.props,
      ...this.state,
      ...this.getControlledMetadata(this.props)
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
