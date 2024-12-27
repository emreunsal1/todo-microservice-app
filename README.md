# Microservices Todo Application

A TODO application built using microservices architecture, featuring user management and real-time updates.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## Architecture Overview

The application follows a microservices architecture with three main components:

- **API Gateway**: Handles routing, authentication, and acts as a single entry point (Public Endpoints)
  - Provides TODO and User data with population. In production environment services should have seperated databases. (For now using same database.)
  - Gateway provides authorization. It helps to manage authorization in one place. So we don't need to add authorization to deep backend services. In production environment services should talk to each other with s2s authentication.
- **TODO Service**: Manages todo items and related operations (Only Internal Requests)
- **User Service**: Handles users and related CRUD operations (Only Internal Requests)

The services communicate through message queues(RabbitMQ) and RESTful APIs.

## Technologies Used

- **Backend Framework**: Node.js with Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Message Broker**: RabbitMQ
- **Real-time Communication**: Socket.IO
- **Database**: MongoDB
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
.
├── gateway/            # API Gateway service
├── todo-service/       # TODO management service
└── user-service/       # User management service
```

## Installation & Setup

1. Prerequisites:

- Node.js (v18.20.4 or higher)
- MongoDB (should work on local environment)
- RabbitMQ (should work on local environment)

2. Clone the repository:

```bash
git clone https://github.com/emreunsal1/todo-microservice-app.git
cd microservices-todo-app
```

3. Environment setup:

- Configure .env files in each service directory
- Set up MongoDB connection strings
- Run RabbitMQ on local environment

4. Run the applications:

```bash
# Use `nvm use` for using exist .nvmrc file.

# Run gateway
cd gateway
npm install
npm run dev

# Run todo-service
cd todo-service
npm install
node createInitialData.js # We should create default tags with this file. (I could not complete tags page cause of time limitation)
npm run dev

# Run gateway
cd user-service
npm install
npm run dev

# Only gateway should have public URL.
# They are communicate using local network, in kubernetes level services should not be respond to public.
```

## Key Features

- 🔐 Secure user authentication and authorization (using cookies)
- 📝 CRUD operations for TODOs and Users.
- 🔄 Real-time updates using WebSocket
- 🎯 Task Management
  - Assign feature for assign task to users.
  - See tasks you created in your profile page.

## API Documentation

The API documentation is available through Swagger UI when running the gateway:

- Gateway API: `http://localhost:3000/api/swagger`
