import warning from "fbjs/lib/warning";
import { getChangeHandler, getDefaultName, sentenceJoin } from "./StringUtils";
import { weakMemo } from "./MemoizationUtils";
import { getControlledProps } from "./ReducerProviderUtils";

const dangerouslyOutputToDebugConsole = (string) => 
  document.getElementById(
    "__debug_output"
  ).innerHTML += '> [CONSOLE WARNING] ' + string + '</br></br>';

export const invariantForMissingAndDefaultProps = weakMemo(
  props => ({ controlledPropsFlags }) => {
    const controlledProps = getControlledProps(props);
    if (
      process.env.NODE_ENV === "production" ||
      (controlledProps.length === 0 || controlledPropsFlags.size === 0)
    ) {
      return;
    }

    const missingHandlers = controlledProps.reduce((acc, prop) => {
      const handlerProp = getChangeHandler(prop);
      if (controlledPropsFlags.has(prop) && props[handlerProp] === undefined) {
        acc.push(handlerProp);
      }
      return acc;
    }, []);

    // Display warning if a controlled prop is supplied without an onChange handler
    warning(
      missingHandlers.length === 0,
      `To take control over this component, Controllable requires %s!`,
      sentenceJoin(missingHandlers)
    );

    // THIS IS JUST FOR DEMONSTRATION PURPOSES!
    if (missingHandlers.length !== 0) {
      dangerouslyOutputToDebugConsole(`To take control over this component, Controllable requires ${sentenceJoin(missingHandlers)}!`);
    }

    const conflictingDefaults = controlledProps.reduce(
      (acc, prop) => {
        const defaultProp = getDefaultName(prop);
        if (
          controlledPropsFlags.has(prop) &&
          props[defaultProp] !== undefined
        ) {
          acc[0].push(prop);
          acc[1].push(defaultProp);
        }
        return acc;
      },
      [[], []] // Pair? lol
    );

    // Display warning if a controlled prop is supplied with a default value
    warning(
      conflictingDefaults[0].length === 0,
      `Controllable components require a controlled prop or a default prop, but not both.` +
        ` Select either %s, or %s for this component!`,
      sentenceJoin(conflictingDefaults[0]),
      sentenceJoin(conflictingDefaults[1])
    );

    // THIS IS JUST FOR DEMONSTRATION PURPOSES!
    if (conflictingDefaults[0].length !== 0) {
      dangerouslyOutputToDebugConsole(`Controllable components require a controlled prop or a default prop, but not both.` +
        ` Select either ${sentenceJoin(
          conflictingDefaults[0]
        )}, or ${sentenceJoin(
          conflictingDefaults[1]
        )} for this component!`);
    }
  }
);

export const invariantForControlChange = (
  prevState = {},
  nextProps = {},
  key
) => {
  if (process.env.NODE_ENV !== "production" && prevState[key]) {
    warning(
      nextProps[key] !== undefined,
      `A component must remain controlled once a parent component supplies a managed property. The following property was under control, but now is no longer: ${key}`
    );

    if (nextProps[key] === undefined) {
      dangerouslyOutputToDebugConsole(`A component must remain controlled once a parent component supplies a managed property. The following property was under control, but now is no longer: ${key}`);
    }
  }
};
