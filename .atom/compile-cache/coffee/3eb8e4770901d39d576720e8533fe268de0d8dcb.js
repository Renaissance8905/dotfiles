(function() {
  var $, BufferedProcess, CompositeDisposable, Disposable, PlantumlPreviewView, ScrollView, beautify_html, clipboard, editorForId, fs, os, path, ref, ref1, settingsError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-space-pen-views'), $ = ref.$, ScrollView = ref.ScrollView;

  ref1 = require('atom'), Disposable = ref1.Disposable, CompositeDisposable = ref1.CompositeDisposable, BufferedProcess = ref1.BufferedProcess;

  clipboard = null;

  path = null;

  fs = null;

  os = null;

  beautify_html = null;

  editorForId = function(editorId) {
    var editor, i, len, ref2, ref3;
    ref2 = atom.workspace.getTextEditors();
    for (i = 0, len = ref2.length; i < len; i++) {
      editor = ref2[i];
      if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
        return editor;
      }
    }
    return null;
  };

  settingsError = function(message, setting, path) {
    var detail, options;
    detail = "Verify '" + setting + "' in settings.";
    if (path.match(/["']/)) {
      detail += "\nSuggestion: Remove single/double quotes from the path string.";
    }
    options = {
      detail: detail,
      buttons: [
        {
          text: 'Open Package Settings',
          onDidClick: function() {
            return atom.workspace.open('atom://config/packages/plantuml-preview', {
              searchAllPanes: true
            });
          }
        }
      ],
      dismissable: true
    };
    return atom.notifications.addError("plantuml-preview: " + message, options);
  };

  module.exports = PlantumlPreviewView = (function(superClass) {
    extend(PlantumlPreviewView, superClass);

    PlantumlPreviewView.content = function() {
      return this.div({
        "class": 'plantuml-preview padded pane-item',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'plantuml-control',
            outlet: 'control'
          }, function() {
            _this.div(function() {
              _this.input({
                id: 'zoomToFit',
                type: 'checkbox',
                outlet: 'zoomToFit'
              });
              return _this.label('Zoom To Fit');
            });
            _this.div(function() {
              _this.input({
                id: 'useTempDir',
                type: 'checkbox',
                outlet: 'useTempDir'
              });
              return _this.label('Use Temp Dir');
            });
            return _this.div(function() {
              _this.label('Output');
              return _this.select({
                outlet: 'outputFormat'
              }, function() {
                _this.option({
                  value: 'png'
                }, 'png');
                return _this.option({
                  value: 'svg'
                }, 'svg');
              });
            });
          });
          return _this.div({
            "class": 'plantuml-container',
            outlet: 'container'
          });
        };
      })(this));
    };

    function PlantumlPreviewView(arg) {
      this.editorId = arg.editorId;
      PlantumlPreviewView.__super__.constructor.apply(this, arguments);
      this.editor = editorForId(this.editorId);
      this.disposables = new CompositeDisposable;
      this.imageInfo = {
        scale: 1
      };
    }

    PlantumlPreviewView.prototype.destroy = function() {
      return this.disposables.dispose();
    };

    PlantumlPreviewView.prototype.attached = function() {
      var checkHandler, saveHandler;
      if (this.editor != null) {
        this.useTempDir.attr('checked', atom.config.get('plantuml-preview.useTempDir'));
        this.outputFormat.val(atom.config.get('plantuml-preview.outputFormat'));
        this.zoomToFit.attr('checked', atom.config.get('plantuml-preview.zoomToFit'));
        checkHandler = (function(_this) {
          return function(checked) {
            return _this.setZoomFit(checked);
          };
        })(this);
        this.on('change', '#zoomToFit', function() {
          return checkHandler(this.checked);
        });
        saveHandler = (function(_this) {
          return function() {
            return _this.renderUml();
          };
        })(this);
        this.disposables.add(this.editor.getBuffer().onDidSave(function() {
          return saveHandler();
        }));
        this.outputFormat.change(function() {
          return saveHandler();
        });
        if (atom.config.get('plantuml-preview.bringFront')) {
          this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
            return function(item) {
              var pane;
              if (item === _this.editor) {
                pane = atom.workspace.paneForItem(_this);
                if ((typeof pane !== 'undefined') && (pane !== null)) {
                  return pane.activateItem(_this);
                }
              }
            };
          })(this)));
        }
        atom.commands.add(this.element, {
          'plantuml-preview:zoom-in': (function(_this) {
            return function() {
              _this.imageInfo.scale = _this.imageInfo.scale * 1.1;
              return _this.scaleImages();
            };
          })(this),
          'plantuml-preview:zoom-out': (function(_this) {
            return function() {
              _this.imageInfo.scale = _this.imageInfo.scale * 0.9;
              return _this.scaleImages();
            };
          })(this),
          'plantuml-preview:zoom-reset': (function(_this) {
            return function() {
              _this.imageInfo.scale = 1;
              return _this.scaleImages();
            };
          })(this),
          'plantuml-preview:zoom-fit': (function(_this) {
            return function() {
              _this.zoomToFit.prop('checked', !_this.zoomToFit.is(':checked'));
              return _this.setZoomFit(_this.zoomToFit.is(':checked'));
            };
          })(this),
          'plantuml-preview:copy-image': (function(_this) {
            return function(event) {
              var buffer, err, ext, filename;
              filename = $(event.target).closest('.uml-image').attr('file');
              ext = path.extname(filename);
              switch (ext) {
                case '.png':
                  if (clipboard == null) {
                    clipboard = require('electron').clipboard;
                  }
                  try {
                    return clipboard.writeImage(filename);
                  } catch (error) {
                    err = error;
                    atom.notifications.addError("plantuml-preview: Copy Failed", {
                      detail: "Error attempting to copy: " + filename + "\nSee console for details.",
                      dismissable: true
                    });
                    return console.log(err);
                  }
                  break;
                case '.svg':
                  try {
                    buffer = fs.readFileSync(filename, _this.editor.getEncoding());
                    if (atom.config.get('plantuml-preview.beautifyXml')) {
                      if (beautify_html == null) {
                        beautify_html = require('js-beautify').html;
                      }
                      buffer = beautify_html(buffer);
                    }
                    return atom.clipboard.write(buffer);
                  } catch (error) {
                    err = error;
                    atom.notifications.addError("plantuml-preview: Copy Failed", {
                      detail: "Error attempting to copy: " + filename + "\nSee console for details.",
                      dismissable: true
                    });
                    return console.log(err);
                  }
                  break;
                default:
                  return atom.notifications.addError("plantuml-preview: Unsupported File Format", {
                    detail: ext + " is not currently supported by 'Copy Diagram'.",
                    dismissable: true
                  });
              }
            };
          })(this),
          'plantuml-preview:open-file': function(event) {
            var filename;
            filename = $(event.target).closest('.open-file').attr('file');
            return atom.workspace.open(filename);
          },
          'plantuml-preview:copy-filename': function(event) {
            var filename;
            filename = $(event.target).closest('.copy-filename').attr('file');
            return atom.clipboard.write(filename);
          }
        });
        return this.renderUml();
      }
    };

    PlantumlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    PlantumlPreviewView.prototype.getURI = function() {
      if (this.editor != null) {
        return "plantuml-preview://editor/" + this.editor.id;
      }
    };

    PlantumlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return (this.editor.getTitle()) + " Preview";
      }
    };

    PlantumlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    PlantumlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    PlantumlPreviewView.prototype.addImages = function(imgFiles, time) {
      var displayFilenames, div, file, i, imageInfo, img, len, zoomToFit;
      this.container.empty();
      displayFilenames = atom.config.get('plantuml-preview.displayFilename');
      for (i = 0, len = imgFiles.length; i < len; i++) {
        file = imgFiles[i];
        if (displayFilenames) {
          div = $('<div/>').attr('class', 'filename open-file copy-filename').attr('file', file).text("" + file);
          this.container.append(div);
        }
        imageInfo = this.imageInfo;
        zoomToFit = this.zoomToFit.is(':checked');
        img = $('<img/>').attr('src', file + "?time=" + time).attr('file', file).load(function() {
          var info, name;
          img = $(this);
          file = img.attr('file');
          name = path.basename(file, path.extname(file));
          if (imageInfo.hasOwnProperty(name)) {
            info = imageInfo[name];
          } else {
            info = {};
          }
          info.origWidth = img.width();
          info.origHeight = img.height();
          imageInfo[name] = info;
          img.attr('width', imageInfo.scale * info.origWidth);
          img.attr('height', imageInfo.scale * info.origHeight);
          img.attr('class', 'uml-image open-file copy-filename');
          if (zoomToFit) {
            return img.addClass('zoomToFit');
          }
        });
        this.container.append(img);
      }
      return this.container.show;
    };

    PlantumlPreviewView.prototype.scaleImages = function() {
      var e, file, i, img, len, name, ref2;
      ref2 = this.container.find('.uml-image');
      for (i = 0, len = ref2.length; i < len; i++) {
        e = ref2[i];
        img = $(e);
        file = img.attr('file');
        name = path.basename(file, path.extname(file));
        img.attr('width', this.imageInfo.scale * this.imageInfo[name].origWidth);
        img.attr('height', this.imageInfo.scale * this.imageInfo[name].origHeight);
      }
      this.zoomToFit.prop('checked', false);
      return this.setZoomFit(this.zoomToFit.is(':checked'));
    };

    PlantumlPreviewView.prototype.removeImages = function() {
      this.container.empty();
      this.container.append($('<div/>').attr('class', 'throbber'));
      return this.container.show;
    };

    PlantumlPreviewView.prototype.setZoomFit = function(checked) {
      if (checked) {
        return this.container.find('.uml-image').addClass('zoomToFit');
      } else {
        return this.container.find('.uml-image').removeClass('zoomToFit');
      }
    };

    PlantumlPreviewView.prototype.getFilenames = function(directory, defaultName, defaultExtension, contents) {
      var countStr, currentExtension, currentFilename, defaultCount, defaultFilename, filename, filenames, i, j, len, len1, line, newfile, pageCount, ref2, ref3, uml;
      if (path == null) {
        path = require('path');
      }
      filenames = [];
      defaultFilename = path.join(directory, defaultName);
      defaultCount = 0;
      ref2 = contents.split(/@end(?:uml|math|latex)/i);
      for (i = 0, len = ref2.length; i < len; i++) {
        uml = ref2[i];
        if (uml.trim() === '') {
          continue;
        }
        currentFilename = path.join(directory, defaultName);
        currentExtension = defaultExtension;
        pageCount = 1;
        filename = uml.match(/@start(?:uml|math|latex)([^\n]*)\n/i);
        if (filename != null) {
          filename = filename[1].trim();
          if (filename !== '') {
            if (path.extname(filename)) {
              currentExtension = path.extname(filename);
            } else {
              currentExtension = defaultExtension;
            }
            currentFilename = path.join(directory, filename.replace(currentExtension, ''));
          }
        }
        if (currentFilename === defaultFilename) {
          if (defaultCount > 0) {
            countStr = defaultCount + '';
            countStr = '000'.substring(countStr.length) + countStr;
            newfile = currentFilename + "_" + countStr + currentExtension;
            if (indexOf.call(filenames, newfile) < 0) {
              filenames.push(newfile);
            }
          } else {
            newfile = currentFilename + currentExtension;
            if (indexOf.call(filenames, newfile) < 0) {
              filenames.push(newfile);
            }
          }
          defaultCount++;
        } else {
          newfile = currentFilename + currentExtension;
          if (indexOf.call(filenames, newfile) < 0) {
            filenames.push(newfile);
          }
        }
        ref3 = uml.split('\n');
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          line = ref3[j];
          if (line.match(/^[\s]*(newpage)/i)) {
            countStr = pageCount + '';
            countStr = '000'.substring(countStr.length) + countStr;
            newfile = currentFilename + "_" + countStr + currentExtension;
            if (indexOf.call(filenames, newfile) < 0) {
              filenames.push(newfile);
            }
            pageCount++;
          }
        }
      }
      return filenames;
    };

    PlantumlPreviewView.prototype.renderUml = function() {
      var args, basename, command, directory, dotLocation, errorHandler, errorlog, exit, exitHandler, filePath, fileTime, format, i, image, imgFiles, jarAdditional, jarLocation, javaAdditional, len, outputlog, settingError, stderr, stdout, upToDate;
      if (path == null) {
        path = require('path');
      }
      if (fs == null) {
        fs = require('fs-plus');
      }
      if (os == null) {
        os = require('os');
      }
      filePath = this.editor.getPath();
      basename = path.basename(filePath, path.extname(filePath));
      directory = path.dirname(filePath);
      format = this.outputFormat.val();
      settingError = false;
      if (this.useTempDir.is(':checked')) {
        directory = path.join(os.tmpdir(), 'plantuml-preview');
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory);
        }
      }
      imgFiles = this.getFilenames(directory, basename, '.' + format, this.editor.getText());
      upToDate = true;
      fileTime = fs.statSync(filePath).mtime;
      for (i = 0, len = imgFiles.length; i < len; i++) {
        image = imgFiles[i];
        if (fs.isFileSync(image)) {
          if (fileTime > fs.statSync(image).mtime) {
            upToDate = false;
            break;
          }
        } else {
          upToDate = false;
          break;
        }
      }
      if (upToDate) {
        this.removeImages();
        this.addImages(imgFiles, Date.now());
        return;
      }
      command = atom.config.get('plantuml-preview.java');
      if ((command !== 'java') && (!fs.isFileSync(command))) {
        settingsError(command + " is not a file.", 'Java Executable', command);
        settingError = true;
      }
      jarLocation = atom.config.get('plantuml-preview.jarLocation');
      if (!fs.isFileSync(jarLocation)) {
        settingsError(jarLocation + " is not a file.", 'PlantUML Jar', jarLocation);
        settingError = true;
      }
      dotLocation = atom.config.get('plantuml-preview.dotLocation');
      if (dotLocation !== '') {
        if (!fs.isFileSync(dotLocation)) {
          settingsError(dotLocation + " is not a file.", 'Graphvis Dot Executable', dotLocation);
          settingError = true;
        }
      }
      if (settingError) {
        this.container.empty();
        this.container.show;
        return;
      }
      args = ['-Djava.awt.headless=true'];
      javaAdditional = atom.config.get('plantuml-preview.javaAdditional');
      if (javaAdditional !== '') {
        args.push(javaAdditional);
      }
      args.push('-jar', jarLocation);
      jarAdditional = atom.config.get('plantuml-preview.jarAdditional');
      if (jarAdditional !== '') {
        args.push(jarAdditional);
      }
      args.push('-charset', this.editor.getEncoding());
      if (format === 'svg') {
        args.push('-tsvg');
      }
      if (dotLocation !== '') {
        args.push('-graphvizdot', dotLocation);
      }
      args.push('-output', directory, filePath);
      outputlog = [];
      errorlog = [];
      exitHandler = (function(_this) {
        return function(files) {
          var buffer, file, j, len1, str;
          for (j = 0, len1 = files.length; j < len1; j++) {
            file = files[j];
            if (fs.isFileSync(file)) {
              if (atom.config.get('plantuml-preview.beautifyXml') && (format === 'svg')) {
                if (beautify_html == null) {
                  beautify_html = require('js-beautify').html;
                }
                buffer = fs.readFileSync(file, _this.editor.getEncoding());
                buffer = beautify_html(buffer);
                fs.writeFileSync(file, buffer, {
                  encoding: _this.editor.getEncoding()
                });
              }
            } else {
              console.log("File not found: " + file);
            }
          }
          _this.addImages(files, Date.now());
          if (errorlog.length > 0) {
            str = errorlog.join('');
            if (str.match(/jarfile/i)) {
              settingsError(str, 'PlantUML Jar', jarLocation);
            } else {
              console.log("plantuml-preview: stderr\n" + str);
            }
          }
          if (outputlog.length > 0) {
            str = outputlog.join('');
            atom.notifications.addInfo("plantuml-preview: stdout (logged to console)", {
              detail: str,
              dismissable: true
            });
            return console.log("plantuml-preview: stdout\n" + str);
          }
        };
      })(this);
      exit = function(code) {
        return exitHandler(imgFiles);
      };
      stdout = function(output) {
        return outputlog.push(output);
      };
      stderr = function(output) {
        return errorlog.push(output);
      };
      errorHandler = function(object) {
        object.handle();
        return settingsError(command + " not found.", 'Java Executable', command);
      };
      this.removeImages();
      console.log(command + " " + (args.join(' ')));
      return new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      }).onWillThrowError(errorHandler);
    };

    return PlantumlPreviewView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3BsYW50dW1sLXByZXZpZXcvbGliL3BsYW50dW1sLXByZXZpZXctdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1LQUFBO0lBQUE7Ozs7RUFBQSxNQUFrQixPQUFBLENBQVEsc0JBQVIsQ0FBbEIsRUFBQyxTQUFELEVBQUk7O0VBQ0osT0FBcUQsT0FBQSxDQUFRLE1BQVIsQ0FBckQsRUFBQyw0QkFBRCxFQUFhLDhDQUFiLEVBQWtDOztFQUNsQyxTQUFBLEdBQVk7O0VBQ1osSUFBQSxHQUFPOztFQUNQLEVBQUEsR0FBSzs7RUFDTCxFQUFBLEdBQUs7O0VBQ0wsYUFBQSxHQUFnQjs7RUFFaEIsV0FBQSxHQUFjLFNBQUMsUUFBRDtBQUNaLFFBQUE7QUFBQTtBQUFBLFNBQUEsc0NBQUE7O01BQ0Usc0NBQTBCLENBQUUsUUFBWCxDQUFBLFdBQUEsS0FBeUIsUUFBUSxDQUFDLFFBQVQsQ0FBQSxDQUExQztBQUFBLGVBQU8sT0FBUDs7QUFERjtXQUVBO0VBSFk7O0VBS2QsYUFBQSxHQUFnQixTQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLElBQW5CO0FBQ2QsUUFBQTtJQUFBLE1BQUEsR0FBUyxVQUFBLEdBQVcsT0FBWCxHQUFtQjtJQUM1QixJQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBWCxDQUFIO01BQ0UsTUFBQSxJQUFVLGtFQURaOztJQUVBLE9BQUEsR0FBVTtNQUNSLE1BQUEsRUFBUSxNQURBO01BRVIsT0FBQSxFQUFTO1FBQUM7VUFDTixJQUFBLEVBQU0sdUJBREE7VUFFTixVQUFBLEVBQVksU0FBQTttQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IseUNBQXBCLEVBQStEO2NBQUEsY0FBQSxFQUFnQixJQUFoQjthQUEvRDtVQUFILENBRk47U0FBRDtPQUZEO01BTVIsV0FBQSxFQUFh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LENBQUMsSUFBVixDQUFlLE1BQWY7TUFETztNQUVULE1BQUEsR0FBUyxTQUFDLE1BQUQ7ZUFDUCxRQUFRLENBQUMsSUFBVCxDQUFjLE1BQWQ7TUFETztNQUVULFlBQUEsR0FBZSxTQUFDLE1BQUQ7UUFDYixNQUFNLENBQUMsTUFBUCxDQUFBO2VBQ0EsYUFBQSxDQUFpQixPQUFELEdBQVMsYUFBekIsRUFBdUMsaUJBQXZDLEVBQTBELE9BQTFEO01BRmE7TUFJZixJQUFDLENBQUEsWUFBRCxDQUFBO01BQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBZSxPQUFELEdBQVMsR0FBVCxHQUFXLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLENBQUQsQ0FBekI7YUFDQSxJQUFJLGVBQUosQ0FBb0I7UUFBQyxTQUFBLE9BQUQ7UUFBVSxNQUFBLElBQVY7UUFBZ0IsUUFBQSxNQUFoQjtRQUF3QixRQUFBLE1BQXhCO1FBQWdDLE1BQUEsSUFBaEM7T0FBcEIsQ0FBMEQsQ0FBQyxnQkFBM0QsQ0FBNEUsWUFBNUU7SUF4R1M7Ozs7S0ExTnFCO0FBNUJsQyIsInNvdXJjZXNDb250ZW50IjpbInskLCBTY3JvbGxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xue0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIEJ1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuY2xpcGJvYXJkID0gbnVsbFxucGF0aCA9IG51bGxcbmZzID0gbnVsbFxub3MgPSBudWxsXG5iZWF1dGlmeV9odG1sID0gbnVsbFxuXG5lZGl0b3JGb3JJZCA9IChlZGl0b3JJZCkgLT5cbiAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgcmV0dXJuIGVkaXRvciBpZiBlZGl0b3IuaWQ/LnRvU3RyaW5nKCkgaXMgZWRpdG9ySWQudG9TdHJpbmcoKVxuICBudWxsXG5cbnNldHRpbmdzRXJyb3IgPSAobWVzc2FnZSwgc2V0dGluZywgcGF0aCkgLT5cbiAgZGV0YWlsID0gXCJWZXJpZnkgJyN7c2V0dGluZ30nIGluIHNldHRpbmdzLlwiXG4gIGlmIHBhdGgubWF0Y2ggLy8vW1wiJ10vLy9cbiAgICBkZXRhaWwgKz0gXCJcXG5TdWdnZXN0aW9uOiBSZW1vdmUgc2luZ2xlL2RvdWJsZSBxdW90ZXMgZnJvbSB0aGUgcGF0aCBzdHJpbmcuXCJcbiAgb3B0aW9ucyA9IHtcbiAgICBkZXRhaWw6IGRldGFpbCxcbiAgICBidXR0b25zOiBbe1xuICAgICAgICB0ZXh0OiAnT3BlbiBQYWNrYWdlIFNldHRpbmdzJyxcbiAgICAgICAgb25EaWRDbGljazogLT4gYXRvbS53b3Jrc3BhY2Uub3BlbignYXRvbTovL2NvbmZpZy9wYWNrYWdlcy9wbGFudHVtbC1wcmV2aWV3Jywgc2VhcmNoQWxsUGFuZXM6IHRydWUpXG4gICAgfV0sXG4gICAgZGlzbWlzc2FibGU6IHRydWVcbiAgfVxuICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJwbGFudHVtbC1wcmV2aWV3OiAje21lc3NhZ2V9XCIsIG9wdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGxhbnR1bWxQcmV2aWV3VmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3BsYW50dW1sLXByZXZpZXcgcGFkZGVkIHBhbmUtaXRlbScsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwbGFudHVtbC1jb250cm9sJywgb3V0bGV0OiAnY29udHJvbCcsID0+XG4gICAgICAgIEBkaXYgPT5cbiAgICAgICAgICBAaW5wdXQgaWQ6ICd6b29tVG9GaXQnLCB0eXBlOiAnY2hlY2tib3gnLCBvdXRsZXQ6ICd6b29tVG9GaXQnXG4gICAgICAgICAgQGxhYmVsICdab29tIFRvIEZpdCdcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBpbnB1dCBpZDogJ3VzZVRlbXBEaXInLCB0eXBlOiAnY2hlY2tib3gnLCBvdXRsZXQ6ICd1c2VUZW1wRGlyJ1xuICAgICAgICAgIEBsYWJlbCAnVXNlIFRlbXAgRGlyJ1xuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGxhYmVsICdPdXRwdXQnXG4gICAgICAgICAgQHNlbGVjdCBvdXRsZXQ6ICdvdXRwdXRGb3JtYXQnLCA9PlxuICAgICAgICAgICAgQG9wdGlvbiB2YWx1ZTogJ3BuZycsICdwbmcnXG4gICAgICAgICAgICBAb3B0aW9uIHZhbHVlOiAnc3ZnJywgJ3N2ZydcbiAgICAgIEBkaXYgY2xhc3M6ICdwbGFudHVtbC1jb250YWluZXInLCBvdXRsZXQ6ICdjb250YWluZXInXG5cbiAgY29uc3RydWN0b3I6ICh7QGVkaXRvcklkfSkgLT5cbiAgICBzdXBlclxuICAgIEBlZGl0b3IgPSBlZGl0b3JGb3JJZCBAZWRpdG9ySWRcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBpbWFnZUluZm8gPSB7c2NhbGU6IDF9XG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgYXR0YWNoZWQ6IC0+XG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIEB1c2VUZW1wRGlyLmF0dHIoJ2NoZWNrZWQnLCBhdG9tLmNvbmZpZy5nZXQoJ3BsYW50dW1sLXByZXZpZXcudXNlVGVtcERpcicpKVxuICAgICAgQG91dHB1dEZvcm1hdC52YWwgYXRvbS5jb25maWcuZ2V0KCdwbGFudHVtbC1wcmV2aWV3Lm91dHB1dEZvcm1hdCcpXG5cbiAgICAgIEB6b29tVG9GaXQuYXR0cignY2hlY2tlZCcsIGF0b20uY29uZmlnLmdldCgncGxhbnR1bWwtcHJldmlldy56b29tVG9GaXQnKSlcbiAgICAgIGNoZWNrSGFuZGxlciA9IChjaGVja2VkKSA9PlxuICAgICAgICBAc2V0Wm9vbUZpdChjaGVja2VkKVxuICAgICAgQG9uICdjaGFuZ2UnLCAnI3pvb21Ub0ZpdCcsIC0+XG4gICAgICAgIGNoZWNrSGFuZGxlcihAY2hlY2tlZClcblxuICAgICAgc2F2ZUhhbmRsZXIgPSA9PlxuICAgICAgICBAcmVuZGVyVW1sKClcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUgLT5cbiAgICAgICAgc2F2ZUhhbmRsZXIoKVxuICAgICAgQG91dHB1dEZvcm1hdC5jaGFuZ2UgLT5cbiAgICAgICAgc2F2ZUhhbmRsZXIoKVxuXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ3BsYW50dW1sLXByZXZpZXcuYnJpbmdGcm9udCdcbiAgICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgICAgIGlmIGl0ZW0gaXMgQGVkaXRvclxuICAgICAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgICAgICAgICBpZiAodHlwZW9mKHBhbmUpICE9ICd1bmRlZmluZWQnKSAmJiAocGFuZSAhPSBudWxsKVxuICAgICAgICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbSB0aGlzXG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgICAncGxhbnR1bWwtcHJldmlldzp6b29tLWluJzogPT5cbiAgICAgICAgICBAaW1hZ2VJbmZvLnNjYWxlID0gQGltYWdlSW5mby5zY2FsZSAqIDEuMVxuICAgICAgICAgIEBzY2FsZUltYWdlcygpXG4gICAgICAgICdwbGFudHVtbC1wcmV2aWV3Onpvb20tb3V0JzogPT5cbiAgICAgICAgICBAaW1hZ2VJbmZvLnNjYWxlID0gQGltYWdlSW5mby5zY2FsZSAqIDAuOVxuICAgICAgICAgIEBzY2FsZUltYWdlcygpXG4gICAgICAgICdwbGFudHVtbC1wcmV2aWV3Onpvb20tcmVzZXQnOiA9PlxuICAgICAgICAgIEBpbWFnZUluZm8uc2NhbGUgPSAxXG4gICAgICAgICAgQHNjYWxlSW1hZ2VzKClcbiAgICAgICAgJ3BsYW50dW1sLXByZXZpZXc6em9vbS1maXQnOiA9PlxuICAgICAgICAgIEB6b29tVG9GaXQucHJvcCAnY2hlY2tlZCcsICFAem9vbVRvRml0LmlzKCc6Y2hlY2tlZCcpXG4gICAgICAgICAgQHNldFpvb21GaXQgQHpvb21Ub0ZpdC5pcygnOmNoZWNrZWQnKVxuICAgICAgICAncGxhbnR1bWwtcHJldmlldzpjb3B5LWltYWdlJzogKGV2ZW50KSA9PlxuICAgICAgICAgIGZpbGVuYW1lID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy51bWwtaW1hZ2UnKS5hdHRyKCdmaWxlJylcbiAgICAgICAgICBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZW5hbWUpXG4gICAgICAgICAgc3dpdGNoIGV4dFxuICAgICAgICAgICAgd2hlbiAnLnBuZydcbiAgICAgICAgICAgICAgY2xpcGJvYXJkID89IHJlcXVpcmUoJ2VsZWN0cm9uJykuY2xpcGJvYXJkXG4gICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgIGNsaXBib2FyZC53cml0ZUltYWdlKGZpbGVuYW1lKVxuICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJwbGFudHVtbC1wcmV2aWV3OiBDb3B5IEZhaWxlZFwiLCBkZXRhaWw6IFwiRXJyb3IgYXR0ZW1wdGluZyB0byBjb3B5OiAje2ZpbGVuYW1lfVxcblNlZSBjb25zb2xlIGZvciBkZXRhaWxzLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVyclxuICAgICAgICAgICAgd2hlbiAnLnN2ZydcbiAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgYnVmZmVyID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCBAZWRpdG9yLmdldEVuY29kaW5nKCkpXG4gICAgICAgICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0ICdwbGFudHVtbC1wcmV2aWV3LmJlYXV0aWZ5WG1sJ1xuICAgICAgICAgICAgICAgICAgYmVhdXRpZnlfaHRtbCA/PSByZXF1aXJlKCdqcy1iZWF1dGlmeScpLmh0bWxcbiAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGJlYXV0aWZ5X2h0bWwgYnVmZmVyXG4gICAgICAgICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoYnVmZmVyKVxuICAgICAgICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJwbGFudHVtbC1wcmV2aWV3OiBDb3B5IEZhaWxlZFwiLCBkZXRhaWw6IFwiRXJyb3IgYXR0ZW1wdGluZyB0byBjb3B5OiAje2ZpbGVuYW1lfVxcblNlZSBjb25zb2xlIGZvciBkZXRhaWxzLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVyclxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJwbGFudHVtbC1wcmV2aWV3OiBVbnN1cHBvcnRlZCBGaWxlIEZvcm1hdFwiLCBkZXRhaWw6IFwiI3tleHR9IGlzIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkIGJ5ICdDb3B5IERpYWdyYW0nLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAncGxhbnR1bWwtcHJldmlldzpvcGVuLWZpbGUnOiAoZXZlbnQpIC0+XG4gICAgICAgICAgZmlsZW5hbWUgPSAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLm9wZW4tZmlsZScpLmF0dHIoJ2ZpbGUnKVxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZW5hbWVcbiAgICAgICAgJ3BsYW50dW1sLXByZXZpZXc6Y29weS1maWxlbmFtZSc6IChldmVudCkgLT5cbiAgICAgICAgICBmaWxlbmFtZSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuY29weS1maWxlbmFtZScpLmF0dHIoJ2ZpbGUnKVxuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIGZpbGVuYW1lXG5cbiAgICAgIEByZW5kZXJVbWwoKVxuXG4gIGdldFBhdGg6IC0+XG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIEBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgZ2V0VVJJOiAtPlxuICAgIGlmIEBlZGl0b3I/XG4gICAgICBcInBsYW50dW1sLXByZXZpZXc6Ly9lZGl0b3IvI3tAZWRpdG9yLmlkfVwiXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIFwiI3tAZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdcIlxuXG4gIG9uRGlkQ2hhbmdlVGl0bGU6IC0+XG4gICAgbmV3IERpc3Bvc2FibGUoKVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQ6IC0+XG4gICAgbmV3IERpc3Bvc2FibGUoKVxuXG4gIGFkZEltYWdlczogKGltZ0ZpbGVzLCB0aW1lKSAtPlxuICAgIEBjb250YWluZXIuZW1wdHkoKVxuICAgIGRpc3BsYXlGaWxlbmFtZXMgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYW50dW1sLXByZXZpZXcuZGlzcGxheUZpbGVuYW1lJylcbiAgICBmb3IgZmlsZSBpbiBpbWdGaWxlc1xuICAgICAgaWYgZGlzcGxheUZpbGVuYW1lc1xuICAgICAgICBkaXYgPSAkKCc8ZGl2Lz4nKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdmaWxlbmFtZSBvcGVuLWZpbGUgY29weS1maWxlbmFtZScpXG4gICAgICAgICAgLmF0dHIoJ2ZpbGUnLCBmaWxlKVxuICAgICAgICAgIC50ZXh0KFwiI3tmaWxlfVwiKVxuICAgICAgICBAY29udGFpbmVyLmFwcGVuZCBkaXZcbiAgICAgIGltYWdlSW5mbyA9IEBpbWFnZUluZm9cbiAgICAgIHpvb21Ub0ZpdCA9IEB6b29tVG9GaXQuaXMoJzpjaGVja2VkJylcbiAgICAgIGltZyA9ICQoJzxpbWcvPicpXG4gICAgICAgIC5hdHRyKCdzcmMnLCBcIiN7ZmlsZX0/dGltZT0je3RpbWV9XCIpXG4gICAgICAgIC5hdHRyKCdmaWxlJywgZmlsZSlcbiAgICAgICAgLmxvYWQgLT5cbiAgICAgICAgICBpbWcgPSAkKHRoaXMpXG4gICAgICAgICAgZmlsZSA9IGltZy5hdHRyICdmaWxlJ1xuICAgICAgICAgIG5hbWUgPSBwYXRoLmJhc2VuYW1lIGZpbGUsIHBhdGguZXh0bmFtZShmaWxlKVxuICAgICAgICAgIGlmIGltYWdlSW5mby5oYXNPd25Qcm9wZXJ0eSBuYW1lXG4gICAgICAgICAgICBpbmZvID0gaW1hZ2VJbmZvW25hbWVdXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaW5mbyA9IHt9XG4gICAgICAgICAgaW5mby5vcmlnV2lkdGggPSBpbWcud2lkdGgoKVxuICAgICAgICAgIGluZm8ub3JpZ0hlaWdodCA9IGltZy5oZWlnaHQoKVxuICAgICAgICAgIGltYWdlSW5mb1tuYW1lXSA9IGluZm9cblxuICAgICAgICAgIGltZy5hdHRyKCd3aWR0aCcsIGltYWdlSW5mby5zY2FsZSAqIGluZm8ub3JpZ1dpZHRoKVxuICAgICAgICAgIGltZy5hdHRyKCdoZWlnaHQnLCBpbWFnZUluZm8uc2NhbGUgKiBpbmZvLm9yaWdIZWlnaHQpXG4gICAgICAgICAgaW1nLmF0dHIoJ2NsYXNzJywgJ3VtbC1pbWFnZSBvcGVuLWZpbGUgY29weS1maWxlbmFtZScpXG4gICAgICAgICAgaWYgem9vbVRvRml0XG4gICAgICAgICAgICBpbWcuYWRkQ2xhc3MoJ3pvb21Ub0ZpdCcpXG5cbiAgICAgIEBjb250YWluZXIuYXBwZW5kIGltZ1xuICAgIEBjb250YWluZXIuc2hvd1xuXG4gIHNjYWxlSW1hZ2VzOiAtPlxuICAgIGZvciBlIGluIEBjb250YWluZXIuZmluZCgnLnVtbC1pbWFnZScpXG4gICAgICBpbWcgPSAkKGUpXG4gICAgICBmaWxlID0gaW1nLmF0dHIgJ2ZpbGUnXG4gICAgICBuYW1lID0gcGF0aC5iYXNlbmFtZSBmaWxlLCBwYXRoLmV4dG5hbWUoZmlsZSlcbiAgICAgIGltZy5hdHRyICd3aWR0aCcsIEBpbWFnZUluZm8uc2NhbGUgKiBAaW1hZ2VJbmZvW25hbWVdLm9yaWdXaWR0aFxuICAgICAgaW1nLmF0dHIgJ2hlaWdodCcsIEBpbWFnZUluZm8uc2NhbGUgKiBAaW1hZ2VJbmZvW25hbWVdLm9yaWdIZWlnaHRcbiAgICBAem9vbVRvRml0LnByb3AgJ2NoZWNrZWQnLCBmYWxzZVxuICAgIEBzZXRab29tRml0IEB6b29tVG9GaXQuaXMoJzpjaGVja2VkJylcblxuICByZW1vdmVJbWFnZXM6IC0+XG4gICAgQGNvbnRhaW5lci5lbXB0eSgpXG4gICAgQGNvbnRhaW5lci5hcHBlbmQgJCgnPGRpdi8+JykuYXR0cignY2xhc3MnLCAndGhyb2JiZXInKVxuICAgIEBjb250YWluZXIuc2hvd1xuXG4gIHNldFpvb21GaXQ6IChjaGVja2VkKSAtPlxuICAgIGlmIGNoZWNrZWRcbiAgICAgIEBjb250YWluZXIuZmluZCgnLnVtbC1pbWFnZScpLmFkZENsYXNzKCd6b29tVG9GaXQnKVxuICAgIGVsc2VcbiAgICAgIEBjb250YWluZXIuZmluZCgnLnVtbC1pbWFnZScpLnJlbW92ZUNsYXNzKCd6b29tVG9GaXQnKVxuXG4gIGdldEZpbGVuYW1lczogKGRpcmVjdG9yeSwgZGVmYXVsdE5hbWUsIGRlZmF1bHRFeHRlbnNpb24sIGNvbnRlbnRzKSAtPlxuICAgIHBhdGggPz0gcmVxdWlyZSAncGF0aCdcbiAgICBmaWxlbmFtZXMgPSBbXVxuICAgIGRlZmF1bHRGaWxlbmFtZSA9IHBhdGguam9pbihkaXJlY3RvcnksIGRlZmF1bHROYW1lKVxuICAgIGRlZmF1bHRDb3VudCA9IDBcbiAgICBmb3IgdW1sIGluIGNvbnRlbnRzLnNwbGl0KC8vL0BlbmQoPzp1bWx8bWF0aHxsYXRleCkvLy9pKVxuICAgICAgaWYgdW1sLnRyaW0oKSA9PSAnJ1xuICAgICAgICBjb250aW51ZVxuXG4gICAgICBjdXJyZW50RmlsZW5hbWUgPSBwYXRoLmpvaW4oZGlyZWN0b3J5LCBkZWZhdWx0TmFtZSlcbiAgICAgIGN1cnJlbnRFeHRlbnNpb24gPSBkZWZhdWx0RXh0ZW5zaW9uXG4gICAgICBwYWdlQ291bnQgPSAxXG5cbiAgICAgIGZpbGVuYW1lID0gdW1sLm1hdGNoIC8vL0BzdGFydCg/OnVtbHxtYXRofGxhdGV4KShbXlxcbl0qKVxcbi8vL2lcbiAgICAgIGlmIGZpbGVuYW1lP1xuICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lWzFdLnRyaW0oKVxuICAgICAgICBpZiBmaWxlbmFtZSAhPSAnJ1xuICAgICAgICAgIGlmIHBhdGguZXh0bmFtZShmaWxlbmFtZSlcbiAgICAgICAgICAgIGN1cnJlbnRFeHRlbnNpb24gPSBwYXRoLmV4dG5hbWUgZmlsZW5hbWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdXJyZW50RXh0ZW5zaW9uID0gZGVmYXVsdEV4dGVuc2lvblxuICAgICAgICAgIGN1cnJlbnRGaWxlbmFtZSA9IHBhdGguam9pbihkaXJlY3RvcnksIGZpbGVuYW1lLnJlcGxhY2UoY3VycmVudEV4dGVuc2lvbiwgJycpKVxuXG4gICAgICBpZiAoY3VycmVudEZpbGVuYW1lID09IGRlZmF1bHRGaWxlbmFtZSlcbiAgICAgICAgaWYgZGVmYXVsdENvdW50ID4gMFxuICAgICAgICAgIGNvdW50U3RyID0gZGVmYXVsdENvdW50ICsgJydcbiAgICAgICAgICBjb3VudFN0ciA9ICcwMDAnLnN1YnN0cmluZyhjb3VudFN0ci5sZW5ndGgpICsgY291bnRTdHJcbiAgICAgICAgICBuZXdmaWxlID0gXCIje2N1cnJlbnRGaWxlbmFtZX1fI3tjb3VudFN0cn0je2N1cnJlbnRFeHRlbnNpb259XCJcbiAgICAgICAgICBmaWxlbmFtZXMucHVzaChuZXdmaWxlKSB1bmxlc3MgbmV3ZmlsZSBpbiBmaWxlbmFtZXNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5ld2ZpbGUgPSBjdXJyZW50RmlsZW5hbWUgKyBjdXJyZW50RXh0ZW5zaW9uXG4gICAgICAgICAgZmlsZW5hbWVzLnB1c2gobmV3ZmlsZSkgdW5sZXNzIG5ld2ZpbGUgaW4gZmlsZW5hbWVzXG4gICAgICAgIGRlZmF1bHRDb3VudCsrXG4gICAgICBlbHNlXG4gICAgICAgIG5ld2ZpbGUgPSBjdXJyZW50RmlsZW5hbWUgKyBjdXJyZW50RXh0ZW5zaW9uXG4gICAgICAgIGZpbGVuYW1lcy5wdXNoKG5ld2ZpbGUpIHVubGVzcyBuZXdmaWxlIGluIGZpbGVuYW1lc1xuXG4gICAgICBmb3IgbGluZSBpbiB1bWwuc3BsaXQoJ1xcbicpXG4gICAgICAgIGlmIGxpbmUubWF0Y2ggLy8vXltcXHNdKihuZXdwYWdlKS8vL2lcbiAgICAgICAgICBjb3VudFN0ciA9IHBhZ2VDb3VudCArICcnXG4gICAgICAgICAgY291bnRTdHIgPSAnMDAwJy5zdWJzdHJpbmcoY291bnRTdHIubGVuZ3RoKSArIGNvdW50U3RyXG4gICAgICAgICAgbmV3ZmlsZSA9IFwiI3tjdXJyZW50RmlsZW5hbWV9XyN7Y291bnRTdHJ9I3tjdXJyZW50RXh0ZW5zaW9ufVwiXG4gICAgICAgICAgZmlsZW5hbWVzLnB1c2gobmV3ZmlsZSkgdW5sZXNzIG5ld2ZpbGUgaW4gZmlsZW5hbWVzXG4gICAgICAgICAgcGFnZUNvdW50KytcblxuICAgIGZpbGVuYW1lc1xuXG4gIHJlbmRlclVtbDogLT5cbiAgICBwYXRoID89IHJlcXVpcmUgJ3BhdGgnXG4gICAgZnMgPz0gcmVxdWlyZSAnZnMtcGx1cydcbiAgICBvcyA/PSByZXF1aXJlICdvcydcblxuICAgIGZpbGVQYXRoID0gQGVkaXRvci5nZXRQYXRoKClcbiAgICBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgsIHBhdGguZXh0bmFtZShmaWxlUGF0aCkpXG4gICAgZGlyZWN0b3J5ID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgIGZvcm1hdCA9IEBvdXRwdXRGb3JtYXQudmFsKClcbiAgICBzZXR0aW5nRXJyb3IgPSBmYWxzZVxuXG4gICAgaWYgQHVzZVRlbXBEaXIuaXMoJzpjaGVja2VkJylcbiAgICAgIGRpcmVjdG9yeSA9IHBhdGguam9pbiBvcy50bXBkaXIoKSwgJ3BsYW50dW1sLXByZXZpZXcnXG4gICAgICBpZiAhZnMuZXhpc3RzU3luYyBkaXJlY3RvcnlcbiAgICAgICAgZnMubWtkaXJTeW5jIGRpcmVjdG9yeVxuXG4gICAgaW1nRmlsZXMgPSBAZ2V0RmlsZW5hbWVzIGRpcmVjdG9yeSwgYmFzZW5hbWUsICcuJyArIGZvcm1hdCwgQGVkaXRvci5nZXRUZXh0KClcblxuICAgIHVwVG9EYXRlID0gdHJ1ZVxuICAgIGZpbGVUaW1lID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpLm10aW1lXG4gICAgZm9yIGltYWdlIGluIGltZ0ZpbGVzXG4gICAgICBpZiBmcy5pc0ZpbGVTeW5jKGltYWdlKVxuICAgICAgICBpZiBmaWxlVGltZSA+IGZzLnN0YXRTeW5jKGltYWdlKS5tdGltZVxuICAgICAgICAgIHVwVG9EYXRlID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgZWxzZVxuICAgICAgICB1cFRvRGF0ZSA9IGZhbHNlXG4gICAgICAgIGJyZWFrXG4gICAgaWYgdXBUb0RhdGVcbiAgICAgIEByZW1vdmVJbWFnZXMoKVxuICAgICAgQGFkZEltYWdlcyBpbWdGaWxlcywgRGF0ZS5ub3coKVxuICAgICAgcmV0dXJuXG5cbiAgICBjb21tYW5kID0gYXRvbS5jb25maWcuZ2V0ICdwbGFudHVtbC1wcmV2aWV3LmphdmEnXG4gICAgaWYgKGNvbW1hbmQgIT0gJ2phdmEnKSBhbmQgKCFmcy5pc0ZpbGVTeW5jIGNvbW1hbmQpXG4gICAgICBzZXR0aW5nc0Vycm9yIFwiI3tjb21tYW5kfSBpcyBub3QgYSBmaWxlLlwiLCAnSmF2YSBFeGVjdXRhYmxlJywgY29tbWFuZFxuICAgICAgc2V0dGluZ0Vycm9yID0gdHJ1ZVxuICAgIGphckxvY2F0aW9uID0gYXRvbS5jb25maWcuZ2V0ICdwbGFudHVtbC1wcmV2aWV3LmphckxvY2F0aW9uJ1xuICAgIGlmICFmcy5pc0ZpbGVTeW5jIGphckxvY2F0aW9uXG4gICAgICBzZXR0aW5nc0Vycm9yIFwiI3tqYXJMb2NhdGlvbn0gaXMgbm90IGEgZmlsZS5cIiwgJ1BsYW50VU1MIEphcicsIGphckxvY2F0aW9uXG4gICAgICBzZXR0aW5nRXJyb3IgPSB0cnVlXG4gICAgZG90TG9jYXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYW50dW1sLXByZXZpZXcuZG90TG9jYXRpb24nKVxuICAgIGlmIGRvdExvY2F0aW9uICE9ICcnXG4gICAgICBpZiAhZnMuaXNGaWxlU3luYyBkb3RMb2NhdGlvblxuICAgICAgICBzZXR0aW5nc0Vycm9yIFwiI3tkb3RMb2NhdGlvbn0gaXMgbm90IGEgZmlsZS5cIiwgJ0dyYXBodmlzIERvdCBFeGVjdXRhYmxlJywgZG90TG9jYXRpb25cbiAgICAgICAgc2V0dGluZ0Vycm9yID0gdHJ1ZVxuXG4gICAgaWYgc2V0dGluZ0Vycm9yXG4gICAgICBAY29udGFpbmVyLmVtcHR5KClcbiAgICAgIEBjb250YWluZXIuc2hvd1xuICAgICAgcmV0dXJuXG5cbiAgICBhcmdzID0gWyctRGphdmEuYXd0LmhlYWRsZXNzPXRydWUnXVxuICAgIGphdmFBZGRpdGlvbmFsID0gYXRvbS5jb25maWcuZ2V0KCdwbGFudHVtbC1wcmV2aWV3LmphdmFBZGRpdGlvbmFsJylcbiAgICBpZiBqYXZhQWRkaXRpb25hbCAhPSAnJ1xuICAgICAgYXJncy5wdXNoIGphdmFBZGRpdGlvbmFsXG4gICAgYXJncy5wdXNoICctamFyJywgamFyTG9jYXRpb25cbiAgICBqYXJBZGRpdGlvbmFsID0gYXRvbS5jb25maWcuZ2V0KCdwbGFudHVtbC1wcmV2aWV3LmphckFkZGl0aW9uYWwnKVxuICAgIGlmIGphckFkZGl0aW9uYWwgIT0gJydcbiAgICAgIGFyZ3MucHVzaCBqYXJBZGRpdGlvbmFsXG4gICAgYXJncy5wdXNoICctY2hhcnNldCcsIEBlZGl0b3IuZ2V0RW5jb2RpbmcoKVxuICAgIGlmIGZvcm1hdCA9PSAnc3ZnJ1xuICAgICAgYXJncy5wdXNoICctdHN2ZydcbiAgICBpZiBkb3RMb2NhdGlvbiAhPSAnJ1xuICAgICAgYXJncy5wdXNoICctZ3JhcGh2aXpkb3QnLCBkb3RMb2NhdGlvblxuICAgIGFyZ3MucHVzaCAnLW91dHB1dCcsIGRpcmVjdG9yeSwgZmlsZVBhdGhcblxuICAgIG91dHB1dGxvZyA9IFtdXG4gICAgZXJyb3Jsb2cgPSBbXVxuXG4gICAgZXhpdEhhbmRsZXIgPSAoZmlsZXMpID0+XG4gICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICBpZiBmcy5pc0ZpbGVTeW5jIGZpbGVcbiAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3BsYW50dW1sLXByZXZpZXcuYmVhdXRpZnlYbWwnKSBhbmQgKGZvcm1hdCA9PSAnc3ZnJylcbiAgICAgICAgICAgIGJlYXV0aWZ5X2h0bWwgPz0gcmVxdWlyZSgnanMtYmVhdXRpZnknKS5odG1sXG4gICAgICAgICAgICBidWZmZXIgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSwgQGVkaXRvci5nZXRFbmNvZGluZygpKVxuICAgICAgICAgICAgYnVmZmVyID0gYmVhdXRpZnlfaHRtbCBidWZmZXJcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgYnVmZmVyLCB7ZW5jb2Rpbmc6IEBlZGl0b3IuZ2V0RW5jb2RpbmcoKX0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkZpbGUgbm90IGZvdW5kOiAje2ZpbGV9XCIpXG4gICAgICBAYWRkSW1hZ2VzKGZpbGVzLCBEYXRlLm5vdygpKVxuICAgICAgaWYgZXJyb3Jsb2cubGVuZ3RoID4gMFxuICAgICAgICBzdHIgPSBlcnJvcmxvZy5qb2luKCcnKVxuICAgICAgICBpZiBzdHIubWF0Y2ggLy8vamFyZmlsZS8vL2lcbiAgICAgICAgICBzZXR0aW5nc0Vycm9yIHN0ciwgJ1BsYW50VU1MIEphcicsIGphckxvY2F0aW9uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmxvZyBcInBsYW50dW1sLXByZXZpZXc6IHN0ZGVyclxcbiN7c3RyfVwiXG4gICAgICBpZiBvdXRwdXRsb2cubGVuZ3RoID4gMFxuICAgICAgICBzdHIgPSBvdXRwdXRsb2cuam9pbignJylcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCJwbGFudHVtbC1wcmV2aWV3OiBzdGRvdXQgKGxvZ2dlZCB0byBjb25zb2xlKVwiLCBkZXRhaWw6IHN0ciwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgY29uc29sZS5sb2cgXCJwbGFudHVtbC1wcmV2aWV3OiBzdGRvdXRcXG4je3N0cn1cIlxuXG4gICAgZXhpdCA9IChjb2RlKSAtPlxuICAgICAgZXhpdEhhbmRsZXIgaW1nRmlsZXNcbiAgICBzdGRvdXQgPSAob3V0cHV0KSAtPlxuICAgICAgb3V0cHV0bG9nLnB1c2ggb3V0cHV0XG4gICAgc3RkZXJyID0gKG91dHB1dCkgLT5cbiAgICAgIGVycm9ybG9nLnB1c2ggb3V0cHV0XG4gICAgZXJyb3JIYW5kbGVyID0gKG9iamVjdCkgLT5cbiAgICAgIG9iamVjdC5oYW5kbGUoKVxuICAgICAgc2V0dGluZ3NFcnJvciBcIiN7Y29tbWFuZH0gbm90IGZvdW5kLlwiLCAnSmF2YSBFeGVjdXRhYmxlJywgY29tbWFuZFxuXG4gICAgQHJlbW92ZUltYWdlcygpXG4gICAgY29uc29sZS5sb2coXCIje2NvbW1hbmR9ICN7YXJncy5qb2luICcgJ31cIilcbiAgICBuZXcgQnVmZmVyZWRQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIHN0ZGVyciwgZXhpdH0pLm9uV2lsbFRocm93RXJyb3IgZXJyb3JIYW5kbGVyXG4iXX0=
