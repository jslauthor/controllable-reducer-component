import React, { Component } from "react";
import styled from "styled-components";
import { makeHandler, logMachineChange } from "../utils/StatechartUtils";
import StatechartProvider from "../providers/StatechartProvider";
import {
  chart,
  logic,
  stateObj
} from "../charts/ControlledReducerExampleChart";
import TemperatureConverter from "./TemperatureConverter";

const {
  AUTONOMOUS,
  FULLY_CONTROLLED,
  PARTIALLY_CONTROLLED,
  DEFAULT_VALUE,
  DEFAULT_VALUE_ERROR,
  MISSING_HANDLER_ERROR
} = stateObj;

class FullyControlledTemperatureConverter extends React.Component {
  state = {
    celciusValue: 55,
    fahrenheitValue: 200
  };

  onCelciusChange = celcius => {
    this.setState({ celciusValue: celcius });
  };

  onFahrenheitChange = fahrenheit => {
    this.setState({ fahrenheitValue: fahrenheit });
  };

  render() {
    return (
      <TemperatureConverter
        initialState={this.state}
        celciusValue={this.state.celciusValue}
        onCelciusValueChange={this.onCelciusChange}
        fahrenheitValue={this.state.fahrenheitValue}
        onFahrenheitValueChange={this.onFahrenheitChange}
      />
    );
  }
}

class PartiallyControlledTemperatureConverter extends React.Component {
  state = {
    celciusValue: 55
  };

  onCelciusChange = celcius => {
    this.setState({ celciusValue: celcius });
  };

  render() {
    return (
      <TemperatureConverter
        initialState={this.state}
        celciusValue={this.state.celciusValue}
        onCelciusValueChange={this.onCelciusChange}
      />
    );
  }
}

const getComponentForState = state => {
  switch (state) {
    case AUTONOMOUS:
      return <TemperatureConverter />;
    case FULLY_CONTROLLED:
      return <FullyControlledTemperatureConverter />;
    case PARTIALLY_CONTROLLED:
      return <PartiallyControlledTemperatureConverter />;
    case DEFAULT_VALUE:
      return (
        <TemperatureConverter
          defaultCelciusValue={55}
          defaultFahrenheitValue={200}
        />
      );
    case MISSING_HANDLER_ERROR:
      return <TemperatureConverter celciusValue={55} fahrenheitValue={200} />;
  }
};

/**
 * We'll use David K's xstate library to control the visual states
 * Expect a future RFC that details this 🙋
 */

const ControlledReducerExampleContainer = props => (
  <StatechartProvider chart={chart} logic={logic}>
    {({ send, machineState }) => {
      return (
        <div>
          <div>
            {/* 
              Simple Button Bar to select the varying states of the TemperatureConverter 
            */}
            <button onClick={makeHandler(send)(AUTONOMOUS)}>
              {AUTONOMOUS}
            </button>
            <button onClick={makeHandler(send)(PARTIALLY_CONTROLLED)}>
              {PARTIALLY_CONTROLLED}
            </button>
            <button onClick={makeHandler(send)(FULLY_CONTROLLED)}>
              {FULLY_CONTROLLED}
            </button>
            <button onClick={makeHandler(send)(DEFAULT_VALUE)}>
              {DEFAULT_VALUE}
            </button>
            <button onClick={makeHandler(send)(DEFAULT_VALUE_ERROR)}>
              {DEFAULT_VALUE_ERROR}
            </button>
            <button onClick={makeHandler(send)(MISSING_HANDLER_ERROR)}>
              {MISSING_HANDLER_ERROR}
            </button>
          </div>
          {/* 
            Get preconfigured TemperatureConverter based on state
          */}
          {getComponentForState(machineState.value)}
        </div>
      );
    }}
  </StatechartProvider>
);

export default ControlledReducerExampleContainer;
