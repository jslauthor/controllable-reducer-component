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
  CONTROLLED,
  DEFAULT_VALUE,
  DEFAULT_VALUE_ERROR,
  MISSING_HANDLER_ERROR
} = stateObj;

const getComponentForState = state => {
  switch (state) {
    case AUTONOMOUS:
      return <TemperatureConverter />;
  }
};

/**
 * We'll use David K's xstate library to control the visual states
 * Expect a future RFC detailing this 🙋
 */

const ControlledReducerExampleContainer = props => (
  <StatechartProvider
    chart={chart}
    logic={logic}
    onMachineChange={logMachineChange}
  >
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
            <button onClick={makeHandler(send)(CONTROLLED)}>
              {CONTROLLED}
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
