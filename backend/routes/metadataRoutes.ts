import express from "express";
import {
  checkAddressLinked,
  addMetadata,
  getStreamersMetadata,
  getOneStreamerMetadata,
} from "../controllers/metadataController";

const router = express.Router();

router.post("/check", checkAddressLinked);

router.post("/add", addMetadata);

router.post("/get", getStreamersMetadata);

router.post("/get_one", getOneStreamerMetadata);

export default router;
