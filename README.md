# NestJS E-Commerce Microservices Project

Welcome to the E-Commerce Microservices project! This is a robust, scalable backend system built with NestJS, demonstrating a modern microservice architecture combined with event-driven principles. The system is fully containerized with Docker for easy setup and deployment.

---

## 🏛️ Architecture Overview

This project implements a microservice architecture where each service is an independent application with a single responsibility. The services communicate with each other over a private network using TCP for synchronous requests and Kafka for asynchronous, event-driven communication.

The **API Gateway** serves as the single entry point for all external clients, handling HTTP requests, authenticating users, and routing traffic to the appropriate internal service.

### High-Level Data Flow

![Architecture Diagram](https://i.imgur.com/8a3y0oW.png)

*(This is a conceptual diagram. In our implementation, all internal communication happens via TCP or Kafka within the Docker network.)*

### Services

| Service                       | Responsibility                                                                    | Technology Stack                | Communication      |
| ----------------------------- | --------------------------------------------------------------------------------- | ------------------------------- | ------------------ |
| 📦 **`api-gateway`** | The single entry point. Handles HTTP, auth guards, and request routing.           | NestJS                          | HTTP, TCP          |
| 🔐 **`auth-microservice`** | Manages user authentication, JWT generation, and token verification.              | NestJS, JWT, bcrypt             | TCP                |
| 👥 **`users-microservice`** | Handles all user-related CRUD operations.                                         | NestJS, PostgreSQL, TypeORM     | TCP                |
| 🛍️ **`products-microservice`** | Manages product catalog, inventory, and pricing.                                  | NestJS, PostgreSQL, Redis       | TCP                |
| 🛒 **`cart-microservice`** | Manages user shopping carts.                                                      | NestJS, MongoDB, Mongoose       | TCP                |
| 📝 **`orders-microservice`** | Creates and manages orders. **Produces** `ORDER_CREATED` events to Kafka.         | NestJS, PostgreSQL, Kafka       | TCP, Kafka         |
| 📦 **`stock-microservice`** | **Consumes** `ORDER_CREATED` events to update product stock.                      | NestJS, Kafka                   | Kafka, TCP         |
| 🚚 **`shipping-microservice`** | **Consumes** `ORDER_CREATED` events to simulate creating a shipping request.      | NestJS, Kafka                   | Kafka              |
| 🔔 **`notification-microservice`**| **Consumes** `ORDER_CREATED` events to simulate sending a confirmation email.     | NestJS, Kafka                   | Kafka              |
| 📚 **`libs`** | A shared internal library for common DTOs, enums, and contracts.                  | TypeScript                      | N/A                |

---

## ✨ Features

- **Microservice Architecture**: Decoupled services for scalability and maintainability.
- **Event-Driven with Kafka**: Asynchronous processing of orders for resilience and performance.
- **Database-per-Service**: Each service has its own dedicated database (PostgreSQL/MongoDB).
- **High-Performance Caching**: Redis is used to cache product data, reducing database load.
- **JWT Authentication**: Secure, token-based authentication managed by the `auth-service`.
- **Role-Based Access Control (RBAC)**: Endpoints protected by user roles (`USER`, `ADMIN`).
- **Containerized Environment**: Fully containerized with Docker and orchestrated with `docker-compose`.
- **Developer-Friendly Workflow**: Includes a `makefile` for easy management of Docker services and installation scripts for dependencies.
- **Shared Library**: A central library (`@ecommerce/common`) for shared DTOs and types to ensure consistency.

---

## 💻 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
- **Databases**:
  - [PostgreSQL](https://www.postgresql.org/): For `users`, `products`, and `orders`.
  - [MongoDB](https://www.mongodb.com/): For the `cart` service.
  - [Redis](https://redis.io/): For caching in the `products` service.
- **Messaging / Events**: [Apache Kafka](https://kafka.apache.org/)
- **Communication Protocols**: HTTP, TCP

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

You must have the following software installed:
- [Docker](https://www.docker.com/products/docker-desktop/) (v20.10.0 or newer)
- [Node.js](https://nodejs.org/en/) (v18.x or newer)
- [npm](https://www.npmjs.com/) (v9.x or newer)
- **(Recommended)** [Git Bash](https://git-scm.com/downloads) for Windows users to run `.sh` scripts.
- **(Optional)** [Make](https://www.gnu.org/software/make/) for using the simplified `makefile` commands.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ecommerce-app
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the project by copying the example file.

```bash
cp .env.example .env
```
The default values in the `.env` file are pre-configured to work with the `docker-compose.yml` setup. You should review and change the `JWT_SECRET` for any real deployment.

### 3. Install All Dependencies

A helper script is provided to install the dependencies for all 9 microservices and the shared library.

**On macOS or Linux (or Git Bash on Windows):**
```bash
# Make the script executable (only need to do this once)
chmod +x install-all.sh

# Run the script
./install-all.sh
```

**On Windows (using PowerShell):**
```powershell
# You may need to adjust your execution policy first:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run the PowerShell script
./install-all.ps1
```

### 4. Run the Application

The entire system is orchestrated with Docker Compose. You can start all services with a single command.

**Using Make (Recommended & Easiest):**
```bash
# Build and start all services in detached mode
make up

# To stop all services
make stop

# To stop and remove all volumes (clean slate)
make down

# To tail the logs of all services
make logs
```

**Using Docker Compose directly:**
```bash
# Build and start all services in detached mode
docker-compose up --build -d

# To stop all services
docker-compose stop

# To stop and remove all volumes
docker-compose down --volumes
```

The **API Gateway** will be available at `http://localhost:3000`.

---

## 🛠️ API Usage

A Postman collection is included in the project root: `E-Commerce-API.postman_collection.json`.

1. **Import the Collection**: Open Postman and import this file.
2. **Run in Order**: The collection is designed to be run in order. Start with the **"Authentication & Users"** folder to register users and log in. The login requests have test scripts that automatically save the JWT to a collection variable.
3. **Automatic Authentication**: Subsequent requests that require authentication are already configured to use the saved token from the variables.

This allows you to easily test the entire workflow, from creating products to adding them to a cart and placing an order.

---

## 🔮 Future Improvements

This project serves as a strong foundation. For a production-grade system, the following steps would be next:

- **Testing**: Implement comprehensive unit, integration, and e2e tests for each microservice.
- **CI/CD**: Create a continuous integration and deployment pipeline to automate testing and deployments.
- **Centralized Logging**: Integrate a logging stack (e.g., ELK Stack, Grafana Loki) for better observability.
- **Monitoring & Tracing**: Add Prometheus for metrics and Jaeger/OpenTelemetry for distributed tracing to monitor the health and performance of the services.
- **Database Migrations**: Use a migration tool (like TypeORM Migrations) to manage database schema changes in a controlled manner instead of relying on `synchronize: true`.
