# ❤️ NestJS + ReactJS Boilerplate ❤️

A modern full-stack boilerplate with authentication, database integration, and modern UI components.

![Tech Stack](https://img.shields.io/badge/tech-stack-ff69b4.svg?style=flat)

## 🚀 Features

### Backend (NestJS)

- 🛡️ **Authentication** with JWT & Passport.js
- 🗄️ **Database** with TypeORM and PostgreSQL
- 📧 **Email** support with Nodemailer
- 🔄 **Caching** with Redis
- 🐳 **Docker** containerization
- 📝 **API Documentation** with Swagger
- ✅ **Input Validation** using class-validator
- 🔒 **Role-based Access Control** (RBAC)
- 📊 **Logging** and error handling

### Frontend (React + Vite)

- ⚡ **Blazing fast** with Vite
- 🎨 **Modern UI** with Shadcn/UI components
- 🔄 **State Management** with React Query
- 🛣️ **Routing** with React Router
- 🎯 **Form Handling** with React Hook Form
- 📱 **Fully Responsive** design
- 🌐 **i18n** ready
- 🎨 **Theme Support** (light/dark mode)

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM
- **Frontend**: React 18, TypeScript, Vite
- **Database**: PostgreSQL
- **Caching**: Redis
- **UI**: Shadcn/UI, Tailwind CSS
- **Authentication**: JWT, Passport.js
- **Containerization**: Docker, Docker Compose
- **Email**: Nodemailer
- **Testing**: Jest, React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PNPM (recommended) or Yarn/NPM

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nestjs-react-boilerplate.git
   cd nestjs-react-boilerplate
   ```

2. **Set up environment variables**

   - Copy `.env.example` to `.env` in both `api-system` and `console` directories
   - Update the environment variables as needed

3. **Start the development environment**

   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d

   # Or start services manually
   # Backend
   cd api-system
   pnpm install
   pnpm run start:dev

   # Frontend (in a new terminal)
   cd console
   pnpm install
   pnpm dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:3000/api
   - Database: PostgreSQL on port 5432
   - Redis: Port 6379

## 📁 Project Structure

```
nestjs-react-boilerplate/
├── api-system/           # NestJS backend
│   ├── src/
│   │   ├── common/       # Shared modules, decorators, etc.
│   │   ├── modules/      # Feature modules
│   │   └── main.ts       # Application entry point
│   └── test/             # E2E tests
│
└── console/              # React frontend
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Page components
        ├── services/     # API services
        └── App.tsx       # Root component
```

## 🔧 Environment Variables

### Backend (api-system/.env)

```env
# App
NODE_ENV=development
PORT=3000
APP_NAME="NestJS API"

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nestjs_boilerplate
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@example.com
```

## 🧪 Running Tests

```bash
# Backend tests
cd api-system
npm run test

# Frontend tests
cd console
npm run test
```

## 🐳 Docker Support

```bash
# Build and start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build -d
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/)
- [React](https://reactjs.org/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
- [TypeORM](https://typeorm.io/)

---

<div align="center">
  Made with ❤️ by Your Name
</div>
