var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var FavoriteDishes = require('../models/favorites');
var Dishes = require('../models/dishes');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function(req,res,next){
    FavoriteDishes.find({})
        .populate('userId dishes')
        .exec(function (err, favoriteDish) {
        if (err) throw err;
        res.json(favoriteDish);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Dishes.findById(req.body._id, function (err, dish) {
        if (err) throw err;
        // This passes the USER id in the postedBy
        req.body.userId = req.decoded._doc._id;
        FavoriteDishes.findById(req.body.userId, function (err, favoriteDish){
        	if (err) throw err;
        	if(favoriteDish){ // Users's favorites already exist!
        		// Check that it exists.
        		var index = -1;
        		for (var i = (favoriteDish.dishes.length - 1); i >= 0; i--){
        			console.log(req.body._id);
        			console.log(favoriteDish.dishes[i]);
        			if (String(req.body._id) === String(favoriteDish.dishes[i])){
		    			index = i;
		    		}
        		}
        		console.log(index);

        		if (index == -1){ // Id was not found! So it is new!
        			// Insert the new id.
	        		favoriteDish.dishes.push(dish);
	        		favoriteDish.save(function (err, newdish) {
			            if (err) throw err;
			            console.log('Added a new dish to favorites!');
			            console.log(newdish);
			            res.json(newdish);
			        });
        		} else {
        			console.log("User already has dish!");
        			console.log(dish);
        			res.json(dish);
        		}
        	} else { // User's favorites do not exist.
        		var dishes = [dish]; // First dish to be added to array.
        		req.body.dishes = dishes;
        		FavoriteDishes.create({_id: req.body.userId, userId: req.body.userId, dishes: req.body.dishes}, function (err, newdish){
        			if (err) throw err;
        			console.log('New User\'s favorite dish added!');
        			var id = newdish._id;
        			res.writeHead(200, {
            			'Content-Type': 'text/plain'
        			});
        			res.end('Added the dish with id: ' + id);
        		});
        	}
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next){
	FavoriteDishes.findByIdAndRemove(req.decoded._doc._id, function (err, resp) {
		if (err) throw err;
        res.json(resp);
    });
});


favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
	// var myId = new mongoose.Types.ObjectId(req.decoded._doc._id);
	// FavoriteDishes.findAndModify({_id: myId}, {$pull: {dishes: req.params.dishId}});
    FavoriteDishes.findById(req.decoded._doc._id, function (err, favoriteDish) {
    	var index = 0;
    	for (var i = (favoriteDish.dishes.length - 1); i >= 0; i--){
    		if (String(req.params.dishId) === String(favoriteDish.dishes[i])){
    			index = i;
    		}
    	}
    	console.log("index is: " + index);
    	// New array
    	var newDishes = [];
    	for (var i = (favoriteDish.dishes.length - 1); i >= 0; i--){
    		if(i !== index){
    			newDishes.push(favoriteDish.dishes[i]);
    		} 
    	}
    	favoriteDish.dishes = newDishes
        // favoriteDish.dishes.id(req.params.dishId).remove();
        favoriteDish.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = favoriteRouter;
