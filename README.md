# Rebate Management System API

## Description
The Rebate Management System API is designed to manage rebate programs, transactions, and rebate claims. It provides endpoints for creating rebate programs, submitting transactions, claiming rebates, and calculating rebates. The API also includes authentication, validation, and error handling mechanisms.

## Local Setup Using Docker

### Prerequisites
- Ensure you have Docker installed on your machine.

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/chakilamabhishek/rebate-management.git
    cd rebate-management
    ```

2. Build and run the Docker containers:
    refer to a known issue to be fixed.
    ```bash
    docker-compose up --build
    ```
3. To run Test case.
    ```bash
    npm install
    npm run test
    ```


You can access the Swagger UI at [http://localhost:3000/api/docs/](http://localhost:3000/api/docs/). To use any endpoint, obtain an access token from `/api/auth/token` and use it for all other API requests.

A small UI for reporting is available at [http://localhost:3000/](http://localhost:3000/).

You are all set!

### Todos:
- Rename `api/rebate-claims` to `reporting` api.
- Version the APIs.

### Known issues:
- During an inital docker-compose up --build the service tries to connect to DB, But fail's since postgres DB is not ready.
- can be fixed with a wait script to see if postgress is up then start the server or try to reconnect on postgres Error's.
- Fix is just to restart the 
    ```bash
    docker-compose up --build
    ```

## Additional Features

### 1. Middlewares
- **Validation Middleware**: Validates all incoming requests and sanitizes them before passing them to controllers.
- **JWT Validator**: Validates all endpoints that require authentication.
- **Error Handler**: A global error handling middleware to catch any errors and log them.

### 2. Security Features
- **Helmet Middleware**: Sets various HTTP headers for security.
- **CORS Middleware**: Configures CORS to allow requests from trusted origins.
- **Rate Limiting**: Limits the number of requests from a single IP address to prevent abuse.
TODO: Add Rateliming based on token.
- **Audit Logging Middleware**: Logs important request details for auditing purposes.
- **Error Handling Middleware**: Centralized error handling to catch and handle errors.
- **Unhandled Promise Rejections and Uncaught Exceptions Handling**: Prevents the application from crashing and logs the errors.

### 3. Database Interactions
- **TypeORM**: An ORM (Object-Relational Mapping) tool that provides a clean and efficient way to interact with the database.
- **DAO Layer**: The DAO (Data Access Object) layer abstracts and encapsulates the data access logic, providing a clean interface for interacting with the database. This makes it easier to manage changes such as sharding or switching databases.

### 4. Handling Concurrency
- Acquired locks where there is a possibility of data inconsistency and race conditions to ensure data integrity.

### 5. Indexing
- Commonly used fields are indexed to improve query performance.

### 6. Swagger Documentation
- Provides Swagger documentation for understanding and interacting with the service.

### 7. Unit Tests
- Added unit tests for validation middleware.
- TODO: Integration tests and concurrency tests are pending (need to set up a test database).

### 8. Secret Management
- All secrets are pulled from `config.js` and .env file
- Todo:  Use a vault for production environments.

### 9. Dockerized Service
- The service is fully dockerized for easy deployment and scalability.

### Scalability Thoughts:

## Database:
- Indexing of frequently used fields is already in place.
- Implement connection pooling with TypeORM.
- Plan for sharding the database under heavy data loads.
- Add read replicas for better query performance.

## Caching:
- Cache reporting endpoints for faster response times.
- Consider making reporting asynchronous.

## Service Improvements:
- Horizontally Scale Micro service.

### Updating Rebate Claim Status

1. Open a terminal and connect to PostgreSQL:
    ```bash
    psql postgres://your_username:your_password@localhost:5432/rebate_management
    ```

2. Run the update query:
    ```sql
    UPDATE "rebate_claim"
    SET claim_status = 'approved'
    WHERE claim_status = 'pending' AND claim_id = 1;
    ```