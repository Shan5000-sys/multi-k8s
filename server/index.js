const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL setup
const pgClient = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres_password',
  database: process.env.PGDATABASE || 'values',
});

pgClient.on('error', () => console.error('❌ PG connection lost'));

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.error('❌ PG table creation failed:', err));

async function startServer() {
  // Redis setup (v4+)
  const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  });

  const redisPublisher = redisClient.duplicate();

  try {
    await redisClient.connect();
    await redisPublisher.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
  }

  // Express routes
  app.get('/api/values/all', async (req, res) => {
    try {
      const values = await pgClient.query('SELECT * FROM values');
      res.send(values.rows);
    } catch (err) {
      res.status(500).send('Error fetching from Postgres');
    }
  });

  app.get('/api/values/current', async (req, res) => {
    try {
      const values = await redisClient.hGetAll('values');
      res.send(values);
    } catch (err) {
      res.status(500).send('Error fetching from Redis');
    }
  });

  app.post('/api/values', async (req, res) => {
    const index = parseInt(req.body.index);

    if (isNaN(index)) {
      return res.status(400).send('Index must be a number');
    }

    if (index > 40) {
      return res.status(422).send('Index too high');
    }

    try {
      await redisClient.hSet('values', index, 'Nothing yet!');
      await redisPublisher.publish('insert', index.toString());

      await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
      console.log('✅ Inserted into Postgres:', index);

      res.send({ working: true });
    } catch (err) {
      console.error('❌ Failed to process index:', err.message);
      res.status(500).send('Server error');
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('❌ Server failed to start:', err);
});

