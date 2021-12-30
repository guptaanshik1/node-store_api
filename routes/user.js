const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  loggedInUserDeatils,
  changePassword,
  updateUserDetails,
  adminGiveAllUsers,
  managerGiveOnlyUsers,
  adminGiveOneUser,
  adminUpdateOneUser,
  adminDeleteOneUser,
} = require("../controllers/userController");

const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset); // token as req.params.token
router.route("/userdashboard").get(isLoggedIn, loggedInUserDeatils);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);

// admin routes
router
  .route("/admin/users")
  .get(isLoggedIn, customRole("admin"), adminGiveAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGiveOneUser)
  .put(isLoggedIn, customRole("admin"), adminUpdateOneUser)
  .delete(isLoggedIn, customRole("admin"), adminDeleteOneUser);

// manager routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerGiveOnlyUsers);

module.exports = router;