import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import users from "./routes/users.js";
import profiles from "./routes/profiles.js";
import comments from "./routes/comments.js";
import categories from "./routes/categories.js";
import blogposts from "./routes/blogposts.js";

dotenv.config();

const app = express();
const BASE_URL = "api/v1";
const PORT = process.env.PORT || 3001;

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
app.use(helmet());

app.use(`/${BASE_URL}/users`, users);
app.use(`/${BASE_URL}/profiles`, profiles);
app.use(`/${BASE_URL}/comments`, comments);
app.use(`/${BASE_URL}/categories`, categories);
app.use(`/${BASE_URL}/blogposts`, blogposts);

//index route displaying all endpoints
app.get("/", (req, res) => {
  return res.json({
    endpoints: [
      `http://localhost:${PORT}/${BASE_URL}/users`,
      `http://localhost:${PORT}/${BASE_URL}/profiles`,
      `http://localhost:${PORT}/${BASE_URL}/comments`,
      `http://localhost:${PORT}/${BASE_URL}/categories`,
      `http://localhost:${PORT}/${BASE_URL}/blogposts`,
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;