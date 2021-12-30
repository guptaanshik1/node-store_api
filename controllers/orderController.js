const Order = require("../models/order");
const Product = require("../models/product");
// const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  // populate method is used in order to get the name and email of the user who placed the order
  // 1st parameter is the field on which information is required and 2nd parameter are properties which will be displayed

  if (!order) {
    return next(new CustomError("Please check the order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLoggedInUserOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("Please check the order id", 401));
  }

  if (order.length === 0) {
    return res.json("There are no orders");
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) {
    return next(new CustomError("There are no orders", 401));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.orderStatus === "delivered") {
    return next(new CustomError("Order is already marked for delivered", 401));
  }

  order.statusStatus = req.body.orderStatus;
  console.log(order.orderItems)

  // if order is marked delivered then stock also has to be updated and stock is in Product model

  // orderItems can have more than 1 order
  order.orderItems.forEach(async (prod) => {
    await updateProductStock(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

updateProductStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
};

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new CustomError('The order is not found', 400))
    }

    await order.remove()

    res.status(200).json({
        success: true,
        message: "Order has been deleted successfully"
    })
})