import React from "react";
import styled from "styled-components";
import ControllableReducerProvider from "../providers/ControllableReducerProvider";

// This is a Temperature Converter component as found in the 7 GUIs challenge: http://eugenkiss.github.io/7guis/tasks/

// Define styled components that will compose into Temperature Converter

const TemperatureContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  div {
    margin-bottom: 10px;
    font-size: 12px;
    font-style: italic;
  }
`;

const InputContainer = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #333;
  padding: 10px;
  color: white;
  border-radius: 3px;
  max-width: 300px;
  border: ${({ wrongResult }) => (wrongResult ? "1px solid red;" : "none;")}
    /** 
  * Wow prettier sucks
  */ input {
    max-width: 50px;
  }

  * {
    margin-right: 10px;
  }
`;

// Some utility methods [can be included in another file]

const convertCelsiusToFahrenheit = celcius => Number(celcius) * (9 / 5) + 32;
const convertFahrenheitToCelsius = fahrenheit =>
  (Number(fahrenheit) - 32) * (5 / 9);
const makeHandler = dispatch => action => event => dispatch(action(event));
const isConversionCorrect = (celcius, fahrenheit) =>
  Number(fahrenheit).toFixed(5) ===
  convertCelsiusToFahrenheit(celcius).toFixed(5);

// Create the actions for the reducer [can be included in another file]

const CELCIUS_INPUT_CHANGED = "CELCIUS_INPUT_CHANGED";
const FAHRENHEIT_INPUT_CHANGED = "FAHRENHEIT_INPUT_CHANGED";

const celciusInputChanged = event => {
  return {
    type: CELCIUS_INPUT_CHANGED,
    payload: event.currentTarget.value
  };
};

const fahrenheitInputChanged = event => {
  return {
    type: FAHRENHEIT_INPUT_CHANGED,
    payload: event.currentTarget.value
  };
};

// The reducer used to manage the internal and external state with the component
// [can be included in another file]

const reducer = (state = { celciusValue: 0, fahrenheitValue: 32 }, action) => {
  switch (action.type) {
    case "INIT": {
      const { celciusValue } = state; // this could be smarter and see which value is available
      return {
        celciusValue,
        fahrenheitValue: convertCelsiusToFahrenheit(celciusValue)
      };
    }
    case CELCIUS_INPUT_CHANGED: {
      const celciusValue = action.payload;
      return {
        celciusValue,
        fahrenheitValue: convertCelsiusToFahrenheit(celciusValue)
      };
    }
    case FAHRENHEIT_INPUT_CHANGED: {
      const fahrenheitValue = action.payload;
      return {
        celciusValue: convertFahrenheitToCelsius(fahrenheitValue),
        fahrenheitValue
      };
    }
    default: {
      return state;
    }
  }
};

// Define which props are "controllable".
// This is similar to syncPropsToState's schemaKeys, except the reducer 
// updates the entire state instead of updater functions

const controlledProps = ["celciusValue", "fahrenheitValue"];

// Compose ControllableReducerProvider, Container, and inputs

const getCelciusProps = state => {
  const {
    celciusValue,
    defaultCelciusValue,
    dispatch,
    controlledProps
  } = state;
  if (
    (celciusValue !== undefined && controlledProps.includes("celciusValue")) ||
    defaultCelciusValue === undefined
  ) {
    return {
      value: celciusValue,
      onChange: makeHandler(dispatch)(celciusInputChanged)
    };
  }
  return { defaultValue: defaultCelciusValue };
};

const getFahrenheitProps = state => {
  const {
    fahrenheitValue,
    defaultFahrenheitValue,
    dispatch,
    controlledProps
  } = state;
  if (
    (fahrenheitValue !== undefined &&
      controlledProps.includes("fahrenheitValue")) ||
    defaultFahrenheitValue === undefined
  ) {
    return {
      value: fahrenheitValue,
      onChange: makeHandler(dispatch)(fahrenheitInputChanged)
    };
  }
  return { defaultValue: defaultFahrenheitValue };
};

class TemperatureConverter extends React.Component {
  render() {
    return (
      <ControllableReducerProvider
        reducer={reducer}
        controlledProps={controlledProps}
        {...this.props}
      >
        {state => {
          const { celciusValue, fahrenheitValue } = state;
          return (
            <TemperatureContainer>
              <div>Input a temperature</div>
              <InputContainer
                wrongResult={
                  !isConversionCorrect(celciusValue, fahrenheitValue)
                }
              >
                <input {...getCelciusProps(state)} />
                <span>Celcius =</span>
                <input {...getFahrenheitProps(state)} />
                <span>Fahrenheit</span>
              </InputContainer>
            </TemperatureContainer>
          );
        }}
      </ControllableReducerProvider>
    );
  }
}

export default TemperatureConverter;
