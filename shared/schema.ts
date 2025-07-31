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
  radius: real("radius").notNull().default(100),
  area: real("area").notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type Claim = typeof claims.$inferSelect;
