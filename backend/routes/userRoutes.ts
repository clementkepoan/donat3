import express from "express";
import { addWalletDisplayName } from "../controllers/userController";

const router = express.Router();

router.post("/", addWalletDisplayName);

export default router;
