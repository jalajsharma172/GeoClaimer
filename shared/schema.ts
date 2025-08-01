import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email"),
  username: text("username").notNull(),
  
  isAnonymous: integer("is_anonymous").default(0),
  totalArea: real("total_area").default(0),
  totalClaims: integer("total_claims").default(0),
  totalCompletedCircles: integer("total_completed_circles").default(0),
  totalPathLength: real("total_path_length").default(0),
  district: text("district"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: real("radius").notNull().default(10),
  area: real("area").notNull(),
  district: text("district"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPaths = pgTable("user_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  pathPoints: text("path_points").notNull(), // JSON array of {lat, lng, timestamp, accuracy}
  pathLength: real("path_length").default(0), // Total length in meters
  area: real("area").default(0), // Area covered by path (width * length)
  isActive: integer("is_active").default(1), // 1 for active, 0 for completed
  district: text("district"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const completedCircles = pgTable("completed_circles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  centerLatitude: real("center_latitude").notNull(),
  centerLongitude: real("center_longitude").notNull(),
  radius: real("radius").notNull(),
  area: real("area").notNull(),
  pathPoints: text("path_points").notNull(), // JSON string of location history that formed the circle
  completionTime: real("completion_time"), // Time taken to complete circle in seconds
  district: text("district"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  createdAt: true,
});

export const insertUserPathSchema = createInsertSchema(userPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompletedCircleSchema = createInsertSchema(completedCircles).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertUserPath = z.infer<typeof insertUserPathSchema>;
export type UserPath = typeof userPaths.$inferSelect;
export type InsertCompletedCircle = z.infer<typeof insertCompletedCircleSchema>;
export type CompletedCircle = typeof completedCircles.$inferSelect;
