import React from "react";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";

const VALUE = "value";
const VALUE_CHANGE = "onValueChange";
const VALUE_DEFAULT = "defaultValue";
const empty = Object.freeze({});

const invariantForMissingAndDefaultProps = (state, props) => {
  // TODO: Only fire for dev here __DEV__ here
  if (state === null) {
    return;
  }

  if (state[VALUE] !== empty && props[VALUE_CHANGE] === undefined) {
    // Display warning if a value prop is supplied without an onChange handler
    warning(
      false,
      `To take control over this component, please provide` +
        ` value and onValueChange.`
    );
  }

  if (state[VALUE] !== empty && props[VALUE_DEFAULT] !== undefined) {
    // Display warning if a value prop is supplied with a default value
    warning(
      false,
      `Controllable components require a controlled prop or a default prop, but not both.` +
        ` Select either value or defaultValue for this component.`
    );
  }
};

const invariantForControlChange = (state, props = {}) => {
  if (state != null && state[VALUE] !== empty) {
    warning(
      props[VALUE] !== empty,
      `Once a component is under your control, you must always keep it under control.
            value was under control, but now is no longer.`
    );
  }
};

// TODO: Write tests for this
// TODO: Write docs for this

export default class Valuable extends React.Component {
  state = { value: empty };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    let newState = null;
    if (prevState[VALUE] !== nextProps[VALUE]) {
      newState = { ...prevState, value: nextProps[VALUE] || empty };
    }
    invariantForControlChange(newState, nextProps, VALUE);
    invariantForMissingAndDefaultProps(newState, nextProps);
    return newState;
  };

  render() {
    return this.props.children({
      ...this.props,
      ...this.state,
      defaultValue: this.props.defaultValue || empty,
      isControlled: this.state.value !== undefined
    });
  }
}
