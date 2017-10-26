module.exports = function (app) {
  var isCreated = false; //set to false to create account
  var Account = app.models.account;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  if (!isCreated) {
    Account.create([
      { email: 'admin@csc.com', password: 'admin', firstName: 'admin', lastName: 'admin', emailVerified: true }
    ], function (err, users) {
      if (err) throw err;

      console.log('Created users:', users);

      //create the admin role
      Role.create({
        name: 'admin'
      }, function (err, role) {
        if (err) throw err;

        console.log('Created role:', role);

        //make ldang5 an admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: users[0].id
        }, function (err, principal) {
          if (err) throw err;
          console.log('Created principal:', principal);
        });
      });
    });
  }
};