# Full Stack MultiUser Blog Platform

This project was developed as a technical assessment to showcase proficiency across a modern, type-safe full-stack environment. It provides a complete, multi-user blogging platform with centralized content management.

Project Status and Features Implemented
The application is 100% complete, fully styled, and configured for deployment to a live hosted database.

Core Features and Functionality:
Core CRUD Cycle: 
Implements Create (/create), Read (Homepage and Detail Pages), Update (/posts/[slug]/edit), and Delete (via /dashboard) functionality for both Posts and Categories.

Data Filtering: 
The Homepage (/) features functional buttons to filter posts by category instantly.

Admin Hub: 
The Dashboard (/dashboard) centralizes all management tasks, showing numbered lists of content and providing quick links to delete or edit.

UI/UX: 
The design utilizes a professional, responsive grid layout and includes a 3-Section Landing Page structure.

Technical Architecture-
The core strength of this application is its fully type-safe stack:
tRPC over REST/GraphQL: This choice eliminates API boilerplate and ensures end-to-end type safety. The frontend automatically inherits data types from the backend procedures, preventing runtime errors during development.
Drizzle ORM: 
Provides a lightweight, TypeScript-native query builder that allows for complex relational database operations, such as managing the many-to-many relationship between Posts and Categories.
Zod: 
Used for mandatory schema validation, ensuring all user input (e.g., Title and Content minimum lengths) is checked before it interacts with the backend.

# Setup and Deployment Guide
1. Local Development Setup:
To run the project locally, you must first connect it to your live Neon PostgreSQL database.

Clone the Repository:
git clone https://github.com/jyoshika12/blogpost.git
cd blogpost

Install Dependencies:
npm install

Configure Database: 
Obtain your credentials (Host, User, Password, DB Name) from your Neon dashboard. Update your root .env file with these credentials:

Code snippet-
Example Neon Credentials
DB_HOST=your-neon-host
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# Required for Vercel
DATABASE_URL="postgresql://your_username:your_password@your-neon-host-name/your_database_name" 

Migrate Schema: 
Push the database structure to your live server:
npm run db:push

Run Application:
npm run dev

2. Vercel Deployment: 
The application is deployed to Vercel and connected to the live Neon database for production access.
Link Repository: Link the blogpost GitHub repository to your Vercel account.
Set Environment Variable (CRITICAL): During deployment configuration, the DATABASE_URL must be securely added:

Key: DATABASE_URL,
Value: (Paste your full postgresql://... connection string)

Deploy: Vercel will build and launch the application using the live data connection.
