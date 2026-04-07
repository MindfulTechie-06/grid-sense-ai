import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import MultiAgent from './MultiAgent';
import GridStabilizer from './GridStabilizer';
import GridNetwork from './GridNetwork';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/multi-agent" element={<MultiAgent />} />
        <Route path="/grid-stabilizer" element={<GridStabilizer />} />
        <Route path="/grid-network" element={<GridNetwork />} />
      </Routes>
    </Router>
  );
}

export default App;