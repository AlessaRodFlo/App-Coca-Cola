import { Schema, model, Types } from "mongoose";

/* ===============================
   SUBESQUEMA: ITEM DEL PEDIDO
================================ */
const ItemSchema = new Schema(
  {
    producto: {
      type: String,
      required: true,
      trim: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

/* ===============================
   ESQUEMA PRINCIPAL: PEDIDO
================================ */
const PedidoSchema = new Schema(
  {
    // 🔧 AHORA ES OPCIONAL
    client: {
      type: Types.ObjectId,
      ref: "Client",
      required: false,
    },

    // 🔑 IDENTIFICADOR REAL QUE USA TU APP
    clientNumber: {
      type: String,
      required: true,
    },

    items: {
      type: [ItemSchema],
      required: true,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pendiente", "atendido"],
      default: "pendiente",
    },
  },
  { timestamps: true },
);

export default model("Pedido", PedidoSchema);
