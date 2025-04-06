import mongoose, { Schema, Document } from "mongoose";

export interface IStreamer extends Document {
  display_name: string;
  public_address: string;
  milestone_address?: string;
}

const streamerSchema: Schema<IStreamer> = new Schema({
  display_name: { type: String, required: true },
  public_address: { type: String, required: true },
  milestone_address: { type: String, required: false },
});

export default mongoose.model<IStreamer>("Streamer", streamerSchema);
