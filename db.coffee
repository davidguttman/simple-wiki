mysql = require 'mysql'
streamsql = require 'streamsql'

module.exports = (creds={}) ->
  return new wikiDB creds

class wikiDB
  constructor: (creds) ->
    @db = streamsql.connect
      driver: 'mysql'
      host: creds.host ? 'localhost'
      port: creds.port
      user: creds.user ? 'root'
      password: creds.password ? undefined
      database: creds.name ? 'simple-wiki'

    @documents = @db.table 'documents',
      fields: [
        'id'
        'handle'
        'content'
      ]

  createTable: (cb) ->
    sql = 'CREATE TABLE IF NOT EXISTS documents ('
    sql += 'id INTEGER PRIMARY KEY AUTO_INCREMENT, '
    sql += 'handle varchar(255), '
    sql += 'content text, unique key(handle)'
    sql += ');'

    @db.query sql, cb

  saveDocument: (data, cb) ->
    sel = {}
    sel.handle = data.handle
    self = this
    @documents.put data, {uniqueKey: 'handle'}, cb

  createDocument: (data, cb) ->
    sql = 'INSERT INTO documents SET ?'
    insert = {}
    for handle, value of data
      insert[handle] = value
  
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
    @documents.getOne data, (err, result) ->
      return cb err if err
      out = {}
      out.name = result?.handle
      out.markdown = result?.content
      cb null, out

  deleteDocument: (data, cb) ->
    if data?
      sql = 'DELETE FROM documents WHERE '
      for handle, value of data
        sql += handle+'="'+value+'"'

      @db.query sql, (err, result) ->
        if err
          return cb err
        cb null, result

  getHandles: (cb) ->
    sql = 'SELECT handle FROM documents'

    @db.query sql, (err, result) ->
      if err
        return cb err
      data = []
      for row in result
        data.push row.handle
      cb null, data

  clearAll: (cb) ->
    sql = 'DELETE FROM documents'

    @db.query sql, (err, result) ->
      if err
        return cb err
      cb null, data

