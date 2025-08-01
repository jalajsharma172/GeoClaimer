# Territory Walker - Full Stack Web Application

## Overview

Territory Walker is a location-based web application that allows users to claim geographic territories using GPS coordinates. Built as a full-stack application with a React frontend and Express backend, it features real-time location tracking, territory management, and competitive leaderboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **Map Integration**: Leaflet for interactive mapping (dynamically imported)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: In-memory storage with fallback to database
- **API Design**: RESTful API endpoints

### Database Schema
The application uses two main entities:
- **Users**: Stores user information, authentication status, location data, and statistics
- **Claims**: Stores territory claims with GPS coordinates, areas, and location metadata

## Key Components

### Authentication System
- Supports both registered users (with email) and anonymous users
- Simple username-based authentication
- Session persistence in localStorage for client-side state management

### Location Services
- Real-time GPS tracking using browser geolocation API
- High-accuracy positioning with configurable timeout and caching
- Error handling for permission denial and GPS unavailability

### Territory Management
- Circle-based territory claims with radius-based area calculation
- Overlap detection using Haversine formula for distance calculations
- Geographic location enrichment (district, city, country assignment)

### Leaderboard System
- Multi-scope rankings: district, city, and country levels
- Real-time statistics tracking (total area claimed, number of claims)
- Competitive ranking system with user position tracking

### Map Interface
- Interactive map using Leaflet with dynamic loading
- Visual representation of claimed territories
- Real-time position tracking and territory visualization

## Data Flow

1. **User Authentication**: Users log in with username/email → session created → user data stored in localStorage
2. **Location Tracking**: GPS permission requested → continuous position monitoring → accuracy feedback
3. **Territory Claiming**: User initiates claim → overlap detection → area calculation → database storage → UI update
4. **Leaderboard Updates**: Claims trigger statistics recalculation → leaderboard positions updated → real-time display

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries and migrations
- **@tanstack/react-query**: Server state management and caching
- **leaflet**: Interactive mapping functionality

### UI Framework
- **@radix-ui/**: Comprehensive UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite development server with HMR (Hot Module Replacement)
- Express server with middleware for API routes
- In-memory storage for rapid development iteration

### Production Build
1. Frontend built using Vite → static assets in `dist/public`
2. Backend bundled using esbuild → Node.js executable in `dist`
3. Database migrations applied using Drizzle Kit
4. Single deployment artifact with both frontend and backend

### Database Management
- PostgreSQL as primary database (configured for Neon DB)
- Drizzle migrations for schema management
- Connection pooling and serverless-optimized queries

### Environment Configuration
- Database URL required for production deployment
- Replit-specific development enhancements and error handling
- Environment-based feature toggles for development vs production

## Recent Changes (August 2, 2025)

### Migration to Replit Environment (August 2, 2025)
- ✓ Successfully migrated from Replit Agent to standard Replit environment
- ✓ Resolved cross-env dependency and Express server startup issues
- ✓ Migrated from MemStorage to PostgreSQL DatabaseStorage
- ✓ Created map_view_preferences table for storing MapView interface props
- ✓ Added comprehensive API endpoints for MapView state persistence
- ✓ Implemented complete database schema with user preferences

### Path Persistence Improvements (August 2, 2025)
- ✓ Fixed map refresh path loss issue by implementing robust path persistence
- ✓ Added automatic path saving every 5 GPS points (down from 10)
- ✓ Implemented time-based path saving every 30 seconds
- ✓ Added page unload protection with keepalive fetch requests
- ✓ Added tab visibility change detection for better path preservation
- ✓ Improved path restoration on page reload from database
- ✓ Enhanced total area calculation updates based on travel distance

### Completed Implementation
- ✓ Built complete GPS-based territory claiming game
- ✓ Implemented user authentication (email or anonymous)
- ✓ Added real-time GPS tracking with high-accuracy positioning
- ✓ Created interactive Leaflet map with territory visualization
- ✓ Built territory claiming system with 100m radius circles
- ✓ Added overlap detection using Haversine formula
- ✓ Implemented leaderboard system (district, city, country scopes)
- ✓ Connected to PostgreSQL database for persistent storage
- ✓ Added area statistics and achievement tracking
- ✓ Fixed login validation issues and database schema
- ✓ Migrated to DatabaseStorage with MapView preferences

### Current Status
The Territory Walker game is fully functional with:
- Live GPS tracking and position display
- Territory claiming with overlap prevention
- Multi-level leaderboards and rankings
- Responsive UI with modern design
- Full database persistence for all game data and user preferences
- MapView state storage in database for seamless user experience

### Database Schema
- **users**: Core user information and statistics
- **claims**: Territory claims with GPS coordinates
- **user_paths**: User movement paths and tracking data
- **completed_circles**: Completed territory circles
- **map_view_preferences**: MapView interface state and preferences per user

### Known Issues
- All previous issues have been resolved
- Drizzle Kit version compatibility (working with manual schema deployment)