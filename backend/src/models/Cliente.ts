import { Schema, model } from "mongoose";

const ClientSchema = new Schema(
  {
    clientNumber: { type: String, unique: true, index: true },
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
  },
  { timestamps: true },
);

export const Client = model("Client", ClientSchema);
