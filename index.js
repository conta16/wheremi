var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var lclStrategy = require('passport-local').Strategy;
var RegisterStrategy = require('passport-local-register').Strategy;
var mongoose = require('mongoose');
const url = require('url');
var crypto = require('crypto');
var path = require('path');
var StrategyGoogle = require('passport-google-oauth20').Strategy;
var fs = require('fs');
const sgMail = require('@sendgrid/mail');
var cookieparser = require ('cookie-parser');
var CookieStrategy = require('./src/passport-cookie');
var authCookie = "wH3r3M1k33p1nGMyK00k135";

sgMail.setApiKey("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")


var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var urldb = "mongodb://localhost:27017/sitedb";
var express = require("express");
var cors = require('cors');
var upload = require('jquery-file-upload-middleware');
var app = express();


// Configure view engine to render EJS templates.
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
//app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(cookieparser());

var bodyParser = require('body-parser');
app.use(bodyParser.json({
	limit: '50mb', extended: true
}));
app.use(bodyParser.urlencoded({
	limit: '50mb', extended: true
}));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//////////////////////////////

var Strategy = require('passport-local').Strategy;
var RegisterStrategy = require('passport-local-register').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const protocol="http://";
const baseDomain="localhost:3000/";
const baseURL=protocol+baseDomain;


/* MONGOOSE SETUP */

mongoose.connect(urldb, { useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

var userModel ={
      username: String,
      password: String,
      name: String,
      surname: String,
      email: String,
      salt: String,
      token: String,
      bio: String,
      googleAuth: Boolean
    };
var passwordBeingUpdatedModel={
  userid: String,
  passwordToken: String,
  attempts: Number
}

var googleTokenModel={
	email: String,
	accessToken: String,
	refreshToken: String
}

const UserDetail = new Schema(userModel);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
const userToBeVerifiedModel = Object.assign(userModel, {verificationKey: String});
const UserToBeVerified = new Schema(userToBeVerifiedModel);
const UsersToBeVerified = mongoose.model('usersToBeVerified', UserToBeVerified, 'usersToBeVerified');
const PasswordsBeingUpdated = mongoose.model('passwordsBeingUpdated', passwordBeingUpdatedModel, 'passwordsBeingUpdated');
const GoogleToken = new Schema(googleTokenModel);
const GoogleTokens = mongoose.model('GoogleTokens', GoogleToken, 'GoogleTokens');

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
passport.use(new Strategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, cb) {
    UserDetails.findOne({email: username}, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != sha512(password, user.salt).passwordHash) { return cb(null, false); }
			UserDetails.findOneAndUpdate({email: username}, {token: genRandomString(64)}, function(err, user){
				if (err)
					return cb(err);
				if (!user)
					return cb (null, false);
			});
      return cb(null, user);
    });
  }));

function sendmail(from, alias, to, name, subject, text, html){
	var msg={};
	if (from)
			msg.from=from;
	if (alias)
			msg.fromname=alias;
	if (to)
			msg.to=to;
	if (text)
			msg.text=txt;
	if (html)
			msg.html=html;
	if (subject)
		msg.subject=subject;
	else
		msg.subject="nosubject";
	sgMail.send(msg);
}

function confirmMail(user){
  sendmail("noreply@site181951.tw.cs.unibo.it", "Where M I", user.email, user.name+" "+user.surname, "Confirm your registration", "", "<h3>Dear "+user.name+", welcome to <a href='https://site181951.tw.cs.unibo.it/'>Where M I</a>!</h3><br />Please activate your account clicking the link below:<br/> <a href='"+baseURL+"verify?user="+user.username+"&key="+user.verificationKey+"'>link</a>");
}

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: "1082311706769-imjjc300bk99fval3kanm2u86ioaagud.apps.googleusercontent.com",
    clientSecret: "eiRQREZjOXviY_mIibKVxRa_",
    callbackURL: "/auth/google/callback"
  },function(accessToken, refreshToken, profile, done) {
    UserDetails.findOne({ email: profile.emails[0].value }, function (err, user) {
      if (err)
        return done (err)
      if (!user){
        return UserDetails.create({
          'username' : profile.displayName,
          'name': profile.name.givenName,
          'surname': profile.name.familyName,
          'password': "",
          'email': profile.emails[0].value,
          'salt': "",
          'bio': "",
          'token': genRandomString(64),
          'googleAuth': true
        }, function(err, user) {
          if(err) {
            return done(err);
          }
          if(!user) {
            err = new Error();
            return done(err, false, {success: false, message: "User creation failed."});
          }
          confirmMail(user);
					GoogleTokens.update({'email': profile.emails[0].value}, {accessToken: accessToken, refreshToken: refreshToken, email: profile.emails[0].value}, {upsert: true}, function(err, token){});
          done(null, user);
					// GoogleTokens.update({'email': profile.emails[0].value}, {accessToken: accessToken, refreshToken: refreshToken, email: profile.emails[0].value}, {upsert: true}, function(err, token){console.log(err, token)});
          // done(null, user);
        });
      }
		if (user){
			UserDetails.findOneAndUpdate({email: profile.emails[0].value}, {token: genRandomString(64)}, function(err, user){
				if (err)
					return done(err);
				if (!user)
					return done(null, false);
			});
		}
			GoogleTokens.update({'email': profile.emails[0].value}, {accessToken: accessToken, refreshToken: refreshToken, email: profile.emails[0].value}, {upsert: true}, function(err, token){console.log(err, token)});
			done(null, user);
    });
  }));
      // return done(null, {"username" : "davide", "password" : "c6e7eb6b2eb57b0fd7695c758a2be6ae7b33e4d9d1fe0ceaa2e822b47ad10cbc0d1f5f1a6b0bc391434e9357f8b10309d58a642e4d0f57ed71df604ad2e723d7", "name" : "davide", "surname" : "davoli", "email" : "davide@pollomoltofritto.tk", "salt" : "4466a6ea27d4707bf8831c995cbc6b76", "__v" : 0 });

passport.use(new RegisterStrategy({
    passReqToCallback : true
  },
  function verify(req, username, password, done) {
    UserDetails.findOne({
      'email' : req.body.email
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(); // see section below
      }
      if (user) {
        return done(null, false);
      }
    });
  }, function create(req, username, password, done) {
    var salt = sha512(req.body.password, genRandomString(32));
    function fun (){
      var vk = genRandomString(32);
      UsersToBeVerified.findOne({verificationKey: vk}, function(err, data){
        if (err){
          return alert("Sorry, we are in trouble with our database");
          }
        if (!data){
          return UsersToBeVerified.create({
            'username' : username,
            'name': req.body.name,
            'surname': req.body.surname,
            'password': salt.passwordHash,
            'email': req.body.email,
            'salt':salt.salt,
            'bio':'',
            'verificationKey': vk,
          }, function(err, user) {
            if(err) {
              return done(err);
            }
            if(!user) {
              err = new Error();
              return done(err, false, {success: false, message: "User creation failed."});
            }
            confirmMail(user);
            done(null, user);
          });
        }
        else {
          fun();
        }
      });
    }
  fun();
  }
));

passport.use(new CookieStrategy({cookieName: authCookie},
  function(token, done) {
		console.log(token);
    UserDetails.findOne({ token: token }, function(err, user) {
			console.log(user);
			console.log(err);
      if (err) { return done(err); }
      if (!user) { return done(null, true); }
      return done(null, user);
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
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  UserDetails.findOne({_id: id}, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/home',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.post('/login', function (req, res, next){
	console.log("ccccccccccccccccccccccccccccccccccc");
	console.log(req.body);
  passport.authenticate('local', function (err, user, info){
    if (err)
      return next(err);
    if (!user)
      return res.redirect(url.format({pathname: "/login", query: {success: false}}));
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
				MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
					if (err) throw err;
					var dbo = db.db("sitedb");
					dbo.collection("userInfo").find({"_id": ObjectId(req.user._id)}, {fields:{token: 1}}).toArray(function (err, result) {
						if (err)
							throw(err)
						token=result[0].token;
						res.cookie(authCookie, token, {maxAge: 1000*60*60*24*14, path:'/'});
						return res.redirect('/');
					});
				});
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
      return res.redirect(url.format({pathname: "/register", query: info}));
    if (!user)
      return res.redirect(url.format({pathname: "/register", query: info}));
    if (user)
      return res.redirect(url.format({pathname: "/register", query: {username: user.username}}));
      })(req, res, next);
});

app.get('/logout',
  function(req, res){
		res.clearCookie(authCookie);
    req.logout();
    res.redirect('/');
  });

  app.get('/verify',
    function(req, res){
      console.log(req.query);
      UsersToBeVerified.findOneAndDelete({username: req.query.user, verificationKey: req.query.key}, function(err, data){
          if (err){
            return "Sorry, we are in trouble with our database";
          }
          if (!data){
            console.log("unable to verify given user");
          }
          if (data){
            delete data.verificationKey;
            console.log(data);
            UserDetails.create({
                    username: data.username,
                    password: data.password,
                    name: data.name,
                    surname: data.surname,
                    email: data.email,
                    salt: data.salt,
                    token: "",
                    bio: "",
                    googleAuth: false
                  }, function (err, data){
              if (err){
                console.log(err);
                return "Sorry, we are in trouble with our database";
              }
              if (!data)
                return "Sorry, we are in trouble with our database";
              else {
                return;
              }
            });
            }
      });
      res.redirect("/login");
    });

  app.get('/auth/google', passport.authenticate('google', { scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/youtube'
    ]}));

app.get('/auth/google/callback',
  passport.authenticate('google', {failureRedirect:"/login"}), function(req, res){
		var token;
		MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
			if (err) throw err;
			var dbo = db.db("sitedb");
			dbo.collection("userInfo").find({"_id": ObjectId(req.user._id)}, {fields:{token: 1}}).toArray(function (err, result) {
				if (err)
					throw(err)
				token=result[0].token;
				res.cookie(authCookie, token, {maxAge: 1000*60*60*24*14, path:'/'});
				return res.redirect('/');
			});
		})
	});

app.get('/passwordrecover', function(req, res){
  res.render('passwordrecover');
});

app.post('/passwordrecover', function(req, res){
  console.log(req.body);
  UserDetails.findOne({email: req.body.email}, function(err, user){
    if (err){
			console.log(err);
      return "Sorry, we are in trouble with our database";
    }
    if (!user || user.password==""){
      return res.redirect(url.format({pathname: "/passwordrecover", query: {success: false}}));
    }
    if (user){
      PasswordsBeingUpdated.deleteOne({userid: user._id}, function(err, data){
        if (err)
          return "Sorry, we are in trouble with our database";
        else {
          PasswordsBeingUpdated.create({userid: user._id, passwordToken: genRandomString(64), attempts: 0}, function (err, data) {
            if (err){
              return "Sorry, we are in trouble with our database";
            }
            if (!data){
              return "Sorry, we are in trouble with our database";
            }
            if (data){
              sendmail("noreply@site181951.tw.cs.unibo.it", "Where M I", user.email, user.name+" "+user.surname, "Password reset link", "","<h3>Dear "+user.name+",clicking the link below you'll be able to reset your password:<br /> <a href='"+baseURL+"setnewpassword?user="+user._id+"&token="+data.passwordToken+"'>"+baseURL+"setnewpassword?user="+user._id+"&token="+data.passwordToken+"</a>");
              return res.render("passwordrecover");
            }
          });
        }
      })
    }
  });
});

// app.get('/passwordtoken', function(req,res){
//   res.redirect('/passwordrecover');
// });

app.get('/passwordtoken', function(req, res){
  console.log(req.query);
  if (!req.query.user || !req.query.token){
    res.redirect("/");
  }
	res.render("setnewpassword");
});
/*
  PasswordsBeingUpdated.findOne({userid: req.query.user, passwordToken: req.query.token}, function(err, data){
    console.log(data);
    if (err){
      return "Sorry, we are in trouble with our database";
    }
    if (!data){
      return "Sorry, we are in trouble with our database";
    }
    if (data){
      console.log("sdsfdgfh");
      if (data.attempts>2){
        PasswordsBeingUpdated.deleteOne(data, function(err, data){
          if (err){
            console.log("c", err);
            return "Sorry, we are in trouble with our database";
          }
          res.redirect("/");
        });
      }
      return res.redirect(url.format({pathname:"/setnewpassword", query:{passwordtoken: req.query.token}}));
    }
  })
});
*/
app.get('/setnewpassword', function (req,res){
	if (!req.query.user || !req.query.token)
		res.redirect("/");
  res.render('setnewpassword');
});

app.post('/newbio', function(req,res){
  console.log("body:", req.body);
  UserDetails.findOneAndUpdate({email: req.user.email}, {bio: req.body.newbio}, function(err, data){
    if (err){
      console.log("Sorry, we are in trouble with our database");
    }
    console.log("data:", data);
    return res.send("done");
  });
});

app.post('/setnewpassword', function(req, res){
  console.log(req.body);
  console.log(req.query);
	PasswordsBeingUpdated.deleteOne({userid: ObjectId(req.query.userid), passwordToken: req.query.passwordToken}, function(err, data){
		if (err)
			console.log(err);
		else {
			var salt=genRandomString(32);
			UserDetails.findOneAndUpdate({_id: req.query.user}, {password: sha512(req.body.password, salt).passwordHash, salt: salt}, function(err, data){
				if (err){
					console.log("Sorry, we are in trouble with our database");
				}
				return res.redirect("/login");
			});
			console.log(data);
		}
});
});

//
app.get('/',
  passport.authenticate("cookie", { session: false }),
	 function(req, res, next){
		 console.log("req.user", req.user)
		if (req.user===true || req.user===undefined || req.user==null)
			res.render('index', {user: undefined});
		else
			res.render('index', {user: req.user});
	});

app.get('/search', function (req, res){
	MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
		var dbo = db.db("sitedb");
		//Find the first document in the customers collection:
		if (req.query.username) dbo.collection("itineraries").aggregate([
                        {
                                $lookup:{
                                        from: "pointOfInterest",
                                        localField: "waypoints",
                                        foreignField: "_id",
                                        as: "inputWaypoints"
                                },
                        },
                        {
                          $lookup:{
                            from: "userInfo",
                            localField: "user_id",
                            foreignField: "_id",
                            as: "user"
                          },
                        },
			{
				$match: {
          'label': {$regex: ".*"+req.query.label+".*"},
          'user.0.username': {$regex: ".*"+req.query.username+".*"}
				}
			}
		]).toArray(function(err, result) {
			if (err) throw err;
			res.send({result});
			db.close();
    });
    else dbo.collection("itineraries").aggregate([
      {
              $lookup:{
                      from: "pointOfInterest",
                      localField: "waypoints",
                      foreignField: "_id",
                      as: "inputWaypoints"
              },
      },
      {
        $lookup:{
          from: "userInfo",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        },
      },
{
$match: {
'label': {$regex: ".*"+req.query.label+".*"},
}
}
]).toArray(function(err, result) {
if (err) throw err;
res.send({result});
db.close();
});
	});
});

app.get('/getUsername', function(req, res){
  MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err,db){
    if (err) throw err;
    var dbo = db.db("sitedb");
    dbo.collection("userInfo").find({
      "_id": ObjectId(req.query.id)
    },{
      fields: {
        "username": 1
      }
    }).toArray(function(err, result){
      if (err) throw err;
      res.send(result);
      //db.close();
    });
  });
});

app.get("/img/favicon.ico",function(req,res){
  res.sendFile("./public/img/favicon.ico");
});


app.get('/about', function (req, res){
	var obj = {};
	MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
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
          				inputWaypoints: 1,
                  waypoints: 1,
                  user_id: 1
				}
			}


		]).limit(parseInt(req.query.maxpoints)).toArray(function(err,result){
			//if (err) throw err;
			for (var index in result)
				for (var i in result[index].waypoints){
					for (var j=i; j<result[index].waypoints.length; j++){
						if (result[index].inputWaypoints[j] && result[index].waypoints[i].toString() == result[index].inputWaypoints[j]._id.toString()){
						/*var tmp = result.inputWaypoints[i];
						result.inputWaypoints[i] = result.inputWaypoints[j];
						result.inputWaypoints[j] = tmp;*/
							[result[index].inputWaypoints[i], result[index].inputWaypoints[j]] = [result[index].inputWaypoints[j], result[index].inputWaypoints[i]];
						}
					}
				}
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

app.post('/changeprofilepic', function(req, res){
  var pic = JSON.parse(req.body.pic);
  var id = JSON.parse(req.body.id);
  id = ObjectId(id);
  console.log(pic);
  console.log(id);

  MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("sitedb");
    dbo.collection("userInfo").update({
      "_id": id
    },{
      $set: {
        'profilepic': pic
      }
    }, function(err, res){
      if (err) throw err;
      db.close();
    });
  });
});

app.get('/route', function(req, res){
  var tmp = ObjectId(req.query.id);
	MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
                var dbo = db.db("sitedb");
                dbo.collection("itineraries").aggregate([
                {
                  $match: {
                    "_id": tmp
                  }
                },
                {
                  $lookup:{
                    from: "pointOfInterest",
                    localField: "waypoints",
                    foreignField: "_id",
                    as: "inputWaypoints"
                  },
                }
              ]).toArray(function(err,result){
			if (err) throw err;
			res.send(result[0]);
                });
	});
});

app.post('/', function (req, response){
        var label = JSON.parse(req.body.label);
        var waypoints = JSON.parse(req.body.waypoints);
        var route = JSON.parse(req.body.route);
	var user_id = JSON.parse(req.body.user_id);
	//var regex = /^data:.+\/(.+);base64,(.*)$/;

	//var data_url = [];

	for (var i in waypoints){
		if (i == 0) waypoints[i].startItinerary = true;
		else waypoints[i].startItinerary = false;
		waypoints[i].user_id = user_id;
	}
	MongoClient.connect(urldb, {useUnifiedTopology: true}, async function(err,db){
		if (err) throw err;
	        var tmp = {
        	        label: label,
                	waypoints: [], // not waypoints: waypoints because in the db the waypoints property will only contain the waypoints id
                	route: route,
			user_id: ObjectId(user_id)
        	};
		var dbo = db.db("sitedb");
		var promise = new Promise(async function(resolve, reject) {
			for (var i in waypoints){
				if (!waypoints[i]._id){
					var boh = new Promise(function (resolve, reject) {
						dbo.collection("pointOfInterest").insertOne(waypoints[i], (err,res) => {
							if (err) throw err;
							//tmp.waypoints.push(ObjectId(res.insertedId));
							resolve(ObjectId(res.insertedId));
						});
					});
					var t = await boh;
					tmp.waypoints.push(t);
				}
				else tmp.waypoints.push(ObjectId(waypoints[i]._id));
			}
			resolve(tmp);
		});

		var w = await promise;
      dbo.collection("itineraries").insertOne(w, (err,res) => {
          if (err) throw err;
          dbo.collection("userInfo").update({
          },
          {
            $push: {
              itinerary_id: res.insertedId,
              points_id: { $each: w.waypoints }
            }
          });
        	response.status(200).send(ObjectId(res.insertedId));
	    });
	});
});

app.post('/sendcomment', function(req, res){
  var id = JSON.parse(req.body.id);
  var comment = JSON.parse(req.body.comment);
  var account = JSON.parse(req.body.account);
  console.log("in sendcomment");
  MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err,db){
    if (err) throw err;
    var dbo = db.db("sitedb");
    dbo.collection("pointOfInterest").updateOne({
      "_id": ObjectId(id)
    },{
      $push: {
        comments: {
          text: comment,
          madeBy: {
            id: account._id,
            name: account.username
          },

        }
      }
    }, function(err, res){
      if (err) throw err;
      db.close();
    });
  });
});

app.post("/postAdded", function(req,res){
	var obj = JSON.parse(req.body.point);
	MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err,db){
		if (err) throw err;
		var dbo = db.db("sitedb");
		dbo.collection("pointOfInterest").insertOne(obj, (err,res) => {
			if (err) throw err;
			db.close();
		});
	});
});


upload.configure({
        uploadDir: __dirname + '/public/uploads',
        uploadUrl: '/uploads',
        imageVersions: {
            thumbnail: {
                width: 80,
                height: 80
            }
        }
    });

upload.configure({
    uploadDir: __dirname + '/public/uploads/',
    uploadUrl: '/uploads'
});

function removeFields(obj, fields){
	function notin(item, list){
		for (var i in list){
			if (list[i]==item)
				return false;
		}
		return true;
	}
	var newobj={};
	var keyobj=Object.keys(obj);
	for (var i in keyobj){
			if (notin(keyobj[i], fields)){
				newobj[keyobj[i]]=obj[keyobj[i]];
			}
	}
	return newobj;
}

function loggedin(req){
	return !(!req.isAuthenticated || !req.isAuthenticated()|| req.user===true)
}

app.get('/user',
	passport.authenticate("cookie", { session: false }),
	function(req, res){
		if (!(!req.isAuthenticated || !req.isAuthenticated() || req.user===true)){
			var a=removeFields(req.user._doc, ["password", "salt", "token"])
			return res.send(a);
		}
		else {
			return res.send ({});
		}
})

app.get('/users', function(req, res){
	if (loggedin(req)){
		MongoClient.connect(urldb, function(err, db) {
  		if (err) throw err;
  		var dbo = db.db("sitedb");
  		var query = {};
  		dbo.collection("userInfo").find(query).toArray(function(err, result) {
    		if (err) throw err;
				var a=[]
				for (var i in result){
					a[i]=removeFields(result[i], ["password", "salt", "token"]);
				}
				return res.send(a);
    		db.close();
  		});
		});
	}
	else
		return res.send ({});
});

/// Redirect all to home except post
app.get('/upload', function( req, res ){
	res.redirect('/');
});

app.put('/upload', function( req, res ){
	res.redirect('/');
});

app.delete('/upload', function( req, res ){
	res.redirect('/');
});

app.use('/upload', function(req, res, next){
    console.log("req"); console.log(req);
    console.log("res"); console.log(res);
    console.log("next"); console.log(next);
    upload.fileHandler({
        uploadDir: function () {
            return __dirname + '/public/uploads/'
        },
        uploadUrl: function () {
            return '/uploads'
        }
    })(req, res, next);
});

app.listen(3000,'0.0.0.0', function(){
	console.log('server listening on 3000...');
});
