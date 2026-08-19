const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// CORS: only allow the configured client origin in production. Falls back
// to allowing all origins in development so you're not fighting CORS while
// iterating locally with different ports.
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : '*',
  })
);

app.use(express.json()); // parse JSON request bodies

// Simple health check - useful for AWS load balancer / EB health checks later
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);

// Order matters: notFound catches anything that fell through all routes,
// errorHandler must be registered LAST so Express treats it as the
// error-handling middleware (it's identified by having 4 arguments).
app.use(notFound);
app.use(errorHandler);

module.exports = app;
