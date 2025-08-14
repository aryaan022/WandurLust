if(process.env.NODE_ENV !== "production") {
require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride= require("method-override");
const ejsMate =  require("ejs-mate"); 
const wrapAsync = require("./utils/wrapAsync.js");
const Session = require("express-session");
const MongoStore =require("connect-mongo")
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")


const dbUrl =  process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}
 
 
app.set("view engine", "ejs");
app.set("views",path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"./public")))

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time in seconds after which session will be updated
})

store.on("error",(err)=>{
    console.log("session store error",err);
});

const Sessionoption = {
    store :store,
    secret :process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,// 7 days 24hours 60 min 60 sec 1000 millisecond
        maxAge: 7*24*60*60*1000, // 7 days in milliseconds
        httpOnly:true, // prevents client-side JavaScript from accessing the cookie
    }
}


app.get("/", (req, res) => {
    res.redirect("/listings");
});

//session adn flash
app.use(Session(Sessionoption));
app.use(flash());

//authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //user ki info session me save kraneka mtlb hai serialized user and unstore krane ka mtlb hai deserialized user.
passport.deserializeUser(User.deserializeUser());



//flash middleware message for success and error to save in local
app.use((req,res,next)=>{
    res.locals.success =req.flash("success"); 
    res.locals.error =req.flash("error");
    res.locals.currentUser = req.user;
    next();
})


// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"aryaan022"
//     })
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })



app.use("/listings", require("./routes/listing"));
app.use("/listings/:id/reviews", require("./routes/Review.js"));
app.use("/",require("./routes/user.js"));






app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
}) 