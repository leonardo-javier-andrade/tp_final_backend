import { Schema, model } from "mongoose"

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  category: { type: String, default: "Sin categoria" },
  stock: { type: Number, default: 0 },
  available: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true }
}, {
  versionKey: false,
  timestamps: true
})

const Product = model("Product", productSchema)

export { Product }


