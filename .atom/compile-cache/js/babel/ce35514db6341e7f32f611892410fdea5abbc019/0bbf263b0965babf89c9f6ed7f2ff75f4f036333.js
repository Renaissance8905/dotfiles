Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Created by Sam Deane, 23/05/2018.
// All code (c) 2018 - present day, Elegant Chaos Limited.
// For licensing terms, see http://elegantchaos.com/license/liberal/.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var _atom = require('atom');

var _child_process = require('child_process');

'use babel';
var IdeSwiftView = (function () {
    function IdeSwiftView(controller) {
        var _this = this;

        _classCallCheck(this, IdeSwiftView);

        this.controller = controller;
        this.lastCommand = "";

        // Create root element
        var editor = this.editor = new _atom.TextEditor({ autoHeight: false, softWrapped: true, autoIndent: false });
        editor.insertText("> ");
        var element = this.element = editor.getElement();
        element.classList.add('ide-swift');
        editor.onDidStopChanging(function () {
            _this.checkForCommand();
        });
        this.subscriptions = atom.commands.add(element, {
            'core:confirm': function coreConfirm(event) {
                console.debug('confirm');
                event.stopPropagation();
            },
            'core:cancel': function coreCancel(event) {
                console.debug('cancel');
                event.stopPropagation();
            }
        });

        this.showWelcome();
    }

    // Returns an object that can be retrieved when package is activated

    _createClass(IdeSwiftView, [{
        key: 'serialize',
        value: function serialize() {}

        // Tear down any state and detach
    }, {
        key: 'destroy',
        value: function destroy() {
            this.element.remove();
            this.subscriptions.destroy();
        }
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.element;
        }
    }, {
        key: 'getTitle',
        value: function getTitle() {
            return "Swift";
        }
    }, {
        key: 'getDefaultLocation',
        value: function getDefaultLocation() {
            return "bottom";
        }
    }, {
        key: 'isVisible',
        value: function isVisible() {
            return this.element.component.isVisible();
        }
    }, {
        key: 'showWelcome',
        value: function showWelcome() {
            var controller = this.controller;
            var package = controller.packageName();
            var targets = controller.targets();

            this.scrollToBottomOfOutput();
            this.addOutput("Welcome to Swift IDE.");
            this.addOutput('Package: ' + package + '.');
            var target = controller.target();
            if (target == undefined) {
                this.addOutput('No target set.');
            } else if (controller.targetIsDefault()) {
                this.addOutput('Target defaulted to: `' + target.name + '`.');
            } else {
                this.addOutput('Target: ' + target.name + '.');
            }

            this.addOutput('(use the target button to change)');
        }
    }, {
        key: 'checkForCommand',
        value: function checkForCommand() {
            var editor = this.editor;
            var bottom = editor.getLastBufferRow();
            var bottomLine = editor.lineTextForBufferRow(bottom);
            if (bottomLine == "") {
                var commandLine = editor.lineTextForBufferRow(bottom - 1);
                if (commandLine.slice(0, 2) == "> ") {
                    var command = commandLine.slice(2);
                    if (command != this.lastCommand) {
                        console.log("command", command);
                        this.lastCommand = command;
                        editor.insertText('\n> ');
                        this.parseCommand(command);
                    }
                } else {
                    // we've lost the prompt somehow, so add another
                    this.scrollToBottomOfOutput();
                    editor.insertText('> ');
                }
            }
        }
    }, {
        key: 'addOutput',
        value: function addOutput(data) {
            var editor = this.editor;
            var insertAt = editor.getLastBufferRow();
            var line = editor.lineTextForBufferRow(bottom);

            editor.setSelectedBufferRange([[insertAt, 0], [insertAt, 0]]);
            editor.insertText(data);
            editor.insertNewline();

            var bottom = editor.getLastBufferRow() + 1;
            editor.setSelectedBufferRange([[bottom, 0], [bottom, 0]]);
            editor.scrollToBufferPosition([bottom, 0]);
        }
    }, {
        key: 'clearOutput',
        value: function clearOutput() {
            var editor = this.editor;
            editor.setTextInBufferRange([[0, 0], [editor.getLastBufferRow() + 1, 0]], "> ");
            editor.setSelectedBufferRange([[0, 2], [0, 2]]);
            editor.scrollToBufferPosition([0, 0]);
        }
    }, {
        key: 'scrollToBottomOfOutput',
        value: function scrollToBottomOfOutput() {
            var editor = this.editor;
            var bottom = editor.getLastBufferRow();
            var line = editor.lineTextForBufferRow(bottom);
            editor.setSelectedBufferRange([[bottom, 0], [bottom, 0]]);
            editor.scrollToBufferPosition([bottom, 0]);
        }
    }, {
        key: 'lldbCommand',
        value: function lldbCommand(command) {
            if (this.lldb) {
                this.lldb.stdin.write(command + '\n');
            }
        }
    }, {
        key: 'stepIn',
        value: function stepIn() {
            this.lldbCommand("step");
        }
    }, {
        key: 'stepOut',
        value: function stepOut() {
            this.lldbCommand("finish");
        }
    }, {
        key: 'stepOver',
        value: function stepOver() {
            this.lldbCommand("next");
        }
    }, {
        key: 'resume',
        value: function resume() {
            this.lldbCommand("continue");
        }
    }, {
        key: 'runApp',
        value: function runApp() {
            this.buildApp(true);
        }
    }, {
        key: 'buildApp',
        value: function buildApp(runWhenBuilt) {
            var _this2 = this;

            this.stopDebugger();

            var controller = this.controller;
            if (!controller.hasTarget()) {
                this.addOutput("Please set the target to build.");
                return;
            }

            var executable = controller.targetExecutable();
            this.addOutput('Building ' + executable);
            controller.clearDiagnostics();
            var stdout = function stdout(data) {
                _this2.processBuilderOutput(data.toString().trim());
            };
            var stderr = function stderr(data) {
                _this2.processBuilderError(data.toString().trim());
            };
            this._builder = controller.swift().build(executable, stdout, stderr, controller.shouldUseBuilder()).then(function (code) {
                _this2.processBuilderExit(code, runWhenBuilt);
                _this2._builder = null;
            });
        }
    }, {
        key: 'runTests',
        value: function runTests() {
            var _this3 = this;

            this.stopDebugger();

            var controller = this.controller;
            if (!controller.hasTarget()) {
                this.addOutput("Please set the target to test.");
                return;
            }

            controller.clearDiagnostics();
            var stdout = function stdout(data) {
                console.log(data);_this3.processBuilderOutput(data.toString().trim());
            };
            var stderr = function stderr(data) {
                _this3.processBuilderError(data.toString().trim());
            };
            this._tester = controller.swift().test(stdout, stderr).then(function (code) {
                _this3.processTestsExit(code);
                _this3._tester = null;
            });
        }
    }, {
        key: 'runDebugger',
        value: function runDebugger() {
            var _this4 = this;

            var controller = this.controller;
            var executable = controller.targetExecutable();
            this.addOutput('Running ' + executable + '.');
            this.lldb = (0, _child_process.spawn)(controller.lldbPath(), [controller.projectRoot() + "/.build/debug/" + executable]);

            var breakpoints = controller.breakpoints();
            breakpoints.forEach(function (breakpoint) {
                if (breakpoint.enabled) {
                    var command = 'b ' + breakpoint.uri + ':' + breakpoint.line;
                    _this4.lldb.stdin.write(command + "\n");
                }
            });

            this.lldb.stdin.write('r\n');
            this.lldb.stdout.on('data', function (data) {
                _this4.processDebuggerOutput(data.toString().trim());
            });
            this.lldb.stderr.on('data', function (data) {
                _this4.processDebuggerError(data.toString().trim());
            });
            return this.lldb.on('exit', function (code) {
                _this4.processDebuggerExit(code);
            });
        }
    }, {
        key: 'stopDebugger',
        value: function stopDebugger() {
            if (this.lldb != null) {
                this.controller.setState("exiting");
                this.lldbCommand("exit");
            }
            return this.lldb = null;
        }
    }, {
        key: 'processBuilderOutput',
        value: function processBuilderOutput(output) {
            var matched = false;
            var match;
            var pattern = /(.*):(.*):(.*): error: (.*)\n/g;

            // compiler errors
            while (match = pattern.exec(output)) {
                var error = { file: match[1], line: match[2], column: match[3], description: match[4] };
                this.controller.outputError(error);
                matched = true;
            }

            // compiler warnings
            pattern = /(.*):(.*):(.*): warning: (.*)\n/g;
            while (match = pattern.exec(output)) {
                var warning = { file: match[1], line: match[2], column: match[3], description: match[4] };
                this.controller.outputWarning(warning);
                matched = true;
            }

            // unit test failures
            pattern = /(.*):(.*): error: (.*) : (.*) *failed:* (.*) *- (.*)\n/g;
            while (match = pattern.exec(output)) {
                var test = match[3];
                var kind = match[4] || "test";
                var reason = match[5];
                var comment = match[6];
                if (comment) {
                    reason += " - " + comment;
                }
                var error = { file: match[1], line: match[2], column: 0, description: kind + ' ' + test + ' failed: ' + reason };
                this.controller.outputTestFailure(error);
                matched = true;
            }

            if (!matched) {
                this.addOutput("» " + output);
            }
        }
    }, {
        key: 'processBuilderError',
        value: function processBuilderError(output) {
            this.addOutput("!» " + output);
        }
    }, {
        key: 'processBuilderExit',
        value: function processBuilderExit(code, runWhenBuilt) {
            var codeString = code.toString().trim();
            if (codeString === '0') {
                this.addOutput('Build succeeded.');
                if (runWhenBuilt) {
                    this.runDebugger();
                }
            } else {
                this.addOutput('Build failed with code : ' + codeString + '.');
            }
        }
    }, {
        key: 'processTestsExit',
        value: function processTestsExit(code) {
            var codeString = code.toString().trim();
            if (codeString === '0') {
                this.addOutput('Tests succeeded.');
            } else {
                this.addOutput('Tests failed with code : ' + codeString + '.');
            }
        }
    }, {
        key: 'processDebuggerOutput',
        value: function processDebuggerOutput(output) {
            var suppress = false;
            var match = /Process (.*) launched/.exec(output);
            if (match) {
                this.process = match[1];
                this.controller.setState("running");
                suppress = true;
            }

            if (!match) {
                match = /Process (.*) stopped/.exec(output);
                if (match) {
                    this.controller.setState("paused");
                }
            }

            if (!match) {
                match = /Process (.*) resumed/.exec(output);
                if (match) {
                    this.controller.setState("running");
                    suppress = true;
                }
            }

            if (!match) {
                match = /Process (.*) exited/.exec(output);
                if (match) {
                    this.controller.setState("exited");
                    suppress = true;
                }
            }

            if (!match) {
                var patterns = [/\(lldb\) target create ".*"/, /\(lldb\) b .*.swift:.*/];
                patterns.forEach(function (pattern) {
                    if (pattern.exec(output)) {
                        console.log(output);
                        suppress = true;
                    };
                });
            }

            if (!suppress) {
                this.addOutput(output);
            }
        }
    }, {
        key: 'processDebuggerError',
        value: function processDebuggerError(error) {
            this.addOutput(error);
        }
    }, {
        key: 'processDebuggerExit',
        value: function processDebuggerExit(code) {
            this.addOutput('exit code: ' + code.toString().trim());
            this.controller.setState("exited");
        }
    }, {
        key: 'parseCommand',
        value: function parseCommand(command) {
            if (command) {
                this.lldbCommand(command);
                this.controller.updateToolBar();
            }
        }
    }, {
        key: 'stringIsBlank',
        value: function stringIsBlank(str) {
            return !str || /^\s*$/.test(str);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            console.debug("destroy called");
            this.controller.view = null;
        }
    }]);

    return IdeSwiftView;
})();

exports['default'] = IdeSwiftView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL2lkZS1zd2lmdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQVEyQixNQUFNOzs2QkFDWCxlQUFlOztBQVRyQyxXQUFXLENBQUM7SUFXUyxZQUFZO0FBRWxCLGFBRk0sWUFBWSxDQUVqQixVQUFVLEVBQUU7Ozs4QkFGUCxZQUFZOztBQUd6QixZQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM3QixZQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7O0FBR3RCLFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcscUJBQWUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDdEcsY0FBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QixZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNuRCxlQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuQyxjQUFNLENBQUMsaUJBQWlCLENBQUUsWUFBTTtBQUM1QixrQkFBSyxlQUFlLEVBQUUsQ0FBQztTQUMxQixDQUFDLENBQUM7QUFDSCxZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtBQUM1QywwQkFBYyxFQUFFLHFCQUFBLEtBQUssRUFBSTtBQUNyQix1QkFBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6QixxQkFBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzNCO0FBQ0QseUJBQWEsRUFBRSxvQkFBQSxLQUFLLEVBQUk7QUFDcEIsdUJBQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxD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LENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDOzs7ZUFFTSxtQkFBRztBQUNOLG1CQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUMvQjs7O1dBM1dnQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvVXNlcnMvY2pzcHJhZGxpbmcvLmF0b20vcGFja2FnZXMvaWRlLXN3aWZ0L2xpYi9pZGUtc3dpZnQtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cbi8vIENyZWF0ZWQgYnkgU2FtIERlYW5lLCAyMy8wNS8yMDE4LlxuLy8gQWxsIGNvZGUgKGMpIDIwMTggLSBwcmVzZW50IGRheSwgRWxlZ2FudCBDaGFvcyBMaW1pdGVkLlxuLy8gRm9yIGxpY2Vuc2luZyB0ZXJtcywgc2VlIGh0dHA6Ly9lbGVnYW50Y2hhb3MuY29tL2xpY2Vuc2UvbGliZXJhbC8uXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cblxuaW1wb3J0IHsgVGV4dEVkaXRvciB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSWRlU3dpZnRWaWV3IHtcblxuICAgIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICAgICAgdGhpcy5sYXN0Q29tbWFuZCA9IFwiXCI7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHJvb3QgZWxlbWVudFxuICAgICAgICBjb25zdCBlZGl0b3IgPSB0aGlzLmVkaXRvciA9IG5ldyBUZXh0RWRpdG9yKHsgYXV0b0hlaWdodDogZmFsc2UsIHNvZnRXcmFwcGVkOnRydWUsIGF1dG9JbmRlbnQ6ZmFsc2V9KTtcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCI+IFwiKTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudCA9IGVkaXRvci5nZXRFbGVtZW50KCk7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaWRlLXN3aWZ0Jyk7XG4gICAgICAgIGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGVja0ZvckNvbW1hbmQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IGF0b20uY29tbWFuZHMuYWRkKGVsZW1lbnQsIHtcbiAgICAgICAgICAgICdjb3JlOmNvbmZpcm0nOiBldmVudCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnY29uZmlybScpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdjb3JlOmNhbmNlbCc6IGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdjYW5jZWwnKTtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zaG93V2VsY29tZSgpO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gICAgc2VyaWFsaXplKCkge31cblxuICAgIC8vIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBnZXRFbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xuICAgIH1cblxuICAgIGdldFRpdGxlKCkge1xuICAgICAgICByZXR1cm4gXCJTd2lmdFwiO1xuICAgIH1cblxuICAgIGdldERlZmF1bHRMb2NhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFwiYm90dG9tXCI7XG4gICAgfVxuXG4gICAgaXNWaXNpYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNvbXBvbmVudC5pc1Zpc2libGUoKTtcbiAgICB9XG5cbiAgICBzaG93V2VsY29tZSgpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcjtcbiAgICAgICAgY29uc3QgcGFja2FnZSA9IGNvbnRyb2xsZXIucGFja2FnZU5hbWUoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IGNvbnRyb2xsZXIudGFyZ2V0cygpO1xuXG4gICAgICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b21PZk91dHB1dCgpO1xuICAgICAgICB0aGlzLmFkZE91dHB1dChcIldlbGNvbWUgdG8gU3dpZnQgSURFLlwiKTtcbiAgICAgICAgdGhpcy5hZGRPdXRwdXQoYFBhY2thZ2U6ICR7cGFja2FnZX0uYCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGNvbnRyb2xsZXIudGFyZ2V0KCk7XG4gICAgICAgIGlmICh0YXJnZXQgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmFkZE91dHB1dChgTm8gdGFyZ2V0IHNldC5gKTtcbiAgICAgICAgfSBlbHNlIGlmIChjb250cm9sbGVyLnRhcmdldElzRGVmYXVsdCgpKSB7XG4gICAgICAgICAgICB0aGlzLmFkZE91dHB1dChgVGFyZ2V0IGRlZmF1bHRlZCB0bzogXFxgJHt0YXJnZXQubmFtZX1cXGAuYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZE91dHB1dChgVGFyZ2V0OiAke3RhcmdldC5uYW1lfS5gKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRPdXRwdXQoYCh1c2UgdGhlIHRhcmdldCBidXR0b24gdG8gY2hhbmdlKWApO1xuICAgIH1cblxuICAgIGNoZWNrRm9yQ29tbWFuZCgpIHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy5lZGl0b3I7XG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCk7XG4gICAgICAgIGNvbnN0IGJvdHRvbUxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYm90dG9tKTtcbiAgICAgICAgaWYgKGJvdHRvbUxpbmUgPT0gXCJcIikge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZExpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYm90dG9tIC0gMSk7XG4gICAgICAgICAgICBpZiAoY29tbWFuZExpbmUuc2xpY2UoMCwyKSA9PSBcIj4gXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kID0gY29tbWFuZExpbmUuc2xpY2UoMik7XG4gICAgICAgICAgICAgICAgaWYgKGNvbW1hbmQgIT0gdGhpcy5sYXN0Q29tbWFuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbW1hbmRcIiwgY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdENvbW1hbmQgPSBjb21tYW5kO1xuICAgICAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnXFxuPiAnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB3ZSd2ZSBsb3N0IHRoZSBwcm9tcHQgc29tZWhvdywgc28gYWRkIGFub3RoZXJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFRvQm90dG9tT2ZPdXRwdXQoKTtcbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPiAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZE91dHB1dChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGVkaXRvciA9IHRoaXMuZWRpdG9yO1xuICAgICAgICBjb25zdCBpbnNlcnRBdCA9IGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYm90dG9tKTtcblxuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbW2luc2VydEF0LCAwXSwgW2luc2VydEF0LDBdXSk7XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGRhdGEpO1xuICAgICAgICBlZGl0b3IuaW5zZXJ0TmV3bGluZSgpO1xuXG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkgKyAxO1xuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbW2JvdHRvbSwgMF0sIFtib3R0b20sMF1dKTtcbiAgICAgICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2JvdHRvbSwwXSk7XG4gICAgfVxuXG5cbiAgICBjbGVhck91dHB1dCgpIHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy5lZGl0b3I7XG4gICAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbWzAsMF0sIFtlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpICsgMSwgMF1dLCBcIj4gXCIpO1xuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzAsIDJdLCBbMCwyXV0pO1xuICAgICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbMCwwXSk7XG4gICAgfVxuXG4gICAgc2Nyb2xsVG9Cb3R0b21PZk91dHB1dCgpIHtcbiAgICAgICAgY29uc3QgZWRpdG9yID0gdGhpcy5lZGl0b3I7XG4gICAgICAgIGNvbnN0IGJvdHRvbSA9IGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCk7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYm90dG9tKTtcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1tib3R0b20sIDBdLCBbYm90dG9tLDBdXSk7XG4gICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtib3R0b20sMF0pO1xuICAgIH1cblxuICAgIGxsZGJDb21tYW5kKGNvbW1hbmQpIHtcbiAgICAgICAgaWYgKHRoaXMubGxkYikge1xuICAgICAgICAgICAgdGhpcy5sbGRiLnN0ZGluLndyaXRlKGAke2NvbW1hbmR9XFxuYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGVwSW4oKSB7XG4gICAgICAgIHRoaXMubGxkYkNvbW1hbmQoXCJzdGVwXCIpO1xuICAgIH1cblxuICAgIHN0ZXBPdXQoKSB7XG4gICAgICAgIHRoaXMubGxkYkNvbW1hbmQoXCJmaW5pc2hcIik7XG4gICAgfVxuXG4gICAgc3RlcE92ZXIoKSB7XG4gICAgICAgIHRoaXMubGxkYkNvbW1hbmQoXCJuZXh0XCIpO1xuICAgIH1cblxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgdGhpcy5sbGRiQ29tbWFuZChcImNvbnRpbnVlXCIpO1xuICAgIH1cblxuXG5cbiAgICBydW5BcHAoKSB7XG4gICAgICAgIHRoaXMuYnVpbGRBcHAodHJ1ZSk7XG4gICAgfVxuXG4gICAgYnVpbGRBcHAocnVuV2hlbkJ1aWx0KSB7XG4gICAgICAgIHRoaXMuc3RvcERlYnVnZ2VyKCk7XG5cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcjtcbiAgICAgICAgaWYoIWNvbnRyb2xsZXIuaGFzVGFyZ2V0KCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3V0cHV0KFwiUGxlYXNlIHNldCB0aGUgdGFyZ2V0IHRvIGJ1aWxkLlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4ZWN1dGFibGUgPSBjb250cm9sbGVyLnRhcmdldEV4ZWN1dGFibGUoKTtcbiAgICAgICAgdGhpcy5hZGRPdXRwdXQoYEJ1aWxkaW5nICR7ZXhlY3V0YWJsZX1gKVxuICAgICAgICBjb250cm9sbGVyLmNsZWFyRGlhZ25vc3RpY3MoKTtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZGF0YSA9PiB7IHRoaXMucHJvY2Vzc0J1aWxkZXJPdXRwdXQoZGF0YS50b1N0cmluZygpLnRyaW0oKSk7IH07XG4gICAgICAgIGNvbnN0IHN0ZGVyciA9IGRhdGEgPT4geyB0aGlzLnByb2Nlc3NCdWlsZGVyRXJyb3IoZGF0YS50b1N0cmluZygpLnRyaW0oKSk7IH07XG4gICAgICAgIHRoaXMuX2J1aWxkZXIgPSBjb250cm9sbGVyLnN3aWZ0KCkuYnVpbGQoZXhlY3V0YWJsZSwgc3Rkb3V0LCBzdGRlcnIsIGNvbnRyb2xsZXIuc2hvdWxkVXNlQnVpbGRlcigpKS50aGVuKCBjb2RlID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0J1aWxkZXJFeGl0KGNvZGUsIHJ1bldoZW5CdWlsdCk7XG4gICAgICAgICAgICB0aGlzLl9idWlsZGVyID0gbnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBydW5UZXN0cygpIHtcbiAgICAgICAgdGhpcy5zdG9wRGVidWdnZXIoKTtcblxuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyO1xuICAgICAgICBpZighY29udHJvbGxlci5oYXNUYXJnZXQoKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRPdXRwdXQoXCJQbGVhc2Ugc2V0IHRoZSB0YXJnZXQgdG8gdGVzdC5cIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb250cm9sbGVyLmNsZWFyRGlhZ25vc3RpY3MoKTtcbiAgICAgICAgY29uc3Qgc3Rkb3V0ID0gZGF0YSA9PiB7IGNvbnNvbGUubG9nKGRhdGEpOyB0aGlzLnByb2Nlc3NCdWlsZGVyT3V0cHV0KGRhdGEudG9TdHJpbmcoKS50cmltKCkpOyB9O1xuICAgICAgICBjb25zdCBzdGRlcnIgPSBkYXRhID0+IHsgdGhpcy5wcm9jZXNzQnVpbGRlckVycm9yKGRhdGEudG9TdHJpbmcoKS50cmltKCkpOyB9O1xuICAgICAgICB0aGlzLl90ZXN0ZXIgPSBjb250cm9sbGVyLnN3aWZ0KCkudGVzdChzdGRvdXQsIHN0ZGVycikudGhlbiggY29kZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NUZXN0c0V4aXQoY29kZSk7XG4gICAgICAgICAgICB0aGlzLl90ZXN0ZXIgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBydW5EZWJ1Z2dlcigpIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcjtcbiAgICAgICAgY29uc3QgZXhlY3V0YWJsZSA9IGNvbnRyb2xsZXIudGFyZ2V0RXhlY3V0YWJsZSgpO1xuICAgICAgICB0aGlzLmFkZE91dHB1dChgUnVubmluZyAke2V4ZWN1dGFibGV9LmApXG4gICAgICAgIHRoaXMubGxkYiA9IHNwYXduKGNvbnRyb2xsZXIubGxkYlBhdGgoKSwgW2NvbnRyb2xsZXIucHJvamVjdFJvb3QoKSArIFwiLy5idWlsZC9kZWJ1Zy9cIiArIGV4ZWN1dGFibGVdKTtcblxuICAgICAgICBjb25zdCBicmVha3BvaW50cyA9IGNvbnRyb2xsZXIuYnJlYWtwb2ludHMoKTtcbiAgICAgICAgYnJlYWtwb2ludHMuZm9yRWFjaCggYnJlYWtwb2ludCA9PiB7XG4gICAgICAgICAgICBpZiAoYnJlYWtwb2ludC5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IGBiICR7YnJlYWtwb2ludC51cml9OiR7YnJlYWtwb2ludC5saW5lfWA7XG4gICAgICAgICAgICAgICAgdGhpcy5sbGRiLnN0ZGluLndyaXRlKGNvbW1hbmQgKyBcIlxcblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5sbGRiLnN0ZGluLndyaXRlKCdyXFxuJyk7XG4gICAgICAgIHRoaXMubGxkYi5zdGRvdXQub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0RlYnVnZ2VyT3V0cHV0KGRhdGEudG9TdHJpbmcoKS50cmltKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sbGRiLnN0ZGVyci5vbignZGF0YScsZGF0YSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NEZWJ1Z2dlckVycm9yKGRhdGEudG9TdHJpbmcoKS50cmltKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGxkYi5vbignZXhpdCcsY29kZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NEZWJ1Z2dlckV4aXQoY29kZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0b3BEZWJ1Z2dlcigpIHtcbiAgICAgICAgaWYgKHRoaXMubGxkYiAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoXCJleGl0aW5nXCIpXG4gICAgICAgICAgICB0aGlzLmxsZGJDb21tYW5kKFwiZXhpdFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5sbGRiID0gbnVsbDtcbiAgICB9XG5cbiAgICBwcm9jZXNzQnVpbGRlck91dHB1dChvdXRwdXQpIHtcbiAgICAgICAgbGV0IG1hdGNoZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1hdGNoO1xuICAgICAgICBsZXQgcGF0dGVybiA9IC8oLiopOiguKik6KC4qKTogZXJyb3I6ICguKilcXG4vZztcblxuICAgICAgICAvLyBjb21waWxlciBlcnJvcnNcbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcGF0dGVybi5leGVjKG91dHB1dCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0geyBmaWxlOiBtYXRjaFsxXSwgbGluZTogbWF0Y2hbMl0sIGNvbHVtbjogbWF0Y2hbM10sIGRlc2NyaXB0aW9uOiBtYXRjaFs0XSB9XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIub3V0cHV0RXJyb3IoZXJyb3IpO1xuICAgICAgICAgICAgbWF0Y2hlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb21waWxlciB3YXJuaW5nc1xuICAgICAgICBwYXR0ZXJuID0gLyguKik6KC4qKTooLiopOiB3YXJuaW5nOiAoLiopXFxuL2c7XG4gICAgICAgIHdoaWxlIChtYXRjaCA9IHBhdHRlcm4uZXhlYyhvdXRwdXQpKSB7XG4gICAgICAgICAgICBjb25zdCB3YXJuaW5nID0geyBmaWxlOiBtYXRjaFsxXSwgbGluZTogbWF0Y2hbMl0sIGNvbHVtbjogbWF0Y2hbM10sIGRlc2NyaXB0aW9uOiBtYXRjaFs0XSB9XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIub3V0cHV0V2FybmluZyh3YXJuaW5nKTtcbiAgICAgICAgICAgIG1hdGNoZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdW5pdCB0ZXN0IGZhaWx1cmVzXG4gICAgICAgIHBhdHRlcm4gPSAvKC4qKTooLiopOiBlcnJvcjogKC4qKSA6ICguKikgKmZhaWxlZDoqICguKikgKi0gKC4qKVxcbi9nO1xuICAgICAgICB3aGlsZSAobWF0Y2ggPSBwYXR0ZXJuLmV4ZWMob3V0cHV0KSkge1xuICAgICAgICAgICAgY29uc3QgdGVzdCA9IG1hdGNoWzNdO1xuICAgICAgICAgICAgY29uc3Qga2luZCA9IG1hdGNoWzRdIHx8IFwidGVzdFwiO1xuICAgICAgICAgICAgdmFyIHJlYXNvbiA9IG1hdGNoWzVdO1xuICAgICAgICAgICAgY29uc3QgY29tbWVudCA9IG1hdGNoWzZdO1xuICAgICAgICAgICAgaWYgKGNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZWFzb24gKz0gXCIgLSBcIiArIGNvbW1lbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0geyBmaWxlOiBtYXRjaFsxXSwgbGluZTogbWF0Y2hbMl0sIGNvbHVtbjogMCwgZGVzY3JpcHRpb246IGAke2tpbmR9ICR7dGVzdH0gZmFpbGVkOiAke3JlYXNvbn1gIH1cbiAgICAgICAgICAgIHRoaXMuY29udHJvbGxlci5vdXRwdXRUZXN0RmFpbHVyZShlcnJvcik7XG4gICAgICAgICAgICBtYXRjaGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbWF0Y2hlZCkge1xuICAgICAgICAgICAgdGhpcy5hZGRPdXRwdXQoXCLCuyBcIiArIG91dHB1dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzQnVpbGRlckVycm9yKG91dHB1dCkge1xuICAgICAgICB0aGlzLmFkZE91dHB1dChcIiHCuyBcIiArIG91dHB1dCk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0J1aWxkZXJFeGl0KGNvZGUsIHJ1bldoZW5CdWlsdCkge1xuICAgICAgICBjb25zdCBjb2RlU3RyaW5nID0gY29kZS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgaWYgKGNvZGVTdHJpbmcgPT09ICcwJykge1xuICAgICAgICAgICAgdGhpcy5hZGRPdXRwdXQoYEJ1aWxkIHN1Y2NlZWRlZC5gKTtcbiAgICAgICAgICAgIGlmIChydW5XaGVuQnVpbHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bkRlYnVnZ2VyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZE91dHB1dChgQnVpbGQgZmFpbGVkIHdpdGggY29kZSA6ICR7Y29kZVN0cmluZ30uYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzVGVzdHNFeGl0KGNvZGUpIHtcbiAgICAgICAgY29uc3QgY29kZVN0cmluZyA9IGNvZGUudG9TdHJpbmcoKS50cmltKCk7XG4gICAgICAgIGlmIChjb2RlU3RyaW5nID09PSAnMCcpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkT3V0cHV0KGBUZXN0cyBzdWNjZWVkZWQuYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZE91dHB1dChgVGVzdHMgZmFpbGVkIHdpdGggY29kZSA6ICR7Y29kZVN0cmluZ30uYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJvY2Vzc0RlYnVnZ2VyT3V0cHV0KG91dHB1dCkge1xuICAgICAgICBsZXQgc3VwcHJlc3MgPSBmYWxzZTtcbiAgICAgICAgbGV0IG1hdGNoID0gL1Byb2Nlc3MgKC4qKSBsYXVuY2hlZC8uZXhlYyhvdXRwdXQpO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMucHJvY2VzcyA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyLnNldFN0YXRlKFwicnVubmluZ1wiKTtcbiAgICAgICAgICAgIHN1cHByZXNzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgIG1hdGNoID0gL1Byb2Nlc3MgKC4qKSBzdG9wcGVkLy5leGVjKG91dHB1dCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoXCJwYXVzZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBtYXRjaCA9IC9Qcm9jZXNzICguKikgcmVzdW1lZC8uZXhlYyhvdXRwdXQpO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyLnNldFN0YXRlKFwicnVubmluZ1wiKTtcbiAgICAgICAgICAgICAgICBzdXBwcmVzcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICBtYXRjaCA9IC9Qcm9jZXNzICguKikgZXhpdGVkLy5leGVjKG91dHB1dCk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoXCJleGl0ZWRcIik7XG4gICAgICAgICAgICAgICAgc3VwcHJlc3MgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgcGF0dGVybnMgPSBbXG4gICAgICAgICAgICAgICAgL1xcKGxsZGJcXCkgdGFyZ2V0IGNyZWF0ZSBcIi4qXCIvLFxuICAgICAgICAgICAgICAgIC9cXChsbGRiXFwpIGIgLiouc3dpZnQ6LiovXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgcGF0dGVybnMuZm9yRWFjaCggcGF0dGVybiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhdHRlcm4uZXhlYyhvdXRwdXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG91dHB1dCk7XG4gICAgICAgICAgICAgICAgICAgIHN1cHByZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN1cHByZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZE91dHB1dChvdXRwdXQpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzRGVidWdnZXJFcnJvcihlcnJvcikge1xuICAgICAgICB0aGlzLmFkZE91dHB1dChlcnJvcilcbiAgICB9XG5cbiAgICBwcm9jZXNzRGVidWdnZXJFeGl0KGNvZGUpIHtcbiAgICAgICAgdGhpcy5hZGRPdXRwdXQoYGV4aXQgY29kZTogJHtjb2RlLnRvU3RyaW5nKCkudHJpbSgpfWApO1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoXCJleGl0ZWRcIik7XG4gICAgfVxuXG4gICAgcGFyc2VDb21tYW5kKGNvbW1hbmQpIHtcbiAgICAgICAgaWYgKGNvbW1hbmQpIHtcbiAgICAgICAgICAgIHRoaXMubGxkYkNvbW1hbmQoY29tbWFuZCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIudXBkYXRlVG9vbEJhcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RyaW5nSXNCbGFuayhzdHIpIHtcbiAgICAgICAgcmV0dXJuICFzdHIgfHwgL15cXHMqJC8udGVzdChzdHIpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJkZXN0cm95IGNhbGxlZFwiKTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnZpZXcgPSBudWxsO1xuICAgIH1cblxuXG59XG4iXX0=