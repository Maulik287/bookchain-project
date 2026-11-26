require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const claimRoutes = require('./routes/claimRoutes');
const journeyRoutes = require('./routes/journeyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Second-Hand Book Exchange Chain with Ownership History Tracking',
    course: '24CIE554 - Full Stack Development',
    students: [
      { name: 'Ashwath G Hegde', usn: '1MS25CI404' },
      { name: 'Maulik Tondwal', usn: '1MS24CI070' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Book Exchange Chain API Server running on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
