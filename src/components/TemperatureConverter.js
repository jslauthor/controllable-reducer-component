import React, { Component } from "react";
import styled from "styled-components";
import ControllableReducerProvider from "../providers/ControllableReducerProvider";

// Define styled components that will compose into Temperature Converter

const Container = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #333;
  padding: 10px;
  color: white;

  input {
    max-width: 50px;
  }

  * {
    margin-right: 10px;
  }
`;

// Some utility methods

const convertCelsiusToFahrenheit = celcius => Number(celcius) * (9 / 5) + 32;
const convertFahrenheitToCelsius = fahrenheit =>
  (Number(fahrenheit) - 32) * (5 / 9);
const makeHandler = dispatch => action => event => dispatch(action(event));

// Create the actions for the reducer

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

const reducer = (state = { celciusValue: 0, fahrenheitValue: 0 }, action) => {
  console.log(state);
  switch (action.type) {
    case CELCIUS_INPUT_CHANGED: {
      const { fahrenheitValue } = state;
      const celciusValue = action.payload;
      return {
        celciusValue,
        fahrenheitValue: convertCelsiusToFahrenheit(celciusValue)
      };
    }
    case FAHRENHEIT_INPUT_CHANGED: {
      const { celciusValue } = state;
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

// Define which props are "controllable"

const controlledProps = ["celciusValue", "fahrenheitValue"];

class TemperatureConverter extends React.Component {
  render() {
    return (
      <ControllableReducerProvider
        reducer={reducer}
        controlledProps={controlledProps}
        initialState={this.props.initialState}
        celciusValue={this.props.celciusValue}
        fahrenheitValue={this.props.fahrenheitValue}
      >
        {({
          dispatch,
          celciusValue,
          defaultCelciusValue,
          fahrenheitValue,
          defaultFahrenheitValue
        }) => (
          <Container>
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
