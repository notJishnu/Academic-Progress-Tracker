import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/update-profile", protect, updateProfile);
router.delete("/delete-account", protect, deleteAccount);

export default router;
