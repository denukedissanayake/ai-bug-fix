import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';

// VULNERABILITY: Using ReactDOM.render which can be vulnerable to XSS
ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);