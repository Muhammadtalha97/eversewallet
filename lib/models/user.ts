import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, sparse: true },
  referralCode: { type: String, unique: true, required: true },
  referredBy: { type: String },
  totalMined: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  miningSpeed: { type: Number, default: 0.458 },
  lastClaimTime: { type: Date },
  dailyBoostStreak: { type: Number, default: 0 },
  lastDailyBoost: { type: Date },
  completedTasks: [
    {
      taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      completedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.models.User || mongoose.model("User", userSchema)

