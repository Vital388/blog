var model = require('../model/db');
function accessRightPost(req, res, next) {

    model.posts.findOne({_id: req.params.postId}, function (err, userpost) {
        if (!err&&userpost) {

            if (userpost.author.toString() == req.user._id.toString()) {
                return next();
            }
        }else{
            console.log(err);
        }
        res.json({access: false, messege:'No rights to this post'})

    })
}
function accessRightImage(req, res, next) {
    console.log(req.params.postId)
    model.images.findOne({_post: req.params.postId}, function (err, userimage) {
        if (!err&&userimage) {

                return next();

        }else{
            console.log(err);
        }

        res.json({access: false,messege:'No rights to this image'})

    })
}
exports.accessRightPost = accessRightPost;
exports.accessRightImage = accessRightImage;