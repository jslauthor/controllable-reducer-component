import React, { Component } from "react";
import styled from "styled-components";
import StatechartProvider from "../providers/StatechartProvider";
import { chart, logic } from "../charts/ToggleSwitchChart";

const initialState = {
  count: 0
};

const makeHandler = dispatch => (command, payload) => () =>
  dispatch(command, payload);

const Toggle = props => (
  <StatechartProvider
    machine={chart}
    commands={logic}
    initialState={initialState}
  >
    {({ dispatch, componentState }) => {
      return (
        <div>
          <button onClick={makeHandler(dispatch)("toggle", { amount: 5 })}>
            inc
          </button>
          {componentState.count}
        </div>
      );
    }}
  </StatechartProvider>
);

export default Toggle;
