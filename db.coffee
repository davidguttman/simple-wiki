

mysql = require 'mysql'

module.exports = (creds={}) ->
  return new wikiDB creds


class wikiDB
  constructor: (creds) ->
    @db = mysql.createConnection
      host: creds.host ? 'localhost'
      port: creds.port
      user: creds.user ? 'root'
      password: creds.password ? undefined
      database: creds.name ? 'simple-wiki'

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

  saveDocument: (data, cb) ->
    sel = {}
    sel.handle = data.handle
    self = this
    @getDocument data, (err, callback) ->
      if err
        self.createDocument data, cb
      else
        self.updateDocument data, cb

  createDocument: (data, cb) ->
    sql = 'INSERT INTO documents SET ?'
    insert = {}
    for handle, value of data
      insert[handle] = @db.escape value
  
    @db.query sql, insert, (err, result) ->
      if err
        return cb err
      cb null, result

  updateDocument: (data, cb) ->
    sql = 'UPDATE documents SET content="'+data.content+'" WHERE handle="'+data.handle+'"'
    self = this
  
    @db.query sql, (err, result) ->
      if err
        self.createDocument data, cb
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
      data = {}
      data.handle = result[0]?.handle
      data.markdown = result[0]?.content
      cb null, data

  getHandles: (cb) ->
    sql = 'SELECT handle FROM documents'

    @db.query sql, (err, result) ->
      if err
        return cb err
      data = []
      for row in result
        data.push row.handle
      cb null, data

