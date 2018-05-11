import React from "react";
import styled from "styled-components";
import ControllableReducerProvider from "../providers/ControllableReducerProvider";

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  background: #333;
  padding: 10px;
  color: white;
  border-radius: 3px;
  max-width: 300px;
  margin-top: 10px;
  border: ${({ error }) => (error ? "1px solid red;" : "none;")}
    /** 
  * Wow prettier sucks
  */ input {
    width: 100%;
  }

  * {
    margin-right: 10px;
  }
`;

const makeHandler = dispatch => action => event => dispatch(action(event));
const getDefaultStringValue = defaultValue =>
  defaultValue ? defaultValue.stringValue : undefined;

// Actions

const INPUT_CHANGED = "INPUT_CHANGED";

const inputChanged = event => {
  return {
    type: INPUT_CHANGED,
    payload: event.currentTarget.value
  };
};

// Reducer to handle the input. Now that value is controlled, you can add anything you want to it
// For instance, we set error to true if the input contains anything other than a valid number

const reducer = (
  state = { value: { stringValue: "", error: false } },
  action
) => {
  // Could use our match (Flow) API here
  switch (action.type) {
    case "INIT": {
      const { value } = state;
      return {
        value
      };
    }
    case INPUT_CHANGED: {
      return {
        // We can check if this value is controlled or not and do what we wish
        value: {
          stringValue: action.payload,
          error: isNaN(Number(action.payload))
        }
      };
    }
    default: {
      return state;
    }
  }
};

// Create a single value to store all of the component's state

const controlledProps = ["value"];

class ControlledValueComponent extends React.Component {
  render() {
    return (
      <ControllableReducerProvider
        reducer={reducer}
        controlledProps={controlledProps}
        {...this.props}
      >
        {({ dispatch, value: { stringValue, error }, defaultValue }) => {
          return (
            <InputContainer error={error}>
              <span>Type in a numeric value</span>
              <input
                value={stringValue}
                defaultValue={getDefaultStringValue(defaultValue)}
                onChange={makeHandler(dispatch)(inputChanged)}
              />
            </InputContainer>
          );
        }}
      </ControllableReducerProvider>
    );
  }
}

export default ControlledValueComponent;
