Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Created by Sam Deane, 29/05/2018.
// All code (c) 2018 - present day, Elegant Chaos Limited.
// For licensing terms, see http://elegantchaos.com/license/liberal/.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

'use babel';

function createElementForItem(item) {
    var element = document.createElement('li');
    element.style.height = '12px';
    element.className = 'item';
    element.textContent = item.name || item;
    return element;
}

var TargetsView = (function () {
    function TargetsView(controller) {
        var _this = this;

        _classCallCheck(this, TargetsView);

        var targets = controller.targets().all;
        var items = targets ? targets : [];
        var select = new _atomSelectList2['default']({
            items: items,
            elementForItem: function elementForItem(item) {
                var element = document.createElement('li');
                element.style.height = '10px';
                element.className = 'item';
                element.textContent = item.name;
                return element;
            },
            emptyMessage: "(no targets found)",
            infoMessage: "Select a target:\n",
            didConfirmSelection: function didConfirmSelection(item) {
                _this.select(item);
            },
            didCancelSelection: function didCancelSelection() {
                _this.cancel();
            }
        });

        this._controller = controller;
        this._select = select;
        this._items = items;
        this._modal = atom.workspace.addModalPanel({
            item: select,
            visible: true
        });
        select.focus();
    }

    _createClass(TargetsView, [{
        key: 'select',
        value: function select(item) {
            var controller = this._controller;
            if (controller.setTarget(item)) {
                controller.doWithView(function (view) {
                    view.addOutput('Changed target to ' + item.name + '.');
                });
            }
            this.cancel();
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            this._modal.destroy();
        }

        // Returns an object that can be retrieved when package is activated
    }, {
        key: 'serialize',
        value: function serialize() {}

        // Tear down any state and detach
    }, {
        key: 'destroy',
        value: function destroy() {
            this.element.remove();
        }
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.element;
        }
    }]);

    return TargetsView;
})();

exports['default'] = TargetsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL3RhcmdldHMtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OzhCQVEyQixrQkFBa0I7Ozs7QUFSN0MsV0FBVyxDQUFDOztBQVVaLFNBQVMsb0JBQW9CLENBQUUsSUFBSSxFQUFFO0FBQ25DLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUMsV0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQzdCLFdBQU8sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFBO0FBQzFCLFdBQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUE7QUFDdkMsV0FBTyxPQUFPLENBQUE7Q0FDZjs7SUFFb0IsV0FBVztBQUVuQixhQUZRLFdBQVcsQ0FFbEIsVUFBVSxFQUFFOzs7OEJBRkwsV0FBVzs7QUFHMUIsWUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUN6QyxZQUFNLEtBQUssR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNyQyxZQUFNLE1BQU0sR0FBRyxnQ0FBbUI7QUFDOUIsaUJBQUssRUFBRSxLQUFLO0FBQ1osMEJBQWMsRUFBRSx3QkFBQyxJQUFJLEVBQUs7QUFDdEIsb0JBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUMsdUJBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUM5Qix1QkFBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFDM0IsdUJBQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNoQyx1QkFBTyxPQUFPLENBQUE7YUFDakI7QUFDRCx3QkFBWSxFQUFFLG9CQUFvQjtBQUNsQyx1QkFBVyxFQUFFLG9CQUFvQjtBQUNqQywrQkFBbUIsRUFBRSw2QkFBQyxJQUFJLEVBQUs7QUFBRSxzQkFBSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFBRTtBQUNyRCw4QkFBa0IsRUFBRSw4QkFBTTtBQUFFLHNCQUFLLE1BQU0sRUFBRSxDQUFDO2FBQUU7U0FDL0MsQ0FBQyxDQUFDOztBQUVILFlBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDdkMsZ0JBQUksRUFBRSxNQUFNO0FBQ1osbUJBQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztBQUNILGNBQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNsQjs7aUJBNUJrQixXQUFXOztlQThCeEIsZ0JBQUMsSUFBSSxFQUFFO0FBQ1QsZ0JBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDcEMsZ0JBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM1QiwwQkFBVSxDQUFDLFVBQVUsQ0FBRSxVQUFBLElBQUksRUFBSTtBQUM3Qix3QkFBSSxDQUFDLFNBQVMsd0JBQXNCLElBQUksQ0FBQyxJQUFJLE9BQUksQ0FBQztpQkFDbkQsQ0FBQyxDQUFDO2FBQ047QUFDRCxnQkFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCOzs7ZUFFSyxrQkFBRztBQUNMLGdCQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3pCOzs7OztlQUdRLHFCQUFHLEVBQUU7Ozs7O2VBR1AsbUJBQUc7QUFDUixnQkFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUN2Qjs7O2VBRVMsc0JBQUc7QUFDWCxtQkFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3JCOzs7V0F0RGtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL3RhcmdldHMtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cbi8vIENyZWF0ZWQgYnkgU2FtIERlYW5lLCAyOS8wNS8yMDE4LlxuLy8gQWxsIGNvZGUgKGMpIDIwMTggLSBwcmVzZW50IGRheSwgRWxlZ2FudCBDaGFvcyBMaW1pdGVkLlxuLy8gRm9yIGxpY2Vuc2luZyB0ZXJtcywgc2VlIGh0dHA6Ly9lbGVnYW50Y2hhb3MuY29tL2xpY2Vuc2UvbGliZXJhbC8uXG4vLyAtPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS09LT0tPS1cblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gJ2F0b20tc2VsZWN0LWxpc3QnO1xuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50Rm9ySXRlbSAoaXRlbSkge1xuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICBlbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMnB4J1xuICBlbGVtZW50LmNsYXNzTmFtZSA9ICdpdGVtJ1xuICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lIHx8IGl0ZW1cbiAgcmV0dXJuIGVsZW1lbnRcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFyZ2V0c1ZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnN0IHRhcmdldHMgPSBjb250cm9sbGVyLnRhcmdldHMoKS5hbGw7XG4gICAgICBjb25zdCBpdGVtcyA9IHRhcmdldHMgPyB0YXJnZXRzIDogW107XG4gICAgICBjb25zdCBzZWxlY3QgPSBuZXcgU2VsZWN0TGlzdFZpZXcoe1xuICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTBweCc7XG4gICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gJ2l0ZW0nO1xuICAgICAgICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xuICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZW1wdHlNZXNzYWdlOiBcIihubyB0YXJnZXRzIGZvdW5kKVwiLFxuICAgICAgICAgIGluZm9NZXNzYWdlOiBcIlNlbGVjdCBhIHRhcmdldDpcXG5cIixcbiAgICAgICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbSkgPT4geyB0aGlzLnNlbGVjdChpdGVtKTsgfSxcbiAgICAgICAgICBkaWRDYW5jZWxTZWxlY3Rpb246ICgpID0+IHsgdGhpcy5jYW5jZWwoKTsgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX2NvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgdGhpcy5fc2VsZWN0ID0gc2VsZWN0O1xuICAgICAgdGhpcy5faXRlbXMgPSBpdGVtcztcbiAgICAgIHRoaXMuX21vZGFsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICAgICAgaXRlbTogc2VsZWN0LFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gIH1cblxuICBzZWxlY3QoaXRlbSkge1xuICAgICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuX2NvbnRyb2xsZXI7XG4gICAgICBpZiAoY29udHJvbGxlci5zZXRUYXJnZXQoaXRlbSkpIHtcbiAgICAgICAgICBjb250cm9sbGVyLmRvV2l0aFZpZXcoIHZpZXcgPT4ge1xuICAgICAgICAgICAgdmlldy5hZGRPdXRwdXQoYENoYW5nZWQgdGFyZ2V0IHRvICR7aXRlbS5uYW1lfS5gKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgICB0aGlzLl9tb2RhbC5kZXN0cm95KCk7XG4gIH1cblxuICAvLyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBzZXJpYWxpemUoKSB7fVxuXG4gIC8vIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxuXG4gIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgfVxuXG59XG4iXX0=