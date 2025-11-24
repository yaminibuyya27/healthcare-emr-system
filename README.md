# EMR System (Electronic Medical Records)

A comprehensive Electronic Medical Records system built with React and Node.js, featuring role-based access control for healthcare professionals.

## Features

### Role-Based Dashboards

#### Administrator

- View comprehensive audit trail logs
- Filter logs by table, operation type, and date
- Monitor all system activities
- View detailed change history with old/new values

#### Receptionist

- Manage patient records (create, read, update, search)
- View and manage all appointments
- Schedule new appointments
- Edit and delete appointments
- View patient demographics and contact information

#### Physician/Doctor

- View assigned appointments
- Create and manage prescriptions
- Update prescription details
- Access patient information
- View medication database

### Key Functionality

- **Patient Management**: Complete CRUD operations with search capability
- **Appointment Scheduling**: Full calendar management with status tracking
- **Prescription Management**: Create, view, and update prescriptions
- **Audit Logging**: Comprehensive tracking of all database operations
- **Security**: Role-based access control with permission system

## Tech Stack

### Frontend

- React 18
- React Router DOM
- Axios
- CSS-in-JS (inline styles)

### Backend

- Node.js
- Express.js
- MySQL 8.0
- mysql2 (Promise-based MySQL client)

### Database

- MySQL with stored procedures
- View-based permissions
- Comprehensive audit logging
- Role-based access control

## Prerequisites

- Node.js (v14 or higher)
- MySQL 8.0 or higher
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
# Create .env file with:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=EMR_System

# Start the server
npm start
```

The backend server will start on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## Project Structure

```
EMR_Project2/
├── backend/
│   ├── routes/
│   │   ├── admin.js           # Audit log endpoints
│   │   ├── appointments.js    # Appointment CRUD
│   │   ├── auth.js            # Authentication
│   │   ├── doctors.js         # Doctor data
│   │   ├── medications.js     # Medication data
│   │   ├── patients.js        # Patient CRUD
│   │   └── prescriptions.js   # Prescription CRUD
│   ├── config.js              # Database configuration
│   ├── dbManager.js           # Database operations
│   ├── server.js              # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── AdminDashboard.js      # Admin interface
│   │   ├── DoctorDashboard.js     # Doctor interface
│   │   ├── ReceptionistDashboard.js # Receptionist interface
│   │   ├── Login.js               # Login page
│   │   ├── App.js                 # Main app component
│   │   ├── App.css                # Global styles
│   │   └── api.js                 # API client
│   └── package.json
│
└── README.md
```

## Database Schema

### Core Tables

- `User` - System users
- `Role` - User roles (Administrator, Physician, Receptionist, etc.)
- `User_Role` - User-role mapping
- `Permission` - System permissions
- `Role_Permission` - Role-permission mapping
- `Patient` - Patient records
- `Doctor` - Doctor information
- `Appointment` - Appointment scheduling
- `Prescription` - Prescription records
- `Medication` - Medication database
- `Audit_Log` - System audit trail

### Views

- `vw_user_permissions` - User permissions with roles
