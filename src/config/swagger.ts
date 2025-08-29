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
        url: `http://localhost:${process.env.PORT || 5000}/api`,
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
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              description: "Current page number",
            },
            limit: {
              type: "integer",
              description: "Number of items per page",
            },
            total: {
              type: "integer",
              description: "Total number of items",
            },
            pages: {
              type: "integer",
              description: "Total number of pages",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
