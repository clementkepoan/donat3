import express from "express";
import { platformLink } from "../controllers/platformController";

const router = express.Router();

router.post("/link", platformLink);

export default router;
