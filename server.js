import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// Load env
dotenv.config();

const app = express();

// ------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------
app.use(cors());
app.use(express.json());

// ------------------------------------------------------
// MONGODB CONNECTION
// ------------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB - Database: keepddbb'))
  .catch((error) => logger.error('MongoDB connection error:', error));

// ------------------------------------------------------
// NOTE ROUTES
// ------------------------------------------------------
import noteRoutes from './routes/notes.js';
app.use('/api/notes', noteRoutes);

// ------------------------------------------------------
// MCP TOOL ENDPOINT (OPTIONAL / SAFE)
// ------------------------------------------------------
app.post('/api/agent', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    return res.json({
      success: true,
      message: 'Backend MCP endpoint active',
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
// CHAT → CALL AGENT VIA HTTP (CORRECT WAY)
// ------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }

    const agentUrl = process.env.AGENT_URL;
    if (!agentUrl) {
      return res.status(500).json({
        success: false,
        error: 'AGENT_URL not configured'
      });
    }

    const response = await fetch(`${agentUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        success: false,
        error: 'Agent service error',
        details: text
      });
    }

    const data = await response.json();

    return res.json({
      success: true,
      responses: data.responses
    });

  } catch (error) {
    logger.error('Agent call failed', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ------------------------------------------------------
// ROOT & HEALTH
// ------------------------------------------------------
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime()
  });
});

// ------------------------------------------------------
// SWAGGER
// ------------------------------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ------------------------------------------------------
// START SERVER
// ------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Swagger docs → /api-docs`);
});
