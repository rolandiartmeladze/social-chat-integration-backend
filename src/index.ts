import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("გამარჯობა Glitch-დან! This is a TypeScript + Node.js app.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
