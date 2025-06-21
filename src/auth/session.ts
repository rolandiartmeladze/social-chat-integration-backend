import passport from "passport";
import { User } from "../models/User";

passport.serializeUser((user: any, done) => {
  console.log(user);
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err, false);
  }
});