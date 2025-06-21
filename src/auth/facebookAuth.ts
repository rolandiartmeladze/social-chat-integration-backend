import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";

dotenv.config();

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      name: profile.name?.givenName + " " + profile.name?.familyName,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
      provider: 'facebook'
    };
    return done(null, user);
  }
));
