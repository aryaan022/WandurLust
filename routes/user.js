const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserController = require("../controllers/user.js");


router.get("/signup",UserController.SignupForm);


router.post("/signup",wrapAsync(UserController.Signup));


router.get("/login",UserController.LoginForm);

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local",{
        failureRedirect: "/login", 
        failureFlash:true
    }),wrapAsync(UserController.Login)
);




router.get("/logout",UserController.Logout);

module.exports = router;