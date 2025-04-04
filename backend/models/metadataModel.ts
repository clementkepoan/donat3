import mongoose, { Schema, Document } from "mongoose";

export interface IMetadata extends Document {
  _id: string;
  platform: number; // 1 for youtube, 2 for twitch
  name: string;
  username: string;
  subscribers: number;
  image: string;
}

const metadataSchema: Schema<IMetadata> = new Schema({
  _id: { type: String, required: true, unique: true },
  platform: { type: Number, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  subscribers: { type: Number, required: true },
  image: { type: String, required: true },
});

export default mongoose.model<IMetadata>("Metadata", metadataSchema);
