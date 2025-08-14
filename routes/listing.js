const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const {isLoggedIn} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const{isOwner}= require("../middleware.js")
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({storage});


//Index Route
router.get("/", wrapAsync(listingController.index));


//New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);


//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

// Create route 
router.post("/", isLoggedIn,upload.single("listing[image]") ,wrapAsync(listingController.createListing));


// edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


//update Route
router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),wrapAsync(listingController.updateListing));

//Delete Route
router.delete("/:id", isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

module.exports = router;