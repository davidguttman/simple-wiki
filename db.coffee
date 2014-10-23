

mysql = require 'mysql'

module.exports = (opts={}) ->
  me = new wikiDB(opts)
  return me


class wikiDB
  constructor: (creds) ->
    @db = mysql.createConnection
      host: creds.host,
      port: creds.port,
      user: creds.user,
      password: creds.password,
      database: creds.name

    @createTable()

  createTable: ->
    sql = 'CREATE TABLE IF NOT EXISTS documents ('
            + 'id INTEGER PRIMARY KEY AUTO_INCREMENT, '
            + 'handle varchar(255), '
            + 'content text UNIQUE KEY'
          + ');'
    @db.query sql, (err, result) ->
      if err
        console.log err

  addDoc: ->

