import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookingDetails",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["card"],
      required: true
    },

    transactionId: {
      type: String,
      required: true,
      unique: true
    },

    paymentStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success"
    }
  },
  { timestamps: true }
)

const paymentModel = mongoose.model("travel-buddy-payments", paymentSchema)
export default paymentModel
