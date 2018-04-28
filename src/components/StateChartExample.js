import React, { Component } from "react";
import styled from "styled-components";
import StatechartProvider from "../providers/StatechartProvider";
import { chart, logic } from "../charts/ToggleSwitchChart";

const initialState = {
  count: 22
};

const makeHandler = send => (command, payload) => () => send(command)(payload);

const Toggle = props => (
  <StatechartProvider chart={chart} logic={logic} initialState={initialState}>
    {({ send, count, machineState }) => {
      return (
        <div>
          <button onClick={makeHandler(send)("toggle", { amount: 5 })}>
            inc
          </button>
          {count}
          {machineState.value}
        </div>
      );
    }}
  </StatechartProvider>
);

export default Toggle;
