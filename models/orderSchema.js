const mongoose = require("mongoose");
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId;

const orderSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  product: [
    {
        id: { type: Schema.Types.ObjectId, ref: 'CartItem' },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
    },
  ],
  orderId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "processing",
  },
  payment_method: {
    required: true,
    type: String,
  },
  addressId: {
    type: Schema.Types.Mixed,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    default: null,
  },
});
const Order = mongoose.model("Order", orderSchema);
module.exports=Order
