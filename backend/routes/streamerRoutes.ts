import express from "express";
import {
  linkStreamerPlatform,
  addMilestoneAddress,
  addWalletDisplayName,
} from "../controllers/streamerController";

const router = express.Router();

router.post("/link", linkStreamerPlatform);
router.post("/", addWalletDisplayName);
router.post("/milestone", addMilestoneAddress);

export default router;
