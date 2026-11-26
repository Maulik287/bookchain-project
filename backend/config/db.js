const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_exchange_chain';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[Database] Notice: MongoDB is not currently running locally (${err.message}).`);
    console.log(`[Database] Switched to high-performance local store adapter with persistence at backend/data/store.json.`);
    console.log(`[Database] (When you are ready to connect to MongoDB Atlas or local mongod, set MONGODB_URI in backend/.env)`);
    return false;
  }
};

module.exports = connectDB;
