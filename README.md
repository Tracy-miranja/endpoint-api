# Job Management API

This API provides a backend solution for managing users, jobs, and categories. It is built using Node.js, Express, and MongoDB, offering endpoints for user registration, authentication, job creation, and category management.

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Job Endpoints](#job-endpoints)
  - [Category Endpoints](#category-endpoints)
- [Middleware](#middleware)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

Follow these instructions to set up the project locally.

## Prerequisites

Make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/job-management-api.git
   cd job-management-api
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start your MongoDB server (if running locally).

4. Create a `.env` file in the root directory and add your MongoDB URI and JWT secret:
   ```plaintext
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

5. Start the server:
   ```bash
   npm start
   ```

The server should be running on `http://localhost:3000`.

## Environment Variables

| Variable        | Description                           |
|------------------|---------------------------------------|
| `MONGODB_URI`    | URI for connecting to MongoDB         |
| `JWT_SECRET`     | Secret key for signing JSON Web Tokens|

## API Endpoints

### User Endpoints

| Method | Endpoint              | Description                      |
|--------|-----------------------|----------------------------------|
| POST   | `/api/register`       | Register a new user             |
| POST   | `/api/login`          | Login an existing user           |
| GET    | `/api/users/:id`      | Retrieve user details by ID      |
| DELETE | `/api/users/:id`      | Delete user by ID                |
| GET    | `/api/users`          | Retrieve all users               |
| PUT    | `/api/profile/:id`    | Update user profile              |

### Job Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| POST   | `/api/jobs`            | Create a new job                    |
| GET    | `/api/jobs`            | Retrieve all jobs                   |
| GET    | `/api/jobs/category/:categoryId` | Get jobs by category         |
| GET    | `/api/jobs/:id`        | Retrieve job details by ID          |
| PUT    | `/api/jobs/:id`        | Update job details                  |
| DELETE | `/api/jobs/:id`        | Delete job by ID                    |

### Category Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/categories`      | Retrieve all categories              |
| GET    | `/api/category/:id`    | Retrieve category details by ID      |
| POST   | `/api/categories`      | Create a new category                |
| PUT    | `/api/categories/:id`  | Update category details              |
| DELETE | `/api/categories/:id`  | Delete category by ID                |

## Middleware

- **Auth Middleware**: Validates JWT for protected routes.
- **Role Check Middleware**: Ensures the user has the correct role (e.g., admin, super admin).

## Usage

### Example Request to Register a User

```javascript
fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'yourusername',
        email: 'youremail@example.com',
        password: 'yourpassword',
    }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Example Request to Login a User

```javascript
fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'youremail@example.com',
        password: 'yourpassword',
    }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Contributing

Contributions are welcome! Please create a pull request for any changes you wish to make.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
