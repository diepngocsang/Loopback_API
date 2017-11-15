var async = require('async');

module.exports = function (app) {
    //data sources
    var mongoDs = app.dataSources.mongoDs; 

    var Account = app.models.Account;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var Settings = app.models.Settings;
    var Odd_Type = app.models.Odd_Type;

    //create all models
    async.parallel({
        roles: async.apply(createRoles),
        admin: async.apply(createAdmin),
        odd_types: async.apply(createOddTypes),
        settings: async.apply(createSettings)
    }, function(err, results) {
        if (err) throw err;

        console.log('> models created sucessfully');
    });

    //createRoles
    function createRoles(cb){
        Role.count(function(err, count){
            if(err==null&&count==0){
                Role.create([{
                    name: 'admin'
                },{
                    name: 'user'
                }], function(err, roles){
                    if (err) throw err;
        
                    console.log('Created roles:', roles);
                });
            }
        });
    }

    //create Odd_Type
    function createOddTypes(cb){
        Odd_Type.count(function(err, count){
            if(err==null&&count==0){
                Odd_Type.create([{
                    typeId: 'TaiXiu',
                    typeCode: 'Tai Xiu', 
                    key: ['Over', 'Under']
                },{
                    typeId: 'EUFull',
                    typeCode: 'Euro Fulltime', 
                    key: ['Home', 'Away', 'Draw']
                }], function(err, odd_types){
                    if (err) throw err;
        
                    console.log('Created odd_types:', odd_types);
                });
            }
        });
    }

    //create Settings
    function createSettings(cb){
        Settings.count(function(err, count){
            if(err==null&&count==0){
                Settings.create([{
                    defaultPoint: 1000, 
                    minBet: 10, 
                    maxBet: 100, 
                    betBeforeTime: 2*60*60, 
                    pointAdded: 1000 
                }], function(err, settings){
                    if (err) throw err;
        
                    console.log('Created settings:', settings);
                });
            }
        });
    }

    //create Admin Account
    function createAdmin(cb) {
        Account.findOne({where: {email: 'admin@csc.com'}}, function(err, account) { 
            // console.log(err, account);
            if(err==null&&account==null){
                mongoDs.automigrate('Account', function(err) {
                    if (err) return cb(err);
         
                     Account.create([{
                         email: 'admin@csc.com', 
                         userName: 'Administrator',
                         password: 'admin', 
                         firstName: 'Admin', 
                         lastName: 'The', 
                         emailVerified: true
                     }], function(err, users){
                        if (err) throw err;
         
                        console.log('Created users:', users);
                        Role.findOne({where: { name: 'admin' }}, function (err, role) {
                             if (err) throw err;
         
                            console.log(role);
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
        });
    }

    


};