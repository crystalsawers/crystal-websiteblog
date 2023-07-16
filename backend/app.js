import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

import users from "./routes/users.js";
import auth from "./routes/auth.js";
import authRoute from "./middleware/authRoute.js";
import profiles from "./routes/profiles.js";
import comments from "./routes/comments.js";
import categories from "./routes/categories.js";
import blogposts from "./routes/blogposts.js";

dotenv.config();

const app = express();
const BASE_URL = "api/v1";
const PORT = process.env.PORT || 3001;
const IP_ADDRESS = process.env.IP_ADDRESS || 'localhost'; // Add this line to get the IP address from an environment variable

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
app.use(compression());

app.use(`/${BASE_URL}/auth`, auth);
app.use(`/${BASE_URL}/users`, users);
app.use(`/${BASE_URL}/profiles`, profiles);
app.use(`/${BASE_URL}/comments`, comments);
app.use(`/${BASE_URL}/categories`, categories);
app.use(`/${BASE_URL}/blogposts`, blogposts);

//index route displaying all endpoints
app.get("/", (req, res) => {
  return res.json({
    endpoints: [
      `http://${IP_ADDRESS}:${PORT}/${BASE_URL}/users`,
      `http://${IP_ADDRESS}:${PORT}/${BASE_URL}/profiles`,
      `http://${IP_ADDRESS}:${PORT}/${BASE_URL}/comments`,
      `http://${IP_ADDRESS}:${PORT}/${BASE_URL}/categories`,
      `http://${IP_ADDRESS}:${PORT}/${BASE_URL}/blogposts`,
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

export default app;
