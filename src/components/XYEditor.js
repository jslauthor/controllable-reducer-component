import React from "react";
import styled from "styled-components";
import StateProvider, {
  makeControllableReducer
} from "../providers/StateProvider";

const XYContainer = styled.div`
  width: 250px;
  display: grid;
  grid-template-columns: 20px 1fr 50px;
  grid-gap: 8;
`;

// Actions

const actions = dispatch => ({
  toggleLocked: () => {
    dispatch({ type: "TOGGLE_LOCKED" });
  },
  handleXChange: e => {
    dispatch({
      type: "X_CHANGED",
      payload: parseInt(e.currentTarget.value, 10)
    });
  },
  handleYChange: e => {
    dispatch({
      type: "Y_CHANGED",
      payload: parseInt(e.currentTarget.value, 10)
    });
  }
});

// Reducer

const reducer = (state = {}, action) => {
  switch (action.type) {
    case "X_CHANGED": {
      return {
        ...state,
        x: action.payload,
        ...(state.locked
          ? {
              y: action.payload
            }
          : null)
      };
    }
    case "Y_CHANGED": {
      return {
        ...state,
        y: action.payload,
        ...(state.locked
          ? {
              x: action.payload
            }
          : null)
      };
    }
    case "TOGGLE_LOCKED": {
      const locked = !state.locked;
      return {
        ...state,
        locked,
        ...(locked ? { y: state.x } : null)
      };
    }
    case "INIT":
    default: {
      // Handles the INIT/PROPS_UPDATED actions, ensuring
      // that we lock our Y value if needed:
      return { ...state, ...(state.locked ? { y: state.x } : null) };
    }
  }
};
//TODO: Need a children override example

const defaultEditor = ({
  x,
  y,
  min,
  max,
  locked,
  toggleLocked,
  handleXChange,
  handleYChange
}) => (
  <XYContainer>
    <label>X</label>
    <input
      type="range"
      value={x}
      min={min}
      max={max}
      onChange={handleXChange}
    />
    <input value={x} onChange={handleXChange} />

    <label>Y</label>
    <input
      type="range"
      value={y}
      min={min}
      max={max}
      onChange={handleYChange}
    />
    <input value={y} onChange={handleYChange} />
    <div />
    <div />
    <button
      style={{
        fontSize: 20,
        padding: 0,
        border: 0,
        outline: 0,
        cursor: "pointer"
      }}
      onClick={toggleLocked}
    >
      {locked ? "🔒" : "🔓"}
    </button>
  </XYContainer>
);

const XYEditor = props => (
  <StateProvider
    reducer={makeControllableReducer(["x", "y", "locked"])(reducer)}
    mapDispatchToActions={actions}
    defaultChildren={defaultEditor}
    {...props}
  />
);

export default XYEditor;
