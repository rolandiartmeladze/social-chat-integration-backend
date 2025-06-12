import express from "express";
import passport from "passport";
import dotenv from "dotenv";


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
    res.redirect(`${process.env.FRONTEND_URL}/user/messages`);
  }
);


router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.redirect(`${process.env.FRONTEND_URL}/auth/sign-in`);
  });
});

export default router;
