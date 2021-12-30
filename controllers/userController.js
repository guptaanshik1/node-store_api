const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  // res.send('Signup route')

  let result;
  if (req.files) {
    let file = req.files.photo; // photo has to be in the frontend
    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
  }
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("All fields are required", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });
  // console.log(user.name)
  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("All fields are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  // select password because by default password was set to false so it will not come

  if (!user) {
    return next(new CustomError("Email or password does not match", 400));
  }

  const isPasswordCorrect = await user.isValidatedPassword(password);

  if (!isPasswordCorrect) {
    return next(new CustomError("Email or password does not match", 400));
  }

  cookieToken(user, res);
  console.log(res.cookie);
});

exports.logout = BigPromise(async (req, res, next) => {
  // console.log(res.cookie);
  res.cookie("token", null, {
    // value of 'token' set to null and token will expire at current time
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "You have been logged out successfully",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email does not found", 400));
  }

  const forgotToken = user.getForgotPasswordToken();

  await user.save({ validateBeforeSave: false }); // will not validate all data and will just save

  // creating the url /password/reset/:token
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your browser and hit enter \n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Store - Password Reset Email",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false }); // will not all data and will just save

    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  // /password/reset/:token
  const token = req.params.token;

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  // finding user based on encrypted token in the database as the token will be same
  const user = await User.findOne({
    encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // a query from mongodb
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  // user exists
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new CustomError("Password do not match", 400));
  }

  // now resetting the password
  user.password = password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  // send token or json response
  cookieToken(user, res);
});

exports.loggedInUserDeatils = BigPromise(async (req, res, next) => {
  // req.user.id only if user is loggedIn and route then only can be accessed
  const user = await User.findById(req.user.id);

  res.status(200).json({
    sucess: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  // req.user.id only if user is loggedIn and route then only can be accessed
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  // user will be sending three fields
  // 1. old password 2. password 3. confirm password
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  const isOldPasswordCorrect = await user.isValidatedPassword(oldPassword);

  if (!isOldPasswordCorrect) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new CustomError("Password do not match", 400));
  }

  user.password = newPassword;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const { name, email } = req.body;

  const newData = {
    name,
    email,
  };

  if (!name || !email) {
    return next(new CustomError("Fields cannot be empty", 400));
  }

  if (req.files) {
    const user = await User.findById(req.user.id);

    // accessing the photo from db
    const imageId = user.photo.id;

    // removing the previously uploaded photo
    const response = await cloudinary.uploader.destroy(imageId);

    // updating with the new photo
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );

    newData.photo = {
      // updating the newData object with photo key having these values
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    // update the user with newData
    new: true, // grab new udpated user data
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminGiveAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find(); // this will return an array of all the users

  res.status(200).json({
    success: true,
    users,
  });
});

exports.managerGiveOnlyUsers = BigPromise(async (req, res, next) => {
  // manager will only get information of all users
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});

// admin getting info of any user
exports.adminGiveOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUser = BigPromise(async (req, res, next) => {
  const { email, name, role } = req.body;

  if (!email || !name || !role) {
    return next(new CustomError("All fields are required", 400));
  }

  const newData = {
    email,
    name,
    role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidator: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No Such user found", 401));
  }

  // get image id from user in database
  const imageId = user.photo.id;

  // delete image from cloudinary
  await cloudinary.uploader.destroy(imageId);

  // remove user from databse
  await user.remove();

  res.status(200).json({
    success: true,
  });
});