import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Set axios base URL for API calls
axios.defaults.baseURL = 'http://localhost:5001';

function App() {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  const fetchValues = async () => {
    try {
      const res = await axios.get('/api/values/current');
      setValues(res.data || {});
    } catch (err) {
      console.error('Error fetching current values:', err);
    }
  };

  const fetchIndexes = async () => {
    try {
      const res = await axios.get('/api/values/all');
      let data = res.data;
      if (!Array.isArray(data)) {
        data = data ? [data] : [];
      }
      setSeenIndexes(data);
    } catch (err) {
      console.error('Error fetching indexes:', err);
      setSeenIndexes([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!index) return;

    console.log('Submitting index:', index);

    try {
      setLoading(true);
      const res = await axios.post('/api/values', { index });
      console.log('Response from POST:', res.data);
      setIndex('');
      // Refresh values after submission
      fetchValues();
      fetchIndexes();
    } catch (err) {
      console.error('Error submitting index:', err);
      setError('Failed to submit index.');
    } finally {
      setLoading(false);
    }
  };

  const renderSeenIndexes = () => {
    if (!Array.isArray(seenIndexes)) return null;
    return seenIndexes.map(({ number }) => number).join(', ');
  };

  const renderValues = () => {
    return Object.entries(values).map(([key, value]) => (
      <div key={key}>
        For index {key}, I calculated {value}
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo192.png" alt="Logo" className="logo-spin" style={{ width: '100px' }} />
        <h1>Welcome to the Fibonacci Calculator</h1>

        <form onSubmit={handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            disabled={loading}
            type="number"
            min="0"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Submit'}
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <h3>Indexes I have seen:</h3>
        <p>{renderSeenIndexes()}</p>

        <h3>Calculated Values:</h3>
        {renderValues()}
      </header>
    </div>
  );
}

export default App;