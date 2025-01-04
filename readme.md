# Volunteer Management System - Backend

This repository contains the backend code for the Volunteer Management System. The server handles all API requests, authentication, and data management.

## Technologies Used

- *Node.js*: JavaScript runtime for building the backend.
- *Express.js*: Framework for routing and middleware.
- *MongoDB*: Database for storing and retrieving data.
- *JWT*: For secure user authentication.
- *Cors*: For handling cross-origin requests.

## Features

- API endpoints for managing volunteers and organizations.
- Secure user authentication and authorization.
- Role-based access control.
- Efficient database queries and real-time updates.

## Getting Started

Follow the steps below to set up and run the backend server locally:

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB installed or a cloud MongoDB instance.

### Installation

1. Clone the repository:
   
git clone https://github.com/yourusername/volunteer-management-backend.git

2. Navigate to the project directory:
   
cd volunteer-management-backend

3. Install dependencies:
   
npm install

4. Create an .env file in the root of your project and configure the following variables:
   
env
PORT=5000
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/your_db
JWT_SECRET=your_secret_key

### Running the Server

Start the development server:
npm run dev

The server will be running at http://localhost:5000.

## API Endpoints

### User Authentication
- POST /api/login: User login.
- POST /api/register: User registration.

### Volunteer Management
- GET /api/volunteers: Fetch all volunteers.
- POST /api/volunteers: Add a new volunteer.

### Organization Management
- GET /api/organizations: Fetch all organizations.
- POST /api/organizations: Add a new organization.

## Folder Structure

/src
/controllers
/models
/routes
/utils
server.js

## Deployment

To deploy the server:

1. Build the project:
   
npm run build

2. Host on platforms like Heroku or AWS.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
