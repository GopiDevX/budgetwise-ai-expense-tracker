# BudgetWise - AI Expense Tracker

![BudgetWise Preview](./frontend/public/favicon.svg)

BudgetWise is a full-stack, AI-powered expense tracking and financial management application. It helps users track their spending, manage budgets, and provides intelligent financial insights using AI.

## 🚀 Live Demo

- **Frontend:** [https://budgetwise-ai-expense-tracker-analyser.vercel.app](https://budgetwise-ai-expense-tracker-analyser.vercel.app)
- **Backend API:** Hosted on Render (Spring Boot)

## 🌟 Key Features

- **Secure Authentication:** OTP-based email verification for signup, login, and password resets.
- **Smart Dashboard:** Comprehensive overview of income, expenses, and current balances.
- **Transaction Management:** Add, edit, and categorize daily financial transactions.
- **Budget Tracking:** Set limits by category and monitor your spending progress.
- **AI Financial Insights:** Powered by Google Gemini AI, offering personalized tips and analysis based on your spending habits.
- **Multi-currency Support:** Dynamic currency symbol integration.
- **Fully Responsive:** Modern, mobile-friendly UI built with React.

## 🛠️ Technology Stack

### Frontend
- **React.js** (Create React App)
- **Styled Components** (for modular, component-level CSS)
- **React Router** (for navigation)
- **Context API** (for state management)
- Hosted on **Vercel**

### Backend
- **Java Spring Boot**
- **Spring Security & JWT** (for stateless authentication)
- **Spring Data JPA** (Hibernate)
- **JavaMailSender** (for OTP email dispatch)
- Hosted on **Render** (via Docker)

### Database & APIs
- **MySQL** (Hosted on Aiven)
- **Google Gemini API** (for AI-generated financial insights)

---

## 💻 Local Development Setup

To run this project locally, you will need **Node.js**, **Java 17+**, and **Maven** installed.

### 1. Clone the repository
```bash
git clone https://github.com/GopiDevX/budgetwise-ai-expense-tracker.git
cd budgetwise-ai-expense-tracker
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create an `.env` file in the root of the `backend` folder and configure the following variables:
   ```env
   # Database Configuration (Aiven MySQL or Local MySQL)
   MYSQL_URL=jdbc:mysql://your-db-host:port/database_name?sslMode=REQUIRED
   MYSQL_USERNAME=your_db_username
   MYSQL_PASSWORD=your_db_password

   # Email Configuration (for OTPs)
   MAIL_USERNAME=your_gmail_address
   MAIL_PASSWORD=your_gmail_app_password

   # AI Configuration
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will run on `http://localhost:8081`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env.local` file (optional for local dev):
   ```env
   REACT_APP_API_URL=http://localhost:8081/api
   ```
4. Start the development server:
   ```bash
   npm start
   ```
   *The frontend will run on `http://localhost:3000`.*

---

## 🚀 Production Deployment

### Backend (Render)
The backend is containerized using Docker.
1. Connect the repository to Render.
2. Select **Docker** as the environment.
3. Set the Root Directory to `backend/`.
4. Add all environment variables (from your local `.env`) into Render's Environment configuration.

### Frontend (Vercel)
1. Import the repository in Vercel.
2. Set the Framework Preset to **Create React App**.
3. Set the Root Directory to `frontend/`.
4. Ensure the `NODE_ENV` behavior in the code automatically detects production and maps API requests to your live Render backend URL.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/GopiDevX/budgetwise-ai-expense-tracker/issues).

## 📝 License

This project is licensed under the MIT License.
