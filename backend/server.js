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


// ------------------------------------------------------
// NOTE ROUTES
// ------------------------------------------------------
import noteRoutes from './routes/notes.js';
app.use('/api/notes', noteRoutes);


// ------------------------------------------------------
// MCP TOOL ENDPOINT FOR CREWAI AGENT
// (Backend receives queries from agent if needed)
// ------------------------------------------------------
app.post("/api/agent", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required"
      });
    }

    // Backend simply acknowledges the query.
    // CrewAI agent handles all operations through /api/notes.
    res.json({
      success: true,
      message: "Backend MCP endpoint active.",
      receivedQuery: query
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ------------------------------------------------------
// ROOT → redirect to Swagger docs
// ------------------------------------------------------
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});


// ------------------------------------------------------
// SWAGGER UI
// ------------------------------------------------------
import swaggerSpec from './swagger.js';
import swaggerUi from 'swagger-ui-express';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


// Start Server
const PORT = process.env.PORT || 5000;
logger.info('Swagger docs available at http://localhost:5000/api-docs');
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
