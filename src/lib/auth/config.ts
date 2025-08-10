import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/schema";
import { db } from "..";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
    },
  }),
  
  // Basic configuration
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true untuk production
    minPasswordLength: 8,
  },
  
  // User configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "cashier",
        required: false,
      },
      phone: {
        type: "string", 
        required: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        required: false,
      },
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  
  // Security settings
  advanced: {
    generateId: () => {
      // Use nanoid or similar
      return crypto.randomUUID();
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  
  // Rate limiting
  rateLimit: {
    window: 60, // 1 minute
    max: 100, // 100 requests per window
  },
});

export type Session = typeof auth.$Infer.Session;