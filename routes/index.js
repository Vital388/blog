/**
 * Created by Lollypop on 02.12.2015.
 */
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/partials/:part', function (req, res, next) {
    var name = req.params.part;
    res.render('partials/' + name);
});
module.exports = router;