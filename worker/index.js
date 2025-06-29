const keys = require('./keys');
const redis = require('redis');

// 🔁 Create Redis client and subscriber
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

// 🧠 Safe Fibonacci function with guard
function fib(index) {
  const num = parseInt(index);
  if (isNaN(num) || num < 0) return 0;
  if (num < 2) return 1;
  return fib(num - 1) + fib(num - 2);
}

// 📩 Listen for insert events and calculate fib
sub.on('message', (channel, message) => {
  console.log(`📨 Processing index: ${message}`);
  try {
    const result = fib(message);
    redisClient.hset('values', message, result);
  } catch (err) {
    console.error(`❌ Error processing index ${message}:`, err.message);
  }
});

sub.subscribe('insert');

console.log("🟢 Worker is listening for insert events...");