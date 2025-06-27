import mongoose, { type Document, Schema } from "mongoose"

export interface ITransaction extends Document {
  _id: string
  userId: mongoose.Types.ObjectId
  bookId: mongoose.Types.ObjectId
  type: "donation" | "purchase"
  points: number
  status: "pending" | "completed" | "failed"
  description: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    type: {
      type: String,
      enum: ["donation", "purchase"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
TransactionSchema.index({ userId: 1 })
TransactionSchema.index({ bookId: 1 })
TransactionSchema.index({ type: 1 })
TransactionSchema.index({ status: 1 })

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)
