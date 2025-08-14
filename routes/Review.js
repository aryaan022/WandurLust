const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn ,isReviewAuthor} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ReviewController = require("../controllers/review.js");


//Reviews :
router.post("/",isLoggedIn,wrapAsync(ReviewController.postReview));

//Delete Reviews Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(ReviewController.deleteReview));

module.exports = router;
 