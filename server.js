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
// CHAT → Run agent for a single message using Python runner
// ------------------------------------------------------
import { spawn } from 'child_process';

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message is required' });

    const pyPath = path.join(__dirname, '..', 'Ai Agent', 'run_single.py');
    const pythonExec = process.env.PYTHON_PATH || process.env.PYTHON || 'python';
    // Allow longer time for model/LLM startup — make configurable via env CHAT_PY_TIMEOUT_MS
    const timeoutMs = parseInt(process.env.CHAT_PY_TIMEOUT_MS || '120000', 10);

    // Spawn child asynchronously so the main Node event loop stays responsive
    const child = spawn(pythonExec, [pyPath, message], { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';
    let finished = false;

    const killTimer = setTimeout(() => {
      if (!finished) {
        child.kill('SIGKILL');
      }
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (err) => {
      clearTimeout(killTimer);
      logger.error('Agent spawn error', err);
      return res.status(500).json({ success: false, error: err.message, stderr, stdout });
    });

    child.on('close', (code, signal) => {
      finished = true;
      clearTimeout(killTimer);

      stdout = stdout ? stdout.trim() : '';
      stderr = stderr ? stderr.trim() : '';

      if (!stdout) {
        logger.error('Agent produced no stdout', { code, signal, stderr, stdout });
        return res.status(500).json({ success: false, error: 'No output from agent', code, signal, stderr });
      }

      let parsed = null;
      try {
        parsed = JSON.parse(stdout);
      } catch (e) {
        parsed = { raw: stdout };
      }

      const actions = parsed.actions || null;
      let responses = parsed.responses || parsed.raw || [];
      if (typeof responses === 'string') responses = [responses];
      else if (!Array.isArray(responses)) responses = [String(responses)];

      return res.json({ success: true, actions, responses, stderr });
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
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
// Bind explicitly to 127.0.0.1 to ensure IPv4 localhost requests succeed
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on port ${PORT}`);
});
