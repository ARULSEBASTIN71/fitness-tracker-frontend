# Fitness Tracker Frontend 🏃‍♂️📊

A modern and responsive frontend for the **Fitness / Calorie Tracking application**, built using **React + Vite**.  
This frontend connects with the backend APIs to handle **authentication, OTP verification, and user interactions**.

---

## 🚀 Features

- User Registration & Login UI
- Forgot Password with OTP Flow
- OTP Display (Dev Mode)
- API Integration with Backend
- Responsive & Clean UI
- Environment-based API Configuration
- Fast Build with Vite
- Production-ready Frontend Setup

---

## 🛠 Tech Stack

- React.js
- Vite
- JavaScript (ES6+)
- HTML5 & CSS3
- Axios / Fetch API
- Vercel (Deployment)

---

## 📂 Project Structure

fitness-tracker-frontend/
│
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ └── utils/
│
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
└── .gitignore


---

## 🔐 Authentication Flow

1. User registers or logs in
2. OTP is sent from backend
3. OTP is entered and verified
4. Token-based authentication is handled
5. User is redirected to protected pages

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
For production:

VITE_API_BASE_URL=https://your-backend-url.com
▶️ Run Locally
npm install
npm run dev
App runs at:

http://localhost:5173
