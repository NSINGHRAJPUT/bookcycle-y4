import mongoose, { type Document, Schema } from "mongoose"

export interface INotification extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      maxlength: [500, "Message cannot be more than 500 characters"],
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
NotificationSchema.index({ userId: 1 })
NotificationSchema.index({ isRead: 1 })
NotificationSchema.index({ createdAt: -1 })

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
