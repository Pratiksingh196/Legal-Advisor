import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true },
  lawyerId: { type: String, required: true },
  clientId: { type: String },
  price: { type: Number },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Meeting", meetingSchema);
