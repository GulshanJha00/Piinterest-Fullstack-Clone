var express = require('express');
var router = express.Router();
const userModel = require("./users")
const postModel = require("./post")
const localStrategy = require('passport-local');
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multerSetup");


router.get("/", function(req, res, next){
  res.render("register")
});

router.get("/login", (req,res)=>{
  res.render("login", {error: req.flash('error')})
})

router.get("/register", (req,res)=>{
  res.render("register")
})

router.get("/feed", isLoggedIn, async (req,res)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")

  res.render("feed", {user, posts})
})

router.get("/profile", isLoggedIn, async function(req,res,next){
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")
  res.render("profile", {user})
})

router.get("/postpage",isLoggedIn,(req,res)=>{
  res.render("postPage")
})


router.post("/register", function(req, res){
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res, function(){
      res.redirect("/feed")
    })
  })
})

router.post("/login", passport.authenticate("local",{
  successRedirect: "/feed",
  failureRedirect: "/login",
  failureFlash: true
}), function(req,res){})

router.get("/logout", function(req,res,next){
  req.logout(function(err){
    if (err) {return next(err);}
    res.redirect("/login");
  })
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}




router.post("/upload",isLoggedIn, upload.single("file"), async (req,res) =>{
  if(!req.file){
    return res.status(400).send("No files were uploaded")
  }
  const user = await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("profile")
})

router.post("/fileupload", isLoggedIn, upload.single("profilepic"), async function(req ,res,next){
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("profile")
})

module.exports = router;
