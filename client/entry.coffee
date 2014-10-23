ListView = require './list.coffee'
MainView = require './main.coffee'

main = document.querySelector '.main'
list = document.querySelector '.list'

mv = new MainView main
list = new ListView list
