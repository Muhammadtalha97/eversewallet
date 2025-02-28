import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  type: { type: String, enum: ["SOCIAL", "REFERRAL", "DAILY"], required: true },
  xLink: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema)

