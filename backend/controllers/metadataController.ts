import e, { Request, Response } from "express";
import metadata from "../models/metadataModel";

export const checkAddressLinked = async (req: Request, res: Response) => {
  const { public_address } = req.body;
  console.log("checkAddressLinked", req.body);

  if (!public_address) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if the user already exists
    const existingUser = await metadata.findOne({ public_address });
    if (existingUser) {
      console.error("User already exists:", existingUser);
      res.status(200).json({ exist: true });
      return;
    } else {
      res.status(200).json({ exist: false });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMetadata = async (req: Request, res: Response) => {
  const { id, public_address, name, subscribers, image } = req.body;

  console.log("addMetadata", req.body);

  if (!id || !public_address || !name || !subscribers || !image) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if the user already exists
    const existingUser = await metadata.findOne({ public_address });
    if (existingUser) {
      console.error("User already exists:", existingUser);
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create a new user
    const user = await metadata.create({
      _id: id,
      public_address,
      name,
      subscribers,
      image,
    });
    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStreamers = async;
