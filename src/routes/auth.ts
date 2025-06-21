import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { isAuthenticated } from "../middlewares/isAuthenticated";


const router = express.Router();
dotenv.config();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/auth/sign-in`,
    session: true
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.get("/facebook", passport.authenticate("facebook", {
  scope: ["email"]
}));

router.get("/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.FRONTEND_URL}/auth/sign-in`,
    session: true,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.get("/me", isAuthenticated, (req, res) => {
  const user = req.user;
  res.json(user);
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Failed to destroy session' });

      res.clearCookie('connect.sid');
      res.redirect(`${process.env.FRONTEND_URL}`);
    });
  });
});


export default router;
