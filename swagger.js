import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.SWAGGER_HOST || `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Easy Note Desk API',
      version: '1.0.0',
      description: 'API documentation for Easy Note Desk backend',
    },
    servers: [
      {
        url: HOST,
      },
    ],
    components: {
      schemas: {
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            color: { type: 'string' },
            labels: { type: 'array', items: { type: 'string' } },
            isPinned: { type: 'boolean' },
            isArchived: { type: 'boolean' },
            isChecklist: { type: 'boolean' },
            checklistItems: { type: 'array', items: { type: 'object' } },
            reminderDate: { type: 'number' },
            category: { type: 'string' },
            createdAt: { type: 'number' },
            updatedAt: { type: 'number' },
          },
        },
      },
    },
  },
  // files containing annotations as above
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
