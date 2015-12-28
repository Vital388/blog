var model = require('../model/db');
function accessRightPost(req, res, next) {

    model.posts.findOne({_id: req.params.postId}, function (err, userpost) {

        if (userpost.author.toString() == req.user._id.toString()) {
            return next();
        }
        res.json({access: false})

    })
}
function accessRightImage(req, res, next) {

    model.images.findOne({_id: req.params.postId}, function (err, userimage) {
        if (userimage.author.toString() == req.user._id.toString()) {
            return next();
        }

        res.json({access: false})

    })
}
exports.accessRightPost = accessRightPost;
exports.accessRightImage = accessRightImage;