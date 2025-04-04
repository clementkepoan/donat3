import { Request, Response } from "express";

export const platformLink = async (req: Request, res: Response) => {
  const { id, platform, name, username, url, subscribers, image } = req.body;
};
