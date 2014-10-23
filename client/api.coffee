superagent = require 'superagent'

module.exports = api =
  getAllDocuments: (cb) -> get '/api/documents', cb
  getDocument: (name, cb) -> get '/api/documents/' + name, cb

get = (url, cb) ->
  superagent.get(url).end (err, res) ->
    return cb err if err

    if res.status >= 400
      err = [res.status, res.body].join ': '
    else
      err = null

    cb err, res.body

post = (url, data, cb) ->
  superagent.post(url)
    .send(data)
    .end (err, res) ->
      return cb err if err

      if res.status >= 400
        err = [res.status, res.body].join ': '
      else
        err = null

      cb err, res.body
