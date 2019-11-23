var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var express = require("express");
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res){
	console.log("get connection noted...");
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
		if (err) throw err;
		var dbo = db.db("boh");
		//Find the first document in the customers collection:
		dbo.collection("itineraries").find({'label': {$regex: ".*"+req.query.query+".*"}}).toArray(function(err, result) {
			if (err) throw err;
			res.send({result});
			db.close();
		});
	});
});

app.post('/', function (req, res){
        var obj = {
		"name": req.body.name,
		"waypoints": []
	};

        var waypoints = JSON.parse(req.body.waypoints);

        for (var i=0; i<req.body.length; i++){
		obj.waypoints.push({"lat": waypoints[i].lat, "lng": waypoints[i].lng});
        }

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db){
		if (err) throw err;
		var dbo = db.db("boh");
		dbo.collection("itineraries").insertOne(obj, (err,res) => {
			if (err) throw err;
			db.close();
		});
	});
});

app.listen(3000, function(){
	console.log('server listening on 3000...');
});
