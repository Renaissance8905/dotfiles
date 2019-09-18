Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Created by Sam Deane, 24/05/2018.
// All code (c) 2018 - present day, Elegant Chaos Limited.
// For licensing terms, see http://elegantchaos.com/license/liberal/.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var _runner = require('./runner');

var _runner2 = _interopRequireDefault(_runner);

'use babel';
var Swift = (function (_Runner) {
    _inherits(Swift, _Runner);

    function Swift(cwd) {
        _classCallCheck(this, Swift);

        var exe = atom.config.get('ide-swift.swift', {}) || 'swift';
        _get(Object.getPrototypeOf(Swift.prototype), 'constructor', this).call(this, "swift", exe, cwd);
    }

    _createClass(Swift, [{
        key: 'getDescription',
        value: function getDescription() {
            return this.run(['package', 'describe', '--type', 'json'], function (code, out, err) {
                try {
                    if (code == 0) {
                        return JSON.parse(out);
                    }
                } catch (e) {
                    return {
                        exception: e
                    };
                }
                return { error: err, text: out, code: code };
            });
        }
    }, {
        key: 'getPackage',
        value: function getPackage() {
            return this.run(['package', 'dump-package'], function (code, out, err) {
                try {
                    if (code == 0) {
                        return JSON.parse(out);
                    }
                } catch (e) {
                    return {
                        exception: e
                    };
                }
                return { error: err, text: out, code: code };
            });
        }
    }, {
        key: 'getVersion',
        value: function getVersion() {
            return this.run(['--version']);
        }
    }, {
        key: 'build',
        value: function build(target, stdout, stderr, useBuilder) {
            var args = useBuilder ? ['run', 'builder', 'build', target] : ['build', '--product', target];
            return this.start(args, stdout, stderr);
        }
    }, {
        key: 'test',
        value: function test(stdout, stderr, useBuilder) {
            var args = useBuilder ? ['run', 'builder', 'test'] : ['test'];
            return this.start(args, stdout, stderr);
        }
    }]);

    return Swift;
})(_runner2['default']);

exports['default'] = Swift;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL3N3aWZ0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQVFtQixVQUFVOzs7O0FBUjdCLFdBQVcsQ0FBQztJQVVTLEtBQUs7Y0FBTCxLQUFLOztBQUVYLGFBRk0sS0FBSyxDQUVWLEdBQUcsRUFBRTs4QkFGQSxLQUFLOztBQUdsQixZQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUM7QUFDOUQsbUNBSmEsS0FBSyw2Q0FJWixPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRTtLQUM1Qjs7aUJBTGdCLEtBQUs7O2VBT1IsMEJBQUc7QUFDYixtQkFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsVUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBSztBQUMzRSxvQkFBSTtBQUNBLHdCQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7QUFDWCwrQkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUMxQjtpQkFDSixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1IsMkJBQU87QUFDSCxpQ0FBUyxFQUFFLENBQUM7cUJBQ2YsQ0FBQTtpQkFDSjtBQUNELHVCQUFPLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQzthQUNoRCxDQUFDLENBQUM7U0FDTjs7O2VBRVMsc0JBQUc7QUFDVCxtQkFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxFQUFFLFVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUs7QUFDN0Qsb0JBQUk7QUFDQSx3QkFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO0FBQ1gsK0JBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0osQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNSLDJCQUFPO0FBQ0gsaUNBQVMsRUFBRSxDQUFDO3FCQUNmLENBQUE7aUJBQ0o7QUFDRCx1QkFBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7YUFDaEQsQ0FBQyxDQUFDO1NBQ047OztlQUVTLHNCQUFHO0FBQ1QsbUJBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDbEM7OztlQUVJLGVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFO0FBQ3RDLGdCQUFNLElBQUksR0FBRyxVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0YsbUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzNDOzs7ZUFFRyxjQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFO0FBQzdCLGdCQUFNLElBQUksR0FBRyxVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEUsbUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzNDOzs7V0FqRGdCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Ii9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL3N3aWZ0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIC09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LVxuLy8gQ3JlYXRlZCBieSBTYW0gRGVhbmUsIDI0LzA1LzIwMTguXG4vLyBBbGwgY29kZSAoYykgMjAxOCAtIHByZXNlbnQgZGF5LCBFbGVnYW50IENoYW9zIExpbWl0ZWQuXG4vLyBGb3IgbGljZW5zaW5nIHRlcm1zLCBzZWUgaHR0cDovL2VsZWdhbnRjaGFvcy5jb20vbGljZW5zZS9saWJlcmFsLy5cbi8vIC09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LVxuXG5pbXBvcnQgUnVubmVyIGZyb20gJy4vcnVubmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3dpZnQgZXh0ZW5kcyBSdW5uZXIge1xuXG4gICAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgICAgIGNvbnN0IGV4ZSA9IGF0b20uY29uZmlnLmdldCgnaWRlLXN3aWZ0LnN3aWZ0Jywge30pIHx8ICdzd2lmdCc7XG4gICAgICAgIHN1cGVyKFwic3dpZnRcIiwgZXhlLCBjd2QpO1xuICAgIH1cblxuICAgIGdldERlc2NyaXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW4oWydwYWNrYWdlJywgJ2Rlc2NyaWJlJywgJy0tdHlwZScsICdqc29uJ10sIChjb2RlLCBvdXQsIGVycikgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoY29kZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKG91dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBlcnIsIHRleHQ6IG91dCwgY29kZTogY29kZSB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRQYWNrYWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ydW4oWydwYWNrYWdlJywgJ2R1bXAtcGFja2FnZSddLCAoY29kZSwgb3V0LCBlcnIpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShvdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBlcnJvcjogZXJyLCB0ZXh0OiBvdXQsIGNvZGU6IGNvZGUgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0VmVyc2lvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucnVuKFsnLS12ZXJzaW9uJ10pO1xuICAgIH1cblxuICAgIGJ1aWxkKHRhcmdldCwgc3Rkb3V0LCBzdGRlcnIsIHVzZUJ1aWxkZXIpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHVzZUJ1aWxkZXIgPyBbJ3J1bicsICdidWlsZGVyJywgJ2J1aWxkJywgdGFyZ2V0XSA6IFsnYnVpbGQnLCAnLS1wcm9kdWN0JywgdGFyZ2V0XTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoYXJncywgc3Rkb3V0LCBzdGRlcnIpO1xuICAgIH1cblxuICAgIHRlc3Qoc3Rkb3V0LCBzdGRlcnIsIHVzZUJ1aWxkZXIpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHVzZUJ1aWxkZXIgPyBbJ3J1bicsICdidWlsZGVyJywgJ3Rlc3QnXSA6IFsndGVzdCddO1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydChhcmdzLCBzdGRvdXQsIHN0ZGVycik7XG4gICAgfVxuXG59XG4iXX0=