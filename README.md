# 🤖 AI Code Review Assistant

An AI-powered full-stack web application that helps developers analyze source code using static analysis and Artificial Intelligence. The application detects potential issues, evaluates code quality, calculates complexity metrics, generates documentation, and stores review history for future reference.

---

## 📌 Project Overview

The AI Code Review Assistant automates the code review process by combining:

- Static Code Analysis (ESLint)
- AI-powered Code Review (Groq LLM)
- Complexity Analysis
- Documentation Generation

Users can paste source code or upload source code files, receive an intelligent review, and access previously analyzed reviews from the history dashboard.

---

## ✨ Features

### 🔐 User Features

- Submit source code manually
- Upload source code files
- AI-powered code review
- Static code analysis
- Complexity analysis
- Auto-generated documentation
- Review history
- Search reviews
- Filter reviews
- View detailed reports
- Delete reviews
- Input validation
- Error handling
- Responsive UI

---

## 🛠 Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Hooks
- Fetch API

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### AI Integration

- Groq API (LLM)

### Static Analysis

- ESLint

---

## 🏗 Project Architecture

```
Frontend (React)
        │
        ▼
Express REST API
        │
        ├────────► ESLint Static Analysis
        │
        ├────────► Complexity Analysis
        │
        ├────────► Documentation Generator
        │
        ├────────► Groq AI Review
        │
        ▼
PostgreSQL Database
```

---

# 📂 Project Structure

```
AI-Code-Review-Assistant/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   ├── database/
│   ├── uploads/
│   ├── .env
│   └── server.js
│
├── README.md
└── package.json
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AI-Code-Review-Assistant.git
```

---

## Backend Setup

```bash
cd backend

npm install

npm start
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/aicode

GROQ_API_KEY=your_groq_api_key
```

---

# 📡 API Endpoints

## Analyze Code

**POST**

```
/api/reviews/analyze
```

Request

```json
{
    "codeText":"console.log('Hello');",
    "language":"JavaScript"
}
```

---

## Get Review History

**GET**

```
/api/reviews/history
```

---

## Get Review Details

**GET**

```
/api/reviews/:id
```

---

## Delete Review

**DELETE**

```
/api/reviews/:id
```

---

# 🗄 Database Schema

## Users

| Column | Type |
|---------|------|
| id | Integer |
| name | Text |
| email | Text |
| password | Text |
| created_at | Timestamp |

---

## Projects

| Column | Type |
|---------|------|
| id | Integer |
| user_id | Integer |
| project_name | Text |
| github_url | Text |
| created_at | Timestamp |

---

## Reviews

| Column | Type |
|---------|------|
| id | Integer |
| project_id | Integer |
| review_type | Text |
| overall_score | Integer |
| summary | Text |
| created_at | Timestamp |

---

## Review Findings

| Column | Type |
|---------|------|
| id | Integer |
| review_id | Integer |
| severity | Text |
| issue | Text |
| explanation | Text |
| suggested_fix | Text |
| file_name | Text |
| line_number | Integer |

---

# 🔄 Workflow

```
User

      │

      ▼

Paste Code / Upload File

      │

      ▼

Backend API

      │

      ├────────► ESLint Analysis

      ├────────► Complexity Analysis

      ├────────► Documentation Generator

      ├────────► Groq AI Review

      ▼

Store Results in PostgreSQL

      ▼

Display Results on Dashboard
```

---

# 🧪 Sample Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Empty Code | Validation Error |
| Valid JavaScript | Review Generated |
| Invalid JavaScript | Parsing Error Displayed |
| Upload Valid File | Analysis Completed |
| Upload Invalid File | Validation Error |
| Search Reviews | Matching Reviews Displayed |
| Filter Reviews | Filtered Results Displayed |
| Delete Review | Review Deleted Successfully |
| View Details | Full Review Displayed |

---

# 📊 Complexity Metrics

The application calculates:

- Cyclomatic Complexity
- Number of Functions
- Number of Classes
- Lines of Code
- File Complexity
- Function Complexity

---

# 🤖 AI Review Includes

- Bug Detection
- Code Smell Analysis
- Performance Suggestions
- Security Recommendations
- Best Practices
- Naming Suggestions
- Documentation Generation
- Refactoring Suggestions

---

# 📈 Future Enhancements

- Multi-language Support
- GitHub Repository Analysis
- GitHub OAuth Login
- Dark/Light Theme
- Charts and Analytics
- Docker Support
- CI/CD Pipeline
- Admin Dashboard
- Team Collaboration

---

# 📸 Screenshots

Add screenshots of:

- Home Page
- Code Submission
- AI Review Results
- Complexity Metrics
- Documentation
- Review History
- View Details
- Search & Filter

---

# 🎯 Learning Outcomes

This project helped in learning:

- React.js
- Node.js
- Express.js
- PostgreSQL
- REST APIs
- AI Integration
- ESLint
- File Uploads
- Database Design
- Error Handling
- Responsive UI Design

---

# 👩‍💻 Author

**Bhavana Aavula**

B.Tech – Electronics and Communication Engineering

AI Code Review Assistant Internship Project

---

# 📄 License

This project was developed for educational and internship purposes.