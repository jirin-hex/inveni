# Inveni

Inveni (Latin for *I found*) is a resource recommendation platform where people can discover, share, and recommend useful learning resources across different fields and interests.

Whether it's a book, course, article, or tutorial, Inveni makes it easier to find resources worth exploring.

## Features

### Public Platform
- Browse approved learning resources.
- Explore recommendations across different fields.
- Search and discover useful resources.
- Submit resources for review.
- View individual resource details.

### Admin Dashboard
- Secure administrator login and logout.
- Protected admin pages and API routes.
- Dashboard statistics.
- View and manage submitted resources.
- Approve, reject, and delete resources.
- View country-based submission statistics.

## Technology Stack

Frontend
- HTML
- CSS
- JavaScript

Backend
- Node.js
- Express.js

Database
- MongoDB
- Mongoose

Authentication and Security
- JSON Web Tokens (JWT)
- bcrypt password hashing
- HTTP-only cookies
- Login rate limiting
- CSRF protection
- Protected routes and middleware

## Project Structure


Inveni/
├── controller/
├── middlewares/
├── models/
├── routes/
├── views/
│   ├── index.html
│   ├── login.html
│   └── admin/
├── app.js
├── seedAdmin.js
├── package.json
├── .gitignore
└── README.md


## Getting Started

### Requirements
- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas)

### Installation

Clone the repository:


git clone https://github.com/YOUR_USERNAME/inveni.git


Navigate into the project:

cd inveni


Install dependencies:


npm install


### Environment Configuration

Create a `.env` file in the project root:


PORT=3000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

CSRF_SECRET=your_csrf_secret

ADMIN_NAME=your_admin_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password


Keep your `.env` file private. Never commit credentials or secrets to the repository.

### Create the Initial Administrator

Run:


node seedAdmin.js


This creates the initial administrator account using the credentials configured in your environment variables.

### Run the Application

Start the development server:


npm run server


Alternatively:


node app.js


Open the application at:


http://localhost:3000


Administrator login:


http://localhost:3000/login.html


## Database

Inveni uses MongoDB and currently maintains three collections:

- `admins` – Administrator accounts and authentication data.
- `recommendations` – Recommendation records.
- `resources` – Learning resources submitted to the platform.

New submissions go through an approval process before becoming publicly available.

## API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/resources` | GET | Retrieve approved resources |
| `/api/resources/:id` | GET | Retrieve an individual approved resource |
| `/api/resources` | POST | Submit a resource |
| `/api/auth/login` | POST | Administrator login |
| `/api/auth/logout` | POST | Administrator logout |
| `/api/auth/csrf-token` | GET | Generate a CSRF token |
| `/api/admin/dashboard` | GET | Retrieve dashboard statistics |
| `/api/admin/countries` | GET | Retrieve country statistics |

Administrative resource management endpoints are protected by authentication middleware.

## Security

Inveni incorporates several security measures:

- Password hashing with bcrypt.
- JWT-based administrator authentication.
- HTTP-only authentication cookies.
- Login rate limiting.
- Protected administrative routes.
- CSRF protection for administrative operations.
- Environment variables for sensitive configuration.

## Project Status

Inveni is an evolving project. 