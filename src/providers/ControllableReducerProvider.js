import React from "react";
import PropTypes from "prop-types";
import update from "immutability-helper";
import { callFn } from "../utils/FunctionUtils";
import { getChangeHandler } from "../utils/StringUtils";
import {
  getControlledProps,
  getControlledMetadata,
  getReducedState,
  getInitialState
} from "../utils/ReducerProviderUtils";
import {
  invariantForMissingAndDefaultProps,
  invariantForControlChange
} from "../utils/ErrorUtils";

class ControllableReducerProvider extends React.Component {
  // reducerState contains all the reducer state that is provided to the children render prop
  // controlledPropsFlags contains the keys of properties that have received a defined value
  state = {
    reducerState: {},
    controlledPropsFlags: new Set(),
    didWarnForControlChange: false,
    didWarnForMissingAndDefaultProps: false
  };

  // Hydrate the state with an INIT call to the reducer
  constructor(props) {
    super(props);
    this.state.reducerState = getInitialState(this.props);
  }

  // Use getDerivedStateFromProps to reconcile incoming props with internal state
  static getDerivedStateFromProps = (nextProps, prevState) => {
    const derivedState = getControlledProps(nextProps).reduce((state, key) => {
      // Controllers of controlled components should never relinquish control
      if (nextProps[key] !== undefined) {
        state.controlledPropsFlags = state.controlledPropsFlags.add(key);
      }
      const keyIsControlled = state.controlledPropsFlags.has(key);
      if (keyIsControlled && !state.didWarnForControlChange) {
        // Throw warning if parent relinquishes control of any property
        state.didWarnForControlChange = invariantForControlChange(
          state.reducerState,
          nextProps,
          key
        );
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
    if (nextProps != null && !derivedState.didWarnForMissingAndDefaultProps) {
      derivedState.didWarnForMissingAndDefaultProps = invariantForMissingAndDefaultProps(
        nextProps
      )(derivedState);
    }
    return derivedState;
  };

  dispatch = action => {
    // Provide relevant metadata inside action
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
      ...getReducedState(this.props, this.state),
      ...getControlledMetadata(this.state)
    });
  }
}

ControllableReducerProvider.displayName = "ControllableReducerProvider";

// Will implement this in Flow
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
