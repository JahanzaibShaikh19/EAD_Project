# HRFlow — Enterprise HR Management System

## Short Project Description
HRFlow is a comprehensive, full-stack Human Resources Management System developed for the Enterprise Application Development course. It provides a sleek, modern, and highly interactive interface to manage employees, track attendance, handle leave requests, process payroll, and monitor performance goals. Built with performance and user experience in mind, HRFlow streamlines HR workflows into a centralized, efficient platform.

## Features of the Project
- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for HR Administrators and regular Employees.
- **Dashboard Analytics:** Real-time metrics, interactive charts (Recharts), and a GitHub-style attendance heatmap.
- **Employee Management:** Complete CRUD functionality for employee records, including department and position assignment.
- **Attendance Tracking:** Personal attendance logging (Check-in/Check-out) and company-wide attendance monitoring.
- **Leave Management:** Employees can request time off, and HR can approve or reject them with real-time balance calculations.
- **Payroll Processing:** Automated salary calculation, deductions, bonus adjustments, and payslip tracking.
- **Performance Goals (OKRs):** Tracking of employee objectives and key results with dynamic progress bars.
- **Interactive UI/UX:** Built with Glassmorphism design principles, smooth GSAP animations, and fully responsive layouts.
- **Robust Security:** Secure authentication using JWT and password hashing via bcrypt.

## Technologies Used
**Frontend:**
- React (Vite)
- Tailwind CSS (Custom Design System & Glassmorphism)
- React Router DOM
- React Query (TanStack Query)
- GSAP (GreenSock Animation Platform)
- React Hook Form + Zod (Form Validation)
- Recharts (Data Visualization)
- Lucide React (Icons)

**Backend:**
- Node.js
- Express.js
- PostgreSQL (Database)
- JSON Web Tokens (JWT) for secure authentication
- bcryptjs for password hashing

## Environment Variable Details

Create a `.env` file in the `backend` directory with the following keys:
```env
# Server Configuration
PORT=3000

# PostgreSQL Database Configuration
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrflow_db

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key
```

*(Note: The frontend connects to the backend at `http://localhost:3000/api` by default via Vite proxy, so no frontend `.env` is strictly required for local development).*

## Database Setup Instructions
1. Install **PostgreSQL** and ensure the database service is running on your system.
2. Open pgAdmin or your terminal (`psql`) and create a new database named `hrflow_db`.
3. In the `backend` folder, locate the `schema.sql` file. Run this SQL script in your newly created database to construct all necessary tables, triggers, and functions.
4. **(Optional)** Run the `seed.js` script to populate the database with realistic dummy data for testing purposes:
   ```bash
   cd backend
   node seed.js
   ```

## Step-by-Step Instructions to Run the Project

### 1. Backend Setup
Navigate to the backend directory, install the required dependencies, and start the Express server.
```bash
cd backend
npm install
npm run dev
```
*The backend server will start running on `http://localhost:3000`.*

### 2. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the Vite development server.
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will be accessible at `http://localhost:5173`.*

### 3. Accessing the Application
Open your browser and navigate to `http://localhost:5173`. 
You can log in using the credentials you created, or if you ran the seed script, you can use the seeded HR or Employee credentials to explore the system.

---
*Developed for the Enterprise Application Development Course Semester Project.*
