<div align="center">

# 🍔 FOODORA

### Sri Lankan Food Delivery Platform

**A modern full-stack food delivery application designed for the Sri Lankan market.**

![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<br>

![GitHub repo size](https://img.shields.io/github/repo-size/SilvaDeShakila/FOODORA?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/SilvaDeShakila/FOODORA?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/SilvaDeShakila/FOODORA?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/SilvaDeShakila/FOODORA?style=flat-square)

**[Explore the Repository](https://github.com/SilvaDeShakila/FOODORA)**

</div>

---

## 🌟 Overview

**FOODORA** is a full-stack food delivery web application inspired by modern online ordering platforms.

Designed with the Sri Lankan food delivery experience in mind, FOODORA brings together customers, restaurant owners, delivery riders, and administrators within a unified application.

The project explores responsive frontend design, role-based authentication, REST APIs, order management, and real-time communication.

> **Project status:** Portfolio and development project. Production readiness, security, and complete feature behavior require further testing and review.

---

## ✨ Features

### 🛒 Customer Experience

- Restaurant discovery and browsing
- Restaurant menus and food details
- Shopping cart management
- Checkout interface
- Order history and account management
- Order status and tracking interfaces
- Promotions and offers
- Responsive layouts for different screen sizes

### 🏪 Restaurant Owner Dashboard

- Dedicated restaurant owner interface
- Restaurant and menu management workflows
- Order management interfaces
- Restaurant operations dashboard

### 🛵 Delivery Rider Dashboard

- Dedicated rider interface
- Delivery-related workflows
- Order status management
- Route and map interface components

### 🛡️ Administration

- Administrative dashboard
- User and platform management routes
- Restaurant and order administration workflows

### ⚡ Backend Architecture

- Node.js and Express backend
- TypeScript-based application structure
- REST API routes
- JWT-based authentication implementation
- Password hashing with bcrypt
- Role-based access middleware
- Socket.IO service integration
- JSON-file persistence for local development

> Some features are implemented as interfaces or development workflows and may require additional configuration, integration, or testing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS and responsive UI components |
| Backend | Node.js, Express, TypeScript |
| Authentication | JWT, bcrypt |
| Real-time communication | Socket.IO |
| Data persistence | Local JSON files |
| Testing | API test files |
| Version control | Git and GitHub |

---

## 🏗️ Project Structure

```text
FOODORA/
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   └── services/
│
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── tests/
│   └── api.test.ts
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/SilvaDeShakila/FOODORA.git
```

**2. Navigate to the project**

```bash
cd FOODORA
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file based on `.env.example`.

On Windows CMD:

```cmd
copy .env.example .env
```

Update the configuration with appropriate values for your local environment. Never commit real credentials.

### Development

Start the development server:

```bash
npm run dev
```

The project uses a TypeScript server entry point (`server.ts`).

### Build

Generate the frontend production build:

```bash
npm run build
```

### Testing

Run the API tests:

```bash
npm run test
```

### Type Checking

Check TypeScript types:

```bash
npm run lint
```

### Seed Data

To run the data seeding script:

```bash
npm run seed
```

> **Note:** Seeding may create or modify local application data. Review the seed script before running it.

---

## 🔐 Security Considerations

FOODORA includes authentication and authorization-related backend components.

Security practices for development and deployment include:

- Keep JWT secrets in environment variables.
- Never publish `.env` files containing real credentials.
- Avoid committing user records and private application data.
- Validate API inputs and enforce role-based authorization.
- Use strong, unique secrets for deployment.
- Review authentication and authorization behavior before production use.

**Important:** This repository is intended for development and portfolio demonstration. A production deployment requires further security assessment.

---

## 💾 Data Storage

The project uses JSON-file persistence for local application data.

This approach is convenient for development but has limitations involving concurrent writes, scalability, durability, and production hosting.

A production-oriented deployment would benefit from a dedicated database and suitable data migration strategy.

---

## 🧪 Testing

The repository includes API test source files under:

```text
tests/
```

Available test commands can be checked through the scripts defined in `package.json`.

Testing and build validation should be completed before treating a release as production-ready.

---

## 🗺️ Future Improvements

Potential future enhancements include:

- Persistent database integration
- Improved automated testing and CI
- Production deployment configuration
- Payment gateway integration
- Enhanced live delivery tracking
- Performance and accessibility improvements
- Expanded monitoring and error reporting

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request.

For bugs or suggestions, open an issue in the GitHub repository.

---

## 📄 License

No license has been specified for this repository yet.

Unless a license is added, the source code remains subject to the repository owner's applicable copyright rights.

---

## ⭐ Support

If you find FOODORA interesting, consider giving the repository a ⭐ on GitHub.

<div align="center">

### 🍔 FOODORA

**Built with a focus on modern web development and the Sri Lankan food delivery experience.**

[GitHub Repository](https://github.com/SilvaDeShakila/FOODORA)

</div>
