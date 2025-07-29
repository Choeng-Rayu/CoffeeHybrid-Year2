import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Coffee Hybrid API',
            version: '1.0.0',
            description: 'A comprehensive API for Coffee Hybrid ordering system with authentication, product management, order processing, and email notifications.',
            contact: {
                name: 'Coffee Hybrid Support',
                email: 'choengrayu307@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:4000/api',
                description: 'Development server'
            },
            {
                url: 'https://backend-hybrid-coffee-mvs8r.ondigitalocean.app/api-docs',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        role: { type: 'string', enum: ['customer', 'seller', 'admin'], example: 'customer' },
                        authProvider: { type: 'string', enum: ['local', 'google', 'telegram'], example: 'local' },
                        isEmailVerified: { type: 'boolean', example: false },
                        loyaltyPoints: { type: 'integer', example: 0 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string', example: 'Cappuccino' },
                        price: { type: 'number', format: 'float', example: 4.50 },
                        description: { type: 'string', example: 'Rich espresso with steamed milk foam' },
                        category: { type: 'string', example: 'Coffee' },
                        image: { type: 'string', example: 'cappuccino.jpg' },
                        isAvailable: { type: 'boolean', example: true },
                        sellerId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        userId: { type: 'integer' },
                        totalAmount: { type: 'number', format: 'float', example: 15.50 },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'], example: 'pending' },
                        qrToken: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                OrderItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        orderId: { type: 'integer' },
                        productId: { type: 'integer' },
                        quantity: { type: 'integer', example: 2 },
                        price: { type: 'number', format: 'float', example: 4.50 },
                        addons: { type: 'array', items: { type: 'string' }, example: ['extra shot', 'oat milk'] }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['emailOrUsername', 'password'],
                    properties: {
                        emailOrUsername: { type: 'string', example: 'john@example.com' },
                        password: { type: 'string', example: 'password123' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['username', 'email', 'password'],
                    properties: {
                        username: { type: 'string', example: 'john_doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' }
                    }
                },
                ForgotPasswordRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'john@example.com' }
                    }
                },
                ResetPasswordRequest: {
                    type: 'object',
                    required: ['token', 'newPassword'],
                    properties: {
                        token: { type: 'string', example: 'abc123def456' },
                        newPassword: { type: 'string', minLength: 6, example: 'newpassword123' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Invalid credentials' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    },
    apis: ['./Backend/routes/*.js', './Backend/controllers/*.js', './Backend/models/*.js']
};

export default options;