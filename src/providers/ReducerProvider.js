import React from "react";
import PropTypes from "prop-types";

// TODO: Create this and use it with controllable and valuable
// TODO: Based on ReasonReact's ReducerComponent and state update utils (create utils to modify plain objects, map to reason so we can migrate)

// Consider https://github.com/jamesplease/react-composer to combine these render props :)
// TODO: also need to create a typed prop api that wraps all of it

// TODO: Fire onChange, et al, every time the state changes?
// TODO: Fire specific change handlers for each controlled prop?

// TODO: Create a mock flux dispatcher and show how you can replace the dispatch in the provider with new dispatch to take complete control
// TODO: Consider the new context APIs as well
// TODO: Maybe use the Reducer.Provider Reducer.Consumer syntax?

const noop = () => { };

// Call a function if it exists
const callFn = (fn = null) => (...args) => {
  fn ? fn(...args) : noop();
};

class ReducerProvider extends React.Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    return prevState == null ? nextProps.initialState : prevState;
  }

  dispatch = action => {
    const onStateChange = callFn(this.props.onStateChange);
    this.setState(this.props.reducer(this.state, action), () => {
      onStateChange(this.state);
    });
  };

  render() {
    return this.props.children({
      ...this.props,
      ...this.state,
      dispatch: this.dispatch
    });
  }
}

export default ReducerProvider;
