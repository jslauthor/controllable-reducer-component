// TODO: Write a joi validator for the statechart format?

/* Statechart Utils */

const ON_COMMAND = "on";
const ON_ENTRY = "onEntry";
const ON_EXIT = "onExit";

/* States */

const AUTONOMOUS = "AUTONOMOUS";
const CONTROLLED = "CONTROLLED";
const DEFAULT_VALUE = "DEFAULT_VALUE";
const DEFAULT_VALUE_ERROR = "DEFAULT_VALUE_ERROR";
const MISSING_HANDLER_ERROR = "MISSING_HANDLER_ERROR";

/* states */

export const states = [
  AUTONOMOUS,
  CONTROLLED,
  DEFAULT_VALUE,
  DEFAULT_VALUE_ERROR,
  MISSING_HANDLER_ERROR
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
