# Task Management Application - Backend

This is the backend for the task management application, which provides the necessary APIs for managing tasks and user authentication.

## Technologies Used

- [bcrypt](https://www.npmjs.com/package/bcrypt): A library for hashing passwords, used for securely storing user passwords in the database.
- [dotenv](https://www.npmjs.com/package/dotenv): A zero-dependency module that loads environment variables from a `.env` file into `process.env`.
- [Express.js](https://expressjs.com/): A fast, unopinionated, and minimalist web framework for Node.js that is commonly used for building APIs.
- [http-status](https://www.npmjs.com/package/http-status): A set of HTTP status codes and messages for the Node.js platform, useful when working with HTTP and REST APIs.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): An implementation of JSON Web Tokens (JWT) that provides a simple way to create and verify web tokens in Node.js.
- [MongoDB](https://www.mongodb.com/): A popular NoSQL database that provides high performance, high availability, and easy scalability.

## Installation

1. Clone the repository to your local machine.
2. Run `npm install` to install the necessary dependencies.
3. Set up environment variables in a `.env` file.
4. Run the backend server using the command `npm start` or `node server.js`.
5. Ensure the MongoDB server is up and running.

## Usage

- Use the provided APIs to manage tasks and user authentication.
- Secure user passwords using bcrypt and manage user sessions using JSON Web Tokens (JWT).
- Implement CORS to enable cross-origin resource sharing for the frontend application.
