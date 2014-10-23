

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
    sql += 'id INTEGER PRIMARY KEY AUTO_INCREMENT, '
    sql += 'handle varchar(255), '
    sql += 'content text UNIQUE KEY'
    sql += ');'

    @db.query sql, (err, result) ->
      if err
        console.log err

  #addDoc: ->

