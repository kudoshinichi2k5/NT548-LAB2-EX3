const swaggerJsdoc = require('swagger-jsdoc');
require("dotenv").config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KitchenWhiz API Documentation',
      version: '1.0.0',
      description: 'Swagger API docs for KitchenW project including User and Dish modules',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/recipe`, 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
