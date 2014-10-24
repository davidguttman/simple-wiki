(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/dguttman/test/simple-wiki/client/api.coffee":[function(require,module,exports){
var api, get, post, superagent;

superagent = require('superagent');

module.exports = api = {
  getAllDocuments: function(cb) {
    return get('/api/documents', cb);
  },
  getDocument: function(name, cb) {
    return get('/api/documents/' + name, cb);
  },
  saveDocument: function(name, md, cb) {
    var url;
    url = '/api/documents/' + name;
    return post(url, {
      markdown: md
    }, cb);
  }
};

get = function(url, cb) {
  return superagent.get(url).end(function(err, res) {
    if (err) {
      return cb(err);
    }
    if (res.status >= 400) {
      err = [res.status, res.body].join(': ');
    } else {
      err = null;
    }
    return cb(err, res.body);
  });
};

post = function(url, data, cb) {
  return superagent.post(url).send(data).end(function(err, res) {
    if (err) {
      return cb(err);
    }
    if (res.status >= 400) {
      err = [res.status, res.body].join(': ');
    } else {
      err = null;
    }
    return cb(err, res.body);
  });
};



},{"superagent":"/Users/dguttman/test/simple-wiki/node_modules/superagent/lib/client.js"}],"/Users/dguttman/test/simple-wiki/client/entry.coffee":[function(require,module,exports){
var ListView, MainView, list, main, mv;

ListView = require('./list.coffee');

MainView = require('./main.coffee');

main = document.querySelector('.main');

list = document.querySelector('.list');

if ((window.location.hash === '') || (window.location.hash === '#') || (window.location.hash === '#/')) {
  window.location.hash = '/Welcome';
}

mv = new MainView(main);

list = new ListView(list);



},{"./list.coffee":"/Users/dguttman/test/simple-wiki/client/list.coffee","./main.coffee":"/Users/dguttman/test/simple-wiki/client/main.coffee"}],"/Users/dguttman/test/simple-wiki/client/list.coffee":[function(require,module,exports){
var List, api, array, event, h, input, mercury, struct, value;

mercury = require('mercury');

struct = mercury.struct, array = mercury.array, value = mercury.value;

h = mercury.h, event = mercury.event, input = mercury.input;

api = require('./api.coffee');

module.exports = List = function(el) {
  this.el = el;
  this.state = struct({
    documents: array([]),
    isLoading: value(true)
  });
  this.events = input([]);
  mercury.app(this.el, this.state, this.render.bind(this));
  return this.loadDocuments();
};

List.prototype.loadDocuments = function() {
  this.state.isLoading.set(true);
  return api.getAllDocuments((function(_this) {
    return function(err, docs) {
      var doc, _i, _len, _results;
      _this.state.isLoading.set(false);
      _results = [];
      for (_i = 0, _len = docs.length; _i < _len; _i++) {
        doc = docs[_i];
        _results.push(_this.state.documents.push(doc));
      }
      return _results;
    };
  })(this));
};

List.prototype.render = function(state) {
  return h('.listView', [
    state.isLoading ? this.renderLoading() : h('.row', [
      h('.col-xs-12', [
        h('h3', 'Simple Wiki'), h('form.listView-search', {
          'ev-submit': function(evt) {
            input = evt.target.querySelector('input');
            window.location.hash = '/' + input.value;
            return false;
          }
        }, [
          h('input.form-control', {
            placeholder: 'Create'
          })
        ]), h('br'), h('ul.list-group', state.documents.map(this.renderDoc.bind(this)))
      ])
    ])
  ]);
};

List.prototype.renderDoc = function(doc) {
  return h('li.list-group-item', [
    h('a.btn.btn-link', {
      href: '#/' + doc
    }, doc)
  ]);
};

List.prototype.renderLoading = function() {
  var img;
  img = '/loading.gif';
  return h('img', {
    src: img,
    style: {
      position: 'absolute',
      top: 10,
      right: 10
    }
  });
};



},{"./api.coffee":"/Users/dguttman/test/simple-wiki/client/api.coffee","mercury":"/Users/dguttman/test/simple-wiki/node_modules/mercury/index.js"}],"/Users/dguttman/test/simple-wiki/client/main.coffee":[function(require,module,exports){
var List, api, array, event, getHash, h, input, mercury, parseMarkdown, struct, value;

mercury = require('mercury');

struct = mercury.struct, array = mercury.array, value = mercury.value;

h = mercury.h, event = mercury.event, input = mercury.input;

api = require('./api.coffee');

parseMarkdown = require('marked/lib/marked');

module.exports = List = function(el) {
  this.el = el;
  this.state = struct({
    currentTitle: value(getHash()),
    currentMarkdown: value(''),
    isLoading: value(false),
    isEditing: value(false)
  });
  this.events = input(['changeDoc', 'setEdit', 'setPreview']);
  this.events.changeDoc(this.changeDoc);
  this.events.setEdit(this.setEdit);
  this.events.setPreview(this.setPreview);
  mercury.app(this.el, this.state, this.render.bind(this));
  this.changeDoc(this.state.currentTitle());
  return window.addEventListener('hashchange', (function(_this) {
    return function(evt) {
      return _this.changeDoc(getHash());
    };
  })(this));
};

List.prototype.changeDoc = function(title) {
  if (!title) {
    return;
  }
  location.hash = '/' + title;
  this.state.currentTitle.set(title);
  this.state.isLoading.set(true);
  return api.getDocument(title, (function(_this) {
    return function(err, data) {
      _this.state.isLoading.set(false);
      if (data && data.markdown) {
        _this.state.isEditing.set(false);
        return _this.state.currentMarkdown.set(data.markdown);
      } else {
        _this.state.isEditing.set(true);
        return _this.state.currentMarkdown.set('');
      }
    };
  })(this));
};

List.prototype.setEdit = function() {
  return this.state.isEditing.set(true);
};

List.prototype.setPreview = function() {
  return this.state.isEditing.set(false);
};

List.prototype.render = function(state) {
  return h('.mainView.row', [
    h('.mainView-header', [h('h1', state.currentTitle)]), state.isLoading ? this.renderLoading() : state.isEditing ? h('.mainView-edit', [
      h('.mainView-editStatus', [
        h('button.btn.btn-default.active', {
          'ev-click': (function(_this) {
            return function() {
              return _this.setEdit();
            };
          })(this)
        }, 'Edit'), h('button.btn.btn-default', {
          'ev-click': (function(_this) {
            return function() {
              return _this.setPreview();
            };
          })(this)
        }, 'Preview')
      ]), h('textarea.form-control', {
        'ev-change': (function(_this) {
          return function(evt) {
            return _this.updateMarkdown(evt.target.value);
          };
        })(this),
        rows: 20,
        placeholder: 'This is a new page. Create it now!'
      }, state.currentMarkdown)
    ]) : h('.mainView-view', [
      h('.mainView-editStatus', [
        h('button.btn.btn-default', {
          'ev-click': (function(_this) {
            return function() {
              return _this.setEdit();
            };
          })(this)
        }, 'Edit'), h('button.btn.btn-default.active', {
          'ev-click': (function(_this) {
            return function() {
              return _this.setPreview();
            };
          })(this)
        }, 'Preview')
      ]), h('.markdown', [
        h('', {
          innerHTML: parseMarkdown(state.currentMarkdown)
        })
      ])
    ])
  ]);
};

List.prototype.updateMarkdown = function(val) {
  this.state.currentMarkdown.set(val);
  return api.saveDocument(this.state.currentTitle(), val, function() {});
};

List.prototype.renderLoading = function() {
  var img;
  img = '/loading.gif';
  return h('img', {
    src: img,
    style: {
      position: 'absolute',
      top: 10,
      right: 10
    }
  });
};

getHash = function() {
  return location.hash.replace(/^#\//, '');
};



},{"./api.coffee":"/Users/dguttman/test/simple-wiki/client/api.coffee","marked/lib/marked":"/Users/dguttman/test/simple-wiki/node_modules/marked/lib/marked.js","mercury":"/Users/dguttman/test/simple-wiki/node_modules/mercury/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/marked/lib/marked.js":[function(require,module,exports){
(function (global){
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(this.smartypants(cap[0]));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/--/g, '\u2014')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function() {
      var out, err;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/index.js":[function(require,module,exports){
var SingleEvent = require('geval/single');
var MultipleEvent = require('geval/multiple');

/*
    Pro tip: Don't require `mercury` itself.
      require and depend on all these modules directly!
*/
var mercury = module.exports = {
    // Entry
    main: require('main-loop'),
    app: app,

    // Input
    Delegator: require('dom-delegator'),
    input: input,
    handles: handles,
    event: require('value-event/event'),
    valueEvent: require('value-event/value'),
    submitEvent: require('value-event/submit'),
    changeEvent: require('value-event/change'),
    keyEvent: require('value-event/key'),

    // State
    array: require('observ-array'),
    struct: require('observ-struct'),
    // deprecated: alias struct as hash for back compat
    hash: require('observ-struct'),
    varhash: require('observ-varhash'),
    value: require('observ'),

    // Render
    diff: require('vtree/diff'),
    patch: require('vdom/patch'),
    partial: require('vdom-thunk'),
    create: require('vdom/create-element'),
    h: require('virtual-hyperscript'),
    // deprecated: keep for back compat.
    svg: require('virtual-hyperscript/svg'),

    // Utilities
    // deprecated: keep for back compat.
    computed: require('observ/computed'),
    watch: require('observ/watch')
};

function input(names) {
    if (!names) {
        return SingleEvent();
    }

    return MultipleEvent(names);
}

function handles(funcs, context) {
    return Object.keys(funcs).reduce(createHandle, {});

    function createHandle(acc, name) {
        var handle = mercury.Delegator.allocateHandle(
            funcs[name].bind(null, context));

        acc[name] = handle;
        return acc;
    }
}

function app(elem, observ, render, opts) {
    mercury.Delegator(opts);
    var loop = mercury.main(observ(), render, opts);
    if (elem) {
        elem.appendChild(loop.target);
    }
    return observ(loop.update);
}

},{"dom-delegator":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/index.js","geval/multiple":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/multiple.js","geval/single":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/single.js","main-loop":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/index.js","observ":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/index.js","observ-array":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/index.js","observ-struct":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/index.js","observ-varhash":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-varhash/index.js","observ/computed":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/computed.js","observ/watch":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/watch.js","value-event/change":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/change.js","value-event/event":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/event.js","value-event/key":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/key.js","value-event/submit":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/submit.js","value-event/value":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/value.js","vdom-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/index.js","vdom/create-element":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/create-element.js","vdom/patch":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/patch.js","virtual-hyperscript":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/index.js","virtual-hyperscript/svg":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/svg.js","vtree/diff":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/diff.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/add-event.js":[function(require,module,exports){
var DataSet = require("data-set")

module.exports = addEvent

function addEvent(target, type, handler) {
    var ds = DataSet(target)
    var events = ds[type]

    if (!events) {
        ds[type] = handler
    } else if (Array.isArray(events)) {
        if (events.indexOf(handler) === -1) {
            events.push(handler)
        }
    } else if (events !== handler) {
        ds[type] = [events, handler]
    }
}

},{"data-set":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/dom-delegator.js":[function(require,module,exports){
var globalDocument = require("global/document")
var DataSet = require("data-set")
var createStore = require("weakmap-shim/create-store")

var addEvent = require("./add-event.js")
var removeEvent = require("./remove-event.js")
var ProxyEvent = require("./proxy-event.js")

var HANDLER_STORE = createStore()

module.exports = DOMDelegator

function DOMDelegator(document) {
    document = document || globalDocument

    this.target = document.documentElement
    this.events = {}
    this.rawEventListeners = {}
    this.globalListeners = {}
}

DOMDelegator.prototype.addEventListener = addEvent
DOMDelegator.prototype.removeEventListener = removeEvent

DOMDelegator.allocateHandle =
    function allocateHandle(func) {
        var handle = new Handle()

        HANDLER_STORE(handle).func = func;

        return handle
    }

DOMDelegator.transformHandle =
    function transformHandle(handle, lambda) {
        var func = HANDLER_STORE(handle).func

        return this.allocateHandle(function (ev) {
            var result = lambda(ev)
            if (result) {
                func(result)
            }
        })
    }

DOMDelegator.prototype.addGlobalEventListener =
    function addGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName] || [];
        if (listeners.indexOf(fn) === -1) {
            listeners.push(fn)
        }

        this.globalListeners[eventName] = listeners;
    }

DOMDelegator.prototype.removeGlobalEventListener =
    function removeGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName] || [];

        var index = listeners.indexOf(fn)
        if (index !== -1) {
            listeners.splice(index, 1)
        }
    }

DOMDelegator.prototype.listenTo = function listenTo(eventName) {
    if (this.events[eventName]) {
        return
    }

    this.events[eventName] = true

    var listener = this.rawEventListeners[eventName]
    if (!listener) {
        listener = this.rawEventListeners[eventName] =
            createHandler(eventName, this)
    }

    this.target.addEventListener(eventName, listener, true)
}

DOMDelegator.prototype.unlistenTo = function unlistenTo(eventName) {
    if (!this.events[eventName]) {
        return
    }

    this.events[eventName] = false
    var listener = this.rawEventListeners[eventName]

    if (!listener) {
        throw new Error("dom-delegator#unlistenTo: cannot " +
            "unlisten to " + eventName)
    }

    this.target.removeEventListener(eventName, listener, true)
}

function createHandler(eventName, delegator) {
    var globalListeners = delegator.globalListeners;
    var delegatorTarget = delegator.target;

    return handler

    function handler(ev) {
        var globalHandlers = globalListeners[eventName] || []

        if (globalHandlers.length > 0) {
            var globalEvent = new ProxyEvent(ev);
            globalEvent.currentTarget = delegatorTarget;
            callListeners(globalHandlers, globalEvent)
        }

        findAndInvokeListeners(ev.target, ev, eventName)
    }
}

function findAndInvokeListeners(elem, ev, eventName) {
    var listener = getListener(elem, eventName)

    if (listener && listener.handlers.length > 0) {
        var listenerEvent = new ProxyEvent(ev);
        listenerEvent.currentTarget = listener.currentTarget
        callListeners(listener.handlers, listenerEvent)

        if (listenerEvent._bubbles) {
            var nextTarget = listener.currentTarget.parentNode
            findAndInvokeListeners(nextTarget, ev, eventName)
        }
    }
}

function getListener(target, type) {
    // terminate recursion if parent is `null`
    if (target === null) {
        return null
    }

    var ds = DataSet(target)
    // fetch list of handler fns for this event
    var handler = ds[type]
    var allHandler = ds.event

    if (!handler && !allHandler) {
        return getListener(target.parentNode, type)
    }

    var handlers = [].concat(handler || [], allHandler || [])
    return new Listener(target, handlers)
}

function callListeners(handlers, ev) {
    handlers.forEach(function (handler) {
        if (typeof handler === "function") {
            handler(ev)
        } else if (typeof handler.handleEvent === "function") {
            handler.handleEvent(ev)
        } else if (handler.type === "dom-delegator-handle") {
            HANDLER_STORE(handler).func(ev)
        } else {
            throw new Error("dom-delegator: unknown handler " +
                "found: " + JSON.stringify(handlers));
        }
    })
}

function Listener(target, handlers) {
    this.currentTarget = target
    this.handlers = handlers
}

function Handle() {
    this.type = "dom-delegator-handle"
}

},{"./add-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/add-event.js","./proxy-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/proxy-event.js","./remove-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/remove-event.js","data-set":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js","global/document":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/global/document.js","weakmap-shim/create-store":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/weakmap-shim/create-store.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/index.js":[function(require,module,exports){
var Individual = require("individual")
var cuid = require("cuid")
var globalDocument = require("global/document")

var DOMDelegator = require("./dom-delegator.js")

var delegatorCache = Individual("__DOM_DELEGATOR_CACHE@9", {
    delegators: {}
})
var commonEvents = [
    "blur", "change", "click",  "contextmenu", "dblclick",
    "error","focus", "focusin", "focusout", "input", "keydown",
    "keypress", "keyup", "load", "mousedown", "mouseup",
    "resize", "scroll", "select", "submit", "touchcancel",
    "touchend", "touchstart", "unload"
]

/*  Delegator is a thin wrapper around a singleton `DOMDelegator`
        instance.

    Only one DOMDelegator should exist because we do not want
        duplicate event listeners bound to the DOM.

    `Delegator` will also `listenTo()` all events unless
        every caller opts out of it
*/
module.exports = Delegator

function Delegator(opts) {
    opts = opts || {}
    var document = opts.document || globalDocument

    var cacheKey = document["__DOM_DELEGATOR_CACHE_TOKEN@9"]

    if (!cacheKey) {
        cacheKey =
            document["__DOM_DELEGATOR_CACHE_TOKEN@9"] = cuid()
    }

    var delegator = delegatorCache.delegators[cacheKey]

    if (!delegator) {
        delegator = delegatorCache.delegators[cacheKey] =
            new DOMDelegator(document)
    }

    if (opts.defaultEvents !== false) {
        for (var i = 0; i < commonEvents.length; i++) {
            delegator.listenTo(commonEvents[i])
        }
    }

    return delegator
}

Delegator.allocateHandle = DOMDelegator.allocateHandle;
Delegator.transformHandle = DOMDelegator.transformHandle;

},{"./dom-delegator.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/dom-delegator.js","cuid":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/cuid/dist/browser-cuid.js","global/document":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/global/document.js","individual":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/individual/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/cuid/dist/browser-cuid.js":[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/create-hash.js":[function(require,module,exports){
module.exports = createHash

function createHash(elem) {
    var attributes = elem.attributes
    var hash = {}

    if (attributes === null || attributes === undefined) {
        return hash
    }

    for (var i = 0; i < attributes.length; i++) {
        var attr = attributes[i]

        if (attr.name.substr(0,5) !== "data-") {
            continue
        }

        hash[attr.name.substr(5)] = attr.value
    }

    return hash
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js":[function(require,module,exports){
var createStore = require("weakmap-shim/create-store")
var Individual = require("individual")

var createHash = require("./create-hash.js")

var hashStore = Individual("__DATA_SET_WEAKMAP@3", createStore())

module.exports = DataSet

function DataSet(elem) {
    var store = hashStore(elem)

    if (!store.hash) {
        store.hash = createHash(elem)
    }

    return store.hash
}

},{"./create-hash.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/create-hash.js","individual":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/individual/index.js","weakmap-shim/create-store":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/weakmap-shim/create-store.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/global/document.js":[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":"/Users/dguttman/test/simple-wiki/node_modules/watchify/node_modules/browserify/node_modules/browser-resolve/empty.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/individual/index.js":[function(require,module,exports){
(function (global){
var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual

function Individual(key, value) {
    if (root[key]) {
        return root[key]
    }

    Object.defineProperty(root, key, {
        value: value
        , configurable: true
    })

    return value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/weakmap-shim/create-store.js":[function(require,module,exports){
var hiddenStore = require('./hidden-store.js');

module.exports = createStore;

function createStore() {
    var key = {};

    return function (obj) {
        if (typeof obj !== 'object' || obj === null) {
            throw new Error('Weakmap-shim: Key must be object')
        }

        var store = obj.valueOf(key);
        return store && store.identity === key ?
            store : hiddenStore(obj, key);
    };
}

},{"./hidden-store.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/weakmap-shim/hidden-store.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/weakmap-shim/hidden-store.js":[function(require,module,exports){
module.exports = hiddenStore;

function hiddenStore(obj, key) {
    var store = { identity: key };
    var valueOf = obj.valueOf;

    Object.defineProperty(obj, "valueOf", {
        value: function (value) {
            return value !== key ?
                valueOf.apply(this, arguments) : store;
        },
        writable: true
    });

    return store;
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/proxy-event.js":[function(require,module,exports){
var inherits = require("inherits")

var ALL_PROPS = [
    "altKey", "bubbles", "cancelable", "ctrlKey",
    "eventPhase", "metaKey", "relatedTarget", "shiftKey",
    "target", "timeStamp", "type", "view", "which"
]
var KEY_PROPS = ["char", "charCode", "key", "keyCode"]
var MOUSE_PROPS = [
    "button", "buttons", "clientX", "clientY", "layerX",
    "layerY", "offsetX", "offsetY", "pageX", "pageY",
    "screenX", "screenY", "toElement"
]

var rkeyEvent = /^key|input/
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/

module.exports = ProxyEvent

function ProxyEvent(ev) {
    if (!(this instanceof ProxyEvent)) {
        return new ProxyEvent(ev)
    }

    if (rkeyEvent.test(ev.type)) {
        return new KeyEvent(ev)
    } else if (rmouseEvent.test(ev.type)) {
        return new MouseEvent(ev)
    }

    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    this._rawEvent = ev
    this._bubbles = false;
}

ProxyEvent.prototype.preventDefault = function () {
    this._rawEvent.preventDefault()
}

ProxyEvent.prototype.startPropagation = function () {
    this._bubbles = true;
}

function MouseEvent(ev) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < MOUSE_PROPS.length; j++) {
        var mousePropKey = MOUSE_PROPS[j]
        this[mousePropKey] = ev[mousePropKey]
    }

    this._rawEvent = ev
}

inherits(MouseEvent, ProxyEvent)

function KeyEvent(ev) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < KEY_PROPS.length; j++) {
        var keyPropKey = KEY_PROPS[j]
        this[keyPropKey] = ev[keyPropKey]
    }

    this._rawEvent = ev
}

inherits(KeyEvent, ProxyEvent)

},{"inherits":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/inherits/inherits_browser.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/remove-event.js":[function(require,module,exports){
var DataSet = require("data-set")

module.exports = removeEvent

function removeEvent(target, type, handler) {
    var ds = DataSet(target)
    var events = ds[type]

    if (!events) {
        return
    } else if (Array.isArray(events)) {
        var index = events.indexOf(handler)
        if (index !== -1) {
            events.splice(index, 1)
        }
    } else if (events === handler) {
        ds[type] = null
    }
}

},{"data-set":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/event.js":[function(require,module,exports){
module.exports = Event

function Event() {
    var listeners = []

    return { broadcast: broadcast, listen: event }

    function broadcast(value) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](value)
        }
    }

    function event(listener) {
        listeners.push(listener)

        return removeListener

        function removeListener() {
            var index = listeners.indexOf(listener)
            if (index !== -1) {
                listeners.splice(index, 1)
            }
        }
    }
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/multiple.js":[function(require,module,exports){
var event = require("./single.js")

module.exports = multiple

function multiple(names) {
    return names.reduce(function (acc, name) {
        acc[name] = event()
        return acc
    }, {})
}

},{"./single.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/single.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/single.js":[function(require,module,exports){
var Event = require('./event.js')

module.exports = Single

function Single() {
    var tuple = Event()

    return function event(value) {
        if (typeof value === "function") {
            return tuple.listen(value)
        } else {
            return tuple.broadcast(value)
        }
    }
}

},{"./event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/geval/event.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/index.js":[function(require,module,exports){
var raf = require("raf")
var vtreeDiff = require("vtree/diff")
var vdomCreate = require("vdom/create-element")
var vdomPatch = require("vdom/patch")
var TypedError = require("error/typed")

var InvalidUpdateInRender = TypedError({
    type: "main-loop.invalid.update.in-render",
    message: "main-loop: Unexpected update occurred in loop.\n" +
        "We are currently rendering a view, " +
            "you can't change state right now.\n" +
        "The diff is: {stringDiff}.\n" +
        "SUGGESTED FIX: find the state mutation in your view " +
            "or rendering function and remove it.\n" +
        "The view should not have any side effects.\n",
    diff: null,
    stringDiff: null
})

module.exports = main

function main(initialState, view, opts) {
    opts = opts || {}

    var currentState = initialState
    var create = opts.create || vdomCreate
    var diff = opts.diff || vtreeDiff
    var patch = opts.patch || vdomPatch
    var redrawScheduled = false

    var tree = opts.initialTree || view(currentState)
    var target = opts.target || create(tree, opts)
    var inRenderingTransaction = false

    currentState = null

    return {
        target: target,
        update: update
    }

    function update(state) {
        if (inRenderingTransaction) {
            throw InvalidUpdateInRender({
                diff: state._diff,
                stringDiff: JSON.stringify(state._diff)
            })
        }

        if (currentState === null && !redrawScheduled) {
            redrawScheduled = true
            raf(redraw)
        }

        currentState = state
    }

    function redraw() {
        redrawScheduled = false;
        if (currentState === null) {
            return
        }

        inRenderingTransaction = true
        var newTree = view(currentState)

        if (opts.createOnly) {
            create(newTree, opts)
        } else {
            var patches = diff(tree, newTree, opts)
            target = patch(target, patches, opts)
        }

        inRenderingTransaction = false
        tree = newTree
        currentState = null
    }
}

},{"error/typed":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/typed.js","raf":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/raf/index.js","vdom/create-element":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/create-element.js","vdom/patch":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/patch.js","vtree/diff":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/diff.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/node_modules/camelize/index.js":[function(require,module,exports){
module.exports = function(obj) {
    if (typeof obj === 'string') return camelCase(obj);
    return walk(obj);
};

function walk (obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (isDate(obj) || isRegex(obj)) return obj;
    if (isArray(obj)) return map(obj, walk);
    return reduce(objectKeys(obj), function (acc, key) {
        var camel = camelCase(key);
        acc[camel] = walk(obj[key]);
        return acc;
    }, {});
}

function camelCase(str) {
    return str.replace(/[_.-](\w|$)/g, function (_,x) {
        return x.toUpperCase();
    });
}

var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var isDate = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
};

var isRegex = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var has = Object.prototype.hasOwnProperty;
var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};

function map (xs, f) {
    if (xs.map) return xs.map(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
    }
    return res;
}

function reduce (xs, f, acc) {
    if (xs.reduce) return xs.reduce(f, acc);
    for (var i = 0; i < xs.length; i++) {
        acc = f(acc, xs[i], i);
    }
    return acc;
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/node_modules/string-template/index.js":[function(require,module,exports){
var nargs = /\{([0-9a-zA-Z]+)\}/g
var slice = Array.prototype.slice

module.exports = template

function template(string) {
    var args

    if (arguments.length === 2 && typeof arguments[1] === "object") {
        args = arguments[1]
    } else {
        args = slice.call(arguments, 1)
    }

    if (!args || !args.hasOwnProperty) {
        args = {}
    }

    return string.replace(nargs, function replaceArg(match, i, index) {
        var result

        if (string[index - 1] === "{" &&
            string[index + match.length] === "}") {
            return i
        } else {
            result = args.hasOwnProperty(i) ? args[i] : null
            if (result === null || result === undefined) {
                return ""
            }

            return result
        }
    })
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/node_modules/xtend/mutable.js":[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/typed.js":[function(require,module,exports){
var camelize = require("camelize")
var template = require("string-template")
var extend = require("xtend/mutable")

module.exports = TypedError

function TypedError(args) {
    if (!args) {
        throw new Error("args is required");
    }
    if (!args.type) {
        throw new Error("args.type is required");
    }
    if (!args.message) {
        throw new Error("args.message is required");
    }

    var message = args.message

    if (args.type && !args.name) {
        var errorName = camelize(args.type) + "Error"
        args.name = errorName[0].toUpperCase() + errorName.substr(1)
    }

    createError.type = args.type;
    createError._name = args.name;

    return createError;

    function createError(opts) {
        var result = new Error()

        Object.defineProperty(result, "type", {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        })

        var options = extend({}, args, opts)

        extend(result, options)
        result.message = template(message, options)

        return result
    }
}


},{"camelize":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/node_modules/camelize/index.js","string-template":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/node_modules/string-template/index.js","xtend/mutable":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/node_modules/xtend/mutable.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/raf/index.js":[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/raf/node_modules/performance-now/lib/performance-now.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/raf/node_modules/performance-now/lib/performance-now.js":[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,require('_process'))
},{"_process":"/Users/dguttman/test/simple-wiki/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/add-listener.js":[function(require,module,exports){
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = addListener

function addListener(observArray, observ) {
    var list = observArray._list

    return observ(function (value) {
        var valueList =  observArray().slice()
        var index = list.indexOf(observ)

        // This code path should never hit. If this happens
        // there's a bug in the cleanup code
        if (index === -1) {
            var message = "observ-array: Unremoved observ listener"
            var err = new Error(message)
            err.list = list
            err.index = index
            err.observ = observ
            throw err
        }

        valueList.splice(index, 1, value)
        setNonEnumerable(valueList, "_diff", [ [index, 1, value] ])

        observArray.set(valueList)
    })
}

},{"./lib/set-non-enumerable.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/lib/set-non-enumerable.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/array-methods.js":[function(require,module,exports){
var ObservArray = require("./index.js")

var slice = Array.prototype.slice

var ARRAY_METHODS = [
    "concat", "slice", "every", "filter", "forEach", "indexOf",
    "join", "lastIndexOf", "map", "reduce", "reduceRight",
    "some", "toString", "toLocaleString"
]

var methods = ARRAY_METHODS.map(function (name) {
    return [name, function () {
        var res = this._list[name].apply(this._list, arguments)

        if (res && Array.isArray(res)) {
            res = ObservArray(res)
        }

        return res
    }]
})

module.exports = ArrayMethods

function ArrayMethods(obs) {
    obs.push = observArrayPush
    obs.pop = observArrayPop
    obs.shift = observArrayShift
    obs.unshift = observArrayUnshift
    obs.reverse = notImplemented
    obs.sort = notImplemented

    methods.forEach(function (tuple) {
        obs[tuple[0]] = tuple[1]
    })
    return obs
}



function observArrayPush() {
    var args = slice.call(arguments)
    args.unshift(this._list.length, 0)
    this.splice.apply(this, args)

    return this._list.length
}
function observArrayPop() {
    return this.splice(this._list.length - 1, 1)[0]
}
function observArrayShift() {
    return this.splice(0, 1)[0]
}
function observArrayUnshift() {
    var args = slice.call(arguments)
    args.unshift(0, 0)
    this.splice.apply(this, args)

    return this._list.length
}


function notImplemented() {
    throw new Error("Pull request welcome")
}

},{"./index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/index.js":[function(require,module,exports){
var Observ = require("observ")

// circular dep between ArrayMethods & this file
module.exports = ObservArray

var splice = require("./splice.js")
var put = require("./put.js")
var transaction = require("./transaction.js")
var ArrayMethods = require("./array-methods.js")
var addListener = require("./add-listener.js")


/*  ObservArray := (Array<T>) => Observ<
        Array<T> & { _diff: Array }
    > & {
        splice: (index: Number, amount: Number, rest...: T) =>
            Array<T>,
        push: (values...: T) => Number,
        filter: (lambda: Function, thisValue: Any) => Array<T>,
        indexOf: (item: T, fromIndex: Number) => Number
    }

    Fix to make it more like ObservHash.

    I.e. you write observables into it. 
        reading methods take plain JS objects to read
        and the value of the array is always an array of plain
        objsect.

        The observ array instance itself would have indexed 
        properties that are the observables
*/
function ObservArray(initialList) {
    // list is the internal mutable list observ instances that
    // all methods on `obs` dispatch to.
    var list = initialList
    var initialState = []

    // copy state out of initialList into initialState
    list.forEach(function (observ, index) {
        initialState[index] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    obs.splice = splice

    obs.get = get
    obs.getLength = getLength
    obs.put = put
    obs.transaction = transaction

    // you better not mutate this list directly
    // this is the list of observs instances
    obs._list = list

    var removeListeners = list.map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    });
    // this is a list of removal functions that must be called
    // when observ instances are removed from `obs.list`
    // not calling this means we do not GC our observ change
    // listeners. Which causes rage bugs
    obs._removeListeners = removeListeners

    return ArrayMethods(obs, list)
}

function get(index) {
    return this._list[index]
}

function getLength() {
    return this._list.length
}

},{"./add-listener.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/add-listener.js","./array-methods.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/array-methods.js","./put.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/put.js","./splice.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/splice.js","./transaction.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/transaction.js","observ":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/lib/set-non-enumerable.js":[function(require,module,exports){
module.exports = setNonEnumerable;

function setNonEnumerable(object, key, value) {
    Object.defineProperty(object, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    });
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/node_modules/adiff/index.js":[function(require,module,exports){
function head (a) {
  return a[0]
}

function last (a) {
  return a[a.length - 1]
}

function tail(a) {
  return a.slice(1)
}

function retreat (e) {
  return e.pop()
}

function hasLength (e) {
  return e.length
}

function any(ary, test) {
  for(var i=0;i<ary.length;i++)
    if(test(ary[i]))
      return true
  return false
}

function score (a) {
  return a.reduce(function (s, a) {
      return s + a.length + a[1] + 1
  }, 0)
}

function best (a, b) {
  return score(a) <= score(b) ? a : b
}


var _rules // set at the bottom  

// note, naive implementation. will break on circular objects.

function _equal(a, b) {
  if(a && !b) return false
  if(Array.isArray(a))
    if(a.length != b.length) return false
  if(a && 'object' == typeof a) {
    for(var i in a)
      if(!_equal(a[i], b[i])) return false
    for(var i in b)
      if(!_equal(a[i], b[i])) return false
    return true
  }
  return a == b
}

function getArgs(args) {
  return args.length == 1 ? args[0] : [].slice.call(args)
}

// return the index of the element not like the others, or -1
function oddElement(ary, cmp) {
  var c
  function guess(a) {
    var odd = -1
    c = 0
    for (var i = a; i < ary.length; i ++) {
      if(!cmp(ary[a], ary[i])) {
        odd = i, c++
      }
    }
    return c > 1 ? -1 : odd
  }
  //assume that it is the first element.
  var g = guess(0)
  if(-1 != g) return g
  //0 was the odd one, then all the other elements are equal
  //else there more than one different element
  guess(1)
  return c == 0 ? 0 : -1
}
var exports = module.exports = function (deps, exports) {
  var equal = (deps && deps.equal) || _equal
  exports = exports || {} 
  exports.lcs = 
  function lcs() {
    var cache = {}
    var args = getArgs(arguments)
    var a = args[0], b = args[1]

    function key (a,b){
      return a.length + ':' + b.length
    }

    //find length that matches at the head

    if(args.length > 2) {
      //if called with multiple sequences
      //recurse, since lcs(a, b, c, d) == lcs(lcs(a,b), lcs(c,d))
      args.push(lcs(args.shift(), args.shift()))
      return lcs(args)
    }
    
    //this would be improved by truncating input first
    //and not returning an lcs as an intermediate step.
    //untill that is a performance problem.

    var start = 0, end = 0
    for(var i = 0; i < a.length && i < b.length 
      && equal(a[i], b[i])
      ; i ++
    )
      start = i + 1

    if(a.length === start)
      return a.slice()

    for(var i = 0;  i < a.length - start && i < b.length - start
      && equal(a[a.length - 1 - i], b[b.length - 1 - i])
      ; i ++
    )
      end = i

    function recurse (a, b) {
      if(!a.length || !b.length) return []
      //avoid exponential time by caching the results
      if(cache[key(a, b)]) return cache[key(a, b)]

      if(equal(a[0], b[0]))
        return [head(a)].concat(recurse(tail(a), tail(b)))
      else { 
        var _a = recurse(tail(a), b)
        var _b = recurse(a, tail(b))
        return cache[key(a,b)] = _a.length > _b.length ? _a : _b  
      }
    }
    
    var middleA = a.slice(start, a.length - end)
    var middleB = b.slice(start, b.length - end)

    return (
      a.slice(0, start).concat(
        recurse(middleA, middleB)
      ).concat(a.slice(a.length - end))
    )
  }

  // given n sequences, calc the lcs, and then chunk strings into stable and unstable sections.
  // unstable chunks are passed to build
  exports.chunk =
  function (q, build) {
    var q = q.map(function (e) { return e.slice() })
    var lcs = exports.lcs.apply(null, q)
    var all = [lcs].concat(q)

    function matchLcs (e) {
      if(e.length && !lcs.length || !e.length && lcs.length)
        return false //incase the last item is null
      return equal(last(e), last(lcs)) || ((e.length + lcs.length) === 0)
    }

    while(any(q, hasLength)) {
      //if each element is at the lcs then this chunk is stable.
      while(q.every(matchLcs) && q.every(hasLength))
        all.forEach(retreat)
      //collect the changes in each array upto the next match with the lcs
      var c = false
      var unstable = q.map(function (e) {
        var change = []
        while(!matchLcs(e)) {
          change.unshift(retreat(e))
          c = true
        }
        return change
      })
      if(c) build(q[0].length, unstable)
    }
  }

  //calculate a diff this is only updates
  exports.optimisticDiff =
  function (a, b) {
    var M = Math.max(a.length, b.length)
    var m = Math.min(a.length, b.length)
    var patch = []
    for(var i = 0; i < M; i++)
      if(a[i] !== b[i]) {
        var cur = [i,0], deletes = 0
        while(a[i] !== b[i] && i < m) {
          cur[1] = ++deletes
          cur.push(b[i++])
        }
        //the rest are deletes or inserts
        if(i >= m) {
          //the rest are deletes
          if(a.length > b.length)
            cur[1] += a.length - b.length
          //the rest are inserts
          else if(a.length < b.length)
            cur = cur.concat(b.slice(a.length))
        }
        patch.push(cur)
      }

    return patch
  }

  exports.diff =
  function (a, b) {
    var optimistic = exports.optimisticDiff(a, b)
    var changes = []
    exports.chunk([a, b], function (index, unstable) {
      var del = unstable.shift().length
      var insert = unstable.shift()
      changes.push([index, del].concat(insert))
    })
    return best(optimistic, changes)
  }

  exports.patch = function (a, changes, mutate) {
    if(mutate !== true) a = a.slice(a)//copy a
    changes.forEach(function (change) {
      [].splice.apply(a, change)
    })
    return a
  }

  // http://en.wikipedia.org/wiki/Concestor
  // me, concestor, you...
  exports.merge = function () {
    var args = getArgs(arguments)
    var patch = exports.diff3(args)
    return exports.patch(args[0], patch)
  }

  exports.diff3 = function () {
    var args = getArgs(arguments)
    var r = []
    exports.chunk(args, function (index, unstable) {
      var mine = unstable[0]
      var insert = resolve(unstable)
      if(equal(mine, insert)) return 
      r.push([index, mine.length].concat(insert)) 
    })
    return r
  }
  exports.oddOneOut =
    function oddOneOut (changes) {
      changes = changes.slice()
      //put the concestor first
      changes.unshift(changes.splice(1,1)[0])
      var i = oddElement(changes, equal)
      if(i == 0) // concestor was different, 'false conflict'
        return changes[1]
      if (~i)
        return changes[i] 
    }
  exports.insertMergeOverDelete = 
    //i've implemented this as a seperate rule,
    //because I had second thoughts about this.
    function insertMergeOverDelete (changes) {
      changes = changes.slice()
      changes.splice(1,1)// remove concestor
      
      //if there is only one non empty change thats okay.
      //else full confilct
      for (var i = 0, nonempty; i < changes.length; i++)
        if(changes[i].length) 
          if(!nonempty) nonempty = changes[i]
          else return // full conflict
      return nonempty
    }

  var rules = (deps && deps.rules) || [exports.oddOneOut, exports.insertMergeOverDelete]

  function resolve (changes) {
    var l = rules.length
    for (var i in rules) { // first
      
      var c = rules[i] && rules[i](changes)
      if(c) return c
    }
    changes.splice(1,1) // remove concestor
    //returning the conflicts as an object is a really bad idea,
    // because == will not detect they are the same. and conflicts build.
    // better to use
    // '<<<<<<<<<<<<<'
    // of course, i wrote this before i started on snob, so i didn't know that then.
    /*var conflict = ['>>>>>>>>>>>>>>>>']
    while(changes.length)
      conflict = conflict.concat(changes.shift()).concat('============')
    conflict.pop()
    conflict.push          ('<<<<<<<<<<<<<<<')
    changes.unshift       ('>>>>>>>>>>>>>>>')
    return conflict*/
    //nah, better is just to use an equal can handle objects
    return {'?': changes}
  }
  return exports
}
exports(null, exports)

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/put.js":[function(require,module,exports){
var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = put

// `obs.put` is a mutable implementation of `array[index] = value`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function put(index, value) {
    var obs = this
    var valueList = obs().slice()

    var originalLength = valueList.length
    valueList[index] = typeof value === "function" ? value() : value

    obs._list[index] = value

    // remove past value listener if was observ
    var removeListener = obs._removeListeners[index]
    if (removeListener){
        removeListener()
    }

    // add listener to value if observ
    obs._removeListeners[index] = typeof value === "function" ?
        addListener(obs, value) :
        null

    // fake splice diff
    var valueArgs = index < originalLength ? 
        [index, 1, valueList[index]] :
        [index, 0, valueList[index]]

    setNonEnumerable(valueList, "_diff", [valueArgs])

    obs.set(valueList)
    return value
}
},{"./add-listener.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/add-listener.js","./lib/set-non-enumerable.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/lib/set-non-enumerable.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/splice.js":[function(require,module,exports){
var slice = Array.prototype.slice

var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = splice

// `obs.splice` is a mutable implementation of `splice()`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function splice(index, amount) {
    var obs = this
    var args = slice.call(arguments, 0)
    var valueList = obs().slice()

    // generate a list of args to mutate the internal
    // list of only obs
    var valueArgs = args.map(function (value, index) {
        if (index === 0 || index === 1) {
            return value
        }

        // must unpack observables that we are adding
        return typeof value === "function" ? value() : value
    })

    valueList.splice.apply(valueList, valueArgs)
    // we remove the observs that we remove
    var removed = obs._list.splice.apply(obs._list, args)

    var extraRemoveListeners = args.slice(2).map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    })
    extraRemoveListeners.unshift(args[0], args[1])
    var removedListeners = obs._removeListeners.splice
        .apply(obs._removeListeners, extraRemoveListeners)

    removedListeners.forEach(function (removeObservListener) {
        if (removeObservListener) {
            removeObservListener()
        }
    })

    setNonEnumerable(valueList, "_diff", [valueArgs])

    obs.set(valueList)
    return removed
}

},{"./add-listener.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/add-listener.js","./lib/set-non-enumerable.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/lib/set-non-enumerable.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/transaction.js":[function(require,module,exports){
var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js")
var adiff = require("adiff")

module.exports = transaction

function transaction (func) {
    var obs = this
    var rawList = obs._list.slice()

    if (func(rawList) !== false){ // allow cancel

        var changes = adiff.diff(obs._list, rawList)
        var valueList = obs().slice()

        var valueChanges = changes.map(applyPatch.bind(obs, valueList))

        setNonEnumerable(valueList, "_diff", valueChanges)

        obs.set(valueList)
        return changes
    }

}

function applyPatch (valueList, args) {
    var obs = this
    var valueArgs = args.map(unpack)

    valueList.splice.apply(valueList, valueArgs)
    obs._list.splice.apply(obs._list, args)

    var extraRemoveListeners = args.slice(2).map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    })

    extraRemoveListeners.unshift(args[0], args[1])
    var removedListeners = obs._removeListeners.splice
        .apply(obs._removeListeners, extraRemoveListeners)

    removedListeners.forEach(function (removeObservListener) {
        if (removeObservListener) {
            removeObservListener()
        }
    })

    return valueArgs
}

function unpack(value, index){
    if (index === 0 || index === 1) {
        return value
    }
    return typeof value === "function" ? value() : value
}
},{"./add-listener.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/add-listener.js","./lib/set-non-enumerable.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/lib/set-non-enumerable.js","adiff":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-array/node_modules/adiff/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/index.js":[function(require,module,exports){
var Observ = require("observ")
var extend = require("xtend")

var blackList = ["name", "_diff", "_type", "_version"]
var blackListReasons = {
    "name": "Clashes with `Function.prototype.name`.\n",
    "_diff": "_diff is reserved key of observ-struct.\n",
    "_type": "_type is reserved key of observ-struct.\n",
    "_version": "_version is reserved key of observ-struct.\n"
}
var NO_TRANSACTION = {}

function setNonEnumerable(object, key, value) {
    Object.defineProperty(object, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    })
}

/* ObservStruct := (Object<String, Observ<T>>) => 
    Object<String, Observ<T>> &
        Observ<Object<String, T> & {
            _diff: Object<String, Any>
        }>

*/
module.exports = ObservStruct

function ObservStruct(struct) {
    var keys = Object.keys(struct)

    var initialState = {}
    var currentTransaction = NO_TRANSACTION
    var nestedTransaction = NO_TRANSACTION

    keys.forEach(function (key) {
        if (blackList.indexOf(key) !== -1) {
            throw new Error("cannot create an observ-struct " +
                "with a key named '" + key + "'.\n" +
                blackListReasons[key]);
        }

        var observ = struct[key]
        initialState[key] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    keys.forEach(function (key) {
        var observ = struct[key]
        obs[key] = observ

        if (typeof observ === "function") {
            observ(function (value) {
                if (nestedTransaction === value) {
                    return
                }

                var state = extend(obs())
                state[key] = value
                var diff = {}
                diff[key] = value && value._diff ?
                    value._diff : value

                setNonEnumerable(state, "_diff", diff)
                currentTransaction = state
                obs.set(state)
                currentTransaction = NO_TRANSACTION
            })
        }
    })
    var _set = obs.set
    obs.set = function trackDiff(value) {
        if (currentTransaction === value) {
            return _set(value)
        }

        var newState = extend(value)
        setNonEnumerable(newState, "_diff", value)
        _set(newState)
    }

    obs(function (newState) {
        if (currentTransaction === newState) {
            return
        }

        keys.forEach(function (key) {
            var observ = struct[key]
            var newObservValue = newState[key]

            if (typeof observ === "function" &&
                observ() !== newObservValue
            ) {
                nestedTransaction = newObservValue
                observ.set(newState[key])
                nestedTransaction = NO_TRANSACTION
            }
        })
    })

    obs._type = "observ-struct"
    obs._version = "5"

    return obs
}

},{"observ":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/index.js","xtend":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/node_modules/xtend/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/node_modules/xtend/index.js":[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-varhash/index.js":[function(require,module,exports){
var Observ = require('observ')
var extend = require('xtend')

var NO_TRANSACTION = {}

ObservVarhash.Tombstone = new Tombstone()

module.exports = ObservVarhash

function ObservVarhash (hash, createValue) {
  createValue = createValue || function (obj) { return obj }

  var initialState = {}
  var currentTransaction = NO_TRANSACTION

  for (var key in hash) {
    var observ = hash[key]
    checkKey(key)
    initialState[key] = isFn(observ) ? observ() : observ
  }

  var obs = Observ(initialState)
  obs._removeListeners = {}

  obs.get = get.bind(obs)
  obs.put = put.bind(obs, createValue)
  obs.delete = del.bind(obs)

  for (key in hash) {
    obs[key] = createValue(hash[key], key)

    if (isFn(obs[key])) {
      obs._removeListeners[key] = obs[key](watch(obs, key, currentTransaction))
    }
  }

  obs(function (newState) {
    if (currentTransaction === newState) {
      return
    }

    for (var key in hash) {
      var observ = hash[key]

      if (isFn(observ) && observ() !== newState[key]) {
        observ.set(newState[key])
      }
    }
  })

  return obs
}

// access and mutate
function get (key) {
  return this[key]
}

function put (createValue, key, val) {
  checkKey(key)

  var observ = createValue(val, key)
  var state = extend(this())

  state[key] = isFn(observ) ? observ() : observ

  if (isFn(this._removeListeners[key])) {
    this._removeListeners[key]()
  }

  this._removeListeners[key] = isFn(observ) ?
    observ(watch(this, key)) : null

  setNonEnumerable(state, '_diff', diff(key, state[key]))

  this.set(state)
  this[key] = observ

  return this
}

function del (key) {
  var state = extend(this())
  if (isFn(this._removeListeners[key])) {
    this._removeListeners[key]()
  }

  delete this._removeListeners[key]
  delete state[key]

  setNonEnumerable(state, '_diff', diff(key, ObservVarhash.Tombstone))
  this.set(state)

  return this
}

// processing
function watch (obs, key, currentTransaction) {
  return function (value) {
    var state = extend(obs())
    state[key] = value

    setNonEnumerable(state, '_diff', diff(key, value))
    currentTransaction = state
    obs.set(state)
    currentTransaction = NO_TRANSACTION
  }
}

function diff (key, value) {
  var obj = {}
  obj[key] = value && value._diff ? value._diff : value
  return obj
}

function isFn (obj) {
  return typeof obj === 'function'
}

function setNonEnumerable(object, key, value) {
  Object.defineProperty(object, key, {
    value: value,
    writable: true,
    configurable: true,
    enumerable: false
  })
}

// errors
var blacklist = {
  name: 'Clashes with `Function.prototype.name`.',
  get: 'get is a reserved key of observ-varhash method',
  put: 'put is a reserved key of observ-varhash method',
  delete: 'delete is a reserved key of observ-varhash method',
  _diff: '_diff is a reserved key of observ-varhash method',
  _removeListeners: '_removeListeners is a reserved key of observ-varhash'
}

function checkKey (key) {
  if (!blacklist[key]) return
  throw new Error(
    'cannot create an observ-varhash with key `' + key + '`. ' + blacklist[key]
  )
}

// identify deletes
function Tombstone () {}

Tombstone.prototype.toJSON = nameTombstone
Tombstone.prototype.inspect = nameTombstone
Tombstone.prototype.toString = nameTombstone

function nameTombstone () {
  return '[object Tombstone]'
}

},{"observ":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/index.js","xtend":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-varhash/node_modules/xtend/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-varhash/node_modules/xtend/index.js":[function(require,module,exports){
module.exports=require("/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/node_modules/xtend/index.js")
},{"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/node_modules/xtend/index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ-struct/node_modules/xtend/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/computed.js":[function(require,module,exports){
var Observable = require("./index.js")

module.exports = computed

function computed(observables, lambda) {
    var values = observables.map(function (o) {
        return o()
    })
    var result = Observable(lambda.apply(null, values))

    observables.forEach(function (o, index) {
        o(function (newValue) {
            values[index] = newValue
            result.set(lambda.apply(null, values))
        })
    })

    return result
}

},{"./index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/index.js":[function(require,module,exports){
module.exports = Observable

function Observable(value) {
    var listeners = []
    value = value === undefined ? null : value

    observable.set = function (v) {
        value = v
        listeners.forEach(function (f) {
            f(v)
        })
    }

    return observable

    function observable(listener) {
        if (!listener) {
            return value
        }

        listeners.push(listener)

        return function remove() {
            listeners.splice(listeners.indexOf(listener), 1)
        }
    }
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/observ/watch.js":[function(require,module,exports){
module.exports = watch

function watch(observable, listener) {
    var remove = observable(listener)
    listener(observable())
    return remove
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/base-event.js":[function(require,module,exports){
var Delegator = require('dom-delegator')

module.exports = BaseEvent

function BaseEvent(lambda) {
    return EventHandler;

    function EventHandler(fn, data, opts) {
        var handler = {
            fn: fn,
            data: data || {},
            opts: opts || {},
            handleEvent: handleEvent
        }

        if (fn && fn.type === 'dom-delegator-handle') {
            return Delegator.transformHandle(fn,
                handleLambda.bind(handler))
        }

        return handler;
    }

    function handleLambda(ev) {
        return lambda.call(this, ev)
    }

    function handleEvent(ev) {
        var value = lambda.call(this, ev)
        if (!value) {
            return
        }

        if (typeof this.fn === 'function') {
            this.fn(value)
        } else {
            this.fn.write(value)
        }
    }
}

},{"dom-delegator":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/change.js":[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js')

var VALID_CHANGE = ['checkbox', 'file'];
var VALID_INPUT = ['color', 'date', 'datetime', 'datetime-local', 'email',
    'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time',
    'url', 'week'];

module.exports = BaseEvent(changeLambda);

function changeLambda(ev) {
    var target = ev.target

    var isValid =
        (ev.type === 'input' && VALID_INPUT.indexOf(target.type) !== -1) ||
        (ev.type === 'change' && VALID_CHANGE.indexOf(target.type) !== -1);

    if (!isValid) {
        if (ev.startPropagation) {
            ev.startPropagation()
        }
        return
    }

    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    return data
}

},{"./base-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/base-event.js","form-data-set/element":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/form-data-set/element.js","xtend":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/xtend/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/event.js":[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(eventLambda);

function eventLambda(ev) {
    return this.data;
}

},{"./base-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/base-event.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/key.js":[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(keyLambda);

function keyLambda(ev) {
    var key = this.opts.key;

    if (ev.keyCode === key) {
        return this.data;
    }
}

},{"./base-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/base-event.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/dom-walk/index.js":[function(require,module,exports){
var slice = Array.prototype.slice

module.exports = iterativelyWalk

function iterativelyWalk(nodes, cb) {
    if (!('length' in nodes)) {
        nodes = [nodes]
    }
    
    nodes = slice.call(nodes)

    while(nodes.length) {
        var node = nodes.shift(),
            ret = cb(node)

        if (ret) {
            return ret
        }

        if (node.childNodes && node.childNodes.length) {
            nodes = slice.call(node.childNodes).concat(nodes)
        }
    }
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/form-data-set/element.js":[function(require,module,exports){
var walk = require('dom-walk')

var FormData = require('./index.js')

module.exports = getFormData

function buildElems(rootElem) {
    var hash = {}

    walk(rootElem, function (child) {
        if (child.name) {
            hash[child.name] = child
        }
    })


    return hash
}

function getFormData(rootElem) {
    var elements = buildElems(rootElem)

    return FormData(elements)
}

},{"./index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/form-data-set/index.js","dom-walk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/dom-walk/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/form-data-set/index.js":[function(require,module,exports){
/*jshint maxcomplexity: 10*/

module.exports = FormData

//TODO: Massive spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#constructing-form-data-set
function FormData(elements) {
    return Object.keys(elements).reduce(function (acc, key) {
        var elem = elements[key]

        acc[key] = valueOfElement(elem)

        return acc
    }, {})
}

function valueOfElement(elem) {
    if (typeof elem === "function") {
        return elem()
    } else if (containsRadio(elem)) {
        var elems = toList(elem)
        var checked = elems.filter(function (elem) {
            return elem.checked
        })[0] || null

        return checked ? checked.value : null
    } else if (Array.isArray(elem)) {
        return elem.map(valueOfElement).filter(filterNull)
    } else if (elem.tagName === undefined && elem.nodeType === undefined) {
        return FormData(elem)
    } else if (elem.tagName === "INPUT" && isChecked(elem)) {
        if (elem.hasAttribute("value")) {
            return elem.checked ? elem.value : null
        } else {
            return elem.checked
        }
    } else if (elem.tagName === "INPUT") {
        return elem.value
    } else if (elem.tagName === "TEXTAREA") {
        return elem.value
    } else if (elem.tagName === "SELECT") {
        return elem.value
    }
}

function isChecked(elem) {
    return elem.type === "checkbox" || elem.type === "radio"
}

function containsRadio(value) {
    if (value.tagName || value.nodeType) {
        return false
    }

    var elems = toList(value)

    return elems.some(function (elem) {
        return elem.tagName === "INPUT" && elem.type === "radio"
    })
}

function toList(value) {
    if (Array.isArray(value)) {
        return value
    }

    return Object.keys(value).map(prop, value)
}

function prop(x) {
    return this[x]
}

function filterNull(val) {
    return val !== null
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/xtend/has-keys.js":[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/xtend/index.js":[function(require,module,exports){
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{"./has-keys":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/xtend/has-keys.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/submit.js":[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js');

var ENTER = 13

module.exports = BaseEvent(submitLambda);

function submitLambda(ev) {
    var target = ev.target

    var isValid =
        (ev.type === 'click' && target.tagName === 'BUTTON') ||
        (ev.type === 'click' && target.type === 'submit') ||
        (
            (target.type === 'text') &&
            (ev.keyCode === ENTER && ev.type === 'keydown')
        )

    if (!isValid) {
        if (ev.startPropagation) {
            ev.startPropagation()
        }
        return
    }

    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    if (ev.preventDefault) {
        ev.preventDefault();
    }

    return data;
}

},{"./base-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/base-event.js","form-data-set/element":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/form-data-set/element.js","xtend":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/xtend/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/value.js":[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(valueLambda);

function valueLambda(ev) {
    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    return data;
}

},{"./base-event.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/base-event.js","form-data-set/element":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/form-data-set/element.js","xtend":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/value-event/node_modules/xtend/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/immutable-thunk.js":[function(require,module,exports){
function Thunk(fn, args, key, eqArgs) {
    this.fn = fn;
    this.args = args;
    this.key = key;
    this.eqArgs = eqArgs;
}

Thunk.prototype.type = 'Thunk';
Thunk.prototype.render = render;
module.exports = Thunk;

function shouldUpdate(current, previous) {
    if (!current || !previous || current.fn !== previous.fn) {
        return true;
    }

    var cargs = current.args;
    var pargs = previous.args;

    return !current.eqArgs(cargs, pargs);
}

function render(previous) {
    if (shouldUpdate(this, previous)) {
        return this.fn.apply(null, this.args);
    } else {
        return previous.vnode;
    }
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/index.js":[function(require,module,exports){
var Partial = require('./partial');

module.exports = Partial();

},{"./partial":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/partial.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/partial.js":[function(require,module,exports){
var shallowEq = require('./shallow-eq');
var Thunk = require('./immutable-thunk');

module.exports = createPartial;

function createPartial(eq) {
    return function partial(fn) {
        var args = copyOver(arguments, 1);
        var firstArg = args[0];
        var key;

        var eqArgs = eq || shallowEq;

        if (typeof firstArg === 'object' && firstArg !== null) {
            if ('key' in firstArg) {
                key = firstArg.key;
            } else if ('id' in firstArg) {
                key = firstArg.id;
            }
        }

        return new Thunk(fn, args, key, eqArgs);
    };
}

function copyOver(list, offset) {
    var newList = [];
    for (var i = list.length - 1; i >= offset; i--) {
        newList[i - offset] = list[i];
    }
    return newList;
}

},{"./immutable-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/immutable-thunk.js","./shallow-eq":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/shallow-eq.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom-thunk/shallow-eq.js":[function(require,module,exports){
module.exports = shallowEq;

function shallowEq(currentArgs, previousArgs) {
    if (currentArgs.length === 0 && previousArgs.length === 0) {
        return true;
    }

    if (currentArgs.length !== previousArgs.length) {
        return false;
    }

    var len = currentArgs.length;

    for (var i = 0; i < len; i++) {
        if (currentArgs[i] !== previousArgs[i]) {
            return false;
        }
    }

    return true;
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/apply-properties.js":[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("vtree/is-vhook")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, props, previous, propName);
        } else if (isHook(propValue)) {
            propValue.hook(node,
                propName,
                previous ? previous[propName] : undefined)
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else if (propValue !== undefined) {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, props, previous, propName) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    if(previous && isObject(previous[propName]) &&
        getPrototype(previous[propName]) !== getPrototype(propValue)) {
        node[propName] = previousValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"is-object":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/is-object/index.js","vtree/is-vhook":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vhook.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/create-element.js":[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("vtree/is-vnode")
var isVText = require("vtree/is-vtext")
var isWidget = require("vtree/is-widget")
var handleThunk = require("vtree/handle-thunk")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"./apply-properties":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/apply-properties.js","global/document":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/global/document.js","vtree/handle-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/handle-thunk.js","vtree/is-vnode":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vnode.js","vtree/is-vtext":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vtext.js","vtree/is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/dom-index.js":[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/global/document.js":[function(require,module,exports){
module.exports=require("/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/global/document.js")
},{"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/global/document.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/global/document.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/is-object/index.js":[function(require,module,exports){
module.exports = isObject

function isObject(x) {
    return typeof x === "object" && x !== null
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/x-is-array/index.js":[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/patch-op.js":[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("vtree/is-widget")
var VPatch = require("vtree/vpatch")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    if (updateWidget(leftVNode, widget)) {
        return widget.update(leftVNode, domNode) || domNode
    }

    var parentNode = domNode.parentNode
    var newWidget = render(widget, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newWidget, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newWidget
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, bIndex) {
    var children = []
    var childNodes = domNode.childNodes
    var len = childNodes.length
    var i
    var reverseIndex = bIndex.reverse

    for (i = 0; i < len; i++) {
        children.push(domNode.childNodes[i])
    }

    var insertOffset = 0
    var move
    var node
    var insertNode
    for (i = 0; i < len; i++) {
        move = bIndex[i]
        if (move !== undefined && move !== i) {
            // the element currently at this index will be moved later so increase the insert offset
            if (reverseIndex[i] > i) {
                insertOffset++
            }

            node = children[move]
            insertNode = childNodes[i + insertOffset]
            if (node !== insertNode) {
                domNode.insertBefore(node, insertNode)
            }

            // the moved element came from the front of the array so reduce the insert offset
            if (move < i) {
                insertOffset--
            }
        }

        // element at this index is scheduled to be removed so increase insert offset
        if (i in bIndex.removes) {
            insertOffset++
        }
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        console.log(oldRoot)
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"./apply-properties":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/apply-properties.js","./create-element":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/create-element.js","./update-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/update-widget.js","vtree/is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js","vtree/vpatch":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vpatch.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/patch.js":[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive }
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/dom-index.js","./patch-op":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/patch-op.js","global/document":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/global/document.js","x-is-array":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/x-is-array/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/update-widget.js":[function(require,module,exports){
var isWidget = require("vtree/is-widget")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"vtree/is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/attribute-hook.js":[function(require,module,exports){
module.exports = AttributeHook;

function AttributeHook(value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(value);
    }

    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.value === this.value) {
        return;
    }

    node.setAttributeNS(null, prop, this.value)
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/data-set-hook.js":[function(require,module,exports){
var DataSet = require("data-set")

module.exports = DataSetHook;

function DataSetHook(value) {
    if (!(this instanceof DataSetHook)) {
        return new DataSetHook(value);
    }

    this.value = value;
}

DataSetHook.prototype.hook = function (node, propertyName) {
    var ds = DataSet(node)
    var propName = propertyName.substr(5)

    ds[propName] = this.value;
};

},{"data-set":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/node_modules/data-set/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/ev-hook.js":[function(require,module,exports){
var DataSet = require("data-set")

module.exports = DataSetHook;

function DataSetHook(value) {
    if (!(this instanceof DataSetHook)) {
        return new DataSetHook(value);
    }

    this.value = value;
}

DataSetHook.prototype.hook = function (node, propertyName) {
    var ds = DataSet(node)
    var propName = propertyName.substr(3)

    ds[propName] = this.value;
};

},{"data-set":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/node_modules/data-set/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/soft-set-hook.js":[function(require,module,exports){
module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/index.js":[function(require,module,exports){
var VNode = require("vtree/vnode.js")
var VText = require("vtree/vtext.js")
var isVNode = require("vtree/is-vnode")
var isVText = require("vtree/is-vtext")
var isWidget = require("vtree/is-widget")
var isHook = require("vtree/is-vhook")
var isVThunk = require("vtree/is-thunk")
var TypedError = require("error/typed")

var parseTag = require("./parse-tag.js")
var softSetHook = require("./hooks/soft-set-hook.js")
var dataSetHook = require("./hooks/data-set-hook.js")
var evHook = require("./hooks/ev-hook.js")

var UnexpectedVirtualElement = TypedError({
    type: "virtual-hyperscript.unexpected.virtual-element",
    message: "Unexpected virtual child passed to h().\n" +
        "Expected a VNode / Vthunk / VWidget / string but:\n" +
        "got a {foreignObjectStr}.\n" +
        "The parent vnode is {parentVnodeStr}.\n" +
        "Suggested fix: change your `h(..., [ ... ])` callsite.",
    foreignObjectStr: null,
    parentVnodeStr: null,
    foreignObject: null,
    parentVnode: null
})

module.exports = h

function h(tagName, properties, children) {
    var childNodes = []
    var tag, props, key, namespace

    if (!children && isChildren(properties)) {
        children = properties
        props = {}
    }

    props = props || properties || {}
    tag = parseTag(tagName, props)

    // support keys
    if ("key" in props) {
        key = props.key
        props.key = undefined
    }

    // support namespace
    if ("namespace" in props) {
        namespace = props.namespace
        props.namespace = undefined
    }

    // fix cursor bug
    if (tag === "input" &&
        "value" in props &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value)
    }

    var keys = Object.keys(props)
    var propName, value
    for (var j = 0; j < keys.length; j++) {
        propName = keys[j]
        value = props[propName]
        if (isHook(value)) {
            continue
        }

        // add data-foo support
        if (propName.substr(0, 5) === "data-") {
            props[propName] = dataSetHook(value)
        }

        // add ev-foo support
        if (propName.substr(0, 3) === "ev-") {
            props[propName] = evHook(value)
        }
    }

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props)
    }


    var node = new VNode(tag, props, childNodes, key, namespace)

    return node
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === "string") {
        childNodes.push(new VText(c))
    } else if (isChild(c)) {
        childNodes.push(c)
    } else if (Array.isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props)
        }
    } else if (c === null || c === undefined) {
        return
    } else {
        throw UnexpectedVirtualElement({
            foreignObjectStr: JSON.stringify(c),
            foreignObject: c,
            parentVnodeStr: JSON.stringify({
                tagName: tag,
                properties: props
            }),
            parentVnode: {
                tagName: tag,
                properties: props
            }
        })
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x)
}

function isChildren(x) {
    return typeof x === "string" || Array.isArray(x) || isChild(x)
}

},{"./hooks/data-set-hook.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/data-set-hook.js","./hooks/ev-hook.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/ev-hook.js","./hooks/soft-set-hook.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/soft-set-hook.js","./parse-tag.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/parse-tag.js","error/typed":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/node_modules/error/typed.js","vtree/is-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-thunk.js","vtree/is-vhook":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vhook.js","vtree/is-vnode":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vnode.js","vtree/is-vtext":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vtext.js","vtree/is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js","vtree/vnode.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vnode.js","vtree/vtext.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vtext.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/node_modules/data-set/index.js":[function(require,module,exports){
module.exports=require("/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js")
},{"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/dom-delegator/node_modules/data-set/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/node_modules/error/typed.js":[function(require,module,exports){
module.exports=require("/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/typed.js")
},{"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/typed.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/main-loop/node_modules/error/typed.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/parse-tag.js":[function(require,module,exports){
var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/
var notClassId = /^\.|#/

module.exports = parseTag

function parseTag(tag, props) {
    if (!tag) {
        return "div"
    }

    var noId = !("id" in props)

    var tagParts = tag.split(classIdSplit)
    var tagName = null

    if (notClassId.test(tagParts[1])) {
        tagName = "div"
    }

    var classes, part, type, i
    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i]

        if (!part) {
            continue
        }

        type = part.charAt(0)

        if (!tagName) {
            tagName = part
        } else if (type === ".") {
            classes = classes || []
            classes.push(part.substring(1, part.length))
        } else if (type === "#" && noId) {
            props.id = part.substring(1, part.length)
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className)
        }

        props.className = classes.join(" ")
    }

    return tagName ? tagName.toLowerCase() : "div"
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/svg.js":[function(require,module,exports){
var attributeHook = require("./hooks/attribute-hook.js")
var h = require("./index.js")

var BLACKLISTED_KEYS = {
    "style": true,
    "namespace": true,
    "key": true
}
var SVG_NAMESPACE = "http://www.w3.org/2000/svg"

module.exports = svg

function svg(tagName, properties, children) {
    if (!children && isChildren(properties)) {
        children = properties
        properties = {}
    }

    properties = properties || {}

    // set namespace for svg
    properties.namespace = SVG_NAMESPACE

    // for each key, if attribute & string, bool or number then
    // convert it into a setAttribute hook
    for (var key in properties) {
        if (!properties.hasOwnProperty(key)) {
            continue
        }

        if (BLACKLISTED_KEYS[key]) {
            continue
        }

        var value = properties[key]
        if (typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            continue
        }

        properties[key] = attributeHook(value)
    }

    return h(tagName, properties, children)
}

function isChildren(x) {
    return typeof x === "string" || Array.isArray(x)
}

},{"./hooks/attribute-hook.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/hooks/attribute-hook.js","./index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/virtual-hyperscript/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/diff.js":[function(require,module,exports){
var isArray = require("x-is-array")
var isObject = require("is-object")

var VPatch = require("./vpatch")
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var handleThunk = require("./handle-thunk")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        if (isThunk(a) || isThunk(b)) {
            thunks(a, b, patch, index)
        } else {
            hooks(b, patch, index)
        }
        return
    }

    var apply = patch[index]

    if (b == null) {
        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
        destroyWidgets(a, patch, index)
    } else if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties, b.hooks)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                destroyWidgets(a, patch, index)
            }

            apply = diffChildren(a, b, patch, apply, index)
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            destroyWidgets(a, patch, index)
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            destroyWidgets(a, patch, index)
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))

        if (!isWidget(a)) {
            destroyWidgets(a, patch, index)
        }
    }

    if (apply) {
        patch[index] = apply
    }
}

function diffProps(a, b, hooks) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (hooks && aKey in hooks) {
            diff = diff || {}
            diff[aKey] = bValue
        } else {
            if (isObject(aValue) && isObject(bValue)) {
                if (getPrototype(bValue) !== getPrototype(aValue)) {
                    diff = diff || {}
                    diff[aKey] = bValue
                } else {
                    var objectDiff = diffProps(aValue, bValue)
                    if (objectDiff) {
                        diff = diff || {}
                        diff[aKey] = objectDiff
                    }
                }
            } else if (aValue !== bValue) {
                diff = diff || {}
                diff[aKey] = bValue
            }
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = reorder(aChildren, b.children)

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else if (!rightNode) {
            if (leftNode) {
                // Excess nodes in a need to be removed
                patch[index] = new VPatch(VPatch.REMOVE, leftNode, null)
                destroyWidgets(leftNode, patch, index)
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (bChildren.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves))
    }

    return apply
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = new VPatch(VPatch.REMOVE, vNode, null)
        }
    } else if (isVNode(vNode) && vNode.hasWidgets) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b);
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true;
        }
    }

    return false;
}

// Execute hooks when two nodes are identical
function hooks(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = new VPatch(VPatch.PROPS, vNode.hooks, vNode.hooks)
        }

        if (vNode.descendantHooks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                hooks(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    }
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {

    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return bChildren
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return bChildren
    }

    var bMatch = {}, aMatch = {}

    for (var key in bKeys) {
        bMatch[bKeys[key]] = aKeys[key]
    }

    for (var key in aKeys) {
        aMatch[aKeys[key]] = bKeys[key]
    }

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen
    var shuffle = []
    var freeIndex = 0
    var i = 0
    var moveIndex = 0
    var moves = {}
    var removes = moves.removes = {}
    var reverse = moves.reverse = {}
    var hasMoves = false

    while (freeIndex < len) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
            if (move !== moveIndex) {
                moves[move] = moveIndex
                reverse[moveIndex] = move
                hasMoves = true
            }
            moveIndex++
        } else if (i in aMatch) {
            shuffle[i] = undefined
            removes[i] = moveIndex++
            hasMoves = true
        } else {
            while (bMatch[freeIndex] !== undefined) {
                freeIndex++
            }

            if (freeIndex < len) {
                var freeChild = bChildren[freeIndex]
                if (freeChild) {
                    shuffle[i] = freeChild
                    if (freeIndex !== moveIndex) {
                        hasMoves = true
                        moves[freeIndex] = moveIndex
                        reverse[moveIndex] = freeIndex
                    }
                    moveIndex++
                }
                freeIndex++
            }
        }
        i++
    }

    if (hasMoves) {
        shuffle.moves = moves
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"./handle-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/handle-thunk.js","./is-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-thunk.js","./is-vnode":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vnode.js","./is-vtext":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vtext.js","./is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js","./vpatch":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vpatch.js","is-object":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/node_modules/is-object/index.js","x-is-array":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/node_modules/x-is-array/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/handle-thunk.js":[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-thunk.js","./is-vnode":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vnode.js","./is-vtext":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vtext.js","./is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-thunk.js":[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vhook.js":[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook && typeof hook.hook === "function" &&
        !hook.hasOwnProperty("hook")
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vnode.js":[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/version.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vtext.js":[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/version.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js":[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/node_modules/is-object/index.js":[function(require,module,exports){
module.exports=require("/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/is-object/index.js")
},{"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/is-object/index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/is-object/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/node_modules/x-is-array/index.js":[function(require,module,exports){
module.exports=require("/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/x-is-array/index.js")
},{"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/x-is-array/index.js":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vdom/node_modules/x-is-array/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/version.js":[function(require,module,exports){
module.exports = "1"

},{}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vnode.js":[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property)) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-vhook":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vhook.js","./is-vnode":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-vnode.js","./is-widget":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/is-widget.js","./version":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/version.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vpatch.js":[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/version.js"}],"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/vtext.js":[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":"/Users/dguttman/test/simple-wiki/node_modules/mercury/node_modules/vtree/version.js"}],"/Users/dguttman/test/simple-wiki/node_modules/superagent/lib/client.js":[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    try {
      var res = new Response(self);
      if ('HEAD' == method) res.text = null;
      self.callback(null, res);
    } catch(e) {
      var err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      self.callback(err);
    }
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":"/Users/dguttman/test/simple-wiki/node_modules/superagent/node_modules/component-emitter/index.js","reduce":"/Users/dguttman/test/simple-wiki/node_modules/superagent/node_modules/reduce-component/index.js"}],"/Users/dguttman/test/simple-wiki/node_modules/superagent/node_modules/component-emitter/index.js":[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],"/Users/dguttman/test/simple-wiki/node_modules/superagent/node_modules/reduce-component/index.js":[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],"/Users/dguttman/test/simple-wiki/node_modules/watchify/node_modules/browserify/node_modules/browser-resolve/empty.js":[function(require,module,exports){

},{}],"/Users/dguttman/test/simple-wiki/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},["/Users/dguttman/test/simple-wiki/client/entry.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvY2xpZW50L2FwaS5jb2ZmZWUiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9jbGllbnQvZW50cnkuY29mZmVlIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvY2xpZW50L2xpc3QuY29mZmVlIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvY2xpZW50L21haW4uY29mZmVlIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9hZGQtZXZlbnQuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9kb20tZGVsZWdhdG9yLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9kYXRhLXNldC9jcmVhdGUtaGFzaC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9kYXRhLXNldC9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL3dlYWttYXAtc2hpbS9jcmVhdGUtc3RvcmUuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvd2Vha21hcC1zaGltL2hpZGRlbi1zdG9yZS5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL3Byb3h5LWV2ZW50LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvcmVtb3ZlLWV2ZW50LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL2V2ZW50LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL211bHRpcGxlLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL3NpbmdsZS5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3AvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9lcnJvci9ub2RlX21vZHVsZXMvY2FtZWxpemUvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9lcnJvci9ub2RlX21vZHVsZXMvc3RyaW5nLXRlbXBsYXRlL2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvZXJyb3Ivbm9kZV9tb2R1bGVzL3h0ZW5kL211dGFibGUuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9lcnJvci90eXBlZC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3Avbm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3Avbm9kZV9tb2R1bGVzL3JhZi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utbm93L2xpYi9wZXJmb3JtYW5jZS1ub3cuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L2FkZC1saXN0ZW5lci5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktbWV0aG9kcy5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L25vZGVfbW9kdWxlcy9hZGlmZi9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvcHV0LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9zcGxpY2UuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L3RyYW5zYWN0aW9uLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1zdHJ1Y3QvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXN0cnVjdC9ub2RlX21vZHVsZXMveHRlbmQvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXZhcmhhc2gvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXZhcmhhc2gvbm9kZV9tb2R1bGVzL3h0ZW5kL2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi9jb21wdXRlZC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2L3dhdGNoLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2Jhc2UtZXZlbnQuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvY2hhbmdlLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2V2ZW50LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2tleS5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ub2RlX21vZHVsZXMvZG9tLXdhbGsvaW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS1zZXQvZWxlbWVudC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ub2RlX21vZHVsZXMvZm9ybS1kYXRhLXNldC9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ub2RlX21vZHVsZXMveHRlbmQvaGFzLWtleXMuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL3h0ZW5kL2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L3N1Ym1pdC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC92YWx1ZS5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL2ltbXV0YWJsZS10aHVuay5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Zkb20tdGh1bmsvcGFydGlhbC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL3NoYWxsb3ctZXEuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS9hcHBseS1wcm9wZXJ0aWVzLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Zkb20vY3JlYXRlLWVsZW1lbnQuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS9kb20taW5kZXguanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS9ub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Zkb20vbm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tL25vZGVfbW9kdWxlcy94LWlzLWFycmF5L2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Zkb20vcGF0Y2gtb3AuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS9wYXRjaC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tL3VwZGF0ZS13aWRnZXQuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1oeXBlcnNjcmlwdC9ob29rcy9hdHRyaWJ1dGUtaG9vay5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL2RhdGEtc2V0LWhvb2suanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1oeXBlcnNjcmlwdC9ob29rcy9ldi1ob29rLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaG9va3Mvc29mdC1zZXQtaG9vay5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWh5cGVyc2NyaXB0L2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtaHlwZXJzY3JpcHQvbm9kZV9tb2R1bGVzL2RhdGEtc2V0L2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtaHlwZXJzY3JpcHQvbm9kZV9tb2R1bGVzL2Vycm9yL3R5cGVkLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtaHlwZXJzY3JpcHQvcGFyc2UtdGFnLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtaHlwZXJzY3JpcHQvc3ZnLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL2RpZmYuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdnRyZWUvaGFuZGxlLXRodW5rLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL2lzLXRodW5rLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL2lzLXZob29rLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL2lzLXZub2RlLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL2lzLXZ0ZXh0LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL2lzLXdpZGdldC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92dHJlZS9ub2RlX21vZHVsZXMvaXMtb2JqZWN0L2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL25vZGVfbW9kdWxlcy94LWlzLWFycmF5L2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL3ZlcnNpb24uanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdnRyZWUvdm5vZGUuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdnRyZWUvdnBhdGNoLmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Z0cmVlL3Z0ZXh0LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9jb21wb25lbnQtZW1pdHRlci9pbmRleC5qcyIsIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9zdXBlcmFnZW50L25vZGVfbW9kdWxlcy9yZWR1Y2UtY29tcG9uZW50L2luZGV4LmpzIiwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsMEJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBQWIsQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBUCxHQUFpQixHQUFBLEdBQ2Y7QUFBQSxFQUFBLGVBQUEsRUFBaUIsU0FBQyxFQUFELEdBQUE7V0FBUSxHQUFBLENBQUksZ0JBQUosRUFBc0IsRUFBdEIsRUFBUjtFQUFBLENBQWpCO0FBQUEsRUFDQSxXQUFBLEVBQWEsU0FBQyxJQUFELEVBQU8sRUFBUCxHQUFBO1dBQWMsR0FBQSxDQUFJLGlCQUFBLEdBQW9CLElBQXhCLEVBQThCLEVBQTlCLEVBQWQ7RUFBQSxDQURiO0FBQUEsRUFFQSxZQUFBLEVBQWMsU0FBQyxJQUFELEVBQU8sRUFBUCxFQUFXLEVBQVgsR0FBQTtBQUNaLFFBQUEsR0FBQTtBQUFBLElBQUEsR0FBQSxHQUFNLGlCQUFBLEdBQW9CLElBQTFCLENBQUE7V0FDQSxJQUFBLENBQUssR0FBTCxFQUFVO0FBQUEsTUFBQyxRQUFBLEVBQVUsRUFBWDtLQUFWLEVBQTBCLEVBQTFCLEVBRlk7RUFBQSxDQUZkO0NBSEYsQ0FBQTs7QUFBQSxHQVNBLEdBQU0sU0FBQyxHQUFELEVBQU0sRUFBTixHQUFBO1NBQ0osVUFBVSxDQUFDLEdBQVgsQ0FBZSxHQUFmLENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ3RCLElBQUEsSUFBaUIsR0FBakI7QUFBQSxhQUFPLEVBQUEsQ0FBRyxHQUFILENBQVAsQ0FBQTtLQUFBO0FBRUEsSUFBQSxJQUFHLEdBQUcsQ0FBQyxNQUFKLElBQWMsR0FBakI7QUFDRSxNQUFBLEdBQUEsR0FBTSxDQUFDLEdBQUcsQ0FBQyxNQUFMLEVBQWEsR0FBRyxDQUFDLElBQWpCLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBNUIsQ0FBTixDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsR0FBQSxHQUFNLElBQU4sQ0FIRjtLQUZBO1dBT0EsRUFBQSxDQUFHLEdBQUgsRUFBUSxHQUFHLENBQUMsSUFBWixFQVJzQjtFQUFBLENBQXhCLEVBREk7QUFBQSxDQVROLENBQUE7O0FBQUEsSUFvQkEsR0FBTyxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksRUFBWixHQUFBO1NBQ0wsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsR0FBaEIsQ0FDRSxDQUFDLElBREgsQ0FDUSxJQURSLENBRUUsQ0FBQyxHQUZILENBRU8sU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBQ0gsSUFBQSxJQUFpQixHQUFqQjtBQUFBLGFBQU8sRUFBQSxDQUFHLEdBQUgsQ0FBUCxDQUFBO0tBQUE7QUFFQSxJQUFBLElBQUcsR0FBRyxDQUFDLE1BQUosSUFBYyxHQUFqQjtBQUNFLE1BQUEsR0FBQSxHQUFNLENBQUMsR0FBRyxDQUFDLE1BQUwsRUFBYSxHQUFHLENBQUMsSUFBakIsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixDQUFOLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxHQUFBLEdBQU0sSUFBTixDQUhGO0tBRkE7V0FPQSxFQUFBLENBQUcsR0FBSCxFQUFRLEdBQUcsQ0FBQyxJQUFaLEVBUkc7RUFBQSxDQUZQLEVBREs7QUFBQSxDQXBCUCxDQUFBOzs7OztBQ0FBLElBQUEsa0NBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxlQUFSLENBQVgsQ0FBQTs7QUFBQSxRQUNBLEdBQVcsT0FBQSxDQUFRLGVBQVIsQ0FEWCxDQUFBOztBQUFBLElBR0EsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QixDQUhQLENBQUE7O0FBQUEsSUFJQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCLENBSlAsQ0FBQTs7QUFNQSxJQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFoQixLQUF3QixFQUF6QixDQUFBLElBQ0QsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQWhCLEtBQXdCLEdBQXpCLENBREMsSUFFRCxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsS0FBd0IsSUFBekIsQ0FGRjtBQUdJLEVBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFoQixHQUF1QixVQUF2QixDQUhKO0NBTkE7O0FBQUEsRUFXQSxHQUFTLElBQUEsUUFBQSxDQUFTLElBQVQsQ0FYVCxDQUFBOztBQUFBLElBWUEsR0FBVyxJQUFBLFFBQUEsQ0FBUyxJQUFULENBWlgsQ0FBQTs7Ozs7QUNBQSxJQUFBLHlEQUFBOztBQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUixDQUFWLENBQUE7O0FBQUEsaUJBQ0MsTUFBRCxFQUFTLGdCQUFBLEtBQVQsRUFBZ0IsZ0JBQUEsS0FEaEIsQ0FBQTs7QUFBQSxZQUVDLENBQUQsRUFBSSxnQkFBQSxLQUFKLEVBQVcsZ0JBQUEsS0FGWCxDQUFBOztBQUFBLEdBSUEsR0FBTSxPQUFBLENBQVEsY0FBUixDQUpOLENBQUE7O0FBQUEsTUFNTSxDQUFDLE9BQVAsR0FBaUIsSUFBQSxHQUFPLFNBQUUsRUFBRixHQUFBO0FBQ3RCLEVBRHVCLElBQUMsQ0FBQSxLQUFBLEVBQ3hCLENBQUE7QUFBQSxFQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFBQSxDQUNQO0FBQUEsSUFBQSxTQUFBLEVBQVcsS0FBQSxDQUFNLEVBQU4sQ0FBWDtBQUFBLElBQ0EsU0FBQSxFQUFXLEtBQUEsQ0FBTSxJQUFOLENBRFg7R0FETyxDQUFULENBQUE7QUFBQSxFQUlBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBQSxDQUFNLEVBQU4sQ0FKVixDQUFBO0FBQUEsRUFNQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxFQUFiLEVBQWlCLElBQUMsQ0FBQSxLQUFsQixFQUF5QixJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQXpCLENBTkEsQ0FBQTtTQVFBLElBQUMsQ0FBQSxhQUFELENBQUEsRUFUc0I7QUFBQSxDQU54QixDQUFBOztBQUFBLElBaUJJLENBQUEsU0FBRSxDQUFBLGFBQU4sR0FBc0IsU0FBQSxHQUFBO0FBQ3BCLEVBQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBakIsQ0FBcUIsSUFBckIsQ0FBQSxDQUFBO1NBQ0EsR0FBRyxDQUFDLGVBQUosQ0FBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUMsR0FBRCxFQUFNLElBQU4sR0FBQTtBQUNsQixVQUFBLHVCQUFBO0FBQUEsTUFBQSxLQUFDLENBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFqQixDQUFxQixLQUFyQixDQUFBLENBQUE7QUFDQTtXQUFBLDJDQUFBO3VCQUFBO0FBQUEsc0JBQUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBakIsQ0FBc0IsR0FBdEIsRUFBQSxDQUFBO0FBQUE7c0JBRmtCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUFGb0I7QUFBQSxDQWpCdEIsQ0FBQTs7QUFBQSxJQXdCSSxDQUFBLFNBQUUsQ0FBQSxNQUFOLEdBQWUsU0FBQyxLQUFELEdBQUE7U0FDYixDQUFBLENBQUUsV0FBRixFQUFlO0lBRVYsS0FBSyxDQUFDLFNBQVQsR0FDRSxJQUFDLENBQUEsYUFBRCxDQUFBLENBREYsR0FHRSxDQUFBLENBQUUsTUFBRixFQUFVO01BQ1IsQ0FBQSxDQUFFLFlBQUYsRUFBZ0I7UUFDZCxDQUFBLENBQUUsSUFBRixFQUFRLGFBQVIsQ0FEYyxFQUVkLENBQUEsQ0FBRSxzQkFBRixFQUNFO0FBQUEsVUFBQSxXQUFBLEVBQWEsU0FBQyxHQUFELEdBQUE7QUFDWCxZQUFBLEtBQUEsR0FBUSxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQVgsQ0FBeUIsT0FBekIsQ0FBUixDQUFBO0FBQUEsWUFDQSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQWhCLEdBQXVCLEdBQUEsR0FBSSxLQUFLLENBQUMsS0FEakMsQ0FBQTtBQUVBLG1CQUFPLEtBQVAsQ0FIVztVQUFBLENBQWI7U0FERixFQUtFO1VBQ0EsQ0FBQSxDQUFFLG9CQUFGLEVBQXdCO0FBQUEsWUFBQSxXQUFBLEVBQWEsUUFBYjtXQUF4QixDQURBO1NBTEYsQ0FGYyxFQVVkLENBQUEsQ0FBRSxJQUFGLENBVmMsRUFXZCxDQUFBLENBQUUsZUFBRixFQUFtQixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixJQUFoQixDQUFwQixDQUFuQixDQVhjO09BQWhCLENBRFE7S0FBVixDQUxXO0dBQWYsRUFEYTtBQUFBLENBeEJmLENBQUE7O0FBQUEsSUFnREksQ0FBQSxTQUFFLENBQUEsU0FBTixHQUFrQixTQUFDLEdBQUQsR0FBQTtTQUNoQixDQUFBLENBQUUsb0JBQUYsRUFBd0I7SUFDdEIsQ0FBQSxDQUFFLGdCQUFGLEVBQ0U7QUFBQSxNQUFBLElBQUEsRUFBTSxJQUFBLEdBQU8sR0FBYjtLQURGLEVBRUUsR0FGRixDQURzQjtHQUF4QixFQURnQjtBQUFBLENBaERsQixDQUFBOztBQUFBLElBdURJLENBQUEsU0FBRSxDQUFBLGFBQU4sR0FBc0IsU0FBQSxHQUFBO0FBQ3BCLE1BQUEsR0FBQTtBQUFBLEVBQUEsR0FBQSxHQUFNLGNBQU4sQ0FBQTtTQUNBLENBQUEsQ0FBRSxLQUFGLEVBQ0U7QUFBQSxJQUFBLEdBQUEsRUFBSyxHQUFMO0FBQUEsSUFDQSxLQUFBLEVBQ0U7QUFBQSxNQUFBLFFBQUEsRUFBVSxVQUFWO0FBQUEsTUFDQSxHQUFBLEVBQUssRUFETDtBQUFBLE1BRUEsS0FBQSxFQUFPLEVBRlA7S0FGRjtHQURGLEVBRm9CO0FBQUEsQ0F2RHRCLENBQUE7Ozs7O0FDQUEsSUFBQSxpRkFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FBVixDQUFBOztBQUFBLGlCQUNDLE1BQUQsRUFBUyxnQkFBQSxLQUFULEVBQWdCLGdCQUFBLEtBRGhCLENBQUE7O0FBQUEsWUFFQyxDQUFELEVBQUksZ0JBQUEsS0FBSixFQUFXLGdCQUFBLEtBRlgsQ0FBQTs7QUFBQSxHQUlBLEdBQU0sT0FBQSxDQUFRLGNBQVIsQ0FKTixDQUFBOztBQUFBLGFBS0EsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSLENBTGhCLENBQUE7O0FBQUEsTUFPTSxDQUFDLE9BQVAsR0FBaUIsSUFBQSxHQUFPLFNBQUUsRUFBRixHQUFBO0FBQ3RCLEVBRHVCLElBQUMsQ0FBQSxLQUFBLEVBQ3hCLENBQUE7QUFBQSxFQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFBQSxDQUNQO0FBQUEsSUFBQSxZQUFBLEVBQWMsS0FBQSxDQUFNLE9BQUEsQ0FBQSxDQUFOLENBQWQ7QUFBQSxJQUNBLGVBQUEsRUFBaUIsS0FBQSxDQUFNLEVBQU4sQ0FEakI7QUFBQSxJQUVBLFNBQUEsRUFBVyxLQUFBLENBQU0sS0FBTixDQUZYO0FBQUEsSUFHQSxTQUFBLEVBQVcsS0FBQSxDQUFNLEtBQU4sQ0FIWDtHQURPLENBQVQsQ0FBQTtBQUFBLEVBTUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxLQUFBLENBQU0sQ0FBQyxXQUFELEVBQWMsU0FBZCxFQUF5QixZQUF6QixDQUFOLENBTlYsQ0FBQTtBQUFBLEVBT0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQWtCLElBQUMsQ0FBQSxTQUFuQixDQVBBLENBQUE7QUFBQSxFQVFBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixJQUFDLENBQUEsT0FBakIsQ0FSQSxDQUFBO0FBQUEsRUFTQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBQyxDQUFBLFVBQXBCLENBVEEsQ0FBQTtBQUFBLEVBV0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFDLENBQUEsRUFBYixFQUFpQixJQUFDLENBQUEsS0FBbEIsRUFBeUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUF6QixDQVhBLENBQUE7QUFBQSxFQWFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFQLENBQUEsQ0FBWCxDQWJBLENBQUE7U0FjQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsWUFBeEIsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtXQUFBLFNBQUMsR0FBRCxHQUFBO2FBQ3BDLEtBQUMsQ0FBQSxTQUFELENBQVcsT0FBQSxDQUFBLENBQVgsRUFEb0M7SUFBQSxFQUFBO0VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QyxFQWZzQjtBQUFBLENBUHhCLENBQUE7O0FBQUEsSUF5QkksQ0FBQSxTQUFFLENBQUEsU0FBTixHQUFrQixTQUFDLEtBQUQsR0FBQTtBQUNoQixFQUFBLElBQUEsQ0FBQSxLQUFBO0FBQUEsVUFBQSxDQUFBO0dBQUE7QUFBQSxFQUVBLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEdBQUEsR0FBTSxLQUZ0QixDQUFBO0FBQUEsRUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFwQixDQUF3QixLQUF4QixDQUhBLENBQUE7QUFBQSxFQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLElBQXJCLENBSkEsQ0FBQTtTQUtBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLEtBQWhCLEVBQXVCLENBQUEsU0FBQSxLQUFBLEdBQUE7V0FBQSxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDckIsTUFBQSxLQUFDLENBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFqQixDQUFxQixLQUFyQixDQUFBLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQSxJQUFTLElBQUksQ0FBQyxRQUFqQjtBQUNFLFFBQUEsS0FBQyxDQUFBLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBakIsQ0FBcUIsS0FBckIsQ0FBQSxDQUFBO2VBQ0EsS0FBQyxDQUFBLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBdkIsQ0FBMkIsSUFBSSxDQUFDLFFBQWhDLEVBRkY7T0FBQSxNQUFBO0FBSUUsUUFBQSxLQUFDLENBQUEsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFqQixDQUFxQixJQUFyQixDQUFBLENBQUE7ZUFDQSxLQUFDLENBQUEsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUF2QixDQUEyQixFQUEzQixFQUxGO09BRnFCO0lBQUEsRUFBQTtFQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkIsRUFOZ0I7QUFBQSxDQXpCbEIsQ0FBQTs7QUFBQSxJQXdDSSxDQUFBLFNBQUUsQ0FBQSxPQUFOLEdBQWdCLFNBQUEsR0FBQTtTQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLElBQXJCLEVBQUg7QUFBQSxDQXhDaEIsQ0FBQTs7QUFBQSxJQXlDSSxDQUFBLFNBQUUsQ0FBQSxVQUFOLEdBQW1CLFNBQUEsR0FBQTtTQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLEtBQXJCLEVBQUg7QUFBQSxDQXpDbkIsQ0FBQTs7QUFBQSxJQTJDSSxDQUFBLFNBQUUsQ0FBQSxNQUFOLEdBQWUsU0FBQyxLQUFELEdBQUE7U0FDYixDQUFBLENBQUUsZUFBRixFQUFtQjtJQUVqQixDQUFBLENBQUUsa0JBQUYsRUFBc0IsQ0FDcEIsQ0FBQSxDQUFFLElBQUYsRUFBUSxLQUFLLENBQUMsWUFBZCxDQURvQixDQUF0QixDQUZpQixFQU1kLEtBQUssQ0FBQyxTQUFULEdBQ0UsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQURGLEdBSUssS0FBSyxDQUFDLFNBQVQsR0FFRSxDQUFBLENBQUUsZ0JBQUYsRUFBb0I7TUFDbEIsQ0FBQSxDQUFFLHNCQUFGLEVBQTBCO1FBQ3hCLENBQUEsQ0FBRSwrQkFBRixFQUNFO0FBQUEsVUFBQSxVQUFBLEVBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTttQkFBQSxTQUFBLEdBQUE7cUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFIO1lBQUEsRUFBQTtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtTQURGLEVBRUUsTUFGRixDQUR3QixFQUl4QixDQUFBLENBQUUsd0JBQUYsRUFDRTtBQUFBLFVBQUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO3FCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFBSDtZQUFBLEVBQUE7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVo7U0FERixFQUVFLFNBRkYsQ0FKd0I7T0FBMUIsQ0FEa0IsRUFVbEIsQ0FBQSxDQUFFLHVCQUFGLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsR0FBRCxHQUFBO21CQUFTLEtBQUMsQ0FBQSxjQUFELENBQWdCLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBM0IsRUFBVDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxFQUROO0FBQUEsUUFFQSxXQUFBLEVBQWEsb0NBRmI7T0FERixFQUlFLEtBQUssQ0FBQyxlQUpSLENBVmtCO0tBQXBCLENBRkYsR0FvQkUsQ0FBQSxDQUFFLGdCQUFGLEVBQW9CO01BQ2xCLENBQUEsQ0FBRSxzQkFBRixFQUEwQjtRQUN4QixDQUFBLENBQUUsd0JBQUYsRUFDRTtBQUFBLFVBQUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7bUJBQUEsU0FBQSxHQUFBO3FCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtZQUFBLEVBQUE7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVo7U0FERixFQUVFLE1BRkYsQ0FEd0IsRUFLeEIsQ0FBQSxDQUFFLCtCQUFGLEVBQ0U7QUFBQSxVQUFBLFVBQUEsRUFBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO21CQUFBLFNBQUEsR0FBQTtxQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBLEVBQUg7WUFBQSxFQUFBO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaO1NBREYsRUFFRSxTQUZGLENBTHdCO09BQTFCLENBRGtCLEVBV2xCLENBQUEsQ0FBRSxXQUFGLEVBQWU7UUFDYixDQUFBLENBQUUsRUFBRixFQUFNO0FBQUEsVUFBQSxTQUFBLEVBQVcsYUFBQSxDQUFjLEtBQUssQ0FBQyxlQUFwQixDQUFYO1NBQU4sQ0FEYTtPQUFmLENBWGtCO0tBQXBCLENBOUJhO0dBQW5CLEVBRGE7QUFBQSxDQTNDZixDQUFBOztBQUFBLElBNEZJLENBQUEsU0FBRSxDQUFBLGNBQU4sR0FBdUIsU0FBQyxHQUFELEdBQUE7QUFDckIsRUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUF2QixDQUEyQixHQUEzQixDQUFBLENBQUE7U0FDQSxHQUFHLENBQUMsWUFBSixDQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVAsQ0FBQSxDQUFqQixFQUF3QyxHQUF4QyxFQUE2QyxTQUFBLEdBQUEsQ0FBN0MsRUFGcUI7QUFBQSxDQTVGdkIsQ0FBQTs7QUFBQSxJQWdHSSxDQUFBLFNBQUUsQ0FBQSxhQUFOLEdBQXNCLFNBQUEsR0FBQTtBQUNwQixNQUFBLEdBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxjQUFOLENBQUE7U0FDQSxDQUFBLENBQUUsS0FBRixFQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssR0FBTDtBQUFBLElBQ0EsS0FBQSxFQUNFO0FBQUEsTUFBQSxRQUFBLEVBQVUsVUFBVjtBQUFBLE1BQ0EsR0FBQSxFQUFLLEVBREw7QUFBQSxNQUVBLEtBQUEsRUFBTyxFQUZQO0tBRkY7R0FERixFQUZvQjtBQUFBLENBaEd0QixDQUFBOztBQUFBLE9BeUdBLEdBQVUsU0FBQSxHQUFBO1NBQ1IsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFkLENBQXNCLE1BQXRCLEVBQThCLEVBQTlCLEVBRFE7QUFBQSxDQXpHVixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTs7QUNBQTs7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJzdXBlcmFnZW50ID0gcmVxdWlyZSAnc3VwZXJhZ2VudCdcblxubW9kdWxlLmV4cG9ydHMgPSBhcGkgPVxuICBnZXRBbGxEb2N1bWVudHM6IChjYikgLT4gZ2V0ICcvYXBpL2RvY3VtZW50cycsIGNiXG4gIGdldERvY3VtZW50OiAobmFtZSwgY2IpIC0+IGdldCAnL2FwaS9kb2N1bWVudHMvJyArIG5hbWUsIGNiXG4gIHNhdmVEb2N1bWVudDogKG5hbWUsIG1kLCBjYikgLT5cbiAgICB1cmwgPSAnL2FwaS9kb2N1bWVudHMvJyArIG5hbWVcbiAgICBwb3N0IHVybCwge21hcmtkb3duOiBtZH0sIGNiXG5cbmdldCA9ICh1cmwsIGNiKSAtPlxuICBzdXBlcmFnZW50LmdldCh1cmwpLmVuZCAoZXJyLCByZXMpIC0+XG4gICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcblxuICAgIGlmIHJlcy5zdGF0dXMgPj0gNDAwXG4gICAgICBlcnIgPSBbcmVzLnN0YXR1cywgcmVzLmJvZHldLmpvaW4gJzogJ1xuICAgIGVsc2VcbiAgICAgIGVyciA9IG51bGxcblxuICAgIGNiIGVyciwgcmVzLmJvZHlcblxucG9zdCA9ICh1cmwsIGRhdGEsIGNiKSAtPlxuICBzdXBlcmFnZW50LnBvc3QodXJsKVxuICAgIC5zZW5kKGRhdGEpXG4gICAgLmVuZCAoZXJyLCByZXMpIC0+XG4gICAgICByZXR1cm4gY2IgZXJyIGlmIGVyclxuXG4gICAgICBpZiByZXMuc3RhdHVzID49IDQwMFxuICAgICAgICBlcnIgPSBbcmVzLnN0YXR1cywgcmVzLmJvZHldLmpvaW4gJzogJ1xuICAgICAgZWxzZVxuICAgICAgICBlcnIgPSBudWxsXG5cbiAgICAgIGNiIGVyciwgcmVzLmJvZHlcbiIsIkxpc3RWaWV3ID0gcmVxdWlyZSAnLi9saXN0LmNvZmZlZSdcbk1haW5WaWV3ID0gcmVxdWlyZSAnLi9tYWluLmNvZmZlZSdcblxubWFpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJy5tYWluJ1xubGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IgJy5saXN0J1xuXG5pZiAod2luZG93LmxvY2F0aW9uLmhhc2ggaXMgJycpIG9yXG4gICh3aW5kb3cubG9jYXRpb24uaGFzaCBpcyAnIycpIG9yXG4gICh3aW5kb3cubG9jYXRpb24uaGFzaCBpcyAnIy8nKVxuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJy9XZWxjb21lJ1xuXG5tdiA9IG5ldyBNYWluVmlldyBtYWluXG5saXN0ID0gbmV3IExpc3RWaWV3IGxpc3RcbiIsIm1lcmN1cnkgPSByZXF1aXJlICdtZXJjdXJ5J1xue3N0cnVjdCwgYXJyYXksIHZhbHVlfSA9IG1lcmN1cnlcbntoLCBldmVudCwgaW5wdXR9ID0gbWVyY3VyeVxuXG5hcGkgPSByZXF1aXJlICcuL2FwaS5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzID0gTGlzdCA9IChAZWwpIC0+XG4gIEBzdGF0ZSA9IHN0cnVjdFxuICAgIGRvY3VtZW50czogYXJyYXkgW11cbiAgICBpc0xvYWRpbmc6IHZhbHVlIHRydWVcblxuICBAZXZlbnRzID0gaW5wdXQgW11cblxuICBtZXJjdXJ5LmFwcCBAZWwsIEBzdGF0ZSwgQHJlbmRlci5iaW5kKHRoaXMpXG5cbiAgQGxvYWREb2N1bWVudHMoKVxuXG5MaXN0Ojpsb2FkRG9jdW1lbnRzID0gLT5cbiAgQHN0YXRlLmlzTG9hZGluZy5zZXQgdHJ1ZVxuICBhcGkuZ2V0QWxsRG9jdW1lbnRzIChlcnIsIGRvY3MpID0+XG4gICAgQHN0YXRlLmlzTG9hZGluZy5zZXQgZmFsc2VcbiAgICBAc3RhdGUuZG9jdW1lbnRzLnB1c2ggZG9jIGZvciBkb2MgaW4gZG9jc1xuICAgICMgQHN0YXRlLmRvY3VtZW50cy5zZXQgYXJyYXkgZG9jc1xuXG5MaXN0OjpyZW5kZXIgPSAoc3RhdGUpIC0+XG4gIGggJy5saXN0VmlldycsIFtcblxuICAgIGlmIHN0YXRlLmlzTG9hZGluZ1xuICAgICAgQHJlbmRlckxvYWRpbmcoKVxuICAgIGVsc2VcbiAgICAgIGggJy5yb3cnLCBbXG4gICAgICAgIGggJy5jb2wteHMtMTInLCBbXG4gICAgICAgICAgaCAnaDMnLCAnU2ltcGxlIFdpa2knXG4gICAgICAgICAgaCAnZm9ybS5saXN0Vmlldy1zZWFyY2gnLCBcbiAgICAgICAgICAgICdldi1zdWJtaXQnOiAoZXZ0KSAtPlxuICAgICAgICAgICAgICBpbnB1dCA9IGV2dC50YXJnZXQucXVlcnlTZWxlY3RvcignaW5wdXQnKVxuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcvJytpbnB1dC52YWx1ZVxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAsIFtcbiAgICAgICAgICAgIGggJ2lucHV0LmZvcm0tY29udHJvbCcsIHBsYWNlaG9sZGVyOiAnQ3JlYXRlJ1xuICAgICAgICAgIF1cbiAgICAgICAgICBoICdicidcbiAgICAgICAgICBoICd1bC5saXN0LWdyb3VwJywgc3RhdGUuZG9jdW1lbnRzLm1hcCBAcmVuZGVyRG9jLmJpbmQodGhpcylcbiAgICAgICAgXVxuICAgICAgXVxuXG4gIF1cblxuTGlzdDo6cmVuZGVyRG9jID0gKGRvYykgLT5cbiAgaCAnbGkubGlzdC1ncm91cC1pdGVtJywgW1xuICAgIGggJ2EuYnRuLmJ0bi1saW5rJyxcbiAgICAgIGhyZWY6ICcjLycgKyBkb2NcbiAgICAsIGRvY1xuICBdXG5cbkxpc3Q6OnJlbmRlckxvYWRpbmcgPSAtPlxuICBpbWcgPSAnL2xvYWRpbmcuZ2lmJ1xuICBoICdpbWcnLFxuICAgIHNyYzogaW1nXG4gICAgc3R5bGU6XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICAgICAgdG9wOiAxMFxuICAgICAgcmlnaHQ6IDEwXG4iLCJtZXJjdXJ5ID0gcmVxdWlyZSAnbWVyY3VyeSdcbntzdHJ1Y3QsIGFycmF5LCB2YWx1ZX0gPSBtZXJjdXJ5XG57aCwgZXZlbnQsIGlucHV0fSA9IG1lcmN1cnlcblxuYXBpID0gcmVxdWlyZSAnLi9hcGkuY29mZmVlJ1xucGFyc2VNYXJrZG93biA9IHJlcXVpcmUgJ21hcmtlZC9saWIvbWFya2VkJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpc3QgPSAoQGVsKSAtPlxuICBAc3RhdGUgPSBzdHJ1Y3RcbiAgICBjdXJyZW50VGl0bGU6IHZhbHVlIGdldEhhc2goKVxuICAgIGN1cnJlbnRNYXJrZG93bjogdmFsdWUgJydcbiAgICBpc0xvYWRpbmc6IHZhbHVlIGZhbHNlXG4gICAgaXNFZGl0aW5nOiB2YWx1ZSBmYWxzZVxuXG4gIEBldmVudHMgPSBpbnB1dCBbJ2NoYW5nZURvYycsICdzZXRFZGl0JywgJ3NldFByZXZpZXcnXVxuICBAZXZlbnRzLmNoYW5nZURvYyBAY2hhbmdlRG9jXG4gIEBldmVudHMuc2V0RWRpdCBAc2V0RWRpdFxuICBAZXZlbnRzLnNldFByZXZpZXcgQHNldFByZXZpZXdcblxuICBtZXJjdXJ5LmFwcCBAZWwsIEBzdGF0ZSwgQHJlbmRlci5iaW5kKHRoaXMpXG5cbiAgQGNoYW5nZURvYyBAc3RhdGUuY3VycmVudFRpdGxlKClcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2hhc2hjaGFuZ2UnLCAoZXZ0KSA9PlxuICAgIEBjaGFuZ2VEb2MgZ2V0SGFzaCgpXG5cbkxpc3Q6OmNoYW5nZURvYyA9ICh0aXRsZSkgLT5cbiAgcmV0dXJuIHVubGVzcyB0aXRsZVxuXG4gIGxvY2F0aW9uLmhhc2ggPSAnLycgKyB0aXRsZVxuICBAc3RhdGUuY3VycmVudFRpdGxlLnNldCB0aXRsZVxuICBAc3RhdGUuaXNMb2FkaW5nLnNldCB0cnVlXG4gIGFwaS5nZXREb2N1bWVudCB0aXRsZSwgKGVyciwgZGF0YSkgPT5cbiAgICBAc3RhdGUuaXNMb2FkaW5nLnNldCBmYWxzZVxuICAgIGlmIGRhdGEgYW5kIGRhdGEubWFya2Rvd25cbiAgICAgIEBzdGF0ZS5pc0VkaXRpbmcuc2V0IGZhbHNlXG4gICAgICBAc3RhdGUuY3VycmVudE1hcmtkb3duLnNldCBkYXRhLm1hcmtkb3duXG4gICAgZWxzZVxuICAgICAgQHN0YXRlLmlzRWRpdGluZy5zZXQgdHJ1ZVxuICAgICAgQHN0YXRlLmN1cnJlbnRNYXJrZG93bi5zZXQgJydcblxuTGlzdDo6c2V0RWRpdCA9IC0+IEBzdGF0ZS5pc0VkaXRpbmcuc2V0IHRydWVcbkxpc3Q6OnNldFByZXZpZXcgPSAtPiBAc3RhdGUuaXNFZGl0aW5nLnNldCBmYWxzZVxuXG5MaXN0OjpyZW5kZXIgPSAoc3RhdGUpIC0+XG4gIGggJy5tYWluVmlldy5yb3cnLCBbXG5cbiAgICBoICcubWFpblZpZXctaGVhZGVyJywgW1xuICAgICAgaCAnaDEnLCBzdGF0ZS5jdXJyZW50VGl0bGVcbiAgICBdXG5cbiAgICBpZiBzdGF0ZS5pc0xvYWRpbmdcbiAgICAgIEByZW5kZXJMb2FkaW5nKClcbiAgICBlbHNlXG5cbiAgICAgIGlmIHN0YXRlLmlzRWRpdGluZ1xuXG4gICAgICAgIGggJy5tYWluVmlldy1lZGl0JywgW1xuICAgICAgICAgIGggJy5tYWluVmlldy1lZGl0U3RhdHVzJywgW1xuICAgICAgICAgICAgaCAnYnV0dG9uLmJ0bi5idG4tZGVmYXVsdC5hY3RpdmUnLFxuICAgICAgICAgICAgICAnZXYtY2xpY2snOiA9PiBAc2V0RWRpdCgpXG4gICAgICAgICAgICAsICdFZGl0J1xuICAgICAgICAgICAgaCAnYnV0dG9uLmJ0bi5idG4tZGVmYXVsdCcsXG4gICAgICAgICAgICAgICdldi1jbGljayc6ID0+IEBzZXRQcmV2aWV3KClcbiAgICAgICAgICAgICwgJ1ByZXZpZXcnXG4gICAgICAgICAgXVxuXG4gICAgICAgICAgaCAndGV4dGFyZWEuZm9ybS1jb250cm9sJyxcbiAgICAgICAgICAgICdldi1jaGFuZ2UnOiAoZXZ0KSA9PiBAdXBkYXRlTWFya2Rvd24gZXZ0LnRhcmdldC52YWx1ZVxuICAgICAgICAgICAgcm93czogMjBcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnVGhpcyBpcyBhIG5ldyBwYWdlLiBDcmVhdGUgaXQgbm93ISdcbiAgICAgICAgICAsIHN0YXRlLmN1cnJlbnRNYXJrZG93blxuICAgICAgICBdXG4gICAgICBlbHNlXG5cbiAgICAgICAgaCAnLm1haW5WaWV3LXZpZXcnLCBbXG4gICAgICAgICAgaCAnLm1haW5WaWV3LWVkaXRTdGF0dXMnLCBbXG4gICAgICAgICAgICBoICdidXR0b24uYnRuLmJ0bi1kZWZhdWx0JyxcbiAgICAgICAgICAgICAgJ2V2LWNsaWNrJzogPT4gQHNldEVkaXQoKVxuICAgICAgICAgICAgLCAnRWRpdCdcblxuICAgICAgICAgICAgaCAnYnV0dG9uLmJ0bi5idG4tZGVmYXVsdC5hY3RpdmUnLFxuICAgICAgICAgICAgICAnZXYtY2xpY2snOiA9PiBAc2V0UHJldmlldygpXG4gICAgICAgICAgICAsICdQcmV2aWV3J1xuICAgICAgICAgIF1cblxuICAgICAgICAgIGggJy5tYXJrZG93bicsIFtcbiAgICAgICAgICAgIGggJycsIGlubmVySFRNTDogcGFyc2VNYXJrZG93biBzdGF0ZS5jdXJyZW50TWFya2Rvd25cbiAgICAgICAgICBdXG4gICAgICAgIF1cblxuICBdXG5cbkxpc3Q6OnVwZGF0ZU1hcmtkb3duID0gKHZhbCkgLT5cbiAgQHN0YXRlLmN1cnJlbnRNYXJrZG93bi5zZXQgdmFsXG4gIGFwaS5zYXZlRG9jdW1lbnQgQHN0YXRlLmN1cnJlbnRUaXRsZSgpLCB2YWwsIC0+XG5cbkxpc3Q6OnJlbmRlckxvYWRpbmcgPSAtPlxuICBpbWcgPSAnL2xvYWRpbmcuZ2lmJ1xuICBoICdpbWcnLFxuICAgIHNyYzogaW1nXG4gICAgc3R5bGU6XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICAgICAgdG9wOiAxMFxuICAgICAgcmlnaHQ6IDEwXG5cbmdldEhhc2ggPSAtPlxuICBsb2NhdGlvbi5oYXNoLnJlcGxhY2UgL14jXFwvLywgJydcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qKlxuICogbWFya2VkIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkXG4gKi9cblxuOyhmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cblxudmFyIGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXlxcbisvLFxuICBjb2RlOiAvXiggezR9W15cXG5dK1xcbiopKy8sXG4gIGZlbmNlczogbm9vcCxcbiAgaHI6IC9eKCAqWy0qX10pezMsfSAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eICooI3sxLDZ9KSAqKFteXFxuXSs/KSAqIyogKig/Olxcbit8JCkvLFxuICBucHRhYmxlOiBub29wLFxuICBsaGVhZGluZzogL14oW15cXG5dKylcXG4gKig9fC0pezIsfSAqKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCAqPlteXFxuXSsoXFxuKD8hZGVmKVteXFxuXSspKlxcbiopKy8sXG4gIGxpc3Q6IC9eKCAqKShidWxsKSBbXFxzXFxTXSs/KD86aHJ8ZGVmfFxcbnsyLH0oPyEgKSg/IVxcMWJ1bGwgKVxcbip8XFxzKiQpLyxcbiAgaHRtbDogL14gKig/OmNvbW1lbnR8Y2xvc2VkfGNsb3NpbmcpICooPzpcXG57Mix9fFxccyokKS8sXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICtbXCIoXShbXlxcbl0rKVtcIildKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcCxcbiAgcGFyYWdyYXBoOiAvXigoPzpbXlxcbl0rXFxuPyg/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXx0YWd8ZGVmKSkrKVxcbiovLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkK1xcLikvO1xuYmxvY2suaXRlbSA9IC9eKCAqKShidWxsKSBbXlxcbl0qKD86XFxuKD8hXFwxYnVsbCApW15cXG5dKikqLztcbmJsb2NrLml0ZW0gPSByZXBsYWNlKGJsb2NrLml0ZW0sICdnbScpXG4gICgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gICgpO1xuXG5ibG9jay5saXN0ID0gcmVwbGFjZShibG9jay5saXN0KVxuICAoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/OlstKl9dICopezMsfSg/OlxcXFxuK3wkKSknKVxuICAoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgKCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSByZXBsYWNlKGJsb2NrLmJsb2NrcXVvdGUpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuYmxvY2suX3RhZyA9ICcoPyEoPzonXG4gICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlJ1xuICArICd8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG8nXG4gICsgJ3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZylcXFxcYilcXFxcdysoPyE6L3xbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJztcblxuYmxvY2suaHRtbCA9IHJlcGxhY2UoYmxvY2suaHRtbClcbiAgKCdjb21tZW50JywgLzwhLS1bXFxzXFxTXSo/LS0+LylcbiAgKCdjbG9zZWQnLCAvPCh0YWcpW1xcc1xcU10rPzxcXC9cXDE+LylcbiAgKCdjbG9zaW5nJywgLzx0YWcoPzpcIlteXCJdKlwifCdbXiddKid8W14nXCI+XSkqPz4vKVxuICAoL3RhZy9nLCBibG9jay5fdGFnKVxuICAoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gcmVwbGFjZShibG9jay5wYXJhZ3JhcGgpXG4gICgnaHInLCBibG9jay5ocilcbiAgKCdoZWFkaW5nJywgYmxvY2suaGVhZGluZylcbiAgKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAoJ2Jsb2NrcXVvdGUnLCBibG9jay5ibG9ja3F1b3RlKVxuICAoJ3RhZycsICc8JyArIGJsb2NrLl90YWcpXG4gICgnZGVmJywgYmxvY2suZGVmKVxuICAoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGZlbmNlczogL14gKihgezMsfXx+ezMsfSkgKihcXFMrKT8gKlxcbihbXFxzXFxTXSs/KVxccypcXDEgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IC9eL1xufSk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSByZXBsYWNlKGJsb2NrLnBhcmFncmFwaClcbiAgKCcoPyEnLCAnKD8hJ1xuICAgICsgYmxvY2suZ2ZtLmZlbmNlcy5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDInKSArICd8J1xuICAgICsgYmxvY2subGlzdC5zb3VyY2UucmVwbGFjZSgnXFxcXDEnLCAnXFxcXDMnKSArICd8JylcbiAgKCk7XG5cbi8qKlxuICogR0ZNICsgVGFibGVzIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay50YWJsZXMgPSBtZXJnZSh7fSwgYmxvY2suZ2ZtLCB7XG4gIG5wdGFibGU6IC9eICooXFxTLipcXHwuKilcXG4gKihbLTpdKyAqXFx8Wy18IDpdKilcXG4oKD86LipcXHwuKig/OlxcbnwkKSkqKVxcbiovLFxuICB0YWJsZTogL14gKlxcfCguKylcXG4gKlxcfCggKlstOl0rWy18IDpdKilcXG4oKD86ICpcXHwuKig/OlxcbnwkKSkqKVxcbiovXG59KTtcblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5cbmZ1bmN0aW9uIExleGVyKG9wdGlvbnMpIHtcbiAgdGhpcy50b2tlbnMgPSBbXTtcbiAgdGhpcy50b2tlbnMubGlua3MgPSB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMucnVsZXMgPSBibG9jay5ub3JtYWw7XG5cbiAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRhYmxlcykge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLnRhYmxlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ydWxlcyA9IGJsb2NrLmdmbTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2UgQmxvY2sgUnVsZXNcbiAqL1xuXG5MZXhlci5ydWxlcyA9IGJsb2NrO1xuXG4vKipcbiAqIFN0YXRpYyBMZXggTWV0aG9kXG4gKi9cblxuTGV4ZXIubGV4ID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zKSB7XG4gIHZhciBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xufTtcblxuLyoqXG4gKiBQcmVwcm9jZXNzaW5nXG4gKi9cblxuTGV4ZXIucHJvdG90eXBlLmxleCA9IGZ1bmN0aW9uKHNyYykge1xuICBzcmMgPSBzcmNcbiAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJylcbiAgICAucmVwbGFjZSgvXFx0L2csICcgICAgJylcbiAgICAucmVwbGFjZSgvXFx1MDBhMC9nLCAnICcpXG4gICAgLnJlcGxhY2UoL1xcdTI0MjQvZywgJ1xcbicpO1xuXG4gIHJldHVybiB0aGlzLnRva2VuKHNyYywgdHJ1ZSk7XG59O1xuXG4vKipcbiAqIExleGluZ1xuICovXG5cbkxleGVyLnByb3RvdHlwZS50b2tlbiA9IGZ1bmN0aW9uKHNyYywgdG9wLCBicSkge1xuICB2YXIgc3JjID0gc3JjLnJlcGxhY2UoL14gKyQvZ20sICcnKVxuICAgICwgbmV4dFxuICAgICwgbG9vc2VcbiAgICAsIGNhcFxuICAgICwgYnVsbFxuICAgICwgYlxuICAgICwgaXRlbVxuICAgICwgc3BhY2VcbiAgICAsIGlcbiAgICAsIGw7XG5cbiAgd2hpbGUgKHNyYykge1xuICAgIC8vIG5ld2xpbmVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5uZXdsaW5lLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMF0ubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvZGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5jb2RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eIHs0fS9nbSwgJycpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gY2FwLnJlcGxhY2UoL1xcbiskLywgJycpXG4gICAgICAgICAgOiBjYXBcbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZmVuY2VzIChnZm0pXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZmVuY2VzLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIGxhbmc6IGNhcFsyXSxcbiAgICAgICAgdGV4dDogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGhlYWRpbmdcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5oZWFkaW5nLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0OiBjYXBbMl1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgbm8gbGVhZGluZyBwaXBlIChnZm0pXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5ucHRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoL1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldLnNwbGl0KC8gKlxcfCAqLyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goaXRlbSk7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxoZWFkaW5nXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMubGhlYWRpbmcuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgZGVwdGg6IGNhcFsyXSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXVxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBoclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmhyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnaHInXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGJsb2NrcXVvdGVcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5ibG9ja3F1b3RlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlX3N0YXJ0J1xuICAgICAgfSk7XG5cbiAgICAgIGNhcCA9IGNhcFswXS5yZXBsYWNlKC9eICo+ID8vZ20sICcnKTtcblxuICAgICAgLy8gUGFzcyBgdG9wYCB0byBrZWVwIHRoZSBjdXJyZW50XG4gICAgICAvLyBcInRvcGxldmVsXCIgc3RhdGUuIFRoaXMgaXMgZXhhY3RseVxuICAgICAgLy8gaG93IG1hcmtkb3duLnBsIHdvcmtzLlxuICAgICAgdGhpcy50b2tlbihjYXAsIHRvcCwgdHJ1ZSk7XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZV9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlzdFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpc3QuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgYnVsbCA9IGNhcFsyXTtcblxuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICdsaXN0X3N0YXJ0JyxcbiAgICAgICAgb3JkZXJlZDogYnVsbC5sZW5ndGggPiAxXG4gICAgICB9KTtcblxuICAgICAgLy8gR2V0IGVhY2ggdG9wLWxldmVsIGl0ZW0uXG4gICAgICBjYXAgPSBjYXBbMF0ubWF0Y2godGhpcy5ydWxlcy5pdGVtKTtcblxuICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgbCA9IGNhcC5sZW5ndGg7XG4gICAgICBpID0gMDtcblxuICAgICAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGNhcFtpXTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxpc3QgaXRlbSdzIGJ1bGxldFxuICAgICAgICAvLyBzbyBpdCBpcyBzZWVuIGFzIHRoZSBuZXh0IHRva2VuLlxuICAgICAgICBzcGFjZSA9IGl0ZW0ubGVuZ3RoO1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9eICooWyorLV18XFxkK1xcLikgKy8sICcnKTtcblxuICAgICAgICAvLyBPdXRkZW50IHdoYXRldmVyIHRoZVxuICAgICAgICAvLyBsaXN0IGl0ZW0gY29udGFpbnMuIEhhY2t5LlxuICAgICAgICBpZiAofml0ZW0uaW5kZXhPZignXFxuICcpKSB7XG4gICAgICAgICAgc3BhY2UgLT0gaXRlbS5sZW5ndGg7XG4gICAgICAgICAgaXRlbSA9ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICAgID8gaXRlbS5yZXBsYWNlKG5ldyBSZWdFeHAoJ14gezEsJyArIHNwYWNlICsgJ30nLCAnZ20nKSwgJycpXG4gICAgICAgICAgICA6IGl0ZW0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIG5leHQgbGlzdCBpdGVtIGJlbG9uZ3MgaGVyZS5cbiAgICAgICAgLy8gQmFja3BlZGFsIGlmIGl0IGRvZXMgbm90IGJlbG9uZyBpbiB0aGlzIGxpc3QuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc21hcnRMaXN0cyAmJiBpICE9PSBsIC0gMSkge1xuICAgICAgICAgIGIgPSBibG9jay5idWxsZXQuZXhlYyhjYXBbaSArIDFdKVswXTtcbiAgICAgICAgICBpZiAoYnVsbCAhPT0gYiAmJiAhKGJ1bGwubGVuZ3RoID4gMSAmJiBiLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICBzcmMgPSBjYXAuc2xpY2UoaSArIDEpLmpvaW4oJ1xcbicpICsgc3JjO1xuICAgICAgICAgICAgaSA9IGwgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIGl0ZW0gaXMgbG9vc2Ugb3Igbm90LlxuICAgICAgICAvLyBVc2U6IC8oXnxcXG4pKD8hIClbXlxcbl0rXFxuXFxuKD8hXFxzKiQpL1xuICAgICAgICAvLyBmb3IgZGlzY291bnQgYmVoYXZpb3IuXG4gICAgICAgIGxvb3NlID0gbmV4dCB8fCAvXFxuXFxuKD8hXFxzKiQpLy50ZXN0KGl0ZW0pO1xuICAgICAgICBpZiAoaSAhPT0gbCAtIDEpIHtcbiAgICAgICAgICBuZXh0ID0gaXRlbS5jaGFyQXQoaXRlbS5sZW5ndGggLSAxKSA9PT0gJ1xcbic7XG4gICAgICAgICAgaWYgKCFsb29zZSkgbG9vc2UgPSBuZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgICAgdHlwZTogbG9vc2VcbiAgICAgICAgICAgID8gJ2xvb3NlX2l0ZW1fc3RhcnQnXG4gICAgICAgICAgICA6ICdsaXN0X2l0ZW1fc3RhcnQnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlY3Vyc2UuXG4gICAgICAgIHRoaXMudG9rZW4oaXRlbSwgZmFsc2UsIGJxKTtcblxuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtX2VuZCdcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAnbGlzdF9lbmQnXG4gICAgICB9KTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gaHRtbFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmh0bWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3BhcmFncmFwaCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcHJlOiBjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZGVmXG4gICAgaWYgKCghYnEgJiYgdG9wKSAmJiAoY2FwID0gdGhpcy5ydWxlcy5kZWYuZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLmxpbmtzW2NhcFsxXS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9O1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFibGUgKGdmbSlcbiAgICBpZiAodG9wICYmIChjYXAgPSB0aGlzLnJ1bGVzLnRhYmxlLmV4ZWMoc3JjKSkpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG5cbiAgICAgIGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogY2FwWzFdLnJlcGxhY2UoL14gKnwgKlxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICBjZWxsczogY2FwWzNdLnJlcGxhY2UoLyg/OiAqXFx8ICopP1xcbiQvLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICB9O1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS5hbGlnbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBpdGVtLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZW0uY2VsbHNbaV0gPSBpdGVtLmNlbGxzW2ldXG4gICAgICAgICAgLnJlcGxhY2UoL14gKlxcfCAqfCAqXFx8ICokL2csICcnKVxuICAgICAgICAgIC5zcGxpdCgvICpcXHwgKi8pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRva2Vucy5wdXNoKGl0ZW0pO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgaWYgKHRvcCAmJiAoY2FwID0gdGhpcy5ydWxlcy5wYXJhZ3JhcGguZXhlYyhzcmMpKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2goe1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgdGV4dDogY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgICAgOiBjYXBbMV1cbiAgICAgIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICAvLyBUb3AtbGV2ZWwgc2hvdWxkIG5ldmVyIHJlYWNoIGhlcmUuXG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy50b2tlbnMucHVzaCh7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzcmMpIHtcbiAgICAgIHRocm93IG5ld1xuICAgICAgICBFcnJvcignSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLnRva2Vucztcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuXG52YXIgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbXFxcXGAqe31cXFtcXF0oKSMrXFwtLiFfPl0pLyxcbiAgYXV0b2xpbms6IC9ePChbXiA+XSsoQHw6XFwvKVteID5dKyk+LyxcbiAgdXJsOiBub29wLFxuICB0YWc6IC9ePCEtLVtcXHNcXFNdKj8tLT58XjxcXC8/XFx3Kyg/OlwiW15cIl0qXCJ8J1teJ10qJ3xbXidcIj5dKSo/Pi8sXG4gIGxpbms6IC9eIT9cXFsoaW5zaWRlKVxcXVxcKGhyZWZcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGluc2lkZSlcXF1cXHMqXFxbKFteXFxdXSopXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKCg/OlxcW1teXFxdXSpcXF18W15cXFtcXF1dKSopXFxdLyxcbiAgc3Ryb25nOiAvXl9fKFtcXHNcXFNdKz8pX18oPyFfKXxeXFwqXFwqKFtcXHNcXFNdKz8pXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXlxcYl8oKD86X198W1xcc1xcU10pKz8pX1xcYnxeXFwqKCg/OlxcKlxcKnxbXFxzXFxTXSkrPylcXCooPyFcXCopLyxcbiAgY29kZTogL14oYCspXFxzKihbXFxzXFxTXSo/W15gXSlcXHMqXFwxKD8hYCkvLFxuICBicjogL14gezIsfVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcCxcbiAgdGV4dDogL15bXFxzXFxTXSs/KD89W1xcXFw8IVxcW18qYF18IHsyLH1cXG58JCkvXG59O1xuXG5pbmxpbmUuX2luc2lkZSA9IC8oPzpcXFtbXlxcXV0qXFxdfFteXFxbXFxdXXxcXF0oPz1bXlxcW10qXFxdKSkqLztcbmlubGluZS5faHJlZiA9IC9cXHMqPD8oW1xcc1xcU10qPyk+Pyg/OlxccytbJ1wiXShbXFxzXFxTXSo/KVsnXCJdKT9cXHMqLztcblxuaW5saW5lLmxpbmsgPSByZXBsYWNlKGlubGluZS5saW5rKVxuICAoJ2luc2lkZScsIGlubGluZS5faW5zaWRlKVxuICAoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gICgpO1xuXG5pbmxpbmUucmVmbGluayA9IHJlcGxhY2UoaW5saW5lLnJlZmxpbmspXG4gICgnaW5zaWRlJywgaW5saW5lLl9pbnNpZGUpXG4gICgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gIGVtOiAvXl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pfF5cXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKS9cbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IHJlcGxhY2UoaW5saW5lLmVzY2FwZSkoJ10pJywgJ358XSknKSgpLFxuICB1cmw6IC9eKGh0dHBzPzpcXC9cXC9bXlxcczxdK1tePC4sOjtcIicpXFxdXFxzXSkvLFxuICBkZWw6IC9efn4oPz1cXFMpKFtcXHNcXFNdKj9cXFMpfn4vLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS50ZXh0KVxuICAgICgnXXwnLCAnfl18JylcbiAgICAoJ3wnLCAnfGh0dHBzPzovL3wnKVxuICAgICgpXG59KTtcblxuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogcmVwbGFjZShpbmxpbmUuYnIpKCd7Mix9JywgJyonKSgpLFxuICB0ZXh0OiByZXBsYWNlKGlubGluZS5nZm0udGV4dCkoJ3syLH0nLCAnKicpKClcbn0pO1xuXG4vKipcbiAqIElubGluZSBMZXhlciAmIENvbXBpbGVyXG4gKi9cblxuZnVuY3Rpb24gSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpIHtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMubGlua3MgPSBsaW5rcztcbiAgdGhpcy5ydWxlcyA9IGlubGluZS5ub3JtYWw7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyO1xuICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgaWYgKCF0aGlzLmxpbmtzKSB7XG4gICAgdGhyb3cgbmV3XG4gICAgICBFcnJvcignVG9rZW5zIGFycmF5IHJlcXVpcmVzIGEgYGxpbmtzYCBwcm9wZXJ0eS4nKTtcbiAgfVxuXG4gIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgIHRoaXMucnVsZXMgPSBpbmxpbmUuYnJlYWtzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJ1bGVzID0gaW5saW5lLmdmbTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgdGhpcy5ydWxlcyA9IGlubGluZS5wZWRhbnRpYztcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBJbmxpbmUgUnVsZXNcbiAqL1xuXG5JbmxpbmVMZXhlci5ydWxlcyA9IGlubGluZTtcblxuLyoqXG4gKiBTdGF0aWMgTGV4aW5nL0NvbXBpbGluZyBNZXRob2RcbiAqL1xuXG5JbmxpbmVMZXhlci5vdXRwdXQgPSBmdW5jdGlvbihzcmMsIGxpbmtzLCBvcHRpb25zKSB7XG4gIHZhciBpbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIobGlua3MsIG9wdGlvbnMpO1xuICByZXR1cm4gaW5saW5lLm91dHB1dChzcmMpO1xufTtcblxuLyoqXG4gKiBMZXhpbmcvQ29tcGlsaW5nXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKHNyYykge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGxpbmtcbiAgICAsIHRleHRcbiAgICAsIGhyZWZcbiAgICAsIGNhcDtcblxuICB3aGlsZSAoc3JjKSB7XG4gICAgLy8gZXNjYXBlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuZXNjYXBlLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSBjYXBbMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmF1dG9saW5rLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gY2FwWzFdLmNoYXJBdCg2KSA9PT0gJzonXG4gICAgICAgICAgPyB0aGlzLm1hbmdsZShjYXBbMV0uc3Vic3RyaW5nKDcpKVxuICAgICAgICAgIDogdGhpcy5tYW5nbGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRoaXMubWFuZ2xlKCdtYWlsdG86JykgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgbnVsbCwgdGV4dCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB1cmwgKGdmbSlcbiAgICBpZiAoIXRoaXMuaW5MaW5rICYmIChjYXAgPSB0aGlzLnJ1bGVzLnVybC5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saW5rKGhyZWYsIG51bGwsIHRleHQpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGFnXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMudGFnLmV4ZWMoc3JjKSkge1xuICAgICAgaWYgKCF0aGlzLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICA/IGVzY2FwZShjYXBbMF0pXG4gICAgICAgIDogY2FwWzBdO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGlua1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmxpbmsuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogY2FwWzJdLFxuICAgICAgICB0aXRsZTogY2FwWzNdXG4gICAgICB9KTtcbiAgICAgIHRoaXMuaW5MaW5rID0gZmFsc2U7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gdGhpcy5saW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rIHx8ICFsaW5rLmhyZWYpIHtcbiAgICAgICAgb3V0ICs9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHNyYyA9IGNhcFswXS5zdWJzdHJpbmcoMSkgKyBzcmM7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhpcy5pbkxpbmsgPSB0cnVlO1xuICAgICAgb3V0ICs9IHRoaXMub3V0cHV0TGluayhjYXAsIGxpbmspO1xuICAgICAgdGhpcy5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIHN0cm9uZ1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnN0cm9uZy5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5zdHJvbmcodGhpcy5vdXRwdXQoY2FwWzJdIHx8IGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gZW1cbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5lbS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5lbSh0aGlzLm91dHB1dChjYXBbMl0gfHwgY2FwWzFdKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBjb2RlXG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuY29kZS5leGVjKHNyYykpIHtcbiAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcoY2FwWzBdLmxlbmd0aCk7XG4gICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2Rlc3Bhbihlc2NhcGUoY2FwWzJdLCB0cnVlKSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBiclxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmJyLmV4ZWMoc3JjKSkge1xuICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhjYXBbMF0ubGVuZ3RoKTtcbiAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJyKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBkZWwgKGdmbSlcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5kZWwuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuZGVsKHRoaXMub3V0cHV0KGNhcFsxXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gdGV4dFxuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLnRleHQuZXhlYyhzcmMpKSB7XG4gICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKGNhcFswXS5sZW5ndGgpO1xuICAgICAgb3V0ICs9IGVzY2FwZSh0aGlzLnNtYXJ0eXBhbnRzKGNhcFswXSkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHNyYykge1xuICAgICAgdGhyb3cgbmV3XG4gICAgICAgIEVycm9yKCdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBMaW5rXG4gKi9cblxuSW5saW5lTGV4ZXIucHJvdG90eXBlLm91dHB1dExpbmsgPSBmdW5jdGlvbihjYXAsIGxpbmspIHtcbiAgdmFyIGhyZWYgPSBlc2NhcGUobGluay5ocmVmKVxuICAgICwgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcblxuICByZXR1cm4gY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnXG4gICAgPyB0aGlzLnJlbmRlcmVyLmxpbmsoaHJlZiwgdGl0bGUsIHRoaXMub3V0cHV0KGNhcFsxXSkpXG4gICAgOiB0aGlzLnJlbmRlcmVyLmltYWdlKGhyZWYsIHRpdGxlLCBlc2NhcGUoY2FwWzFdKSk7XG59O1xuXG4vKipcbiAqIFNtYXJ0eXBhbnRzIFRyYW5zZm9ybWF0aW9uc1xuICovXG5cbklubGluZUxleGVyLnByb3RvdHlwZS5zbWFydHlwYW50cyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgaWYgKCF0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMpIHJldHVybiB0ZXh0O1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufTtcblxuLyoqXG4gKiBNYW5nbGUgTGlua3NcbiAqL1xuXG5JbmxpbmVMZXhlci5wcm90b3R5cGUubWFuZ2xlID0gZnVuY3Rpb24odGV4dCkge1xuICB2YXIgb3V0ID0gJydcbiAgICAsIGwgPSB0ZXh0Lmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIGNoO1xuXG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuXG5mdW5jdGlvbiBSZW5kZXJlcihvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG59XG5cblJlbmRlcmVyLnByb3RvdHlwZS5jb2RlID0gZnVuY3Rpb24oY29kZSwgbGFuZywgZXNjYXBlZCkge1xuICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgIHZhciBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgY29kZSA9IG91dDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWxhbmcpIHtcbiAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICdcXG48L2NvZGU+PC9wcmU+JztcbiAgfVxuXG4gIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgKyBlc2NhcGUobGFuZywgdHJ1ZSlcbiAgICArICdcIj4nXG4gICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgKyAnXFxuPC9jb2RlPjwvcHJlPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuYmxvY2txdW90ZSA9IGZ1bmN0aW9uKHF1b3RlKSB7XG4gIHJldHVybiAnPGJsb2NrcXVvdGU+XFxuJyArIHF1b3RlICsgJzwvYmxvY2txdW90ZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbihodG1sKSB7XG4gIHJldHVybiBodG1sO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhlYWRpbmcgPSBmdW5jdGlvbih0ZXh0LCBsZXZlbCwgcmF3KSB7XG4gIHJldHVybiAnPGgnXG4gICAgKyBsZXZlbFxuICAgICsgJyBpZD1cIidcbiAgICArIHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXhcbiAgICArIHJhdy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teXFx3XSsvZywgJy0nKVxuICAgICsgJ1wiPidcbiAgICArIHRleHRcbiAgICArICc8L2gnXG4gICAgKyBsZXZlbFxuICAgICsgJz5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmhyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmxpc3QgPSBmdW5jdGlvbihib2R5LCBvcmRlcmVkKSB7XG4gIHZhciB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnO1xuICByZXR1cm4gJzwnICsgdHlwZSArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5saXN0aXRlbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8bGk+JyArIHRleHQgKyAnPC9saT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8cD4nICsgdGV4dCArICc8L3A+XFxuJztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS50YWJsZSA9IGZ1bmN0aW9uKGhlYWRlciwgYm9keSkge1xuICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgKyAnPHRoZWFkPlxcbidcbiAgICArIGhlYWRlclxuICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICsgJzx0Ym9keT5cXG4nXG4gICAgKyBib2R5XG4gICAgKyAnPC90Ym9keT5cXG4nXG4gICAgKyAnPC90YWJsZT5cXG4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLnRhYmxlcm93ID0gZnVuY3Rpb24oY29udGVudCkge1xuICByZXR1cm4gJzx0cj5cXG4nICsgY29udGVudCArICc8L3RyPlxcbic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUudGFibGVjZWxsID0gZnVuY3Rpb24oY29udGVudCwgZmxhZ3MpIHtcbiAgdmFyIHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgdmFyIHRhZyA9IGZsYWdzLmFsaWduXG4gICAgPyAnPCcgKyB0eXBlICsgJyBzdHlsZT1cInRleHQtYWxpZ246JyArIGZsYWdzLmFsaWduICsgJ1wiPidcbiAgICA6ICc8JyArIHR5cGUgKyAnPic7XG4gIHJldHVybiB0YWcgKyBjb250ZW50ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG59O1xuXG4vLyBzcGFuIGxldmVsIHJlbmRlcmVyXG5SZW5kZXJlci5wcm90b3R5cGUuc3Ryb25nID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxzdHJvbmc+JyArIHRleHQgKyAnPC9zdHJvbmc+Jztcbn07XG5cblJlbmRlcmVyLnByb3RvdHlwZS5lbSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZW0+JyArIHRleHQgKyAnPC9lbT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmNvZGVzcGFuID0gZnVuY3Rpb24odGV4dCkge1xuICByZXR1cm4gJzxjb2RlPicgKyB0ZXh0ICsgJzwvY29kZT4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmJyID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xufTtcblxuUmVuZGVyZXIucHJvdG90eXBlLmRlbCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgcmV0dXJuICc8ZGVsPicgKyB0ZXh0ICsgJzwvZGVsPic7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUubGluayA9IGZ1bmN0aW9uKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKC9bXlxcdzpdL2csICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH1cbiAgdmFyIG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG5SZW5kZXJlci5wcm90b3R5cGUuaW1hZ2UgPSBmdW5jdGlvbihocmVmLCB0aXRsZSwgdGV4dCkge1xuICB2YXIgb3V0ID0gJzxpbWcgc3JjPVwiJyArIGhyZWYgKyAnXCIgYWx0PVwiJyArIHRleHQgKyAnXCInO1xuICBpZiAodGl0bGUpIHtcbiAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gIH1cbiAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuXG5mdW5jdGlvbiBQYXJzZXIob3B0aW9ucykge1xuICB0aGlzLnRva2VucyA9IFtdO1xuICB0aGlzLnRva2VuID0gbnVsbDtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBtYXJrZWQuZGVmYXVsdHM7XG4gIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbn1cblxuLyoqXG4gKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gKi9cblxuUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24oc3JjLCBvcHRpb25zLCByZW5kZXJlcikge1xuICB2YXIgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zLCByZW5kZXJlcik7XG4gIHJldHVybiBwYXJzZXIucGFyc2Uoc3JjKTtcbn07XG5cbi8qKlxuICogUGFyc2UgTG9vcFxuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihzcmMpIHtcbiAgdGhpcy5pbmxpbmUgPSBuZXcgSW5saW5lTGV4ZXIoc3JjLmxpbmtzLCB0aGlzLm9wdGlvbnMsIHRoaXMucmVuZGVyZXIpO1xuICB0aGlzLnRva2VucyA9IHNyYy5yZXZlcnNlKCk7XG5cbiAgdmFyIG91dCA9ICcnO1xuICB3aGlsZSAodGhpcy5uZXh0KCkpIHtcbiAgICBvdXQgKz0gdGhpcy50b2soKTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIE5leHQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudG9rZW4gPSB0aGlzLnRva2Vucy5wb3AoKTtcbn07XG5cbi8qKlxuICogUHJldmlldyBOZXh0IFRva2VuXG4gKi9cblxuUGFyc2VyLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnRva2Vucy5sZW5ndGggLSAxXSB8fCAwO1xufTtcblxuLyoqXG4gKiBQYXJzZSBUZXh0IFRva2Vuc1xuICovXG5cblBhcnNlci5wcm90b3R5cGUucGFyc2VUZXh0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBib2R5ID0gdGhpcy50b2tlbi50ZXh0O1xuXG4gIHdoaWxlICh0aGlzLnBlZWsoKS50eXBlID09PSAndGV4dCcpIHtcbiAgICBib2R5ICs9ICdcXG4nICsgdGhpcy5uZXh0KCkudGV4dDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmlubGluZS5vdXRwdXQoYm9keSk7XG59O1xuXG4vKipcbiAqIFBhcnNlIEN1cnJlbnQgVG9rZW5cbiAqL1xuXG5QYXJzZXIucHJvdG90eXBlLnRvayA9IGZ1bmN0aW9uKCkge1xuICBzd2l0Y2ggKHRoaXMudG9rZW4udHlwZSkge1xuICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjYXNlICdocic6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgfVxuICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICB0aGlzLmlubGluZS5vdXRwdXQodGhpcy50b2tlbi50ZXh0KSxcbiAgICAgICAgdGhpcy50b2tlbi5kZXB0aCxcbiAgICAgICAgdGhpcy50b2tlbi50ZXh0KTtcbiAgICB9XG4gICAgY2FzZSAnY29kZSc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmNvZGUodGhpcy50b2tlbi50ZXh0LFxuICAgICAgICB0aGlzLnRva2VuLmxhbmcsXG4gICAgICAgIHRoaXMudG9rZW4uZXNjYXBlZCk7XG4gICAgfVxuICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgdmFyIGhlYWRlciA9ICcnXG4gICAgICAgICwgYm9keSA9ICcnXG4gICAgICAgICwgaVxuICAgICAgICAsIHJvd1xuICAgICAgICAsIGNlbGxcbiAgICAgICAgLCBmbGFnc1xuICAgICAgICAsIGo7XG5cbiAgICAgIC8vIGhlYWRlclxuICAgICAgY2VsbCA9ICcnO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudG9rZW4uaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZsYWdzID0geyBoZWFkZXI6IHRydWUsIGFsaWduOiB0aGlzLnRva2VuLmFsaWduW2ldIH07XG4gICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgdGhpcy5pbmxpbmUub3V0cHV0KHRoaXMudG9rZW4uaGVhZGVyW2ldKSxcbiAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRoaXMudG9rZW4uYWxpZ25baV0gfVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRva2VuLmNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJvdyA9IHRoaXMudG9rZW4uY2VsbHNbaV07XG5cbiAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgIHRoaXMuaW5saW5lLm91dHB1dChyb3dbal0pLFxuICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdGhpcy50b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2Jsb2NrcXVvdGVfZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgfVxuICAgIGNhc2UgJ2xpc3Rfc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnXG4gICAgICAgICwgb3JkZXJlZCA9IHRoaXMudG9rZW4ub3JkZXJlZDtcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2VuZCcpIHtcbiAgICAgICAgYm9keSArPSB0aGlzLnRvaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQpO1xuICAgIH1cbiAgICBjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOiB7XG4gICAgICB2YXIgYm9keSA9ICcnO1xuXG4gICAgICB3aGlsZSAodGhpcy5uZXh0KCkudHlwZSAhPT0gJ2xpc3RfaXRlbV9lbmQnKSB7XG4gICAgICAgIGJvZHkgKz0gdGhpcy50b2tlbi50eXBlID09PSAndGV4dCdcbiAgICAgICAgICA/IHRoaXMucGFyc2VUZXh0KClcbiAgICAgICAgICA6IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdsb29zZV9pdGVtX3N0YXJ0Jzoge1xuICAgICAgdmFyIGJvZHkgPSAnJztcblxuICAgICAgd2hpbGUgKHRoaXMubmV4dCgpLnR5cGUgIT09ICdsaXN0X2l0ZW1fZW5kJykge1xuICAgICAgICBib2R5ICs9IHRoaXMudG9rKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGJvZHkpO1xuICAgIH1cbiAgICBjYXNlICdodG1sJzoge1xuICAgICAgdmFyIGh0bWwgPSAhdGhpcy50b2tlbi5wcmUgJiYgIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICA/IHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpXG4gICAgICAgIDogdGhpcy50b2tlbi50ZXh0O1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuaHRtbChodG1sKTtcbiAgICB9XG4gICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMuaW5saW5lLm91dHB1dCh0aGlzLnRva2VuLnRleHQpKTtcbiAgICB9XG4gICAgY2FzZSAndGV4dCc6IHtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlVGV4dCgpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgcmV0dXJuIGh0bWxcbiAgICAucmVwbGFjZSghZW5jb2RlID8gLyYoPyEjP1xcdys7KS9nIDogLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKC8mKFsjXFx3XSspOy9nLCBmdW5jdGlvbihfLCBuKSB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlKHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgcmV0dXJuIGZ1bmN0aW9uIHNlbGYobmFtZSwgdmFsKSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvKF58W15cXFtdKVxcXi9nLCAnJDEnKTtcbiAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5ub29wLmV4ZWMgPSBub29wO1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgdmFyIGkgPSAxXG4gICAgLCB0YXJnZXRcbiAgICAsIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrIHx8IHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcblxuICAgIHZhciBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0XG4gICAgICAsIHRva2Vuc1xuICAgICAgLCBwZW5kaW5nXG4gICAgICAsIGkgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgcGVuZGluZyA9IHRva2Vucy5sZW5ndGg7XG5cbiAgICB2YXIgZG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG91dCwgZXJyO1xuXG4gICAgICB0cnkge1xuICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBlcnIgPSBlO1xuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgZm9yICg7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICBpZiAoY29kZSA9PSBudWxsIHx8IGNvZGUgPT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAtLXBlbmRpbmcgfHwgZG9uZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRva2Vuc1tpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKG9wdCkgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKExleGVyLmxleChzcmMsIG9wdCksIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQuJztcbiAgICBpZiAoKG9wdCB8fCBtYXJrZWQuZGVmYXVsdHMpLnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmRlZmF1bHRzID0ge1xuICBnZm06IHRydWUsXG4gIHRhYmxlczogdHJ1ZSxcbiAgYnJlYWtzOiBmYWxzZSxcbiAgcGVkYW50aWM6IGZhbHNlLFxuICBzYW5pdGl6ZTogZmFsc2UsXG4gIHNtYXJ0TGlzdHM6IGZhbHNlLFxuICBzaWxlbnQ6IGZhbHNlLFxuICBoaWdobGlnaHQ6IG51bGwsXG4gIGxhbmdQcmVmaXg6ICdsYW5nLScsXG4gIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgaGVhZGVyUHJlZml4OiAnJyxcbiAgcmVuZGVyZXI6IG5ldyBSZW5kZXJlcixcbiAgeGh0bWw6IGZhbHNlXG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuXG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcblxubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5cbm1hcmtlZC5JbmxpbmVMZXhlciA9IElubGluZUxleGVyO1xubWFya2VkLmlubGluZUxleGVyID0gSW5saW5lTGV4ZXIub3V0cHV0O1xuXG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBtYXJrZWQ7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBtYXJrZWQ7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5tYXJrZWQgPSBtYXJrZWQ7XG59XG5cbn0pLmNhbGwoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbCk7XG59KCkpO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgU2luZ2xlRXZlbnQgPSByZXF1aXJlKCdnZXZhbC9zaW5nbGUnKTtcbnZhciBNdWx0aXBsZUV2ZW50ID0gcmVxdWlyZSgnZ2V2YWwvbXVsdGlwbGUnKTtcblxuLypcbiAgICBQcm8gdGlwOiBEb24ndCByZXF1aXJlIGBtZXJjdXJ5YCBpdHNlbGYuXG4gICAgICByZXF1aXJlIGFuZCBkZXBlbmQgb24gYWxsIHRoZXNlIG1vZHVsZXMgZGlyZWN0bHkhXG4qL1xudmFyIG1lcmN1cnkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBFbnRyeVxuICAgIG1haW46IHJlcXVpcmUoJ21haW4tbG9vcCcpLFxuICAgIGFwcDogYXBwLFxuXG4gICAgLy8gSW5wdXRcbiAgICBEZWxlZ2F0b3I6IHJlcXVpcmUoJ2RvbS1kZWxlZ2F0b3InKSxcbiAgICBpbnB1dDogaW5wdXQsXG4gICAgaGFuZGxlczogaGFuZGxlcyxcbiAgICBldmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvZXZlbnQnKSxcbiAgICB2YWx1ZUV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC92YWx1ZScpLFxuICAgIHN1Ym1pdEV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9zdWJtaXQnKSxcbiAgICBjaGFuZ2VFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvY2hhbmdlJyksXG4gICAga2V5RXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2tleScpLFxuXG4gICAgLy8gU3RhdGVcbiAgICBhcnJheTogcmVxdWlyZSgnb2JzZXJ2LWFycmF5JyksXG4gICAgc3RydWN0OiByZXF1aXJlKCdvYnNlcnYtc3RydWN0JyksXG4gICAgLy8gZGVwcmVjYXRlZDogYWxpYXMgc3RydWN0IGFzIGhhc2ggZm9yIGJhY2sgY29tcGF0XG4gICAgaGFzaDogcmVxdWlyZSgnb2JzZXJ2LXN0cnVjdCcpLFxuICAgIHZhcmhhc2g6IHJlcXVpcmUoJ29ic2Vydi12YXJoYXNoJyksXG4gICAgdmFsdWU6IHJlcXVpcmUoJ29ic2VydicpLFxuXG4gICAgLy8gUmVuZGVyXG4gICAgZGlmZjogcmVxdWlyZSgndnRyZWUvZGlmZicpLFxuICAgIHBhdGNoOiByZXF1aXJlKCd2ZG9tL3BhdGNoJyksXG4gICAgcGFydGlhbDogcmVxdWlyZSgndmRvbS10aHVuaycpLFxuICAgIGNyZWF0ZTogcmVxdWlyZSgndmRvbS9jcmVhdGUtZWxlbWVudCcpLFxuICAgIGg6IHJlcXVpcmUoJ3ZpcnR1YWwtaHlwZXJzY3JpcHQnKSxcbiAgICAvLyBkZXByZWNhdGVkOiBrZWVwIGZvciBiYWNrIGNvbXBhdC5cbiAgICBzdmc6IHJlcXVpcmUoJ3ZpcnR1YWwtaHlwZXJzY3JpcHQvc3ZnJyksXG5cbiAgICAvLyBVdGlsaXRpZXNcbiAgICAvLyBkZXByZWNhdGVkOiBrZWVwIGZvciBiYWNrIGNvbXBhdC5cbiAgICBjb21wdXRlZDogcmVxdWlyZSgnb2JzZXJ2L2NvbXB1dGVkJyksXG4gICAgd2F0Y2g6IHJlcXVpcmUoJ29ic2Vydi93YXRjaCcpXG59O1xuXG5mdW5jdGlvbiBpbnB1dChuYW1lcykge1xuICAgIGlmICghbmFtZXMpIHtcbiAgICAgICAgcmV0dXJuIFNpbmdsZUV2ZW50KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIE11bHRpcGxlRXZlbnQobmFtZXMpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVzKGZ1bmNzLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZ1bmNzKS5yZWR1Y2UoY3JlYXRlSGFuZGxlLCB7fSk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVIYW5kbGUoYWNjLCBuYW1lKSB7XG4gICAgICAgIHZhciBoYW5kbGUgPSBtZXJjdXJ5LkRlbGVnYXRvci5hbGxvY2F0ZUhhbmRsZShcbiAgICAgICAgICAgIGZ1bmNzW25hbWVdLmJpbmQobnVsbCwgY29udGV4dCkpO1xuXG4gICAgICAgIGFjY1tuYW1lXSA9IGhhbmRsZTtcbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFwcChlbGVtLCBvYnNlcnYsIHJlbmRlciwgb3B0cykge1xuICAgIG1lcmN1cnkuRGVsZWdhdG9yKG9wdHMpO1xuICAgIHZhciBsb29wID0gbWVyY3VyeS5tYWluKG9ic2VydigpLCByZW5kZXIsIG9wdHMpO1xuICAgIGlmIChlbGVtKSB7XG4gICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQobG9vcC50YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gb2JzZXJ2KGxvb3AudXBkYXRlKTtcbn1cbiIsInZhciBEYXRhU2V0ID0gcmVxdWlyZShcImRhdGEtc2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gYWRkRXZlbnRcblxuZnVuY3Rpb24gYWRkRXZlbnQodGFyZ2V0LCB0eXBlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGRzID0gRGF0YVNldCh0YXJnZXQpXG4gICAgdmFyIGV2ZW50cyA9IGRzW3R5cGVdXG5cbiAgICBpZiAoIWV2ZW50cykge1xuICAgICAgICBkc1t0eXBlXSA9IGhhbmRsZXJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnRzKSkge1xuICAgICAgICBpZiAoZXZlbnRzLmluZGV4T2YoaGFuZGxlcikgPT09IC0xKSB7XG4gICAgICAgICAgICBldmVudHMucHVzaChoYW5kbGVyKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudHMgIT09IGhhbmRsZXIpIHtcbiAgICAgICAgZHNbdHlwZV0gPSBbZXZlbnRzLCBoYW5kbGVyXVxuICAgIH1cbn1cbiIsInZhciBnbG9iYWxEb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcbnZhciBEYXRhU2V0ID0gcmVxdWlyZShcImRhdGEtc2V0XCIpXG52YXIgY3JlYXRlU3RvcmUgPSByZXF1aXJlKFwid2Vha21hcC1zaGltL2NyZWF0ZS1zdG9yZVwiKVxuXG52YXIgYWRkRXZlbnQgPSByZXF1aXJlKFwiLi9hZGQtZXZlbnQuanNcIilcbnZhciByZW1vdmVFdmVudCA9IHJlcXVpcmUoXCIuL3JlbW92ZS1ldmVudC5qc1wiKVxudmFyIFByb3h5RXZlbnQgPSByZXF1aXJlKFwiLi9wcm94eS1ldmVudC5qc1wiKVxuXG52YXIgSEFORExFUl9TVE9SRSA9IGNyZWF0ZVN0b3JlKClcblxubW9kdWxlLmV4cG9ydHMgPSBET01EZWxlZ2F0b3JcblxuZnVuY3Rpb24gRE9NRGVsZWdhdG9yKGRvY3VtZW50KSB7XG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudCB8fCBnbG9iYWxEb2N1bWVudFxuXG4gICAgdGhpcy50YXJnZXQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICB0aGlzLmV2ZW50cyA9IHt9XG4gICAgdGhpcy5yYXdFdmVudExpc3RlbmVycyA9IHt9XG4gICAgdGhpcy5nbG9iYWxMaXN0ZW5lcnMgPSB7fVxufVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudFxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRcblxuRE9NRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlID1cbiAgICBmdW5jdGlvbiBhbGxvY2F0ZUhhbmRsZShmdW5jKSB7XG4gICAgICAgIHZhciBoYW5kbGUgPSBuZXcgSGFuZGxlKClcblxuICAgICAgICBIQU5ETEVSX1NUT1JFKGhhbmRsZSkuZnVuYyA9IGZ1bmM7XG5cbiAgICAgICAgcmV0dXJuIGhhbmRsZVxuICAgIH1cblxuRE9NRGVsZWdhdG9yLnRyYW5zZm9ybUhhbmRsZSA9XG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlKGhhbmRsZSwgbGFtYmRhKSB7XG4gICAgICAgIHZhciBmdW5jID0gSEFORExFUl9TVE9SRShoYW5kbGUpLmZ1bmNcblxuICAgICAgICByZXR1cm4gdGhpcy5hbGxvY2F0ZUhhbmRsZShmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBsYW1iZGEoZXYpXG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgZnVuYyhyZXN1bHQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmFkZEdsb2JhbEV2ZW50TGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmbikge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICAgICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGZuKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKGZuKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSA9IGxpc3RlbmVycztcbiAgICB9XG5cbkRPTURlbGVnYXRvci5wcm90b3R5cGUucmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdsb2JhbExpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuXG4gICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGZuKVxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB9XG4gICAgfVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmxpc3RlblRvID0gZnVuY3Rpb24gbGlzdGVuVG8oZXZlbnROYW1lKSB7XG4gICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IHRydWVcblxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmF3RXZlbnRMaXN0ZW5lcnNbZXZlbnROYW1lXVxuICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIgPSB0aGlzLnJhd0V2ZW50TGlzdGVuZXJzW2V2ZW50TmFtZV0gPVxuICAgICAgICAgICAgY3JlYXRlSGFuZGxlcihldmVudE5hbWUsIHRoaXMpXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyLCB0cnVlKVxufVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLnVubGlzdGVuVG8gPSBmdW5jdGlvbiB1bmxpc3RlblRvKGV2ZW50TmFtZSkge1xuICAgIGlmICghdGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gZmFsc2VcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJhd0V2ZW50TGlzdGVuZXJzW2V2ZW50TmFtZV1cblxuICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZG9tLWRlbGVnYXRvciN1bmxpc3RlblRvOiBjYW5ub3QgXCIgK1xuICAgICAgICAgICAgXCJ1bmxpc3RlbiB0byBcIiArIGV2ZW50TmFtZSlcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIsIHRydWUpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhhbmRsZXIoZXZlbnROYW1lLCBkZWxlZ2F0b3IpIHtcbiAgICB2YXIgZ2xvYmFsTGlzdGVuZXJzID0gZGVsZWdhdG9yLmdsb2JhbExpc3RlbmVycztcbiAgICB2YXIgZGVsZWdhdG9yVGFyZ2V0ID0gZGVsZWdhdG9yLnRhcmdldDtcblxuICAgIHJldHVybiBoYW5kbGVyXG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBnbG9iYWxIYW5kbGVycyA9IGdsb2JhbExpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdXG5cbiAgICAgICAgaWYgKGdsb2JhbEhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBnbG9iYWxFdmVudCA9IG5ldyBQcm94eUV2ZW50KGV2KTtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50LmN1cnJlbnRUYXJnZXQgPSBkZWxlZ2F0b3JUYXJnZXQ7XG4gICAgICAgICAgICBjYWxsTGlzdGVuZXJzKGdsb2JhbEhhbmRsZXJzLCBnbG9iYWxFdmVudClcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbmRBbmRJbnZva2VMaXN0ZW5lcnMoZXYudGFyZ2V0LCBldiwgZXZlbnROYW1lKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZmluZEFuZEludm9rZUxpc3RlbmVycyhlbGVtLCBldiwgZXZlbnROYW1lKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gZ2V0TGlzdGVuZXIoZWxlbSwgZXZlbnROYW1lKVxuXG4gICAgaWYgKGxpc3RlbmVyICYmIGxpc3RlbmVyLmhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyRXZlbnQgPSBuZXcgUHJveHlFdmVudChldik7XG4gICAgICAgIGxpc3RlbmVyRXZlbnQuY3VycmVudFRhcmdldCA9IGxpc3RlbmVyLmN1cnJlbnRUYXJnZXRcbiAgICAgICAgY2FsbExpc3RlbmVycyhsaXN0ZW5lci5oYW5kbGVycywgbGlzdGVuZXJFdmVudClcblxuICAgICAgICBpZiAobGlzdGVuZXJFdmVudC5fYnViYmxlcykge1xuICAgICAgICAgICAgdmFyIG5leHRUYXJnZXQgPSBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0LnBhcmVudE5vZGVcbiAgICAgICAgICAgIGZpbmRBbmRJbnZva2VMaXN0ZW5lcnMobmV4dFRhcmdldCwgZXYsIGV2ZW50TmFtZSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGlzdGVuZXIodGFyZ2V0LCB0eXBlKSB7XG4gICAgLy8gdGVybWluYXRlIHJlY3Vyc2lvbiBpZiBwYXJlbnQgaXMgYG51bGxgXG4gICAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBkcyA9IERhdGFTZXQodGFyZ2V0KVxuICAgIC8vIGZldGNoIGxpc3Qgb2YgaGFuZGxlciBmbnMgZm9yIHRoaXMgZXZlbnRcbiAgICB2YXIgaGFuZGxlciA9IGRzW3R5cGVdXG4gICAgdmFyIGFsbEhhbmRsZXIgPSBkcy5ldmVudFxuXG4gICAgaWYgKCFoYW5kbGVyICYmICFhbGxIYW5kbGVyKSB7XG4gICAgICAgIHJldHVybiBnZXRMaXN0ZW5lcih0YXJnZXQucGFyZW50Tm9kZSwgdHlwZSlcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlcnMgPSBbXS5jb25jYXQoaGFuZGxlciB8fCBbXSwgYWxsSGFuZGxlciB8fCBbXSlcbiAgICByZXR1cm4gbmV3IExpc3RlbmVyKHRhcmdldCwgaGFuZGxlcnMpXG59XG5cbmZ1bmN0aW9uIGNhbGxMaXN0ZW5lcnMoaGFuZGxlcnMsIGV2KSB7XG4gICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaGFuZGxlcihldilcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlci5oYW5kbGVFdmVudCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyLmhhbmRsZUV2ZW50KGV2KVxuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIudHlwZSA9PT0gXCJkb20tZGVsZWdhdG9yLWhhbmRsZVwiKSB7XG4gICAgICAgICAgICBIQU5ETEVSX1NUT1JFKGhhbmRsZXIpLmZ1bmMoZXYpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkb20tZGVsZWdhdG9yOiB1bmtub3duIGhhbmRsZXIgXCIgK1xuICAgICAgICAgICAgICAgIFwiZm91bmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoaGFuZGxlcnMpKTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIExpc3RlbmVyKHRhcmdldCwgaGFuZGxlcnMpIHtcbiAgICB0aGlzLmN1cnJlbnRUYXJnZXQgPSB0YXJnZXRcbiAgICB0aGlzLmhhbmRsZXJzID0gaGFuZGxlcnNcbn1cblxuZnVuY3Rpb24gSGFuZGxlKCkge1xuICAgIHRoaXMudHlwZSA9IFwiZG9tLWRlbGVnYXRvci1oYW5kbGVcIlxufVxuIiwidmFyIEluZGl2aWR1YWwgPSByZXF1aXJlKFwiaW5kaXZpZHVhbFwiKVxudmFyIGN1aWQgPSByZXF1aXJlKFwiY3VpZFwiKVxudmFyIGdsb2JhbERvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxuXG52YXIgRE9NRGVsZWdhdG9yID0gcmVxdWlyZShcIi4vZG9tLWRlbGVnYXRvci5qc1wiKVxuXG52YXIgZGVsZWdhdG9yQ2FjaGUgPSBJbmRpdmlkdWFsKFwiX19ET01fREVMRUdBVE9SX0NBQ0hFQDlcIiwge1xuICAgIGRlbGVnYXRvcnM6IHt9XG59KVxudmFyIGNvbW1vbkV2ZW50cyA9IFtcbiAgICBcImJsdXJcIiwgXCJjaGFuZ2VcIiwgXCJjbGlja1wiLCAgXCJjb250ZXh0bWVudVwiLCBcImRibGNsaWNrXCIsXG4gICAgXCJlcnJvclwiLFwiZm9jdXNcIiwgXCJmb2N1c2luXCIsIFwiZm9jdXNvdXRcIiwgXCJpbnB1dFwiLCBcImtleWRvd25cIixcbiAgICBcImtleXByZXNzXCIsIFwia2V5dXBcIiwgXCJsb2FkXCIsIFwibW91c2Vkb3duXCIsIFwibW91c2V1cFwiLFxuICAgIFwicmVzaXplXCIsIFwic2Nyb2xsXCIsIFwic2VsZWN0XCIsIFwic3VibWl0XCIsIFwidG91Y2hjYW5jZWxcIixcbiAgICBcInRvdWNoZW5kXCIsIFwidG91Y2hzdGFydFwiLCBcInVubG9hZFwiXG5dXG5cbi8qICBEZWxlZ2F0b3IgaXMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGEgc2luZ2xldG9uIGBET01EZWxlZ2F0b3JgXG4gICAgICAgIGluc3RhbmNlLlxuXG4gICAgT25seSBvbmUgRE9NRGVsZWdhdG9yIHNob3VsZCBleGlzdCBiZWNhdXNlIHdlIGRvIG5vdCB3YW50XG4gICAgICAgIGR1cGxpY2F0ZSBldmVudCBsaXN0ZW5lcnMgYm91bmQgdG8gdGhlIERPTS5cblxuICAgIGBEZWxlZ2F0b3JgIHdpbGwgYWxzbyBgbGlzdGVuVG8oKWAgYWxsIGV2ZW50cyB1bmxlc3NcbiAgICAgICAgZXZlcnkgY2FsbGVyIG9wdHMgb3V0IG9mIGl0XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBEZWxlZ2F0b3JcblxuZnVuY3Rpb24gRGVsZWdhdG9yKG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fVxuICAgIHZhciBkb2N1bWVudCA9IG9wdHMuZG9jdW1lbnQgfHwgZ2xvYmFsRG9jdW1lbnRcblxuICAgIHZhciBjYWNoZUtleSA9IGRvY3VtZW50W1wiX19ET01fREVMRUdBVE9SX0NBQ0hFX1RPS0VOQDlcIl1cblxuICAgIGlmICghY2FjaGVLZXkpIHtcbiAgICAgICAgY2FjaGVLZXkgPVxuICAgICAgICAgICAgZG9jdW1lbnRbXCJfX0RPTV9ERUxFR0FUT1JfQ0FDSEVfVE9LRU5AOVwiXSA9IGN1aWQoKVxuICAgIH1cblxuICAgIHZhciBkZWxlZ2F0b3IgPSBkZWxlZ2F0b3JDYWNoZS5kZWxlZ2F0b3JzW2NhY2hlS2V5XVxuXG4gICAgaWYgKCFkZWxlZ2F0b3IpIHtcbiAgICAgICAgZGVsZWdhdG9yID0gZGVsZWdhdG9yQ2FjaGUuZGVsZWdhdG9yc1tjYWNoZUtleV0gPVxuICAgICAgICAgICAgbmV3IERPTURlbGVnYXRvcihkb2N1bWVudClcbiAgICB9XG5cbiAgICBpZiAob3B0cy5kZWZhdWx0RXZlbnRzICE9PSBmYWxzZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbW1vbkV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZWdhdG9yLmxpc3RlblRvKGNvbW1vbkV2ZW50c1tpXSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWxlZ2F0b3Jcbn1cblxuRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlID0gRE9NRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlO1xuRGVsZWdhdG9yLnRyYW5zZm9ybUhhbmRsZSA9IERPTURlbGVnYXRvci50cmFuc2Zvcm1IYW5kbGU7XG4iLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKiBcbiAqIENvcHlyaWdodCAoYykgRXJpYyBFbGxpb3R0IDIwMTJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLypnbG9iYWwgd2luZG93LCBuYXZpZ2F0b3IsIGRvY3VtZW50LCByZXF1aXJlLCBwcm9jZXNzLCBtb2R1bGUgKi9cbihmdW5jdGlvbiAoYXBwKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG5hbWVzcGFjZSA9ICdjdWlkJyxcbiAgICBjID0gMCxcbiAgICBibG9ja1NpemUgPSA0LFxuICAgIGJhc2UgPSAzNixcbiAgICBkaXNjcmV0ZVZhbHVlcyA9IE1hdGgucG93KGJhc2UsIGJsb2NrU2l6ZSksXG5cbiAgICBwYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBzaXplKSB7XG4gICAgICB2YXIgcyA9IFwiMDAwMDAwMDAwXCIgKyBudW07XG4gICAgICByZXR1cm4gcy5zdWJzdHIocy5sZW5ndGgtc2l6ZSk7XG4gICAgfSxcblxuICAgIHJhbmRvbUJsb2NrID0gZnVuY3Rpb24gcmFuZG9tQmxvY2soKSB7XG4gICAgICByZXR1cm4gcGFkKChNYXRoLnJhbmRvbSgpICpcbiAgICAgICAgICAgIGRpc2NyZXRlVmFsdWVzIDw8IDApXG4gICAgICAgICAgICAudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG4gICAgfSxcblxuICAgIHNhZmVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgYyA9IChjIDwgZGlzY3JldGVWYWx1ZXMpID8gYyA6IDA7XG4gICAgICBjKys7IC8vIHRoaXMgaXMgbm90IHN1YmxpbWluYWxcbiAgICAgIHJldHVybiBjIC0gMTtcbiAgICB9LFxuXG4gICAgYXBpID0gZnVuY3Rpb24gY3VpZCgpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHdpdGggYSBsb3dlcmNhc2UgbGV0dGVyIG1ha2VzXG4gICAgICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gICAgICB2YXIgbGV0dGVyID0gJ2MnLCAvLyBoYXJkLWNvZGVkIGFsbG93cyBmb3Igc2VxdWVudGlhbCBhY2Nlc3NcblxuICAgICAgICAvLyB0aW1lc3RhbXBcbiAgICAgICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgICAgIC8vIHRoYXQgdGhlIHVpZCB3YXMgY3JlYXRlZC5cbiAgICAgICAgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZyhiYXNlKSxcblxuICAgICAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgICAgICBjb3VudGVyLFxuXG4gICAgICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgICAgIC8vIGNsaWVudHMgKHNvIGRpZmZlcmVudCBjb21wdXRlcnMgYXJlIGZhciBsZXNzXG4gICAgICAgIC8vIGxpa2VseSB0byBnZW5lcmF0ZSB0aGUgc2FtZSBpZClcbiAgICAgICAgZmluZ2VycHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKSxcblxuICAgICAgICAvLyBHcmFiIHNvbWUgbW9yZSBjaGFycyBmcm9tIE1hdGgucmFuZG9tKClcbiAgICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgICAgICAgY291bnRlciA9IHBhZChzYWZlQ291bnRlcigpLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xuXG4gICAgICByZXR1cm4gIChsZXR0ZXIgKyB0aW1lc3RhbXAgKyBjb3VudGVyICsgZmluZ2VycHJpbnQgKyByYW5kb20pO1xuICAgIH07XG5cbiAgYXBpLnNsdWcgPSBmdW5jdGlvbiBzbHVnKCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgICAgY291bnRlcixcbiAgICAgIHByaW50ID0gYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoMCwxKSArXG4gICAgICAgIGFwaS5maW5nZXJwcmludCgpLnNsaWNlKC0xKSxcbiAgICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gICAgICBjb3VudGVyID0gc2FmZUNvdW50ZXIoKS50b1N0cmluZygzNikuc2xpY2UoLTQpO1xuXG4gICAgcmV0dXJuIGRhdGUuc2xpY2UoLTIpICsgXG4gICAgICBjb3VudGVyICsgcHJpbnQgKyByYW5kb207XG4gIH07XG5cbiAgYXBpLmdsb2JhbENvdW50ID0gZnVuY3Rpb24gZ2xvYmFsQ291bnQoKSB7XG4gICAgLy8gV2Ugd2FudCB0byBjYWNoZSB0aGUgcmVzdWx0cyBvZiB0aGlzXG4gICAgdmFyIGNhY2hlID0gKGZ1bmN0aW9uIGNhbGMoKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgIGNvdW50ID0gMDtcblxuICAgICAgICBmb3IgKGkgaW4gd2luZG93KSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgIH0oKSk7XG5cbiAgICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBjYWNoZTsgfTtcbiAgICByZXR1cm4gY2FjaGU7XG4gIH07XG5cbiAgYXBpLmZpbmdlcnByaW50ID0gZnVuY3Rpb24gYnJvd3NlclByaW50KCkge1xuICAgIHJldHVybiBwYWQoKG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoICtcbiAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICAgICAgYXBpLmdsb2JhbENvdW50KCkudG9TdHJpbmcoMzYpLCA0KTtcbiAgfTtcblxuICAvLyBkb24ndCBjaGFuZ2UgYW55dGhpbmcgZnJvbSBoZXJlIGRvd24uXG4gIGlmIChhcHAucmVnaXN0ZXIpIHtcbiAgICBhcHAucmVnaXN0ZXIobmFtZXNwYWNlLCBhcGkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhcGk7XG4gIH0gZWxzZSB7XG4gICAgYXBwW25hbWVzcGFjZV0gPSBhcGk7XG4gIH1cblxufSh0aGlzLmFwcGxpdHVkZSB8fCB0aGlzKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUhhc2hcblxuZnVuY3Rpb24gY3JlYXRlSGFzaChlbGVtKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBlbGVtLmF0dHJpYnV0ZXNcbiAgICB2YXIgaGFzaCA9IHt9XG5cbiAgICBpZiAoYXR0cmlidXRlcyA9PT0gbnVsbCB8fCBhdHRyaWJ1dGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGF0dHIgPSBhdHRyaWJ1dGVzW2ldXG5cbiAgICAgICAgaWYgKGF0dHIubmFtZS5zdWJzdHIoMCw1KSAhPT0gXCJkYXRhLVwiKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaGFzaFthdHRyLm5hbWUuc3Vic3RyKDUpXSA9IGF0dHIudmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaFxufVxuIiwidmFyIGNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIndlYWttYXAtc2hpbS9jcmVhdGUtc3RvcmVcIilcbnZhciBJbmRpdmlkdWFsID0gcmVxdWlyZShcImluZGl2aWR1YWxcIilcblxudmFyIGNyZWF0ZUhhc2ggPSByZXF1aXJlKFwiLi9jcmVhdGUtaGFzaC5qc1wiKVxuXG52YXIgaGFzaFN0b3JlID0gSW5kaXZpZHVhbChcIl9fREFUQV9TRVRfV0VBS01BUEAzXCIsIGNyZWF0ZVN0b3JlKCkpXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVNldFxuXG5mdW5jdGlvbiBEYXRhU2V0KGVsZW0pIHtcbiAgICB2YXIgc3RvcmUgPSBoYXNoU3RvcmUoZWxlbSlcblxuICAgIGlmICghc3RvcmUuaGFzaCkge1xuICAgICAgICBzdG9yZS5oYXNoID0gY3JlYXRlSGFzaChlbGVtKVxuICAgIH1cblxuICAgIHJldHVybiBzdG9yZS5oYXNoXG59XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgcm9vdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID9cbiAgICB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/XG4gICAgZ2xvYmFsIDoge307XG5cbm1vZHVsZS5leHBvcnRzID0gSW5kaXZpZHVhbFxuXG5mdW5jdGlvbiBJbmRpdmlkdWFsKGtleSwgdmFsdWUpIHtcbiAgICBpZiAocm9vdFtrZXldKSB7XG4gICAgICAgIHJldHVybiByb290W2tleV1cbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocm9vdCwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gdmFsdWVcbn1cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJ2YXIgaGlkZGVuU3RvcmUgPSByZXF1aXJlKCcuL2hpZGRlbi1zdG9yZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVN0b3JlO1xuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSgpIHtcbiAgICB2YXIga2V5ID0ge307XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgb2JqID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYWttYXAtc2hpbTogS2V5IG11c3QgYmUgb2JqZWN0JylcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdG9yZSA9IG9iai52YWx1ZU9mKGtleSk7XG4gICAgICAgIHJldHVybiBzdG9yZSAmJiBzdG9yZS5pZGVudGl0eSA9PT0ga2V5ID9cbiAgICAgICAgICAgIHN0b3JlIDogaGlkZGVuU3RvcmUob2JqLCBrZXkpO1xuICAgIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGhpZGRlblN0b3JlO1xuXG5mdW5jdGlvbiBoaWRkZW5TdG9yZShvYmosIGtleSkge1xuICAgIHZhciBzdG9yZSA9IHsgaWRlbnRpdHk6IGtleSB9O1xuICAgIHZhciB2YWx1ZU9mID0gb2JqLnZhbHVlT2Y7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBcInZhbHVlT2ZcIiwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgIT09IGtleSA/XG4gICAgICAgICAgICAgICAgdmFsdWVPZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc3RvcmU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG59XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKFwiaW5oZXJpdHNcIilcblxudmFyIEFMTF9QUk9QUyA9IFtcbiAgICBcImFsdEtleVwiLCBcImJ1YmJsZXNcIiwgXCJjYW5jZWxhYmxlXCIsIFwiY3RybEtleVwiLFxuICAgIFwiZXZlbnRQaGFzZVwiLCBcIm1ldGFLZXlcIiwgXCJyZWxhdGVkVGFyZ2V0XCIsIFwic2hpZnRLZXlcIixcbiAgICBcInRhcmdldFwiLCBcInRpbWVTdGFtcFwiLCBcInR5cGVcIiwgXCJ2aWV3XCIsIFwid2hpY2hcIlxuXVxudmFyIEtFWV9QUk9QUyA9IFtcImNoYXJcIiwgXCJjaGFyQ29kZVwiLCBcImtleVwiLCBcImtleUNvZGVcIl1cbnZhciBNT1VTRV9QUk9QUyA9IFtcbiAgICBcImJ1dHRvblwiLCBcImJ1dHRvbnNcIiwgXCJjbGllbnRYXCIsIFwiY2xpZW50WVwiLCBcImxheWVyWFwiLFxuICAgIFwibGF5ZXJZXCIsIFwib2Zmc2V0WFwiLCBcIm9mZnNldFlcIiwgXCJwYWdlWFwiLCBcInBhZ2VZXCIsXG4gICAgXCJzY3JlZW5YXCIsIFwic2NyZWVuWVwiLCBcInRvRWxlbWVudFwiXG5dXG5cbnZhciBya2V5RXZlbnQgPSAvXmtleXxpbnB1dC9cbnZhciBybW91c2VFdmVudCA9IC9eKD86bW91c2V8cG9pbnRlcnxjb250ZXh0bWVudSl8Y2xpY2svXG5cbm1vZHVsZS5leHBvcnRzID0gUHJveHlFdmVudFxuXG5mdW5jdGlvbiBQcm94eUV2ZW50KGV2KSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFByb3h5RXZlbnQpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHlFdmVudChldilcbiAgICB9XG5cbiAgICBpZiAocmtleUV2ZW50LnRlc3QoZXYudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBLZXlFdmVudChldilcbiAgICB9IGVsc2UgaWYgKHJtb3VzZUV2ZW50LnRlc3QoZXYudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNb3VzZUV2ZW50KGV2KVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQUxMX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wS2V5ID0gQUxMX1BST1BTW2ldXG4gICAgICAgIHRoaXNbcHJvcEtleV0gPSBldltwcm9wS2V5XVxuICAgIH1cblxuICAgIHRoaXMuX3Jhd0V2ZW50ID0gZXZcbiAgICB0aGlzLl9idWJibGVzID0gZmFsc2U7XG59XG5cblByb3h5RXZlbnQucHJvdG90eXBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3Jhd0V2ZW50LnByZXZlbnREZWZhdWx0KClcbn1cblxuUHJveHlFdmVudC5wcm90b3R5cGUuc3RhcnRQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9idWJibGVzID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gTW91c2VFdmVudChldikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQUxMX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wS2V5ID0gQUxMX1BST1BTW2ldXG4gICAgICAgIHRoaXNbcHJvcEtleV0gPSBldltwcm9wS2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTU9VU0VfUFJPUFMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG1vdXNlUHJvcEtleSA9IE1PVVNFX1BST1BTW2pdXG4gICAgICAgIHRoaXNbbW91c2VQcm9wS2V5XSA9IGV2W21vdXNlUHJvcEtleV1cbiAgICB9XG5cbiAgICB0aGlzLl9yYXdFdmVudCA9IGV2XG59XG5cbmluaGVyaXRzKE1vdXNlRXZlbnQsIFByb3h5RXZlbnQpXG5cbmZ1bmN0aW9uIEtleUV2ZW50KGV2KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBTExfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHByb3BLZXkgPSBBTExfUFJPUFNbaV1cbiAgICAgICAgdGhpc1twcm9wS2V5XSA9IGV2W3Byb3BLZXldXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBLRVlfUFJPUFMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGtleVByb3BLZXkgPSBLRVlfUFJPUFNbal1cbiAgICAgICAgdGhpc1trZXlQcm9wS2V5XSA9IGV2W2tleVByb3BLZXldXG4gICAgfVxuXG4gICAgdGhpcy5fcmF3RXZlbnQgPSBldlxufVxuXG5pbmhlcml0cyhLZXlFdmVudCwgUHJveHlFdmVudClcbiIsInZhciBEYXRhU2V0ID0gcmVxdWlyZShcImRhdGEtc2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gcmVtb3ZlRXZlbnRcblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnQodGFyZ2V0LCB0eXBlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGRzID0gRGF0YVNldCh0YXJnZXQpXG4gICAgdmFyIGV2ZW50cyA9IGRzW3R5cGVdXG5cbiAgICBpZiAoIWV2ZW50cykge1xuICAgICAgICByZXR1cm5cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnRzKSkge1xuICAgICAgICB2YXIgaW5kZXggPSBldmVudHMuaW5kZXhPZihoYW5kbGVyKVxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBldmVudHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudHMgPT09IGhhbmRsZXIpIHtcbiAgICAgICAgZHNbdHlwZV0gPSBudWxsXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBFdmVudFxuXG5mdW5jdGlvbiBFdmVudCgpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gW11cblxuICAgIHJldHVybiB7IGJyb2FkY2FzdDogYnJvYWRjYXN0LCBsaXN0ZW46IGV2ZW50IH1cblxuICAgIGZ1bmN0aW9uIGJyb2FkY2FzdCh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGlzdGVuZXJzW2ldKHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXZlbnQobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG5cbiAgICAgICAgcmV0dXJuIHJlbW92ZUxpc3RlbmVyXG5cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcilcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIGV2ZW50ID0gcmVxdWlyZShcIi4vc2luZ2xlLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gbXVsdGlwbGVcblxuZnVuY3Rpb24gbXVsdGlwbGUobmFtZXMpIHtcbiAgICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIG5hbWUpIHtcbiAgICAgICAgYWNjW25hbWVdID0gZXZlbnQoKVxuICAgICAgICByZXR1cm4gYWNjXG4gICAgfSwge30pXG59XG4iLCJ2YXIgRXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGVcblxuZnVuY3Rpb24gU2luZ2xlKCkge1xuICAgIHZhciB0dXBsZSA9IEV2ZW50KClcblxuICAgIHJldHVybiBmdW5jdGlvbiBldmVudCh2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0dXBsZS5saXN0ZW4odmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHVwbGUuYnJvYWRjYXN0KHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHJhZiA9IHJlcXVpcmUoXCJyYWZcIilcbnZhciB2dHJlZURpZmYgPSByZXF1aXJlKFwidnRyZWUvZGlmZlwiKVxudmFyIHZkb21DcmVhdGUgPSByZXF1aXJlKFwidmRvbS9jcmVhdGUtZWxlbWVudFwiKVxudmFyIHZkb21QYXRjaCA9IHJlcXVpcmUoXCJ2ZG9tL3BhdGNoXCIpXG52YXIgVHlwZWRFcnJvciA9IHJlcXVpcmUoXCJlcnJvci90eXBlZFwiKVxuXG52YXIgSW52YWxpZFVwZGF0ZUluUmVuZGVyID0gVHlwZWRFcnJvcih7XG4gICAgdHlwZTogXCJtYWluLWxvb3AuaW52YWxpZC51cGRhdGUuaW4tcmVuZGVyXCIsXG4gICAgbWVzc2FnZTogXCJtYWluLWxvb3A6IFVuZXhwZWN0ZWQgdXBkYXRlIG9jY3VycmVkIGluIGxvb3AuXFxuXCIgK1xuICAgICAgICBcIldlIGFyZSBjdXJyZW50bHkgcmVuZGVyaW5nIGEgdmlldywgXCIgK1xuICAgICAgICAgICAgXCJ5b3UgY2FuJ3QgY2hhbmdlIHN0YXRlIHJpZ2h0IG5vdy5cXG5cIiArXG4gICAgICAgIFwiVGhlIGRpZmYgaXM6IHtzdHJpbmdEaWZmfS5cXG5cIiArXG4gICAgICAgIFwiU1VHR0VTVEVEIEZJWDogZmluZCB0aGUgc3RhdGUgbXV0YXRpb24gaW4geW91ciB2aWV3IFwiICtcbiAgICAgICAgICAgIFwib3IgcmVuZGVyaW5nIGZ1bmN0aW9uIGFuZCByZW1vdmUgaXQuXFxuXCIgK1xuICAgICAgICBcIlRoZSB2aWV3IHNob3VsZCBub3QgaGF2ZSBhbnkgc2lkZSBlZmZlY3RzLlxcblwiLFxuICAgIGRpZmY6IG51bGwsXG4gICAgc3RyaW5nRGlmZjogbnVsbFxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBtYWluXG5cbmZ1bmN0aW9uIG1haW4oaW5pdGlhbFN0YXRlLCB2aWV3LCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge31cblxuICAgIHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGVcbiAgICB2YXIgY3JlYXRlID0gb3B0cy5jcmVhdGUgfHwgdmRvbUNyZWF0ZVxuICAgIHZhciBkaWZmID0gb3B0cy5kaWZmIHx8IHZ0cmVlRGlmZlxuICAgIHZhciBwYXRjaCA9IG9wdHMucGF0Y2ggfHwgdmRvbVBhdGNoXG4gICAgdmFyIHJlZHJhd1NjaGVkdWxlZCA9IGZhbHNlXG5cbiAgICB2YXIgdHJlZSA9IG9wdHMuaW5pdGlhbFRyZWUgfHwgdmlldyhjdXJyZW50U3RhdGUpXG4gICAgdmFyIHRhcmdldCA9IG9wdHMudGFyZ2V0IHx8IGNyZWF0ZSh0cmVlLCBvcHRzKVxuICAgIHZhciBpblJlbmRlcmluZ1RyYW5zYWN0aW9uID0gZmFsc2VcblxuICAgIGN1cnJlbnRTdGF0ZSA9IG51bGxcblxuICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICB1cGRhdGU6IHVwZGF0ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZShzdGF0ZSkge1xuICAgICAgICBpZiAoaW5SZW5kZXJpbmdUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgdGhyb3cgSW52YWxpZFVwZGF0ZUluUmVuZGVyKHtcbiAgICAgICAgICAgICAgICBkaWZmOiBzdGF0ZS5fZGlmZixcbiAgICAgICAgICAgICAgICBzdHJpbmdEaWZmOiBKU09OLnN0cmluZ2lmeShzdGF0ZS5fZGlmZilcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudFN0YXRlID09PSBudWxsICYmICFyZWRyYXdTY2hlZHVsZWQpIHtcbiAgICAgICAgICAgIHJlZHJhd1NjaGVkdWxlZCA9IHRydWVcbiAgICAgICAgICAgIHJhZihyZWRyYXcpXG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50U3RhdGUgPSBzdGF0ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICAgICAgcmVkcmF3U2NoZWR1bGVkID0gZmFsc2U7XG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaW5SZW5kZXJpbmdUcmFuc2FjdGlvbiA9IHRydWVcbiAgICAgICAgdmFyIG5ld1RyZWUgPSB2aWV3KGN1cnJlbnRTdGF0ZSlcblxuICAgICAgICBpZiAob3B0cy5jcmVhdGVPbmx5KSB7XG4gICAgICAgICAgICBjcmVhdGUobmV3VHJlZSwgb3B0cylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwYXRjaGVzID0gZGlmZih0cmVlLCBuZXdUcmVlLCBvcHRzKVxuICAgICAgICAgICAgdGFyZ2V0ID0gcGF0Y2godGFyZ2V0LCBwYXRjaGVzLCBvcHRzKVxuICAgICAgICB9XG5cbiAgICAgICAgaW5SZW5kZXJpbmdUcmFuc2FjdGlvbiA9IGZhbHNlXG4gICAgICAgIHRyZWUgPSBuZXdUcmVlXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG51bGxcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykgcmV0dXJuIGNhbWVsQ2FzZShvYmopO1xuICAgIHJldHVybiB3YWxrKG9iaik7XG59O1xuXG5mdW5jdGlvbiB3YWxrIChvYmopIHtcbiAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JykgcmV0dXJuIG9iajtcbiAgICBpZiAoaXNEYXRlKG9iaikgfHwgaXNSZWdleChvYmopKSByZXR1cm4gb2JqO1xuICAgIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBtYXAob2JqLCB3YWxrKTtcbiAgICByZXR1cm4gcmVkdWNlKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgIHZhciBjYW1lbCA9IGNhbWVsQ2FzZShrZXkpO1xuICAgICAgICBhY2NbY2FtZWxdID0gd2FsayhvYmpba2V5XSk7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBjYW1lbENhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXy4tXShcXHd8JCkvZywgZnVuY3Rpb24gKF8seCkge1xuICAgICAgICByZXR1cm4geC50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xufVxuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc0RhdGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBEYXRlXSc7XG59O1xuXG52YXIgaXNSZWdleCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufTtcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhcy5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICAgIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiByZWR1Y2UgKHhzLCBmLCBhY2MpIHtcbiAgICBpZiAoeHMucmVkdWNlKSByZXR1cm4geHMucmVkdWNlKGYsIGFjYyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhY2MgPSBmKGFjYywgeHNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjO1xufVxuIiwidmFyIG5hcmdzID0gL1xceyhbMC05YS16QS1aXSspXFx9L2dcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlXG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHN0cmluZykge1xuICAgIHZhciBhcmdzXG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMV1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgfVxuXG4gICAgaWYgKCFhcmdzIHx8ICFhcmdzLmhhc093blByb3BlcnR5KSB7XG4gICAgICAgIGFyZ3MgPSB7fVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShuYXJncywgZnVuY3Rpb24gcmVwbGFjZUFyZyhtYXRjaCwgaSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHJlc3VsdFxuXG4gICAgICAgIGlmIChzdHJpbmdbaW5kZXggLSAxXSA9PT0gXCJ7XCIgJiZcbiAgICAgICAgICAgIHN0cmluZ1tpbmRleCArIG1hdGNoLmxlbmd0aF0gPT09IFwifVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXJncy5oYXNPd25Qcm9wZXJ0eShpKSA/IGFyZ3NbaV0gOiBudWxsXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsIHx8IHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9XG4gICAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwidmFyIGNhbWVsaXplID0gcmVxdWlyZShcImNhbWVsaXplXCIpXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKFwic3RyaW5nLXRlbXBsYXRlXCIpXG52YXIgZXh0ZW5kID0gcmVxdWlyZShcInh0ZW5kL211dGFibGVcIilcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlZEVycm9yXG5cbmZ1bmN0aW9uIFR5cGVkRXJyb3IoYXJncykge1xuICAgIGlmICghYXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcmdzIGlzIHJlcXVpcmVkXCIpO1xuICAgIH1cbiAgICBpZiAoIWFyZ3MudHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcmdzLnR5cGUgaXMgcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGlmICghYXJncy5tZXNzYWdlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZ3MubWVzc2FnZSBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG5cbiAgICB2YXIgbWVzc2FnZSA9IGFyZ3MubWVzc2FnZVxuXG4gICAgaWYgKGFyZ3MudHlwZSAmJiAhYXJncy5uYW1lKSB7XG4gICAgICAgIHZhciBlcnJvck5hbWUgPSBjYW1lbGl6ZShhcmdzLnR5cGUpICsgXCJFcnJvclwiXG4gICAgICAgIGFyZ3MubmFtZSA9IGVycm9yTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgZXJyb3JOYW1lLnN1YnN0cigxKVxuICAgIH1cblxuICAgIGNyZWF0ZUVycm9yLnR5cGUgPSBhcmdzLnR5cGU7XG4gICAgY3JlYXRlRXJyb3IuX25hbWUgPSBhcmdzLm5hbWU7XG5cbiAgICByZXR1cm4gY3JlYXRlRXJyb3I7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVFcnJvcihvcHRzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgRXJyb3IoKVxuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXN1bHQsIFwidHlwZVwiLCB7XG4gICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnR5cGUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSlcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IGV4dGVuZCh7fSwgYXJncywgb3B0cylcblxuICAgICAgICBleHRlbmQocmVzdWx0LCBvcHRpb25zKVxuICAgICAgICByZXN1bHQubWVzc2FnZSA9IHRlbXBsYXRlKG1lc3NhZ2UsIG9wdGlvbnMpXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbn1cblxuIiwidmFyIG5vdyA9IHJlcXVpcmUoJ3BlcmZvcm1hbmNlLW5vdycpXG4gICwgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyB7fSA6IHdpbmRvd1xuICAsIHZlbmRvcnMgPSBbJ21veicsICd3ZWJraXQnXVxuICAsIHN1ZmZpeCA9ICdBbmltYXRpb25GcmFtZSdcbiAgLCByYWYgPSBnbG9iYWxbJ3JlcXVlc3QnICsgc3VmZml4XVxuICAsIGNhZiA9IGdsb2JhbFsnY2FuY2VsJyArIHN1ZmZpeF0gfHwgZ2xvYmFsWydjYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgLCBpc05hdGl2ZSA9IHRydWVcblxuZm9yKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICFyYWY7IGkrKykge1xuICByYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgY2FmID0gZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsJyArIHN1ZmZpeF1cbiAgICAgIHx8IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ0NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxufVxuXG4vLyBTb21lIHZlcnNpb25zIG9mIEZGIGhhdmUgckFGIGJ1dCBub3QgY0FGXG5pZighcmFmIHx8ICFjYWYpIHtcbiAgaXNOYXRpdmUgPSBmYWxzZVxuXG4gIHZhciBsYXN0ID0gMFxuICAgICwgaWQgPSAwXG4gICAgLCBxdWV1ZSA9IFtdXG4gICAgLCBmcmFtZUR1cmF0aW9uID0gMTAwMCAvIDYwXG5cbiAgcmFmID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBpZihxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHZhciBfbm93ID0gbm93KClcbiAgICAgICAgLCBuZXh0ID0gTWF0aC5tYXgoMCwgZnJhbWVEdXJhdGlvbiAtIChfbm93IC0gbGFzdCkpXG4gICAgICBsYXN0ID0gbmV4dCArIF9ub3dcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcCA9IHF1ZXVlLnNsaWNlKDApXG4gICAgICAgIC8vIENsZWFyIHF1ZXVlIGhlcmUgdG8gcHJldmVudFxuICAgICAgICAvLyBjYWxsYmFja3MgZnJvbSBhcHBlbmRpbmcgbGlzdGVuZXJzXG4gICAgICAgIC8vIHRvIHRoZSBjdXJyZW50IGZyYW1lJ3MgcXVldWVcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMFxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3AubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZighY3BbaV0uY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgIGNwW2ldLmNhbGxiYWNrKGxhc3QpXG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdGhyb3cgZSB9LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgTWF0aC5yb3VuZChuZXh0KSlcbiAgICB9XG4gICAgcXVldWUucHVzaCh7XG4gICAgICBoYW5kbGU6ICsraWQsXG4gICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICBjYW5jZWxsZWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIGNhZiA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYocXVldWVbaV0uaGFuZGxlID09PSBoYW5kbGUpIHtcbiAgICAgICAgcXVldWVbaV0uY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuKSB7XG4gIC8vIFdyYXAgaW4gYSBuZXcgZnVuY3Rpb24gdG8gcHJldmVudFxuICAvLyBgY2FuY2VsYCBwb3RlbnRpYWxseSBiZWluZyBhc3NpZ25lZFxuICAvLyB0byB0aGUgbmF0aXZlIHJBRiBmdW5jdGlvblxuICBpZighaXNOYXRpdmUpIHtcbiAgICByZXR1cm4gcmFmLmNhbGwoZ2xvYmFsLCBmbilcbiAgfVxuICByZXR1cm4gcmFmLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpIHtcbiAgICB0cnl7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0aHJvdyBlIH0sIDApXG4gICAgfVxuICB9KVxufVxubW9kdWxlLmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gIGNhZi5hcHBseShnbG9iYWwsIGFyZ3VtZW50cylcbn1cbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuNi4zXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBnZXROYW5vU2Vjb25kcywgaHJ0aW1lLCBsb2FkVGltZTtcblxuICBpZiAoKHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwZXJmb3JtYW5jZSAhPT0gbnVsbCkgJiYgcGVyZm9ybWFuY2Uubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsKSAmJiBwcm9jZXNzLmhydGltZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGdldE5hbm9TZWNvbmRzKCkgLSBsb2FkVGltZSkgLyAxZTY7XG4gICAgfTtcbiAgICBocnRpbWUgPSBwcm9jZXNzLmhydGltZTtcbiAgICBnZXROYW5vU2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhyO1xuICAgICAgaHIgPSBocnRpbWUoKTtcbiAgICAgIHJldHVybiBoclswXSAqIDFlOSArIGhyWzFdO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBnZXROYW5vU2Vjb25kcygpO1xuICB9IGVsc2UgaWYgKERhdGUubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IERhdGUubm93KCk7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9cGVyZm9ybWFuY2Utbm93Lm1hcFxuKi9cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJykpIiwidmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZExpc3RlbmVyXG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKG9ic2VydkFycmF5LCBvYnNlcnYpIHtcbiAgICB2YXIgbGlzdCA9IG9ic2VydkFycmF5Ll9saXN0XG5cbiAgICByZXR1cm4gb2JzZXJ2KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gIG9ic2VydkFycmF5KCkuc2xpY2UoKVxuICAgICAgICB2YXIgaW5kZXggPSBsaXN0LmluZGV4T2Yob2JzZXJ2KVxuXG4gICAgICAgIC8vIFRoaXMgY29kZSBwYXRoIHNob3VsZCBuZXZlciBoaXQuIElmIHRoaXMgaGFwcGVuc1xuICAgICAgICAvLyB0aGVyZSdzIGEgYnVnIGluIHRoZSBjbGVhbnVwIGNvZGVcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIm9ic2Vydi1hcnJheTogVW5yZW1vdmVkIG9ic2VydiBsaXN0ZW5lclwiXG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICAgICAgICBlcnIubGlzdCA9IGxpc3RcbiAgICAgICAgICAgIGVyci5pbmRleCA9IGluZGV4XG4gICAgICAgICAgICBlcnIub2JzZXJ2ID0gb2JzZXJ2XG4gICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlTGlzdC5zcGxpY2UoaW5kZXgsIDEsIHZhbHVlKVxuICAgICAgICBzZXROb25FbnVtZXJhYmxlKHZhbHVlTGlzdCwgXCJfZGlmZlwiLCBbIFtpbmRleCwgMSwgdmFsdWVdIF0pXG5cbiAgICAgICAgb2JzZXJ2QXJyYXkuc2V0KHZhbHVlTGlzdClcbiAgICB9KVxufVxuIiwidmFyIE9ic2VydkFycmF5ID0gcmVxdWlyZShcIi4vaW5kZXguanNcIilcblxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbnZhciBBUlJBWV9NRVRIT0RTID0gW1xuICAgIFwiY29uY2F0XCIsIFwic2xpY2VcIiwgXCJldmVyeVwiLCBcImZpbHRlclwiLCBcImZvckVhY2hcIiwgXCJpbmRleE9mXCIsXG4gICAgXCJqb2luXCIsIFwibGFzdEluZGV4T2ZcIiwgXCJtYXBcIiwgXCJyZWR1Y2VcIiwgXCJyZWR1Y2VSaWdodFwiLFxuICAgIFwic29tZVwiLCBcInRvU3RyaW5nXCIsIFwidG9Mb2NhbGVTdHJpbmdcIlxuXVxuXG52YXIgbWV0aG9kcyA9IEFSUkFZX01FVEhPRFMubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIFtuYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXMgPSB0aGlzLl9saXN0W25hbWVdLmFwcGx5KHRoaXMuX2xpc3QsIGFyZ3VtZW50cylcblxuICAgICAgICBpZiAocmVzICYmIEFycmF5LmlzQXJyYXkocmVzKSkge1xuICAgICAgICAgICAgcmVzID0gT2JzZXJ2QXJyYXkocmVzKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc1xuICAgIH1dXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5TWV0aG9kc1xuXG5mdW5jdGlvbiBBcnJheU1ldGhvZHMob2JzKSB7XG4gICAgb2JzLnB1c2ggPSBvYnNlcnZBcnJheVB1c2hcbiAgICBvYnMucG9wID0gb2JzZXJ2QXJyYXlQb3BcbiAgICBvYnMuc2hpZnQgPSBvYnNlcnZBcnJheVNoaWZ0XG4gICAgb2JzLnVuc2hpZnQgPSBvYnNlcnZBcnJheVVuc2hpZnRcbiAgICBvYnMucmV2ZXJzZSA9IG5vdEltcGxlbWVudGVkXG4gICAgb2JzLnNvcnQgPSBub3RJbXBsZW1lbnRlZFxuXG4gICAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uICh0dXBsZSkge1xuICAgICAgICBvYnNbdHVwbGVbMF1dID0gdHVwbGVbMV1cbiAgICB9KVxuICAgIHJldHVybiBvYnNcbn1cblxuXG5cbmZ1bmN0aW9uIG9ic2VydkFycmF5UHVzaCgpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGFyZ3MudW5zaGlmdCh0aGlzLl9saXN0Lmxlbmd0aCwgMClcbiAgICB0aGlzLnNwbGljZS5hcHBseSh0aGlzLCBhcmdzKVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpc3QubGVuZ3RoXG59XG5mdW5jdGlvbiBvYnNlcnZBcnJheVBvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5zcGxpY2UodGhpcy5fbGlzdC5sZW5ndGggLSAxLCAxKVswXVxufVxuZnVuY3Rpb24gb2JzZXJ2QXJyYXlTaGlmdCgpIHtcbiAgICByZXR1cm4gdGhpcy5zcGxpY2UoMCwgMSlbMF1cbn1cbmZ1bmN0aW9uIG9ic2VydkFycmF5VW5zaGlmdCgpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGFyZ3MudW5zaGlmdCgwLCAwKVxuICAgIHRoaXMuc3BsaWNlLmFwcGx5KHRoaXMsIGFyZ3MpXG5cbiAgICByZXR1cm4gdGhpcy5fbGlzdC5sZW5ndGhcbn1cblxuXG5mdW5jdGlvbiBub3RJbXBsZW1lbnRlZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJQdWxsIHJlcXVlc3Qgd2VsY29tZVwiKVxufVxuIiwidmFyIE9ic2VydiA9IHJlcXVpcmUoXCJvYnNlcnZcIilcblxuLy8gY2lyY3VsYXIgZGVwIGJldHdlZW4gQXJyYXlNZXRob2RzICYgdGhpcyBmaWxlXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydkFycmF5XG5cbnZhciBzcGxpY2UgPSByZXF1aXJlKFwiLi9zcGxpY2UuanNcIilcbnZhciBwdXQgPSByZXF1aXJlKFwiLi9wdXQuanNcIilcbnZhciB0cmFuc2FjdGlvbiA9IHJlcXVpcmUoXCIuL3RyYW5zYWN0aW9uLmpzXCIpXG52YXIgQXJyYXlNZXRob2RzID0gcmVxdWlyZShcIi4vYXJyYXktbWV0aG9kcy5qc1wiKVxudmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZShcIi4vYWRkLWxpc3RlbmVyLmpzXCIpXG5cblxuLyogIE9ic2VydkFycmF5IDo9IChBcnJheTxUPikgPT4gT2JzZXJ2PFxuICAgICAgICBBcnJheTxUPiAmIHsgX2RpZmY6IEFycmF5IH1cbiAgICA+ICYge1xuICAgICAgICBzcGxpY2U6IChpbmRleDogTnVtYmVyLCBhbW91bnQ6IE51bWJlciwgcmVzdC4uLjogVCkgPT5cbiAgICAgICAgICAgIEFycmF5PFQ+LFxuICAgICAgICBwdXNoOiAodmFsdWVzLi4uOiBUKSA9PiBOdW1iZXIsXG4gICAgICAgIGZpbHRlcjogKGxhbWJkYTogRnVuY3Rpb24sIHRoaXNWYWx1ZTogQW55KSA9PiBBcnJheTxUPixcbiAgICAgICAgaW5kZXhPZjogKGl0ZW06IFQsIGZyb21JbmRleDogTnVtYmVyKSA9PiBOdW1iZXJcbiAgICB9XG5cbiAgICBGaXggdG8gbWFrZSBpdCBtb3JlIGxpa2UgT2JzZXJ2SGFzaC5cblxuICAgIEkuZS4geW91IHdyaXRlIG9ic2VydmFibGVzIGludG8gaXQuIFxuICAgICAgICByZWFkaW5nIG1ldGhvZHMgdGFrZSBwbGFpbiBKUyBvYmplY3RzIHRvIHJlYWRcbiAgICAgICAgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgYXJyYXkgaXMgYWx3YXlzIGFuIGFycmF5IG9mIHBsYWluXG4gICAgICAgIG9ianNlY3QuXG5cbiAgICAgICAgVGhlIG9ic2VydiBhcnJheSBpbnN0YW5jZSBpdHNlbGYgd291bGQgaGF2ZSBpbmRleGVkIFxuICAgICAgICBwcm9wZXJ0aWVzIHRoYXQgYXJlIHRoZSBvYnNlcnZhYmxlc1xuKi9cbmZ1bmN0aW9uIE9ic2VydkFycmF5KGluaXRpYWxMaXN0KSB7XG4gICAgLy8gbGlzdCBpcyB0aGUgaW50ZXJuYWwgbXV0YWJsZSBsaXN0IG9ic2VydiBpbnN0YW5jZXMgdGhhdFxuICAgIC8vIGFsbCBtZXRob2RzIG9uIGBvYnNgIGRpc3BhdGNoIHRvLlxuICAgIHZhciBsaXN0ID0gaW5pdGlhbExpc3RcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gW11cblxuICAgIC8vIGNvcHkgc3RhdGUgb3V0IG9mIGluaXRpYWxMaXN0IGludG8gaW5pdGlhbFN0YXRlXG4gICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnYsIGluZGV4KSB7XG4gICAgICAgIGluaXRpYWxTdGF0ZVtpbmRleF0gPSB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgb2JzZXJ2KCkgOiBvYnNlcnZcbiAgICB9KVxuXG4gICAgdmFyIG9icyA9IE9ic2Vydihpbml0aWFsU3RhdGUpXG4gICAgb2JzLnNwbGljZSA9IHNwbGljZVxuXG4gICAgb2JzLmdldCA9IGdldFxuICAgIG9icy5nZXRMZW5ndGggPSBnZXRMZW5ndGhcbiAgICBvYnMucHV0ID0gcHV0XG4gICAgb2JzLnRyYW5zYWN0aW9uID0gdHJhbnNhY3Rpb25cblxuICAgIC8vIHlvdSBiZXR0ZXIgbm90IG11dGF0ZSB0aGlzIGxpc3QgZGlyZWN0bHlcbiAgICAvLyB0aGlzIGlzIHRoZSBsaXN0IG9mIG9ic2VydnMgaW5zdGFuY2VzXG4gICAgb2JzLl9saXN0ID0gbGlzdFxuXG4gICAgdmFyIHJlbW92ZUxpc3RlbmVycyA9IGxpc3QubWFwKGZ1bmN0aW9uIChvYnNlcnYpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBhZGRMaXN0ZW5lcihvYnMsIG9ic2VydikgOlxuICAgICAgICAgICAgbnVsbFxuICAgIH0pO1xuICAgIC8vIHRoaXMgaXMgYSBsaXN0IG9mIHJlbW92YWwgZnVuY3Rpb25zIHRoYXQgbXVzdCBiZSBjYWxsZWRcbiAgICAvLyB3aGVuIG9ic2VydiBpbnN0YW5jZXMgYXJlIHJlbW92ZWQgZnJvbSBgb2JzLmxpc3RgXG4gICAgLy8gbm90IGNhbGxpbmcgdGhpcyBtZWFucyB3ZSBkbyBub3QgR0Mgb3VyIG9ic2VydiBjaGFuZ2VcbiAgICAvLyBsaXN0ZW5lcnMuIFdoaWNoIGNhdXNlcyByYWdlIGJ1Z3NcbiAgICBvYnMuX3JlbW92ZUxpc3RlbmVycyA9IHJlbW92ZUxpc3RlbmVyc1xuXG4gICAgcmV0dXJuIEFycmF5TWV0aG9kcyhvYnMsIGxpc3QpXG59XG5cbmZ1bmN0aW9uIGdldChpbmRleCkge1xuICAgIHJldHVybiB0aGlzLl9saXN0W2luZGV4XVxufVxuXG5mdW5jdGlvbiBnZXRMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpc3QubGVuZ3RoXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHNldE5vbkVudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHNldE5vbkVudW1lcmFibGUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcbn1cbiIsImZ1bmN0aW9uIGhlYWQgKGEpIHtcbiAgcmV0dXJuIGFbMF1cbn1cblxuZnVuY3Rpb24gbGFzdCAoYSkge1xuICByZXR1cm4gYVthLmxlbmd0aCAtIDFdXG59XG5cbmZ1bmN0aW9uIHRhaWwoYSkge1xuICByZXR1cm4gYS5zbGljZSgxKVxufVxuXG5mdW5jdGlvbiByZXRyZWF0IChlKSB7XG4gIHJldHVybiBlLnBvcCgpXG59XG5cbmZ1bmN0aW9uIGhhc0xlbmd0aCAoZSkge1xuICByZXR1cm4gZS5sZW5ndGhcbn1cblxuZnVuY3Rpb24gYW55KGFyeSwgdGVzdCkge1xuICBmb3IodmFyIGk9MDtpPGFyeS5sZW5ndGg7aSsrKVxuICAgIGlmKHRlc3QoYXJ5W2ldKSlcbiAgICAgIHJldHVybiB0cnVlXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBzY29yZSAoYSkge1xuICByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKHMsIGEpIHtcbiAgICAgIHJldHVybiBzICsgYS5sZW5ndGggKyBhWzFdICsgMVxuICB9LCAwKVxufVxuXG5mdW5jdGlvbiBiZXN0IChhLCBiKSB7XG4gIHJldHVybiBzY29yZShhKSA8PSBzY29yZShiKSA/IGEgOiBiXG59XG5cblxudmFyIF9ydWxlcyAvLyBzZXQgYXQgdGhlIGJvdHRvbSAgXG5cbi8vIG5vdGUsIG5haXZlIGltcGxlbWVudGF0aW9uLiB3aWxsIGJyZWFrIG9uIGNpcmN1bGFyIG9iamVjdHMuXG5cbmZ1bmN0aW9uIF9lcXVhbChhLCBiKSB7XG4gIGlmKGEgJiYgIWIpIHJldHVybiBmYWxzZVxuICBpZihBcnJheS5pc0FycmF5KGEpKVxuICAgIGlmKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgaWYoYSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgYSkge1xuICAgIGZvcih2YXIgaSBpbiBhKVxuICAgICAgaWYoIV9lcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlXG4gICAgZm9yKHZhciBpIGluIGIpXG4gICAgICBpZighX2VxdWFsKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJldHVybiBhID09IGJcbn1cblxuZnVuY3Rpb24gZ2V0QXJncyhhcmdzKSB7XG4gIHJldHVybiBhcmdzLmxlbmd0aCA9PSAxID8gYXJnc1swXSA6IFtdLnNsaWNlLmNhbGwoYXJncylcbn1cblxuLy8gcmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBub3QgbGlrZSB0aGUgb3RoZXJzLCBvciAtMVxuZnVuY3Rpb24gb2RkRWxlbWVudChhcnksIGNtcCkge1xuICB2YXIgY1xuICBmdW5jdGlvbiBndWVzcyhhKSB7XG4gICAgdmFyIG9kZCA9IC0xXG4gICAgYyA9IDBcbiAgICBmb3IgKHZhciBpID0gYTsgaSA8IGFyeS5sZW5ndGg7IGkgKyspIHtcbiAgICAgIGlmKCFjbXAoYXJ5W2FdLCBhcnlbaV0pKSB7XG4gICAgICAgIG9kZCA9IGksIGMrK1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYyA+IDEgPyAtMSA6IG9kZFxuICB9XG4gIC8vYXNzdW1lIHRoYXQgaXQgaXMgdGhlIGZpcnN0IGVsZW1lbnQuXG4gIHZhciBnID0gZ3Vlc3MoMClcbiAgaWYoLTEgIT0gZykgcmV0dXJuIGdcbiAgLy8wIHdhcyB0aGUgb2RkIG9uZSwgdGhlbiBhbGwgdGhlIG90aGVyIGVsZW1lbnRzIGFyZSBlcXVhbFxuICAvL2Vsc2UgdGhlcmUgbW9yZSB0aGFuIG9uZSBkaWZmZXJlbnQgZWxlbWVudFxuICBndWVzcygxKVxuICByZXR1cm4gYyA9PSAwID8gMCA6IC0xXG59XG52YXIgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlcHMsIGV4cG9ydHMpIHtcbiAgdmFyIGVxdWFsID0gKGRlcHMgJiYgZGVwcy5lcXVhbCkgfHwgX2VxdWFsXG4gIGV4cG9ydHMgPSBleHBvcnRzIHx8IHt9IFxuICBleHBvcnRzLmxjcyA9IFxuICBmdW5jdGlvbiBsY3MoKSB7XG4gICAgdmFyIGNhY2hlID0ge31cbiAgICB2YXIgYXJncyA9IGdldEFyZ3MoYXJndW1lbnRzKVxuICAgIHZhciBhID0gYXJnc1swXSwgYiA9IGFyZ3NbMV1cblxuICAgIGZ1bmN0aW9uIGtleSAoYSxiKXtcbiAgICAgIHJldHVybiBhLmxlbmd0aCArICc6JyArIGIubGVuZ3RoXG4gICAgfVxuXG4gICAgLy9maW5kIGxlbmd0aCB0aGF0IG1hdGNoZXMgYXQgdGhlIGhlYWRcblxuICAgIGlmKGFyZ3MubGVuZ3RoID4gMikge1xuICAgICAgLy9pZiBjYWxsZWQgd2l0aCBtdWx0aXBsZSBzZXF1ZW5jZXNcbiAgICAgIC8vcmVjdXJzZSwgc2luY2UgbGNzKGEsIGIsIGMsIGQpID09IGxjcyhsY3MoYSxiKSwgbGNzKGMsZCkpXG4gICAgICBhcmdzLnB1c2gobGNzKGFyZ3Muc2hpZnQoKSwgYXJncy5zaGlmdCgpKSlcbiAgICAgIHJldHVybiBsY3MoYXJncylcbiAgICB9XG4gICAgXG4gICAgLy90aGlzIHdvdWxkIGJlIGltcHJvdmVkIGJ5IHRydW5jYXRpbmcgaW5wdXQgZmlyc3RcbiAgICAvL2FuZCBub3QgcmV0dXJuaW5nIGFuIGxjcyBhcyBhbiBpbnRlcm1lZGlhdGUgc3RlcC5cbiAgICAvL3VudGlsbCB0aGF0IGlzIGEgcGVyZm9ybWFuY2UgcHJvYmxlbS5cblxuICAgIHZhciBzdGFydCA9IDAsIGVuZCA9IDBcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGggJiYgaSA8IGIubGVuZ3RoIFxuICAgICAgJiYgZXF1YWwoYVtpXSwgYltpXSlcbiAgICAgIDsgaSArK1xuICAgIClcbiAgICAgIHN0YXJ0ID0gaSArIDFcblxuICAgIGlmKGEubGVuZ3RoID09PSBzdGFydClcbiAgICAgIHJldHVybiBhLnNsaWNlKClcblxuICAgIGZvcih2YXIgaSA9IDA7ICBpIDwgYS5sZW5ndGggLSBzdGFydCAmJiBpIDwgYi5sZW5ndGggLSBzdGFydFxuICAgICAgJiYgZXF1YWwoYVthLmxlbmd0aCAtIDEgLSBpXSwgYltiLmxlbmd0aCAtIDEgLSBpXSlcbiAgICAgIDsgaSArK1xuICAgIClcbiAgICAgIGVuZCA9IGlcblxuICAgIGZ1bmN0aW9uIHJlY3Vyc2UgKGEsIGIpIHtcbiAgICAgIGlmKCFhLmxlbmd0aCB8fCAhYi5sZW5ndGgpIHJldHVybiBbXVxuICAgICAgLy9hdm9pZCBleHBvbmVudGlhbCB0aW1lIGJ5IGNhY2hpbmcgdGhlIHJlc3VsdHNcbiAgICAgIGlmKGNhY2hlW2tleShhLCBiKV0pIHJldHVybiBjYWNoZVtrZXkoYSwgYildXG5cbiAgICAgIGlmKGVxdWFsKGFbMF0sIGJbMF0pKVxuICAgICAgICByZXR1cm4gW2hlYWQoYSldLmNvbmNhdChyZWN1cnNlKHRhaWwoYSksIHRhaWwoYikpKVxuICAgICAgZWxzZSB7IFxuICAgICAgICB2YXIgX2EgPSByZWN1cnNlKHRhaWwoYSksIGIpXG4gICAgICAgIHZhciBfYiA9IHJlY3Vyc2UoYSwgdGFpbChiKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlW2tleShhLGIpXSA9IF9hLmxlbmd0aCA+IF9iLmxlbmd0aCA/IF9hIDogX2IgIFxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB2YXIgbWlkZGxlQSA9IGEuc2xpY2Uoc3RhcnQsIGEubGVuZ3RoIC0gZW5kKVxuICAgIHZhciBtaWRkbGVCID0gYi5zbGljZShzdGFydCwgYi5sZW5ndGggLSBlbmQpXG5cbiAgICByZXR1cm4gKFxuICAgICAgYS5zbGljZSgwLCBzdGFydCkuY29uY2F0KFxuICAgICAgICByZWN1cnNlKG1pZGRsZUEsIG1pZGRsZUIpXG4gICAgICApLmNvbmNhdChhLnNsaWNlKGEubGVuZ3RoIC0gZW5kKSlcbiAgICApXG4gIH1cblxuICAvLyBnaXZlbiBuIHNlcXVlbmNlcywgY2FsYyB0aGUgbGNzLCBhbmQgdGhlbiBjaHVuayBzdHJpbmdzIGludG8gc3RhYmxlIGFuZCB1bnN0YWJsZSBzZWN0aW9ucy5cbiAgLy8gdW5zdGFibGUgY2h1bmtzIGFyZSBwYXNzZWQgdG8gYnVpbGRcbiAgZXhwb3J0cy5jaHVuayA9XG4gIGZ1bmN0aW9uIChxLCBidWlsZCkge1xuICAgIHZhciBxID0gcS5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUuc2xpY2UoKSB9KVxuICAgIHZhciBsY3MgPSBleHBvcnRzLmxjcy5hcHBseShudWxsLCBxKVxuICAgIHZhciBhbGwgPSBbbGNzXS5jb25jYXQocSlcblxuICAgIGZ1bmN0aW9uIG1hdGNoTGNzIChlKSB7XG4gICAgICBpZihlLmxlbmd0aCAmJiAhbGNzLmxlbmd0aCB8fCAhZS5sZW5ndGggJiYgbGNzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlIC8vaW5jYXNlIHRoZSBsYXN0IGl0ZW0gaXMgbnVsbFxuICAgICAgcmV0dXJuIGVxdWFsKGxhc3QoZSksIGxhc3QobGNzKSkgfHwgKChlLmxlbmd0aCArIGxjcy5sZW5ndGgpID09PSAwKVxuICAgIH1cblxuICAgIHdoaWxlKGFueShxLCBoYXNMZW5ndGgpKSB7XG4gICAgICAvL2lmIGVhY2ggZWxlbWVudCBpcyBhdCB0aGUgbGNzIHRoZW4gdGhpcyBjaHVuayBpcyBzdGFibGUuXG4gICAgICB3aGlsZShxLmV2ZXJ5KG1hdGNoTGNzKSAmJiBxLmV2ZXJ5KGhhc0xlbmd0aCkpXG4gICAgICAgIGFsbC5mb3JFYWNoKHJldHJlYXQpXG4gICAgICAvL2NvbGxlY3QgdGhlIGNoYW5nZXMgaW4gZWFjaCBhcnJheSB1cHRvIHRoZSBuZXh0IG1hdGNoIHdpdGggdGhlIGxjc1xuICAgICAgdmFyIGMgPSBmYWxzZVxuICAgICAgdmFyIHVuc3RhYmxlID0gcS5tYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGNoYW5nZSA9IFtdXG4gICAgICAgIHdoaWxlKCFtYXRjaExjcyhlKSkge1xuICAgICAgICAgIGNoYW5nZS51bnNoaWZ0KHJldHJlYXQoZSkpXG4gICAgICAgICAgYyA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hhbmdlXG4gICAgICB9KVxuICAgICAgaWYoYykgYnVpbGQocVswXS5sZW5ndGgsIHVuc3RhYmxlKVxuICAgIH1cbiAgfVxuXG4gIC8vY2FsY3VsYXRlIGEgZGlmZiB0aGlzIGlzIG9ubHkgdXBkYXRlc1xuICBleHBvcnRzLm9wdGltaXN0aWNEaWZmID1cbiAgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgTSA9IE1hdGgubWF4KGEubGVuZ3RoLCBiLmxlbmd0aClcbiAgICB2YXIgbSA9IE1hdGgubWluKGEubGVuZ3RoLCBiLmxlbmd0aClcbiAgICB2YXIgcGF0Y2ggPSBbXVxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBNOyBpKyspXG4gICAgICBpZihhW2ldICE9PSBiW2ldKSB7XG4gICAgICAgIHZhciBjdXIgPSBbaSwwXSwgZGVsZXRlcyA9IDBcbiAgICAgICAgd2hpbGUoYVtpXSAhPT0gYltpXSAmJiBpIDwgbSkge1xuICAgICAgICAgIGN1clsxXSA9ICsrZGVsZXRlc1xuICAgICAgICAgIGN1ci5wdXNoKGJbaSsrXSlcbiAgICAgICAgfVxuICAgICAgICAvL3RoZSByZXN0IGFyZSBkZWxldGVzIG9yIGluc2VydHNcbiAgICAgICAgaWYoaSA+PSBtKSB7XG4gICAgICAgICAgLy90aGUgcmVzdCBhcmUgZGVsZXRlc1xuICAgICAgICAgIGlmKGEubGVuZ3RoID4gYi5sZW5ndGgpXG4gICAgICAgICAgICBjdXJbMV0gKz0gYS5sZW5ndGggLSBiLmxlbmd0aFxuICAgICAgICAgIC8vdGhlIHJlc3QgYXJlIGluc2VydHNcbiAgICAgICAgICBlbHNlIGlmKGEubGVuZ3RoIDwgYi5sZW5ndGgpXG4gICAgICAgICAgICBjdXIgPSBjdXIuY29uY2F0KGIuc2xpY2UoYS5sZW5ndGgpKVxuICAgICAgICB9XG4gICAgICAgIHBhdGNoLnB1c2goY3VyKVxuICAgICAgfVxuXG4gICAgcmV0dXJuIHBhdGNoXG4gIH1cblxuICBleHBvcnRzLmRpZmYgPVxuICBmdW5jdGlvbiAoYSwgYikge1xuICAgIHZhciBvcHRpbWlzdGljID0gZXhwb3J0cy5vcHRpbWlzdGljRGlmZihhLCBiKVxuICAgIHZhciBjaGFuZ2VzID0gW11cbiAgICBleHBvcnRzLmNodW5rKFthLCBiXSwgZnVuY3Rpb24gKGluZGV4LCB1bnN0YWJsZSkge1xuICAgICAgdmFyIGRlbCA9IHVuc3RhYmxlLnNoaWZ0KCkubGVuZ3RoXG4gICAgICB2YXIgaW5zZXJ0ID0gdW5zdGFibGUuc2hpZnQoKVxuICAgICAgY2hhbmdlcy5wdXNoKFtpbmRleCwgZGVsXS5jb25jYXQoaW5zZXJ0KSlcbiAgICB9KVxuICAgIHJldHVybiBiZXN0KG9wdGltaXN0aWMsIGNoYW5nZXMpXG4gIH1cblxuICBleHBvcnRzLnBhdGNoID0gZnVuY3Rpb24gKGEsIGNoYW5nZXMsIG11dGF0ZSkge1xuICAgIGlmKG11dGF0ZSAhPT0gdHJ1ZSkgYSA9IGEuc2xpY2UoYSkvL2NvcHkgYVxuICAgIGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hhbmdlKSB7XG4gICAgICBbXS5zcGxpY2UuYXBwbHkoYSwgY2hhbmdlKVxuICAgIH0pXG4gICAgcmV0dXJuIGFcbiAgfVxuXG4gIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29uY2VzdG9yXG4gIC8vIG1lLCBjb25jZXN0b3IsIHlvdS4uLlxuICBleHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gZ2V0QXJncyhhcmd1bWVudHMpXG4gICAgdmFyIHBhdGNoID0gZXhwb3J0cy5kaWZmMyhhcmdzKVxuICAgIHJldHVybiBleHBvcnRzLnBhdGNoKGFyZ3NbMF0sIHBhdGNoKVxuICB9XG5cbiAgZXhwb3J0cy5kaWZmMyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGdldEFyZ3MoYXJndW1lbnRzKVxuICAgIHZhciByID0gW11cbiAgICBleHBvcnRzLmNodW5rKGFyZ3MsIGZ1bmN0aW9uIChpbmRleCwgdW5zdGFibGUpIHtcbiAgICAgIHZhciBtaW5lID0gdW5zdGFibGVbMF1cbiAgICAgIHZhciBpbnNlcnQgPSByZXNvbHZlKHVuc3RhYmxlKVxuICAgICAgaWYoZXF1YWwobWluZSwgaW5zZXJ0KSkgcmV0dXJuIFxuICAgICAgci5wdXNoKFtpbmRleCwgbWluZS5sZW5ndGhdLmNvbmNhdChpbnNlcnQpKSBcbiAgICB9KVxuICAgIHJldHVybiByXG4gIH1cbiAgZXhwb3J0cy5vZGRPbmVPdXQgPVxuICAgIGZ1bmN0aW9uIG9kZE9uZU91dCAoY2hhbmdlcykge1xuICAgICAgY2hhbmdlcyA9IGNoYW5nZXMuc2xpY2UoKVxuICAgICAgLy9wdXQgdGhlIGNvbmNlc3RvciBmaXJzdFxuICAgICAgY2hhbmdlcy51bnNoaWZ0KGNoYW5nZXMuc3BsaWNlKDEsMSlbMF0pXG4gICAgICB2YXIgaSA9IG9kZEVsZW1lbnQoY2hhbmdlcywgZXF1YWwpXG4gICAgICBpZihpID09IDApIC8vIGNvbmNlc3RvciB3YXMgZGlmZmVyZW50LCAnZmFsc2UgY29uZmxpY3QnXG4gICAgICAgIHJldHVybiBjaGFuZ2VzWzFdXG4gICAgICBpZiAofmkpXG4gICAgICAgIHJldHVybiBjaGFuZ2VzW2ldIFxuICAgIH1cbiAgZXhwb3J0cy5pbnNlcnRNZXJnZU92ZXJEZWxldGUgPSBcbiAgICAvL2kndmUgaW1wbGVtZW50ZWQgdGhpcyBhcyBhIHNlcGVyYXRlIHJ1bGUsXG4gICAgLy9iZWNhdXNlIEkgaGFkIHNlY29uZCB0aG91Z2h0cyBhYm91dCB0aGlzLlxuICAgIGZ1bmN0aW9uIGluc2VydE1lcmdlT3ZlckRlbGV0ZSAoY2hhbmdlcykge1xuICAgICAgY2hhbmdlcyA9IGNoYW5nZXMuc2xpY2UoKVxuICAgICAgY2hhbmdlcy5zcGxpY2UoMSwxKS8vIHJlbW92ZSBjb25jZXN0b3JcbiAgICAgIFxuICAgICAgLy9pZiB0aGVyZSBpcyBvbmx5IG9uZSBub24gZW1wdHkgY2hhbmdlIHRoYXRzIG9rYXkuXG4gICAgICAvL2Vsc2UgZnVsbCBjb25maWxjdFxuICAgICAgZm9yICh2YXIgaSA9IDAsIG5vbmVtcHR5OyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYoY2hhbmdlc1tpXS5sZW5ndGgpIFxuICAgICAgICAgIGlmKCFub25lbXB0eSkgbm9uZW1wdHkgPSBjaGFuZ2VzW2ldXG4gICAgICAgICAgZWxzZSByZXR1cm4gLy8gZnVsbCBjb25mbGljdFxuICAgICAgcmV0dXJuIG5vbmVtcHR5XG4gICAgfVxuXG4gIHZhciBydWxlcyA9IChkZXBzICYmIGRlcHMucnVsZXMpIHx8IFtleHBvcnRzLm9kZE9uZU91dCwgZXhwb3J0cy5pbnNlcnRNZXJnZU92ZXJEZWxldGVdXG5cbiAgZnVuY3Rpb24gcmVzb2x2ZSAoY2hhbmdlcykge1xuICAgIHZhciBsID0gcnVsZXMubGVuZ3RoXG4gICAgZm9yICh2YXIgaSBpbiBydWxlcykgeyAvLyBmaXJzdFxuICAgICAgXG4gICAgICB2YXIgYyA9IHJ1bGVzW2ldICYmIHJ1bGVzW2ldKGNoYW5nZXMpXG4gICAgICBpZihjKSByZXR1cm4gY1xuICAgIH1cbiAgICBjaGFuZ2VzLnNwbGljZSgxLDEpIC8vIHJlbW92ZSBjb25jZXN0b3JcbiAgICAvL3JldHVybmluZyB0aGUgY29uZmxpY3RzIGFzIGFuIG9iamVjdCBpcyBhIHJlYWxseSBiYWQgaWRlYSxcbiAgICAvLyBiZWNhdXNlID09IHdpbGwgbm90IGRldGVjdCB0aGV5IGFyZSB0aGUgc2FtZS4gYW5kIGNvbmZsaWN0cyBidWlsZC5cbiAgICAvLyBiZXR0ZXIgdG8gdXNlXG4gICAgLy8gJzw8PDw8PDw8PDw8PDwnXG4gICAgLy8gb2YgY291cnNlLCBpIHdyb3RlIHRoaXMgYmVmb3JlIGkgc3RhcnRlZCBvbiBzbm9iLCBzbyBpIGRpZG4ndCBrbm93IHRoYXQgdGhlbi5cbiAgICAvKnZhciBjb25mbGljdCA9IFsnPj4+Pj4+Pj4+Pj4+Pj4+PiddXG4gICAgd2hpbGUoY2hhbmdlcy5sZW5ndGgpXG4gICAgICBjb25mbGljdCA9IGNvbmZsaWN0LmNvbmNhdChjaGFuZ2VzLnNoaWZ0KCkpLmNvbmNhdCgnPT09PT09PT09PT09JylcbiAgICBjb25mbGljdC5wb3AoKVxuICAgIGNvbmZsaWN0LnB1c2ggICAgICAgICAgKCc8PDw8PDw8PDw8PDw8PDwnKVxuICAgIGNoYW5nZXMudW5zaGlmdCAgICAgICAoJz4+Pj4+Pj4+Pj4+Pj4+PicpXG4gICAgcmV0dXJuIGNvbmZsaWN0Ki9cbiAgICAvL25haCwgYmV0dGVyIGlzIGp1c3QgdG8gdXNlIGFuIGVxdWFsIGNhbiBoYW5kbGUgb2JqZWN0c1xuICAgIHJldHVybiB7Jz8nOiBjaGFuZ2VzfVxuICB9XG4gIHJldHVybiBleHBvcnRzXG59XG5leHBvcnRzKG51bGwsIGV4cG9ydHMpXG4iLCJ2YXIgYWRkTGlzdGVuZXIgPSByZXF1aXJlKFwiLi9hZGQtbGlzdGVuZXIuanNcIilcbnZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZShcIi4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwdXRcblxuLy8gYG9icy5wdXRgIGlzIGEgbXV0YWJsZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXJyYXlbaW5kZXhdID0gdmFsdWVgXG4vLyB0aGF0IG11dGF0ZXMgYm90aCBgbGlzdGAgYW5kIHRoZSBpbnRlcm5hbCBgdmFsdWVMaXN0YCB0aGF0XG4vLyBpcyB0aGUgY3VycmVudCB2YWx1ZSBvZiBgb2JzYCBpdHNlbGZcbmZ1bmN0aW9uIHB1dChpbmRleCwgdmFsdWUpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciB2YWx1ZUxpc3QgPSBvYnMoKS5zbGljZSgpXG5cbiAgICB2YXIgb3JpZ2luYWxMZW5ndGggPSB2YWx1ZUxpc3QubGVuZ3RoXG4gICAgdmFsdWVMaXN0W2luZGV4XSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUoKSA6IHZhbHVlXG5cbiAgICBvYnMuX2xpc3RbaW5kZXhdID0gdmFsdWVcblxuICAgIC8vIHJlbW92ZSBwYXN0IHZhbHVlIGxpc3RlbmVyIGlmIHdhcyBvYnNlcnZcbiAgICB2YXIgcmVtb3ZlTGlzdGVuZXIgPSBvYnMuX3JlbW92ZUxpc3RlbmVyc1tpbmRleF1cbiAgICBpZiAocmVtb3ZlTGlzdGVuZXIpe1xuICAgICAgICByZW1vdmVMaXN0ZW5lcigpXG4gICAgfVxuXG4gICAgLy8gYWRkIGxpc3RlbmVyIHRvIHZhbHVlIGlmIG9ic2VydlxuICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzW2luZGV4XSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgYWRkTGlzdGVuZXIob2JzLCB2YWx1ZSkgOlxuICAgICAgICBudWxsXG5cbiAgICAvLyBmYWtlIHNwbGljZSBkaWZmXG4gICAgdmFyIHZhbHVlQXJncyA9IGluZGV4IDwgb3JpZ2luYWxMZW5ndGggPyBcbiAgICAgICAgW2luZGV4LCAxLCB2YWx1ZUxpc3RbaW5kZXhdXSA6XG4gICAgICAgIFtpbmRleCwgMCwgdmFsdWVMaXN0W2luZGV4XV1cblxuICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIFt2YWx1ZUFyZ3NdKVxuXG4gICAgb2JzLnNldCh2YWx1ZUxpc3QpXG4gICAgcmV0dXJuIHZhbHVlXG59IiwidmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbnZhciBhZGRMaXN0ZW5lciA9IHJlcXVpcmUoXCIuL2FkZC1saXN0ZW5lci5qc1wiKVxudmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNwbGljZVxuXG4vLyBgb2JzLnNwbGljZWAgaXMgYSBtdXRhYmxlIGltcGxlbWVudGF0aW9uIG9mIGBzcGxpY2UoKWBcbi8vIHRoYXQgbXV0YXRlcyBib3RoIGBsaXN0YCBhbmQgdGhlIGludGVybmFsIGB2YWx1ZUxpc3RgIHRoYXRcbi8vIGlzIHRoZSBjdXJyZW50IHZhbHVlIG9mIGBvYnNgIGl0c2VsZlxuZnVuY3Rpb24gc3BsaWNlKGluZGV4LCBhbW91bnQpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApXG4gICAgdmFyIHZhbHVlTGlzdCA9IG9icygpLnNsaWNlKClcblxuICAgIC8vIGdlbmVyYXRlIGEgbGlzdCBvZiBhcmdzIHRvIG11dGF0ZSB0aGUgaW50ZXJuYWxcbiAgICAvLyBsaXN0IG9mIG9ubHkgb2JzXG4gICAgdmFyIHZhbHVlQXJncyA9IGFyZ3MubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSAwIHx8IGluZGV4ID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11c3QgdW5wYWNrIG9ic2VydmFibGVzIHRoYXQgd2UgYXJlIGFkZGluZ1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSgpIDogdmFsdWVcbiAgICB9KVxuXG4gICAgdmFsdWVMaXN0LnNwbGljZS5hcHBseSh2YWx1ZUxpc3QsIHZhbHVlQXJncylcbiAgICAvLyB3ZSByZW1vdmUgdGhlIG9ic2VydnMgdGhhdCB3ZSByZW1vdmVcbiAgICB2YXIgcmVtb3ZlZCA9IG9icy5fbGlzdC5zcGxpY2UuYXBwbHkob2JzLl9saXN0LCBhcmdzKVxuXG4gICAgdmFyIGV4dHJhUmVtb3ZlTGlzdGVuZXJzID0gYXJncy5zbGljZSgyKS5tYXAoZnVuY3Rpb24gKG9ic2Vydikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIGFkZExpc3RlbmVyKG9icywgb2JzZXJ2KSA6XG4gICAgICAgICAgICBudWxsXG4gICAgfSlcbiAgICBleHRyYVJlbW92ZUxpc3RlbmVycy51bnNoaWZ0KGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgdmFyIHJlbW92ZWRMaXN0ZW5lcnMgPSBvYnMuX3JlbW92ZUxpc3RlbmVycy5zcGxpY2VcbiAgICAgICAgLmFwcGx5KG9icy5fcmVtb3ZlTGlzdGVuZXJzLCBleHRyYVJlbW92ZUxpc3RlbmVycylcblxuICAgIHJlbW92ZWRMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZW1vdmVPYnNlcnZMaXN0ZW5lcigpXG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZSh2YWx1ZUxpc3QsIFwiX2RpZmZcIiwgW3ZhbHVlQXJnc10pXG5cbiAgICBvYnMuc2V0KHZhbHVlTGlzdClcbiAgICByZXR1cm4gcmVtb3ZlZFxufVxuIiwidmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZShcIi4vYWRkLWxpc3RlbmVyLmpzXCIpXG52YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoXCIuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanNcIilcbnZhciBhZGlmZiA9IHJlcXVpcmUoXCJhZGlmZlwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYW5zYWN0aW9uXG5cbmZ1bmN0aW9uIHRyYW5zYWN0aW9uIChmdW5jKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgcmF3TGlzdCA9IG9icy5fbGlzdC5zbGljZSgpXG5cbiAgICBpZiAoZnVuYyhyYXdMaXN0KSAhPT0gZmFsc2UpeyAvLyBhbGxvdyBjYW5jZWxcblxuICAgICAgICB2YXIgY2hhbmdlcyA9IGFkaWZmLmRpZmYob2JzLl9saXN0LCByYXdMaXN0KVxuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gb2JzKCkuc2xpY2UoKVxuXG4gICAgICAgIHZhciB2YWx1ZUNoYW5nZXMgPSBjaGFuZ2VzLm1hcChhcHBseVBhdGNoLmJpbmQob2JzLCB2YWx1ZUxpc3QpKVxuXG4gICAgICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIHZhbHVlQ2hhbmdlcylcblxuICAgICAgICBvYnMuc2V0KHZhbHVlTGlzdClcbiAgICAgICAgcmV0dXJuIGNoYW5nZXNcbiAgICB9XG5cbn1cblxuZnVuY3Rpb24gYXBwbHlQYXRjaCAodmFsdWVMaXN0LCBhcmdzKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgdmFsdWVBcmdzID0gYXJncy5tYXAodW5wYWNrKVxuXG4gICAgdmFsdWVMaXN0LnNwbGljZS5hcHBseSh2YWx1ZUxpc3QsIHZhbHVlQXJncylcbiAgICBvYnMuX2xpc3Quc3BsaWNlLmFwcGx5KG9icy5fbGlzdCwgYXJncylcblxuICAgIHZhciBleHRyYVJlbW92ZUxpc3RlbmVycyA9IGFyZ3Muc2xpY2UoMikubWFwKGZ1bmN0aW9uIChvYnNlcnYpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBhZGRMaXN0ZW5lcihvYnMsIG9ic2VydikgOlxuICAgICAgICAgICAgbnVsbFxuICAgIH0pXG5cbiAgICBleHRyYVJlbW92ZUxpc3RlbmVycy51bnNoaWZ0KGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgdmFyIHJlbW92ZWRMaXN0ZW5lcnMgPSBvYnMuX3JlbW92ZUxpc3RlbmVycy5zcGxpY2VcbiAgICAgICAgLmFwcGx5KG9icy5fcmVtb3ZlTGlzdGVuZXJzLCBleHRyYVJlbW92ZUxpc3RlbmVycylcblxuICAgIHJlbW92ZWRMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZW1vdmVPYnNlcnZMaXN0ZW5lcigpXG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHZhbHVlQXJnc1xufVxuXG5mdW5jdGlvbiB1bnBhY2sodmFsdWUsIGluZGV4KXtcbiAgICBpZiAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHZhbHVlKCkgOiB2YWx1ZVxufSIsInZhciBPYnNlcnYgPSByZXF1aXJlKFwib2JzZXJ2XCIpXG52YXIgZXh0ZW5kID0gcmVxdWlyZShcInh0ZW5kXCIpXG5cbnZhciBibGFja0xpc3QgPSBbXCJuYW1lXCIsIFwiX2RpZmZcIiwgXCJfdHlwZVwiLCBcIl92ZXJzaW9uXCJdXG52YXIgYmxhY2tMaXN0UmVhc29ucyA9IHtcbiAgICBcIm5hbWVcIjogXCJDbGFzaGVzIHdpdGggYEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lYC5cXG5cIixcbiAgICBcIl9kaWZmXCI6IFwiX2RpZmYgaXMgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi1zdHJ1Y3QuXFxuXCIsXG4gICAgXCJfdHlwZVwiOiBcIl90eXBlIGlzIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtc3RydWN0LlxcblwiLFxuICAgIFwiX3ZlcnNpb25cIjogXCJfdmVyc2lvbiBpcyByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXN0cnVjdC5cXG5cIlxufVxudmFyIE5PX1RSQU5TQUNUSU9OID0ge31cblxuZnVuY3Rpb24gc2V0Tm9uRW51bWVyYWJsZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pXG59XG5cbi8qIE9ic2VydlN0cnVjdCA6PSAoT2JqZWN0PFN0cmluZywgT2JzZXJ2PFQ+PikgPT4gXG4gICAgT2JqZWN0PFN0cmluZywgT2JzZXJ2PFQ+PiAmXG4gICAgICAgIE9ic2VydjxPYmplY3Q8U3RyaW5nLCBUPiAmIHtcbiAgICAgICAgICAgIF9kaWZmOiBPYmplY3Q8U3RyaW5nLCBBbnk+XG4gICAgICAgIH0+XG5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydlN0cnVjdFxuXG5mdW5jdGlvbiBPYnNlcnZTdHJ1Y3Qoc3RydWN0KSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzdHJ1Y3QpXG5cbiAgICB2YXIgaW5pdGlhbFN0YXRlID0ge31cbiAgICB2YXIgY3VycmVudFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgICB2YXIgbmVzdGVkVHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGJsYWNrTGlzdC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgY3JlYXRlIGFuIG9ic2Vydi1zdHJ1Y3QgXCIgK1xuICAgICAgICAgICAgICAgIFwid2l0aCBhIGtleSBuYW1lZCAnXCIgKyBrZXkgKyBcIicuXFxuXCIgK1xuICAgICAgICAgICAgICAgIGJsYWNrTGlzdFJlYXNvbnNba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2JzZXJ2ID0gc3RydWN0W2tleV1cbiAgICAgICAgaW5pdGlhbFN0YXRlW2tleV0gPSB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgb2JzZXJ2KCkgOiBvYnNlcnZcbiAgICB9KVxuXG4gICAgdmFyIG9icyA9IE9ic2Vydihpbml0aWFsU3RhdGUpXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIG9ic2VydiA9IHN0cnVjdFtrZXldXG4gICAgICAgIG9ic1trZXldID0gb2JzZXJ2XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgb2JzZXJ2KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRUcmFuc2FjdGlvbiA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gZXh0ZW5kKG9icygpKVxuICAgICAgICAgICAgICAgIHN0YXRlW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciBkaWZmID0ge31cbiAgICAgICAgICAgICAgICBkaWZmW2tleV0gPSB2YWx1ZSAmJiB2YWx1ZS5fZGlmZiA/XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLl9kaWZmIDogdmFsdWVcblxuICAgICAgICAgICAgICAgIHNldE5vbkVudW1lcmFibGUoc3RhdGUsIFwiX2RpZmZcIiwgZGlmZilcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNhY3Rpb24gPSBzdGF0ZVxuICAgICAgICAgICAgICAgIG9icy5zZXQoc3RhdGUpXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxuICAgIHZhciBfc2V0ID0gb2JzLnNldFxuICAgIG9icy5zZXQgPSBmdW5jdGlvbiB0cmFja0RpZmYodmFsdWUpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbiA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0KHZhbHVlKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5ld1N0YXRlID0gZXh0ZW5kKHZhbHVlKVxuICAgICAgICBzZXROb25FbnVtZXJhYmxlKG5ld1N0YXRlLCBcIl9kaWZmXCIsIHZhbHVlKVxuICAgICAgICBfc2V0KG5ld1N0YXRlKVxuICAgIH1cblxuICAgIG9icyhmdW5jdGlvbiAobmV3U3RhdGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbiA9PT0gbmV3U3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnYgPSBzdHJ1Y3Rba2V5XVxuICAgICAgICAgICAgdmFyIG5ld09ic2VydlZhbHVlID0gbmV3U3RhdGVba2V5XVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICAgICAgb2JzZXJ2KCkgIT09IG5ld09ic2VydlZhbHVlXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRUcmFuc2FjdGlvbiA9IG5ld09ic2VydlZhbHVlXG4gICAgICAgICAgICAgICAgb2JzZXJ2LnNldChuZXdTdGF0ZVtrZXldKVxuICAgICAgICAgICAgICAgIG5lc3RlZFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgb2JzLl90eXBlID0gXCJvYnNlcnYtc3RydWN0XCJcbiAgICBvYnMuX3ZlcnNpb24gPSBcIjVcIlxuXG4gICAgcmV0dXJuIG9ic1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBPYnNlcnYgPSByZXF1aXJlKCdvYnNlcnYnKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcblxudmFyIE5PX1RSQU5TQUNUSU9OID0ge31cblxuT2JzZXJ2VmFyaGFzaC5Ub21ic3RvbmUgPSBuZXcgVG9tYnN0b25lKClcblxubW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZWYXJoYXNoXG5cbmZ1bmN0aW9uIE9ic2VydlZhcmhhc2ggKGhhc2gsIGNyZWF0ZVZhbHVlKSB7XG4gIGNyZWF0ZVZhbHVlID0gY3JlYXRlVmFsdWUgfHwgZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqIH1cblxuICB2YXIgaW5pdGlhbFN0YXRlID0ge31cbiAgdmFyIGN1cnJlbnRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG5cbiAgZm9yICh2YXIga2V5IGluIGhhc2gpIHtcbiAgICB2YXIgb2JzZXJ2ID0gaGFzaFtrZXldXG4gICAgY2hlY2tLZXkoa2V5KVxuICAgIGluaXRpYWxTdGF0ZVtrZXldID0gaXNGbihvYnNlcnYpID8gb2JzZXJ2KCkgOiBvYnNlcnZcbiAgfVxuXG4gIHZhciBvYnMgPSBPYnNlcnYoaW5pdGlhbFN0YXRlKVxuICBvYnMuX3JlbW92ZUxpc3RlbmVycyA9IHt9XG5cbiAgb2JzLmdldCA9IGdldC5iaW5kKG9icylcbiAgb2JzLnB1dCA9IHB1dC5iaW5kKG9icywgY3JlYXRlVmFsdWUpXG4gIG9icy5kZWxldGUgPSBkZWwuYmluZChvYnMpXG5cbiAgZm9yIChrZXkgaW4gaGFzaCkge1xuICAgIG9ic1trZXldID0gY3JlYXRlVmFsdWUoaGFzaFtrZXldLCBrZXkpXG5cbiAgICBpZiAoaXNGbihvYnNba2V5XSkpIHtcbiAgICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0gPSBvYnNba2V5XSh3YXRjaChvYnMsIGtleSwgY3VycmVudFRyYW5zYWN0aW9uKSlcbiAgICB9XG4gIH1cblxuICBvYnMoZnVuY3Rpb24gKG5ld1N0YXRlKSB7XG4gICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbiA9PT0gbmV3U3RhdGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBoYXNoKSB7XG4gICAgICB2YXIgb2JzZXJ2ID0gaGFzaFtrZXldXG5cbiAgICAgIGlmIChpc0ZuKG9ic2VydikgJiYgb2JzZXJ2KCkgIT09IG5ld1N0YXRlW2tleV0pIHtcbiAgICAgICAgb2JzZXJ2LnNldChuZXdTdGF0ZVtrZXldKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gb2JzXG59XG5cbi8vIGFjY2VzcyBhbmQgbXV0YXRlXG5mdW5jdGlvbiBnZXQgKGtleSkge1xuICByZXR1cm4gdGhpc1trZXldXG59XG5cbmZ1bmN0aW9uIHB1dCAoY3JlYXRlVmFsdWUsIGtleSwgdmFsKSB7XG4gIGNoZWNrS2V5KGtleSlcblxuICB2YXIgb2JzZXJ2ID0gY3JlYXRlVmFsdWUodmFsLCBrZXkpXG4gIHZhciBzdGF0ZSA9IGV4dGVuZCh0aGlzKCkpXG5cbiAgc3RhdGVba2V5XSA9IGlzRm4ob2JzZXJ2KSA/IG9ic2VydigpIDogb2JzZXJ2XG5cbiAgaWYgKGlzRm4odGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0pKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0oKVxuICB9XG5cbiAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0gPSBpc0ZuKG9ic2VydikgP1xuICAgIG9ic2Vydih3YXRjaCh0aGlzLCBrZXkpKSA6IG51bGxcblxuICBzZXROb25FbnVtZXJhYmxlKHN0YXRlLCAnX2RpZmYnLCBkaWZmKGtleSwgc3RhdGVba2V5XSkpXG5cbiAgdGhpcy5zZXQoc3RhdGUpXG4gIHRoaXNba2V5XSA9IG9ic2VydlxuXG4gIHJldHVybiB0aGlzXG59XG5cbmZ1bmN0aW9uIGRlbCAoa2V5KSB7XG4gIHZhciBzdGF0ZSA9IGV4dGVuZCh0aGlzKCkpXG4gIGlmIChpc0ZuKHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldKSkge1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldKClcbiAgfVxuXG4gIGRlbGV0ZSB0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XVxuICBkZWxldGUgc3RhdGVba2V5XVxuXG4gIHNldE5vbkVudW1lcmFibGUoc3RhdGUsICdfZGlmZicsIGRpZmYoa2V5LCBPYnNlcnZWYXJoYXNoLlRvbWJzdG9uZSkpXG4gIHRoaXMuc2V0KHN0YXRlKVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIHByb2Nlc3NpbmdcbmZ1bmN0aW9uIHdhdGNoIChvYnMsIGtleSwgY3VycmVudFRyYW5zYWN0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgc3RhdGUgPSBleHRlbmQob2JzKCkpXG4gICAgc3RhdGVba2V5XSA9IHZhbHVlXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHN0YXRlLCAnX2RpZmYnLCBkaWZmKGtleSwgdmFsdWUpKVxuICAgIGN1cnJlbnRUcmFuc2FjdGlvbiA9IHN0YXRlXG4gICAgb2JzLnNldChzdGF0ZSlcbiAgICBjdXJyZW50VHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuICB9XG59XG5cbmZ1bmN0aW9uIGRpZmYgKGtleSwgdmFsdWUpIHtcbiAgdmFyIG9iaiA9IHt9XG4gIG9ialtrZXldID0gdmFsdWUgJiYgdmFsdWUuX2RpZmYgPyB2YWx1ZS5fZGlmZiA6IHZhbHVlXG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gaXNGbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nXG59XG5cbmZ1bmN0aW9uIHNldE5vbkVudW1lcmFibGUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgfSlcbn1cblxuLy8gZXJyb3JzXG52YXIgYmxhY2tsaXN0ID0ge1xuICBuYW1lOiAnQ2xhc2hlcyB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUubmFtZWAuJyxcbiAgZ2V0OiAnZ2V0IGlzIGEgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi12YXJoYXNoIG1ldGhvZCcsXG4gIHB1dDogJ3B1dCBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCBtZXRob2QnLFxuICBkZWxldGU6ICdkZWxldGUgaXMgYSByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXZhcmhhc2ggbWV0aG9kJyxcbiAgX2RpZmY6ICdfZGlmZiBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCBtZXRob2QnLFxuICBfcmVtb3ZlTGlzdGVuZXJzOiAnX3JlbW92ZUxpc3RlbmVycyBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCdcbn1cblxuZnVuY3Rpb24gY2hlY2tLZXkgKGtleSkge1xuICBpZiAoIWJsYWNrbGlzdFtrZXldKSByZXR1cm5cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdjYW5ub3QgY3JlYXRlIGFuIG9ic2Vydi12YXJoYXNoIHdpdGgga2V5IGAnICsga2V5ICsgJ2AuICcgKyBibGFja2xpc3Rba2V5XVxuICApXG59XG5cbi8vIGlkZW50aWZ5IGRlbGV0ZXNcbmZ1bmN0aW9uIFRvbWJzdG9uZSAoKSB7fVxuXG5Ub21ic3RvbmUucHJvdG90eXBlLnRvSlNPTiA9IG5hbWVUb21ic3RvbmVcblRvbWJzdG9uZS5wcm90b3R5cGUuaW5zcGVjdCA9IG5hbWVUb21ic3RvbmVcblRvbWJzdG9uZS5wcm90b3R5cGUudG9TdHJpbmcgPSBuYW1lVG9tYnN0b25lXG5cbmZ1bmN0aW9uIG5hbWVUb21ic3RvbmUgKCkge1xuICByZXR1cm4gJ1tvYmplY3QgVG9tYnN0b25lXSdcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXN0cnVjdC9ub2RlX21vZHVsZXMveHRlbmQvaW5kZXguanNcIikiLCJ2YXIgT2JzZXJ2YWJsZSA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcHV0ZWRcblxuZnVuY3Rpb24gY29tcHV0ZWQob2JzZXJ2YWJsZXMsIGxhbWJkYSkge1xuICAgIHZhciB2YWx1ZXMgPSBvYnNlcnZhYmxlcy5tYXAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgcmV0dXJuIG8oKVxuICAgIH0pXG4gICAgdmFyIHJlc3VsdCA9IE9ic2VydmFibGUobGFtYmRhLmFwcGx5KG51bGwsIHZhbHVlcykpXG5cbiAgICBvYnNlcnZhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChvLCBpbmRleCkge1xuICAgICAgICBvKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICByZXN1bHQuc2V0KGxhbWJkYS5hcHBseShudWxsLCB2YWx1ZXMpKVxuICAgICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9ic2VydmFibGVcblxuZnVuY3Rpb24gT2JzZXJ2YWJsZSh2YWx1ZSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBbXVxuICAgIHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiB2YWx1ZVxuXG4gICAgb2JzZXJ2YWJsZS5zZXQgPSBmdW5jdGlvbiAodikge1xuICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgIGYodilcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gb2JzZXJ2YWJsZVxuXG4gICAgZnVuY3Rpb24gb2JzZXJ2YWJsZShsaXN0ZW5lcikge1xuICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSwgMSlcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gd2F0Y2hcblxuZnVuY3Rpb24gd2F0Y2gob2JzZXJ2YWJsZSwgbGlzdGVuZXIpIHtcbiAgICB2YXIgcmVtb3ZlID0gb2JzZXJ2YWJsZShsaXN0ZW5lcilcbiAgICBsaXN0ZW5lcihvYnNlcnZhYmxlKCkpXG4gICAgcmV0dXJuIHJlbW92ZVxufVxuIiwidmFyIERlbGVnYXRvciA9IHJlcXVpcmUoJ2RvbS1kZWxlZ2F0b3InKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudFxuXG5mdW5jdGlvbiBCYXNlRXZlbnQobGFtYmRhKSB7XG4gICAgcmV0dXJuIEV2ZW50SGFuZGxlcjtcblxuICAgIGZ1bmN0aW9uIEV2ZW50SGFuZGxlcihmbiwgZGF0YSwgb3B0cykge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHtcbiAgICAgICAgICAgIGZuOiBmbixcbiAgICAgICAgICAgIGRhdGE6IGRhdGEgfHwge30sXG4gICAgICAgICAgICBvcHRzOiBvcHRzIHx8IHt9LFxuICAgICAgICAgICAgaGFuZGxlRXZlbnQ6IGhhbmRsZUV2ZW50XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm4gJiYgZm4udHlwZSA9PT0gJ2RvbS1kZWxlZ2F0b3ItaGFuZGxlJykge1xuICAgICAgICAgICAgcmV0dXJuIERlbGVnYXRvci50cmFuc2Zvcm1IYW5kbGUoZm4sXG4gICAgICAgICAgICAgICAgaGFuZGxlTGFtYmRhLmJpbmQoaGFuZGxlcikpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVMYW1iZGEoZXYpIHtcbiAgICAgICAgcmV0dXJuIGxhbWJkYS5jYWxsKHRoaXMsIGV2KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGxhbWJkYS5jYWxsKHRoaXMsIGV2KVxuICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5mbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhpcy5mbih2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZm4ud3JpdGUodmFsdWUpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGdldEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhLXNldC9lbGVtZW50JylcblxudmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpXG5cbnZhciBWQUxJRF9DSEFOR0UgPSBbJ2NoZWNrYm94JywgJ2ZpbGUnXTtcbnZhciBWQUxJRF9JTlBVVCA9IFsnY29sb3InLCAnZGF0ZScsICdkYXRldGltZScsICdkYXRldGltZS1sb2NhbCcsICdlbWFpbCcsXG4gICAgJ21vbnRoJywgJ251bWJlcicsICdwYXNzd29yZCcsICdyYW5nZScsICdzZWFyY2gnLCAndGVsJywgJ3RleHQnLCAndGltZScsXG4gICAgJ3VybCcsICd3ZWVrJ107XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KGNoYW5nZUxhbWJkYSk7XG5cbmZ1bmN0aW9uIGNoYW5nZUxhbWJkYShldikge1xuICAgIHZhciB0YXJnZXQgPSBldi50YXJnZXRcblxuICAgIHZhciBpc1ZhbGlkID1cbiAgICAgICAgKGV2LnR5cGUgPT09ICdpbnB1dCcgJiYgVkFMSURfSU5QVVQuaW5kZXhPZih0YXJnZXQudHlwZSkgIT09IC0xKSB8fFxuICAgICAgICAoZXYudHlwZSA9PT0gJ2NoYW5nZScgJiYgVkFMSURfQ0hBTkdFLmluZGV4T2YodGFyZ2V0LnR5cGUpICE9PSAtMSk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgaWYgKGV2LnN0YXJ0UHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGV2LnN0YXJ0UHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IGdldEZvcm1EYXRhKGV2LmN1cnJlbnRUYXJnZXQpXG4gICAgdmFyIGRhdGEgPSBleHRlbmQodmFsdWUsIHRoaXMuZGF0YSlcblxuICAgIHJldHVybiBkYXRhXG59XG4iLCJ2YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KGV2ZW50TGFtYmRhKTtcblxuZnVuY3Rpb24gZXZlbnRMYW1iZGEoZXYpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhO1xufVxuIiwidmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChrZXlMYW1iZGEpO1xuXG5mdW5jdGlvbiBrZXlMYW1iZGEoZXYpIHtcbiAgICB2YXIga2V5ID0gdGhpcy5vcHRzLmtleTtcblxuICAgIGlmIChldi5rZXlDb2RlID09PSBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcbiAgICB9XG59XG4iLCJ2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcblxubW9kdWxlLmV4cG9ydHMgPSBpdGVyYXRpdmVseVdhbGtcblxuZnVuY3Rpb24gaXRlcmF0aXZlbHlXYWxrKG5vZGVzLCBjYikge1xuICAgIGlmICghKCdsZW5ndGgnIGluIG5vZGVzKSkge1xuICAgICAgICBub2RlcyA9IFtub2Rlc11cbiAgICB9XG4gICAgXG4gICAgbm9kZXMgPSBzbGljZS5jYWxsKG5vZGVzKVxuXG4gICAgd2hpbGUobm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBub2RlID0gbm9kZXMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJldCA9IGNiKG5vZGUpXG5cbiAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgICAgcmV0dXJuIHJldFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcyAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBub2RlcyA9IHNsaWNlLmNhbGwobm9kZS5jaGlsZE5vZGVzKS5jb25jYXQobm9kZXMpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgd2FsayA9IHJlcXVpcmUoJ2RvbS13YWxrJylcblxudmFyIEZvcm1EYXRhID0gcmVxdWlyZSgnLi9pbmRleC5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0Rm9ybURhdGFcblxuZnVuY3Rpb24gYnVpbGRFbGVtcyhyb290RWxlbSkge1xuICAgIHZhciBoYXNoID0ge31cblxuICAgIHdhbGsocm9vdEVsZW0sIGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQubmFtZSkge1xuICAgICAgICAgICAgaGFzaFtjaGlsZC5uYW1lXSA9IGNoaWxkXG4gICAgICAgIH1cbiAgICB9KVxuXG5cbiAgICByZXR1cm4gaGFzaFxufVxuXG5mdW5jdGlvbiBnZXRGb3JtRGF0YShyb290RWxlbSkge1xuICAgIHZhciBlbGVtZW50cyA9IGJ1aWxkRWxlbXMocm9vdEVsZW0pXG5cbiAgICByZXR1cm4gRm9ybURhdGEoZWxlbWVudHMpXG59XG4iLCIvKmpzaGludCBtYXhjb21wbGV4aXR5OiAxMCovXG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybURhdGFcblxuLy9UT0RPOiBNYXNzaXZlIHNwZWM6IGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2Fzc29jaWF0aW9uLW9mLWNvbnRyb2xzLWFuZC1mb3Jtcy5odG1sI2NvbnN0cnVjdGluZy1mb3JtLWRhdGEtc2V0XG5mdW5jdGlvbiBGb3JtRGF0YShlbGVtZW50cykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhlbGVtZW50cykucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgICAgICB2YXIgZWxlbSA9IGVsZW1lbnRzW2tleV1cblxuICAgICAgICBhY2Nba2V5XSA9IHZhbHVlT2ZFbGVtZW50KGVsZW0pXG5cbiAgICAgICAgcmV0dXJuIGFjY1xuICAgIH0sIHt9KVxufVxuXG5mdW5jdGlvbiB2YWx1ZU9mRWxlbWVudChlbGVtKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0oKVxuICAgIH0gZWxzZSBpZiAoY29udGFpbnNSYWRpbyhlbGVtKSkge1xuICAgICAgICB2YXIgZWxlbXMgPSB0b0xpc3QoZWxlbSlcbiAgICAgICAgdmFyIGNoZWNrZWQgPSBlbGVtcy5maWx0ZXIoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmNoZWNrZWRcbiAgICAgICAgfSlbMF0gfHwgbnVsbFxuXG4gICAgICAgIHJldHVybiBjaGVja2VkID8gY2hlY2tlZC52YWx1ZSA6IG51bGxcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZWxlbSkpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0ubWFwKHZhbHVlT2ZFbGVtZW50KS5maWx0ZXIoZmlsdGVyTnVsbClcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gdW5kZWZpbmVkICYmIGVsZW0ubm9kZVR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gRm9ybURhdGEoZWxlbSlcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJJTlBVVFwiICYmIGlzQ2hlY2tlZChlbGVtKSkge1xuICAgICAgICBpZiAoZWxlbS5oYXNBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0uY2hlY2tlZCA/IGVsZW0udmFsdWUgOiBudWxsXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbS5jaGVja2VkXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJJTlBVVFwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnZhbHVlXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgICByZXR1cm4gZWxlbS52YWx1ZVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSBcIlNFTEVDVFwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnZhbHVlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0NoZWNrZWQoZWxlbSkge1xuICAgIHJldHVybiBlbGVtLnR5cGUgPT09IFwiY2hlY2tib3hcIiB8fCBlbGVtLnR5cGUgPT09IFwicmFkaW9cIlxufVxuXG5mdW5jdGlvbiBjb250YWluc1JhZGlvKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlLnRhZ05hbWUgfHwgdmFsdWUubm9kZVR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIGVsZW1zID0gdG9MaXN0KHZhbHVlKVxuXG4gICAgcmV0dXJuIGVsZW1zLnNvbWUoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIGVsZW0udGFnTmFtZSA9PT0gXCJJTlBVVFwiICYmIGVsZW0udHlwZSA9PT0gXCJyYWRpb1wiXG4gICAgfSlcbn1cblxuZnVuY3Rpb24gdG9MaXN0KHZhbHVlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKHByb3AsIHZhbHVlKVxufVxuXG5mdW5jdGlvbiBwcm9wKHgpIHtcbiAgICByZXR1cm4gdGhpc1t4XVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJOdWxsKHZhbCkge1xuICAgIHJldHVybiB2YWwgIT09IG51bGxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaGFzS2V5c1xuXG5mdW5jdGlvbiBoYXNLZXlzKHNvdXJjZSkge1xuICAgIHJldHVybiBzb3VyY2UgIT09IG51bGwgJiZcbiAgICAgICAgKHR5cGVvZiBzb3VyY2UgPT09IFwib2JqZWN0XCIgfHxcbiAgICAgICAgdHlwZW9mIHNvdXJjZSA9PT0gXCJmdW5jdGlvblwiKVxufVxuIiwidmFyIGhhc0tleXMgPSByZXF1aXJlKFwiLi9oYXMta2V5c1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgaWYgKCFoYXNLZXlzKHNvdXJjZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGdldEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhLXNldC9lbGVtZW50JylcblxudmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG52YXIgRU5URVIgPSAxM1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChzdWJtaXRMYW1iZGEpO1xuXG5mdW5jdGlvbiBzdWJtaXRMYW1iZGEoZXYpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXYudGFyZ2V0XG5cbiAgICB2YXIgaXNWYWxpZCA9XG4gICAgICAgIChldi50eXBlID09PSAnY2xpY2snICYmIHRhcmdldC50YWdOYW1lID09PSAnQlVUVE9OJykgfHxcbiAgICAgICAgKGV2LnR5cGUgPT09ICdjbGljaycgJiYgdGFyZ2V0LnR5cGUgPT09ICdzdWJtaXQnKSB8fFxuICAgICAgICAoXG4gICAgICAgICAgICAodGFyZ2V0LnR5cGUgPT09ICd0ZXh0JykgJiZcbiAgICAgICAgICAgIChldi5rZXlDb2RlID09PSBFTlRFUiAmJiBldi50eXBlID09PSAna2V5ZG93bicpXG4gICAgICAgIClcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICBpZiAoZXYuc3RhcnRQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgZXYuc3RhcnRQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybURhdGEoZXYuY3VycmVudFRhcmdldClcbiAgICB2YXIgZGF0YSA9IGV4dGVuZCh2YWx1ZSwgdGhpcy5kYXRhKVxuXG4gICAgaWYgKGV2LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGdldEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhLXNldC9lbGVtZW50JylcblxudmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudCh2YWx1ZUxhbWJkYSk7XG5cbmZ1bmN0aW9uIHZhbHVlTGFtYmRhKGV2KSB7XG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybURhdGEoZXYuY3VycmVudFRhcmdldClcbiAgICB2YXIgZGF0YSA9IGV4dGVuZCh2YWx1ZSwgdGhpcy5kYXRhKVxuXG4gICAgcmV0dXJuIGRhdGE7XG59XG4iLCJmdW5jdGlvbiBUaHVuayhmbiwgYXJncywga2V5LCBlcUFyZ3MpIHtcclxuICAgIHRoaXMuZm4gPSBmbjtcclxuICAgIHRoaXMuYXJncyA9IGFyZ3M7XHJcbiAgICB0aGlzLmtleSA9IGtleTtcclxuICAgIHRoaXMuZXFBcmdzID0gZXFBcmdzO1xyXG59XHJcblxyXG5UaHVuay5wcm90b3R5cGUudHlwZSA9ICdUaHVuayc7XHJcblRodW5rLnByb3RvdHlwZS5yZW5kZXIgPSByZW5kZXI7XHJcbm1vZHVsZS5leHBvcnRzID0gVGh1bms7XHJcblxyXG5mdW5jdGlvbiBzaG91bGRVcGRhdGUoY3VycmVudCwgcHJldmlvdXMpIHtcclxuICAgIGlmICghY3VycmVudCB8fCAhcHJldmlvdXMgfHwgY3VycmVudC5mbiAhPT0gcHJldmlvdXMuZm4pIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2FyZ3MgPSBjdXJyZW50LmFyZ3M7XHJcbiAgICB2YXIgcGFyZ3MgPSBwcmV2aW91cy5hcmdzO1xyXG5cclxuICAgIHJldHVybiAhY3VycmVudC5lcUFyZ3MoY2FyZ3MsIHBhcmdzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKHByZXZpb3VzKSB7XHJcbiAgICBpZiAoc2hvdWxkVXBkYXRlKHRoaXMsIHByZXZpb3VzKSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZuLmFwcGx5KG51bGwsIHRoaXMuYXJncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBwcmV2aW91cy52bm9kZTtcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgUGFydGlhbCA9IHJlcXVpcmUoJy4vcGFydGlhbCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWFsKCk7XHJcbiIsInZhciBzaGFsbG93RXEgPSByZXF1aXJlKCcuL3NoYWxsb3ctZXEnKTtcbnZhciBUaHVuayA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlLXRodW5rJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUGFydGlhbDtcblxuZnVuY3Rpb24gY3JlYXRlUGFydGlhbChlcSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBwYXJ0aWFsKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gY29weU92ZXIoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgdmFyIGZpcnN0QXJnID0gYXJnc1swXTtcbiAgICAgICAgdmFyIGtleTtcblxuICAgICAgICB2YXIgZXFBcmdzID0gZXEgfHwgc2hhbGxvd0VxO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdvYmplY3QnICYmIGZpcnN0QXJnICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoJ2tleScgaW4gZmlyc3RBcmcpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBmaXJzdEFyZy5rZXk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCdpZCcgaW4gZmlyc3RBcmcpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBmaXJzdEFyZy5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgVGh1bmsoZm4sIGFyZ3MsIGtleSwgZXFBcmdzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjb3B5T3ZlcihsaXN0LCBvZmZzZXQpIHtcbiAgICB2YXIgbmV3TGlzdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gb2Zmc2V0OyBpLS0pIHtcbiAgICAgICAgbmV3TGlzdFtpIC0gb2Zmc2V0XSA9IGxpc3RbaV07XG4gICAgfVxuICAgIHJldHVybiBuZXdMaXN0O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBzaGFsbG93RXE7XHJcblxyXG5mdW5jdGlvbiBzaGFsbG93RXEoY3VycmVudEFyZ3MsIHByZXZpb3VzQXJncykge1xyXG4gICAgaWYgKGN1cnJlbnRBcmdzLmxlbmd0aCA9PT0gMCAmJiBwcmV2aW91c0FyZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN1cnJlbnRBcmdzLmxlbmd0aCAhPT0gcHJldmlvdXNBcmdzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGVuID0gY3VycmVudEFyZ3MubGVuZ3RoO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBpZiAoY3VycmVudEFyZ3NbaV0gIT09IHByZXZpb3VzQXJnc1tpXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoXCJpcy1vYmplY3RcIilcbnZhciBpc0hvb2sgPSByZXF1aXJlKFwidnRyZWUvaXMtdmhvb2tcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVByb3BlcnRpZXNcblxuZnVuY3Rpb24gYXBwbHlQcm9wZXJ0aWVzKG5vZGUsIHByb3BzLCBwcmV2aW91cykge1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV1cblxuICAgICAgICBpZiAocHJvcFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlbW92ZVByb3BlcnR5KG5vZGUsIHByb3BzLCBwcmV2aW91cywgcHJvcE5hbWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSG9vayhwcm9wVmFsdWUpKSB7XG4gICAgICAgICAgICBwcm9wVmFsdWUuaG9vayhub2RlLFxuICAgICAgICAgICAgICAgIHByb3BOYW1lLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzID8gcHJldmlvdXNbcHJvcE5hbWVdIDogdW5kZWZpbmVkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaE9iamVjdChub2RlLCBwcm9wcywgcHJldmlvdXMsIHByb3BOYW1lLCBwcm9wVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gcHJvcFZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByb3BlcnR5KG5vZGUsIHByb3BzLCBwcmV2aW91cywgcHJvcE5hbWUpIHtcbiAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzVmFsdWUgPSBwcmV2aW91c1twcm9wTmFtZV1cblxuICAgICAgICBpZiAoIWlzSG9vayhwcmV2aW91c1ZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHByb3BOYW1lID09PSBcInN0eWxlXCIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHlsZVtpXSA9IFwiXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcmV2aW91c1ZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBcIlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXRjaE9iamVjdChub2RlLCBwcm9wcywgcHJldmlvdXMsIHByb3BOYW1lLCBwcm9wVmFsdWUpIHtcbiAgICBpZihwcmV2aW91cyAmJiBpc09iamVjdChwcmV2aW91c1twcm9wTmFtZV0pICYmXG4gICAgICAgIGdldFByb3RvdHlwZShwcmV2aW91c1twcm9wTmFtZV0pICE9PSBnZXRQcm90b3R5cGUocHJvcFZhbHVlKSkge1xuICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHByZXZpb3VzVmFsdWVcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFpc09iamVjdChub2RlW3Byb3BOYW1lXSkpIHtcbiAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSB7fVxuICAgIH1cblxuICAgIHZhciByZXBsYWNlciA9IHByb3BOYW1lID09PSBcInN0eWxlXCIgPyBcIlwiIDogdW5kZWZpbmVkXG5cbiAgICBmb3IgKHZhciBrIGluIHByb3BWYWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwcm9wVmFsdWVba11cbiAgICAgICAgbm9kZVtwcm9wTmFtZV1ba10gPSAodmFsdWUgPT09IHVuZGVmaW5lZCkgPyByZXBsYWNlciA6IHZhbHVlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpXG4gICAgfSBlbHNlIGlmICh2YWx1ZS5fX3Byb3RvX18pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLl9fcHJvdG9fX1xuICAgIH0gZWxzZSBpZiAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZVxuICAgIH1cbn1cbiIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcblxudmFyIGFwcGx5UHJvcGVydGllcyA9IHJlcXVpcmUoXCIuL2FwcGx5LXByb3BlcnRpZXNcIilcblxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwidnRyZWUvaXMtdm5vZGVcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcInZ0cmVlL2lzLXZ0ZXh0XCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwidnRyZWUvaXMtd2lkZ2V0XCIpXG52YXIgaGFuZGxlVGh1bmsgPSByZXF1aXJlKFwidnRyZWUvaGFuZGxlLXRodW5rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRWxlbWVudFxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHZub2RlLCBvcHRzKSB7XG4gICAgdmFyIGRvYyA9IG9wdHMgPyBvcHRzLmRvY3VtZW50IHx8IGRvY3VtZW50IDogZG9jdW1lbnRcbiAgICB2YXIgd2FybiA9IG9wdHMgPyBvcHRzLndhcm4gOiBudWxsXG5cbiAgICB2bm9kZSA9IGhhbmRsZVRodW5rKHZub2RlKS5hXG5cbiAgICBpZiAoaXNXaWRnZXQodm5vZGUpKSB7XG4gICAgICAgIHJldHVybiB2bm9kZS5pbml0KClcbiAgICB9IGVsc2UgaWYgKGlzVlRleHQodm5vZGUpKSB7XG4gICAgICAgIHJldHVybiBkb2MuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dClcbiAgICB9IGVsc2UgaWYgKCFpc1ZOb2RlKHZub2RlKSkge1xuICAgICAgICBpZiAod2Fybikge1xuICAgICAgICAgICAgd2FybihcIkl0ZW0gaXMgbm90IGEgdmFsaWQgdmlydHVhbCBkb20gbm9kZVwiLCB2bm9kZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBub2RlID0gKHZub2RlLm5hbWVzcGFjZSA9PT0gbnVsbCkgP1xuICAgICAgICBkb2MuY3JlYXRlRWxlbWVudCh2bm9kZS50YWdOYW1lKSA6XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50TlModm5vZGUubmFtZXNwYWNlLCB2bm9kZS50YWdOYW1lKVxuXG4gICAgdmFyIHByb3BzID0gdm5vZGUucHJvcGVydGllc1xuICAgIGFwcGx5UHJvcGVydGllcyhub2RlLCBwcm9wcylcblxuICAgIHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZE5vZGUgPSBjcmVhdGVFbGVtZW50KGNoaWxkcmVuW2ldLCBvcHRzKVxuICAgICAgICBpZiAoY2hpbGROb2RlKSB7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGNoaWxkTm9kZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBub2RlXG59XG4iLCIvLyBNYXBzIGEgdmlydHVhbCBET00gdHJlZSBvbnRvIGEgcmVhbCBET00gdHJlZSBpbiBhbiBlZmZpY2llbnQgbWFubmVyLlxuLy8gV2UgZG9uJ3Qgd2FudCB0byByZWFkIGFsbCBvZiB0aGUgRE9NIG5vZGVzIGluIHRoZSB0cmVlIHNvIHdlIHVzZVxuLy8gdGhlIGluLW9yZGVyIHRyZWUgaW5kZXhpbmcgdG8gZWxpbWluYXRlIHJlY3Vyc2lvbiBkb3duIGNlcnRhaW4gYnJhbmNoZXMuXG4vLyBXZSBvbmx5IHJlY3Vyc2UgaW50byBhIERPTSBub2RlIGlmIHdlIGtub3cgdGhhdCBpdCBjb250YWlucyBhIGNoaWxkIG9mXG4vLyBpbnRlcmVzdC5cblxudmFyIG5vQ2hpbGQgPSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUluZGV4XG5cbmZ1bmN0aW9uIGRvbUluZGV4KHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2Rlcykge1xuICAgIGlmICghaW5kaWNlcyB8fCBpbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge31cbiAgICB9IGVsc2Uge1xuICAgICAgICBpbmRpY2VzLnNvcnQoYXNjZW5kaW5nKVxuICAgICAgICByZXR1cm4gcmVjdXJzZShyb290Tm9kZSwgdHJlZSwgaW5kaWNlcywgbm9kZXMsIDApXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWN1cnNlKHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2Rlcywgcm9vdEluZGV4KSB7XG4gICAgbm9kZXMgPSBub2RlcyB8fCB7fVxuXG5cbiAgICBpZiAocm9vdE5vZGUpIHtcbiAgICAgICAgaWYgKGluZGV4SW5SYW5nZShpbmRpY2VzLCByb290SW5kZXgsIHJvb3RJbmRleCkpIHtcbiAgICAgICAgICAgIG5vZGVzW3Jvb3RJbmRleF0gPSByb290Tm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZDaGlsZHJlbiA9IHRyZWUuY2hpbGRyZW5cblxuICAgICAgICBpZiAodkNoaWxkcmVuKSB7XG5cbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGVzID0gcm9vdE5vZGUuY2hpbGROb2Rlc1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByb290SW5kZXggKz0gMVxuXG4gICAgICAgICAgICAgICAgdmFyIHZDaGlsZCA9IHZDaGlsZHJlbltpXSB8fCBub0NoaWxkXG4gICAgICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IHJvb3RJbmRleCArICh2Q2hpbGQuY291bnQgfHwgMClcblxuICAgICAgICAgICAgICAgIC8vIHNraXAgcmVjdXJzaW9uIGRvd24gdGhlIHRyZWUgaWYgdGhlcmUgYXJlIG5vIG5vZGVzIGRvd24gaGVyZVxuICAgICAgICAgICAgICAgIGlmIChpbmRleEluUmFuZ2UoaW5kaWNlcywgcm9vdEluZGV4LCBuZXh0SW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Vyc2UoY2hpbGROb2Rlc1tpXSwgdkNoaWxkLCBpbmRpY2VzLCBub2Rlcywgcm9vdEluZGV4KVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJvb3RJbmRleCA9IG5leHRJbmRleFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzXG59XG5cbi8vIEJpbmFyeSBzZWFyY2ggZm9yIGFuIGluZGV4IGluIHRoZSBpbnRlcnZhbCBbbGVmdCwgcmlnaHRdXG5mdW5jdGlvbiBpbmRleEluUmFuZ2UoaW5kaWNlcywgbGVmdCwgcmlnaHQpIHtcbiAgICBpZiAoaW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIG1pbkluZGV4ID0gMFxuICAgIHZhciBtYXhJbmRleCA9IGluZGljZXMubGVuZ3RoIC0gMVxuICAgIHZhciBjdXJyZW50SW5kZXhcbiAgICB2YXIgY3VycmVudEl0ZW1cblxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xuICAgICAgICBjdXJyZW50SW5kZXggPSAoKG1heEluZGV4ICsgbWluSW5kZXgpIC8gMikgPj4gMFxuICAgICAgICBjdXJyZW50SXRlbSA9IGluZGljZXNbY3VycmVudEluZGV4XVxuXG4gICAgICAgIGlmIChtaW5JbmRleCA9PT0gbWF4SW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SXRlbSA+PSBsZWZ0ICYmIGN1cnJlbnRJdGVtIDw9IHJpZ2h0XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEl0ZW0gPCBsZWZ0KSB7XG4gICAgICAgICAgICBtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDFcbiAgICAgICAgfSBlbHNlICBpZiAoY3VycmVudEl0ZW0gPiByaWdodCkge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBjdXJyZW50SW5kZXggLSAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICAgIHJldHVybiBhID4gYiA/IDEgOiAtMVxufVxuIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanNcIikiLCJtb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwib2JqZWN0XCIgJiYgeCAhPT0gbnVsbFxufVxuIiwidmFyIG5hdGl2ZUlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlSXNBcnJheSB8fCBpc0FycmF5XG5cbmZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiXG59XG4iLCJ2YXIgYXBwbHlQcm9wZXJ0aWVzID0gcmVxdWlyZShcIi4vYXBwbHktcHJvcGVydGllc1wiKVxuXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwidnRyZWUvaXMtd2lkZ2V0XCIpXG52YXIgVlBhdGNoID0gcmVxdWlyZShcInZ0cmVlL3ZwYXRjaFwiKVxuXG52YXIgcmVuZGVyID0gcmVxdWlyZShcIi4vY3JlYXRlLWVsZW1lbnRcIilcbnZhciB1cGRhdGVXaWRnZXQgPSByZXF1aXJlKFwiLi91cGRhdGUtd2lkZ2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHlQYXRjaFxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHZwYXRjaCwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciB0eXBlID0gdnBhdGNoLnR5cGVcbiAgICB2YXIgdk5vZGUgPSB2cGF0Y2gudk5vZGVcbiAgICB2YXIgcGF0Y2ggPSB2cGF0Y2gucGF0Y2hcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFZQYXRjaC5SRU1PVkU6XG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlTm9kZShkb21Ob2RlLCB2Tm9kZSlcbiAgICAgICAgY2FzZSBWUGF0Y2guSU5TRVJUOlxuICAgICAgICAgICAgcmV0dXJuIGluc2VydE5vZGUoZG9tTm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLlZURVhUOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ1BhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guV0lER0VUOlxuICAgICAgICAgICAgcmV0dXJuIHdpZGdldFBhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guVk5PREU6XG4gICAgICAgICAgICByZXR1cm4gdk5vZGVQYXRjaChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLk9SREVSOlxuICAgICAgICAgICAgcmVvcmRlckNoaWxkcmVuKGRvbU5vZGUsIHBhdGNoKVxuICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGVcbiAgICAgICAgY2FzZSBWUGF0Y2guUFJPUFM6XG4gICAgICAgICAgICBhcHBseVByb3BlcnRpZXMoZG9tTm9kZSwgcGF0Y2gsIHZOb2RlLnByb3BlcnRpZXMpXG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgICAgICBjYXNlIFZQYXRjaC5USFVOSzpcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlUm9vdChkb21Ob2RlLFxuICAgICAgICAgICAgICAgIHJlbmRlck9wdGlvbnMucGF0Y2goZG9tTm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpKVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGUoZG9tTm9kZSwgdk5vZGUpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuXG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2RlKVxuICAgIH1cblxuICAgIGRlc3Ryb3lXaWRnZXQoZG9tTm9kZSwgdk5vZGUpO1xuXG4gICAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gaW5zZXJ0Tm9kZShwYXJlbnROb2RlLCB2Tm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBuZXdOb2RlID0gcmVuZGVyKHZOb2RlLCByZW5kZXJPcHRpb25zKVxuXG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChuZXdOb2RlKVxuICAgIH1cblxuICAgIHJldHVybiBwYXJlbnROb2RlXG59XG5cbmZ1bmN0aW9uIHN0cmluZ1BhdGNoKGRvbU5vZGUsIGxlZnRWTm9kZSwgdlRleHQsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgbmV3Tm9kZVxuXG4gICAgaWYgKGRvbU5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgZG9tTm9kZS5yZXBsYWNlRGF0YSgwLCBkb21Ob2RlLmxlbmd0aCwgdlRleHQudGV4dClcbiAgICAgICAgbmV3Tm9kZSA9IGRvbU5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgICAgICBuZXdOb2RlID0gcmVuZGVyKHZUZXh0LCByZW5kZXJPcHRpb25zKVxuXG4gICAgICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBkb21Ob2RlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCBsZWZ0Vk5vZGUpXG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiB3aWRnZXRQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHdpZGdldCwgcmVuZGVyT3B0aW9ucykge1xuICAgIGlmICh1cGRhdGVXaWRnZXQobGVmdFZOb2RlLCB3aWRnZXQpKSB7XG4gICAgICAgIHJldHVybiB3aWRnZXQudXBkYXRlKGxlZnRWTm9kZSwgZG9tTm9kZSkgfHwgZG9tTm9kZVxuICAgIH1cblxuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIG5ld1dpZGdldCA9IHJlbmRlcih3aWRnZXQsIHJlbmRlck9wdGlvbnMpXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdXaWRnZXQsIGRvbU5vZGUpXG4gICAgfVxuXG4gICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCBsZWZ0Vk5vZGUpXG5cbiAgICByZXR1cm4gbmV3V2lkZ2V0XG59XG5cbmZ1bmN0aW9uIHZOb2RlUGF0Y2goZG9tTm9kZSwgbGVmdFZOb2RlLCB2Tm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIG5ld05vZGUgPSByZW5kZXIodk5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBkb21Ob2RlKVxuICAgIH1cblxuICAgIGRlc3Ryb3lXaWRnZXQoZG9tTm9kZSwgbGVmdFZOb2RlKVxuXG4gICAgcmV0dXJuIG5ld05vZGVcbn1cblxuZnVuY3Rpb24gZGVzdHJveVdpZGdldChkb21Ob2RlLCB3KSB7XG4gICAgaWYgKHR5cGVvZiB3LmRlc3Ryb3kgPT09IFwiZnVuY3Rpb25cIiAmJiBpc1dpZGdldCh3KSkge1xuICAgICAgICB3LmRlc3Ryb3koZG9tTm9kZSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlb3JkZXJDaGlsZHJlbihkb21Ob2RlLCBiSW5kZXgpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBbXVxuICAgIHZhciBjaGlsZE5vZGVzID0gZG9tTm9kZS5jaGlsZE5vZGVzXG4gICAgdmFyIGxlbiA9IGNoaWxkTm9kZXMubGVuZ3RoXG4gICAgdmFyIGlcbiAgICB2YXIgcmV2ZXJzZUluZGV4ID0gYkluZGV4LnJldmVyc2VcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGRvbU5vZGUuY2hpbGROb2Rlc1tpXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zZXJ0T2Zmc2V0ID0gMFxuICAgIHZhciBtb3ZlXG4gICAgdmFyIG5vZGVcbiAgICB2YXIgaW5zZXJ0Tm9kZVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBtb3ZlID0gYkluZGV4W2ldXG4gICAgICAgIGlmIChtb3ZlICE9PSB1bmRlZmluZWQgJiYgbW92ZSAhPT0gaSkge1xuICAgICAgICAgICAgLy8gdGhlIGVsZW1lbnQgY3VycmVudGx5IGF0IHRoaXMgaW5kZXggd2lsbCBiZSBtb3ZlZCBsYXRlciBzbyBpbmNyZWFzZSB0aGUgaW5zZXJ0IG9mZnNldFxuICAgICAgICAgICAgaWYgKHJldmVyc2VJbmRleFtpXSA+IGkpIHtcbiAgICAgICAgICAgICAgICBpbnNlcnRPZmZzZXQrK1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub2RlID0gY2hpbGRyZW5bbW92ZV1cbiAgICAgICAgICAgIGluc2VydE5vZGUgPSBjaGlsZE5vZGVzW2kgKyBpbnNlcnRPZmZzZXRdXG4gICAgICAgICAgICBpZiAobm9kZSAhPT0gaW5zZXJ0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGRvbU5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGluc2VydE5vZGUpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoZSBtb3ZlZCBlbGVtZW50IGNhbWUgZnJvbSB0aGUgZnJvbnQgb2YgdGhlIGFycmF5IHNvIHJlZHVjZSB0aGUgaW5zZXJ0IG9mZnNldFxuICAgICAgICAgICAgaWYgKG1vdmUgPCBpKSB7XG4gICAgICAgICAgICAgICAgaW5zZXJ0T2Zmc2V0LS1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVsZW1lbnQgYXQgdGhpcyBpbmRleCBpcyBzY2hlZHVsZWQgdG8gYmUgcmVtb3ZlZCBzbyBpbmNyZWFzZSBpbnNlcnQgb2Zmc2V0XG4gICAgICAgIGlmIChpIGluIGJJbmRleC5yZW1vdmVzKSB7XG4gICAgICAgICAgICBpbnNlcnRPZmZzZXQrK1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXBsYWNlUm9vdChvbGRSb290LCBuZXdSb290KSB7XG4gICAgaWYgKG9sZFJvb3QgJiYgbmV3Um9vdCAmJiBvbGRSb290ICE9PSBuZXdSb290ICYmIG9sZFJvb3QucGFyZW50Tm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhvbGRSb290KVxuICAgICAgICBvbGRSb290LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld1Jvb3QsIG9sZFJvb3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld1Jvb3Q7XG59XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKFwiZ2xvYmFsL2RvY3VtZW50XCIpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoXCJ4LWlzLWFycmF5XCIpXG5cbnZhciBkb21JbmRleCA9IHJlcXVpcmUoXCIuL2RvbS1pbmRleFwiKVxudmFyIHBhdGNoT3AgPSByZXF1aXJlKFwiLi9wYXRjaC1vcFwiKVxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaFxuXG5mdW5jdGlvbiBwYXRjaChyb290Tm9kZSwgcGF0Y2hlcykge1xuICAgIHJldHVybiBwYXRjaFJlY3Vyc2l2ZShyb290Tm9kZSwgcGF0Y2hlcylcbn1cblxuZnVuY3Rpb24gcGF0Y2hSZWN1cnNpdmUocm9vdE5vZGUsIHBhdGNoZXMsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgaW5kaWNlcyA9IHBhdGNoSW5kaWNlcyhwYXRjaGVzKVxuXG4gICAgaWYgKGluZGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiByb290Tm9kZVxuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGRvbUluZGV4KHJvb3ROb2RlLCBwYXRjaGVzLmEsIGluZGljZXMpXG4gICAgdmFyIG93bmVyRG9jdW1lbnQgPSByb290Tm9kZS5vd25lckRvY3VtZW50XG5cbiAgICBpZiAoIXJlbmRlck9wdGlvbnMpIHtcbiAgICAgICAgcmVuZGVyT3B0aW9ucyA9IHsgcGF0Y2g6IHBhdGNoUmVjdXJzaXZlIH1cbiAgICAgICAgaWYgKG93bmVyRG9jdW1lbnQgIT09IGRvY3VtZW50KSB7XG4gICAgICAgICAgICByZW5kZXJPcHRpb25zLmRvY3VtZW50ID0gb3duZXJEb2N1bWVudFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBub2RlSW5kZXggPSBpbmRpY2VzW2ldXG4gICAgICAgIHJvb3ROb2RlID0gYXBwbHlQYXRjaChyb290Tm9kZSxcbiAgICAgICAgICAgIGluZGV4W25vZGVJbmRleF0sXG4gICAgICAgICAgICBwYXRjaGVzW25vZGVJbmRleF0sXG4gICAgICAgICAgICByZW5kZXJPcHRpb25zKVxuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZVxufVxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHJvb3ROb2RlLCBkb21Ob2RlLCBwYXRjaExpc3QsIHJlbmRlck9wdGlvbnMpIHtcbiAgICBpZiAoIWRvbU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHJvb3ROb2RlXG4gICAgfVxuXG4gICAgdmFyIG5ld05vZGVcblxuICAgIGlmIChpc0FycmF5KHBhdGNoTGlzdCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRjaExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5ld05vZGUgPSBwYXRjaE9wKHBhdGNoTGlzdFtpXSwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgICAgICAgICAgaWYgKGRvbU5vZGUgPT09IHJvb3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgcm9vdE5vZGUgPSBuZXdOb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBuZXdOb2RlID0gcGF0Y2hPcChwYXRjaExpc3QsIGRvbU5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICAgICAgaWYgKGRvbU5vZGUgPT09IHJvb3ROb2RlKSB7XG4gICAgICAgICAgICByb290Tm9kZSA9IG5ld05vZGVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZVxufVxuXG5mdW5jdGlvbiBwYXRjaEluZGljZXMocGF0Y2hlcykge1xuICAgIHZhciBpbmRpY2VzID0gW11cblxuICAgIGZvciAodmFyIGtleSBpbiBwYXRjaGVzKSB7XG4gICAgICAgIGlmIChrZXkgIT09IFwiYVwiKSB7XG4gICAgICAgICAgICBpbmRpY2VzLnB1c2goTnVtYmVyKGtleSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5kaWNlc1xufVxuIiwidmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcInZ0cmVlL2lzLXdpZGdldFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVwZGF0ZVdpZGdldFxuXG5mdW5jdGlvbiB1cGRhdGVXaWRnZXQoYSwgYikge1xuICAgIGlmIChpc1dpZGdldChhKSAmJiBpc1dpZGdldChiKSkge1xuICAgICAgICBpZiAoXCJuYW1lXCIgaW4gYSAmJiBcIm5hbWVcIiBpbiBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5pZCA9PT0gYi5pZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGEuaW5pdCA9PT0gYi5pbml0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2Vcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gQXR0cmlidXRlSG9vaztcblxuZnVuY3Rpb24gQXR0cmlidXRlSG9vayh2YWx1ZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBBdHRyaWJ1dGVIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IEF0dHJpYnV0ZUhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuQXR0cmlidXRlSG9vay5wcm90b3R5cGUuaG9vayA9IGZ1bmN0aW9uIChub2RlLCBwcm9wLCBwcmV2KSB7XG4gICAgaWYgKHByZXYgJiYgcHJldi52YWx1ZSA9PT0gdGhpcy52YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9kZS5zZXRBdHRyaWJ1dGVOUyhudWxsLCBwcm9wLCB0aGlzLnZhbHVlKVxufVxuIiwidmFyIERhdGFTZXQgPSByZXF1aXJlKFwiZGF0YS1zZXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhU2V0SG9vaztcblxuZnVuY3Rpb24gRGF0YVNldEhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRGF0YVNldEhvb2spKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0YVNldEhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuRGF0YVNldEhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIGRzID0gRGF0YVNldChub2RlKVxuICAgIHZhciBwcm9wTmFtZSA9IHByb3BlcnR5TmFtZS5zdWJzdHIoNSlcblxuICAgIGRzW3Byb3BOYW1lXSA9IHRoaXMudmFsdWU7XG59O1xuIiwidmFyIERhdGFTZXQgPSByZXF1aXJlKFwiZGF0YS1zZXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhU2V0SG9vaztcblxuZnVuY3Rpb24gRGF0YVNldEhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRGF0YVNldEhvb2spKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0YVNldEhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuRGF0YVNldEhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIGRzID0gRGF0YVNldChub2RlKVxuICAgIHZhciBwcm9wTmFtZSA9IHByb3BlcnR5TmFtZS5zdWJzdHIoMylcblxuICAgIGRzW3Byb3BOYW1lXSA9IHRoaXMudmFsdWU7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBTb2Z0U2V0SG9vaztcblxuZnVuY3Rpb24gU29mdFNldEhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU29mdFNldEhvb2spKSB7XG4gICAgICAgIHJldHVybiBuZXcgU29mdFNldEhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuU29mdFNldEhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgaWYgKG5vZGVbcHJvcGVydHlOYW1lXSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICBub2RlW3Byb3BlcnR5TmFtZV0gPSB0aGlzLnZhbHVlO1xuICAgIH1cbn07XG4iLCJ2YXIgVk5vZGUgPSByZXF1aXJlKFwidnRyZWUvdm5vZGUuanNcIilcbnZhciBWVGV4dCA9IHJlcXVpcmUoXCJ2dHJlZS92dGV4dC5qc1wiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwidnRyZWUvaXMtdm5vZGVcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcInZ0cmVlL2lzLXZ0ZXh0XCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwidnRyZWUvaXMtd2lkZ2V0XCIpXG52YXIgaXNIb29rID0gcmVxdWlyZShcInZ0cmVlL2lzLXZob29rXCIpXG52YXIgaXNWVGh1bmsgPSByZXF1aXJlKFwidnRyZWUvaXMtdGh1bmtcIilcbnZhciBUeXBlZEVycm9yID0gcmVxdWlyZShcImVycm9yL3R5cGVkXCIpXG5cbnZhciBwYXJzZVRhZyA9IHJlcXVpcmUoXCIuL3BhcnNlLXRhZy5qc1wiKVxudmFyIHNvZnRTZXRIb29rID0gcmVxdWlyZShcIi4vaG9va3Mvc29mdC1zZXQtaG9vay5qc1wiKVxudmFyIGRhdGFTZXRIb29rID0gcmVxdWlyZShcIi4vaG9va3MvZGF0YS1zZXQtaG9vay5qc1wiKVxudmFyIGV2SG9vayA9IHJlcXVpcmUoXCIuL2hvb2tzL2V2LWhvb2suanNcIilcblxudmFyIFVuZXhwZWN0ZWRWaXJ0dWFsRWxlbWVudCA9IFR5cGVkRXJyb3Ioe1xuICAgIHR5cGU6IFwidmlydHVhbC1oeXBlcnNjcmlwdC51bmV4cGVjdGVkLnZpcnR1YWwtZWxlbWVudFwiLFxuICAgIG1lc3NhZ2U6IFwiVW5leHBlY3RlZCB2aXJ0dWFsIGNoaWxkIHBhc3NlZCB0byBoKCkuXFxuXCIgK1xuICAgICAgICBcIkV4cGVjdGVkIGEgVk5vZGUgLyBWdGh1bmsgLyBWV2lkZ2V0IC8gc3RyaW5nIGJ1dDpcXG5cIiArXG4gICAgICAgIFwiZ290IGEge2ZvcmVpZ25PYmplY3RTdHJ9LlxcblwiICtcbiAgICAgICAgXCJUaGUgcGFyZW50IHZub2RlIGlzIHtwYXJlbnRWbm9kZVN0cn0uXFxuXCIgK1xuICAgICAgICBcIlN1Z2dlc3RlZCBmaXg6IGNoYW5nZSB5b3VyIGBoKC4uLiwgWyAuLi4gXSlgIGNhbGxzaXRlLlwiLFxuICAgIGZvcmVpZ25PYmplY3RTdHI6IG51bGwsXG4gICAgcGFyZW50Vm5vZGVTdHI6IG51bGwsXG4gICAgZm9yZWlnbk9iamVjdDogbnVsbCxcbiAgICBwYXJlbnRWbm9kZTogbnVsbFxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBoXG5cbmZ1bmN0aW9uIGgodGFnTmFtZSwgcHJvcGVydGllcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgY2hpbGROb2RlcyA9IFtdXG4gICAgdmFyIHRhZywgcHJvcHMsIGtleSwgbmFtZXNwYWNlXG5cbiAgICBpZiAoIWNoaWxkcmVuICYmIGlzQ2hpbGRyZW4ocHJvcGVydGllcykpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBwcm9wZXJ0aWVzXG4gICAgICAgIHByb3BzID0ge31cbiAgICB9XG5cbiAgICBwcm9wcyA9IHByb3BzIHx8IHByb3BlcnRpZXMgfHwge31cbiAgICB0YWcgPSBwYXJzZVRhZyh0YWdOYW1lLCBwcm9wcylcblxuICAgIC8vIHN1cHBvcnQga2V5c1xuICAgIGlmIChcImtleVwiIGluIHByb3BzKSB7XG4gICAgICAgIGtleSA9IHByb3BzLmtleVxuICAgICAgICBwcm9wcy5rZXkgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICAvLyBzdXBwb3J0IG5hbWVzcGFjZVxuICAgIGlmIChcIm5hbWVzcGFjZVwiIGluIHByb3BzKSB7XG4gICAgICAgIG5hbWVzcGFjZSA9IHByb3BzLm5hbWVzcGFjZVxuICAgICAgICBwcm9wcy5uYW1lc3BhY2UgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICAvLyBmaXggY3Vyc29yIGJ1Z1xuICAgIGlmICh0YWcgPT09IFwiaW5wdXRcIiAmJlxuICAgICAgICBcInZhbHVlXCIgaW4gcHJvcHMgJiZcbiAgICAgICAgcHJvcHMudmFsdWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAhaXNIb29rKHByb3BzLnZhbHVlKVxuICAgICkge1xuICAgICAgICBwcm9wcy52YWx1ZSA9IHNvZnRTZXRIb29rKHByb3BzLnZhbHVlKVxuICAgIH1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocHJvcHMpXG4gICAgdmFyIHByb3BOYW1lLCB2YWx1ZVxuICAgIGZvciAodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgICBwcm9wTmFtZSA9IGtleXNbal1cbiAgICAgICAgdmFsdWUgPSBwcm9wc1twcm9wTmFtZV1cbiAgICAgICAgaWYgKGlzSG9vayh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgZGF0YS1mb28gc3VwcG9ydFxuICAgICAgICBpZiAocHJvcE5hbWUuc3Vic3RyKDAsIDUpID09PSBcImRhdGEtXCIpIHtcbiAgICAgICAgICAgIHByb3BzW3Byb3BOYW1lXSA9IGRhdGFTZXRIb29rKHZhbHVlKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIGV2LWZvbyBzdXBwb3J0XG4gICAgICAgIGlmIChwcm9wTmFtZS5zdWJzdHIoMCwgMykgPT09IFwiZXYtXCIpIHtcbiAgICAgICAgICAgIHByb3BzW3Byb3BOYW1lXSA9IGV2SG9vayh2YWx1ZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjaGlsZHJlbiAhPT0gdW5kZWZpbmVkICYmIGNoaWxkcmVuICE9PSBudWxsKSB7XG4gICAgICAgIGFkZENoaWxkKGNoaWxkcmVuLCBjaGlsZE5vZGVzLCB0YWcsIHByb3BzKVxuICAgIH1cblxuXG4gICAgdmFyIG5vZGUgPSBuZXcgVk5vZGUodGFnLCBwcm9wcywgY2hpbGROb2Rlcywga2V5LCBuYW1lc3BhY2UpXG5cbiAgICByZXR1cm4gbm9kZVxufVxuXG5mdW5jdGlvbiBhZGRDaGlsZChjLCBjaGlsZE5vZGVzLCB0YWcsIHByb3BzKSB7XG4gICAgaWYgKHR5cGVvZiBjID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGNoaWxkTm9kZXMucHVzaChuZXcgVlRleHQoYykpXG4gICAgfSBlbHNlIGlmIChpc0NoaWxkKGMpKSB7XG4gICAgICAgIGNoaWxkTm9kZXMucHVzaChjKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZENoaWxkKGNbaV0sIGNoaWxkTm9kZXMsIHRhZywgcHJvcHMpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGMgPT09IG51bGwgfHwgYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVyblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFVuZXhwZWN0ZWRWaXJ0dWFsRWxlbWVudCh7XG4gICAgICAgICAgICBmb3JlaWduT2JqZWN0U3RyOiBKU09OLnN0cmluZ2lmeShjKSxcbiAgICAgICAgICAgIGZvcmVpZ25PYmplY3Q6IGMsXG4gICAgICAgICAgICBwYXJlbnRWbm9kZVN0cjogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHRhZ05hbWU6IHRhZyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wc1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwYXJlbnRWbm9kZToge1xuICAgICAgICAgICAgICAgIHRhZ05hbWU6IHRhZyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDaGlsZCh4KSB7XG4gICAgcmV0dXJuIGlzVk5vZGUoeCkgfHwgaXNWVGV4dCh4KSB8fCBpc1dpZGdldCh4KSB8fCBpc1ZUaHVuayh4KVxufVxuXG5mdW5jdGlvbiBpc0NoaWxkcmVuKHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3RyaW5nXCIgfHwgQXJyYXkuaXNBcnJheSh4KSB8fCBpc0NoaWxkKHgpXG59XG4iLCJtb2R1bGUuZXhwb3J0cz1yZXF1aXJlKFwiL1VzZXJzL2RndXR0bWFuL3Rlc3Qvc2ltcGxlLXdpa2kvbm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2RhdGEtc2V0L2luZGV4LmpzXCIpIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3Avbm9kZV9tb2R1bGVzL2Vycm9yL3R5cGVkLmpzXCIpIiwidmFyIGNsYXNzSWRTcGxpdCA9IC8oW1xcLiNdP1thLXpBLVowLTlfOi1dKykvXG52YXIgbm90Q2xhc3NJZCA9IC9eXFwufCMvXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VUYWdcblxuZnVuY3Rpb24gcGFyc2VUYWcodGFnLCBwcm9wcykge1xuICAgIGlmICghdGFnKSB7XG4gICAgICAgIHJldHVybiBcImRpdlwiXG4gICAgfVxuXG4gICAgdmFyIG5vSWQgPSAhKFwiaWRcIiBpbiBwcm9wcylcblxuICAgIHZhciB0YWdQYXJ0cyA9IHRhZy5zcGxpdChjbGFzc0lkU3BsaXQpXG4gICAgdmFyIHRhZ05hbWUgPSBudWxsXG5cbiAgICBpZiAobm90Q2xhc3NJZC50ZXN0KHRhZ1BhcnRzWzFdKSkge1xuICAgICAgICB0YWdOYW1lID0gXCJkaXZcIlxuICAgIH1cblxuICAgIHZhciBjbGFzc2VzLCBwYXJ0LCB0eXBlLCBpXG4gICAgZm9yIChpID0gMDsgaSA8IHRhZ1BhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnQgPSB0YWdQYXJ0c1tpXVxuXG4gICAgICAgIGlmICghcGFydCkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHR5cGUgPSBwYXJ0LmNoYXJBdCgwKVxuXG4gICAgICAgIGlmICghdGFnTmFtZSkge1xuICAgICAgICAgICAgdGFnTmFtZSA9IHBhcnRcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIi5cIikge1xuICAgICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMgfHwgW11cbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aCkpXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCIjXCIgJiYgbm9JZCkge1xuICAgICAgICAgICAgcHJvcHMuaWQgPSBwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgIGlmIChwcm9wcy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChwcm9wcy5jbGFzc05hbWUpXG4gICAgICAgIH1cblxuICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oXCIgXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZ05hbWUgPyB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgOiBcImRpdlwiXG59XG4iLCJ2YXIgYXR0cmlidXRlSG9vayA9IHJlcXVpcmUoXCIuL2hvb2tzL2F0dHJpYnV0ZS1ob29rLmpzXCIpXG52YXIgaCA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbnZhciBCTEFDS0xJU1RFRF9LRVlTID0ge1xuICAgIFwic3R5bGVcIjogdHJ1ZSxcbiAgICBcIm5hbWVzcGFjZVwiOiB0cnVlLFxuICAgIFwia2V5XCI6IHRydWVcbn1cbnZhciBTVkdfTkFNRVNQQUNFID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG5cbm1vZHVsZS5leHBvcnRzID0gc3ZnXG5cbmZ1bmN0aW9uIHN2Zyh0YWdOYW1lLCBwcm9wZXJ0aWVzLCBjaGlsZHJlbikge1xuICAgIGlmICghY2hpbGRyZW4gJiYgaXNDaGlsZHJlbihwcm9wZXJ0aWVzKSkge1xuICAgICAgICBjaGlsZHJlbiA9IHByb3BlcnRpZXNcbiAgICAgICAgcHJvcGVydGllcyA9IHt9XG4gICAgfVxuXG4gICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge31cblxuICAgIC8vIHNldCBuYW1lc3BhY2UgZm9yIHN2Z1xuICAgIHByb3BlcnRpZXMubmFtZXNwYWNlID0gU1ZHX05BTUVTUEFDRVxuXG4gICAgLy8gZm9yIGVhY2gga2V5LCBpZiBhdHRyaWJ1dGUgJiBzdHJpbmcsIGJvb2wgb3IgbnVtYmVyIHRoZW5cbiAgICAvLyBjb252ZXJ0IGl0IGludG8gYSBzZXRBdHRyaWJ1dGUgaG9va1xuICAgIGZvciAodmFyIGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmICghcHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEJMQUNLTElTVEVEX0tFWVNba2V5XSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2YWx1ZSA9IHByb3BlcnRpZXNba2V5XVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgIT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSAhPT0gXCJib29sZWFuXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvcGVydGllc1trZXldID0gYXR0cmlidXRlSG9vayh2YWx1ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gaCh0YWdOYW1lLCBwcm9wZXJ0aWVzLCBjaGlsZHJlbilcbn1cblxuZnVuY3Rpb24gaXNDaGlsZHJlbih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN0cmluZ1wiIHx8IEFycmF5LmlzQXJyYXkoeClcbn1cbiIsInZhciBpc0FycmF5ID0gcmVxdWlyZShcIngtaXMtYXJyYXlcIilcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoXCJpcy1vYmplY3RcIilcblxudmFyIFZQYXRjaCA9IHJlcXVpcmUoXCIuL3ZwYXRjaFwiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi9pcy12bm9kZVwiKVxudmFyIGlzVlRleHQgPSByZXF1aXJlKFwiLi9pcy12dGV4dFwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4vaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuL2lzLXRodW5rXCIpXG52YXIgaGFuZGxlVGh1bmsgPSByZXF1aXJlKFwiLi9oYW5kbGUtdGh1bmtcIilcblxubW9kdWxlLmV4cG9ydHMgPSBkaWZmXG5cbmZ1bmN0aW9uIGRpZmYoYSwgYikge1xuICAgIHZhciBwYXRjaCA9IHsgYTogYSB9XG4gICAgd2FsayhhLCBiLCBwYXRjaCwgMClcbiAgICByZXR1cm4gcGF0Y2hcbn1cblxuZnVuY3Rpb24gd2FsayhhLCBiLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICBpZiAoaXNUaHVuayhhKSB8fCBpc1RodW5rKGIpKSB7XG4gICAgICAgICAgICB0aHVua3MoYSwgYiwgcGF0Y2gsIGluZGV4KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaG9va3MoYiwgcGF0Y2gsIGluZGV4KVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBhcHBseSA9IHBhdGNoW2luZGV4XVxuXG4gICAgaWYgKGIgPT0gbnVsbCkge1xuICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5SRU1PVkUsIGEsIGIpKVxuICAgICAgICBkZXN0cm95V2lkZ2V0cyhhLCBwYXRjaCwgaW5kZXgpXG4gICAgfSBlbHNlIGlmIChpc1RodW5rKGEpIHx8IGlzVGh1bmsoYikpIHtcbiAgICAgICAgdGh1bmtzKGEsIGIsIHBhdGNoLCBpbmRleClcbiAgICB9IGVsc2UgaWYgKGlzVk5vZGUoYikpIHtcbiAgICAgICAgaWYgKGlzVk5vZGUoYSkpIHtcbiAgICAgICAgICAgIGlmIChhLnRhZ05hbWUgPT09IGIudGFnTmFtZSAmJlxuICAgICAgICAgICAgICAgIGEubmFtZXNwYWNlID09PSBiLm5hbWVzcGFjZSAmJlxuICAgICAgICAgICAgICAgIGEua2V5ID09PSBiLmtleSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wc1BhdGNoID0gZGlmZlByb3BzKGEucHJvcGVydGllcywgYi5wcm9wZXJ0aWVzLCBiLmhvb2tzKVxuICAgICAgICAgICAgICAgIGlmIChwcm9wc1BhdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFZQYXRjaC5QUk9QUywgYSwgcHJvcHNQYXRjaCkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WTk9ERSwgYSwgYikpXG4gICAgICAgICAgICAgICAgZGVzdHJveVdpZGdldHMoYSwgcGF0Y2gsIGluZGV4KVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhcHBseSA9IGRpZmZDaGlsZHJlbihhLCBiLCBwYXRjaCwgYXBwbHksIGluZGV4KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVk5PREUsIGEsIGIpKVxuICAgICAgICAgICAgZGVzdHJveVdpZGdldHMoYSwgcGF0Y2gsIGluZGV4KVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1ZUZXh0KGIpKSB7XG4gICAgICAgIGlmICghaXNWVGV4dChhKSkge1xuICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVlRFWFQsIGEsIGIpKVxuICAgICAgICAgICAgZGVzdHJveVdpZGdldHMoYSwgcGF0Y2gsIGluZGV4KVxuICAgICAgICB9IGVsc2UgaWYgKGEudGV4dCAhPT0gYi50ZXh0KSB7XG4gICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WVEVYVCwgYSwgYikpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzV2lkZ2V0KGIpKSB7XG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLldJREdFVCwgYSwgYikpXG5cbiAgICAgICAgaWYgKCFpc1dpZGdldChhKSkge1xuICAgICAgICAgICAgZGVzdHJveVdpZGdldHMoYSwgcGF0Y2gsIGluZGV4KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGx5XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaWZmUHJvcHMoYSwgYiwgaG9va3MpIHtcbiAgICB2YXIgZGlmZlxuXG4gICAgZm9yICh2YXIgYUtleSBpbiBhKSB7XG4gICAgICAgIGlmICghKGFLZXkgaW4gYikpIHtcbiAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICBkaWZmW2FLZXldID0gdW5kZWZpbmVkXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYVZhbHVlID0gYVthS2V5XVxuICAgICAgICB2YXIgYlZhbHVlID0gYlthS2V5XVxuXG4gICAgICAgIGlmIChob29rcyAmJiBhS2V5IGluIGhvb2tzKSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KGFWYWx1ZSkgJiYgaXNPYmplY3QoYlZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRQcm90b3R5cGUoYlZhbHVlKSAhPT0gZ2V0UHJvdG90eXBlKGFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmplY3REaWZmID0gZGlmZlByb3BzKGFWYWx1ZSwgYlZhbHVlKVxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqZWN0RGlmZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYUtleV0gPSBvYmplY3REaWZmXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFWYWx1ZSAhPT0gYlZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICBkaWZmW2FLZXldID0gYlZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBiS2V5IGluIGIpIHtcbiAgICAgICAgaWYgKCEoYktleSBpbiBhKSkge1xuICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgIGRpZmZbYktleV0gPSBiW2JLZXldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZlxufVxuXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpXG4gICAgfSBlbHNlIGlmICh2YWx1ZS5fX3Byb3RvX18pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLl9fcHJvdG9fX1xuICAgIH0gZWxzZSBpZiAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoLCBhcHBseSwgaW5kZXgpIHtcbiAgICB2YXIgYUNoaWxkcmVuID0gYS5jaGlsZHJlblxuICAgIHZhciBiQ2hpbGRyZW4gPSByZW9yZGVyKGFDaGlsZHJlbiwgYi5jaGlsZHJlbilcblxuICAgIHZhciBhTGVuID0gYUNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBiTGVuID0gYkNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBsZW4gPSBhTGVuID4gYkxlbiA/IGFMZW4gOiBiTGVuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBsZWZ0Tm9kZSA9IGFDaGlsZHJlbltpXVxuICAgICAgICB2YXIgcmlnaHROb2RlID0gYkNoaWxkcmVuW2ldXG4gICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICBpZiAoIWxlZnROb2RlKSB7XG4gICAgICAgICAgICBpZiAocmlnaHROb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhjZXNzIG5vZGVzIGluIGIgbmVlZCB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWUGF0Y2goVlBhdGNoLklOU0VSVCwgbnVsbCwgcmlnaHROb2RlKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghcmlnaHROb2RlKSB7XG4gICAgICAgICAgICBpZiAobGVmdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBFeGNlc3Mgbm9kZXMgaW4gYSBuZWVkIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBuZXcgVlBhdGNoKFZQYXRjaC5SRU1PVkUsIGxlZnROb2RlLCBudWxsKVxuICAgICAgICAgICAgICAgIGRlc3Ryb3lXaWRnZXRzKGxlZnROb2RlLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YWxrKGxlZnROb2RlLCByaWdodE5vZGUsIHBhdGNoLCBpbmRleClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1ZOb2RlKGxlZnROb2RlKSAmJiBsZWZ0Tm9kZS5jb3VudCkge1xuICAgICAgICAgICAgaW5kZXggKz0gbGVmdE5vZGUuY291bnRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChiQ2hpbGRyZW4ubW92ZXMpIHtcbiAgICAgICAgLy8gUmVvcmRlciBub2RlcyBsYXN0XG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLk9SREVSLCBhLCBiQ2hpbGRyZW4ubW92ZXMpKVxuICAgIH1cblxuICAgIHJldHVybiBhcHBseVxufVxuXG4vLyBQYXRjaCByZWNvcmRzIGZvciBhbGwgZGVzdHJveWVkIHdpZGdldHMgbXVzdCBiZSBhZGRlZCBiZWNhdXNlIHdlIG5lZWRcbi8vIGEgRE9NIG5vZGUgcmVmZXJlbmNlIGZvciB0aGUgZGVzdHJveSBmdW5jdGlvblxuZnVuY3Rpb24gZGVzdHJveVdpZGdldHModk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChpc1dpZGdldCh2Tm9kZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2Tm9kZS5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHBhdGNoW2luZGV4XSA9IG5ldyBWUGF0Y2goVlBhdGNoLlJFTU9WRSwgdk5vZGUsIG51bGwpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVk5vZGUodk5vZGUpICYmIHZOb2RlLmhhc1dpZGdldHMpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW5cbiAgICAgICAgdmFyIGxlbiA9IGNoaWxkcmVuLmxlbmd0aFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhjaGlsZCwgcGF0Y2gsIGluZGV4KVxuXG4gICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICBpbmRleCArPSBjaGlsZC5jb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBDcmVhdGUgYSBzdWItcGF0Y2ggZm9yIHRodW5rc1xuZnVuY3Rpb24gdGh1bmtzKGEsIGIsIHBhdGNoLCBpbmRleCkge1xuICAgIHZhciBub2RlcyA9IGhhbmRsZVRodW5rKGEsIGIpO1xuICAgIHZhciB0aHVua1BhdGNoID0gZGlmZihub2Rlcy5hLCBub2Rlcy5iKVxuICAgIGlmIChoYXNQYXRjaGVzKHRodW5rUGF0Y2gpKSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IG5ldyBWUGF0Y2goVlBhdGNoLlRIVU5LLCBudWxsLCB0aHVua1BhdGNoKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaGFzUGF0Y2hlcyhwYXRjaCkge1xuICAgIGZvciAodmFyIGluZGV4IGluIHBhdGNoKSB7XG4gICAgICAgIGlmIChpbmRleCAhPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBFeGVjdXRlIGhvb2tzIHdoZW4gdHdvIG5vZGVzIGFyZSBpZGVudGljYWxcbmZ1bmN0aW9uIGhvb2tzKHZOb2RlLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoaXNWTm9kZSh2Tm9kZSkpIHtcbiAgICAgICAgaWYgKHZOb2RlLmhvb2tzKSB7XG4gICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBuZXcgVlBhdGNoKFZQYXRjaC5QUk9QUywgdk5vZGUuaG9va3MsIHZOb2RlLmhvb2tzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZOb2RlLmRlc2NlbmRhbnRIb29rcykge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgIHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICAgICAgICAgIGhvb2tzKGNoaWxkLCBwYXRjaCwgaW5kZXgpXG5cbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY2hpbGQuY291bnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIExpc3QgZGlmZiwgbmFpdmUgbGVmdCB0byByaWdodCByZW9yZGVyaW5nXG5mdW5jdGlvbiByZW9yZGVyKGFDaGlsZHJlbiwgYkNoaWxkcmVuKSB7XG5cbiAgICB2YXIgYktleXMgPSBrZXlJbmRleChiQ2hpbGRyZW4pXG5cbiAgICBpZiAoIWJLZXlzKSB7XG4gICAgICAgIHJldHVybiBiQ2hpbGRyZW5cbiAgICB9XG5cbiAgICB2YXIgYUtleXMgPSBrZXlJbmRleChhQ2hpbGRyZW4pXG5cbiAgICBpZiAoIWFLZXlzKSB7XG4gICAgICAgIHJldHVybiBiQ2hpbGRyZW5cbiAgICB9XG5cbiAgICB2YXIgYk1hdGNoID0ge30sIGFNYXRjaCA9IHt9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gYktleXMpIHtcbiAgICAgICAgYk1hdGNoW2JLZXlzW2tleV1dID0gYUtleXNba2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBhS2V5cykge1xuICAgICAgICBhTWF0Y2hbYUtleXNba2V5XV0gPSBiS2V5c1trZXldXG4gICAgfVxuXG4gICAgdmFyIGFMZW4gPSBhQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGxlbiA9IGFMZW4gPiBiTGVuID8gYUxlbiA6IGJMZW5cbiAgICB2YXIgc2h1ZmZsZSA9IFtdXG4gICAgdmFyIGZyZWVJbmRleCA9IDBcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbW92ZUluZGV4ID0gMFxuICAgIHZhciBtb3ZlcyA9IHt9XG4gICAgdmFyIHJlbW92ZXMgPSBtb3Zlcy5yZW1vdmVzID0ge31cbiAgICB2YXIgcmV2ZXJzZSA9IG1vdmVzLnJldmVyc2UgPSB7fVxuICAgIHZhciBoYXNNb3ZlcyA9IGZhbHNlXG5cbiAgICB3aGlsZSAoZnJlZUluZGV4IDwgbGVuKSB7XG4gICAgICAgIHZhciBtb3ZlID0gYU1hdGNoW2ldXG4gICAgICAgIGlmIChtb3ZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHNodWZmbGVbaV0gPSBiQ2hpbGRyZW5bbW92ZV1cbiAgICAgICAgICAgIGlmIChtb3ZlICE9PSBtb3ZlSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBtb3Zlc1ttb3ZlXSA9IG1vdmVJbmRleFxuICAgICAgICAgICAgICAgIHJldmVyc2VbbW92ZUluZGV4XSA9IG1vdmVcbiAgICAgICAgICAgICAgICBoYXNNb3ZlcyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vdmVJbmRleCsrXG4gICAgICAgIH0gZWxzZSBpZiAoaSBpbiBhTWF0Y2gpIHtcbiAgICAgICAgICAgIHNodWZmbGVbaV0gPSB1bmRlZmluZWRcbiAgICAgICAgICAgIHJlbW92ZXNbaV0gPSBtb3ZlSW5kZXgrK1xuICAgICAgICAgICAgaGFzTW92ZXMgPSB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoYk1hdGNoW2ZyZWVJbmRleF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGZyZWVJbmRleCsrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmcmVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJlZUNoaWxkID0gYkNoaWxkcmVuW2ZyZWVJbmRleF1cbiAgICAgICAgICAgICAgICBpZiAoZnJlZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNodWZmbGVbaV0gPSBmcmVlQ2hpbGRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyZWVJbmRleCAhPT0gbW92ZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNNb3ZlcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVzW2ZyZWVJbmRleF0gPSBtb3ZlSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VbbW92ZUluZGV4XSA9IGZyZWVJbmRleFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1vdmVJbmRleCsrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZyZWVJbmRleCsrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrXG4gICAgfVxuXG4gICAgaWYgKGhhc01vdmVzKSB7XG4gICAgICAgIHNodWZmbGUubW92ZXMgPSBtb3Zlc1xuICAgIH1cblxuICAgIHJldHVybiBzaHVmZmxlXG59XG5cbmZ1bmN0aW9uIGtleUluZGV4KGNoaWxkcmVuKSB7XG4gICAgdmFyIGksIGtleXNcblxuICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXG4gICAgICAgIGlmIChjaGlsZC5rZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAga2V5cyA9IGtleXMgfHwge31cbiAgICAgICAgICAgIGtleXNbY2hpbGQua2V5XSA9IGlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBrZXlzXG59XG5cbmZ1bmN0aW9uIGFwcGVuZFBhdGNoKGFwcGx5LCBwYXRjaCkge1xuICAgIGlmIChhcHBseSkge1xuICAgICAgICBpZiAoaXNBcnJheShhcHBseSkpIHtcbiAgICAgICAgICAgIGFwcGx5LnB1c2gocGF0Y2gpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBseSA9IFthcHBseSwgcGF0Y2hdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXBwbHlcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGF0Y2hcbiAgICB9XG59XG4iLCJ2YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuL2lzLXZub2RlXCIpXG52YXIgaXNWVGV4dCA9IHJlcXVpcmUoXCIuL2lzLXZ0ZXh0XCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi9pcy13aWRnZXRcIilcbnZhciBpc1RodW5rID0gcmVxdWlyZShcIi4vaXMtdGh1bmtcIilcblxubW9kdWxlLmV4cG9ydHMgPSBoYW5kbGVUaHVua1xuXG5mdW5jdGlvbiBoYW5kbGVUaHVuayhhLCBiKSB7XG4gICAgdmFyIHJlbmRlcmVkQSA9IGFcbiAgICB2YXIgcmVuZGVyZWRCID0gYlxuXG4gICAgaWYgKGlzVGh1bmsoYikpIHtcbiAgICAgICAgcmVuZGVyZWRCID0gcmVuZGVyVGh1bmsoYiwgYSlcbiAgICB9XG5cbiAgICBpZiAoaXNUaHVuayhhKSkge1xuICAgICAgICByZW5kZXJlZEEgPSByZW5kZXJUaHVuayhhLCBudWxsKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGE6IHJlbmRlcmVkQSxcbiAgICAgICAgYjogcmVuZGVyZWRCXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJUaHVuayh0aHVuaywgcHJldmlvdXMpIHtcbiAgICB2YXIgcmVuZGVyZWRUaHVuayA9IHRodW5rLnZub2RlXG5cbiAgICBpZiAoIXJlbmRlcmVkVGh1bmspIHtcbiAgICAgICAgcmVuZGVyZWRUaHVuayA9IHRodW5rLnZub2RlID0gdGh1bmsucmVuZGVyKHByZXZpb3VzKVxuICAgIH1cblxuICAgIGlmICghKGlzVk5vZGUocmVuZGVyZWRUaHVuaykgfHxcbiAgICAgICAgICAgIGlzVlRleHQocmVuZGVyZWRUaHVuaykgfHxcbiAgICAgICAgICAgIGlzV2lkZ2V0KHJlbmRlcmVkVGh1bmspKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0aHVuayBkaWQgbm90IHJldHVybiBhIHZhbGlkIG5vZGVcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbmRlcmVkVGh1bmtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNUaHVua1xyXG5cclxuZnVuY3Rpb24gaXNUaHVuayh0KSB7XHJcbiAgICByZXR1cm4gdCAmJiB0LnR5cGUgPT09IFwiVGh1bmtcIlxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gaXNIb29rXG5cbmZ1bmN0aW9uIGlzSG9vayhob29rKSB7XG4gICAgcmV0dXJuIGhvb2sgJiYgdHlwZW9mIGhvb2suaG9vayA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICFob29rLmhhc093blByb3BlcnR5KFwiaG9va1wiKVxufVxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaXNWaXJ0dWFsTm9kZVxuXG5mdW5jdGlvbiBpc1ZpcnR1YWxOb2RlKHgpIHtcbiAgICByZXR1cm4geCAmJiB4LnR5cGUgPT09IFwiVmlydHVhbE5vZGVcIiAmJiB4LnZlcnNpb24gPT09IHZlcnNpb25cbn1cbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVmlydHVhbFRleHRcblxuZnVuY3Rpb24gaXNWaXJ0dWFsVGV4dCh4KSB7XG4gICAgcmV0dXJuIHggJiYgeC50eXBlID09PSBcIlZpcnR1YWxUZXh0XCIgJiYgeC52ZXJzaW9uID09PSB2ZXJzaW9uXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzV2lkZ2V0XG5cbmZ1bmN0aW9uIGlzV2lkZ2V0KHcpIHtcbiAgICByZXR1cm4gdyAmJiB3LnR5cGUgPT09IFwiV2lkZ2V0XCJcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXJlcXVpcmUoXCIvVXNlcnMvZGd1dHRtYW4vdGVzdC9zaW1wbGUtd2lraS9ub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS9ub2RlX21vZHVsZXMvaXMtb2JqZWN0L2luZGV4LmpzXCIpIiwibW9kdWxlLmV4cG9ydHM9cmVxdWlyZShcIi9Vc2Vycy9kZ3V0dG1hbi90ZXN0L3NpbXBsZS13aWtpL25vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tL25vZGVfbW9kdWxlcy94LWlzLWFycmF5L2luZGV4LmpzXCIpIiwibW9kdWxlLmV4cG9ydHMgPSBcIjFcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG52YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuL2lzLXZub2RlXCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi9pcy13aWRnZXRcIilcbnZhciBpc1ZIb29rID0gcmVxdWlyZShcIi4vaXMtdmhvb2tcIilcblxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsTm9kZVxuXG52YXIgbm9Qcm9wZXJ0aWVzID0ge31cbnZhciBub0NoaWxkcmVuID0gW11cblxuZnVuY3Rpb24gVmlydHVhbE5vZGUodGFnTmFtZSwgcHJvcGVydGllcywgY2hpbGRyZW4sIGtleSwgbmFtZXNwYWNlKSB7XG4gICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZVxuICAgIHRoaXMucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwgbm9Qcm9wZXJ0aWVzXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuIHx8IG5vQ2hpbGRyZW5cbiAgICB0aGlzLmtleSA9IGtleSAhPSBudWxsID8gU3RyaW5nKGtleSkgOiB1bmRlZmluZWRcbiAgICB0aGlzLm5hbWVzcGFjZSA9ICh0eXBlb2YgbmFtZXNwYWNlID09PSBcInN0cmluZ1wiKSA/IG5hbWVzcGFjZSA6IG51bGxcblxuICAgIHZhciBjb3VudCA9IChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHx8IDBcbiAgICB2YXIgZGVzY2VuZGFudHMgPSAwXG4gICAgdmFyIGhhc1dpZGdldHMgPSBmYWxzZVxuICAgIHZhciBkZXNjZW5kYW50SG9va3MgPSBmYWxzZVxuICAgIHZhciBob29rc1xuXG4gICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbcHJvcE5hbWVdXG4gICAgICAgICAgICBpZiAoaXNWSG9vayhwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhvb2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhvb2tzID0ge31cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBob29rc1twcm9wTmFtZV0gPSBwcm9wZXJ0eVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIGlmIChpc1ZOb2RlKGNoaWxkKSkge1xuICAgICAgICAgICAgZGVzY2VuZGFudHMgKz0gY2hpbGQuY291bnQgfHwgMFxuXG4gICAgICAgICAgICBpZiAoIWhhc1dpZGdldHMgJiYgY2hpbGQuaGFzV2lkZ2V0cykge1xuICAgICAgICAgICAgICAgIGhhc1dpZGdldHMgPSB0cnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZGVzY2VuZGFudEhvb2tzICYmIChjaGlsZC5ob29rcyB8fCBjaGlsZC5kZXNjZW5kYW50SG9va3MpKSB7XG4gICAgICAgICAgICAgICAgZGVzY2VuZGFudEhvb2tzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFoYXNXaWRnZXRzICYmIGlzV2lkZ2V0KGNoaWxkKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjaGlsZC5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBoYXNXaWRnZXRzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jb3VudCA9IGNvdW50ICsgZGVzY2VuZGFudHNcbiAgICB0aGlzLmhhc1dpZGdldHMgPSBoYXNXaWRnZXRzXG4gICAgdGhpcy5ob29rcyA9IGhvb2tzXG4gICAgdGhpcy5kZXNjZW5kYW50SG9va3MgPSBkZXNjZW5kYW50SG9va3Ncbn1cblxuVmlydHVhbE5vZGUucHJvdG90eXBlLnZlcnNpb24gPSB2ZXJzaW9uXG5WaXJ0dWFsTm9kZS5wcm90b3R5cGUudHlwZSA9IFwiVmlydHVhbE5vZGVcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cblZpcnR1YWxQYXRjaC5OT05FID0gMFxuVmlydHVhbFBhdGNoLlZURVhUID0gMVxuVmlydHVhbFBhdGNoLlZOT0RFID0gMlxuVmlydHVhbFBhdGNoLldJREdFVCA9IDNcblZpcnR1YWxQYXRjaC5QUk9QUyA9IDRcblZpcnR1YWxQYXRjaC5PUkRFUiA9IDVcblZpcnR1YWxQYXRjaC5JTlNFUlQgPSA2XG5WaXJ0dWFsUGF0Y2guUkVNT1ZFID0gN1xuVmlydHVhbFBhdGNoLlRIVU5LID0gOFxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxQYXRjaFxuXG5mdW5jdGlvbiBWaXJ0dWFsUGF0Y2godHlwZSwgdk5vZGUsIHBhdGNoKSB7XG4gICAgdGhpcy50eXBlID0gTnVtYmVyKHR5cGUpXG4gICAgdGhpcy52Tm9kZSA9IHZOb2RlXG4gICAgdGhpcy5wYXRjaCA9IHBhdGNoXG59XG5cblZpcnR1YWxQYXRjaC5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxQYXRjaC5wcm90b3R5cGUudHlwZSA9IFwiVmlydHVhbFBhdGNoXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxUZXh0XG5cbmZ1bmN0aW9uIFZpcnR1YWxUZXh0KHRleHQpIHtcbiAgICB0aGlzLnRleHQgPSBTdHJpbmcodGV4dClcbn1cblxuVmlydHVhbFRleHQucHJvdG90eXBlLnZlcnNpb24gPSB2ZXJzaW9uXG5WaXJ0dWFsVGV4dC5wcm90b3R5cGUudHlwZSA9IFwiVmlydHVhbFRleHRcIlxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290ID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvd1xuICA/IHRoaXNcbiAgOiB3aW5kb3c7XG5cbi8qKlxuICogTm9vcC5cbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBUT0RPOiBmdXR1cmUgcHJvb2YsIG1vdmUgdG8gY29tcG9lbnQgbGFuZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0hvc3Qob2JqKSB7XG4gIHZhciBzdHIgPSB7fS50b1N0cmluZy5jYWxsKG9iaik7XG5cbiAgc3dpdGNoIChzdHIpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZpbGVdJzpcbiAgICBjYXNlICdbb2JqZWN0IEJsb2JdJzpcbiAgICBjYXNlICdbb2JqZWN0IEZvcm1EYXRhXSc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5mdW5jdGlvbiBnZXRYSFIoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgJiYgKCdmaWxlOicgIT0gcm9vdC5sb2NhdGlvbi5wcm90b2NvbCB8fCAhcm9vdC5BY3RpdmVYT2JqZWN0KSkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUC42LjAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7IH0gY2F0Y2goZSkge31cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgdHJpbSA9ICcnLnRyaW1cbiAgPyBmdW5jdGlvbihzKSB7IHJldHVybiBzLnRyaW0oKTsgfVxuICA6IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMucmVwbGFjZSgvKF5cXHMqfFxccyokKS9nLCAnJyk7IH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG59XG5cbi8qKlxuICogU2VyaWFsaXplIHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXJpYWxpemUob2JqKSB7XG4gIGlmICghaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgdmFyIHBhaXJzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAobnVsbCAhPSBvYmpba2V5XSkge1xuICAgICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KVxuICAgICAgICArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpba2V5XSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGFpcnMuam9pbignJicpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbiAvKipcbiAgKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICAqXG4gICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICAqIEByZXR1cm4ge09iamVjdH1cbiAgKiBAYXBpIHByaXZhdGVcbiAgKi9cblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KCcmJyk7XG4gIHZhciBwYXJ0cztcbiAgdmFyIHBhaXI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBhcnRzID0gcGFpci5zcGxpdCgnPScpO1xuICAgIG9ialtkZWNvZGVVUklDb21wb25lbnQocGFydHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEV4cG9zZSBwYXJzZXIuXG4gKi9cblxucmVxdWVzdC5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuXG4vKipcbiAqIERlZmF1bHQgTUlNRSB0eXBlIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKi9cblxucmVxdWVzdC50eXBlcyA9IHtcbiAgaHRtbDogJ3RleHQvaHRtbCcsXG4gIGpzb246ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgeG1sOiAnYXBwbGljYXRpb24veG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICdmb3JtLWRhdGEnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IHNlcmlhbGl6YXRpb24gbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnNlcmlhbGl6ZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihvYmope1xuICogICAgICAgcmV0dXJuICdnZW5lcmF0ZWQgeG1sIGhlcmUnO1xuICogICAgIH07XG4gKlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICAnYXBwbGljYXRpb24vanNvbic6IEpTT04uc3RyaW5naWZ5XG4gfTtcblxuIC8qKlxuICAqIERlZmF1bHQgcGFyc2Vycy5cbiAgKlxuICAqICAgICBzdXBlcmFnZW50LnBhcnNlWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKHN0cil7XG4gICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICAqICAgICB9O1xuICAqXG4gICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyKSB7XG4gIHZhciBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICB2YXIgZmllbGRzID0ge307XG4gIHZhciBpbmRleDtcbiAgdmFyIGxpbmU7XG4gIHZhciBmaWVsZDtcbiAgdmFyIHZhbDtcblxuICBsaW5lcy5wb3AoKTsgLy8gdHJhaWxpbmcgQ1JMRlxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGZpZWxkID0gbGluZS5zbGljZSgwLCBpbmRleCkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbDtcbiAgfVxuXG4gIHJldHVybiBmaWVsZHM7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBtaW1lIHR5cGUgZm9yIHRoZSBnaXZlbiBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0eXBlKHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGhlYWRlciBmaWVsZCBwYXJhbWV0ZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcmFtcyhzdHIpe1xuICByZXR1cm4gcmVkdWNlKHN0ci5zcGxpdCgvICo7ICovKSwgZnVuY3Rpb24ob2JqLCBzdHIpe1xuICAgIHZhciBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKVxuICAgICAgLCBrZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICAsIHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLnJlcSA9IHJlcTtcbiAgdGhpcy54aHIgPSB0aGlzLnJlcS54aHI7XG4gIHRoaXMudGV4dCA9IHRoaXMueGhyLnJlc3BvbnNlVGV4dDtcbiAgdGhpcy5zZXRTdGF0dXNQcm9wZXJ0aWVzKHRoaXMueGhyLnN0YXR1cyk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzID0gcGFyc2VIZWFkZXIodGhpcy54aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcbiAgdGhpcy5ib2R5ID0gdGhpcy5yZXEubWV0aG9kICE9ICdIRUFEJ1xuICAgID8gdGhpcy5wYXJzZUJvZHkodGhpcy50ZXh0KVxuICAgIDogbnVsbDtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgcmVsYXRlZCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgLnR5cGVgIHRoZSBjb250ZW50IHR5cGUgd2l0aG91dCBwYXJhbXNcbiAqXG4gKiBBIHJlc3BvbnNlIG9mIFwiQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04XCJcbiAqIHdpbGwgcHJvdmlkZSB5b3Ugd2l0aCBhIGAudHlwZWAgb2YgXCJ0ZXh0L3BsYWluXCIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbihoZWFkZXIpe1xuICAvLyBjb250ZW50LXR5cGVcbiAgdmFyIGN0ID0gdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB0eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgdmFyIG9iaiA9IHBhcmFtcyhjdCk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHRoaXNba2V5XSA9IG9ialtrZXldO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5wYXJzZUJvZHkgPSBmdW5jdGlvbihzdHIpe1xuICB2YXIgcGFyc2UgPSByZXF1ZXN0LnBhcnNlW3RoaXMudHlwZV07XG4gIHJldHVybiBwYXJzZSAmJiBzdHIgJiYgc3RyLmxlbmd0aFxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbihzdGF0dXMpe1xuICB2YXIgdHlwZSA9IHN0YXR1cyAvIDEwMCB8IDA7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IDEgPT0gdHlwZTtcbiAgdGhpcy5vayA9IDIgPT0gdHlwZTtcbiAgdGhpcy5jbGllbnRFcnJvciA9IDQgPT0gdHlwZTtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IDUgPT0gdHlwZTtcbiAgdGhpcy5lcnJvciA9ICg0ID09IHR5cGUgfHwgNSA9PSB0eXBlKVxuICAgID8gdGhpcy50b0Vycm9yKClcbiAgICA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuYWNjZXB0ZWQgPSAyMDIgPT0gc3RhdHVzO1xuICB0aGlzLm5vQ29udGVudCA9IDIwNCA9PSBzdGF0dXMgfHwgMTIyMyA9PSBzdGF0dXM7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IDQwMCA9PSBzdGF0dXM7XG4gIHRoaXMudW5hdXRob3JpemVkID0gNDAxID09IHN0YXR1cztcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gNDA2ID09IHN0YXR1cztcbiAgdGhpcy5ub3RGb3VuZCA9IDQwNCA9PSBzdGF0dXM7XG4gIHRoaXMuZm9yYmlkZGVuID0gNDAzID09IHN0YXR1cztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVxID0gdGhpcy5yZXE7XG4gIHZhciBtZXRob2QgPSByZXEubWV0aG9kO1xuICB2YXIgdXJsID0gcmVxLnVybDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgdXJsICsgJyAoJyArIHRoaXMuc3RhdHVzICsgJyknO1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLm1ldGhvZCA9IG1ldGhvZDtcbiAgZXJyLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICAgIGlmICgnSEVBRCcgPT0gbWV0aG9kKSByZXMudGV4dCA9IG51bGw7XG4gICAgICBzZWxmLmNhbGxiYWNrKG51bGwsIHJlcyk7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICBzZWxmLmNhbGxiYWNrKGVycik7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn1cblxuLyoqXG4gKiBTZXQgdGltZW91dCB0byBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihtcyl7XG4gIHRoaXMuX3RpbWVvdXQgPSBtcztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3RpbWVvdXQgPSAwO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWJvcnQgdGhlIHJlcXVlc3QsIGFuZCBjbGVhciBwb3RlbnRpYWwgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmFib3J0ZWQpIHJldHVybjtcbiAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcbiAgdGhpcy54aHIuYWJvcnQoKTtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5zZXQoJ1gtQVBJLUtleScsICdmb29iYXInKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxLmdldCgnLycpXG4gKiAgICAgICAgLnNldCh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLCAnWC1BUEktS2V5JzogJ2Zvb2JhcicgfSlcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCl7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZmllbGQpIHtcbiAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbDtcbiAgdGhpcy5oZWFkZXJbZmllbGRdID0gdmFsO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGhlYWRlciBgZmllbGRgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAudW5zZXQoJ1VzZXItQWdlbnQnKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpe1xuICBkZWxldGUgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xuICBkZWxldGUgdGhpcy5oZWFkZXJbZmllbGRdO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgaGVhZGVyIGBmaWVsZGAgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5nZXRIZWFkZXIgPSBmdW5jdGlvbihmaWVsZCl7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIFNldCBDb250ZW50LVR5cGUgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCd4bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ2FwcGxpY2F0aW9uL3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudHlwZSA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpe1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXNzXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3Mpe1xuICB2YXIgc3RyID0gYnRvYSh1c2VyICsgJzonICsgcGFzcyk7XG4gIHRoaXMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0Jhc2ljICcgKyBzdHIpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuKiBBZGQgcXVlcnktc3RyaW5nIGB2YWxgLlxuKlxuKiBFeGFtcGxlczpcbipcbiogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4qICAgICAucXVlcnkoeyBjb2xvcjogJ2JsdWUnIH0pXG4qXG4qIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4qIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuKiBAYXBpIHB1YmxpY1xuKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbih2YWwpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHZhbCkgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgIGZvciBcIm11bHRpcGFydC9mb3JtLWRhdGFcIlxuICogcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmZpZWxkID0gZnVuY3Rpb24obmFtZSwgdmFsKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgdGhpcy5fZm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBRdWV1ZSB0aGUgZ2l2ZW4gYGZpbGVgIGFzIGFuIGF0dGFjaG1lbnQgdG8gdGhlIHNwZWNpZmllZCBgZmllbGRgLFxuICogd2l0aCBvcHRpb25hbCBgZmlsZW5hbWVgLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaChuZXcgQmxvYihbJzxhIGlkPVwiYVwiPjxiIGlkPVwiYlwiPmhleSE8L2I+PC9hPiddLCB7IHR5cGU6IFwidGV4dC9odG1sXCJ9KSlcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEBwYXJhbSB7QmxvYnxGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbihmaWVsZCwgZmlsZSwgZmlsZW5hbWUpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgLCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbXVsdGlwbGUgZGF0YSBcIndyaXRlc1wiXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5zZW5kKHsgc2VhcmNoOiAncXVlcnknIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgcmFuZ2U6ICcxLi41JyB9KVxuICogICAgICAgICAuc2VuZCh7IG9yZGVyOiAnZGVzYycgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqKSByZXR1cm4gdGhpcztcbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludm9rZSB0aGUgY2FsbGJhY2sgd2l0aCBgZXJyYCBhbmQgYHJlc2BcbiAqIGFuZCBoYW5kbGUgYXJpdHkgY2hlY2suXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSByZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNhbGxiYWNrID0gZnVuY3Rpb24oZXJyLCByZXMpe1xuICB2YXIgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgaWYgKDIgPT0gZm4ubGVuZ3RoKSByZXR1cm4gZm4oZXJyLCByZXMpO1xuICBpZiAoZXJyKSByZXR1cm4gdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIGZuKHJlcyk7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHgtZG9tYWluIGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmNyb3NzRG9tYWluRXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCdPcmlnaW4gaXMgbm90IGFsbG93ZWQgYnkgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0RXJyb3IgPSBmdW5jdGlvbigpe1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3RpbWVvdXQgb2YgJyArIHRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnKTtcbiAgZXJyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLndpdGhDcmVkZW50aWFscyA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbml0aWF0ZSByZXF1ZXN0LCBpbnZva2luZyBjYWxsYmFjayBgZm4ocmVzKWBcbiAqIHdpdGggYW4gaW5zdGFuY2VvZiBgUmVzcG9uc2VgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciB4aHIgPSB0aGlzLnhociA9IGdldFhIUigpO1xuICB2YXIgcXVlcnkgPSB0aGlzLl9xdWVyeS5qb2luKCcmJyk7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIC8vIHN0b3JlIGNhbGxiYWNrXG4gIHRoaXMuX2NhbGxiYWNrID0gZm4gfHwgbm9vcDtcblxuICAvLyBzdGF0ZSBjaGFuZ2VcbiAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKDQgIT0geGhyLnJlYWR5U3RhdGUpIHJldHVybjtcbiAgICBpZiAoMCA9PSB4aHIuc3RhdHVzKSB7XG4gICAgICBpZiAoc2VsZi5hYm9ydGVkKSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wZXJjZW50ID0gZS5sb2FkZWQgLyBlLnRvdGFsICogMTAwO1xuICAgICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICAgIH07XG4gIH1cblxuICAvLyB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ICYmICF0aGlzLl90aW1lcikge1xuICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplW3RoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKV07XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIlxuLyoqXG4gKiBSZWR1Y2UgYGFycmAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxcbiAqXG4gKiBUT0RPOiBjb21iYXRpYmxlIGVycm9yIGhhbmRsaW5nP1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbiwgaW5pdGlhbCl7ICBcbiAgdmFyIGlkeCA9IDA7XG4gIHZhciBsZW4gPSBhcnIubGVuZ3RoO1xuICB2YXIgY3VyciA9IGFyZ3VtZW50cy5sZW5ndGggPT0gM1xuICAgID8gaW5pdGlhbFxuICAgIDogYXJyW2lkeCsrXTtcblxuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgY3VyciA9IGZuLmNhbGwobnVsbCwgY3VyciwgYXJyW2lkeF0sICsraWR4LCBhcnIpO1xuICB9XG4gIFxuICByZXR1cm4gY3Vycjtcbn07IixudWxsLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiJdfQ==
