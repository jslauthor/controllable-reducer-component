/* Statechart Utils */

const ON_COMMAND = "on";
const ON_ENTRY = "onEntry";
const ON_EXIT = "onExit";

/* States */

const OFF = "off";
const ON = "on";

/* Actions */

const TOGGLE = "toggle";

/* Chart */

export const chart = {
  initial: OFF,
  states: {
    [ON]: {
      [ON_COMMAND]: {
        [TOGGLE]: OFF
      },
      [ON_ENTRY]: ["incrementBy"],
      [ON_EXIT]: ["logme"]
    },
    [OFF]: {
      [ON_COMMAND]: {
        [TOGGLE]: ON
      },
      [ON_ENTRY]: ["incrementBy"]
    }
  }
};

/* Logic */

// TODO: Do we have FSAs? And assume the payload will be passed into every command?

export const logic = {
  incrementBy: (state, payload) => ({
    ...state,
    count: (state.count += payload.amount || 1)
  }),
  logme: (state, payload) => {
    console.log("onexit", state, payload);
  }
};
