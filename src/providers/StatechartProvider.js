import React from "react";
import PropTypes from "prop-types";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";
import { Machine } from "xstate";
import { callFn } from "../utils/FunctionUtils";

// Statecharts provide a clean separation of concerns: behavior vs internal state
// TODO: Why can't we generate a state map that has tuples for _every_ potential to/from state combo and a function that maps to it
// Then use a pattern matched ReasonML disjointed Union to create updaters for each?

const reduceLogic = machine => machineState => payload => state => logic =>
  machineState.actions.reduce((state, commandKey) => {
    return {
      ...state,
      ...logic[commandKey](state, payload)
    };
  }, state);

class StatechartProvider extends React.Component {
  machine;
  logic;
  state;

  constructor(props) {
    super(props);
    this.machine = Machine(props.chart);
    this.logic = props.logic || {};
    // Run the logic on the initial state and capture resulting data
    this.state = {
      ...reduceLogic(this.machine)(this.machine.initialState)({})(
        this.props.initialChartState || {}
      )(this.logic),
      machineState: this.machine.initialState
    };
  }

  transition = command => payload => {
    const machineState = this.machine.transition(
      this.state.machineState,
      command,
      this.state
    );
    return {
      ...reduceLogic(this.machine)(machineState)(payload)(this.state)(
        this.logic
      ),
      machineState: machineState
    };
  };

  send = command => payload => {
    const newState = this.transition(command)(payload);
    this.setState(newState, () => callFn(this.props.onMachineChange)(newState));
  };

  render() {
    return this.props.children({
      ...this.props,
      ...this.state,
      send: this.send
    });
  }
}

StatechartProvider.propTypes = {
  chart: PropTypes.object.isRequired,
  logic: PropTypes.object.isRequired,
  initialChartState: PropTypes.object,
  onMachineChange: PropTypes.func
};

export default StatechartProvider;
