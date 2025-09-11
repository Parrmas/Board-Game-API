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
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        Game: {
          type: "object",
          properties: {
            bgg_id: { type: "number" },
            name: { type: "string" },
            description: { type: "string" },
            year_published: { type: "number" },
            min_players: { type: "number" },
            max_players: { type: "number" },
            playing_time: { type: "number" },
            min_playtime: { type: "number" },
            max_playtime: { type: "number" },
            min_age: { type: "number" },
            image_url: { type: "string" },
            thumbnail_url: { type: "string" },
            average_rating: { type: "number" },
            complexity_weight: { type: "number" },
            category: {
              type: "object",
              properties: {
                bgg_id: { type: "string" },
                name: { type: "string" },
              },
            },
            mechanic: {
              type: "object",
              properties: {
                bgg_id: { type: "string" },
                name: { type: "string" },
              },
            },
            designer: {
              type: "object",
              properties: {
                bgg_id: { type: "string" },
                name: { type: "string" },
              },
            },
            publisher: {
              type: "object",
              properties: {
                bgg_id: { type: "string" },
                name: { type: "string" },
              },
            },
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
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@boardgamelib.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                token: { type: "string" },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    username: { type: "string" },
                    email: { type: "string" },
                    savedGameIds: {
                      type: "array",
                      items: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                username: { type: "string" },
                email: { type: "string" },
                savedGameIds: {
                  type: "array",
                  items: { type: "number" },
                },
              },
            },
            message: { type: "string" },
          },
        },
        ProfileGamesResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "array",
              items: { type: "number" },
            },
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "Not Authorized",
              },
            },
          },
        },
        AlreadyLoggedInError: {
          description: "User is already logged in",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                success: false,
                message: "User is already logged in",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "JWT Auth examples",
      },
      {
        name: "Games",
        description: "Games API endpoints",
      },
      {
        name: "Categories",
        description: "Category API endpoints",
      },
      {
        name: "Designers",
        description: "Designer API endpoints",
      },
      {
        name: "Mechanics",
        description: "Mechanic API endpoints",
      },
      {
        name: "Publishers",
        description: "Publisher API endpoints",
      },
    ],
  },
  apis: [
    "./src/**/*.route.ts", // Matches all route files in any subdirectory
    "./src/**/*.controller.ts", // Matches all controller files in any subdirectory
    "./src/**/*.ts", // Fallback for any other files
  ],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
