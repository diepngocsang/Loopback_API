'use strict';
var path = require('path');
var config = require('../../server/config.json');

module.exports = function (Account) {
    //--------REGISTRATION---------------
    // POST: http://localhost:3000/api/accounts
    // INPUT: {
    //   "firstName": "Ly",
    //   "lastName": "Dang",
    //   "email": "ldang5@csc.com",
    //   "password": "abc123"
    // }
    //OUTPUT: {
    //     "success": true,
    //     "message": "We sent a confirm email to your inbox. Please click in the link in the email to active your account!"
    // }

    Account.beforeRemote('create', function (ctx, account, next) {
        //check if email is not csc
        if (ctx.req.body.email.indexOf("@csc.com") == -1) {
            ctx.res.status(200).json({
                success: false,
                message: "Please use your csc email to register!"
            });
        }
        next();
    });

    Account.afterRemote('create', function (ctx, account, next) {
        var options = {
            type: 'email',
            to: account.email,
            from: 'Smart Bet',
            subject: 'Thanks for registering.',
            template: path.resolve(__dirname, '../../server/views/verify.ejs'),
            redirect: '/verified',
            user: account
        };

        account.verify(options, function (err, response) {
            if (err) {
                Account.deleteById(account.id);
                return next(err);
            }
            else {
                ctx.res.status(200).json({
                    success: true,
                    message: "We sent a confirm email to your inbox. Please click in the link in the email to active your account!"
                });
            }
        });
    });

    Account.afterRemoteError('create', function (ctx, next) {
        //if account already exist, then check email verified or not
        if (ctx.error.statusCode == 422 && ctx.error.message.indexOf("Email already exists") > -1) {
            ctx.res.status(422).json({
                success: false,
                message: "Email already exists! If you are not activate your account, please go to your email and following instruction. "
            });
        }
        next();
    });
    //--------END REGISTRATION---------------

    //--------LOGIN---------------
    // POST: http://localhost:3000/api/accounts/login
    // INPUT: {
    //   "email": "ldang5@csc.com",
    //   "password": "abc123"
    // }
    //OUTPUT: {
    //     "success": true,
    //     "message": "",
    //     "data": {
    //         "ttl": 1209600,
    //         "userId": "59f29cafdb7a5dcee195745b",
    //         "created": "2017-10-27T06:11:09.948Z",
    //         "id": "5Vw3aFVllZl1X8tXmBJ2JXVAy9tWGAz0uh82XxFJV2rzQeDI3bqvBIo69hFx0aiR",
    //         "firstName": "Ly",
    //         "lastName": "Dang",
    //         "email": "ldang5@csc.com"
    //     }
    // }
    // POST: http://localhost:3000/api/accounts/logout
    // INPUT:  REQUEST HEADER
    //   "Authorization": "5Vw3aFVllZl1X8tXmBJ2JXVAy9tWGAz0uh82XxFJV2rzQeDI3bqvBIo69hFx0aiR",
    //OUTPUT: {
    //     "success": true,
    //     "message": ""}

    Account.afterRemoteError('login', function (ctx, next) {
        //if LOGIN_FAILED_EMAIL_NOT_VERIFIED
        if (ctx.error.statusCode == 401 && ctx.error.code == "LOGIN_FAILED_EMAIL_NOT_VERIFIED") {
            ctx.res.status(401).json({
                success: false,
                message: "Login failed as the email has not been verified!"
            });
        }
        //if LOGIN_FAILED
        if (ctx.error.statusCode == 401 && ctx.error.code == "LOGIN_FAILED") {
            ctx.res.status(401).json({
                success: false,
                message: "Login failed! Please check again your email and password!"
            });
        }
        next();
    });


    Account.afterRemote('login', function (ctx, next) {

        Account.findById(ctx.result.userId, function (err, response) {
            if (err) {
                return next(err);
            }
            else {
                ctx.res.status(200).json({
                    success: true,
                    message: "",
                    data: {
                        ttl: ctx.result.ttl,
                        userId: ctx.result.userId,
                        created: ctx.result.created,
                        id: ctx.result.id,
                        firstName: response.firstName,
                        lastName: response.lastName,
                        email: response.email
                    }
                });
            }
        });
    });
    //--------END LOGIN---------------

    //--------CHANGE PASSWORD---------------
    // PUT: http://localhost:3000/api/accounts/changePassword
    //REQUEST HEADER: Authorization: "5Vw3aFVllZl1X8tXmBJ2JXVAy9tWGAz0uh82XxFJV2rzQeDI3bqvBIo69hFx0aiR"
    // INPUT: {
    //   "emailVerify": "ldang5@csc.com",
    //   "oldPassword": "admin123",
    //   "newPassword": "pass"
    // }
    //OUTPUT: {
    //     "success": true,
    //     "message": ""}

    Account.changePassword = function (ctx, emailVerify, oldPassword, newPassword, cb) {
        var newErrMsg, newErr;
        try {
            this.findOne({ where: { id: ctx.req.accessToken.userId, email: emailVerify } }, function (err, user) {
                if (err) {
                    cb(err);
                } else if (!user) {
                    ctx.res.status(401).json({
                        success: false,
                        message: "No match between provided current logged user and email!",
                    });
                } else {
                    user.hasPassword(oldPassword, function (err, isMatch) {
                        if (isMatch) {

                            user.updateAttributes({ 'password': newPassword }, function (err, instance) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(null, true);
                                }
                            });
                        } else {
                            ctx.res.status(401).json({
                                success: false,
                                message: "You are specified wrong current password!",
                            });
                        }
                    });
                }
            });
        } catch (err) {
            cb(err);
        }
    };

    Account.remoteMethod(
        'changePassword',
        {
            description: "Allows a logged user to change his/her password.",
            http: { verb: 'put' },
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'emailVerify', type: 'string', required: true, description: "The user email, just for verification" },
                { arg: 'oldPassword', type: 'string', required: true, description: "The user old password" },
                { arg: 'newPassword', type: 'string', required: true, description: "The user NEW password" }
            ]
        }
    );
    //--------END CHANGE PASSWORD---------------

    //--------FORGOT PASSWORD---------------
    // POST: http://localhost:3000/api/accounts/forgotPassword
    // INPUT: {
    //   "email": "ldang5@csc.com"
    // }
    //OUTPUT: {
    //     "success": true,
    //     "message": "Password reset requested. Check your email for further instructions."}


    //send password reset link when requested
    Account.on('resetPasswordRequest', function (info) {
        var url = 'http://' + config.host + ':' + config.port + '/forgot-password';
        var html = 'Click <a href="' + url + '?access_token=' +
            info.accessToken.id + '">here</a> to reset your password';

        Account.app.models.Email.send({
            to: info.email,
            from: 'Smart Bet',
            subject: 'Password reset',
            html: html
        }, function (err) {
            if (err) return console.log('> error sending password reset email');
            console.log('> sending password reset email to:', info.email);
        });
    });

    //render UI page after password reset
    Account.afterRemote('setPassword', function (ctx, account, next) {
        ctx.res.render('response', {
            title: 'Password reset success',
            content: 'Your password has been reset successfully'
        });
    });

    Account.forgotPassword = function (ctx, email, cb) {
        var newErrMsg, newErr;
        try {
            this.findOne({ where: { email: email } }, function (err, user) {
                if (err) {
                    cb(err);
                } else if (!user) {
                    ctx.res.status(401).json({
                        success: false,
                        message: "You have not create account with BetApp!",
                    });
                } else {
                    Account.resetPassword({
                        email: email
                    }, function (err) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            //send email to
                            ctx.res.status(200).json({
                                success: true,
                                message: 'Password reset requested. Check your email for further instructions.'
                            });
                        }
                    });
                }
            });
        } catch (err) {
            cb(err);
        }
    };

    Account.remoteMethod(
        'forgotPassword',
        {
            description: "Allows a user to reset their password.",
            http: { verb: 'post' },
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } },
                { arg: 'email', type: 'string', required: true, description: "The user email, just for verification" }
            ]
        }
    );

    Account.afterRemoteError('forgotPassword', function (ctx, next) {
        //if RESET_FAILED_EMAIL_NOT_VERIFIED
        if (ctx.error.statusCode == 401 && ctx.error.code == "RESET_FAILED_EMAIL_NOT_VERIFIED") {
            ctx.res.status(401).json({
                success: false,
                message: "Email has not been verified! Please go to your email and following instruction!"
            });
        }
        next();
    });
    //--------END FORGOT PASSWORD---------------
};
