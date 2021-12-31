const mongoose = require("mongoose");

const connectWithDb = () => {
    
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Successfully connected with the database"))
    .catch((error) => {
      console.log("Error connecting to the database");
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDb