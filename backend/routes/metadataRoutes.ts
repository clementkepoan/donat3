import express from "express";
import {
  checkAddressLinked,
  addMetadata,
  getStreamersMetadata,
  getOneStreamerMetadata,
  getIDByAddress,
} from "../controllers/metadataController";

const router = express.Router();

router.post("/check", checkAddressLinked);

router.post("/add", addMetadata);

router.post("/get", getStreamersMetadata);

router.post("/get_one", getOneStreamerMetadata);

router.post("/get_id_by_address", getIDByAddress);

export default router;
