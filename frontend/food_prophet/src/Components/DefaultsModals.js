import React from 'react';
import Modal from 'react-modal'; // Import if needed
import { archetypeConfig } from './ArchetypeSimulator';
import {
    ArchetypeItem,
    ArchetypeList,
    ModalContent,
  } from '../styles/ButtonStyles';

const DefaultsModal = ({ isOpen, onClose, onSelect }) => {
  const archetypes = Object.keys(archetypeConfig).map(key => archetypeConfig[key]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          backgroundColor: 'white',
        },
      }}
    >
      <ModalContent>
        <h2>Default Archetypes</h2>
        <p style={{ color: 'black' }}>Select a default archetype to pre-fill the simulator:</p>
        <ArchetypeList>
          {archetypes.map((archetype) => (
            <ArchetypeItem
              key={archetype.name}
              onClick={() => {
                onSelect(archetype);
                onClose();
              }}
            style={{ color: 'black' }}>
              {archetype.name}
            </ArchetypeItem>
          ))}
        </ArchetypeList>
        <button onClick={onClose}>Close</button>
      </ModalContent>
    </Modal>
  );
};


export default DefaultsModal;
