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

The server should be running on `http://localhost:5000`.

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
- **Role Check Middleware**: Ensures the user has the correct role (e.g., admin, super admin) !Important

## Authentication
All endpoints, except for registration and login, require a valid JWT token. Include the token in the `Authorization` header as follows:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Register a User
- **POST** `/api/register`
- **Request Body**:
  ```json
  {
      "username": "string",
      "email": "string",
      "password": "string"
  }
  ```
- **Response**:
  - `201 Created`: User registered successfully.
  - `400 Bad Request`: User already exists.
  - `500 Internal Server Error`: Server error.

### 2. Login a User
- **POST** `/api/login`
- **Request Body**:
  ```json
  {
      "email": "string",
      "password": "string"
  }
  ```
- **Response**:
  - `200 OK`: Returns a JWT token.
  - `400 Bad Request`: Invalid credentials.
  - `500 Internal Server Error`: Server error.

### 3. Get User by ID
- **GET** `/api/users/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Returns user details (excluding password).
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

### 4. Delete User by ID
- **DELETE** `/api/users/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: User deleted successfully.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

### 5. Get All Users
- **GET** `/api/users`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Returns an array of users (excluding passwords).
  - `500 Internal Server Error`: Server error.

### 6. Update User Profile
- **PUT** `/api/profile/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  - Can include a file (PDF or DOCX) or JSON data with profile details.
- **Response**:
  - `200 OK`: Profile updated successfully.
  - `400 Bad Request`: No file or profile data provided, or unsupported file type.
  - `404 Not Found`: User not found.
  - `500 Internal Server Error`: Server error.

### 7. Create Job
- **POST** `/api/jobs`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
      "created_by": "userId",
      "title": "string",
      "description": "string",
      "salary_range": {
          "min": number,
          "max": number
      },
      "job_status": "string",
      "category_id": "categoryId"
  }
  ```
- **Response**:
  - `201 Created`: Job created successfully.
  - `400 Bad Request`: All fields are required or salary range is invalid.
  - `500 Internal Server Error`: Server error.

### 8. Get All Jobs
- **GET** `/api/jobs`
- **Response**:
  - `200 OK`: Returns an array of jobs.
  - `500 Internal Server Error`: Server error.

### 9. Get Jobs by Category
- **GET** `/api/jobs/category/:categoryId`
- **Response**:
  - `200 OK`: Returns an array of jobs in the specified category.
  - `404 Not Found`: No jobs found for this category.
  - `500 Internal Server Error`: Server error.

### 10. Get Job by ID
- **GET** `/api/jobs/:id`
- **Response**:
  - `200 OK`: Returns job details.
  - `404 Not Found`: Job not found.
  - `500 Internal Server Error`: Server error.

### 11. Update Job
- **PUT** `/api/jobs/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  - JSON data containing updated job details.
- **Response**:
  - `200 OK`: Job updated successfully.
  - `404 Not Found`: Job not found.
  - `500 Internal Server Error`: Server error.

### 12. Delete Job
- **DELETE** `/api/jobs/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Job deleted successfully.
  - `404 Not Found`: Job not found.
  - `500 Internal Server Error`: Server error.

### 13. Get All Categories
- **GET** `/api/categories`
- **Response**:
  - `200 OK`: Returns an array of categories.
  - `500 Internal Server Error`: Server error.

### 14. Get Category by ID
- **GET** `/api/category/:id`
- **Response**:
  - `200 OK`: Returns category details.
  - `404 Not Found`: Category not found.
  - `500 Internal Server Error`: Server error.

### 15. Create Category
- **POST** `/api/categories`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
      "category_name": "string"
  }
  ```
- **Response**:
  - `201 Created`: Category created successfully.
  - `400 Bad Request`: Category name is required.
  - `500 Internal Server Error`: Server error.

### 16. Update Category
- **PUT** `/api/categories/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
      "category_name": "string"
  }
  ```
- **Response**:
  - `200 OK`: Category updated successfully.
  - `404 Not Found`: Category not found.
  - `500 Internal Server Error`: Server error.

### 17. Delete Category
- **DELETE** `/api/categories/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - `200 OK`: Category deleted successfully.
  - `404 Not Found`: Category not found.
  - `500 Internal Server Error`: Server error.

## Error Handling
In case of an error, the API will return a JSON object with the following format:
```json
{
    "message": "Error message here"
}
```

## Contributing

Contributions are welcome! Please create a pull request for any changes you wish to make.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
