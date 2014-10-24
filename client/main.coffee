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

  @events = input ['changeDoc', 'setEdit', 'setPreview']
  @events.changeDoc @changeDoc
  @events.setEdit @setEdit
  @events.setPreview @setPreview

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
      @state.isEditing.set false
      @state.currentMarkdown.set data.markdown
    else
      @state.isEditing.set true
      @state.currentMarkdown.set ''

List::setEdit = -> @state.isEditing.set true
List::setPreview = -> @state.isEditing.set false

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
          h '.mainView-editStatus', [
            h 'button.btn.btn-default.active',
              'ev-click': => @setEdit()
            , 'Edit'
            h 'button.btn.btn-default',
              'ev-click': => @setPreview()
            , 'Preview'
          ]

          h 'textarea.form-control',
            'ev-change': (evt) => @updateMarkdown evt.target.value
            rows: 20
            placeholder: 'This is a new page. Create it now!'
          , state.currentMarkdown
        ]
      else

        h '.mainView-view', [
          h '.mainView-editStatus', [
            h 'button.btn.btn-default',
              'ev-click': => @setEdit()
            , 'Edit'

            h 'button.btn.btn-default.active',
              'ev-click': => @setPreview()
            , 'Preview'
          ]

          h '.markdown', [
            h '', innerHTML: parseMarkdown state.currentMarkdown
          ]
        ]

  ]

List::updateMarkdown = (val) ->
  @state.currentMarkdown.set val
  api.saveDocument @state.currentTitle(), val, ->

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
