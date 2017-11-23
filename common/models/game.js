'use strict';
var app = require('../../server/server');

module.exports = function(Game) {
    Game.remoteMethod(
        'getGameWithTeam',
        {
            description: "Allows get games with information of team home and team away",
            http: { path: '/getGameWithTeam', verb: 'get' },
            accepts: [
                { arg: 'ctx', type: 'object', http: { source: 'context' } }
            ]
        }
    );
    Game.getGameWithTeam = function (ctx, cb) {
        var baseUrl = app.get('url').replace(/\/$/, '');

        try {
            Game.find({include: ['teamHome', 'teamAway']}, function(err, response) {
                if (err) {
                    return next(err);
                }
                else{
                    ctx.res.status(200).json({
                        success: true,
                        message: "",
                        data: response
                    });
                }
            });
        } catch (err) {
            cb(err);
        }
    };
};
