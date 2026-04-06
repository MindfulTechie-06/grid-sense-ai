import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import MultiAgent from './MultiAgent';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/multi-agent" element={<MultiAgent />} />
      </Routes>
    </Router>
  );
}

export default App;