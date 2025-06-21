// [Google OAuth Configuration]
// ეს ფაილი კონფიგურაციას უწევს Passport-ს Google OAuth 2.0 სტრატეგიით.
// გამოიყენება მომხმარებლის იდენტიფიკაციისთვის Google ანგარიშის მეშვეობით.

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { upsertOAuthUser } from "../services/userService";

dotenv.config(); // .env ფაილიდან საჭირო პარამეტრების ჩატვირთვა

// [STRATEGY CONFIGURATION]
// ვუწერთ GoogleStrategy-ს საჭირო პარამეტრებით
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!, // [REQUIRED] Google OAuth client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // [REQUIRED] Google OAuth client secret
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback` // [REQUIRED] Callback URL Google OAuth-ისთვის
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await upsertOAuthUser({
        customId: profile.id,
        email: profile.emails?.[0]?.value || "",
        name: profile.displayName,
        avatarUrl: profile.photos?.[0]?.value,
        provider: "google"
      });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
