'use strict';
var path = require('path');
var config = require('../../server/config.json');
var app = require('../../server/server');

module.exports = function(Team) {
    Team.remoteMethod(
        'updateUrlPicture',
        {
            description: "Allows a team to update url picture after upload success.",
            http: { path: '/:id/updateUrlPicture', verb: 'post' },
            accepts: [
                { arg: 'id', type: 'string', required: true },
                { arg: 'data', type: 'object', http: { source: 'body' } },
            ]
        }
    );
    Team.updateUrlPicture = function (id, data, cb) {
        var baseUrl = app.get('url').replace(/\/$/, '');

        try {
            this.findOne({ where: { _id: id } }, function (err, team) {
                if (err) {
                    cb(err);
                } else if (!team) {
                    ctx.res.status(401).json({
                        success: false,
                        message: "You have not create team with BetApp!",
                    });
                } else {
                    var newUrlPicture = baseUrl + config.urlPicture + data.picture;
                    team.updateAttributes({ 'picture': newUrlPicture }, function (err, instance) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, true);
                        }
                    });
                }
            });
        } catch (err) {
            cb(err);
        }
    };
};
