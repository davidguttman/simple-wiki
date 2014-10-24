ListView = require './list.coffee'
MainView = require './main.coffee'

main = document.querySelector '.main'
list = document.querySelector '.list'

if (window.location.hash is '') or
  (window.location.hash is '#') or
  (window.location.hash is '#/')
    window.location.hash = '/Welcome'

mv = new MainView main
list = new ListView list
