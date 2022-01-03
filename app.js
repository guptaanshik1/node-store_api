require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.set("view engine", "ejs");

app.use(morgan("tiny"));

const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");
const payment = require("./routes/payment");
const order = require("./routes/order");

app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("api/v1", payment);
app.use("/api/v1", order);

app.get("/api/v1/signuptest", (req, res) => {
  res.render("signuptest");
});

app.get("/api/v1/addproducts", (req, res) => {
  res.render("addProductsTest");
});

app.get("/api/v1/logintest", (req, res) => {
  res.render("logintest");
});

module.exports = app;