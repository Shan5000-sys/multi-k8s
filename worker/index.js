// 1. Import redis and keys first
const redis = require('redis');
const keys = require('./keys'); // make sure keys exports redisHost and redisPort

// 2. Create Redis client and subscriber
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

// 3. Fibonacci function
function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// 4. Subscribe to 'insert' events and process
sub.on('message', (channel, message) => {
  console.log(`Processing index: ${message}`);
  const index = parseInt(message);
  if (isNaN(index)) return;

  const result = fib(index);
  redisClient.hset('values', message, result.toString());
  console.log(`Calculated fib(${index}) = ${result}`);
});

sub.subscribe('insert');

console.log("🟢 Worker is listening for insert events...");