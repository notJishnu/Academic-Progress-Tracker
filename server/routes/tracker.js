import express from "express";
import { protect } from "../middleware/protect.js";
import {
  getSections, createSection, deleteSection,
  getGoals, createGoal, toggleGoal, deleteGoal,
} from "../controllers/trackerController.js";

const router = express.Router();
router.use(protect);

router.route("/sections").get(getSections).post(createSection);
router.route("/sections/:id").delete(deleteSection);
router.route("/goals").get(getGoals).post(createGoal);
router.route("/goals/:id/toggle").patch(toggleGoal);
router.route("/goals/:id").delete(deleteGoal);

export default router;
