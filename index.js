var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var StrategyGoogle = require('passport-google-oauth20').Strategy;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var express = require("express");
var cors = require('cors');
var app = express();


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
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
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }));

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
app.get('/', function (req, res){
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
		var dbo = db.db("sitedb");
		//Find the first document in the customers collection:
		dbo.collection("itineraries").find({'label': {$regex: ".*"+req.query.query+".*"}}).toArray(function(err, result) {
			if (err) throw err;
			res.send({result});
			db.close();
		});
	});
});

app.get('/about', function (req, res){
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
		var dbo = db.db("sitedb");
		//var bounds = JSON.parse(req.body.bounds);
		dbo.collection("itineraries").find({
			$and: [
                                {"waypoints.0.latLng.lat": { $gt: parseInt(req.query.swlat)}},
                                {"waypoints.0.latLng.lat": { $lt: parseInt(req.query.nelat)}},
                                {"waypoints.0.latLng.lng": { $gt: parseInt(req.query.swlng)}},
                                {"waypoints.0.latLng.lng": { $lt: parseInt(req.query.nelng)}}
                        ]
		}).toArray(function(err,result){
			if (err) throw err;
			res.send({result});
			db.close();
		});
	});
});

app.post('/', function (req, res){
        var obj = JSON.parse(req.body.itinerary);

        /*var waypoints = JSON.parse(req.body.waypoints);

        for (var i=0; i<req.body.length; i++){
		obj.waypoints.push({"lat": waypoints[i].lat, "lng": waypoints[i].lng});
        }*/

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db){
		if (err) throw err;
		var dbo = db.db("sitedb");
		dbo.collection("itineraries").insertOne(obj, (err,res) => {
			if (err) throw err;
			db.close();
		});
	});
});

app.listen(3000, function(){
	console.log('server listening on 3000...');
});
