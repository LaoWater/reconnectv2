// src/components/GraphUI.js

import React from 'react';
import styled from 'styled-components';
import GraphRenderer from './GraphRenderer';

// Styled components
export const GraphContainer = styled.div`
  text-align: center;
  margin: 25px;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const Controls = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  button {
    margin: 5px;
    padding: 10px 20px;
    background-color: ${(props) => props.bgcolor || '#4CAF50'};
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    transition: background-color 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: ${(props) => props.hovercolor || '#45a049'};
    }

    &:focus {
      outline: none;
    }
  }
`;

export const SpeedControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5px;

  button {
    margin: 2px;
    padding: 5px 10px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 3px;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
    cursor: pointer;

    &:hover {
      background-color: #1976D2;
    }

    &:focus {
      outline: none;
    }
  }
`;

export const FullnessDisplay = styled.div`
  margin-top: 20px;
  font-size: 1.2rem;
`;

export const SpeedDisplay = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 1rem;
  font-weight: bold;
  color: #555;
  text-align: right;
`;

export const RealTimeInfo = styled.div`
  font-size: 0.9rem;
  font-weight: normal;
  color: #777;
  margin-top: 4px;
`;

// Styled components (Add a new DayDisplay component)
export const DayDisplay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 20px;
  font-size: 1rem;
  font-weight: bold;
  color: #555;
`;

// Helper function to get the day count based on simulation time
const getDayCount = (time) => Math.ceil(time / 24);

// Helper function to generate real-time info based on speedMultiplier
const getRealTimeInfo = (speedMultiplier) => {
  const simulatedHoursPerSecond = (3600 / speedMultiplier).toFixed(2);
  return `(1 Real second = ${simulatedHoursPerSecond} Simulation Hours)`;
};


const getSimulationSpeedText = (speedMultiplier) => {
  const default_multiplier = 3600
  const realityMultiplier = default_multiplier * (default_multiplier / speedMultiplier);
  return `Simulation Speed: ${realityMultiplier}x Reality`;
};



// Separate UI component to use in the main component
export const GraphUI = ({ svgRef, fullness, handleEat, handleReset, isPaused, handlePauseResume, data, time, archetype, speedMultiplier, adjustSpeed }) => (
  <GraphContainer>
    <h2 style={{ textAlign: 'left', marginLeft: '20px' }}>{archetype} Simulation</h2>

    {/* Simulation Speed Display */}
    <SpeedDisplay>
      {getSimulationSpeedText(speedMultiplier)}
      <RealTimeInfo>{getRealTimeInfo(speedMultiplier)}</RealTimeInfo>
      <SpeedControls>
        <button onClick={() => adjustSpeed(10)}>-10x</button>
        <button onClick={() => adjustSpeed(2)}>-2x</button>
        <button onClick={() => adjustSpeed(0.5)}>2x</button>
        <button onClick={() => adjustSpeed(0.1)}>10x</button>
      </SpeedControls>
    </SpeedDisplay>

    <svg ref={svgRef} width="100%" style={{ display: 'block', maxWidth: '800px', height: 'auto', margin: '0 auto', background: '#f0f0f0', borderRadius: '10px' }}></svg>

    {/* Meal and Control Buttons */}
    <Controls>
      <button onClick={() => handleEat(0.1)} bgcolor="#2196F3" hovercolor="#1976D2">Small Meal (+0.1)</button>
      <button onClick={() => handleEat(0.3)} bgcolor="#FF5722" hovercolor="#E64A19">Medium Meal (+0.3)</button>
      <button onClick={() => handleEat(0.7)} bgcolor="#FF5722" hovercolor="#E64A19">Big Meal (+0.7)</button>
      <button onClick={() => handleEat(1.0)} bgcolor="#FF5722" hovercolor="#E64A19">Absolute max Limit Meal (+1.0)</button>
      <button onClick={handlePauseResume} bgcolor="#9E9E9E" hovercolor="#757575">
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button onClick={handleReset} bgcolor="#f44336" hovercolor="#d32f2f">Reset</button>
    </Controls>

    {/* Fullness Display */}
    <FullnessDisplay>
      <strong>Current Fullness:</strong> {(fullness * 100).toFixed(1)}%
    </FullnessDisplay>

      {/* Day Display */}
    <DayDisplay>
        Day {getDayCount(time)}
    </DayDisplay>

    {/* Graph Renderer */}
    <GraphRenderer svgRef={svgRef} data={data} time={time} />
  </GraphContainer>
);

export default GraphUI;
