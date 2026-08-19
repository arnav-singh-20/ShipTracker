require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5001;

// Connect to the DB first, THEN start listening - this avoids the app
// accepting requests before it's actually able to talk to the database.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ShipTrack API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});
