Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Created by Sam Deane, 23/05/2018.
// All code (c) 2018 - present day, Elegant Chaos Limited.
// For licensing terms, see http://elegantchaos.com/license/liberal/.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var _atom = require('atom');

var _ideSwiftView = require('./ide-swift-view');

var _ideSwiftView2 = _interopRequireDefault(_ideSwiftView);

var _swift = require('./swift');

var _swift2 = _interopRequireDefault(_swift);

var _targetsView = require('./targets-view');

var _targetsView2 = _interopRequireDefault(_targetsView);

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

'use babel';
'use strict';

DebuggerViewURI = 'atom://ide-swift/lldb-console';

var IdeSwiftController = (function () {
    function IdeSwiftController(mainModule, state) {
        _classCallCheck(this, IdeSwiftController);

        this._state = "initial";
        this._view = null;
        this._diagnostics = {};
        this._didDefault = false;
        this._useBuilder = false;
        this._lldb = atom.config.get('ide-swift.lldb', {}) || 'lldb';
        this._swift = atom.config.get('ide-swift.swift', {}) || 'swift';
    }

    _createClass(IdeSwiftController, [{
        key: 'activate',
        value: function activate(serializedState) {
            var _this = this;

            atom.workspace.addOpener(function (url) {
                if (url === DebuggerViewURI) {
                    if (_this._view == null) {
                        return new _ideSwiftView2['default'](_this);
                    } else {
                        return _this._view;
                    }
                }
            });

            if (serializedState.target) {
                this._target = serializedState.target;
            }

            this.updateToolBar();
            this.makeSubscriptions();
            this.interrogatePackage(serializedState.visible);
        }
    }, {
        key: 'deactivate',
        value: function deactivate() {
            if (this._toolBar) {
                this._toolBar.removeItems();
                this._toolBar = null;
            }

            this._view.destroy();
            this.subscriptions.dispose();
        }
    }, {
        key: 'serialize',
        value: function serialize() {
            var serializedState = {
                target: this._target
            };

            var view = this._view;
            if (view) {
                serializedState.visible = view.isVisible();
            }

            return serializedState;
        }
    }, {
        key: 'projectRoot',
        value: function projectRoot() {
            var project = atom.project;
            var paths = project.getPaths();
            return paths.length > 0 ? paths[0] : "./";
        }
    }, {
        key: 'interrogatePackage',
        value: function interrogatePackage(showView) {
            var _this2 = this;

            this._showView = showView;
            var spm = this._swift = new _swift2['default'](this.projectRoot());
            spm.getPackage().then(function (package) {
                _this2._package = package;
                _this2.processPackage();
            });

            spm.getDescription().then(function (description) {
                var name = _this2._packageName = description.name;
                var targets = _this2._targets = { test: [], library: [], executable: [] };
                if (name) {
                    (function () {
                        description.targets.forEach(function (target) {
                            targets[target.type].push(target);
                            if (target.name === "Configure" && target.type == "executable") {
                                _this2._useBuilder = true;
                                console.log("Using Builder.");
                            }
                        });

                        targets.all = [].concat(targets.executable, targets.library, targets.test);
                        var byName = {};
                        targets.all.forEach(function (target) {
                            byName[target.name] = target;
                        });
                        targets.byName = byName;
                    })();
                }
                _this2.processPackage();
            });
        }
    }, {
        key: 'processPackage',
        value: function processPackage() {
            var targets = this._targets.byName;
            var package = this._package;
            if (targets && package) {
                var products = this._products = package.products;
                products.forEach(function (product) {
                    var type = product.product_type;
                    var productTargets = product.targets;
                    if (type == "executable" && productTargets) {
                        productTargets.forEach(function (target) {
                            var targetRecord = targets[target];
                            targetRecord.executable = product.name;
                            console.log('Executable for ' + targetRecord.name + ' is ' + targetRecord.executable + '.');
                        });
                    }
                });

                if (!this.hasTarget()) {
                    this.setTarget(this.defaultTarget());
                    this._didDefault = this.hasTarget();
                }

                if (this._showView) {
                    this.doWithView(function (view) {
                        view.showWelcome();
                    });
                }
            }
        }
    }, {
        key: 'makeSubscriptions',
        value: function makeSubscriptions() {
            var _this3 = this;

            var subscriptions = new _atom.CompositeDisposable();
            subscriptions.add(atom.commands.add('atom-workspace', {
                'ide-swift:toggle': function ideSwiftToggle() {
                    return atom.workspace.toggle(DebuggerViewURI);
                },
                'ide-swift:build': function ideSwiftBuild() {
                    return _this3.doWithView(function (view) {
                        return view.buildApp();
                    });
                },
                'ide-swift:debug': function ideSwiftDebug() {
                    return _this3.doWithView(function (view) {
                        return view.runApp();
                    });
                },
                'ide-swift:test': function ideSwiftTest() {
                    return _this3.doWithView(function (view) {
                        return view.runTests();
                    });
                },
                'ide-swift:debugOrResume': function ideSwiftDebugOrResume() {
                    return _this3.debugOrResume();
                },
                'ide-swift:stop': function ideSwiftStop() {
                    return _this3.doWithView(function (view) {
                        return view.stopApp();
                    });
                },
                'ide-swift:clear': function ideSwiftClear() {
                    return _this3.doWithView(function (view) {
                        return view.clearOutput();
                    });
                },
                'ide-swift:step-over': function ideSwiftStepOver() {
                    return _this3.doWithView(function (view) {
                        return view.stepOver();
                    });
                },
                'ide-swift:step-out': function ideSwiftStepOut() {
                    return _this3.doWithView(function (view) {
                        return view.stepOut();
                    });
                },
                'ide-swift:step-in': function ideSwiftStepIn() {
                    return _this3.doWithView(function (view) {
                        return view.stepIn();
                    });
                },
                'ide-swift:target': function ideSwiftTarget() {
                    return _this3.chooseTarget();
                }
            }));
            this.subscriptions = subscriptions;
        }
    }, {
        key: 'setConsole',
        value: function setConsole(console) {
            this._console = console;
        }
    }, {
        key: 'disposeConsole',
        value: function disposeConsole() {
            this._console = null;
        }
    }, {
        key: 'setLinter',
        value: function setLinter(linter) {
            this._linter = linter;
        }
    }, {
        key: 'outputDiagnostic',
        value: function outputDiagnostic(item, severity) {
            var linter = this._linter;
            var file = item.file;
            var line = item.line - 1;
            var column = item.column - 1;
            var items = this._diagnostics[file];
            if (!items) {
                this._diagnostics[file] = items = [];
            }

            items.push({
                severity: severity,
                location: {
                    file: file,
                    position: [[line, column], [line, column]]
                },
                excerpt: item.description,
                linterName: "Builder"
            });

            linter.setMessages(file, items);
        }
    }, {
        key: 'clearDiagnostics',
        value: function clearDiagnostics() {
            this._diagnostics = {};
            this._linter.setAllMessages([]);
        }
    }, {
        key: 'outputError',
        value: function outputError(error) {
            this.outputDiagnostic(error, 'error');
        }
    }, {
        key: 'outputWarning',
        value: function outputWarning(warning) {
            this.outputDiagnostic(warning, 'warning');
        }
    }, {
        key: 'outputTestFailure',
        value: function outputTestFailure(failure) {
            this.outputDiagnostic(failure, 'failure');
        }
    }, {
        key: 'setDebugger',
        value: function setDebugger(db) {
            this._debugger = db;
        }
    }, {
        key: 'disposeDebugger',
        value: function disposeDebugger() {
            this._debugger = null;
        }
    }, {
        key: 'setBusyService',
        value: function setBusyService(service) {
            this._busy = service;
        }
    }, {
        key: 'disposeBusyService',
        value: function disposeBusyService() {
            this._busy = null;
        }
    }, {
        key: 'reportBusy',
        value: function reportBusy(title, options) {
            var service = this._busy;
            if (service) {
                return service.reportBusy(title, options);
            }
        }
    }, {
        key: 'doWithView',
        value: function doWithView(action) {
            var _this4 = this;

            var options = { searchAllPanes: true };
            atom.workspace.open(DebuggerViewURI, options).then(function (view) {
                _this4._view = view;
                action(view);
                _this4.updateToolBar();
            });
        }
    }, {
        key: 'setupToolBar',
        value: function setupToolBar(toolBar) {
            var _this5 = this;

            var buttons = {};
            var playTooltip = { title: function title() {
                    return _this5.playTooltip();
                } };

            buttons.target = toolBar.addButton({ icon: 'bullseye', iconset: 'fa', callback: 'ide-swift:target', tooltip: 'Set target to build/test/debug.' });
            buttons.build = toolBar.addButton({ icon: 'wrench', iconset: 'fa', callback: 'ide-swift:build', tooltip: 'Build the target.' });
            buttons.test = toolBar.addButton({ icon: 'beaker', callback: 'ide-swift:test', tooltip: 'Run the tests.' });
            buttons.play = toolBar.addButton({ icon: 'play', iconset: 'fa', callback: 'ide-swift:debugOrResume', tooltip: playTooltip });
            buttons.stop = toolBar.addButton({ icon: 'stop', iconset: 'fa', callback: 'ide-swift:stop', tooltip: 'Stop debugging.' });
            buttons.over = toolBar.addButton({ icon: 'arrow-right', iconset: 'fa', callback: 'ide-swift:step-over', tooltip: 'Step to the next statement.' });
            buttons.out = toolBar.addButton({ icon: 'arrow-up', iconset: 'fa', callback: 'ide-swift:step-out', tooltip: 'Step out of the current function.' });
            buttons['in'] = toolBar.addButton({ icon: 'arrow-down', iconset: 'fa', callback: 'ide-swift:step-in', tooltip: 'Step into the next statement.' });
            buttons.clear = toolBar.addButton({ icon: 'trash', iconset: 'fa', callback: 'ide-swift:clear', tooltip: 'Clear the console.' });

            this._toolBar = toolBar;
            this._buttons = buttons;

            this.updateToolBar();
        }
    }, {
        key: 'chooseTarget',
        value: function chooseTarget() {
            var view = new _targetsView2['default'](this);
        }
    }, {
        key: 'debugOrResume',
        value: function debugOrResume() {
            var _this6 = this;

            this.doWithView(function (view) {
                if (_this6.appIsPaused()) {
                    view.resume();
                } else {
                    view.runApp();
                }
            });
        }
    }, {
        key: 'updateToolBar',
        value: function updateToolBar() {
            var buttons = this._buttons;
            if (buttons) {
                var gotView = this._view != null;
                var hasTarget = this.hasTarget();
                var paused = this.appIsPaused();

                buttons.play.setEnabled(!gotView || !this.appIsRunning());
                buttons.stop.setEnabled(this.appIsRunning() || paused);
                buttons.over.setEnabled(paused);
                buttons['in'].setEnabled(paused);
                buttons.out.setEnabled(paused);

                var playButton = buttons.play;
                var playIcon = paused ? 'play-circle-o' : 'play';
                this.updateIcon(playButton, playIcon, 'fa');
            }
        }
    }, {
        key: 'playTooltip',
        value: function playTooltip() {
            return this.appIsPaused() ? "Resume debugging the target." : "Debug the target.";
        }
    }, {
        key: 'updateIcon',
        value: function updateIcon(button, icon, iconset) {
            var classList = button.element.classList;
            var previousSet = button.options.iconset;
            if (previousSet) {
                classList.remove(previousSet);
            } else {
                previousSet = "icon";
            }
            var previousIcon = button.options.icon;
            classList.remove(previousSet + '-' + previousIcon);
            if (iconset) {
                classList.add(iconset);
            } else {
                iconset = "icon";
            }
            classList.add(iconset + '-' + icon);
        }
    }, {
        key: 'disposeToolbar',
        value: function disposeToolbar() {
            this._toolBar = null;
        }
    }, {
        key: 'setState',
        value: function setState(state) {
            this._state = state;
            this.updateToolBar();
        }
    }, {
        key: 'state',
        value: function state() {
            return this._state;
        }
    }, {
        key: 'swift',
        value: function swift() {
            return this._swift;
        }
    }, {
        key: 'appIsRunning',
        value: function appIsRunning() {
            return this._state == "running";
        }
    }, {
        key: 'appIsPaused',
        value: function appIsPaused() {
            return this._state == "paused";
        }
    }, {
        key: 'lldbPath',
        value: function lldbPath() {
            return this._lldb;
        }
    }, {
        key: 'swiftPath',
        value: function swiftPath() {
            return this._swift;
        }
    }, {
        key: 'breakpoints',
        value: function breakpoints() {
            return this._debugger.getModel().getBreakpoints();
        }
    }, {
        key: 'console',
        value: function console() {
            return this._console;
        }
    }, {
        key: 'setTarget',
        value: function setTarget(target) {
            var changed = this._target != target.name;
            this._target = target.name;
            return changed;
        }
    }, {
        key: 'shouldUseBuilder',
        value: function shouldUseBuilder() {
            return this._useBuilder;
        }
    }, {
        key: 'target',
        value: function target() {
            var targetName = this._target;
            if (targetName) {
                return this._targets.byName[targetName];
            }
        }
    }, {
        key: 'targetExecutable',
        value: function targetExecutable() {
            var target = this.target();
            var executable = target.executable;
            return executable ? executable : target.name;
        }
    }, {
        key: 'hasTarget',
        value: function hasTarget() {
            return this._target && this._target != "";
        }
    }, {
        key: 'targetIsDefault',
        value: function targetIsDefault() {
            return this._didDefault;
        }
    }, {
        key: 'packageName',
        value: function packageName() {
            return this._packageName;
        }
    }, {
        key: 'targets',
        value: function targets() {
            return this._targets;
        }
    }, {
        key: 'defaultTarget',
        value: function defaultTarget() {
            var targets = this._targets;
            if (targets.all.length > 0) {
                return targets.all[0];
            } else {
                return "";
            }
        }
    }]);

    return IdeSwiftController;
})();

exports['default'] = IdeSwiftController;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL2lkZS1zd2lmdC1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBU3FDLE1BQU07OzRCQUNsQixrQkFBa0I7Ozs7cUJBQ3pCLFNBQVM7Ozs7MkJBQ0gsZ0JBQWdCOzs7OzhCQUNiLGtCQUFrQjs7OztBQWI3QyxXQUFXLENBQUM7QUFDWixZQUFZLENBQUM7O0FBY2IsZUFBZSxHQUFHLCtCQUErQixDQUFDOztJQUU3QixrQkFBa0I7QUFFeEIsYUFGTSxrQkFBa0IsQ0FFdkIsVUFBVSxFQUFFLEtBQUssRUFBRTs4QkFGZCxrQkFBa0I7O0FBSS9CLFlBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFlBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDO0FBQzdELFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDO0tBRW5FOztpQkFaZ0Isa0JBQWtCOztlQWMzQixrQkFBQyxlQUFlLEVBQUU7OztBQUN0QixnQkFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUUsVUFBQyxHQUFHLEVBQUs7QUFDL0Isb0JBQUksR0FBRyxLQUFLLGVBQWUsRUFBRTtBQUN6Qix3QkFBSSxNQUFLLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDcEIsK0JBQU8sb0NBQXNCLENB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QUFHO0FBQ0wsZ0JBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDaEMsZ0JBQUksVUFBVSxFQUFFO0FBQ1osdUJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDM0M7U0FDSjs7O2VBRWUsNEJBQUc7QUFDZixnQkFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzdCLGdCQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3JDLG1CQUFPLFVBQVUsR0FBRyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztTQUNoRDs7O2VBRVEscUJBQUc7QUFDUixtQkFBTyxJQUFJLENBQUMsT0FBTyxJQUFLLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxBQUFDLENBQUM7U0FDL0M7OztlQUVjLDJCQUFHO0FBQ2QsbUJBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztTQUMzQjs7O2VBRVUsdUJBQUc7QUFDVixtQkFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1NBQzVCOzs7ZUFFTSxtQkFBRztBQUNOLG1CQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDeEI7OztlQUVZLHlCQUFHO0FBQ1osZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDOUIsZ0JBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLHVCQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDekIsTUFBTTtBQUNILHVCQUFPLEVBQUUsQ0FBQzthQUNiO1NBQ0o7OztXQXRZZ0Isa0JBQWtCOzs7cUJBQWxCLGtCQUFrQiIsImZpbGUiOiIvVXNlcnMvY2pzcHJhZGxpbmcvLmF0b20vcGFja2FnZXMvaWRlLXN3aWZ0L2xpYi9pZGUtc3dpZnQtY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cbi8vIENyZWF0ZWQgYnkgU2FtIERlYW5lLCAyMy8wNS8yMDE4LlxuLy8gQWxsIGNvZGUgKGMpIDIwMTggLSBwcmVzZW50IGRheSwgRWxlZ2FudCBDaGFvcyBMaW1pdGVkLlxuLy8gRm9yIGxpY2Vuc2luZyB0ZXJtcywgc2VlIGh0dHA6Ly9lbGVnYW50Y2hhb3MuY29tL2xpY2Vuc2UvbGliZXJhbC8uXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSAgfSBmcm9tICdhdG9tJztcbmltcG9ydCBJZGVTd2lmdFZpZXcgZnJvbSAnLi9pZGUtc3dpZnQtdmlldyc7XG5pbXBvcnQgU3dpZnQgZnJvbSAnLi9zd2lmdCc7XG5pbXBvcnQgVGFyZ2V0c1ZpZXcgZnJvbSAnLi90YXJnZXRzLXZpZXcnO1xuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gJ2F0b20tc2VsZWN0LWxpc3QnO1xuXG5EZWJ1Z2dlclZpZXdVUkkgPSAnYXRvbTovL2lkZS1zd2lmdC9sbGRiLWNvbnNvbGUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJZGVTd2lmdENvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IobWFpbk1vZHVsZSwgc3RhdGUpIHtcblxuICAgICAgICB0aGlzLl9zdGF0ZSA9IFwiaW5pdGlhbFwiO1xuICAgICAgICB0aGlzLl92aWV3ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZGlhZ25vc3RpY3MgPSB7fTtcbiAgICAgICAgdGhpcy5fZGlkRGVmYXVsdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl91c2VCdWlsZGVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2xsZGIgPSBhdG9tLmNvbmZpZy5nZXQoJ2lkZS1zd2lmdC5sbGRiJywge30pIHx8ICdsbGRiJztcbiAgICAgICAgdGhpcy5fc3dpZnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2lkZS1zd2lmdC5zd2lmdCcsIHt9KSB8fCAnc3dpZnQnO1xuXG4gICAgfVxuXG4gICAgYWN0aXZhdGUoc2VyaWFsaXplZFN0YXRlKSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciggKHVybCkgPT4ge1xuICAgICAgICAgICAgaWYgKHVybCA9PT0gRGVidWdnZXJWaWV3VVJJKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZpZXcgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IElkZVN3aWZ0Vmlldyh0aGlzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmlldztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzZXJpYWxpemVkU3RhdGUudGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLl90YXJnZXQgPSBzZXJpYWxpemVkU3RhdGUudGFyZ2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVUb29sQmFyKCk7XG4gICAgICAgIHRoaXMubWFrZVN1YnNjcmlwdGlvbnMoKTtcbiAgICAgICAgdGhpcy5pbnRlcnJvZ2F0ZVBhY2thZ2Uoc2VyaWFsaXplZFN0YXRlLnZpc2libGUpO1xuICAgIH1cblxuICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLl90b29sQmFyKSB7XG4gICAgICAgICAgICB0aGlzLl90b29sQmFyLnJlbW92ZUl0ZW1zKCk7XG4gICAgICAgICAgICB0aGlzLl90b29sQmFyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3ZpZXcuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZFN0YXRlID0ge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLl90YXJnZXRcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5fdmlldztcbiAgICAgICAgaWYgKHZpZXcpIHtcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRTdGF0ZS52aXNpYmxlID0gdmlldy5pc1Zpc2libGUoKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZWRTdGF0ZTtcbiAgICB9XG5cbiAgICBwcm9qZWN0Um9vdCgpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGF0b20ucHJvamVjdDtcbiAgICAgICAgY29uc3QgcGF0aHMgPSBwcm9qZWN0LmdldFBhdGhzKCk7XG4gICAgICAgIHJldHVybiAocGF0aHMubGVuZ3RoID4gMCkgPyBwYXRoc1swXSA6IFwiLi9cIlxuICAgIH1cblxuICAgIGludGVycm9nYXRlUGFja2FnZShzaG93Vmlldykge1xuICAgICAgICB0aGlzLl9zaG93VmlldyA9IHNob3dWaWV3O1xuICAgICAgICBjb25zdCBzcG0gPSB0aGlzLl9zd2lmdCA9IG5ldyBTd2lmdCh0aGlzLnByb2plY3RSb290KCkpO1xuICAgICAgICBzcG0uZ2V0UGFja2FnZSgpLnRoZW4oIHBhY2thZ2UgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcGFja2FnZSA9IHBhY2thZ2U7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NQYWNrYWdlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNwbS5nZXREZXNjcmlwdGlvbigpLnRoZW4oIGRlc2NyaXB0aW9uID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLl9wYWNrYWdlTmFtZSA9IGRlc2NyaXB0aW9uLm5hbWU7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuX3RhcmdldHMgPSB7IHRlc3Q6W10sIGxpYnJhcnk6W10sIGV4ZWN1dGFibGU6W10gfTtcbiAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24udGFyZ2V0cy5mb3JFYWNoKCAodGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldHNbdGFyZ2V0LnR5cGVdLnB1c2godGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCh0YXJnZXQubmFtZSA9PT0gXCJDb25maWd1cmVcIikgJiYgKHRhcmdldC50eXBlID09IFwiZXhlY3V0YWJsZVwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXNlQnVpbGRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVzaW5nIEJ1aWxkZXIuXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRhcmdldHMuYWxsID0gW10uY29uY2F0KHRhcmdldHMuZXhlY3V0YWJsZSwgdGFyZ2V0cy5saWJyYXJ5LCB0YXJnZXRzLnRlc3QpO1xuICAgICAgICAgICAgICAgIGxldCBieU5hbWUgPSB7fTtcbiAgICAgICAgICAgICAgICB0YXJnZXRzLmFsbC5mb3JFYWNoKCB0YXJnZXQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBieU5hbWVbdGFyZ2V0Lm5hbWVdID0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRhcmdldHMuYnlOYW1lID0gYnlOYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUGFja2FnZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGFja2FnZSgpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0cyA9IHRoaXMuX3RhcmdldHMuYnlOYW1lO1xuICAgICAgICBjb25zdCBwYWNrYWdlID0gdGhpcy5fcGFja2FnZTtcbiAgICAgICAgaWYgKHRhcmdldHMgJiYgcGFja2FnZSkge1xuICAgICAgICAgICAgY29uc3QgcHJvZHVjdHMgPSB0aGlzLl9wcm9kdWN0cyA9IHBhY2thZ2UucHJvZHVjdHM7XG4gICAgICAgICAgICBwcm9kdWN0cy5mb3JFYWNoKCBwcm9kdWN0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gcHJvZHVjdC5wcm9kdWN0X3R5cGU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZHVjdFRhcmdldHMgPSBwcm9kdWN0LnRhcmdldHM7XG4gICAgICAgICAgICAgICAgaWYgKCh0eXBlID09IFwiZXhlY3V0YWJsZVwiKSAmJiBwcm9kdWN0VGFyZ2V0cykge1xuICAgICAgICAgICAgICAgICAgICBwcm9kdWN0VGFyZ2V0cy5mb3JFYWNoKCB0YXJnZXQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UmVjb3JkID0gdGFyZ2V0c1t0YXJnZXRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UmVjb3JkLmV4ZWN1dGFibGUgPSBwcm9kdWN0Lm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRXhlY3V0YWJsZSBmb3IgJHt0YXJnZXRSZWNvcmQubmFtZX0gaXMgJHt0YXJnZXRSZWNvcmQuZXhlY3V0YWJsZX0uYClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNUYXJnZXQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZGVmYXVsdFRhcmdldCgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaWREZWZhdWx0ID0gdGhpcy5oYXNUYXJnZXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuX3Nob3dWaWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kb1dpdGhWaWV3KCAodmlldykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB2aWV3LnNob3dXZWxjb21lKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VTdWJzY3JpcHRpb25zKCkge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgICAgICdpZGUtc3dpZnQ6dG9nZ2xlJzogKCkgPT4gYXRvbS53b3Jrc3BhY2UudG9nZ2xlKERlYnVnZ2VyVmlld1VSSSksXG4gICAgICAgICAgICAnaWRlLXN3aWZ0OmJ1aWxkJzogKCkgPT4gdGhpcy5kb1dpdGhWaWV3KCh2aWV3KSA9PiB2aWV3LmJ1aWxkQXBwKCkpLFxuICAgICAgICAgICAgJ2lkZS1zd2lmdDpkZWJ1Zyc6ICgpID0+IHRoaXMuZG9XaXRoVmlldygodmlldykgPT4gdmlldy5ydW5BcHAoKSksXG4gICAgICAgICAgICAnaWRlLXN3aWZ0OnRlc3QnOiAoKSA9PiB0aGlzLmRvV2l0aFZpZXcoKHZpZXcpID0+IHZpZXcucnVuVGVzdHMoKSksXG4gICAgICAgICAgICAnaWRlLXN3aWZ0OmRlYnVnT3JSZXN1bWUnOiAoKSA9PiB0aGlzLmRlYnVnT3JSZXN1bWUoKSxcbiAgICAgICAgICAgICdpZGUtc3dpZnQ6c3RvcCc6ICgpID0+IHRoaXMuZG9XaXRoVmlldygodmlldykgPT4gdmlldy5zdG9wQXBwKCkpLFxuICAgICAgICAgICAgJ2lkZS1zd2lmdDpjbGVhcic6ICgpID0+IHRoaXMuZG9XaXRoVmlldygodmlldykgPT4gdmlldy5jbGVhck91dHB1dCgpKSxcbiAgICAgICAgICAgICdpZGUtc3dpZnQ6c3RlcC1vdmVyJzogKCkgPT4gdGhpcy5kb1dpdGhWaWV3KCh2aWV3KSA9PiB2aWV3LnN0ZXBPdmVyKCkpLFxuICAgICAgICAgICAgJ2lkZS1zd2lmdDpzdGVwLW91dCc6ICgpID0+IHRoaXMuZG9XaXRoVmlldygodmlldykgPT4gdmlldy5zdGVwT3V0KCkpLFxuICAgICAgICAgICAgJ2lkZS1zd2lmdDpzdGVwLWluJzogKCkgPT4gdGhpcy5kb1dpdGhWaWV3KCh2aWV3KSA9PiB2aWV3LnN0ZXBJbigpKSxcbiAgICAgICAgICAgICdpZGUtc3dpZnQ6dGFyZ2V0JzogKCkgPT4gdGhpcy5jaG9vc2VUYXJnZXQoKVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gICAgfVxuXG4gICAgc2V0Q29uc29sZShjb25zb2xlKSB7XG4gICAgICAgIHRoaXMuX2NvbnNvbGUgPSBjb25zb2xlO1xuICAgIH1cblxuICAgIGRpc3Bvc2VDb25zb2xlKCkge1xuICAgICAgICB0aGlzLl9jb25zb2xlID0gbnVsbDtcbiAgICB9XG5cbiAgICBzZXRMaW50ZXIobGludGVyKSB7XG4gICAgICAgIHRoaXMuX2xpbnRlciA9IGxpbnRlcjtcbiAgICB9XG5cbiAgICBvdXRwdXREaWFnbm9zdGljKGl0ZW0sIHNldmVyaXR5KSB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IHRoaXMuX2xpbnRlcjtcbiAgICAgICAgY29uc3QgZmlsZSA9IGl0ZW0uZmlsZTtcbiAgICAgICAgY29uc3QgbGluZSA9IGl0ZW0ubGluZSAtIDE7XG4gICAgICAgIGNvbnN0IGNvbHVtbiA9IGl0ZW0uY29sdW1uIC0gMTtcbiAgICAgICAgbGV0IGl0ZW1zID0gdGhpcy5fZGlhZ25vc3RpY3NbZmlsZV07XG4gICAgICAgIGlmICghaXRlbXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2RpYWdub3N0aWNzW2ZpbGVdID0gaXRlbXMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgc2V2ZXJpdHk6IHNldmVyaXR5LFxuICAgICAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBbW2xpbmUsIGNvbHVtbl0sIFtsaW5lLCBjb2x1bW5dXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleGNlcnB0OiBpdGVtLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgbGludGVyTmFtZTogXCJCdWlsZGVyXCJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGludGVyLnNldE1lc3NhZ2VzKGZpbGUsIGl0ZW1zKTtcbiAgICB9XG5cbiAgICBjbGVhckRpYWdub3N0aWNzKCkge1xuICAgICAgICB0aGlzLl9kaWFnbm9zdGljcyA9IHt9O1xuICAgICAgICB0aGlzLl9saW50ZXIuc2V0QWxsTWVzc2FnZXMoW10pO1xuICAgIH1cblxuICAgIG91dHB1dEVycm9yKGVycm9yKSB7XG4gICAgICAgIHRoaXMub3V0cHV0RGlhZ25vc3RpYyhlcnJvciwgJ2Vycm9yJyk7XG4gICAgfVxuXG4gICAgb3V0cHV0V2FybmluZyh3YXJuaW5nKSB7XG4gICAgICAgIHRoaXMub3V0cHV0RGlhZ25vc3RpYyh3YXJuaW5nLCAnd2FybmluZycpO1xuICAgIH1cblxuXG4gICAgb3V0cHV0VGVzdEZhaWx1cmUoZmFpbHVyZSkge1xuICAgICAgICB0aGlzLm91dHB1dERpYWdub3N0aWMoZmFpbHVyZSwgJ2ZhaWx1cmUnKTtcbiAgICAgICAgfVxuXG4gICAgc2V0RGVidWdnZXIoZGIpIHtcbiAgICAgICAgdGhpcy5fZGVidWdnZXIgPSBkYjtcbiAgICB9XG5cbiAgICBkaXNwb3NlRGVidWdnZXIoKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnZ2VyID0gbnVsbDtcbiAgICB9XG5cbiAgICBzZXRCdXN5U2VydmljZShzZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuX2J1c3kgPSBzZXJ2aWNlO1xuICAgIH1cblxuICAgIGRpc3Bvc2VCdXN5U2VydmljZSgpIHtcbiAgICAgICAgdGhpcy5fYnVzeSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmVwb3J0QnVzeSh0aXRsZSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZXJ2aWNlID0gdGhpcy5fYnVzeTtcbiAgICAgICAgaWYgKHNlcnZpY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlLnJlcG9ydEJ1c3kodGl0bGUsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZG9XaXRoVmlldyhhY3Rpb24pIHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfTtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihEZWJ1Z2dlclZpZXdVUkksIG9wdGlvbnMpLnRoZW4oICh2aWV3KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl92aWV3ID0gdmlldztcbiAgICAgICAgICAgIGFjdGlvbih2aWV3KTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVG9vbEJhcigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXR1cFRvb2xCYXIodG9vbEJhcikge1xuICAgICAgICBjb25zdCBidXR0b25zID0ge307XG4gICAgICAgIGNvbnN0IHBsYXlUb29sdGlwID0geyB0aXRsZTogKCkgPT4geyByZXR1cm4gdGhpcy5wbGF5VG9vbHRpcCgpOyB9IH07XG5cbiAgICAgICAgYnV0dG9ucy50YXJnZXQgPSB0b29sQmFyLmFkZEJ1dHRvbih7IGljb246ICdidWxsc2V5ZScsIGljb25zZXQ6ICdmYScsIGNhbGxiYWNrOiAnaWRlLXN3aWZ0OnRhcmdldCcsIHRvb2x0aXA6ICdTZXQgdGFyZ2V0IHRvIGJ1aWxkL3Rlc3QvZGVidWcuJ30pO1xuICAgICAgICBidXR0b25zLmJ1aWxkID0gdG9vbEJhci5hZGRCdXR0b24oeyBpY29uOiAnd3JlbmNoJywgaWNvbnNldDogJ2ZhJywgY2FsbGJhY2s6ICdpZGUtc3dpZnQ6YnVpbGQnLCB0b29sdGlwOiAnQnVpbGQgdGhlIHRhcmdldC4nfSk7XG4gICAgICAgIGJ1dHRvbnMudGVzdCA9IHRvb2xCYXIuYWRkQnV0dG9uKHsgaWNvbjogJ2JlYWtlcicsIGNhbGxiYWNrOiAnaWRlLXN3aWZ0OnRlc3QnLCB0b29sdGlwOiAnUnVuIHRoZSB0ZXN0cy4nfSk7XG4gICAgICAgIGJ1dHRvbnMucGxheSA9IHRvb2xCYXIuYWRkQnV0dG9uKHsgaWNvbjogJ3BsYXknLCBpY29uc2V0OiAnZmEnLCBjYWxsYmFjazogJ2lkZS1zd2lmdDpkZWJ1Z09yUmVzdW1lJywgdG9vbHRpcDogcGxheVRvb2x0aXB9KTtcbiAgICAgICAgYnV0dG9ucy5zdG9wID0gdG9vbEJhci5hZGRCdXR0b24oeyBpY29uOiAnc3RvcCcsIGljb25zZXQ6ICdmYScsIGNhbGxiYWNrOiAnaWRlLXN3aWZ0OnN0b3AnLCB0b29sdGlwOiAnU3RvcCBkZWJ1Z2dpbmcuJ30pO1xuICAgICAgICBidXR0b25zLm92ZXIgPSB0b29sQmFyLmFkZEJ1dHRvbih7IGljb246ICdhcnJvdy1yaWdodCcsIGljb25zZXQ6ICdmYScsIGNhbGxiYWNrOiAnaWRlLXN3aWZ0OnN0ZXAtb3ZlcicsIHRvb2x0aXA6ICdTdGVwIHRvIHRoZSBuZXh0IHN0YXRlbWVudC4nfSk7XG4gICAgICAgIGJ1dHRvbnMub3V0ID0gdG9vbEJhci5hZGRCdXR0b24oeyBpY29uOiAnYXJyb3ctdXAnLCBpY29uc2V0OiAnZmEnLCBjYWxsYmFjazogJ2lkZS1zd2lmdDpzdGVwLW91dCcsIHRvb2x0aXA6ICdTdGVwIG91dCBvZiB0aGUgY3VycmVudCBmdW5jdGlvbi4nfSk7XG4gICAgICAgIGJ1dHRvbnMuaW4gPSB0b29sQmFyLmFkZEJ1dHRvbih7IGljb246ICdhcnJvdy1kb3duJywgaWNvbnNldDogJ2ZhJywgY2FsbGJhY2s6ICdpZGUtc3dpZnQ6c3RlcC1pbicsIHRvb2x0aXA6ICdTdGVwIGludG8gdGhlIG5leHQgc3RhdGVtZW50Lid9KTtcbiAgICAgICAgYnV0dG9ucy5jbGVhciA9IHRvb2xCYXIuYWRkQnV0dG9uKHsgaWNvbjogJ3RyYXNoJywgaWNvbnNldDogJ2ZhJywgY2FsbGJhY2s6ICdpZGUtc3dpZnQ6Y2xlYXInLCB0b29sdGlwOiAnQ2xlYXIgdGhlIGNvbnNvbGUuJ30pO1xuXG4gICAgICAgIHRoaXMuX3Rvb2xCYXIgPSB0b29sQmFyO1xuICAgICAgICB0aGlzLl9idXR0b25zID0gYnV0dG9ucztcblxuICAgICAgICB0aGlzLnVwZGF0ZVRvb2xCYXIoKTtcbiAgICB9XG5cbiAgICBjaG9vc2VUYXJnZXQoKSB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgVGFyZ2V0c1ZpZXcodGhpcyk7XG4gICAgfVxuXG4gICAgZGVidWdPclJlc3VtZSgpIHtcbiAgICAgICAgdGhpcy5kb1dpdGhWaWV3KCh2aWV3KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5hcHBJc1BhdXNlZCgpKSB7XG4gICAgICAgICAgICAgICAgdmlldy5yZXN1bWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmlldy5ydW5BcHAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXBkYXRlVG9vbEJhcigpIHtcbiAgICAgICAgY29uc3QgYnV0dG9ucyA9IHRoaXMuX2J1dHRvbnM7XG4gICAgICAgIGlmIChidXR0b25zKSB7XG4gICAgICAgICAgICBjb25zdCBnb3RWaWV3ID0gdGhpcy5fdmlldyAhPSBudWxsO1xuICAgICAgICAgICAgY29uc3QgaGFzVGFyZ2V0ID0gdGhpcy5oYXNUYXJnZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdXNlZCA9IHRoaXMuYXBwSXNQYXVzZWQoKTtcblxuICAgICAgICAgICAgYnV0dG9ucy5wbGF5LnNldEVuYWJsZWQoKCFnb3RWaWV3IHx8ICF0aGlzLmFwcElzUnVubmluZygpKSk7XG4gICAgICAgICAgICBidXR0b25zLnN0b3Auc2V0RW5hYmxlZCh0aGlzLmFwcElzUnVubmluZygpIHx8IHBhdXNlZCk7XG4gICAgICAgICAgICBidXR0b25zLm92ZXIuc2V0RW5hYmxlZChwYXVzZWQpO1xuICAgICAgICAgICAgYnV0dG9ucy5pbi5zZXRFbmFibGVkKHBhdXNlZCk7XG4gICAgICAgICAgICBidXR0b25zLm91dC5zZXRFbmFibGVkKHBhdXNlZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBsYXlCdXR0b24gPSBidXR0b25zLnBsYXk7XG4gICAgICAgICAgICBjb25zdCBwbGF5SWNvbiA9IHBhdXNlZCA/ICdwbGF5LWNpcmNsZS1vJyA6ICdwbGF5JztcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSWNvbihwbGF5QnV0dG9uLCBwbGF5SWNvbiwgJ2ZhJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGF5VG9vbHRpcCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwSXNQYXVzZWQoKSA/IFwiUmVzdW1lIGRlYnVnZ2luZyB0aGUgdGFyZ2V0LlwiIDogXCJEZWJ1ZyB0aGUgdGFyZ2V0LlwiO1xuICAgIH1cblxuICAgIHVwZGF0ZUljb24oYnV0dG9uLCBpY29uLCBpY29uc2V0KSB7XG4gICAgICAgIGNvbnN0IGNsYXNzTGlzdCA9IGJ1dHRvbi5lbGVtZW50LmNsYXNzTGlzdDtcbiAgICAgICAgbGV0IHByZXZpb3VzU2V0ID0gYnV0dG9uLm9wdGlvbnMuaWNvbnNldDtcbiAgICAgICAgaWYgKHByZXZpb3VzU2V0KSB7XG4gICAgICAgICAgICBjbGFzc0xpc3QucmVtb3ZlKHByZXZpb3VzU2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByZXZpb3VzU2V0ID0gXCJpY29uXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJldmlvdXNJY29uID0gYnV0dG9uLm9wdGlvbnMuaWNvbjtcbiAgICAgICAgY2xhc3NMaXN0LnJlbW92ZShgJHtwcmV2aW91c1NldH0tJHtwcmV2aW91c0ljb259YCk7XG4gICAgICAgIGlmIChpY29uc2V0KSB7XG4gICAgICAgICAgICBjbGFzc0xpc3QuYWRkKGljb25zZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWNvbnNldCA9IFwiaWNvblwiO1xuICAgICAgICB9XG4gICAgICAgIGNsYXNzTGlzdC5hZGQoYCR7aWNvbnNldH0tJHtpY29ufWApO1xuICAgIH1cblxuICAgIGRpc3Bvc2VUb29sYmFyKCkge1xuICAgICAgICB0aGlzLl90b29sQmFyID0gbnVsbDtcbiAgICB9XG5cbiAgICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IHN0YXRlO1xuICAgICAgICB0aGlzLnVwZGF0ZVRvb2xCYXIoKTtcbiAgICB9XG5cbiAgICBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH1cblxuICAgIHN3aWZ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3dpZnQ7XG4gICAgfVxuXG4gICAgYXBwSXNSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhdGUgPT0gXCJydW5uaW5nXCI7XG4gICAgfVxuXG4gICAgYXBwSXNQYXVzZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGF0ZSA9PSBcInBhdXNlZFwiO1xuICAgIH1cblxuICAgIGxsZGJQYXRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGxkYjtcbiAgICB9XG5cbiAgICBzd2lmdFBhdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zd2lmdDtcbiAgICB9XG5cbiAgICBicmVha3BvaW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlYnVnZ2VyLmdldE1vZGVsKCkuZ2V0QnJlYWtwb2ludHMoKTtcbiAgICB9XG5cbiAgICBjb25zb2xlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29uc29sZTtcbiAgICB9XG5cbiAgICBzZXRUYXJnZXQodGFyZ2V0KSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLl90YXJnZXQgIT0gdGFyZ2V0Lm5hbWU7XG4gICAgICAgIHRoaXMuX3RhcmdldCA9IHRhcmdldC5uYW1lO1xuICAgICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG5cbiAgICBzaG91bGRVc2VCdWlsZGVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdXNlQnVpbGRlcjtcbiAgICB9XG5cbiAgICB0YXJnZXQoKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldE5hbWUgPSB0aGlzLl90YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXROYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0cy5ieU5hbWVbdGFyZ2V0TmFtZV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0YXJnZXRFeGVjdXRhYmxlKCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLnRhcmdldCgpO1xuICAgICAgICBjb25zdCBleGVjdXRhYmxlID0gdGFyZ2V0LmV4ZWN1dGFibGU7XG4gICAgICAgIHJldHVybiBleGVjdXRhYmxlID8gZXhlY3V0YWJsZSA6IHRhcmdldC5uYW1lO1xuICAgIH1cblxuICAgIGhhc1RhcmdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3RhcmdldCAmJiAodGhpcy5fdGFyZ2V0ICE9IFwiXCIpO1xuICAgIH1cblxuICAgIHRhcmdldElzRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpZERlZmF1bHQ7XG4gICAgfVxuXG4gICAgcGFja2FnZU5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWNrYWdlTmFtZTtcbiAgICB9XG5cbiAgICB0YXJnZXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGFyZ2V0cztcbiAgICB9XG5cbiAgICBkZWZhdWx0VGFyZ2V0KCkge1xuICAgICAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5fdGFyZ2V0cztcbiAgICAgICAgaWYgKHRhcmdldHMuYWxsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRzLmFsbFswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19