# Territory Walker - Setup Guide

## Overview
Territory Walker is a geospatial tracking application that requires a PostgreSQL database to store user data, paths, claims, and completed circles.

## Quick Start

### 1. Clone and Install Dependencies
```bash
git clone <your-repository-url>
cd territory-walker
npm install
```

### 2. Database Setup

#### Option A: Using Replit (Recommended)
1. Fork or import this project to Replit
2. Go to the "Database" tab in your Replit project
3. Click "Add Database" and select "PostgreSQL"
4. The environment variables will be automatically configured
5. Run the application - database tables will be created automatically

#### Option B: Local PostgreSQL Setup
1. Install PostgreSQL on your system
2. Create a new database:
   ```sql
   CREATE DATABASE territory_walker;
   ```
3. Create a `.env` file based on `.env.example`
4. Configure your database connection (see Environment Variables section)

#### Option C: Cloud Database Providers
You can use any PostgreSQL provider like:
- **Neon** (neon.tech) - Free tier available
- **Supabase** (supabase.com) - Free tier available
- **Railway** (railway.app) - Free tier available
- **AWS RDS**, **Google Cloud SQL**, **Azure Database**

### 3. Environment Variables

Create a `.env` file in the root directory and configure one of the following options:

#### Option 1: Complete DATABASE_URL (Recommended)
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name?sslmode=require
NODE_ENV=development
PORT=5000
```

#### Option 2: Individual PostgreSQL Variables
```bash
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=territory_walker
NODE_ENV=development
PORT=5000
```

### 4. Run the Application
```bash
npm run dev
```

The application will:
- Automatically create all required database tables
- Start the Express server on port 5000
- Serve the React frontend
- Display "Database tables initialized successfully!" in the console

### 5. Access the Application
Open your browser and navigate to:
- **Local development**: http://localhost:5000
- **Replit**: Your project's webview URL

## Database Configuration Examples

### Neon Database
```bash
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Supabase
```bash
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres?sslmode=require
```

### Local PostgreSQL
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/territory_walker
```

## Features

### Core Functionality
- **User Authentication**: Username/email login or anonymous access
- **Real-time Location Tracking**: GPS position tracking with accuracy monitoring
- **Path Management**: Active path tracking and historical path visualization
- **Area Claiming**: 10-meter radius circular area claiming system
- **Circle Completion**: Detection and tracking of completed walking circles
- **Interactive Map**: Leaflet-based map with real-time updates

### Technical Features
- **Automatic Database Initialization**: Tables created automatically on startup
- **Internet Connectivity Handling**: Auto-recovery when connection returns
- **Cross-platform Compatibility**: Works in Replit, local development, and cloud environments
- **Responsive Design**: Mobile-friendly interface with GPS accuracy feedback

## Troubleshooting

### Database Connection Issues
1. **"DATABASE_URL must be set" error**:
   - Ensure your `.env` file exists and contains valid database credentials
   - Check that your database server is running

2. **"relation does not exist" errors**:
   - This should not happen with the automatic initialization
   - If it occurs, check the console for database initialization errors

3. **SSL connection errors**:
   - Add `?sslmode=require` to your DATABASE_URL for cloud databases
   - Use `?sslmode=disable` for local development if needed

### Map Loading Issues
1. **Map not loading**:
   - Check internet connection
   - The app includes automatic retry when connection returns
   - Try refreshing the page

2. **GPS accuracy warnings**:
   - Normal for indoor use or areas with poor GPS signal
   - Move to an open area for better accuracy

### Development Issues
1. **Port already in use**:
   - Change the PORT environment variable in your `.env` file
   - Kill any existing processes using port 5000

2. **Node.js version issues**:
   - Ensure you're using Node.js 18 or higher
   - Use `node --version` to check your current version

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes* | Complete PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PGHOST` | Yes* | PostgreSQL host | `localhost` |
| `PGPORT` | Yes* | PostgreSQL port | `5432` |
| `PGUSER` | Yes* | PostgreSQL username | `postgres` |
| `PGPASSWORD` | Yes* | PostgreSQL password | `your_password` |
| `PGDATABASE` | Yes* | PostgreSQL database name | `territory_walker` |
| `NODE_ENV` | No | Environment mode | `development` or `production` |
| `PORT` | No | Application port | `5000` (default) |

*Either `DATABASE_URL` OR all individual `PG*` variables are required.

## Database Schema

The application automatically creates these tables:
- **users**: User accounts and statistics
- **claims**: Area claims made by users
- **user_paths**: GPS tracking paths and history
- **completed_circles**: Completed walking circles
- **map_view_preferences**: User map settings and preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with a local PostgreSQL database
5. Submit a pull request

## License

This project is licensed under the MIT License.