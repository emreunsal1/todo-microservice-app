const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Todo API Documentation",
    version: "1.0.0",
    description: "API documentation for Todo Application",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Tag: {
        type: "object",
        properties: {
          _id: { type: "string", format: "objectid" },
          name: { type: "string" },
          isDelete: { type: "boolean", default: false },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", format: "objectid" },
          username: { type: "string" },
          password: { type: "string" },
          todos: {
            type: "array",
            items: {
              type: "string",
              format: "objectid",
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Todo: {
        type: "object",
        properties: {
          _id: { type: "string", format: "objectid" },
          title: { type: "string" },
          description: { type: "string" },
          tags: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Tag",
            },
          },
          dueDate: { type: "string", format: "date-time" },
          assignees: {
            type: "array",
            items: {
              $ref: "#/components/schemas/User",
            },
          },
          isDelete: { type: "boolean", default: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          status: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Logout successful",
          },
        },
      },
    },
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of users retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "User retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/todos": {
      get: {
        tags: ["Todos"],
        summary: "Get all todos",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "assignedToMe",
            in: "query",
            schema: {
              type: "boolean",
            },
          },
        ],
        responses: {
          200: {
            description: "List of todos retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Todo",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Todos"],
        summary: "Create new todo",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  dueDate: { type: "string", format: "date-time" },
                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "objectid",
                    },
                  },
                  assignees: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "objectid",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Todo created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Todo",
                },
              },
            },
          },
        },
      },
    },
    "/todos/{id}": {
      get: {
        tags: ["Todos"],
        summary: "Get todo by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          200: {
            description: "Todo retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Todo",
                },
              },
            },
          },
          404: {
            description: "Todo not found",
          },
        },
      },
      put: {
        tags: ["Todos"],
        summary: "Update todo",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  dueDate: { type: "string", format: "date-time" },
                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "objectid",
                    },
                  },
                  assignees: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "objectid",
                    },
                  },
                  isDelete: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Todo updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Todo",
                },
              },
            },
          },
          404: {
            description: "Todo not found",
          },
        },
      },
      delete: {
        tags: ["Todos"],
        summary: "Delete todo",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          204: {
            description: "Todo deleted successfully",
          },
          404: {
            description: "Todo not found",
          },
        },
      },
    },
    "/todos/tags": {
      get: {
        tags: ["Todos"],
        summary: "Get all unique tags",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of tags retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerConfig;
