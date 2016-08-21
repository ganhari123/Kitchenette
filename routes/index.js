var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require("mysql");
var passport = require('passport');
var flash = require('connect-flash');
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });



router.use(session({
    secret            : 'kitchnette',
    resave            : false,
    saveUninitialized : false
})); // session secret
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
router.use(flash());


/*var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hari0595",
  database: "kitchnette"
});*/

var con = mysql.createConnection({
  host: "us-cdbr-iron-east-04.cleardb.net",
  user: "b95c91e8abddcf",
  password: "4f717c85",
  database: "heroku_caed14fe08a9ca3"
});

require('../config/passport')(passport, con);

/**
 *Code to make the connection to the database
 *
 **/
con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

router.get('/', function(req, res){
	res.redirect('/login');
});

/* GET home page. */
router.get('/login', isLoggedIn, function(req, res) {
  res.render('home',{
  	error: req.flash('error'),
  	isLogin: 1
  });
});

/* GET home page. */
router.get('/register', function(req, res) {
  res.render('home',{
  	error: req.flash('error'),
  	isLogin: 0
  });
});

router.post('/login', passport.authenticate('local-signin', {
    successRedirect : '/dash',
    failureRedirect : '/login',
    failureFlash    : true
}));

router.post('/register', passport.authenticate('local-register', {
	successRedirect : '/dash',
	failureRedirect : '/register',
	failureFlash: true
}));

router.post('/submitRecipe', upload.any(), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.body);
  res.send(req.files);
});

router.get('/dash', isLoggedOut, function(req, res){
	console.log(req.user);
	res.render('dashboard', {
		user: req.user.email
	});
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if (req.user) {
		console.log(req.user.email);
		res.redirect('/dash');
	} else {
		next();
	}
}

function isLoggedOut(req, res, next) {
	if (!req.user) {
		res.redirect('/');
	} else {
		next();
	}
}
module.exports = router;
