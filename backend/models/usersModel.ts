import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  display_name: string;
  public_address: string;
}

export interface IBadges extends Document {
  tier: string;
  perks: string;
  target_amount: number;
}

export interface ICumulative_Payment extends IUser {
  amount: number;
}
export interface IMilestone extends Document {
  description: string;
  expiry_date: Date;
  badges: IBadges[];
  cummulative_payment: ICumulative_Payment[];
}

const userSchema: Schema<IUser> = new Schema({
  _id: { type: String, required: true, unique: true },
  display_name: { type: String, required: true },
  public_address: { type: String, required: true },
});

// export default mongoose.model<IUser>("User", userSchema);
