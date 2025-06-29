const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');
const { Pool } = require('pg'); // 👈 Include PG here

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Postgres Client Setup with Retry
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
  ssl: process.env.NODE_ENV !== 'production' ? false : { rejectUnauthorized: false },
});

const createTable = async () => {
  try {
    await pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)');
    console.log("✅ Postgres table created or already exists");
  } catch (err) {
    console.error("❌ Table creation failed. Retrying in 5s...", err.message);
    setTimeout(createTable, 5000); // Retry after 5 seconds
  }
};

pgClient.on('error', () => console.error('❌ Postgres connection lost'));
createTable();

// ✅ Redis Client Setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// ✅ Express Route Handlers
app.get('/api/values/all', async (req, res) => {
  try {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
  } catch (err) {
    console.error("❌ Failed to fetch all values:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/api', (req, res) => {
  res.send('API is working ✅');
});


app.get('/api/values/current', (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    if (err) {
      console.error("❌ Redis error:", err);
      return res.status(500).send("Redis error");
    }
    res.send(values);
  });
});

app.post('/api/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
    .catch(err => console.error("❌ Postgres insert error:", err));

  res.send({ working: true });
});

// ✅ Confirm app is running
console.log("✅ Reached end of setup. Ready to listen...");

app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Listening on port 5000');
});