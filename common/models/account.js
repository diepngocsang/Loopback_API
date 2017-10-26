'use strict';
var path = require('path');

module.exports = function (Account) {
    //send verification email after registration
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
            ctx.res.status(200).json({
                success: true,
                message: "We sent a confirm email to your inbox. Please click in the link in the email to active your account!"
            });
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
                message: "Login failed! Please check your email and password!"
            });
        }
        next();
    });


    Account.afterRemote('login', function (ctx, next) {
        console.log(ctx.result);
        Account.findById(ctx.result.userId, function (err, response) {
            if (err) {
                return next(err);
            }

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
        });
    });

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

};
