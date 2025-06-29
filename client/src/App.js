import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  const fetchValues = async () => {
    const res = await axios.get('/api/values/current');
    setValues(res.data);
  };

  const fetchIndexes = async () => {
    const res = await axios.get('/api/values/all');
    setSeenIndexes(res.data);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('/api/values', { index });
    setIndex('');
  };

  const renderSeenIndexes = () => {
    return seenIndexes.map(({ number }) => number).join(', ');
  };

  const renderValues = () => {
    const entries = [];
    for (let key in values) {
      entries.push(
        <div key={key}>
          For index {key}, I calculated {values[key]}
        </div>
      );
    }
    return entries;
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* 🌀 Animated logo with CSS class */}
        <img src="/logo192.png" alt="Logo" className="logo-spin" style={{ width: '100px' }} />
        <h1>Welcome to the Fibonacci Calculator</h1>

        <form onSubmit={handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {renderSeenIndexes()}

        <h3>Calculated Values:</h3>
        {renderValues()}
      </header>
    </div>
  );
}

export default App;
