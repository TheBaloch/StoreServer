const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();
const products = require('./routes/products');

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME;

let db;

async function MongoConnect() {
  try {
    const client = await MongoClient.connect(uri);
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    app.use(products(db));
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

app.use(async (req, res, next) => {
  if (!db) {
    await MongoConnect();
  }
  next();
});

app.use(cors());

app.use(
  '/uploads/products',
  express.static(path.join(__dirname, 'uploads/products'))
);

app.use('/', express.static(path.join(__dirname, '/')));
app.use(express.json());

MongoConnect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
  });
