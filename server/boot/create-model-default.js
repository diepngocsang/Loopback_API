var async = require('async');

module.exports = function (app) {
    //data sources
    var mongoDs = app.dataSources.mongoDs; 

    var Account = app.models.Account;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var Settings = app.models.Settings;
    var Odd_Type = app.models.Odd_Type;

    var Team = app.models.Team;

    //create all models
    async.parallel({
        roles: async.apply(createRoles),
        admin: async.apply(createAdmin),
        odd_types: async.apply(createOddTypes),
        settings: async.apply(createSettings),
        teams: async.apply(createTeams)
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

    //create Teams
    var arrTeam = [
        {
            teamCode: "RUS", 
            teamName: "RUSSIA", 
            picture: "uploads/images/russia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "BRA", 
            teamName: "BRAZIL", 
            picture: "uploads/images/brazil.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "IRN", 
            teamName: "IRAN", 
            picture: "uploads/images/iran.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "JPN", 
            teamName: "JAPAN", 
            picture: "uploads/images/japan.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "MEX", 
            teamName: "MEXICO", 
            picture: "uploads/images/mexico.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "BEL", 
            teamName: "BELGIUM", 
            picture: "uploads/images/belgium.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "KOR", 
            teamName: "SOUTH KOREA", 
            picture: "uploads/images/south_korea.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "KSA", 
            teamName: "SAUDI ARABIA", 
            picture: "uploads/images/saudi_arabia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "GER", 
            teamName: "GERMANY", 
            picture: "uploads/images/germany.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "ENG", 
            teamName: "ENGLAND", 
            picture: "uploads/images/england.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "ESP", 
            teamName: "SPAIN", 
            picture: "uploads/images/spain.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "NGA", 
            teamName: "NIGERIA", 
            picture: "uploads/images/nigeria.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "CRC", 
            teamName: "COSTA RICA", 
            picture: "uploads/images/costa_rica.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "POL", 
            teamName: "POLAND", 
            picture: "uploads/images/poland.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "EGY", 
            teamName: "EGYPT", 
            picture: "uploads/images/egypt.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "ISL", 
            teamName: "ICELAND", 
            picture: "uploads/images/iceland.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "SRB", 
            teamName: "SERBIA", 
            picture: "uploads/images/serbia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "POR", 
            teamName: "PORTUGAL", 
            picture: "uploads/images/portugal.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "FRA", 
            teamName: "FRANCE", 
            picture: "uploads/images/france.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "URU", 
            teamName: "URUGUAY", 
            picture: "uploads/images/uruguay.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "ARG", 
            teamName: "ARGENTINA", 
            picture: "uploads/images/argentina.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "COL", 
            teamName: "COLOMBIA", 
            picture: "uploads/images/colombia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "PAN", 
            teamName: "PANAMA", 
            picture: "uploads/images/panama.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "SEN", 
            teamName: "SENEGAL", 
            picture: "uploads/images/senegal.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "MAR", 
            teamName: "MOROCCO", 
            picture: "uploads/images/morocco.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "TUN", 
            teamName: "TUNISIA", 
            picture: "uploads/images/tunisia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "SUI", 
            teamName: "SWITZERLAND", 
            picture: "uploads/images/switzerland.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "CRO", 
            teamName: "CROATIA", 
            picture: "uploads/images/croatia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "SWE", 
            teamName: "SWEDEN", 
            picture: "uploads/images/sweden.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "DEN", 
            teamName: "DENMARK", 
            picture: "uploads/images/dermark.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "AUS", 
            teamName: "AUSTRALIA", 
            picture: "uploads/images/australia.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        },{
            teamCode: "PER", 
            teamName: "PERU", 
            picture: "uploads/images/peru.png", 
            group: "", 
            players: [],
            win: "",
            lose: "",
            draw: "",
            goalsAgainst: "",
            goalsDifference: "",
            currentRound: "" 
        }
    ];

    function createTeams(cb){
        Team.count(function(err, count){
            if(err==null&&count==0){
                Team.create( arrTeam, function(err, teams){
                    if (err) throw err;
        
                    console.log('Created teams:', teams);
                });
            }
        });
    }


};