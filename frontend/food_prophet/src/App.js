// src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {
  Header,
  Logo,
  NavLinks,
  NavLink,
} from './styles/HeaderStyles';
import {
  GraphsContainer,
  GraphWrapper,
} from './styles/GraphStyles';
import {
  AddButton,
  CloseButton,
  ClearButton,
  ButtonContainer
} from './styles/ButtonStyles';
import StomachFullnessGraph from './Components/StomachFullness_Graph';
import AddArchetypeModal from './Components/AddArchetypeModal';
import DigestiveHealth from './Components/DigestiveHealth'; // Import the new component
import QuoteComponent from './Components/QuoteComponent';
import { archetypeConfig } from './Components/ArchetypeSimulator';
import InfoWithTooltip from './Components/ShortGuide';
import './styles/App.css';
import GlobalStyles from './styles/GlobalStyles';
import TopLeftDropdown from './styles/TopLeftDropdown';
import DefaultsModal from './Components/DefaultsModals';




function App() {
  const [archetypes, setArchetypes] = useState([
    archetypeConfig["ModernMan"],
    archetypeConfig["TheCentenarian"], // Append Here Archtypes added to Default Generation
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveArchetype = (newArchetype) => {
    console.log('New Archetype Data:', newArchetype);
    setArchetypes((prevArchetypes) => [...prevArchetypes, newArchetype]);
  };

  const handleRemoveArchetype = (indexToRemove) => {
    setArchetypes((prevArchetypes) =>
      prevArchetypes.filter((_, index) => index !== indexToRemove)
    );
  };


  const [isDefaultsModalOpen, setIsDefaultsModalOpen] = useState(false);

  const handleOpenDefaultsModal = () => setIsDefaultsModalOpen(true);
  const handleCloseDefaultsModal = () => setIsDefaultsModalOpen(false);

  const handleSelectDefault = (selectedArchetype) => {
    console.log('Selected default:', selectedArchetype);
    setArchetypes((prevArchetypes) => [...prevArchetypes, selectedArchetype]); // Add selected archetype to state
  };


  const handleClearAll = () => {
    setArchetypes([]); // Set archetypes state to an empty array
  };


  return (
    <Router basename="">
    <div className="AppContainer">
    <GlobalStyles />
        {/* Header with Navigation Links */}
        <Header>
          <TopLeftDropdown />
          <Logo>The Food Prophet</Logo>

          <NavLinks>
            <NavLink to="/food-prophet">Stomach Fullness Tracker</NavLink>
            <NavLink to="/digestive-health">Digestive System Health</NavLink>
         </NavLinks>
        </Header>
        
        {/* Quote Component */}
        <QuoteComponent />

        {/* Main Content */}
        <div className="ContentWrapper">
          <Routes>
            <Route
              path="/food-prophet"
              element={
                <>
                  <InfoWithTooltip />
                  <ButtonContainer> {/* Wrap buttons in a container */}
                        <AddButton onClick={handleOpenModal}>Add Archetype</AddButton>
                        <AddButton onClick={handleOpenDefaultsModal}>Defaults</AddButton>
                        <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
                    </ButtonContainer>

                  <AddArchetypeModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveArchetype}
                  />
                  <DefaultsModal // Correct placement of DefaultsModal
                    isOpen={isDefaultsModalOpen}
                    onClose={handleCloseDefaultsModal}
                    onSelect={handleSelectDefault}
                  />

                <GraphsContainer graphCount={archetypes.length}>
                    {archetypes.map((archetype, index) => (
                      <GraphWrapper key={index}>
                        <CloseButton
                          onClick={() => handleRemoveArchetype(index)}
                        >
                          &times;
                        </CloseButton>
                        <h2>Simulation #{index + 1}</h2>
                        <StomachFullnessGraph
                          archetype={
                            archetypeConfig[archetype?.name] // Step 1: Check for matching archetype configuration
                            || archetype // Step 2: Fall back to user-inputted archetype values
                            || archetypeConfig["ModernMan"] // Step 3: Fall back to "ModernMan" as default
                          }
                        />

                      </GraphWrapper>
                    ))}
                  </GraphsContainer>
                </>
              }
            />
            <Route
              path="/digestive-health"
              element={<DigestiveHealth />} // "Coming Soon" Page
            />
          </Routes>
        </div>
      </div>
    </Router>

  );
}

export default App;