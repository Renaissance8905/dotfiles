Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Created by Sam Deane, 24/05/2018.
// All code (c) 2018 - present day, Elegant Chaos Limited.
// For licensing terms, see http://elegantchaos.com/license/liberal/.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var _atom = require('atom');

/**
    Process runner.
*/

'use babel';
var Runner = (function () {
    function Runner(name, command, cwd) {
        _classCallCheck(this, Runner);

        this._name = name;
        this._command = command;
        this._cwd = cwd;
        this._showError = true;
    }

    /**
        Run until exit, then deliver combined stdout, stderr and exit code
        via a promise.
    */

    _createClass(Runner, [{
        key: 'run',
        value: function run(args, transformer) {
            var _this = this;

            return new Promise(function (resolve) {
                var command = _this._command;

                var out = "";
                var err = "";

                var stdout = function stdout(text) {
                    out += text;
                };
                var stderr = function stderr(text) {
                    err += text;
                };
                var options = { cwd: _this._cwd };
                var exit = function exit(code) {
                    var result = transformer ? transformer(code, out, err) : { code: code, out: out, err: err };
                    resolve(result);
                };

                _this._makeProcess({ command: command, args: args, stdout: stdout, stderr: stderr, exit: exit, options: options }, resolve);
            });
        }

        /**
            Start a process, passing stdout, stderr to callbacks.
            We return a promise which resolves when the process finishes.
        */

    }, {
        key: 'start',
        value: function start(args, stdout, stderr) {
            var _this2 = this;

            return new Promise(function (resolve) {
                var command = _this2._command;
                var options = { cwd: _this2._cwd };
                var exit = function exit(code) {
                    resolve(code);
                };

                _this2._makeProcess({ command: command, args: args, stdout: stdout, stderr: stderr, exit: exit, options: options }, resolve);
            });
        }

        /**
            Make the process, handle any launch errors.
        */

    }, {
        key: '_makeProcess',
        value: function _makeProcess(settings, resolve) {
            var _this3 = this;

            var process = new _atom.BufferedProcess(settings);
            process.onWillThrowError(function (error) {
                if (_this3._showError) {
                    var _name = _this3._name;
                    atom.notifications.addFatalError('Couldn\'t launch ' + _name + ' (' + _this3._command + ').', {
                        detail: 'Please make sure that ' + _name + ' is installed, and either put it into your PATH or enter its location in the plugin settings.'
                    });
                    _this3._showError = false;
                }
                error.handle();
                resolve();
            });
            return process;
        }
    }]);

    return Runner;
})();

exports['default'] = Runner;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL3J1bm5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFROEIsTUFBTTs7Ozs7O0FBUnBDLFdBQVcsQ0FBQztJQWNTLE1BQU07QUFFWixhQUZNLE1BQU0sQ0FFWCxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRTs4QkFGZixNQUFNOztBQUduQixZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixZQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN4QixZQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUNoQixZQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztLQUMxQjs7Ozs7OztpQkFQZ0IsTUFBTTs7ZUFjcEIsYUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFFOzs7QUFDbkIsbUJBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUs7QUFDNUIsb0JBQU0sT0FBTyxHQUFHLE1BQUssUUFBUSxDQUFDOztBQUU5QixvQkFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2Isb0JBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQzs7QUFFYixvQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksSUFBSSxFQUFLO0FBQUUsdUJBQUcsSUFBSSxJQUFJLENBQUM7aUJBQUUsQ0FBQTtBQUN6QyxvQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksSUFBSSxFQUFLO0FBQUUsdUJBQUcsSUFBSSxJQUFJLENBQUM7aUJBQUUsQ0FBQTtBQUN6QyxvQkFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBSyxJQUFJLEVBQUUsQ0FBQztBQUNuQyxvQkFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLENBQUksSUFBSSxFQUFLO0FBQ25CLHdCQUFNLE1BQU0sR0FBRyxXQUFXLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUUsR0FBRyxFQUFILEdBQUcsRUFBRSxDQUFDO0FBQzlFLDJCQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ25CLENBQUE7O0FBRUQsc0JBQUssWUFBWSxDQUFDLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM5RSxDQUFDLENBQUM7U0FDTjs7Ozs7Ozs7O2VBT0ksZUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTs7O0FBQ3hCLG1CQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzVCLG9CQUFNLE9BQU8sR0FBRyxPQUFLLFFBQVEsQ0FBQztBQUM5QixvQkFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBSyxJQUFJLEVBQUUsQ0FBQztBQUNuQyxvQkFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLENBQUksSUFBSSxFQUFLO0FBQ25CLDJCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pCLENBQUE7O0FBRUQsdUJBQUssWUFBWSxDQUFDLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM5RSxDQUFDLENBQUM7U0FDTjs7Ozs7Ozs7ZUFNVyxzQkFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFOzs7QUFDNUIsZ0JBQUksT0FBTyxHQUFHLDBCQUFvQixRQUFRLENBQUMsQ0FBQTtBQUMzQyxtQkFBTyxDQUFDLGdCQUFnQixDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ2hDLG9CQUFJLE9BQUssVUFBVSxFQUFFO0FBQ2pCLHdCQUFNLEtBQUksR0FBRyxPQUFLLEtBQUssQ0FBQztBQUN4Qix3QkFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLHVCQUFvQixLQUFJLFVBQUssT0FBSyxRQUFRLFNBQU07QUFDNUUsOEJBQU0sNkJBQTJCLEtBQUksa0dBQStGO3FCQUN2SSxDQUFDLENBQUM7QUFDSCwyQkFBSyxVQUFVLEdBQUcsS0FBSyxDQUFDO2lCQUMzQjtBQUNELHFCQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDZix1QkFBTyxFQUFFLENBQUM7YUFDYixDQUFDLENBQUM7QUFDSCxtQkFBTyxPQUFPLENBQUM7U0FDbEI7OztXQXBFZ0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL2lkZS1zd2lmdC9saWIvcnVubmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIC09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LVxuLy8gQ3JlYXRlZCBieSBTYW0gRGVhbmUsIDI0LzA1LzIwMTguXG4vLyBBbGwgY29kZSAoYykgMjAxOCAtIHByZXNlbnQgZGF5LCBFbGVnYW50IENoYW9zIExpbWl0ZWQuXG4vLyBGb3IgbGljZW5zaW5nIHRlcm1zLCBzZWUgaHR0cDovL2VsZWdhbnRjaGFvcy5jb20vbGljZW5zZS9saWJlcmFsLy5cbi8vIC09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LVxuXG5pbXBvcnQge0J1ZmZlcmVkUHJvY2Vzc30gZnJvbSAnYXRvbSdcblxuLyoqXG4gICAgUHJvY2VzcyBydW5uZXIuXG4qL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5uZXIge1xuXG4gICAgY29uc3RydWN0b3IobmFtZSwgY29tbWFuZCwgY3dkKSB7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLl9jb21tYW5kID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5fY3dkID0gY3dkO1xuICAgICAgICB0aGlzLl9zaG93RXJyb3IgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAgICBSdW4gdW50aWwgZXhpdCwgdGhlbiBkZWxpdmVyIGNvbWJpbmVkIHN0ZG91dCwgc3RkZXJyIGFuZCBleGl0IGNvZGVcbiAgICAgICAgdmlhIGEgcHJvbWlzZS5cbiAgICAqL1xuXG4gICAgcnVuKGFyZ3MsIHRyYW5zZm9ybWVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IHRoaXMuX2NvbW1hbmQ7XG5cbiAgICAgICAgICAgIGxldCBvdXQgPSBcIlwiO1xuICAgICAgICAgICAgbGV0IGVyciA9IFwiXCI7XG5cbiAgICAgICAgICAgIGNvbnN0IHN0ZG91dCA9ICh0ZXh0KSA9PiB7IG91dCArPSB0ZXh0OyB9XG4gICAgICAgICAgICBjb25zdCBzdGRlcnIgPSAodGV4dCkgPT4geyBlcnIgKz0gdGV4dDsgfVxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHsgY3dkOiB0aGlzLl9jd2QgfTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXQgPSAoY29kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRyYW5zZm9ybWVyID8gdHJhbnNmb3JtZXIoY29kZSwgb3V0LCBlcnIpIDogeyBjb2RlLCBvdXQsIGVyciB9O1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fbWFrZVByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0LCBvcHRpb25zfSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAgICBTdGFydCBhIHByb2Nlc3MsIHBhc3Npbmcgc3Rkb3V0LCBzdGRlcnIgdG8gY2FsbGJhY2tzLlxuICAgICAgICBXZSByZXR1cm4gYSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdoZW4gdGhlIHByb2Nlc3MgZmluaXNoZXMuXG4gICAgKi9cblxuICAgIHN0YXJ0KGFyZ3MsIHN0ZG91dCwgc3RkZXJyKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IHRoaXMuX2NvbW1hbmQ7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0geyBjd2Q6IHRoaXMuX2N3ZCB9O1xuICAgICAgICAgICAgY29uc3QgZXhpdCA9IChjb2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fbWFrZVByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0LCBvcHRpb25zfSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAgICBNYWtlIHRoZSBwcm9jZXNzLCBoYW5kbGUgYW55IGxhdW5jaCBlcnJvcnMuXG4gICAgKi9cblxuICAgIF9tYWtlUHJvY2VzcyhzZXR0aW5ncywgcmVzb2x2ZSkge1xuICAgICAgICBsZXQgcHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moc2V0dGluZ3MpXG4gICAgICAgIHByb2Nlc3Mub25XaWxsVGhyb3dFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zaG93RXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5fbmFtZTtcbiAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihgQ291bGRuJ3QgbGF1bmNoICR7bmFtZX0gKCR7dGhpcy5fY29tbWFuZH0pLmAsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiBgUGxlYXNlIG1ha2Ugc3VyZSB0aGF0ICR7bmFtZX0gaXMgaW5zdGFsbGVkLCBhbmQgZWl0aGVyIHB1dCBpdCBpbnRvIHlvdXIgUEFUSCBvciBlbnRlciBpdHMgbG9jYXRpb24gaW4gdGhlIHBsdWdpbiBzZXR0aW5ncy5gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd0Vycm9yID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlcnJvci5oYW5kbGUoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9jZXNzO1xuICAgIH1cbn1cbiJdfQ==