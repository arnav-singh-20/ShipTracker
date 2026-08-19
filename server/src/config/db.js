const mongoose = require('mongoose');

// Centralizing the connection logic here (rather than in server.js) keeps
// server.js focused purely on "start the HTTP server", and makes it trivial
// to reuse this connect function in tests or scripts later.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Fail fast: if we can't reach the DB, there's no point running the API.
    process.exit(1);
  }
};

module.exports = connectDB;
