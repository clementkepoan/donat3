import { Request, Response } from "express";
import Metadata from "../models/metadataModel";
import Streamer from "../models/streamerModel";

export const linkStreamerPlatform = async (req: Request, res: Response) => {
  const {
    id,
    public_address,
    platform,
    name,
    streamername,
    url,
    subscribers,
    image,
  } = req.body;

  console.log(
    "linkStreamerPlatform",
    id,
    public_address,
    platform,
    name,
    streamername,
    url,
    subscribers,
    image
  );

  if (
    !id ||
    !public_address ||
    !platform ||
    !name ||
    !streamername ||
    !url ||
    !subscribers ||
    !image
  ) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if the metadata of platform already exists
    const existingMetadata = await Metadata.findOne({ _id: id, platform });
    if (existingMetadata) {
      console.error("Metadata already exists:", existingMetadata);
      res.status(400).json({ message: "Metadata already exists" });
      return;
    }

    // Create a new metadata entry
    const metadata = await Metadata.create({
      _id: id,
      public_address,
      platform,
      name,
      streamername,
      url,
      subscribers,
      image,
    });

    // Check if a streamer record exists for this public_address
    let streamer = await Streamer.findOne({ public_address });

    // If no streamer record exists, create one
    if (!streamer) {
      streamer = await Streamer.create({
        display_name: streamername, // Use streamername as the display name
        public_address,
      });
      console.log("Created new streamer record:", streamer);
    }

    res.status(200).json({
      message: "Metadata created and linked to streamer successfully",
      metadata,
      streamer,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addWalletDisplayName = async (req: Request, res: Response) => {
  const { public_address, display_name } = req.body;
  console.log("addWalletDisplayName", public_address, display_name);

  if (!public_address || !display_name) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if the streamer already exists
    const existingstreamer = await Streamer.findOne({ public_address });
    if (existingstreamer) {
      console.error("streamer already exists:", existingstreamer);
      res.status(400).json({ message: "Public address already exists" });
      return;
    }

    // Create a new streamer
    const streamer = await Streamer.create({
      display_name,
      public_address,
    });

    res.status(200).json({
      message: "streamer created successfully",
      streamer,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMilestoneAddress = async (req: Request, res: Response) => {
  const { public_address, milestone_address } = req.body;
  console.log("addMilestoneAddress", public_address, milestone_address);

  if (!public_address || !milestone_address) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if the streamer already exists
    const existingstreamer = await Streamer.findOne({ public_address });
    if (!existingstreamer) {
      console.error("streamer does not exist:", existingstreamer);
      res.status(400).json({ message: "Public address does not exist" });
      return;
    }

    // Update the streamer with the milestone address
    const updatedStreamer = await Streamer.findOneAndUpdate(
      { public_address },
      { milestone_address },
      { new: true }
    );

    res.status(200).json({
      message: "Milestone address added successfully",
      updatedStreamer,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
