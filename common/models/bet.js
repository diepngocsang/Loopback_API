'use strict';

module.exports = function(Bet) {
    Bet.beforeRemote('create', function(context, user, next) {
        //context.args.data.date = Date.now();
        context.args.data.userId = context.req.accessToken.userId;

        next();
    });
};
