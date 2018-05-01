import React, { Component } from "react";
import styled from "styled-components";
import StatechartProvider from "../providers/StatechartProvider";
import { chart, logic } from "../charts/ToggleSwitchChart";

const initialChartState = {
  count: 1
};

const makeHandler = send => (command, payload) => () => send(command)(payload);
let outerSend;

const Toggle = props => (
  <div>
    <StatechartProvider
      chart={chart}
      logic={logic}
      initialChartState={initialChartState}
      onMachineChange={state => console.log("HIIII!", state)}
    >
      {({ send, count, machineState }) => {
        outerSend = send;
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
    {/* 
      This seems like a really bad idea but is one way we can "control" the chart
      from the outside 
    */}
    <button onClick={() => outerSend("toggle")({ amount: 5 })}>Outer</button>
  </div>
);

export default Toggle;
