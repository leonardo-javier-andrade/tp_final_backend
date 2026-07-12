import { Schema, model } from "mongoose"

// schema para crear el módelo
const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
  versionKey: false,
  timestamps: true
})

// modelos para utilizar la db
const User = model("User", userSchema)

export { User }