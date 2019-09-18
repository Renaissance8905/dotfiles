Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Created by Sam Deane, 23/05/2018.
// All code (c) 2018 - present day, Elegant Chaos Limited.
// For licensing terms, see http://elegantchaos.com/license/liberal/.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var _atom = require('atom');

var _ideSwiftController = require('./ide-swift-controller');

var _ideSwiftController2 = _interopRequireDefault(_ideSwiftController);

var _ideSwiftAutocompleteProvider = require('./ide-swift-autocomplete-provider');

var _ideSwiftAutocompleteProvider2 = _interopRequireDefault(_ideSwiftAutocompleteProvider);

'use babel';exports['default'] = {
    controller: null,
    debugSerialization: false,

    /**
    Activate the plugin.
    We are passed the previously serialised state.
    */

    activate: function activate(serializedState) {
        if (this.debugSerialization) {
            console.log(serializedState);
        }

        var controller = this.controller = new _ideSwiftController2['default'](this);
        controller.activate(serializedState);
    },

    /**
    Deactivate the plugin and clean things up.
    */

    deactivate: function deactivate() {
        this.controller.deactivate();
    },

    /**
    Serialize the current state of the plugin.
    */

    serialize: function serialize() {
        var serializedState = this.controller.serialize();
        if (this.debugSerialization) {
            console.log(serializedState);
        }
        return serializedState;
    },

    /**
    Capture a reference to the toolbar.
    */

    consumeToolBar: function consumeToolBar(getToolBar) {
        var _this = this;

        var toolBar = getToolBar('ide-swift');
        this.controller.setupToolBar(toolBar);
        return new _atom.Disposable(function () {
            _this.controller.disposeToolbar();
        });
    },

    /**
    Capture a reference to the console.
    */

    consumeConsole: function consumeConsole(createConsole) {
        var _this2 = this;

        var console = createConsole({ id: 'ide-swift', name: 'Swift' });
        this.controller.setConsole(console);
        return new _atom.Disposable(function () {
            _this2.controller.disposeConsole();
        });
    },

    /**
    Capture a reference to the debugger.
    */

    consumeDebugger: function consumeDebugger(d) {
        var _this3 = this;

        this.controller.setDebugger(d._service);
        return new _atom.Disposable(function () {
            _this3.controller.disposeDebugger();
        });
    },

    /**
    Capture a reference to the linter.
    */

    consumeIndie: function consumeIndie(registerIndie) {
        var linter = registerIndie({ name: "Swift" });
        this.controller.setLinter(linter);
    },

    /**
    Capture a reference to the busy signal provider.
    */

    consumeBusySignal: function consumeBusySignal(service) {
        this.controller.setBusyService(service);
    },

    /**
    Auto-completion support.
    */

    getProvider: function getProvider() {
        // return a single provider, or an array of providers to use together
        return new _ideSwiftAutocompleteProvider2['default']();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL2lkZS1zd2lmdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBUTJCLE1BQU07O2tDQUNGLHdCQUF3Qjs7Ozs0Q0FDZCxtQ0FBbUM7Ozs7QUFWNUUsV0FBVyxDQUFDLHFCQVlHO0FBQ1gsY0FBVSxFQUFFLElBQUk7QUFDaEIsc0JBQWtCLEVBQUUsS0FBSzs7Ozs7OztBQU96QixZQUFRLEVBQUEsa0JBQUMsZUFBZSxFQUFFO0FBQ3RCLFlBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQUUsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7U0FBRTs7QUFFOUQsWUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxvQ0FBdUIsSUFBSSxDQUFDLENBQUM7QUFDbEUsa0JBQVUsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDeEM7Ozs7OztBQU9ELGNBQVUsRUFBQSxzQkFBRztBQUNULFlBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDaEM7Ozs7OztBQU1ELGFBQVMsRUFBQSxxQkFBRztBQUNSLFlBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEQsWUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7QUFBRSxtQkFBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUFFO0FBQzlELGVBQU8sZUFBZSxDQUFDO0tBQzFCOzs7Ozs7QUFNRCxrQkFBYyxFQUFBLHdCQUFDLFVBQVUsRUFBRTs7O0FBQ3ZCLFlBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4QyxZQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QyxlQUFPLHFCQUFlLFlBQU07QUFBRSxrQkFBSyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUE7U0FBRSxDQUFDLENBQUM7S0FDckU7Ozs7OztBQU1ELGtCQUFjLEVBQUEsd0JBQUMsYUFBYSxFQUFFOzs7QUFDMUIsWUFBSSxPQUFPLEdBQUcsYUFBYSxDQUFDLEVBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUM5RCxZQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQyxlQUFPLHFCQUFlLFlBQU07QUFBRSxtQkFBSyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUE7U0FBRSxDQUFDLENBQUM7S0FDckU7Ozs7OztBQU1ELG1CQUFlLEVBQUEseUJBQUMsQ0FBQyxFQUFFOzs7QUFDZixZQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEMsZUFBTyxxQkFBZSxZQUFNO0FBQUUsbUJBQUssVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFBO1NBQUUsQ0FBQyxDQUFDO0tBQ3RFOzs7Ozs7QUFNRCxnQkFBWSxFQUFBLHNCQUFDLGFBQWEsRUFBRTtBQUN4QixZQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUM1QyxZQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNyQzs7Ozs7O0FBTUQscUJBQWlCLEVBQUEsMkJBQUMsT0FBTyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzNDOzs7Ozs7QUFNRCxlQUFXLEVBQUEsdUJBQUc7O0FBRVYsZUFBTywrQ0FBa0MsQ0FBQztLQUM3QztDQUNKIiwiZmlsZSI6Ii9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL2lkZS1zd2lmdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cbi8vIENyZWF0ZWQgYnkgU2FtIERlYW5lLCAyMy8wNS8yMDE4LlxuLy8gQWxsIGNvZGUgKGMpIDIwMTggLSBwcmVzZW50IGRheSwgRWxlZ2FudCBDaGFvcyBMaW1pdGVkLlxuLy8gRm9yIGxpY2Vuc2luZyB0ZXJtcywgc2VlIGh0dHA6Ly9lbGVnYW50Y2hhb3MuY29tL2xpY2Vuc2UvbGliZXJhbC8uXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cblxuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IElkZVN3aWZ0Q29udHJvbGxlciBmcm9tICcuL2lkZS1zd2lmdC1jb250cm9sbGVyJztcbmltcG9ydCBJZGVTd2lmdEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gJy4vaWRlLXN3aWZ0LWF1dG9jb21wbGV0ZS1wcm92aWRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjb250cm9sbGVyOiBudWxsLFxuICAgIGRlYnVnU2VyaWFsaXphdGlvbjogZmFsc2UsXG5cbiAgICAvKipcbiAgICBBY3RpdmF0ZSB0aGUgcGx1Z2luLlxuICAgIFdlIGFyZSBwYXNzZWQgdGhlIHByZXZpb3VzbHkgc2VyaWFsaXNlZCBzdGF0ZS5cbiAgICAqL1xuXG4gICAgYWN0aXZhdGUoc2VyaWFsaXplZFN0YXRlKSB7XG4gICAgICAgIGlmICh0aGlzLmRlYnVnU2VyaWFsaXphdGlvbikgeyBjb25zb2xlLmxvZyhzZXJpYWxpemVkU3RhdGUpOyB9XG5cbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlciA9IG5ldyBJZGVTd2lmdENvbnRyb2xsZXIodGhpcyk7XG4gICAgICAgIGNvbnRyb2xsZXIuYWN0aXZhdGUoc2VyaWFsaXplZFN0YXRlKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICBEZWFjdGl2YXRlIHRoZSBwbHVnaW4gYW5kIGNsZWFuIHRoaW5ncyB1cC5cbiAgICAqL1xuXG4gICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLmRlYWN0aXZhdGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgU2VyaWFsaXplIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBwbHVnaW4uXG4gICAgKi9cblxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZFN0YXRlID0gdGhpcy5jb250cm9sbGVyLnNlcmlhbGl6ZSgpO1xuICAgICAgICBpZiAodGhpcy5kZWJ1Z1NlcmlhbGl6YXRpb24pIHsgY29uc29sZS5sb2coc2VyaWFsaXplZFN0YXRlKTsgfVxuICAgICAgICByZXR1cm4gc2VyaWFsaXplZFN0YXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICBDYXB0dXJlIGEgcmVmZXJlbmNlIHRvIHRoZSB0b29sYmFyLlxuICAgICovXG5cbiAgICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyKSB7XG4gICAgICAgIGNvbnN0IHRvb2xCYXIgPSBnZXRUb29sQmFyKCdpZGUtc3dpZnQnKTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnNldHVwVG9vbEJhcih0b29sQmFyKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5jb250cm9sbGVyLmRpc3Bvc2VUb29sYmFyKCkgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgIENhcHR1cmUgYSByZWZlcmVuY2UgdG8gdGhlIGNvbnNvbGUuXG4gICAgKi9cblxuICAgIGNvbnN1bWVDb25zb2xlKGNyZWF0ZUNvbnNvbGUpIHtcbiAgICAgICAgbGV0IGNvbnNvbGUgPSBjcmVhdGVDb25zb2xlKHtpZDogJ2lkZS1zd2lmdCcsIG5hbWU6ICdTd2lmdCd9KTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnNldENvbnNvbGUoY29uc29sZSk7XG4gICAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMuY29udHJvbGxlci5kaXNwb3NlQ29uc29sZSgpIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICBDYXB0dXJlIGEgcmVmZXJlbmNlIHRvIHRoZSBkZWJ1Z2dlci5cbiAgICAqL1xuXG4gICAgY29uc3VtZURlYnVnZ2VyKGQpIHtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyLnNldERlYnVnZ2VyKGQuX3NlcnZpY2UpO1xuICAgICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLmNvbnRyb2xsZXIuZGlzcG9zZURlYnVnZ2VyKCkgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgIENhcHR1cmUgYSByZWZlcmVuY2UgdG8gdGhlIGxpbnRlci5cbiAgICAqL1xuXG4gICAgY29uc3VtZUluZGllKHJlZ2lzdGVySW5kaWUpIHtcbiAgICAgICAgbGV0IGxpbnRlciA9IHJlZ2lzdGVySW5kaWUoe25hbWU6IFwiU3dpZnRcIn0pO1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc2V0TGludGVyKGxpbnRlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgIENhcHR1cmUgYSByZWZlcmVuY2UgdG8gdGhlIGJ1c3kgc2lnbmFsIHByb3ZpZGVyLlxuICAgICovXG5cbiAgICBjb25zdW1lQnVzeVNpZ25hbChzZXJ2aWNlKSB7XG4gICAgICAgIHRoaXMuY29udHJvbGxlci5zZXRCdXN5U2VydmljZShzZXJ2aWNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgQXV0by1jb21wbGV0aW9uIHN1cHBvcnQuXG4gICAgKi9cblxuICAgIGdldFByb3ZpZGVyKCkge1xuICAgICAgICAvLyByZXR1cm4gYSBzaW5nbGUgcHJvdmlkZXIsIG9yIGFuIGFycmF5IG9mIHByb3ZpZGVycyB0byB1c2UgdG9nZXRoZXJcbiAgICAgICAgcmV0dXJuIG5ldyBJZGVTd2lmdEF1dG9jb21wbGV0ZVByb3ZpZGVyKCk7XG4gICAgfVxufVxuIl19