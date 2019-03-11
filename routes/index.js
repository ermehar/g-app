var express = require('express');
var router = express.Router();
var gplay = require('google-play-scraper');

var MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

/* GET home page. */
router.get('/', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err){
			res.render('error', {status : 202 , error: err});
		}
		var dbo = db.db("gapps");
		dbo.collection("apps").find({}).toArray(function(err, result) {
			if (err){
				res.render('error', {status : 202 , error: err});
			}
			db.close();
			res.render('index', { apps: result });
		});
	}); 
});


/* GET App Details. */
router.get('/appdetails', function(req, res, next) {
	let pkg = req.query.pkg
	MongoClient.connect(url, function(err, db) {
		if (err){
			res.render('error', {status : 202 , error: err});
		}
		
		var dbo = db.db("gapps");
		dbo.collection("apps").find({_id:pkg}).toArray(function(err, result) {
			if (err){
				res.render('error', {status : 202 , error: err});
			}

			db.close();
			res.render('appdetails', { apps: result });
		});
	}); 
});

/* Save apps to db. */
router.get('/getapps', function(req, res, next) {
	gplay.list({
		fullDetail : true,
		country: 'in',
	    collection: gplay.collection.TOP_FREE,
	    num: 10
	}).then(function(apps) {
		InsterApps(apps).then(function(result){
			res.render('index', { apps: apps });
		}).catch(function(error){
			res.render('error', {status : 202 , error: error});
		});;
	}).catch(function(error){
		res.render('error', {status : 202 , error: error});
	});
});



const InsterApps = async function(apps) {
	await MongoClient.connect(url, function(err, db) {
		if (err) {
			throw err;
		}
		for (let i = 0; i < apps.length; i++) {
			var dbo = db.db("gapps");

			dbo.collection("apps").updateOne(
				{ _id: apps[i].appId }, 
				{ $set: apps[i] }, 
				{ upsert: true },  function(err, res) {
				if (err) {
					throw err;
				}
			});
		}
		db.close();
		return;
	});
}



module.exports = router;