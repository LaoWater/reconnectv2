// src/styles/HeaderStyles.js
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Header = styled.header`
  background-color: rgba(51, 51, 51, 0.2); /* Semi-transparent dark grey background */
  color: white; /* White text */
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  font-family: sans-serif; /* Clean font */

  @media (max-width: 768px) {
    flex-direction: row; /* Stack items vertically */
    align-items: center;
    text-align: center; /* Center-align text for mobile */
    padding: 15px; /* Reduce padding for smaller screens */
  }
`;

export const Logo = styled.div`
  font-family: 'Pacifico', cursive; /* Handwriting-like font */
  font-size: 1.8rem;
  color: white; /* White text */
  margin-left: 10px;

  @media (max-width: 768px) {
    font-size: 1.5rem; /* Smaller font size for mobile */
    margin: 0; /* Remove margin for centering */
  }
`;

export const NavLinks = styled.div`
  display: flex;
  justify-content: center; /* Center-align the links */
  align-items: center;
  gap: 40px; /* Space between links */
  width: 100%; /* Take full width to align properly */
  margin-right: 300px;

  @media (max-width: 768px) {
    flex-direction: column; /* Stack links vertically on smaller screens */
    width: auto; /* Adjust width for stacking */
    gap: 20px; /* Smaller gap for mobile */
    margin-top: 15px; /* Add spacing above for mobile */
    margin-right: 0; /* Remove right margin for centering */
  }
`;

export const NavLink = styled(Link)`
  color: white; /* White text */
  text-decoration: none;
  font-size: 1.3rem; /* Slightly larger font */
  font-family: 'Pacifico', cursive;
  font-weight: 600; /* Bold text */
  padding: 8px 12px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4caf50; /* Green hover */
    color: white; /* Keep text white on hover */
  }

  @media (max-width: 768px) {
    font-size: 1.1rem; /* Slightly smaller font for mobile */
    padding: 6px 10px; /* Reduce padding for smaller screens */
  }
`;
