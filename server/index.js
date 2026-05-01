import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import billRoutes from './routes/bills.js';
import customerRoutes from './routes/customers.js';
import settingsRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';
import activityRoutes from './routes/activity.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'The server is running' });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Keep-alive ping to prevent Render free tier from sleeping
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await fetch(`${process.env.CLIENT_URL || 'https://pawnbrokerapp.onrender.com'}/health`);
    } catch {}
  }, 10 * 60 * 1000); // ping every 10 minutes
}

app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
