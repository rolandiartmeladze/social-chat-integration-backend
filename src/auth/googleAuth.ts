// [Google OAuth Configuration]
// ეს ფაილი კონფიგურაციას უწევს Passport-ს Google OAuth 2.0 სტრატეგიით.
// გამოიყენება მომხმარებლის იდენტიფიკაციისთვის Google ანგარიშის მეშვეობით.

import passport from "passport";
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config(); // .env ფაილიდან საჭირო პარამეტრების ჩატვირთვა

// [STRATEGY CONFIGURATION]
// ვუწერთ GoogleStrategy-ს საჭირო პარამეტრებით
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!, // [REQUIRED] Google OAuth client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // [REQUIRED] Google OAuth client secret
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback` // [REQUIRED] Callback URL Google OAuth-ისთვის
  }, async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
  // [VERIFY FUNCTION]
  // ამ ფუნქციაში შეგიძლიათ მოახდინოთ:
  // - მომხმარებლის მონაცემების შენახვა ბაზაში
  // - არსებული მომხმარებლის მოძებნა
  // - მომხმარებლის session ინფორმაციის გადაცემა

  // ამჟამად პირდაპირ ვაბრუნებთ პროფილს (არა უსაფრთხო პროდაქშენისთვის!)
  try {

    let user = await User.findOne({ customId: profile.id });

    if(!user) { 
      user = await User.create({
        customId: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName,
        avatarUrl: profile.photos?.[0].value
      });
    }
    return done(null, user);

  } catch (error) {
    done(Error);
  }

}
));

// [SESSION MANAGEMENT]

// [SERIALIZE]
// როდესაც ავტორიზაცია წარმატებით სრულდება, ეს ფუნქცია იძახება
passport.serializeUser((user: Express.User, done) => {
  // აქ შეგვიძლია შევინახოთ მხოლოდ user.id, ან სხვა იდენტიფიკატორი session-ში
  done(null, user);
});

// [DESERIALIZE]
// ყოველი მოთხოვნის დროს, ეს ფუნქცია იძახება session-იდან მომხმარებლის ინფორმაციის ამოსაღებად
passport.deserializeUser((user: Express.User, done) => {
  // ჩვეულებრივ ხდება ბაზიდან მოძებნა user.id-ით და მისი დატვირთვა
  done(null, user);
});
