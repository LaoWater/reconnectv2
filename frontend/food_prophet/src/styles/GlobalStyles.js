// src/GlobalStyles.js

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* The host Django page owns <body> (font, background). Never set zoom,
     filter or transform on body here: each one makes body the containing
     block for position:fixed and throws the modals off-screen. */

  button {
    cursor: pointer;
    padding: 10px 20px;
    border: none;
    background-color: #4CAF50;
    color: white;
    border-radius: 5px;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #45a049;
  }

  button:focus {
    outline: none;
  }
`;

export default GlobalStyles;
