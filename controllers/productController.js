const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  // image
  let imageArray = [];

  if (!req.files) {
    return next(new CustomError("Images are required to be added", 401));
  }

  for (let i = 0; i < req.files.photos.length; i++) {
    let result = await cloudinary.uploader.upload(
      req.files.photos[i].tempFilePath,
      {
        folder: "products",
      }
    );

    imageArray.push({
      id: result.public_id,
      secure_url: result.secure_url,
    });
  }
  // console.log(imageArray)
  req.body.photos = imageArray;
  req.body.user = req.user.id;
  // console.log(req.body)
  // const {body} = req
  // res.json({body})

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProducts = BigPromise(async (req, res, next) => {
  const resultPerPage = 4;
  const totalProductCount = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();
  // const filteredProductCount = products.length; // WhereClause is a class so product is an object so length will not work

  let products = await productsObj.base; // this will give product.find()
  // console.log(await products.find() === products)
  const filteredProductCount = products.length;

  productsObj.pager(resultPerPage); // this will return number of pages
  products = await productsObj.base.clone(); // an in pager method base is modified so limit() and skip() will be added to products
  // if there is chained query like .find().search() then .clone() has to be used

  res.status(200).json({
    success: true,
    products,
    totalProductCount,
    filteredProductCount,
  });
});

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id", 401));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id"), 400);
  }

  imageArray = [];

  if (req.files) {
    for (let i = 0; i < product.photos.length; i++) {
      const result = await cloudinary.uploader.destroy(product.photos[i].id);
    }

    for (let i = 0; i < product.photos.length; i++) {
      let result = await cloudinary.uploader.upload(
        product.photos[i].tempFilePath,
        {
          folder: "users",
        }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // will give the updated values
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No product found with this id"), 401);
  }

  for (let i = 0; i < product.photos.length; i++) {
    const res = await cloudinary.uploader.destroy(product.photos[i].id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product is deleted successfully",
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  // in which product this rating has to be added
  const product = await Product.findById(productId);
  // console.log(product.reviews)

  if (!product) {
    return next(new CustomError('This product does not exist', 402))
  }
  
  // checking whether user has already made a review or not
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  ); // reviews is an array in db
  // check whether the user in reviews array in db by comparing with the id of logged user's id

  if (alreadyReviewed) {
    // if already reviewed a product then updating review
    product.reviews.forEach((review) => {
      // matching with particular element in array which has this review (alreadyReviewed)
      if (review.user.toString() === review.user._id.toString()) {
        review.comment = comment; // (updating the comment in reviews array with req.body.comment)
        review.rating = rating; // // (updating the rating in reviews array with req.body.rating)
      }
    });
  } else {
    // if not one user does not reviews
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // adjusting the average rating
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validatorBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });

});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  // filtering the reviews array on basis of review being sent by the user
  const reviews = product.reviews.filter((review) => {
    review.user.toString() === req.user._id.toString();
  });

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  const ratings = product.ratings

  const numberOfReviews = reviews.length;

  // updating the product after removin review
  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    product
  })

});

// if in the front end someone requests for one particular thing like only reviews or brands

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id)

  res.status(200).json({
    success: true,
    reviews: product.reviews
  })

})

// exports.getOnlyBrandsOfProducts = BigPromise(async (req, res, next) => {
  
// })