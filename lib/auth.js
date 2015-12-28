function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
    {
        return next(null);
    }

    res.json({access:false})
}

module.exports = ensureAuthenticated;