import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from "../controllers/UserController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// Handle all OPTIONS requests for preflight
userRouter.options("*", (req, res) => {
  res.sendStatus(204);
});

userRouter.post("/signup", signup);

userRouter.post("/login", login);

userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
