import { Schema, model } from "mongoose";

const ClientSchema = new Schema(
  {
    clientNumber: { type: String, unique: true, index: true },

    nombre: { type: String, required: true, trim: true },

    // Guardamos el correo normalizado (minúsculas) para evitar duplicados por mayúsculas.
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // ✅ Nuevo: controla si el cliente puede hacer pedidos
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Client = model("Client", ClientSchema);
