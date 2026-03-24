import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import maidRoutes from "./src/routes/maid.routes.js";
import userRoutes from "./src/routes/user.routes.js"

import { connectDB } from "./src/configs/db.js";

dotenv.config();

const app = express();

app.use(express.json())
app.use(cors());

app.get("/", (req, res) => {
  res.send("backend running")
});

app.use("/api/maids", maidRoutes)
app.use("/api/users" , userRoutes)

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });


  
