module.exports = function (app) {
    var Account = app.models.account;
    //verified
    app.get('/verified', function (req, res) {
        res.render('verified');
    });
}