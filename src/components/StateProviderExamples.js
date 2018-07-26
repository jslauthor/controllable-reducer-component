import React from "react";
import styled from "styled-components";
import XYEditor from '../components/XYEditor';

const ExampleContainer = styled.div`
  div { margin-bottom: 20px; }
`;

class PartiallyControlledXYEditor extends React.Component {

  state = {
    x: 1,
  };

  onStateChange = ({ x }) => {
    this.setState({ x });
  };

  render() {
    return (
      <XYEditor onStateChange={this.onStateChange} x={this.state.x} />
    );
  }

}

class FullyControlledXYEditor extends React.Component {

  state = {
    x: 1,
    y: 1,
    locked: false
  };

  onStateChange = ({ x, y, locked }) => {
    this.setState({ x, y, locked });
  };

  render() {
    return (
      <XYEditor onStateChange={this.onStateChange} x={this.state.x} y={this.state.y} locked={this.state.locked} />
    );
  }

}

class StateProviderExamples extends React.Component {

  render() {
    return <ExampleContainer>
      <div>
        <h3>Uncontrolled</h3>
        <XYEditor />
      </div>
      <div>
        <h3>Partially Controlled</h3>
        <PartiallyControlledXYEditor />
      </div>
      <div>
        <h3>Fully Controlled</h3>
        <FullyControlledXYEditor />
      </div>
    </ExampleContainer>;
  }

}

export default StateProviderExamples;