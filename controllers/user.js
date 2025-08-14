const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.SignupForm = (req,res)=>{
    // currentUser ko explicitly pass kar rahe hain kyunki boilerplate.ejs mein currentUser variable use hota hai navigation ke liye
    res.render("user/signup.ejs", { currentUser: req.user })
};


module.exports.Signup = async(req,res)=>{
    try{
        let{username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/listings");
        })
    }catch(err){
        req.flash("error",err.message)
        res.redirect("/signup");
    }
};

module.exports.LoginForm = (req,res)=>{

    // currentUser ko explicitly pass kar rahe hain kyunki boilerplate.ejs mein currentUser variable use hota hai navigation ke liye
    res.render("user/login.ejs", { currentUser: req.user });
};


module.exports.Login =async(req,res)=>{
        req.flash("success","Welcome  back to Wanderlust You are logged in");
        res.redirect(res.locals.redirectUrl || "/listings");
};



module.exports.Logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You have successfully logged out");
        res.redirect("/listings");
    })
};