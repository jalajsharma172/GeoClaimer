import { db } from './db';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create UUID extension if it doesn't exist
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT,
        username TEXT NOT NULL,
        is_anonymous INTEGER DEFAULT 0,
        total_area REAL DEFAULT 0,
        total_claims INTEGER DEFAULT 0,
        total_completed_circles INTEGER DEFAULT 0,
        total_path_length REAL DEFAULT 0,
        district TEXT,
        city TEXT,
        country TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create claims table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS claims (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius REAL NOT NULL DEFAULT 10,
        area REAL NOT NULL,
        district TEXT,
        city TEXT,
        country TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create user_paths table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_paths (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        username TEXT NOT NULL,
        path_points TEXT NOT NULL,
        path_length REAL DEFAULT 0,
        area REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        district TEXT,
        city TEXT,
        country TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create completed_circles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS completed_circles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL,
        username TEXT NOT NULL,
        center_latitude REAL NOT NULL,
        center_longitude REAL NOT NULL,
        radius REAL NOT NULL,
        area REAL NOT NULL,
        path_points TEXT NOT NULL,
        completion_time REAL,
        district TEXT,
        city TEXT,
        country TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create map_view_preferences table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS map_view_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id) NOT NULL UNIQUE,
        location_history TEXT NOT NULL DEFAULT '[]',
        is_circle_complete INTEGER DEFAULT 0,
        circle_center TEXT,
        map_zoom REAL DEFAULT 15,
        map_center TEXT,
        is_tracking INTEGER DEFAULT 0,
        last_position TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Database tables initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}