const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: [true, "Address of user is required"],
    },
    city: {
      type: String,
      required: [true, "City of user is required"],
    },
    phoneNo: {
      type: String,
      required: [true, "Phone number of user is required"],
      length: [10, "Invalid phone number provided"],
      unique: true
    },
    postalCode: {
      type: String,
      required: [true, "Postal code of user is required"],
    },
    state: {
      type: String,
      required: [true, "State of user is required"],
    },
    country: {
      type: String,
      required: [true, "Country of user is required"],
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  paymentInfo: {
    id: {
      type: String,
    },
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  shippingAmount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["processing", "delivered"],
    required: true,
    default: "processing",
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  
});

module.exports = mongoose.model("Order", orderSchema);