module.exports = function (app) {
    var Account = app.models.account;
    //verified
    app.get('/verified', function (req, res) {
        res.render('verified');
    });
    //show password reset form
    app.get('/forgot-password', function (req, res) {
        console.log(req.accessToken);
        if (!req.accessToken) return res.sendStatus(401);
        res.render('password-reset', {
            redirectUrl: '/api/accounts/reset-password?access_token=' +
            req.accessToken.id
        });
    });
}