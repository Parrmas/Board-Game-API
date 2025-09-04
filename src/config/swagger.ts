import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Board Game API",
      version: "1.0.0",
      description: "API for board game collection management",
    },
    servers: [
      {
        url: process.env.API_URL as string,
      },
    ],
    components: {
      schemas: {
        Game: {
          type: "object",
          properties: {
            bgg_id: { type: "number" },
            name: { type: "string" },
            description: { type: "string" },
            year_published: { type: "number" },
            min_player: { type: "number" },
            max_player: { type: "number" },
            playing_time: { type: "number" },
            min_playtime: { type: "number" },
            max_playtime: { type: "number" },
            min_age: { type: "number" },
            image_url: { type: "string" },
            thumbnail_url: { type: "string" },
            average_rating: { type: "number" },
            complexity_weight: { type: "number" },
          },
        },
        Category: {
          type: "object",
          properties: {
            bgg_id: { type: "string" },
            name: { type: "string" },
          },
        },
        Designer: {
          type: "object",
          properties: {
            bgg_id: { type: "string" },
            name: { type: "string" },
          },
        },
        Mechanic: {
          type: "object",
          properties: {
            bgg_id: { type: "string" },
            name: { type: "string" },
          },
        },
        Publisher: {
          type: "object",
          properties: {
            bgg_id: { type: "string" },
            name: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    "./src/**/*.route.ts", // Matches all route files in any subdirectory
    "./src/**/*.controller.ts", // Matches all controller files in any subdirectory
    "./src/**/*.ts", // Fallback for any other files
  ],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
