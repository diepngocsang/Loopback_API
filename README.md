# Loopback_API

#### Step 1:
Install and setup mongodb:
1. Install mongodb using brew command:
    ```bash
        brew install mongodb
    ```
and then start services:
    ```bash
        brew services start mongodb
    ```
and create a new mongodb database:
    ```bash
        mongo {{database name}}
    ```
2. Other usefull commands:
    ```bash
        use {{database name}} //using our database
    ```
    ```bash
        show dbs //show database list
    ```
    ```bash
        db // check current selected database
    ```
    ```bash
        db.dropDatabase() // drop current database
    ```
3. Install robomongo studio 3T to view the database visually: https://robomongo.org/

#### Step 2:
Install and setup loopback
```bash
$ npm install -g loopback-cli
```
1. Configure datasource.js
    Copy and paste mongodb url:
    ```bash
    "mydb": {
        "host": "127.0.0.1",
        "port": 27017,
        "url": "mongodb://127.0.0.1:27017/betapp",
        "database": "betapp",
        "password": "",
        "name": "mydb",
        "user": "",
        "connector": "mongodb"
    }
    ```
2. Configure model-config.json:
    ```bash
        "test": {
            "dataSource": "mydb",
            "public": true
        }
    ```
#### Step 3:
- Start server by runing this command
```bash
    node .
```
- Open url: http://localhost:3000/explorer to view api list

#### Step 4:
Configure event stream in loopback:
1. npm install -save event-stream
2. Disable compression:
server/middleware.json
"compression": {
  "enabled":false
},
3. Below is a basic example using the createChangeStream() method in a LoopBack application.
server/boot/realtime.js
var es = require('event-stream');
module.exports = function(app) {
  var MyModel = app.models.Test;
  MyModel.createChangeStream(function(err, changes) {
    changes.pipe(es.stringify()).pipe(process.stdout);
  });
}

This example will print the following to the console:

{"target":1,"data":{"foo":"bar","id":1},"type":"create"}

4. Client-side:
npm install eventsource --save

import * as EventSource from 'eventsource';

let src = new EventSource('http://localhost:3000/api/tests/change-stream?_format=event-stream');
    src.addEventListener('data', (msg) => {
      console.log(JSON.parse(msg.data)); // the change object
    });

To push data, the model on the server must change; for example, if you add a new record (model instance).

When this occurs, then in the browser JavaScript console, you will see (for example):

Object {target: 2, data: Object, type: "create"}