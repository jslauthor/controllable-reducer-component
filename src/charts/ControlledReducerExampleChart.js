// TODO: Write a joi validator for the statechart format?

/* Statechart Utils */

const ON_COMMAND = "on";
// const ON_ENTRY = "onEntry";
const ON_EXIT = "onExit";

/* States */

const AUTONOMOUS = "AUTONOMOUS";
const FULLY_CONTROLLED = "FULLY_CONTROLLED";
const PARTIALLY_CONTROLLED = "PARTIALLY_CONTROLLED";
const DEFAULT_VALUE = "DEFAULT_VALUE";
const DEFAULT_VALUE_ERROR = "DEFAULT_VALUE_ERROR";
const MISSING_HANDLER_ERROR = "MISSING_HANDLER_ERROR";
const CONTROL_REVERT_ERROR = "CONTROL_REVERT_ERROR";

const SIMPLE_VALUE = "SIMPLE_VALUE";

// TODO: Have a welcome page
// TODO: Show console output in app
// TODO: Add tests with React Testing Library
// TODO: Add flow types
// TODO: Add internalState?

/* states */

export const states = [
  AUTONOMOUS,
  FULLY_CONTROLLED,
  PARTIALLY_CONTROLLED,
  DEFAULT_VALUE,
  CONTROL_REVERT_ERROR,
  DEFAULT_VALUE_ERROR,
  MISSING_HANDLER_ERROR,
  SIMPLE_VALUE
];

export const stateObj = states.reduce(
  (acc, route) => ({ ...acc, [route]: route }),
  {}
);

/* Default Routes and Logic */

const defaultRoutesAndLogic = {
  [ON_COMMAND]: stateObj,
  [ON_EXIT]: ["clearConsole"]
};

/* Chart */

export const chart = {
  initial: AUTONOMOUS,
  states: states.reduce(
    (acc, route) => ({ ...acc, ...{ [route]: defaultRoutesAndLogic } }),
    {}
  )
};

/* Logic */

export const logic = {
  clearConsole: (state, payload) => {
    console.clear();
  }
};
