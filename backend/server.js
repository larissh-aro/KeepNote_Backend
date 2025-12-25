import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
import logger from './logger.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB - Database: keepddbb'))
  .catch((error) => logger.error('MongoDB connection error:', error));

// Routes will be imported here
import noteRoutes from './routes/notes.js';
app.use('/api/notes', noteRoutes);

// Root: redirect to API docs (avoid "Cannot GET /")
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Swagger UI
import swaggerSpec from './swagger.js';
import swaggerUi from 'swagger-ui-express';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose raw swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const PORT = process.env.PORT || 5000;
logger.info('Swagger docs available at http://localhost:5000/api-docs');
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});