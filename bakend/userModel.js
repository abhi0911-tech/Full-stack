import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  
  city: String,
  email: { type: String, unique: true },
  password: String 
}, { timestamps: true });

export default mongoose.model("User", userSchema);
