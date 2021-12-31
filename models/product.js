const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true, // removing additional spaces from the end of the product name
    maxlength: [120, "Product name should not be more than 120 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide price for the product"],
    maxlength: [6, "Product price should not be more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide product description"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please select category from - short-sleeves, long-sleeves, sweat-shirts, hoodies",
    ],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
      message:
        "Please select category ONLY from - short-sleeves, long-sleeves, sweat-shirts, hoodies",
    },
  },
  stock: {
    type: Number,
    required: [true, 'Please add a number in stock']
  },
  brand: {
    type: String,
    required: [true, "Please provide a brand for product"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId, // the logged in user's ObjectId will be referenced here
        ref: "User", // the reference of the above id will be coming from User model
        required: true, // whenever there is user then there has to be an user
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    // to see who has added the product
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Product", productSchema);