// src/styles/ButtonStyles.js
import styled from 'styled-components';

export const AddButton = styled.button`
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
    background-color: #1976D2;
  }
`;


export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #ff5c5c;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    color: #ff0000;
  }

  
    /* Responsive styling for mobile */
  @media (max-width: 768px) {
  font-size: 2.55rem;
  }
`;


export const ClearButton = styled.button`
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: firebrick;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transitions */

  &:hover {
    transform: scale(1.05);
    background-color: #c82333; /* Darker red on hover */
  }

  &:active {
    transform: scale(0.95); /* Slightly smaller on click */
    background-color: #bd2130; /* Even darker red on active */
  }

  &:focus {
    outline: none; /* Remove default focus outline */
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.5); /* Add a subtle red focus ring */
  }
`;



// Defaults Button

export const ArchetypeList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

export const ArchetypeItem = styled.li`
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 5px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

// Styled Components (moved outside the App component)
export const ModalContent = styled.div`
  padding: 20px;
`;


export const ButtonContainer = styled.div`

    
  display: inline-flex; /* Enable flexbox */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  justify-content: center; /* Center the buttons horizontally */
  gap: 3rem;; /* Add some spacing between the buttons */
  margin-bottom: 0px;

    /* Responsive styling for mobile */
  @media (max-width: 768px) {
  font-size: 2.55rem;
  
  display: flex; /* Enable flexbox */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  justify-content: center; /* Center the buttons horizontally */
  gap: 0px; /* Add some spacing between the buttons */
  margin-bottom: 0px;
  margin-left: 3.5rem;

}
`;