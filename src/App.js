import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Roulette from './components/Roulette';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Roulette />} />
      </Routes>
    </Router>
  );
}

export default App;
