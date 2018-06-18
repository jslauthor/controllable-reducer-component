import React from "react";
// import styled from "styled-components";
import XYEditor from '../components/XYEditor';


class StateProviderExamples extends React.Component {

  render() {
    return (<XYEditor onStateChange={(value) => { console.log('onStateChange', value) }} />);
  }

}

export default StateProviderExamples;