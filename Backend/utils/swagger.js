const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedRed API',
      version: '1.0.0',
      description: 'REST API for Medication Reminders',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
  },
  // Ensure this points to your JSDoc comments in the routes folder[cite: 1]
  apis: ['./routes/*.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;