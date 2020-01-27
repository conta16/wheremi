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

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var urldb = "mongodb://localhost:27017/";
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
const mailjet = require ('node-mailjet').connect('187677886ad82be8f094bad7c90a2226', '62d76471b6fe4669d28ac46ff2f539b4')

var Strategy = require('passport-local').Strategy;
var RegisterStrategy = require('passport-local-register').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const protocol="http://";
const baseDomain="localhost:3000/";
const baseURL=protocol+baseDomain;


/* MONGOOSE SETUP */

mongoose.connect('mongodb://localhost:27017/sitedb');

const Schema = mongoose.Schema;

var userModel ={
      username: String,
      password: String,
      name: String,
      surname: String,
      email: String,
      salt: String
    };
var passwordBeingUpdatedModel={
  userid: String,
  passwordToken: String,
  attempts: Number
}

const UserDetail = new Schema(userModel);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');
const userToBeVerifiedModel = Object.assign(userModel, {verificationKey: String});
const UserToBeVerified = new Schema(userToBeVerifiedModel);
const UsersToBeVerified = mongoose.model('usersToBeVerified', UserToBeVerified, 'usersToBeVerified');
const PasswordsBeingUpdated = mongoose.model('passwordsBeingUpdated', passwordBeingUpdatedModel, 'passwordsBeingUpdated');

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
		console.log(username);
    UserDetails.findOne({email: username}, function(err, user) {
			console.log(user);
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != sha512(password, user.salt).passwordHash) { return cb(null, false); }
      return cb(null, user);
    });
  }));

function sendmail(from, alias, to, name, subject, text, html){
  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request({
    "Messages":[
      {
        "From": {
          "Email": from,
          "Name": alias
        },
        "To": [
          {
            "Email": to,
            "Name": name
          }
        ],
        "Subject": subject,
        "TextPart": text,
        "HTMLPart": html,
        "CustomID": ""
      }
    ]
  })
  request
    .then((result) => {
      return result.body;
    })
    .catch((err) => {
      return err;
    })
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
    console.log(profile);
    UserDetails.findOne({ email: profile.email }, function (err, user) {
      console.log(user);
      if (err)
        return done (err)
      if (!user){
        return UserDetails.create({
          'username' : profile.displayName,
          'name': profile.name.givenName,
          'surname': profile.name.familyName,
          'password': "",
          'email': profile.email,
          'salt': ""
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
    function fun (){
      var vk = genRandomString(32);
      UsersToBeVerified.findOne({verificationKey: vk}, function(err, data){
        console.log(data);
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
            'verificationKey': vk
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
      return res.redirect(url.format({pathname: "/register", query: info}));
    if (!user)
      return res.redirect(url.format({pathname: "/register", query: info}));
    if (user)
      return res.redirect(url.format({pathname: "/register", query: {username: user.username}}));
      })(req, res, next);
});

app.get('/logout',
  function(req, res){
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
                    salt: data.salt
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
        'https://www.googleapis.com/auth/userinfo.email'
    ]}));

app.get('/auth/google/callback',
  passport.authenticate('google', {successRedirect: "/", failureRedirect:"/login"}));

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

app.post('/setnewpassword', function(req, res){
	console.log(req.body);
	PasswordsBeingUpdated.deleteOne({userid: req.body.userid, passwordToken: req.body.passwordToken}, function(err, data){
		if (err)
			return "Sorry, we are in trouble with our database";
		else {
			var salt=genRandomString(32);
			UserDetails.findOneAndUpdate({_id: req.body.userid}, {password: sha512(req.body.password, salt).passwordHash, salt: salt}, function(err, data){
				if (err){
					console.log("Sorry, we are in trouble with our database");
				}
				return res.redirect("/login");
			});
			console.log(data);
		}
});
});

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

//////////////////////////////



//
app.get('/', function(req,res){
	res.sendFile(path.join(__dirname, './public/main', 'index.html'));
});

app.get('/search', function (req, res){
	MongoClient.connect(urldb, {useUnifiedTopology: true}, function(err, db) {
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
          				waypoints: 1
				}
			}


		]).limit(parseInt(req.query.maxpoints)).toArray(function(err,result){
			if (err) throw err;
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

app.post('/', function (req, res){
        var label = JSON.parse(req.body.label);
        var waypoints = JSON.parse(req.body.waypoints);
        var route = JSON.parse(req.body.route);
	//var regex = /^data:.+\/(.+);base64,(.*)$/;

	//var data_url = [];

	for (var i in waypoints){
		if (i == 0) waypoints[i].startItinerary = true;
		else waypoints[i].startItinerary = false;
		/*for (var j in waypoints[i].img){
			var matches = waypoints[i].img[j].match(regex);
			var ext = matches[1];
			var base64_data = matches[2];
			var buffer = new Buffer(base64_data, 'base64');
			fs.writeFile(__dirname + '/uploads', buffer, function (err) {
				if (err) throw err;
  				console.log("success");
			});
		}*/
	}
	MongoClient.connect(urldb, {useUnifiedTopology: true}, async function(err,db){
		if (err) throw err;
	        var tmp = {
        	        label: label,
                	waypoints: [], // not waypoints: waypoints because in the db the waypoints property will only contain the waypoints id
                	route: route
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
