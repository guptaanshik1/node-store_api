const express = require('express')
const router = express.Router()

const {
  createOrder,
  getOneOrder,
  getLoggedInUserOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/orderController");

const { isLoggedIn, customRole } = require('../middlewares/user')

router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/order/:id').get(isLoggedIn, getOneOrder)
router.route('/getorders').get(isLoggedIn, getLoggedInUserOrders);

// admin
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders);

router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder);

module.exports = router