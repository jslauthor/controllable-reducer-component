import React from "react";
import PropTypes from "prop-types";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";
import { weakMemo } from "../utils/MemoizationUtils";
import { callFn } from "../utils/FunctionUtils";

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

const invariantForMissingAndDefaultProps = weakMemo(
  props => ({ controlledPropsFlags }) => {
    const controlledProps = getControlledProps(props);
    // TODO: Only fire for dev here __DEV__ here
    if (controlledProps.length === 0 || controlledPropsFlags.size === 0) {
      return;
    }

    const missingHandlers = controlledProps.reduce((acc, prop) => {
      const handlerProp = getChangeHandler(prop);
      if (controlledPropsFlags.has(prop) && props[handlerProp] === undefined) {
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
        if (
          controlledPropsFlags.has(prop) &&
          props[defaultProp] !== undefined
        ) {
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
  }
);

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

const getControlledMetadata = weakMemo(({ controlledPropsFlags }) => {
  const controlledProps = Array.from(controlledPropsFlags);
  return {
    controlledProps,
    isControlled: controlledProps.length > 0
  };
});

// If we have a default value and the reducer supplied default state, we must delete it for components
// like <input /> that don't also follow the rule of "no value allowed if there is a default value"

const getReducedState = (state) => {
  const reducedState = Object.assign({}, state);
  getControlledProps(state).forEach(key => {
    const changeHandlerName = getChangeHandler(key);
    if ( reducedState[getDefaultName(key)]) {
      delete reducedState[key];
      delete reducedState[changeHandlerName];
    }
  });
  return reducedState;
};

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
        state.controlledPropsFlags = state.controlledPropsFlags.add(key);
      }
      const keyIsControlled = state.controlledPropsFlags.has(key);
      if (keyIsControlled) {
        // Throw warning if parent relinquishes control of any property
        invariantForControlChange(state.reducerState, nextProps, key);
      }
      // Assign incoming property to internal state
      if (state.reducerState[key] !== nextProps[key] && keyIsControlled) {
        state.reducerState = { ...state.reducerState, [key]: nextProps[key] };
      }
      return state;
    }, prevState);
    if (nextProps != null) {
      invariantForMissingAndDefaultProps(nextProps)(derivedState);
    }
    return derivedState;
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
        this.state.controlledPropsFlags.forEach(key => {
          this.props[key] !== this.state.reducerState[key] &&
            callFn(this.props[getChangeHandler(key)])(
              this.state.reducerState[key]
            );
        });
      }
    );
  };

  render() {
    // console.log(getReducedState({...this.props, ...this.state.reducerState}));
    // Yes, this creates a new object each time. Need to revisit this.
    return this.props.children({
      dispatch: this.dispatch,
      ...getReducedState({...this.props, ...this.state.reducerState}),
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
