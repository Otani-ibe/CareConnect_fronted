# CareConnect - Senior Care Platform

CareConnect is a modern web application that connects seniors with qualified caregivers for personalized care services. Built with React, TypeScript, and a robust API, it provides a seamless experience for booking and managing care sessions.

##  Project Overview

CareConnect bridges the gap between seniors seeking quality care and professional caregivers. The platform offers an intuitive interface for seniors to find, book, and manage care sessions, while providing caregivers with opportunities to offer their services.

## Features

### For Seniors
- **Find Caregivers**: Browse and search for qualified caregivers in your area
- **Book Sessions**: Schedule care sessions with preferred caregivers
- **Session Management**: View, track, and manage all your care sessions
- **Real-time Messaging**: Communicate directly with caregivers
- **Reviews & Ratings**: Leave feedback after completed sessions
- **Profile Management**: Update personal information and preferences

### For Caregivers
- **Profile Showcase**: Display qualifications, experience, and availability
- **Session Requests**: Receive and respond to session requests
- **Schedule Management**: Manage your availability and bookings
- **Earnings Tracking**: Monitor your income and completed sessions
- **Professional Reviews**: Build your reputation through client feedback

### Platform Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live session status updates and notifications
- **Secure Authentication**: Protected user accounts and data
- **Modern UI/UX**: Clean, intuitive interface built with shadcn/ui
- **API Integration**: Robust backend integration for reliable data management

##  Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Otani-ibe/CareConnect_fronted
   cd careConnect_frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=https://careconnect-z20m.onrender.com/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080/` to view the application

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

### Backend Integration
- **RESTful API** - Secure endpoints for data management
- **JWT Authentication** - Secure user sessions
- **Real-time Updates** - Live data synchronization

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API services
│   ├── api.ts          # API configuration
│   ├── apiServices.ts  # API service functions
│   └── utils.ts        # Utility functions
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Dashboard.tsx   # Dashboard page
│   ├── FindCaregivers.tsx
│   ├── Sessions.tsx    # Sessions management
│   └── Messages.tsx    # Messaging interface
└── main.tsx           # Application entry point
```

##  API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Sessions
- `GET /session` - Get user sessions
- `POST /session/request` - Create session request
- `PUT /session/:id/accept` - Accept session
- `PUT /session/:id/decline` - Decline session
- `PUT /session/:id/cancel` - Cancel session
- `PUT /session/:id/complete` - Complete session

### Caregivers
- `GET /user/caregivers` - Get all caregivers
- `GET /user/caregivers/:id` - Get specific caregiver
- `GET /user/caregivers/search` - Search caregivers

### Messages
- `GET /messages` - Get user messages
- `POST /messages` - Send message

## UI Components

The project uses shadcn/ui components for a consistent and beautiful design:

- **Cards** - Session and caregiver information display
- **Buttons** - Action buttons with various styles
- **Forms** - Input fields and form validation
- **Modals** - Dialog boxes for confirmations
- **Badges** - Status indicators and labels
- **Avatars** - User profile pictures
- **Dropdowns** - Menu options and actions

##  Authentication

The application uses JWT (JSON Web Tokens) for secure authentication:

- **Login/Register** - Secure user account creation
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Token Management** - Automatic token refresh and storage
- **Session Persistence** - Maintains user sessions across browser sessions

## Responsive Design

CareConnect is fully responsive and works on all devices:

- **Desktop** - Full-featured interface with all options
- **Tablet** - Optimized layout for medium screens
- **Mobile** - Touch-friendly interface for smartphones

##  Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **React Team** for the amazing framework
- **Vite** for the fast development experience



**CareConnect** - Connecting seniors with quality care, one session at a time. ❤️
