// src/components/StomachFullnessGraph.js

import React, { useState, useEffect, useRef } from 'react';
import GraphUI from './GraphUI';
import { ArchetypeSimulator } from './ArchetypeSimulator'; // Ensure this path is correct
import usePageActivity from '../hooks/usePageActivity';

const StomachFullnessGraph = ({ archetype = { name: 'Modern Man' } }) => {
  const [isPaused, setIsPaused] = useState(false); // Pause state
  const [isWorkerReady, setIsWorkerReady] = useState(false); // Worker readiness
  const [fullness, setFullness] = useState(0);
  const [time, setTime] = useState(0);
  const svgRef = useRef();
  const simulatorRef = useRef(null);
  const isPageActive = usePageActivity(); // Custom hook to track page activity
  const workerRef = useRef(null);
  const [data, setData] = useState([{ time: 0, fullness: 0 }]);
  const [speedMultiplier, setSpeedMultiplier] = useState(3600); // Track current speed multiplier, default speed 3600x Reality, 1 simulation hour = 1 Real second

  // 1. Load data from localStorage on mount
  useEffect(() => {
    console.log('Component mounted. Attempting to load data from localStorage for archetype:', archetype.name);
    const storedData = localStorage.getItem(`fullnessData_${archetype.name}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      console.log('Data loaded from localStorage:', parsedData);
    } else {
      console.log('No data found in localStorage for archetype:', archetype.name);
    }
  }, [archetype]);

 // Initialize the worker
useEffect(() => {
  console.log('Initializing web worker.');
  workerRef.current = new Worker(new URL('../workers/fullnessWorker.js', import.meta.url));

  // Send archetype data to the worker
  const sendArchetypeToWorker = (archetype) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'INITIALIZE_ARCHETYPE',
        data: archetype,
      });
      console.log('Sent archetype data to worker:', archetype);
    }
  };

  // Receive updates from the worker
  workerRef.current.onmessage = (event) => {
    const { type, time: workerTime, fullness: workerFullness, data: workerData } = event.data;
    // console.log('Message received from worker:', event.data);

    switch (type) {
      case 'STORE_DATA':
        localStorage.setItem('fullnessData', JSON.stringify(workerData));
        console.log('Data stored to localStorage by worker:', workerData);
        break;
      case 'RESET_COMPLETE':
        setData([{ time: 0, fullness: 0 }]);
        setFullness(0);
        setTime(0);
        console.log('Data and state reset complete.');
        break;
      case 'UPDATE_DATA':
        setTime(workerTime);
        setFullness(workerFullness);

        setData((prevData) => {
          const newData = [...prevData, { time: workerTime, fullness: workerFullness }];
          const weeklyThreshold = 2200;

          if (newData.length > weeklyThreshold) {
            const trimmedData = newData.slice(newData.length - weeklyThreshold);
            return trimmedData;
          }

          return newData;
        });
        break;
      default:
        console.warn('Unknown message type from worker:', type);
    }

    // Set worker as ready after receiving the first data point
    if (!isWorkerReady) {
      setIsWorkerReady(true);
      console.log('Worker is ready.');
    }
  };

  // Handle worker errors
  workerRef.current.onerror = (error) => {
    console.error('Error in web worker:', error);
  };

  // Send the archetype data whenever it changes
  sendArchetypeToWorker(archetype);

  // Cleanup on component unmount
  return () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      console.log('Web worker terminated.');
    }
  };
}, [isWorkerReady, archetype]);

// Function to adjust simulation speed
const adjustSpeed = (multiplier) => {
  const newMultiplier = speedMultiplier * multiplier;
  setSpeedMultiplier(newMultiplier);

  // Send new speed multiplier to the worker
  if (workerRef.current) {
    workerRef.current.postMessage({ type: 'SET_SPEED', multiplier: newMultiplier });
  }
};


  // 3. Initialize the Archetype simulator after the worker is set up
  useEffect(() => {
    if (isWorkerReady && workerRef.current && !isPaused && archetype.name !== "Manual") { // Start only if not paused
      simulatorRef.current = new ArchetypeSimulator(workerRef.current);
      simulatorRef.current.startSimulation(archetype); // Default to ModernMan if not provided
      console.log('Archetype simulation started for:', archetype.name);

      // Set initial speed multiplier in simulator
      simulatorRef.current.setSpeedMultiplier(3600);
    }

    // Cleanup on component unmount or when paused
    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stopSimulation();
        console.log('Archetype simulation stopped.');
      }
    };
  }, [isWorkerReady, isPaused, archetype]);

  // 3.1 Initialize the Archetype simulator Speed multiplier - to control simulation speed
  useEffect(() => {
    if (simulatorRef.current && !isPaused) {
      simulatorRef.current.setSpeedMultiplier(speedMultiplier);
      console.log('Simulation speed adjusted to:', speedMultiplier);
    }
  }, [speedMultiplier, isPaused]);


  // 4. Handler to add a meal
  const handleEat = (amount) => {
    console.log(`handleEat called with amount: ${amount}`);
    if (workerRef.current && !isPaused) { // Prevent adding meals when paused
      workerRef.current.postMessage({ type: 'ADD_MEAL', amount });
      console.log('ADD_MEAL message sent to worker.');
    } else {
      console.warn('Cannot add meal. Worker is paused or not initialized.');
    }
  };

  // 5. Handler to reset the graph and worker state
  const handleReset = () => {
    console.log('handleReset called.');
    setData([{ time: 0, fullness: 0 }]);
    setFullness(0);
    setTime(0);
    localStorage.removeItem(`fullnessData_${archetype.name}`); // Clear stored data on reset
    console.log('LocalStorage cleared.');

    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' }); // Send reset message to worker
      console.log('RESET message sent to worker.');
    } else {
      console.warn('Worker is not initialized.');
    }
  };

  // 6. Handler to toggle pause/resume
  const handlePauseResume = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    if (workerRef.current) {
      if (newPausedState) {
        workerRef.current.postMessage({ type: 'PAUSE' });
        console.log('PAUSE message sent to worker.');
      } else {
        workerRef.current.postMessage({ type: 'RESUME' });
        console.log('RESUME message sent to worker.');
      }
    }
  };

  return (
    <>
      {isPageActive.current && (
        <GraphUI 
          svgRef={svgRef} 
          fullness={fullness} 
          handleEat={handleEat} 
          handleReset={handleReset} 
          isPaused={isPaused} 
          handlePauseResume={handlePauseResume} 
          data={data}
          time={time}
          archetype={archetype.name} // Pass archetype here
          speedMultiplier={speedMultiplier} // Display current speed multiplier
          adjustSpeed={adjustSpeed} // Function to adjust speed
        />
      )}
    </>
  );
};

export default StomachFullnessGraph;