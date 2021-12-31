const User = require("../models/user");
const BigPromise = require("./bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const { token } =
    req.cookies ||
    req.body ||
    req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return next(new CustomError("Login first to access this page", 401));
  }

  // this token will give access all payload which was sent during generating the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id); // injecting user to te req object

  next();
});

exports.customRole = (...roles) => {
  // roles will be an array containing any one among user admin or manager
  // as the spread operator is used then whatever string coming in the argument will be added in array
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // req.user.role should be admin, manager
      return next(
        new CustomError("You are allowed to access this resource", 403)
      );
    }
    next();
  };

  // if (req.user.role == 'admin') {
  //   next()
  // } else {
  //   return next(
  //     new CoustomError("You are allowed to access this resource", 403)
  //   );
  // }
};