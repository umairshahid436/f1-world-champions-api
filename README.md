# F1 World Champions API

F1 World Champions is a modern RESTful API that showcases Formula 1 racing data throughout history. It provides endpoints for exploring F1 seasons, viewing race details, and discovering information about world champions. The API serves as a backend for any web or mobile application.

## Frontend Application

To run the frontend app, visit the repository: [https://github.com/umairshahid436/f1-world-champions-web]

## API Documentation

Interactive API documentation is generated using Swagger and is available when the application is running.

Navigate to **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

From this interface, you can:

- View all available endpoints.
- Execute requests directly from your browser to test the API.

![gif-gif](https://github.com/user-attachments/assets/868edaaf-4e56-4482-8a7c-0b9166d877fa)

## Technology Stack

**Backend Framework & Services**

- [NestJS](https://nestjs.com/) with [TypeScript](https://www.typescriptlang.org/) for a robust and scalable architecture.
- [PostgreSQL](https://www.postgresql.org/) as the relational database.
- [TypeORM](https://typeorm.io/) for powerful object-relational mapping.
- [Swagger (OpenAPI)](https://swagger.io/) for interactive API documentation.
- [class-validator](https://github.com/typestack/class-validator) & [class-transformer](https://github.com/typestack/class-transformer) for request payload validation and transformation.
- [Axios](httpshttps://axios-http.com/) for making requests to external APIs.
- [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest) for unit, integration, and e2e testing.

## Development Tools

- [ESLint](https://eslint.org/) for code quality and consistency.
- [Prettier](https://prettier.io/) for automated code formatting.
- [Husky](https://typicode.github.io/husky/) for Git hooks automation.
- [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages.
- [Commitlint](https://commitlint.js.org/) for validating commit messages.
- Pre-commit hooks for running linters and formatters before committing.
- Pre-push hooks for running tests before pushing to the repository.

## Project Directory Structure

```
src/
├── config/              # Application and Swagger configuration
├── database/            # Database modules, entities, migrations, and TypeORM config
│   ├── entities/        # TypeORM entity definitions
│   └── migrations/      # Database migration files
├── decorators/          # Custom decorators
├── external/            # Modules for communicating with external APIs (e.g., Ergast)
│   ├── ergast/          # Service and types for the Ergast F1 API
│   └── http.client/     # Generic HTTP client wrapper
├── interceptors/        # NestJS interceptors (e.g., for response formatting)
├── modules/             # Core application feature modules
│   ├── constructors/    # Logic for F1 constructors
│   ├── drivers/         # Logic for F1 drivers
│   ├── health/          # Health check endpoint
│   ├── races/           # Logic for race data
│   └── seasons/         # Logic for season data
└── utils/               # Utility functions and helpers
```

**Purpose of Key Directories:**

- **`config`**: Stores all global configuration files, such as for Swagger.
- **`database`**: Contains everything related to the database, including entities (table models) and migrations for schema changes.
- **`external`**: Manages communication with outside APIs.
- **`interceptors`**: Code that runs before or after route handlers, used here for standardizing API responses.
- **`modules`**: The heart of the application, with each feature (like Races, Seasons) organized into its own self-contained module.

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory. You can do this by copying the example if one exists, or creating it manually with the following variables:

```bash
# Application Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=****
DB_USER=****
DB_PASSWORD=****
DB_NAME=****

# PgAdmin Configuration
PGADMIN_EMAIL=****
PGADMIN_PASSWORD=****
PGADMIN_PORT=**
```

**Environment Variables Explained:**

- `PORT`: The port the NestJS application will run on.
- `DB_HOST`: The hostname of your PostgreSQL database server.
- `DB_PORT`: The port your PostgreSQL server is listening on.
- `DB_USER`: The username for connecting to the database.
- `DB_PASSWORD`: The password for the database user.
- `DB_NAME`: The name of the database to connect to.

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- npm (comes with Node.js)
- Docker and Docker Compose (for running PostgreSQL)

### Installation Steps

1.  **Clone the repository**

    ```bash
    git clone https://github.com/umaireu/f1-world-champions-api.git
    cd f1-world-champions-api
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the PostgreSQL database**
    This command starts a PostgreSQL container in the background.

    ```bash
    docker-compose up -d postgres
    ```

4.  **Set up environment variables**
    Create a `.env` file in the root directory and fill it with the database credentials and app configuration.

5.  **Run database migrations**
    This command applies the database schema to your PostgreSQL instance.

    ```bash
    npm run migration:run
    ```

6.  **Start the development server**

    ```bash
    npm run start:dev
    ```

7.  **Open the API documentation**
    Navigate to `http://localhost:3000/api-docs` in your browser to see the Swagger UI.

## Running with Docker Compose

This is the recommended way to run the application for a consistent development environment. The following command will start the NestJS API, a PostgreSQL database, and PgAdmin.

### Prerequisites

- Docker and Docker Compose

### Instructions

1.  **Create Environment File**

    Create a `.env` file in the root of the project. The application will not start without it. You can copy the structure from the `Environment Setup` section above.

2.  **Start the Application**

    Run the following command from the project root. This will build the Docker image and start all the services.

    ```bash
      docker-compose --env-file .env -f infrastructure/docker-compose.yml up --build -d
    ```

3.  **Run Database Migrations**

    The first time you start the application, you must run the database migrations to set up the database schema.

    ```bash
    docker-compose --env-file .env -f infrastructure/docker-compose.yml exec world-champions-api npm run migration:run
    ```

4.  **Stopping the Application**

    To stop all the running containers, use the following command:

    ```bash
    docker-compose -f infrastructure/docker-compose.yml down
    ```

## Available Scripts

```bash
# Development
npm run start:dev        # Start the development server with hot-reload.
npm run build            # Build the application for production.
npm run start:prod       # Run the production build.

# Code Quality
npm run lint             # Check code for linting issues.
npm run lint:fix         # Auto-fix ESLint issues.
npm run format           # Format code with Prettier.
npm run format:check     # Check if code is properly formatted.

# Testing
npm run test             # Run unit tests.
npm run test:watch       # Run unit tests in watch mode.
npm run test:cov         # Run unit tests with a coverage report.
npm run test:e2e         # Run end-to-end tests.

# Database
npm run migration:create   # Create a new, empty migration file.
npm run migration:generate # Generate a migration from entity changes.
npm run migration:run      # Apply all pending migrations.
npm run migration:revert   # Revert the last applied migration.
```

## Pipeline and Merge Request Process

Before any merge request can be approved and merged, all pipeline stages in our GitHub Actions workflow must complete successfully.

### Pipeline Stages

1.  **Install Dependencies**:
    - Installs all required packages.
2.  **Linting**:
    - Runs `ESLint` to ensure code style and quality are maintained.
3.  **Testing**:

    - Executes the entire test suite (`unit` and integration) to prevent regressions.
    - Coverage threshold must be maintained (minimum 70%)

    ![Screenshot 2025-06-14 at 20 42 16](https://github.com/user-attachments/assets/65440fc2-0dd6-49a7-b5a1-616171dd029d)

4.  **Security**:
    - Performs a `CodeQL` analysis to scan for common security vulnerabilities.
5.  **Build**:
    - Creates a build (docker) to ensure the application compiles correctly.
6.  **Publish**:
    - Publish a Docker image.
7.  **Summary**:
    - Provides a summary of the pipeline run.

<img width="1420" alt="Screenshot 2025-06-14 at 21 16 31" src="https://github.com/user-attachments/assets/9e38d2e1-43a8-49fc-9ce3-fbe94da44e09" />

### Docker Image

The official Docker image for this project is hosted on Docker Hub. You can pull it using the following command:

```bash
docker pull umairshahidnl/f1-world-champions-api:latest
```

The image is available at the following link:
[https://hub.docker.com/r/umairshahidnl/f1-world-champions-api/tags](https://hub.docker.com/r/umairshahidnl/f1-world-champions-api/tags)
