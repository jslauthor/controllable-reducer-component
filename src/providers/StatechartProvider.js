import React from "react";
import PropTypes from "prop-types";
import invariant from "fbjs/lib/invariant";
import warning from "fbjs/lib/warning";
import { Machine } from "xstate";

// TODO: Probably best to encapsulate all the state into a single state value?
// TODO: Actions property that's past back into the component?
// TODO: Consider a. Allows props to override machine states, or b. clearly separate "behavior" from state

// Statecharts provide a clean separation of concerns: behavior vs internal state

class StatechartProvider extends React.Component {
  state = {
    machine: null,
    currentMachineState: null,
    commands: null
  };

  constructor(props) {
    super(props);
    // TODO: Error if this changes
    this.state.machine = Machine(props.machine);
    this.state.currentMachineState = this.state.machine.initialState;
    // TODO: Why can't we generate a state map that has tuples for _every_ potential to/from state combo and a function that maps to it
    // Then use a pattern matched ReasonML disjointed Union to create updaters for each?
    this.state.commands = props.commands;
    this.state.machine.data = this.props.initialState;
    this.state.machine.data = this.reduceCommands(
      this.state.machine,
      this.state.machine.initialState,
      {}
    );
  }

  static getDerivedStatefromProps = (nextProps, prevState) => {
    //TODO: This is where you machine.transition TO THE CURRENT STATE with the new props/state data
    // TODO: Or not. Only merge controlled props into derivedState and pass that back?
    // const derivedState;
    // return this.transition(this.state.machineState, this.machineState.value, derivedState);
    // TODO: Error if machine or command come through after the first render -- can't update those

    // TODO: Important to keep in mind that statecharts aren't really about internal state... they are about
    // visual representations of states
    return null;
  };

  reduceCommands = (machine, machineState, payload) =>
    machineState.actions.reduce((state, commandKey) => {
      console.log(state);
      return {
        ...this.state.machine.data,
        ...this.state.commands[commandKey](state, payload)
      };
    }, machine.data);

  transition = (command, payload = {}) => {
    // console.log(this.state.machine);
    const machineState = this.state.machine.transition(
      this.state.currentMachineState,
      command,
      this.state.machine.data
    );
    this.state.machine.data = this.reduceCommands(
      this.state.machine,
      machineState,
      payload
    );
    return machineState;
  };

  dispatch = (command, payload) => {
    this.setState({ currentMachineState: this.transition(command, payload) });
  };

  // TODO: Time to test this component out and use incrementBy(state, how much) and how that works with onEnter, onExit, on
  // TODO: Then figure out how to reconcile incoming props

  render() {
    return this.props.children({
      ...this.props,
      componentState: this.state.machine.data,
      dispatch: this.dispatch
    });
  }
}

// StatechartProvider.propTypes = {
//     machine: PropTypes.object.isRequired,
//     commands: PropTypes.object.isRequird,
//     // controlledProps: PropTypes.func.isRequired,
// };

export default StatechartProvider;
