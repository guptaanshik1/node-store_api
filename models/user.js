const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // importing package from node

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name"],
    maxlength: [40, "Name should not be more than 40 characters"],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Email should be in proper format"],
    required: [true, "Please enter the email"],
    unique: true
  },
  password: {
    type: String,
    minlength: [6, "Password should be more than 5 characters"],
    required: [true, "Please enter the password"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// pre is a hook and save is the event
userSchema.pre("save", async function (next) {
  // if password field is being modified then only hash will be created otherwise not
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isValidatedPassword = async function (userEnteredPassword) {
  return await bcrypt.compare(userEnteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id /** email: this.email **/ },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

userSchema.methods.getForgotPasswordToken = function () {

  // creating a random long string
  const forgotToken = crypto.randomBytes(20).toString("hex");
  // forgotToken will be sent to the user when user asks for changing password

  this.forgotPasswordToken = crypto // this will be saved in database
    .createHash("sha256") // hashing algorithm to be used
    .update(forgotToken) // the field of which hash has to be created
    .digest("hex");

  // when user asks for to change password token will be generated and hash of it will
  // be stored in the database.
  // so when the user sends the new password the token he will sent will be compared
  // with the hash of that token stored in the database

  this.forgotPasswordExpiry = Date.now + 20 * 60 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model('User', userSchema)