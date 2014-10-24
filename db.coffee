

mysql = require 'mysql'

module.exports = (creds={}) ->
  return new wikiDB creds


class wikiDB
  constructor: (creds) ->
    @db = mysql.createConnection
      host: creds.host,
      port: creds.port,
      user: creds.user,
      password: creds.password,
      database: creds.name

  createTable: (cb) ->
    sql = 'CREATE TABLE IF NOT EXISTS documents ('
    sql += 'id INTEGER PRIMARY KEY AUTO_INCREMENT, '
    sql += 'handle varchar(255), '
    sql += 'content text, unique key(handle)'
    sql += ');'

    @db.query sql, (err, result) ->
      if err
        return cb err
      cb null, result

  createDocument: (data, cb) ->
    sql = 'INSERT INTO documents SET ?'
  
    @db.query sql, data, (err, result) ->
      if err
        return cb err
      cb null, result

  updateDocument: (data, cb) ->
    sql = 'INSERT INTO documents SET ?'
  
    @db.query sql, data, (err, result) ->
      if err
        return cb err
      cb null, result

  getDocument: (data, cb) ->
    if data?
      sql = 'SELECT * FROM documents WHERE '
      for handle, value of data
        sql += handle+'="'+value+'"'
    else
      sql = 'SELECT * FROM documents'

    @db.query sql, (err, result) ->
      if err
        return cb err
      cb null, result

  getHandles: (cb) ->
    sql = 'SELECT handle FROM documents'

    @db.query sql, (err, result) ->
      if err
        return cb err
      cb null, result

