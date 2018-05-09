import React from "react";
import PropTypes from "prop-types";
import update from "immutability-helper";
import { callFn } from "../utils/FunctionUtils";
import { getChangeHandler } from "../utils/StringUtils";
import {
  getControlledProps,
  getControlledMetadata,
  getReducedState
} from "../utils/ReducerProviderUtils";
import {
  invariantForMissingAndDefaultProps,
  invariantForControlChange
} from "../utils/ErrorUtils";
 
class ControllableReducerProvider extends React.Component {
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
      // Assign incoming property to internal state. If props.autoMergeProps is false, the component
      // will expect the reducer to handle merging via action.metadata.props
      if (
        nextProps.autoMergeProps &&
        state.reducerState[key] !== nextProps[key] &&
        keyIsControlled
      ) {
        state.reducerState = update(state.reducerState, {
          $set: { [key]: nextProps[key] }
        });
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
      ...getControlledMetadata(this.state),
      props: this.props
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
    // Yes, this creates a new object each time. Need to revisit this.
    return this.props.children({
      // Assign this first so that the parent can override it in the props
      dispatch: this.dispatch,
      ...getReducedState({ ...this.props, ...this.state.reducerState }),
      ...getControlledMetadata(this.state)
    });
  }
}

ControllableReducerProvider.displayName = "ControllableReducerProvider";

ControllableReducerProvider.propTypes = {
  controlledProps: PropTypes.array.isRequired,
  initialState: PropTypes.object,
  reducer: PropTypes.func.isRequired,
  autoMergeProps: PropTypes.bool.isRequired
};

ControllableReducerProvider.defaultProps = {
  autoMergeProps: true
};

export default ControllableReducerProvider;
