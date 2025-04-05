import express from "express";
import {
  checkAddressLinked,
  addMetadata,
} from "../controllers/metadataController";

const router = express.Router();

router.post("/check", checkAddressLinked);

router.post("/add", addMetadata);

export default router;
