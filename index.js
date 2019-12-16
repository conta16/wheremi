var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var lclStrategy = require('passport-local').Strategy;
var RegisterStrategy = require('passport-local-register').Strategy;
var mongoose = require('mongoose');
const urlmodule = require('url');
var crypto = require('crypto');
var path = require('path');
var StrategyGoogle = require('passport-google-oauth20').Strategy;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/";
var express = require("express");
var cors = require('cors');
var app = express();


var bodyParser = require('body-parser');
app.use(bodyParser.json({
	limit: '50mb', extended: true
}));
app.use(bodyParser.urlencoded({
	limit: '50mb', extended: true
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/* MONGOOSE SETUP */

mongoose.connect('mongodb://localhost:27017/pollo');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String,
      name: String,
      surname: String,
      email: String,
      salt: String
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};



// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new lclStrategy(
  function(username, password, cb) {
    UserDetails.findOne({username: username}, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != sha512(password, user.salt).passwordHash) { return cb(null, false); }
      return cb(null, user);
    });
  }));


passport.use(new RegisterStrategy({
    passReqToCallback : true
  },
  function verify(req, username, password, done) {
    UserDetails.findOne({
      'email' : req.body.email
    }, function(err, user) {
      if (err) {
        console.log("a");
        return done(err);
      }
      if (!user) {
        console.log("b");
        return done(); // see section below
      }
      if (user) {
        console.log("c");
        return done(null, false);
      }
    });
  }, function create(req, username, password, done) {
    var salt = sha512(req.body.password, genRandomString(32));
    UserDetails.create({
      'username' : username,
      'name': req.body.name,
      'surname': req.body.surname,
      'password': salt.passwordHash,
      'email': req.body.email,
      'salt':salt.salt
    }, function(err, user) {
      if(err) {
        console.log("d");
        return done(err);
      }
      if(!user) {
        console.log("e");
        err = new Error();
        return done(err, false, {success: false, message: "User creation failed."});
      }
      console.log("f");
      done(null, user);
    });
  }
));

passport.use(new StrategyGoogle({
	clientID: '345217860500-5pflep4qvjtfvq55p1hqnm702r9an5cd.apps.googleusercontent.com',
	clientSecret: 'TObunvN9WoGUMEVUXW01ojHA',
	callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  function(accessToken,refreshToken, profile, cb){
	User.findOrCreate({ googleId: profile.id }, function (err, user) {
		return cb(null, user);
	  });
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
// Configure Passport authenticated session persistence.

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  UserDetails.findOne({_id: id}, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));


// Define routes.
app.get('/login',
  function(req, res){
    res.render('login');
  });

app.post('/login', function (req, res, next){
  passport.authenticate('local', function (err, user, info){
    if (err)
      return next(err);
    if (!user)
      return res.redirect(urlmodule.format({pathname: "/login", query: {success: false}}));
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.render("home",{user: user});
      });
    })(req, res, next);
});

app.get('/register',
  function(req, res){
    res.render('register');
  });

/*app.post('/register',
      passport.authenticate('localRegister', {failureRedirect:'/register'}),
      function(req, res){
        res.redirect('/')
      });*/
app.post('/register', function (req, res, next){
  passport.authenticate('localRegister', function (err, user, info){
    console.log(err, user, info);
    if (err)
      return res.redirect(urlmodule.format({pathname: "/register", query: info}));
    if (!user)
      return res.redirect(urlmodule.format({pathname: "/register", query: info}));
    if (user)
      return res.redirect(urlmodule.format({pathname: "/register", query: {username: user.username}}));
      })(req, res, next);
});

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });


//passport stuff

passport.use(new Strategy({
    clientID: 1058562301142057,
    clientSecret: '5c14b6338e08dda572acaa6ed111005e',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
    //User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(null, profile);
    //});
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['user_friends', 'user_photos'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user);
    res.redirect('/');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }
  ));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//
app.get('/', function(req,res){
	res.sendFile(path.join(__dirname, './public/main', 'index.html'));
});

app.get('/search', function (req, res){
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
		var dbo = db.db("sitedb");
		//Find the first document in the customers collection:
		dbo.collection("itineraries").aggregate([
                        {
                                $lookup:{
                                        from: "pointOfInterest",
                                        localField: "waypoints",
                                        foreignField: "_id",
                                        as: "inputWaypoints"
                                },
                        },
			{
				$match: {
					'label': {$regex: ".*"+req.query.query+".*"}
				}
			}
		]).toArray(function(err, result) {
			if (err) throw err;
			res.send({result});
			db.close();
		});
	});
});

app.get('/about', function (req, res){
	var obj = {};
	console.log(typeof(req.query.maxpoints));
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
		var dbo = db.db("sitedb");
		dbo.collection("itineraries").aggregate([
			{
				$lookup:{
					from: "pointOfInterest",
					localField: "waypoints",
					foreignField: "_id",
					as: "inputWaypoints"
				},
			},
                        {
                                $match: {
                                        $and: [
                                                {"inputWaypoints.0.latLng.lat": { $gt: parseFloat(req.query.swlat)}},
                                                {"inputWaypoints.0.latLng.lat": { $lt: parseFloat(req.query.nelat)}},
                                                {"inputWaypoints.0.latLng.lng": { $gt: parseFloat(req.query.swlng)}},
                                                {"inputWaypoints.0.latLng.lng": { $lt: parseFloat(req.query.nelng)}}
                                        ]
                                }
                        },
			{
				$project: {
					_id: 1,
					label: 1,
					inputWaypoints: 1
				}
			}


		]).limit(parseInt(req.query.maxpoints)).toArray(function(err,result){
			if (err) throw err;
			obj.itineraryStartPoints = result;
	                dbo.collection("pointOfInterest").find({
        	                $and: [
                	                {"latLng.lat": { $gt: parseFloat(req.query.swlat)}},
                        	        {"latLng.lat": { $lt: parseFloat(req.query.nelat)}},
                                	{"latLng.lng": { $gt: parseFloat(req.query.swlng)}},
                                	{"latLng.lng": { $lt: parseFloat(req.query.nelng)}},
					{"startItinerary": false}
                        	]
                	}).limit(parseInt(req.query.maxpoints)).toArray(function(err,result){
                        	if (err) throw err;
                        	obj.points = result;
                        	res.send(obj);
                	});
		});
	});
});

/*db.collection.find().sort({age:-1}).limit(1) // for MAX
db.collection.find().sort({age:+1}).limit(1) // for MIN*/

app.get('/route', function(req, res){
	var tmp = ObjectId(req.query.id);
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
                var dbo = db.db("sitedb");
                dbo.collection("itineraries").find({
               		"_id": tmp
                }).toArray(function(err,result){
			if (err) throw err;
			console.log(result[0]);
			res.send(result[0]);
                });
	});
});

app.post('/', function (req, res){
        var label = JSON.parse(req.body.label);
        var waypoints = JSON.parse(req.body.waypoints);
        var route = JSON.parse(req.body.route);
	var tmp = {
		label: label,
		waypoints: [], // not waypoints: waypoints because in the db the waypoints property will only contain the waypoints id
		route: route
	};

        /*var waypoints = JSON.parse(req.body.waypoints);

        for (var i=0; i<req.body.length; i++){
		obj.waypoints.push({"lat": waypoints[i].lat, "lng": waypoints[i].lng});
        }*/
	for (var i in waypoints)
		if (i == 0) waypoints[i].startItinerary = true;
		else waypoints[i].startItinerary = false;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db){
		if (err) throw err;
		var dbo = db.db("sitedb");
		dbo.collection("pointOfInterest").insertMany(waypoints, (err,res) => {
			if (err) throw err;
			for (var i=0; i < res.result.n; i++)
				tmp.waypoints.push(res.insertedIds[i]);
			dbo.collection("itineraries").insertOne(tmp, (err,res) => {
				if (err) throw err;
				db.close();
			});
		});
	});
});

app.post("/postAdded", function(req,res){
	var obj = JSON.parse(req.body.point);
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db){
		if (err) throw err;
		var dbo = db.db("sitedb");
		dbo.collection("pointOfInterest").insertOne(obj, (err,res) => {
			if (err) throw err;
			db.close();
		});
	});
});

app.listen(3000, function(){
	console.log('server listening on 3000...');
});
