// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Dishes = require('./dishes');

var favoriteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{type: Schema.Types.ObjectId, ref: 'Dish'}]
}, {
    timestamps: true
});



// the schema is useless so far
// we need to create a model using it
var FavoriteDishes = mongoose.model('FavoriteDish', favoriteSchema);

// make this available to our Node applications
module.exports = FavoriteDishes;
