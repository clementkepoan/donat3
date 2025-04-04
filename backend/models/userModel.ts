import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  display_name: string;
  public_address: string;
}

const userSchema: Schema<IUser> = new Schema({
  display_name: { type: String, required: true },
  public_address: { type: String, required: true },
});

export default mongoose.model<IUser>("User", userSchema);
