import { Request, Response } from "express";
import User from "../models/userModel";

export const addWalletDisplayName = async (req: Request, res: Response) => {
  const { public_address, display_name } = req.body;
  console.log("addWalletDisplayName", public_address, display_name);

  if (!public_address || !display_name) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ public_address });
    if (existingUser) {
      console.error("User already exists:", existingUser);
      res.status(400).json({ message: "Public address already exists" });
      return;
    }

    // Create a new user
    const user = await User.create({
      display_name,
      public_address,
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
