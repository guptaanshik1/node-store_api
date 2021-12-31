const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Welcome to the store api",
    });
  } catch (error) {
    console.log(error);
  }
});