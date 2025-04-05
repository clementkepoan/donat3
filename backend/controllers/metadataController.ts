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
  const { id, public_address, name, subscribers, image, viewers, description } =
    req.body;

  console.log("addMetadata", req.body);

  if (
    !id ||
    !public_address ||
    !name ||
    !subscribers ||
    !image ||
    !viewers ||
    !description
  ) {
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
      viewers,
      description,
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

export const getStreamersMetadata = async (req: Request, res: Response) => {
  const { amount, searchQuery } = req.body;
  console.log("getStreamers", req.body);

  if (!amount) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const streamers = await metadata
      .find({
        name: { $regex: searchQuery, $options: "i" },
      })
      .limit(amount);

    res.status(200).json({
      message: "Streamers fetched successfully",
      streamers,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOneStreamerMetadata = async (req: Request, res: Response) => {
  const { id } = req.body;
  console.log("getOneStreamer", req.body);

  if (!id) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const streamer = await metadata.findOne({
      _id: id,
    });

    res.status(200).json({
      message: "Streamer fetched successfully",
      streamer,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIDByAddress = async (req: Request, res: Response) => {
  const { public_address } = req.body;
  console.log("getIDByAddress", req.body);

  if (!public_address) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const streamer = await metadata.findOne({
      public_address,
    });

    res.status(200).json({
      message: "Streamer fetched successfully",
      id: streamer?._id,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
