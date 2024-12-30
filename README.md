# Project Description

## Overview

This project is a comprehensive school management system built with Next.js, TypeScript, and Tailwind CSS. It provides a platform for teachers, students, and parents to manage and track academic activities, including classes, assignments, grades, and attendance. The system is designed to be user-friendly and efficient, offering various features to streamline school management processes.

## Features

### User Roles
- **Admin**: Manage classes, teachers, and students.
- **Teacher**: Create and manage classes, assignments, and grades.
- **Student**: View classes, assignments, and grades.
- **Parent**: Monitor children's progress and view their classes and grades.

### Core Functionality
- **Class Management**: Create, edit, and delete classes. Assign teachers and students to classes.
- **Assignment Management**: Create, edit, and delete assignments. Assign grades to students.
- **Grade Management**: View and manage student grades. Calculate overall grades.
- **Attendance Tracking**: Track and manage student attendance.
- **User Management**: Manage user accounts and roles.

## Technology Stack

### Frontend
- **Next.js**: React framework for building server-side rendered applications.
- **TypeScript**: Typed superset of JavaScript for type safety and better developer experience.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **React Query**: Data-fetching library for managing server state.
- **Radix UI**: Accessible and customizable UI components.

### Backend
- **Next.js API Routes**: Serverless functions for handling API requests.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM library for MongoDB.

### Authentication
- **NextAuth.js**: Authentication library for Next.js applications.

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/school-management-system.git
   cd school-management-system
   ```

2. Install dependencies:
   ```sh
   npm install --legacy-peer-deps
   ```
   Legacy peer deps is required because React 19 isn't fully supported by a bunch of stuff.

3. Set up environment variables:
   Create a `.env.local` file and add your MongoDB URI and other necessary environment variables.

4. Run the development server:
   ```sh
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
