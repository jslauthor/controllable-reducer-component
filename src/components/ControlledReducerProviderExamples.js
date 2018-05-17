import React from "react";
import styled from "styled-components";
import SyntaxHighlighter, {
  registerLanguage
} from "react-syntax-highlighter/prism-light";
import jsx from "react-syntax-highlighter/languages/prism/jsx";
import prism from "react-syntax-highlighter/styles/prism/prism";
import { makeHandler } from "../utils/StatechartUtils";
import { titleCase } from "../utils/StringUtils";
import StatechartProvider from "../providers/StatechartProvider";
import {
  chart,
  logic,
  stateObj
} from "../charts/ControlledReducerExampleChart";
import TemperatureConverter from "./TemperatureConverter";
import SimpleValueComponent from "./SimpleValueComponent";

import autonomousTxt from "../data/autonomous.txt";
import fullyTxt from "../data/fully.txt";
import partialTxt from "../data/partial.txt";
import controlTxt from "../data/control.txt";
import defaultTxt from "../data/default.txt";
import defaultErrorTxt from "../data/default_error.txt";
import missingHandlerTxt from "../data/missing.txt";

import temperatureConverterRaw from "../data/temperature_converter.txt";
import simpleValueComponentRaw from "../data/simple_value.txt";

registerLanguage("jsx", jsx);

const {
  AUTONOMOUS,
  FULLY_CONTROLLED,
  PARTIALLY_CONTROLLED,
  DEFAULT_VALUE,
  DEFAULT_VALUE_ERROR,
  MISSING_HANDLER_ERROR,
  CONTROL_REVERT_ERROR,
  SIMPLE_VALUE
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
  width: 100%;

  h6 {
    margin: 0;
    padding: 0;
    color: #888;
    font-style: italic;
  }

  a {
    font-size: 12px;
    text-decoration: none;
    color: #333;
  }

  a: hover {
    color: #888;
  }
`;

const NavigationSection = styled(FlexColumn)`
  background-color: #eee;
  padding: 5px;
  width: 200px;
`;

const ExampleContainer = styled(FlexColumn)`
  padding: 10px;
  max-width: 800px;
  width: 100%;
`;

const CodeContainer = styled(FlexColumn)`
  width: 100%;
  border-left: 2px solid grey;
  padding: 0px 10px;
  background-color: #AAA;
  color: white;
`;

const ConsoleContainer = styled(FlexColumn)`
  border: 1px solid grey;
  min-height: 200px;
  color: red;
  padding: 5px;
`
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
      <SyntaxHighlighter language="javascript" style={prism}>
        {codeSample}
      </SyntaxHighlighter>
      <h4>Live Example</h4>
      {exampleComponent}
      <h4>Console Output</h4>
      <ConsoleContainer id="__debug_output"></ConsoleContainer>
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

const getCodeSampleForState = state => {
  let codeSample =
    state === SIMPLE_VALUE ? simpleValueComponentRaw : temperatureConverterRaw;
  return (
    <CodeContainer>
      <h3>{state === SIMPLE_VALUE ? 'Simple Value Component Code (used to the left)' : 'Temperature Converter Code (used to the left)'}</h3>
      <SyntaxHighlighter language="javascript" style={prism}>
        {codeSample}
      </SyntaxHighlighter>
    </CodeContainer>
  );
};

const getComponentForState = state => {
  switch (state) {
    case AUTONOMOUS:
      return (
        <ExampleTemplate
          title="Autonomous (Just Works™) TemperatureConverter Example"
          exampleComponent={<TemperatureConverter key="autonomous" />}
          codeSample={autonomousTxt}
        />
      );
    case FULLY_CONTROLLED:
      return (
        <ExampleTemplate
          title="Fully Controlled TemperatureConverter Example"
          exampleComponent={<FullyControlledTemperatureConverter />}
          codeSample={fullyTxt}
        />
      );
    case PARTIALLY_CONTROLLED:
      return (
        <ExampleTemplate
          title="Partially Controlled TemperatureConverter Example"
          exampleComponent={<PartiallyControlledTemperatureConverter />}
          codeSample={partialTxt}
        />
      );
    case CONTROL_REVERT_ERROR:
      return (
        <ExampleTemplate
          title="Control Revert Error TemperatureConverter Example"
          exampleComponent={<ControlRevertTemperatureConverter />}
          codeSample={controlTxt}
        />
      );
    case DEFAULT_VALUE:
      return (
        <ExampleTemplate
          title="Default Value TemperatureConverter Example"
          exampleComponent={
            <TemperatureConverter
              key="defaultValue"
              defaultCelciusValue={55}
              defaultFahrenheitValue={131}
            />
          }
          codeSample={defaultTxt}
        />
      );
    case DEFAULT_VALUE_ERROR:
      return (
        <ExampleTemplate
          title="Default Value Error TemperatureConverter Example"
          exampleComponent={
            <TemperatureConverter
              key="defaultValueError"
              celciusValue={200}
              defaultCelciusValue={55}
              onCelciusValueChange={() => {}}
            />
          }
          codeSample={defaultErrorTxt}
        />
      );
    case MISSING_HANDLER_ERROR:
      return (
        <ExampleTemplate
          title="Missing Handler Error TemperatureConverter Example"
          exampleComponent={
            <TemperatureConverter
              key="missingHandlerError"
              celciusValue={55}
              fahrenheitValue={200}
            />
          }
          codeSample={missingHandlerTxt}
        />
      );
    case SIMPLE_VALUE:
      return (
        <ExampleTemplate
          title="Simple Value Input Example"
          description={`This component encapsulates all state within a single value prop
      `}
          exampleComponent={<SimpleValueComponent />}
          codeSample={`<SimpleValueComponent />`}
        />
      );
    default:
      return null;
  }
};

const titleize = str =>
  str
    .split("_")
    .map(titleCase)
    .join(" ");

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
            <h5>Code Samples</h5>
            <a
              href="/src/providers/ControllableReducerProvider.html"
              target="_blank"
            >
              ControllableReducerProvider
            </a>
            <a href="/src/components/TemperatureConverter.html" target="_blank">
              TemperatureConverter
            </a>
            <a href="/src/components/SimpleValueComponent.html" target="_blank">
              SimpleValueComponent
            </a>
            {/* 
              // Simple Button Bar to select the varying states of the TemperatureConverter 
            */}
            <h5>TemperatureConverter Examples</h5>
            {[
              AUTONOMOUS,
              FULLY_CONTROLLED,
              PARTIALLY_CONTROLLED,
              DEFAULT_VALUE,
              DEFAULT_VALUE_ERROR,
              MISSING_HANDLER_ERROR,
              CONTROL_REVERT_ERROR
            ].map(key => (
              <StyledButton
                key={key}
                selected={machineState.value === key}
                onClick={makeHandler(send)(key)}
              >
                {titleize(key)}
              </StyledButton>
            ))}
            <h5>SimpleValueComponent Examples</h5>
            {[SIMPLE_VALUE].map(key => (
              <StyledButton
                key={key}
                selected={machineState.value === key}
                onClick={makeHandler(send)(key)}
              >
                {titleize(key)}
              </StyledButton>
            ))}
          </NavigationSection>
          {/* 
            // Get preconfigured TemperatureConverter based on state
          */}
          {getComponentForState(machineState.value)}
          {getCodeSampleForState(machineState.value)}
        </TemperatureConverterContainer>
      );
    }}
  </StatechartProvider>
);

export default ControlledReducerExampleContainer;
