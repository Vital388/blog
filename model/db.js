/**
 * Created by Lollypop on 02.11.2015.
 */
var mongoose = require('mongoose');
const DATABASE = 'localhost:27017/blog';
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
    category: String,
    image: {type: Schema.ObjectId, ref: 'images'},
    comments: [{body: String, date: Date}],
    date: {type: Date, default: Date.now},
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});
var imageSchema = new Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'posts'},
    name: String,
    size: String,
    date: {type: Date, default: Date.now},
    path: String
});
var usersSchema = new Schema({
    login: String,
    password: String,
    nickname: String,
    email: String,
    date_of_birth: String,
    sex: String,
    date: {type: Date, default: Date.now},
    avatar: String
});
var posts = mongoose.model('posts', blogSchema);
var images = mongoose.model('images', imageSchema);
var users =mongoose.model('users', usersSchema);
module.exports.posts = posts;
module.exports.images = images;
module.exports.users = users;