import React, { useState } from 'react';
import './App.css';

function Fib() {
  const [index, setIndex] = useState('');
  const [seenIndices, setSeenIndices] = useState([]);
  const [calculatedValues, setCalculatedValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Memoized Fibonacci calculation
  const fibonacci = (n) => {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    let a = 0, b = 1, temp;
    for (let i = 2; i <= n; i++) {
      temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(index);
    
    if (isNaN(num) || num < 0) return;
    
    setIsLoading(true);
    
    // Simulate async operation (remove setTimeout in production)
    setTimeout(() => {
      if (!seenIndices.includes(num)) {
        const newSeenIndices = [...seenIndices, num].sort((a, b) => a - b);
        setSeenIndices(newSeenIndices);
        
        const value = fibonacci(num);
        setCalculatedValues(prev => ({
          ...prev,
          [num]: value
        }));
      }
      setIsLoading(false);
      setIndex('');
    }, 300);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fibonacci Calculator</h1>
        
        <div className="fib-container">
          <form onSubmit={handleSubmit}>
            <label>Enter a positive index:</label>
            <input
              type="number"
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              min="0"
              required
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? 'Calculating...' : 'Calculate'}
            </button>
          </form>

          <div className="history">
            <h3>Indexes I have seen:</h3>
            <p>{seenIndices.length > 0 ? seenIndices.join(', ') : 'None yet'}</p>
            
            <h3>Calculated Values:</h3>
            {seenIndices.map(idx => (
              <p key={idx}>
                Fib({idx}) = {calculatedValues[idx]}
              </p>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Fib;
