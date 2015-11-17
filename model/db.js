/**
 * Created by Lollypop on 02.11.2015.
 */
var mongoose = require('mongoose');
const DATABASE = 'mongodb://Vital388:Lollypop388@ds047524.mongolab.com:47524/blog';
//var data=require('./bd.json'); //read users from file.json
mongoose.connect(DATABASE, function (error) {
    if (error) {
        console.log(error);
    }
});
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    title: String,
    author: String,
    body: String,
    excerption: String,
    image:String,
    category:String,
    comments: [{body: String, date: Date}],
    date: {type: Date, default: Date.now},
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});
var posts = mongoose.model('posts', blogSchema);
module.exports = posts;