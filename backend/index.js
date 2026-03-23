import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./src/configs/db.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

connectDB()

app.get("/", (req, res) => {
  res.send("backend running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("backend running on port 5000");
});
