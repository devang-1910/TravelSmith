# Overview

TripSmith is an AI-powered travel planning application that provides intelligent travel advice and creates personalized itineraries. The system combines a React frontend with an Express.js backend to deliver two main features: a Travel Explorer for answering travel questions with cited sources, and a Trip Planner for generating detailed day-by-day itineraries. The application leverages OpenAI's GPT models for natural language processing and Tavily's search API for real-time travel information retrieval.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript, built on Vite for development and bundling. The UI is constructed with shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS. State management utilizes React Query (TanStack Query) for server state management and standard React hooks for local state. The frontend follows a component-based architecture with separate pages for different views and reusable UI components.

## Backend Architecture
The server runs on Express.js with TypeScript, providing RESTful API endpoints. The application uses a modular route structure with separate handlers for travel search and trip planning functionality. Data persistence is handled through an in-memory storage system for temporary data caching, with schema validation using Zod. The backend integrates with external APIs including OpenAI for AI responses and Tavily for travel information retrieval.

## Database Design
The system currently uses Drizzle ORM configured for PostgreSQL, though the actual database connection appears to be optional for basic functionality. The schema defines types for travel queries, answers, sources, and itinerary data structures. The application can operate with in-memory storage for development and testing purposes.

## Authentication & Authorization
No authentication system is currently implemented. The application operates as an open service without user accounts or session management.

## API Design
The backend exposes two main endpoints:
- `/api/travel/search` for travel question exploration
- `/api/travel/plan` for trip itinerary generation
Both endpoints accept POST requests with structured JSON payloads and return formatted responses with AI-generated content and source citations.

# External Dependencies

## AI Services
- **OpenAI API**: Used for natural language processing and generating travel advice and itineraries using GPT models
- **Tavily Search API**: Provides real-time travel information and web search capabilities with domain filtering for official sources

## Development Tools
- **Vite**: Frontend build tool and development server with hot module replacement
- **TypeScript**: Type safety across both frontend and backend
- **Drizzle Kit**: Database schema management and migrations

## UI Libraries
- **shadcn/ui**: Complete UI component library built on Radix UI
- **Radix UI**: Accessible component primitives for form controls, dialogs, and navigation
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth UI interactions

## Backend Services
- **Express.js**: Web server framework with middleware support
- **Zod**: Schema validation for API requests and responses
- **React Query**: Server state management and API caching on the frontend

## Infrastructure
- **Neon Database**: Serverless PostgreSQL database service (configured but optional)
- **Replit**: Development environment with built-in deployment capabilities