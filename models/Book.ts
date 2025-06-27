import mongoose, { type Document, Schema } from "mongoose"

export interface IBook extends Document {
  _id: string
  title: string
  author: string
  isbn: string
  subject: string
  condition: "excellent" | "good" | "fair" | "poor"
  mrp: number
  pointsPrice: number
  description?: string
  images: string[]
  donorId: mongoose.Types.ObjectId
  status: "pending" | "verified" | "sold" | "rejected"
  verifiedBy?: mongoose.Types.ObjectId
  verifiedAt?: Date
  purchasedBy?: mongoose.Types.ObjectId
  purchasedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [100, "Author name cannot be more than 100 characters"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      match: [
        /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
        "Please enter a valid ISBN",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: [
        "Mathematics",
        "Science",
        "English",
        "History",
        "Geography",
        "Computer Science",
        "Physics",
        "Chemistry",
        "Biology",
        "Economics",
        "Other",
      ],
    },
    condition: {
      type: String,
      required: [true, "Book condition is required"],
      enum: ["excellent", "good", "fair", "poor"],
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [1, "MRP must be at least 1"],
    },
    pointsPrice: {
      type: Number,
      default: function () {
        return Math.floor(this.mrp * 0.6) // 60% of MRP
      },
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    images: [
      {
        type: String,
        validate: {
          validator: (v: string) => /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v),
          message: "Please enter a valid image URL",
        },
      },
    ],
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "sold", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    purchasedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    purchasedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
BookSchema.index({ status: 1 })
BookSchema.index({ subject: 1 })
BookSchema.index({ donorId: 1 })
BookSchema.index({ isbn: 1 })

// Calculate points price before saving
BookSchema.pre("save", function (next) {
  if (this.isModified("mrp")) {
    this.pointsPrice = Math.floor(this.mrp * 0.6)
  }
  next()
})

export default mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema)
