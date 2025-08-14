const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken}); 


module.exports.index = async(req,res)=>{
        const allListings = await Listing.find({});
        // currentUser ko explicitly pass kar rahe hain kyunki boilerplate.ejs mein currentUser variable use hota hai navigation ke liye
        res.render("./listings/index.ejs",{allListings, currentUser: req.user});
};

module.exports.renderNewForm =(req, res) => {
    // currentUser ko explicitly pass kar rahe hain kyunki boilerplate.ejs mein currentUser variable use hota hai navigation ke liye
    res.render("listings/new.ejs", { currentUser: req.user }); 
};


module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
      path:"author"
    },
  })
  .populate("owner");
  if(!listing){
    req.flash("error","Listing you are looking for does not exist");
    return res.redirect("/listings");
  }
  // currentUser ko explicitly pass kar rahe hain kyunki boilerplate.ejs mein currentUser variable use hota hai navigation ke liye
  res.render("listings/show.ejs", { listing, currentUser: req.user });
};



module.exports.createListing =async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()


  let url=req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // Set the owner to the currently logged-in user
  newListing.image = {url,filename};
  newListing.geometry = response.body.features[0].geometry; // Set the geometry from the geocoding response

  await newListing.save(); 
  req.flash("success","New listing created Successfully");
  res.redirect("/listings");
};


module.exports.renderEditForm = async(req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  let OriginalImageUrl =  listing.image.url;
  OriginalImageUrl=OriginalImageUrl.replace("/upload","/uploads/h_300/w_250") 
  // currentUser ko explicitly pass kar rahe hain kyunki boilerplate.ejs mein currentUser variable use hota hai navigation ke liye
  // ye error fix karne ke liye kiya gaya tha: "currentUser is not defined"
  res.render("listings/edit.ejs", { listing, OriginalImageUrl, currentUser: req.user });
};


module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file != "undefined"){  
    let url=req.file.path;
    let filename = req.file.filename;
    listing.image={url,filename};
    await listing.save();
  }
  req.flash("success","listing updated Successfully");
  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","listing deleted Successfully");
  res.redirect("/listings");
};

  