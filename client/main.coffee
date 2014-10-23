mercury = require 'mercury'
{struct, array, value} = mercury
{h, event, input} = mercury

api = require './api.coffee'
parseMarkdown = require 'marked/lib/marked'

module.exports = List = (@el) ->
  @state = struct
    currentTitle: value getHash()
    currentMarkdown: value ''
    isLoading: value false
    isEditing: value false

  @events = input ['changeDoc']
  @events.changeDoc @changeDoc

  mercury.app @el, @state, @render.bind(this)

  @changeDoc @state.currentTitle()
  window.addEventListener 'hashchange', (evt) =>
    @changeDoc getHash()

List::changeDoc = (title) ->
  location.hash = '/' + title
  @state.currentTitle.set title
  @state.isLoading.set true
  api.getDocument title, (err, data) =>
    @state.isLoading.set false
    if data and data.markdown
      @state.currentMarkdown.set data.markdown
    else
      @state.isEditing.set true
      @state.currentMarkdown.set 'This is a new page. Create it now!'

List::render = (state) ->
  h '.mainView.row', [

    h '.mainView-header', [
      h 'h1', state.currentTitle
    ]

    if state.isLoading
      @renderLoading()
    else

      if state.isEditing
        h '.mainView-edit', [
          h 'textarea.form-control',
            rows: 20
          , state.currentMarkdown
        ]
      else
        h '.mainView-view', [
          h '.markdown', [
            h '', innerHTML: parseMarkdown state.currentMarkdown
          ]
        ]

  ]


List::renderLoading = ->
  img = '/loading.gif'
  h 'img',
    src: img
    style:
      position: 'absolute'
      top: 10
      right: 10

getHash = ->
  location.hash.replace /^#\//, ''
