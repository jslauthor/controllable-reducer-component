import React from "react";
import styled from "styled-components";
import { makeHandler } from "../utils/StatechartUtils";
import StatechartProvider from "../providers/StatechartProvider";
import {
  chart,
  logic,
  stateObj,
  states
} from "../charts/ControlledReducerExampleChart";
import TemperatureConverter from "./TemperatureConverter";

const {
  AUTONOMOUS,
  FULLY_CONTROLLED,
  PARTIALLY_CONTROLLED,
  DEFAULT_VALUE,
  DEFAULT_VALUE_ERROR,
  MISSING_HANDLER_ERROR,
  CONTROL_REVERT_ERROR
} = stateObj;

const StyledButton = styled.span`
  background-color: ${({ selected }) => (selected ? "#444" : "#AAA")};
  color: ${({ selected }) => (selected ? "#FFF" : "#000")};
  padding: 5px;
  margin: 1px;
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  font-size: 10px;
`;

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

class ControlRevertTemperatureConverter extends React.Component {
  state = {
    celciusValue: 55
  };

  constructor(props) {
    super(props);
    setTimeout(() => this.setState({celciusValue: undefined}), 500);
  }

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
    case CONTROL_REVERT_ERROR: 
      return <ControlRevertTemperatureConverter />; 
    case DEFAULT_VALUE:
      return (
        <TemperatureConverter
          defaultCelciusValue={55}
          defaultFahrenheitValue={131}
        />
      );
    case DEFAULT_VALUE_ERROR:
      return (
        <TemperatureConverter celciusValue={200} defaultCelciusValue={55} />
      );
    case MISSING_HANDLER_ERROR:
      return <TemperatureConverter celciusValue={55} fahrenheitValue={200} />;
  }
};

// We'll use David K's xstate library to control the visual states
// Expect a future RFC that details this 🙋

const ControlledReducerExampleContainer = props => (
  <StatechartProvider chart={chart} logic={logic}>
    {({ send, machineState }) => {
      return (
        <div>
          <div>
            {/* 
              // Simple Button Bar to select the varying states of the TemperatureConverter 
            */}
            {states.map(key => (
              <StyledButton
                key={key}
                selected={machineState.value === key}
                onClick={makeHandler(send)(key)}
              >
                {key}
              </StyledButton>
            ))}
          </div>
          {/* 
            // Get preconfigured TemperatureConverter based on state
          */}
          {getComponentForState(machineState.value)}
        </div>
      );
    }}
  </StatechartProvider>
);

export default ControlledReducerExampleContainer;
