import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  subject: string;
  durationMinutes: number;
  ratePerHour: number;
  title: string;
  description: string;
  tutor?: mongoose.Types.ObjectId;
  price: number;
  duration: number;
  isAvailable: boolean;
}

const sessionSchema = new Schema<ISession>(
  {
    subject: {
      type: String,
      required: [true, "subject is required"],
      unique: true,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 30,
      max: 120,
      default: 60,
    },
    ratePerHour: {
      type: Number,
      required: true,
      min: 0,
      default: 250,
    },
    title: {
      type: String,
      default: function (this: ISession) {
        return this.subject || "";
      },
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    tutor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    price: {
      type: Number,
      default: function (this: ISession) {
        return this.ratePerHour || 250;
      },
      min: 0,
    },
    duration: {
      type: Number,
      default: function (this: ISession) {
        return this.durationMinutes || 60;
      },
      min: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

sessionSchema.set("toJSON", {
  transform(_doc, ret: any) {
    ret.id = ret._id;
    ret.durationMinutes = ret.durationMinutes ?? ret.duration;
    ret.ratePerHour = ret.ratePerHour ?? ret.price;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
