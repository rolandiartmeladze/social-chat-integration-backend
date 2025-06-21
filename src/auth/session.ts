import passport from "passport";
import { User } from "../models/User";

// [serializeUser] — როცა მომხმარებელი ავტორიზირდება, მისი _id ინახება სესიაში
passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});

// [deserializeUser] — თითოეულ request-ზე ამოაქვს სესიიდან id-ით მომხმარებელი
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err, false);
  }
});
