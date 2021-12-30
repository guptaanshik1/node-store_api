const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

// if someone requests the public key
exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    stripekey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  // paymentIntent will be a large object
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    // optional
    metadata: { integration_check: "accept_a_payment" },
  });

  // if payment is not captured then metadata will not be created
  res.ststus(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
    // id if has to be sent
  });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    success: true,
    amount: req.body.amount,
    stripekey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const myOrder = instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt: "receipt#1",
  });

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    order: myOrder,
  });
});