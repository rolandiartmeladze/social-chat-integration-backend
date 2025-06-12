import express from "express";
import passport from "passport";

const router = express.Router();
const app = express();

app.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
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
