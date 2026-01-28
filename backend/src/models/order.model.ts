import { Schema, model } from "mongoose";

/**
 * Modelo de Pedido (Order)
 */
const orderSchema = new Schema(
  {
    items: [
      {
        producto: {
          type: String,
          required: true,
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
    ],

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
  {
    timestamps: true, // 🔑 crea createdAt y updatedAt automáticamente
  },
);

const Order = model("Order", orderSchema);

export default Order;
