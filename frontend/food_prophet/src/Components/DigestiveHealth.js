import React from 'react';
import styled from 'styled-components';

// Styled component for the container
const ComingSoonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  font-family: 'Source Sans Pro', sans-serif;
  padding: 20px;
`;

// Styled heading
const Heading = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-transform: uppercase;
  color: #4caf50;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

// Styled paragraph
const SubText = styled.p`
  font-size: 1.3rem;
  max-width: 600px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 40px;
`;

// Styled button for a call to action
const NotifyButton = styled.button`
  padding: 10px 20px;
  margin-top: 2rem;
  font-size: 1.2rem;
  color: #ffffff;
  background-color: #4caf50;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #388e3c;
    transform: translateY(-3px);
  }

  &:focus {
    outline: none;
  }
`;

const DigestiveHealth = () => {
  return (
    <ComingSoonContainer>
      <Heading>Coming Soon</Heading>
      <SubText style={{ color: 'white', fontSize: '1.5rem' }}>
        We're working hard to bring you insightful data on your digestive health.
        Stay tuned for updates and exciting features that will help you on your wellness journey!
      </SubText>
      <NotifyButton>Notify Me</NotifyButton>
    </ComingSoonContainer>
  );
};

export default DigestiveHealth;
