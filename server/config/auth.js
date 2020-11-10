module.exports = {
    // This protects user from accessing urls
    // by typing them in without being authenticated
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.status(401).send('Please log in to view this resource');
    }
}
