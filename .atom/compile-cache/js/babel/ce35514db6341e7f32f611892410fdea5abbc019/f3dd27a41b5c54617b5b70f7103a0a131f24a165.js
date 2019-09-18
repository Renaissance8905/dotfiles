function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/** @babel */

var _formatter = require('./formatter');

var formatter = _interopRequireWildcard(_formatter);

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

function isOption(option, options, fallback) {
  return options && typeof options[option] !== 'undefined' ? options[option] : fallback();
}

function isEntire(options, fallback) {
  return isOption('entire', options, fallback);
}

function isSelected(options, fallback) {
  return isOption('selected', options, fallback);
}

function isSorted(options, fallback) {
  return isOption('sorted', options, fallback);
}

var PrettyJSON = {
  config: {
    notifyOnParseError: {
      type: 'boolean',
      'default': true
    },
    prettifyOnSaveJSON: {
      type: 'boolean',
      'default': false,
      title: 'Prettify On Save JSON'
    },
    grammars: {
      type: 'array',
      'default': ['source.json', 'text.plain.null-grammar']
    }
  },

  doEntireFile: function doEntireFile(editor) {
    var save = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    // don't allow prettify-on-save for null grammar; causes too many false positives
    if (save && editor.getGrammar().scopeName === 'text.plain.null-grammar') return false;

    var grammars = atom.config.get('pretty-json.grammars');
    if (typeof grammars === 'undefined' || !editor) return false;
    if (!grammars.includes(editor.getGrammar().scopeName)) return false;
    return editor.getLastSelection().isEmpty();
  },

  replaceText: function replaceText(editor, fn) {
    editor.mutateSelectedText(function (selection) {
      selection.getBufferRange();
      var text = selection.getText();
      selection.deleteSelectedText();
      var range = selection.insertText(fn(text));
      selection.setBufferRange(range);
    });
  },

  prettify: function prettify(editor, options) {
    var _this = this;

    if (!editor) return;
    var pos = undefined;
    var entire = isEntire(options, function () {
      return _this.doEntireFile(editor);
    });
    var sorted = isSorted(options, function () {
      return true;
    });
    var selected = isSelected(options, function () {
      return true;
    });
    if (entire) {
      pos = editor.getCursorScreenPosition();
      editor.setText(formatter.pretty(editor.getText(), {
        scope: editor.getRootScopeDescriptor(),
        sorted: sorted
      }));
    } else {
      pos = editor.getLastSelection().getScreenRange().start;
      this.replaceText(editor, function (text) {
        return formatter.pretty(text, {
          scope: ['source.json'],
          sorted: sorted
        });
      });
    }
    if (!selected) {
      editor.setCursorScreenPosition(pos);
    }
  },

  minify: function minify(editor, options) {
    var _this2 = this;

    var pos = undefined;
    var entire = isEntire(options, function () {
      return _this2.doEntireFile(editor);
    });
    var selected = isSelected(options, function () {
      return true;
    });
    if (entire) {
      pos = [0, 0];
      editor.setText(formatter.minify(editor.getText()));
    } else {
      pos = editor.getLastSelection().getScreenRange().start;
      this.replaceText(editor, function (text) {
        return formatter.minify(text);
      });
    }
    if (!selected) {
      editor.setCursorScreenPosition(pos);
    }
  },

  jsonify: function jsonify(editor, options) {
    var _this3 = this;

    var pos = undefined;
    var entire = isEntire(options, function () {
      return _this3.doEntireFile(editor);
    });
    var sorted = isSorted(options, function () {
      return false;
    });
    var selected = isSelected(options, function () {
      return true;
    });
    if (entire) {
      pos = editor.getCursorScreenPosition();
      editor.setText(formatter.jsonify(editor.getText(), {
        scope: editor.getRootScopeDescriptor(),
        sorted: sorted
      }));
    } else {
      pos = editor.getLastSelection().getScreenRange().start;
      this.replaceText(editor, function (text) {
        return formatter.jsonify(text, {
          scope: ['source.json'],
          sorted: sorted
        });
      });
    }
    if (!selected) {
      editor.setCursorScreenPosition(pos);
    }
  },

  activate: function activate() {
    var _this4 = this;

    atom.commands.add('atom-workspace', {
      'pretty-json:prettify': function prettyJsonPrettify() {
        var editor = atom.workspace.getActiveTextEditor();
        _this4.prettify(editor, {
          entire: _this4.doEntireFile(editor),
          sorted: false,
          selected: true
        });
      },
      'pretty-json:minify': function prettyJsonMinify() {
        var editor = atom.workspace.getActiveTextEditor();
        _this4.minify(editor, {
          entire: _this4.doEntireFile(editor),
          selected: true
        });
      },
      'pretty-json:sort-and-prettify': function prettyJsonSortAndPrettify() {
        var editor = atom.workspace.getActiveTextEditor();
        _this4.prettify(editor, {
          entire: _this4.doEntireFile(editor),
          sorted: true,
          selected: true
        });
      },
      'pretty-json:jsonify-literal-and-prettify': function prettyJsonJsonifyLiteralAndPrettify() {
        var editor = atom.workspace.getActiveTextEditor();
        _this4.jsonify(editor, {
          entire: _this4.doEntireFile(editor),
          sorted: false,
          selected: true
        });
      },
      'pretty-json:jsonify-literal-and-sort-and-prettify': function prettyJsonJsonifyLiteralAndSortAndPrettify() {
        var editor = atom.workspace.getActiveTextEditor();
        _this4.jsonify(editor, {
          entire: _this4.doEntireFile(editor),
          sorted: true,
          selected: true
        });
      }
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('pretty-json.prettifyOnSaveJSON', function (value) {
      if (_this4.saveSubscriptions != null) {
        _this4.saveSubscriptions.dispose();
      }
      _this4.saveSubscriptions = new CompositeDisposable();
      if (value) {
        _this4.subscribeToSaveEvents();
      }
    }));
  },

  subscribeToSaveEvents: function subscribeToSaveEvents() {
    var _this5 = this;

    this.saveSubscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      if (!(editor != null ? editor.getBuffer() : undefined)) {
        return;
      }
      var bufferSubscriptions = new CompositeDisposable();
      bufferSubscriptions.add(editor.getBuffer().onWillSave(function (filePath) {
        if (_this5.doEntireFile(editor, true)) {
          return _this5.prettify(editor, {
            entire: true,
            sorted: false,
            selected: false
          });
        }
      }));
      bufferSubscriptions.add(editor.getBuffer().onDidDestroy(function () {
        return bufferSubscriptions.dispose();
      }));
      _this5.saveSubscriptions.add(bufferSubscriptions);
    }));
  },

  deactivate: function deactivate() {
    if (this.subscriptions != null) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
  }
};

module.exports = PrettyJSON;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9wcmV0dHktanNvbi9zcmMvaW5pdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3lCQUUyQixhQUFhOztJQUE1QixTQUFTOztlQUNXLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXZDLG1CQUFtQixZQUFuQixtQkFBbUI7O0FBRTNCLFNBQVMsUUFBUSxDQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQzVDLFNBQU8sT0FBTyxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUE7Q0FDeEY7O0FBRUQsU0FBUyxRQUFRLENBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUNwQyxTQUFPLFFBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0NBQzdDOztBQUVELFNBQVMsVUFBVSxDQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDdEMsU0FBTyxRQUFRLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtDQUMvQzs7QUFFRCxTQUFTLFFBQVEsQ0FBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ3BDLFNBQU8sUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7Q0FDN0M7O0FBRUQsSUFBTSxVQUFVLEdBQUc7QUFDakIsUUFBTSxFQUFFO0FBQ04sc0JBQWtCLEVBQUU7QUFDbEIsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxzQkFBa0IsRUFBRTtBQUNsQixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7QUFDZCxXQUFLLEVBQUUsdUJBQXVCO0tBQy9CO0FBQ0QsWUFBUSxFQUFFO0FBQ1IsVUFBSSxFQUFFLE9BQU87QUFDYixpQkFBUyxDQUFDLGFBQWEsRUFBRSx5QkFB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QUFHLElBQUksQ0FBQTtHQUMxQjtDQUNGLENBQUE7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUEiLCJmaWxlIjoiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3ByZXR0eS1qc29uL3NyYy9pbml0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5pbXBvcnQgKiBhcyBmb3JtYXR0ZXIgZnJvbSAnLi9mb3JtYXR0ZXInXG5jb25zdCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSA9IHJlcXVpcmUoJ2F0b20nKVxuXG5mdW5jdGlvbiBpc09wdGlvbiAob3B0aW9uLCBvcHRpb25zLCBmYWxsYmFjaykge1xuICByZXR1cm4gb3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9uc1tvcHRpb25dICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnNbb3B0aW9uXSA6IGZhbGxiYWNrKClcbn1cblxuZnVuY3Rpb24gaXNFbnRpcmUgKG9wdGlvbnMsIGZhbGxiYWNrKSB7XG4gIHJldHVybiBpc09wdGlvbignZW50aXJlJywgb3B0aW9ucywgZmFsbGJhY2spXG59XG5cbmZ1bmN0aW9uIGlzU2VsZWN0ZWQgKG9wdGlvbnMsIGZhbGxiYWNrKSB7XG4gIHJldHVybiBpc09wdGlvbignc2VsZWN0ZWQnLCBvcHRpb25zLCBmYWxsYmFjaylcbn1cblxuZnVuY3Rpb24gaXNTb3J0ZWQgKG9wdGlvbnMsIGZhbGxiYWNrKSB7XG4gIHJldHVybiBpc09wdGlvbignc29ydGVkJywgb3B0aW9ucywgZmFsbGJhY2spXG59XG5cbmNvbnN0IFByZXR0eUpTT04gPSB7XG4gIGNvbmZpZzoge1xuICAgIG5vdGlmeU9uUGFyc2VFcnJvcjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgcHJldHRpZnlPblNhdmVKU09OOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHRpdGxlOiAnUHJldHRpZnkgT24gU2F2ZSBKU09OJ1xuICAgIH0sXG4gICAgZ3JhbW1hcnM6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBkZWZhdWx0OiBbJ3NvdXJjZS5qc29uJywgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJ11cbiAgICB9XG4gIH0sXG5cbiAgZG9FbnRpcmVGaWxlIChlZGl0b3IsIHNhdmUgPSBmYWxzZSkge1xuICAgIC8vIGRvbid0IGFsbG93IHByZXR0aWZ5LW9uLXNhdmUgZm9yIG51bGwgZ3JhbW1hcjsgY2F1c2VzIHRvbyBtYW55IGZhbHNlIHBvc2l0aXZlc1xuICAgIGlmIChzYXZlICYmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lID09PSAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInKSByZXR1cm4gZmFsc2VcblxuICAgIGNvbnN0IGdyYW1tYXJzID0gYXRvbS5jb25maWcuZ2V0KCdwcmV0dHktanNvbi5ncmFtbWFycycpXG4gICAgaWYgKHR5cGVvZiBncmFtbWFycyA9PT0gJ3VuZGVmaW5lZCcgfHwgIWVkaXRvcikgcmV0dXJuIGZhbHNlXG4gICAgaWYgKCFncmFtbWFycy5pbmNsdWRlcyhlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzRW1wdHkoKVxuICB9LFxuXG4gIHJlcGxhY2VUZXh0IChlZGl0b3IsIGZuKSB7XG4gICAgZWRpdG9yLm11dGF0ZVNlbGVjdGVkVGV4dChzZWxlY3Rpb24gPT4ge1xuICAgICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGNvbnN0IHRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQoZm4odGV4dCkpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgfSlcbiAgfSxcblxuICBwcmV0dGlmeSAoZWRpdG9yLCBvcHRpb25zKSB7XG4gICAgaWYgKCFlZGl0b3IpIHJldHVyblxuICAgIGxldCBwb3NcbiAgICBjb25zdCBlbnRpcmUgPSBpc0VudGlyZShvcHRpb25zLCAoKSA9PiB0aGlzLmRvRW50aXJlRmlsZShlZGl0b3IpKVxuICAgIGNvbnN0IHNvcnRlZCA9IGlzU29ydGVkKG9wdGlvbnMsICgpID0+IHRydWUpXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBpc1NlbGVjdGVkKG9wdGlvbnMsICgpID0+IHRydWUpXG4gICAgaWYgKGVudGlyZSkge1xuICAgICAgcG9zID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICAgIGVkaXRvci5zZXRUZXh0KFxuICAgICAgICBmb3JtYXR0ZXIucHJldHR5KGVkaXRvci5nZXRUZXh0KCksIHtcbiAgICAgICAgICBzY29wZTogZWRpdG9yLmdldFJvb3RTY29wZURlc2NyaXB0b3IoKSxcbiAgICAgICAgICBzb3J0ZWRcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zID0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5nZXRTY3JlZW5SYW5nZSgpLnN0YXJ0XG4gICAgICB0aGlzLnJlcGxhY2VUZXh0KGVkaXRvciwgdGV4dCA9PiBmb3JtYXR0ZXIucHJldHR5KHRleHQsIHtcbiAgICAgICAgc2NvcGU6IFsnc291cmNlLmpzb24nXSxcbiAgICAgICAgc29ydGVkXG4gICAgICB9KSlcbiAgICB9XG4gICAgaWYgKCFzZWxlY3RlZCkge1xuICAgICAgZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKHBvcylcbiAgICB9XG4gIH0sXG5cbiAgbWluaWZ5IChlZGl0b3IsIG9wdGlvbnMpIHtcbiAgICBsZXQgcG9zXG4gICAgY29uc3QgZW50aXJlID0gaXNFbnRpcmUob3B0aW9ucywgKCkgPT4gdGhpcy5kb0VudGlyZUZpbGUoZWRpdG9yKSlcbiAgICBjb25zdCBzZWxlY3RlZCA9IGlzU2VsZWN0ZWQob3B0aW9ucywgKCkgPT4gdHJ1ZSlcbiAgICBpZiAoZW50aXJlKSB7XG4gICAgICBwb3MgPSBbMCwgMF1cbiAgICAgIGVkaXRvci5zZXRUZXh0KGZvcm1hdHRlci5taW5pZnkoZWRpdG9yLmdldFRleHQoKSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcyA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0U2NyZWVuUmFuZ2UoKS5zdGFydFxuICAgICAgdGhpcy5yZXBsYWNlVGV4dChlZGl0b3IsIHRleHQgPT4gZm9ybWF0dGVyLm1pbmlmeSh0ZXh0KSlcbiAgICB9XG4gICAgaWYgKCFzZWxlY3RlZCkge1xuICAgICAgZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKHBvcylcbiAgICB9XG4gIH0sXG5cbiAganNvbmlmeSAoZWRpdG9yLCBvcHRpb25zKSB7XG4gICAgbGV0IHBvc1xuICAgIGNvbnN0IGVudGlyZSA9IGlzRW50aXJlKG9wdGlvbnMsICgpID0+IHRoaXMuZG9FbnRpcmVGaWxlKGVkaXRvcikpXG4gICAgY29uc3Qgc29ydGVkID0gaXNTb3J0ZWQob3B0aW9ucywgKCkgPT4gZmFsc2UpXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBpc1NlbGVjdGVkKG9wdGlvbnMsICgpID0+IHRydWUpXG4gICAgaWYgKGVudGlyZSkge1xuICAgICAgcG9zID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICAgIGVkaXRvci5zZXRUZXh0KGZvcm1hdHRlci5qc29uaWZ5KGVkaXRvci5nZXRUZXh0KCksIHtcbiAgICAgICAgc2NvcGU6IGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCksXG4gICAgICAgIHNvcnRlZFxuICAgICAgfSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBvcyA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuZ2V0U2NyZWVuUmFuZ2UoKS5zdGFydFxuICAgICAgdGhpcy5yZXBsYWNlVGV4dChlZGl0b3IsIHRleHQgPT4gZm9ybWF0dGVyLmpzb25pZnkodGV4dCwge1xuICAgICAgICBzY29wZTogWydzb3VyY2UuanNvbiddLFxuICAgICAgICBzb3J0ZWRcbiAgICAgIH0pKVxuICAgIH1cbiAgICBpZiAoIXNlbGVjdGVkKSB7XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24ocG9zKVxuICAgIH1cbiAgfSxcblxuICBhY3RpdmF0ZSAoKSB7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ3ByZXR0eS1qc29uOnByZXR0aWZ5JzogKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgdGhpcy5wcmV0dGlmeShlZGl0b3IsIHtcbiAgICAgICAgICBlbnRpcmU6IHRoaXMuZG9FbnRpcmVGaWxlKGVkaXRvciksXG4gICAgICAgICAgc29ydGVkOiBmYWxzZSxcbiAgICAgICAgICBzZWxlY3RlZDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgICdwcmV0dHktanNvbjptaW5pZnknOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICB0aGlzLm1pbmlmeShlZGl0b3IsIHtcbiAgICAgICAgICBlbnRpcmU6IHRoaXMuZG9FbnRpcmVGaWxlKGVkaXRvciksXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICAncHJldHR5LWpzb246c29ydC1hbmQtcHJldHRpZnknOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICB0aGlzLnByZXR0aWZ5KGVkaXRvciwge1xuICAgICAgICAgIGVudGlyZTogdGhpcy5kb0VudGlyZUZpbGUoZWRpdG9yKSxcbiAgICAgICAgICBzb3J0ZWQ6IHRydWUsXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICAncHJldHR5LWpzb246anNvbmlmeS1saXRlcmFsLWFuZC1wcmV0dGlmeSc6ICgpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHRoaXMuanNvbmlmeShlZGl0b3IsIHtcbiAgICAgICAgICBlbnRpcmU6IHRoaXMuZG9FbnRpcmVGaWxlKGVkaXRvciksXG4gICAgICAgICAgc29ydGVkOiBmYWxzZSxcbiAgICAgICAgICBzZWxlY3RlZDogdHJ1ZVxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgICdwcmV0dHktanNvbjpqc29uaWZ5LWxpdGVyYWwtYW5kLXNvcnQtYW5kLXByZXR0aWZ5JzogKCkgPT4ge1xuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgdGhpcy5qc29uaWZ5KGVkaXRvciwge1xuICAgICAgICAgIGVudGlyZTogdGhpcy5kb0VudGlyZUZpbGUoZWRpdG9yKSxcbiAgICAgICAgICBzb3J0ZWQ6IHRydWUsXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgncHJldHR5LWpzb24ucHJldHRpZnlPblNhdmVKU09OJywgdmFsdWUgPT4ge1xuICAgICAgaWYgKHRoaXMuc2F2ZVN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgdGhpcy5zYXZlU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvU2F2ZUV2ZW50cygpXG4gICAgICB9XG4gICAgfSkpXG4gIH0sXG5cbiAgc3Vic2NyaWJlVG9TYXZlRXZlbnRzICgpIHtcbiAgICB0aGlzLnNhdmVTdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIGlmICghKGVkaXRvciAhPSBudWxsID8gZWRpdG9yLmdldEJ1ZmZlcigpIDogdW5kZWZpbmVkKSkgeyByZXR1cm4gfVxuICAgICAgY29uc3QgYnVmZmVyU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5nZXRCdWZmZXIoKS5vbldpbGxTYXZlKGZpbGVQYXRoID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZG9FbnRpcmVGaWxlKGVkaXRvciwgdHJ1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wcmV0dGlmeShlZGl0b3IsIHtcbiAgICAgICAgICAgIGVudGlyZTogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RlZDogZmFsc2VcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KSlcbiAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZERlc3Ryb3koKCkgPT4gYnVmZmVyU3Vic2NyaXB0aW9ucy5kaXNwb3NlKCkpKVxuICAgICAgdGhpcy5zYXZlU3Vic2NyaXB0aW9ucy5hZGQoYnVmZmVyU3Vic2NyaXB0aW9ucylcbiAgICB9KSlcbiAgfSxcblxuICBkZWFjdGl2YXRlICgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbnVsbFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJldHR5SlNPTlxuIl19