(function() {
  var StatusMessage;

  module.exports = StatusMessage = (function() {
    function StatusMessage(message) {
      this.statusBar = document.querySelector('status-bar');
      if (this.statusBar) {
        this.item = document.createElement('div');
        this.item.classList.add('inline-block');
        this.setText(message);
        this.tile = this.statusBar.addLeftTile({
          item: this.item
        });
      }
    }

    StatusMessage.prototype.remove = function() {
      var ref;
      return (ref = this.tile) != null ? ref.destroy() : void 0;
    };

    StatusMessage.prototype.setText = function(text) {
      if (this.statusBar) {
        return this.item.innerHTML = text;
      }
    };

    return StatusMessage;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3BhcmNlbC9saWIvc3RhdHVzLW1lc3NhZ2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtBO0FBQUEsTUFBQTs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0lBT1MsdUJBQUMsT0FBRDtNQUNYLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkI7TUFDYixJQUFHLElBQUMsQ0FBQSxTQUFKO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLGNBQXBCO1FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUI7VUFBRSxNQUFELElBQUMsQ0FBQSxJQUFGO1NBQXZCLEVBTFY7O0lBRlc7OzRCQVViLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTs0Q0FBSyxDQUFFLE9BQVAsQ0FBQTtJQURNOzs0QkFNUixPQUFBLEdBQVMsU0FBQyxJQUFEO01BQ1AsSUFBMEIsSUFBQyxDQUFBLFNBQTNCO2VBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCLEtBQWxCOztJQURPOzs7OztBQXhCWCIsInNvdXJjZXNDb250ZW50IjpbIiNcbiMgQ29weXJpZ2h0IChjKSAyMDE0IGJ5IExpZnRlZCBTdHVkaW9zLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuI1xuXG4jIFB1YmxpYzogRGlzcGxheXMgYSBtZXNzYWdlIGluIHRoZSBzdGF0dXMgYmFyLlxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzTWVzc2FnZVxuICAjIFB1YmxpYzogRGlzcGxheXMgYG1lc3NhZ2VgIGluIHRoZSBzdGF0dXMgYmFyLlxuICAjXG4gICMgSWYgdGhlIHN0YXR1cyBiYXIgZG9lcyBub3QgZXhpc3QgZm9yIHdoYXRldmVyIHJlYXNvbiwgbm8gbWVzc2FnZSBpcyBkaXNwbGF5ZWQgYW5kIG5vIGVycm9yXG4gICMgb2NjdXJzLlxuICAjXG4gICMgbWVzc2FnZSAtIEEge1N0cmluZ30gY29udGFpbmluZyB0aGUgbWVzc2FnZSB0byBkaXNwbGF5LlxuICBjb25zdHJ1Y3RvcjogKG1lc3NhZ2UpIC0+XG4gICAgQHN0YXR1c0JhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0YXR1cy1iYXInKVxuICAgIGlmIEBzdGF0dXNCYXJcbiAgICAgIEBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIEBpdGVtLmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycpXG4gICAgICBAc2V0VGV4dChtZXNzYWdlKVxuXG4gICAgICBAdGlsZSA9IEBzdGF0dXNCYXIuYWRkTGVmdFRpbGUoe0BpdGVtfSlcblxuICAjIFB1YmxpYzogUmVtb3ZlcyB0aGUgbWVzc2FnZSBmcm9tIHRoZSBzdGF0dXMgYmFyLlxuICByZW1vdmU6IC0+XG4gICAgQHRpbGU/LmRlc3Ryb3koKVxuXG4gICMgUHVibGljOiBVcGRhdGVzIHRoZSB0ZXh0IG9mIHRoZSBtZXNzYWdlLlxuICAjXG4gICMgdGV4dCAtIEEge1N0cmluZ30gY29udGFpbmluZyB0aGUgbmV3IG1lc3NhZ2UgdG8gZGlzcGxheS5cbiAgc2V0VGV4dDogKHRleHQpIC0+XG4gICAgQGl0ZW0uaW5uZXJIVE1MID0gdGV4dCBpZiBAc3RhdHVzQmFyXG4iXX0=
