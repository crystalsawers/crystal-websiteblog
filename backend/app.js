import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import users from "./routes/users.js";


import { loadEnv } from "./loadEnv.cjs";

loadEnv();

dotenv.config();

const app = express();

const BASE_URL = "api/v1";

const PORT = process.env.PORT;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute, or 60000 milliseconds
  max: 50,
  message:
    "You have exceeded the number of requests per minute: 50. Please try again later",
});

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(limiter);
app.use(cors());

app.use(`/${BASE_URL}/users`, users);


//index route displaying all endpoints
app.get("/", (req, res) => {
  return res.json({
    endpoints: [
      `http://localhost:3000/${BASE_URL}/users`,
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;