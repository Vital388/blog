/**
 * Created by Lollypop on 02.11.2015.
 */
var mongoose = require('mongoose');
var DATABASE = require('../lib/db_conf.js');
console.log(DATABASE)
mongoose.connect(DATABASE, function (error) {
    if (error) {
        console.log(error);
    }
});
var Schema = mongoose.Schema;
var blogSchema = new Schema({
    title: String,
    author: {type: Schema.Types.ObjectId, ref: 'users'},
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
var categoriesSchema= new Schema({
    name:{type: String , unique: true}

});
var imageSchema = new Schema({
    author:{type: Schema.Types.ObjectId, ref: 'users'},
    _post: {type: Schema.Types.ObjectId, ref: 'posts'},
    name: String,
    size: String,
    date: {type: Date, default: Date.now},
    path: String
});
var usersSchema = new Schema({
    login: {type: String, unique: true } ,
    password: String,
    nickname: {type: String, unique: true },
    email: String,
    date_of_birth: String,
    sex: String,
    date: {type: Date, default: Date.now},
    avatar: String

});
var facebookSchema=new Schema({
    id: {type: String, unique: true},
    displayName: String
});

var posts = mongoose.model('posts', blogSchema);
var images = mongoose.model('images', imageSchema);
var users =mongoose.model('users', usersSchema);
var categories =mongoose.model('categories', categoriesSchema);
var facebookUsers=mongoose.model('facebookUsers', facebookSchema);
exports.posts = posts;
exports.images = images;
exports.users = users;
exports.categories = categories;
exports.facebookUsers = facebookUsers;