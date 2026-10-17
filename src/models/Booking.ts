import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  sessionId: mongoose.Types.ObjectId | string;
  tuteeId: mongoose.Types.ObjectId | string;
  time: string;
  durationMinutes: number;
  status: string;
  requestedAt: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    sessionId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tuteeId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 30,
      max: 120,
    },
    status: {
      type: String,
      default: "Confirmed",
    },
    requestedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  { timestamps: true }
);

bookingSchema.set("toJSON", {
  transform(_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
