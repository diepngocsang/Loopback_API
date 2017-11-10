var async = require('async');

module.exports = function (app) {
    //data sources
    var mongoDs = app.dataSources.mongoDs; 

    var Account = app.models.Account;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    //create all models
    // async.parallel({
    //     //users: async.apply(createUsers)
    // }, function(err, results) {
    //     if (err) throw err;
    //     console.log('> models created sucessfully');
    // });

    createUsers();

    //create users
    function createUsers(cb) {
        mongoDs.automigrate('Account', function(err) {
            if (err) return cb(err);

            Account.create([{
                email: 'admin@csc.com', 
                password: 'admin', 
                firstName: 'Admin', 
                lastName: 'The', 
                emailVerified: true
            }], function(err, users){
                if (err) throw err;

                console.log('Created users:', users);
                Role.create({
                    name: 'admin'
                }, function (err, role) {
                    if (err) throw err;

                    console.log('Created role:', role);
                    role.principals.create({
                        principalType: RoleMapping.USER,
                        principalId: users[0].id
                    }, function (err, principal) {
                        if (err) throw err;
                        console.log('Created principal:', principal);
                    });
                });
            });
        });
    }

    // var Account = app.models.account;
    // var Role = app.models.Role;
    // var RoleMapping = app.models.RoleMapping;

    // if (!isCreated) {
    //   Account.create([
    //     { email: 'admin@csc.com', password: 'admin', firstName: 'admin', lastName: 'admin', emailVerified: true }
    //   ], function (err, users) {
    //     if (err) throw err;

    //     console.log('Created users:', users);

    //     //create the admin role
    //     Role.create({
    //       name: 'admin'
    //     }, function (err, role) {
    //       if (err) throw err;

    //       console.log('Created role:', role);

    //       //make ldang5 an admin
    //       role.principals.create({
    //         principalType: RoleMapping.USER,
    //         principalId: users[0].id
    //       }, function (err, principal) {
    //         if (err) throw err;
    //         console.log('Created principal:', principal);
    //       });
    //     });
    //   });
    // }
};