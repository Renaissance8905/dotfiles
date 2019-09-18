(function() {
  var PackageSync, loadModule, packageSync, sync, writePackageList;

  PackageSync = null;

  packageSync = null;

  loadModule = function() {
    if (PackageSync == null) {
      PackageSync = require('./package-sync');
    }
    return packageSync != null ? packageSync : packageSync = new PackageSync();
  };

  sync = function() {
    loadModule();
    return packageSync.sync();
  };

  writePackageList = function() {
    loadModule();
    return packageSync.writePackageList();
  };

  module.exports = {
    activate: function() {
      atom.commands.add('atom-workspace', 'parcel:sync', function() {
        return sync();
      });
      return sync();
    },
    deactivate: function() {
      return writePackageList();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3BhcmNlbC9saWIvcGFyY2VsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjOztFQUNkLFdBQUEsR0FBYzs7RUFFZCxVQUFBLEdBQWEsU0FBQTs7TUFDWCxjQUFlLE9BQUEsQ0FBUSxnQkFBUjs7aUNBQ2YsY0FBQSxjQUFlLElBQUksV0FBSixDQUFBO0VBRko7O0VBSWIsSUFBQSxHQUFPLFNBQUE7SUFDTCxVQUFBLENBQUE7V0FDQSxXQUFXLENBQUMsSUFBWixDQUFBO0VBRks7O0VBSVAsZ0JBQUEsR0FBbUIsU0FBQTtJQUNqQixVQUFBLENBQUE7V0FDQSxXQUFXLENBQUMsZ0JBQVosQ0FBQTtFQUZpQjs7RUFJbkIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFBO01BRVIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxhQUFwQyxFQUFtRCxTQUFBO2VBQ2pELElBQUEsQ0FBQTtNQURpRCxDQUFuRDthQUdBLElBQUEsQ0FBQTtJQUxRLENBQVY7SUFNQSxVQUFBLEVBQVksU0FBQTthQUNWLGdCQUFBLENBQUE7SUFEVSxDQU5aOztBQWhCRiIsInNvdXJjZXNDb250ZW50IjpbIlBhY2thZ2VTeW5jID0gbnVsbFxucGFja2FnZVN5bmMgPSBudWxsXG5cbmxvYWRNb2R1bGUgPSAtPlxuICBQYWNrYWdlU3luYyA/PSByZXF1aXJlICcuL3BhY2thZ2Utc3luYydcbiAgcGFja2FnZVN5bmMgPz0gbmV3IFBhY2thZ2VTeW5jKClcblxuc3luYyA9IC0+XG4gIGxvYWRNb2R1bGUoKVxuICBwYWNrYWdlU3luYy5zeW5jKClcblxud3JpdGVQYWNrYWdlTGlzdCA9IC0+XG4gIGxvYWRNb2R1bGUoKVxuICBwYWNrYWdlU3luYy53cml0ZVBhY2thZ2VMaXN0KClcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogLT5cbiAgICAjIFJlZ2lzdGVyIHBhcmNlbDpzeW5jIGNvbW1hbmQgdG8gcnVuIHN5bmMoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdwYXJjZWw6c3luYycsIC0+XG4gICAgICBzeW5jKClcbiAgICAjIEF1dG9tYXRpY2FsbHkgcnVuIHN5bmMoKSB3aGVuIGFjdGl2YXRlZFxuICAgIHN5bmMoKVxuICBkZWFjdGl2YXRlOiAtPlxuICAgIHdyaXRlUGFja2FnZUxpc3QoKVxuIl19
