# Safe Auth Service

A production-ready, highly secure authentication and user management backend service built with **Nest.js**, **TypeScript**, and **Drizzle ORM**. This project demonstrates modern architectural patterns, secure token management, caching strategies, and extensive automated testing workflows.

## 🚀 Key Features

*   **Robust Authentication:** Secure SignUp and Login endpoints utilizing industry-standard password hashing (bcrypt) and validation layers.
*   **Token Management:** Dual-token mechanism using short-lived **JWT access tokens** and secure **refresh tokens**.
*   **High-Performance Caching:** Integrated **Redis** layer for session caching, token blacklisting, and reducing relational database overhead.
*   **Modern Data Layer:** Implemented with **Drizzle ORM** for type-safe database queries, structured schemas, and automated migration generation.
*   **Dockerized Infrastructure:** Multi-container setup containing the application, PostgreSQL database, and Redis instance for seamless local orchestration.
*   **Enterprise-Grade Testing:** Full test suite covering Unit tests (`jest`) and End-to-End (`e2e`) API integration flows with Istanbul coverage tracking.

## 🛠️ Tech Stack

*   **Runtime & Framework:** Node.js, Nest.js, TypeScript
*   **Database & ORM:** PostgreSQL, Drizzle ORM
*   **Caching & Session:** Redis
*   **Testing & QA:** Jest, Supertest, Istanbul (Coverage)
*   **DevOps & Tooling:** Docker, Docker Compose, Prettier, ESLint

## 📂 Project Structure Overview

```text
src/
├── auth/           # Authentication logic (controllers, services, JWT DTOs)
├── db/             # Database modules, Drizzle providers, schemas, and migrations
├── users/          # User management core domain
├── redis/          # Redis integration and caching providers
├── app.module.ts   # Main application root module
└── main.ts         # Application entry point & global pipes configuration
```

## ⚙️ Getting Started
### Prerequisites

Make sure you have Docker and Node.js (v18+) installed on your system.

#### 1. Environment Setup

Clone the repository and create your .env file based on the provided example:

```
cp .env.example .env
```

Configure your JWT secrets, database credentials, and Redis ports inside the .env file.
#### 2. Run Infrastructure via Docker

Spin up the PostgreSQL database and Redis instance in the background:
Bash
```
docker-compose up -d
```

#### 3. Install Dependencies
```
npm install
```

#### 4. Database Migrations

Generate and apply Drizzle database migrations to set up your PostgreSQL schemas:
Bash

```
# Apply pending migrations to the database
npm run db:migrate
```

#### 5. Running the Application
```
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

# Testing & Code Coverage

The project maintains high code quality standards backed by structured test automation runner scripts.
```
# Run unit tests
npm run test

# Run End-to-End (E2E) integration tests
npm run test:e2e

# Generate test coverage reports
npm run test:cov
```

E2E test results and HTML coverage visualizers will be compiled into the /coverage and /coverage-e2e directories respectively.