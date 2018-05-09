import React from "react";
import styled from "styled-components";
import SyntaxHighlighter, {
  registerLanguage
} from "react-syntax-highlighter/prism-light";
import jsx from "react-syntax-highlighter/languages/prism/jsx";
import prism from "react-syntax-highlighter/styles/prism/prism";
import { makeHandler } from "../utils/StatechartUtils";
import StatechartProvider from "../providers/StatechartProvider";
import {
  chart,
  logic,
  stateObj,
  states
} from "../charts/ControlledReducerExampleChart";
import TemperatureConverter from "./TemperatureConverter";

registerLanguage("jsx", jsx);

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

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const TemperatureConverterContainer = styled(FlexRow)`
  height: 100%;
  width; 100%;
  max-width: 800px;

  h6 {
    margin: 0;
    padding: 0;
    color: #888;
    font-style: italic;
  }
`;

const NavigationSection = styled(FlexColumn)`
  background-color: #eee;
  padding: 5px;
  width: 200px;
`;

const ExampleContainer = styled(FlexColumn)`
  padding: 10px;
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

const ExampleTemplate = ({
  title,
  description,
  exampleComponent,
  codeSample
}) => {
  return (
    <ExampleContainer>
      <h6>* Please open your development console to see warnings</h6>
      <h3>{title}</h3>
      <div>{description}</div>
      {exampleComponent}
      <h4>Code Sample</h4>
      <SyntaxHighlighter language="javascript" style={prism}>
        {codeSample}
      </SyntaxHighlighter>
    </ExampleContainer>
  );
};
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
    setTimeout(() => this.setState({ celciusValue: undefined }), 500);
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
      return (
        <ExampleTemplate
          title="Autonomous"
          description={`This is an autonomous component and can operate without any incoming
          props. It is "uncontrolled". The state is managed within the
          familiar reducer pattern inside TemperatureConverter. A parent can
          override a specificied set of props as demonstrated in the following
          examples.`}
          exampleComponent={<TemperatureConverter key="autonomous" />}
          codeSample={`<TemperatureConverter />`}
        />
      );
    case FULLY_CONTROLLED:
      return (
        <ExampleTemplate
          title="Fully Controlled"
          description={`This is fully controlled component. The parent manages all its state via props and change handlers.
          This example simply returns the value of each onChange event for TemperatureConverter. 
          ControllableReducerProvider takes a set of keys that it will reconcile with the reducer state, e.g. 
          ["celciusValue", "fahrenheitValue"] for this component. If either of those values are provided, will also
          expect a change handler in the form of onPropNameChange, like onCelciusValueChange below.`}
          exampleComponent={<FullyControlledTemperatureConverter />}
          codeSample={`class FullyControlledTemperatureConverter extends React.Component {
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
}`}
        />
      );
    case PARTIALLY_CONTROLLED:
      return (
        <ExampleTemplate
          title="Partially Controlled"
          description={`
            This is partially controlled component. The parent manages only the celcius value.
            Please notice how the component still updates the fahrenheit value when celcius changes, 
            but when the fahrenheit value changes, celcius remains unchanged since it is "controlled."
          `}
          exampleComponent={<PartiallyControlledTemperatureConverter />}
          codeSample={`class PartiallyControlledTemperatureConverter extends React.Component {
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
}`}
        />
      );
    case CONTROL_REVERT_ERROR:
      return (
        <ExampleTemplate
          title="Control Revert Error"
          description={`
          NOTE: Please open your console to see the warning. This component relinquishes control 
          of a previously controlled value. The React <input /> control disallows this, and we shall
          consider it an anti-pattern here as well. Once a component supplies a controlled prop, it must always
          supply a value for the prop.  
        `}
          exampleComponent={<ControlRevertTemperatureConverter />}
          codeSample={`class ControlRevertTemperatureConverter extends React.Component {
  state = {
    celciusValue: 55
  };

  constructor(props) {
    super(props);
    setTimeout(() => this.setState({ celciusValue: undefined }), 500);
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
}`}
        />
      );
    case DEFAULT_VALUE:
      return (
        <ExampleTemplate
          title="Default Value"
          description={`
            If a component is uncontrolled, but the user wishes to supply a defaultValue, simply
            supply a defaultPropName for those values. A controlled component will throw a console error
            if a default value is also supplied. This behaves the same as the React <input />.
          `}
          exampleComponent={
            <TemperatureConverter
              key="defaultValue"
              defaultCelciusValue={55}
              defaultFahrenheitValue={131}
            />
          }
          codeSample={`<TemperatureConverter
  defaultCelciusValue={55}
  defaultFahrenheitValue={131} 
/>`}
        />
      );
    case DEFAULT_VALUE_ERROR:
      return (
        <ExampleTemplate
          title="Default Value Error"
          description={`
        NOTE: Please open your console to see the warning. 
        If a parent component supplies a default value and a controlled value or handler, it will
        display a console error.
        `}
          exampleComponent={
            <TemperatureConverter
              key="defaultValueError"
              celciusValue={200}
              defaultCelciusValue={55}
              onCelciusValueChange={() => {}}
            />
          }
          codeSample={`<TemperatureConverter
  // has celciusValue and defaultCelciusValue 😱
  celciusValue={200}
  defaultCelciusValue={55}
  onCelciusValueChange={someHandler}
/>`}
        />
      );
    case MISSING_HANDLER_ERROR:
    return (
      <ExampleTemplate
        title="Missing Handler Error"
        description={`
      NOTE: Please open your console to see the warning. 
      If a parent component supplies a controlled value without its matching handler, it will
      display a console error.
      `}
        exampleComponent={
          <TemperatureConverter
          key="missingHandlerError"
          celciusValue={55}
          fahrenheitValue={200}
        />
        }
        codeSample={`<TemperatureConverter
  celciusValue={55}
  fahrenheitValue={200}
  // missing onCelciusValueChange and onFahrenheightValueChange
/>`}
      />
    );    
    default:
      return null;
  }
};

// We'll use David K's xstate library to control the visual states
// Expect a future RFC that details this 🙋

const ControlledReducerExampleContainer = props => (
  <StatechartProvider chart={chart} logic={logic}>
    {({ send, machineState }) => {
      return (
        <TemperatureConverterContainer>
          <NavigationSection>
            {/* 
              // Simple Button Bar to select the varying states of the TemperatureConverter 
            */}
            <h5>ControlledReducerProvider Examples</h5>
            {states.map(key => (
              <StyledButton
                key={key}
                selected={machineState.value === key}
                onClick={makeHandler(send)(key)}
              >
                {key}
              </StyledButton>
            ))}
          </NavigationSection>
          {/* 
            // Get preconfigured TemperatureConverter based on state
          */}
          {getComponentForState(machineState.value)}
        </TemperatureConverterContainer>
      );
    }}
  </StatechartProvider>
);

export default ControlledReducerExampleContainer;
