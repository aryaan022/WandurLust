const Listing = require("./models/listing");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error","You must be logged in to create listing");
    return res.redirect("/login ");
  }
  next();
};


module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}


module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    // populate owner karna zaroori hai kyunki listing.owner._id access karne ke liye owner field ko populate karna padta hai
    let listing = await Listing.findById(id).populate("owner");
    // currentUser._id ki jagah req.user._id use kar rahe hain kyunki currentUser middleware mein defined nahi hai
    if(!listing.owner._id.equals(req.user._id)){
    req.flash("error","you do not have permission to edit the listing.");
    return res.redirect(`/listings/${id}`);
  }
  next();
}; 

module.exports.isReviewAuthor = async(req,res,next)=>{
  let{id,reviewId} = req.params;
  // populate author karna zaroori hai kyunki review.author._id access karne ke liye author field ko populate karna padta hai
  let review = await Review.findById(reviewId).populate("author");
  if(!review.author._id.equals(req.user._id)){
    req.flash("error","You are not authorized to delete this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};