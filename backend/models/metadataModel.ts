import mongoose, { Schema, Document } from "mongoose";

export interface IMetadata extends Document {
  _id: string;
  public_address: string;
  name: string;
  subscribers: number;
  image: string;
}

const metadataSchema: Schema<IMetadata> = new Schema({
  _id: { type: String, required: true, unique: true },
  public_address: { type: String, required: true },
  name: { type: String, required: true },
  subscribers: { type: Number, required: true },
  image: { type: String, required: true },
});

export default mongoose.model<IMetadata>("Metadata", metadataSchema);
