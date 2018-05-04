import React, { Component } from "react";
import styled from "styled-components";
import ControllableReducerProvider from "../providers/ControllableReducerProvider";

// This is a Temperature Converter component as found in the 7 GUIs challenge: http://eugenkiss.github.io/7guis/tasks/

// Define styled components that will compose into Temperature Converter

const Container = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #333;
  padding: 10px;
  color: white;
  border-radius: 3px;
  max-width: 300px;
  margin: 20px;
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
  fahrenheit === convertCelsiusToFahrenheit(celcius);

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

const reducer = (state = { celciusValue: 10, fahrenheitValue: 0 }, action) => {
  switch (action.type) {
    case "INIT": {
      const { fahrenheitValue, celciusValue } = state;
      return {
        celciusValue,
        fahrenheitValue: convertCelsiusToFahrenheit(celciusValue)
      };
    }
    case CELCIUS_INPUT_CHANGED: {
      const { fahrenheitValue } = state;
      const celciusValue = action.payload;
      // Here we check if a particular prop is under the control of the parent. 
      // If it is, we don't change the value
      const { controlledProps } = action.metadata;
      return {
        celciusValue,
        fahrenheitValue: controlledProps.includes("fahrenheitValue")
          ? fahrenheitValue
          : convertCelsiusToFahrenheit(celciusValue)
      };
    }
    case FAHRENHEIT_INPUT_CHANGED: {
      const { celciusValue } = state;
      const fahrenheitValue = action.payload;
      const { controlledProps } = action.metadata;
      return {
        celciusValue: controlledProps.includes("celciusValue")
          ? celciusValue
          : convertFahrenheitToCelsius(fahrenheitValue),
        fahrenheitValue
      };
    }
    default: {
      return state;
    }
  }
};

// Define which props are "controllable"

const controlledProps = ["celciusValue", "fahrenheitValue"];

// Compose ControllableReducerProvider, Container, and inputs

class TemperatureConverter extends React.Component {
  render() {
    return (
      <ControllableReducerProvider
        reducer={reducer}
        controlledProps={controlledProps}
        {...this.props}
      >
        {({
          dispatch,
          celciusValue,
          defaultCelciusValue,
          fahrenheitValue,
          defaultFahrenheitValue
        }) => (
          <Container
            wrongResult={!isConversionCorrect(celciusValue, fahrenheitValue)}
          >
            <input
              value={celciusValue}
              defaultValue={defaultCelciusValue}
              onChange={makeHandler(dispatch)(celciusInputChanged)}
            />
            <span>Celcius =</span>
            <input
              value={fahrenheitValue}
              defaultValue={defaultFahrenheitValue}
              onChange={makeHandler(dispatch)(fahrenheitInputChanged)}
            />
            <span>Fahrenheit</span>
          </Container>
        )}
      </ControllableReducerProvider>
    );
  }
}

export default TemperatureConverter;
