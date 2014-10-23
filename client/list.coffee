mercury = require 'mercury'
{struct, array, value} = mercury
{h, event, input} = mercury

api = require './api.coffee'

module.exports = List = (@el) ->
  @state = struct
    documents: array []
    isLoading: value true

  @events = input []

  mercury.app @el, @state, @render.bind(this)

  @loadDocuments()

List::loadDocuments = ->
  @state.isLoading.set true
  api.getAllDocuments (err, docs) =>
    @state.isLoading.set false
    @state.documents.push doc for doc in docs
    # @state.documents.set array docs

List::render = (state) ->
  h '.listView', [

    if state.isLoading
      @renderLoading()
    else
      h '.row', [
        h '.col-xs-12', [
          h 'h3', 'Simple Wiki'
          h '.listView-search', [
            h 'input.form-control', placeholder: 'Search'
          ]
          h 'br'
          h 'ul.list-group', state.documents.map @renderDoc.bind(this)
        ]
      ]

  ]

List::renderDoc = (doc) ->
  h 'li.list-group-item', [
    h 'a.btn.btn-link',
      href: '#/' + doc
    , doc
  ]

List::renderLoading = ->
  img = '/loading.gif'
  h 'img',
    src: img
    style:
      position: 'absolute'
      top: 10
      right: 10
