var express = require('express');
var router = express.Router();
var model = require('../../model/db');
var fs = require('fs');
var multiparty = require('multiparty');
var Crypto = require('../../lib/random');
var ensureAuthenticated = require('../../lib/auth');
var accessRight = require('../../lib/accessRight');

// POST /categories/:catname
router.post('/categories/:catname', ensureAuthenticated, async function (req, res, next) {
    try {
        const catname = req.params.catname;
        const cat = new model.categories({ name: catname });
        await cat.save();
        res.json({ accept: true });
    } catch (err) {
        next(err); // Pass error to Express error handler
    }
});

// GET /categories/:catname
router.get('/categories/:catname', async function (req, res, next) {
    try {
        const catname = req.params.catname;
        const pageNumber = parseInt(req.query.page || 1);
        const resultsPerPage = parseInt(req.query.resultsPerPage || 5);
        const skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

        const count = await model.posts.countDocuments({ category: catname });
        const data = await model.posts.find({ category: catname })
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec();
        res.json({ posts: data, pages_count: count });
    } catch (err) {
        next(err);
    }
});

// GET /categories
router.get('/categories', async function (req, res, next) {
    try {
        const data = await model.categories.find().exec();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// GET /search
router.get('/search', async function (req, res, next) {
    try {
        const searchQuery = req.query.q;
        const pageNumber = parseInt(req.query.page || 1);
        const resultsPerPage = parseInt(req.query.resultsPerPage || 5);
        const skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const searchRegex = new RegExp(searchQuery, 'i');
        const count = await model.posts.countDocuments({
            $or: [
                { title: searchRegex },
                { body: searchRegex },
                { excerption: searchRegex }
            ]
        });

        const data = await model.posts.find({
            $or: [
                { title: searchRegex },
                { body: searchRegex },
                { excerption: searchRegex }
            ]
        })
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec();

        res.json({ posts: data, pages_count: count });
    } catch (err) {
        next(err);
    }
});

// GET /:postId
router.get('/:postId', async function (req, res, next) {
    try {
        const postId = req.params.postId;
        const post = await model.posts.findOne({ _id: postId })
            .populate('image', 'path')
            .populate('author', 'nickname')
            .exec();
        if (post) {
            res.json(post);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        next(err);
    }
});

// GET /author/:username
router.get('/author/:username', async function (req, res, next) {
    try {
        const username = req.params.username;
        const pageNumber = parseInt(req.query.page || 1);
        const resultsPerPage = parseInt(req.query.resultsPerPage || 5);
        const skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

        const count = await model.posts.countDocuments({ author: username }); // Fixed to count author's posts
        const data = await model.posts.find({ author: username })
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec();
        res.json({ posts: data, pages_count: count });
    } catch (err) {
        next(err);
    }
});

// GET /
router.get('/', async function (req, res, next) {
    try {
        const pageNumber = parseInt(req.query.page || 1);
        const resultsPerPage = parseInt(req.query.resultsPerPage || 5);
        const skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

        const count = await model.posts.countDocuments({});
        const data = await model.posts.find()
            .skip(skipFrom)
            .limit(resultsPerPage)
            .populate('image', 'path')
            .populate('author', 'displayName')
            .sort('-date')
            .exec();
        res.json({ posts: data, pages_count: count });
    } catch (err) {
        next(err);
    }
});

// POST /
router.post('/', ensureAuthenticated, function (req, res, next) {
    const form = new multiparty.Form({ autoFields: false, autoFiles: false });
    const post = {};
    form.on('close', function () {
        const newPost = new model.posts({
            author: req.user._id,
            title: post['title'],
            body: post['body'],
            excerption: post['excerption'],
            category: post['category']
        });
        newPost.save()
            .then((savedPost) => {
                res.json({ access: true, postID: savedPost._id });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
        next(err);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });
    form.parse(req);
});

// PUT /:postId
router.put('/:postId', ensureAuthenticated, accessRight.accessRightPost, function (req, res, next) {
    const postId = req.params.postId;
    const form = new multiparty.Form({ autoFields: false, autoFiles: false });
    const post = {};
    form.on('close', function () {
        model.posts.updateOne({ _id: postId }, {
            title: post['title'],
            body: post['body'],
            excerption: post['excerption'],
            category: post['category']
        })
            .then((result) => {
                if (result.matchedCount > 0) {
                    res.json({ access: true });
                } else {
                    res.status(404).send('Post not found');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });
    form.on('error', function (err) {
        console.log('Error parsing form: ' + err.stack);
        next(err);
    });
    form.on('field', function (name, value) {
        post[name] = value;
    });
    form.parse(req);
});

// DELETE /:postId
router.delete('/:postId', ensureAuthenticated, accessRight.accessRightPost, async function (req, res, next) {
    try {
        const postId = req.params.postId;
        const result = await model.posts.deleteOne({ _id: postId });
        if (result.deletedCount > 0) {
            res.json({ access: true });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        next(err);
    }
});

// POST /image/:postId
router.post('/image/:postId', ensureAuthenticated, accessRight.accessRightPost, function (req, res, next) {
    const postId = req.params.postId;
    res.json({ access: false }); // Disable image upload without S3
});

// DELETE /image/:postId
router.delete('/image/:postId', ensureAuthenticated, accessRight.accessRightImage, function (req, res, next) {
    const postId = req.params.postId;
    res.json({ access: false }); // Disable image delete without S3
});

module.exports = router;
