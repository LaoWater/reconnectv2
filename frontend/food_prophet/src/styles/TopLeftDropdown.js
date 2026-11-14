import React, { useState, useEffect  } from 'react';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa'; // Install react-icons if not already installed.
// Dropdown Container
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  z-index: 100;
`;

// Dropdown Button
const DropdownButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  font-size: 2.2rem;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;

  &:hover {
    transform: scale(1.1); /* Subtle hover effect */
    color: #90ee90; /* Gentle green hover */
  }
`;

// Dropdown Content
const DropdownContent = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  top: 70px;
  left: 0;
  background: linear-gradient(120deg, rgba(45, 52, 54, 0.95), rgba(34, 47, 62, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  min-width: 270px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  opacity: ${({ isFading }) => (isFading ? 0 : 1)};
  transition: opacity 0.5s ease, transform 0.5s ease;
  transform: ${({ isFading }) =>
    isFading ? 'translateY(-10px)' : 'translateY(0)'};
  overflow: hidden;

`;

// Dropdown Item
const DropdownItem = styled.a`
  color: #ffffff;
  padding: 15px 20px;
  text-decoration: none;
  display: block;
  font-size: 1.1rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(72, 126, 176, 0.3); /* Subtle hover background */
    color: #90ee90; /* Gentle green hover */
    transform: translateX(8px); /* Slight hover movement */
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 15px 25px;
  }

  &:nth-child(1) {
    animation: itemSlideIn 0.5s ease 0.1s backwards;
  }
  &:nth-child(2) {
    animation: itemSlideIn 0.5s ease 0.2s backwards;
  }
  &:nth-child(3) {
    animation: itemSlideIn 0.5s ease 0.3s backwards;
  }

  @keyframes itemSlideIn {
    from {
      opacity: 0;
      transform: translateX(-15px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const TopLeftDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [mouseTimer, setMouseTimer] = useState(null);

  const handleClick = () => {
    if (isOpen) {
      setIsFading(true); // Start fade-out animation
      setTimeout(() => {
        setIsOpen(false); // Close dropdown after animation
        setIsFading(false);
      }, 500); // Match fade duration
    } else {
      setIsOpen(true); // Open dropdown
    }
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setIsFading(true); // Start fade-out animation
      setTimeout(() => {
        setIsOpen(false); // Close dropdown after fade-out
        setIsFading(false);
      }, 500);
    }, 500); // Wait 0.5s before closing
    setMouseTimer(timer);
  };

  const handleMouseEnter = () => {
    clearTimeout(mouseTimer); // Cancel auto-close if mouse re-enters
  };

  useEffect(() => {
    return () => clearTimeout(mouseTimer); // Clean up timer on unmount
  }, [mouseTimer]);

  return (
    <DropdownContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <DropdownButton onClick={handleClick}>
        <FaBars />
      </DropdownButton>
      <DropdownContent isOpen={isOpen} isFading={isFading}>
        <DropdownItem href="#documentation">Documentation</DropdownItem>
        <DropdownItem href="#use-cases">Use Cases</DropdownItem>
        <DropdownItem href="#library">Library</DropdownItem>
      </DropdownContent>
    </DropdownContainer>
  );
};


export default TopLeftDropdown;
