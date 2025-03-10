# BlissBonds 💖💍

## Matrimony Website Using MERN Stack 🌐💑

### Live Website: [BlissBonds](https://bliss-bonds.web.app)

---

## 📌 Project Description
BlissBonds is a full-stack matrimony website built using the MERN stack. It connects people who are searching for their life partners and provides a seamless experience with features like premium memberships, biodata creation, success stories, and secure payments.

---

## 🚀 Tech Stack
- **Frontend**: React.js, Tailwind CSS, Material Tailwind
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Payment Gateway**: Stripe
- **Hosting**: Firebase (Frontend), Vercel (Backend)

---

## 🔥 Features
- 📝 Create and edit biodata
- ⭐ Premium Membership System
- 💖 Favorite biodata profiles
- 🏆 Success stories section
- 🔐 Secure JWT authentication
- 💳 Stripe payment integration
- 🌍 Responsive UI

---

## 🛠️ Installation

### 1️⃣ Clone the repository:
```bash
git clone https://github.com/your-username/BlissBonds.git
```

### 2️⃣ Install dependencies:
```bash
cd BlissBonds
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root and add:
```env
REACT_APP_API_URL=your_backend_api_url
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
ACCESS_TOKEN_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
```

### 4️⃣ Start the development server
```bash
npm run dev
```

---

## 🎨 UI Components
The UI includes:
- 📸 **Home Page** with a premium member showcase
- 🎠 **Carousel Slider** for better user engagement
- 🔍 **Search & Filter Options** for easy navigation
- 📢 **Success Stories Section** to inspire users
- 🔒 **Secure Payment System** to upgrade to premium

---

## 📂 Project Structure
```
BlissBonds/
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── assets/
│   │   ├── App.js
│   │   ├── index.js
│── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── server.js
│   ├── config/
│── .env
│── package.json
```

---

## 📜 API Endpoints
### 🔹 User Routes
- `POST /users` ➝ Register User
- `GET /users/admin/:email` ➝ Check Admin Role
- `POST /jwt` ➝ Generate Auth Token

### 🔹 Biodata Routes
- `POST /create-edit-biodata` ➝ Create/Edit Biodata
- `GET /get-create-edit-biodata/:email` ➝ Get User Biodata
- `PATCH /update-biodata/:email` ➝ Update Biodata

### 🔹 Premium Membership
- `POST /request-premium` ➝ Request Premium Membership
- `PATCH /approve-premium/:id` ➝ Approve Membership

### 🔹 Payment System
- `POST /store-payment` ➝ Store Payment Data
- `PATCH /approve-payment/:id` ➝ Approve Payment

### 🔹 Success Stories
- `POST /success-stories` ➝ Add Success Story
- `GET /success-stories` ➝ Get All Success Stories

---

## 🤝 Contribution
Feel free to fork this repository and submit pull requests! 😊

---

## 📝 License
This project is licensed under the MIT License.

---

### Made with ❤️ by BlissBonds Team 
