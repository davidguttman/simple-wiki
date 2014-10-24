var fs = require('fs')

/*jshint node:true*/

require('coffee-script/register');
var db = require ('./db.coffee');

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');

// setup middleware
var app = express();
app.use(express.json())
app.use(express.bodyParser());
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// render index page
app.get('/', function(req, res){
	res.render('index');
});

/*
app.get('/api/documents', function(req, res) {
  fs.readdir(__dirname + '/md', function(err, files) {
    var names = files.map(function(file) {return file.replace(/\.md$/, '')})
    res.json(names)
  })
})

app.get('/api/documents/:name', function(req, res) {
  fs.readFile(__dirname + '/md/'+req.params.name + '.md', function(err, buf) {
    if (buf) {
      var data = {markdown: buf.toString()}
      res.json(data)
    } else {
      res.json({})
    }
  })

})

app.post('/api/documents/:name', function(req, res) {
  var name = req.params.name
  var data = req.body || {markdown: ''}
  fs.writeFile(__dirname + '/md/'+name+'.md', data.markdown, function(err) {
    if (err) return res.send(500)
    res.send(200, 'OK')
  })
})
*/

app.get('/services', function(req, res){
  services = JSON.parse(process.env.VCAP_SERVICES || "{}");
  if( typeof(services['mysql-5.5']) != 'undefined' ){
    res.send( services['mysql-5.5'] );
  } else {
    res.send( services );
  }
});


//'create table documents(id int not null auto_increment, handle varchar(255), content text, primary key(id), unique key(handle)'

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

if( typeof(services['mysql-5.5']) != 'undefined' ){
  creds = services['mysql-5.5'][0]['credentials'];
} else {
  creds = {};
}

conn = new db(creds);
app.get('/api/init', function(req, res){
  conn.createTable(function(err, result){
    if( err ){
      res.send(err);
    } else {
      msg = 'table created'
      res.send(msg);
    }
  });
});

app.get('/api/documents', function(req, res) {
  conn.getHandles(function(err, result){
    if( err ){
      res.send(err);
    } else {
      res.json(result)
    }
  });
})

app.get('/api/documents/:name', function(req, res) {
  data = {};
  data.handle = req.params.name;
  conn.getDocument(data, function(err, result){
    if( err ){
      res.send(err);
    } else {
      res.json(result)
    }
  });

})

app.post('/api/documents/:name', function(req, res){
  sent = req.body;
  data = {};
  data.handle = req.params.name;
  data.content = sent.markdown;
  conn.updateDocument(data, function(err, result){
    if( err ){
      res.send(err);
    } else {
      msg = 'Added ' + result.affectedRows + ' rows.';
      res.send(msg);
    }
  });
});


// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);

