import passport from "passport";
import { Strategy as FacebookStrategy, Profile } from "passport-facebook";
import dotenv from "dotenv";
import { upsertOAuthUser } from "../services/userService";

dotenv.config();

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ) => {
    
    try {
      const user = await upsertOAuthUser({
        customId: profile.id,
          name: `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`,
          email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
          avatarUrl: profile.photos?.[0]?.value,
          provider: "facebook"
      })
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));
