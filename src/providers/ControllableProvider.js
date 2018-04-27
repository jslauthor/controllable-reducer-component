import React from "react";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";

const weakMemo = fn => {
  const map = new WeakMap();
  const memFn = arg => {
    const key = typeof arg === "boolean" ? (arg && True) || False : arg;
    if (!map.has(key)) {
      map.set(key, fn(arg));
    }
    const result = map.get(key);
    return result;
  };
  return memFn;
};

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

const invariantForMissingAndDefaultProps = (state, props) => {
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
    [[], []]
  );

  // Display warning if a controlled prop is supplied with a default value
  warning(
    conflictingDefaults[0].length === 0,
    `Controllable components require a controlled prop or a default prop, but not both.` +
      ` Select either %s, or %s for this component!`,
    sentenceJoin(conflictingDefaults[0]),
    sentenceJoin(conflictingDefaults[1])
  );
};

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

// TODO: Write tests for this
// TODO: Write docs for this

export default class Controllable extends React.Component {
  state = {};

  isControlled = weakMemo(controlledProps =>
    controlledProps.some(prop => this.state[prop] !== undefined)
  );

  getControlledPropsInUse = weakMemo(controlledProps =>
    controlledProps.filter(prop => this.state[prop])
  );

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const derivedState = getControlledProps(nextProps).reduce((state, key) => {
      invariantForControlChange(prevState, nextProps, key);
      if (prevState[key] !== nextProps[key]) {
        prevState[key] = nextProps[key];
        return prevState;
      }
      return state;
    }, null);
    invariantForMissingAndDefaultProps(derivedState, nextProps);
    return derivedState;
  };

  render() {
    return this.props.children({
      ...this.props,
      ...this.state,
      controlledProps: this.getControlledPropsInUse(
        getControlledProps(this.props)
      ),
      isControlled: this.isControlled(getControlledProps(this.props))
    });
  }
}
