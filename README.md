# PowerGrid ⚡

PowerGrid is a comprehensive Electricity Management & Billing System built on the MERN stack (MongoDB, Express, React, Node.js). It provides a robust platform for managing consumers, tracking meter readings, generating bills, processing payments, and handling service complaints.

## 🚀 Key Features

### 👤 For Consumers
- **Dashboard:** Overview of usage analytics, recent bills, and payment status.
- **Bill Management:** View history, download invoices, and pay online.
- **Meter Tracking:** Real-time meter status and reading history.
- **Support:** Register complaints and track service requests.
- **Notifications:** Alerts for bills, outages, and maintenance.

### 👮 For Admins
- **User Management:** Control over consumers and employees.
- **Billing Engine:** Automated bill generation based on configurable tariffs.
- **Analytics:** System-wide reports on consumption and revenue.
- **Infrastructure:** Manage outages, load shedding schedules, and theft detection.

### 👷 For Employees
- **Field Service:** Manage tasks and attendance.
- **Meter Reading:** Tools for recording consumption in the field.
- **Maintenance:** Track inventory and equipment repairs.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Axios, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Multer (local/cloud)

## 📁 Project Structure

```text
powergrid/
├── backend/          # Express API & MongoDB Models
├── client/           # React Frontend (Vite)
├── .gitignore        # Git exclusion rules
├── package.json      # Root scripts for project management
└── README.md         # Documentation
```

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Installation
From the root directory, install all dependencies:
```bash
npm run install:all
```

### 4. Running the Project
Start both the backend and client concurrently:
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 📄 License
This project is private and for educational purposes.
