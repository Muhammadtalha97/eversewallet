import mongoose from "mongoose"

const referralSchema = new mongoose.Schema({
  referrer: { type: String, required: true }, // referral code of the referrer
  referred: { type: String, required: true }, // referral code of the referred user
  rewardClaimed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export const Referral = mongoose.models.Referral || mongoose.model("Referral", referralSchema)

