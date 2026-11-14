// src/components/AddArchetypeModal.js

import React, { useState, useEffect  } from 'react';
import styled from 'styled-components';


const ModalBackground = styled.div`
  position: fixed;
  inset: 0; /* covers the viewport */
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 100%;
  max-height: calc(100vh - 32px);
  overflow-y: auto; /* long form scrolls inside the dialog */
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 15px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
`;

const HalfWidthInput = styled(Input)`
  width: 48%;
`;

const Slider = styled.input`
  width: 100%;
  margin-bottom: 5px;
  height: 8px;
  border-radius: 5px;
  appearance: none;
  background: linear-gradient(
    to right,
    #2196F3 ${(props) => props.value * 100}%,
    #ddd ${(props) => props.value * 100}%
  );

    /* Ensure touch responsiveness */
  touch-action: pan-x pan-y; 
  -webkit-appearance: none; /* WebKit fix */
  -moz-appearance: none; /* Firefox fix */


  &::-webkit-slider-thumb {
    appearance: none;
    width: 15px;
    height: 15px;
    background: #2196F3; /* Changed to blue */
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-webkit-slider-runnable-track {
    background: transparent;
  }
`;

const Button = styled.button`
  margin-top: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: block;
  width: 100%;
  text-align: center;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  color: white;
`;

const LoadingContent = styled.div`
  text-align: center;
  font-size: 1.2rem;
  line-height: 2;
`;

const LoadingImage = styled.div`
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.5;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.5;
    }
  }
`;

const AddArchetypeModal = ({ isOpen, onClose, onSave }) => {
  const [newArchetype, setNewArchetype] = useState({
    name: '',
    startEatingHour: 6,
    stopEatingHour: 22,
    mealInterval: 2,
    mealDistribution: [0.25, 0.25, 0.25, 0.25],
    fullSedentarismStartHour: 0,
    fullSedentarismEndHour: 23,
  });
  const [isLoading, setIsLoading] = useState(false);


  const handleInputChange = (field, value) => {
    setNewArchetype((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProbabilityChange = (index, value) => {
    const newDistribution = [...newArchetype.mealDistribution];
    newDistribution[index] = parseFloat(value);
    setNewArchetype((prev) => ({
      ...prev,
      mealDistribution: newDistribution,
    }));
  };

  const normalizeProbabilities = () => {
    const total = newArchetype.mealDistribution.reduce((acc, val) => acc + val, 0);
    if (total === 0) return;

    const normalizedDistribution = newArchetype.mealDistribution.map((val) => val / total);
    setNewArchetype((prev) => ({
      ...prev,
      mealDistribution: normalizedDistribution,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    onSave(newArchetype);
    setIsLoading(false);
    onClose();
  };
  // Allow closing Modal with Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose(); // Trigger onClose when Esc key is pressed
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;


  return (
    
    <ModalBackground>
      {isLoading && (
        <LoadingOverlay>
          <LoadingImage />
          <LoadingContent>
            <p>Generating...</p>
            <p>Calculating Food blueprints...</p>
            <p>Calculating Digestion rate...</p>
            <p>Integrating with circadian rhythm...</p>
          </LoadingContent>
        </LoadingOverlay>
      )}
      <ModalContent>
        <h3>Add New Archetype</h3>
        <Label>Archetype Name:</Label>
        <Input
          type="text"
          value={newArchetype.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter Archetype Name"
        />

        <Label>Eating Hours:</Label>
        <Row>
          <HalfWidthInput
            type="number"
            value={newArchetype.startEatingHour}
            onChange={(e) => handleInputChange('startEatingHour', parseInt(e.target.value))}
            min="0"
            max="23"
            placeholder="Start Hour"
          />
          <HalfWidthInput
            type="number"
            value={newArchetype.stopEatingHour}
            onChange={(e) => handleInputChange('stopEatingHour', parseInt(e.target.value))}
            min="0"
            max="23"
            placeholder="Stop Hour"
          />
        </Row>

        <Label>Meal Interval:</Label>
        <Input
          type="number"
          value={newArchetype.mealInterval}
          onChange={(e) => handleInputChange('mealInterval', parseFloat(e.target.value))}
          min="0.5"
          step="0.5"
        />

        <Label>
          Full Sedentarism Hours:
          <br />
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            *Define the time range during which the individual gruadually becomes fully sedentary.
          </span>
        </Label>
        <Row>
          <HalfWidthInput
            type="number"
            value={newArchetype.fullSedentarismStartHour}
            onChange={(e) => handleInputChange('fullSedentarismStartHour', parseInt(e.target.value))}
            min="0"
            max="23"
            placeholder="Start Hour"
          />
          <HalfWidthInput
            type="number"
            value={newArchetype.fullSedentarismEndHour}
            onChange={(e) => handleInputChange('fullSedentarismEndHour', parseInt(e.target.value))}
            min="0"
            max="23"
            placeholder="End Hour"
          />
        </Row>

        <Label>
          Meal Distribution Probabilities:
          <br />
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            *The probability of a specific meal quantity<br />
            Probabilities must sum to 1. Use Equalize & Normalize to balance distribution.
          </span>
        </Label>

        {['Small Meal', 'Medium Meal', 'Big Meal', 'Absolute Max Meal'].map((label, index) => (
          <div key={index}>
            <Label>
              {label} ({(newArchetype.mealDistribution[index] * 100).toFixed(0)}%)
            </Label>
            <Slider
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={newArchetype.mealDistribution[index]}
              onChange={(e) => handleProbabilityChange(index, e.target.value)}
            />
          </div>
        ))}

        <Button onClick={normalizeProbabilities}>Equalize & Normalize Probabilities</Button>
        <Button onClick={handleSubmit}>Save Archetype</Button>
        <Button onClick={onClose} style={{ backgroundColor: '#f44336' }}>
          Cancel
        </Button>
      </ModalContent>
    </ModalBackground>
  );
};

export default AddArchetypeModal;
