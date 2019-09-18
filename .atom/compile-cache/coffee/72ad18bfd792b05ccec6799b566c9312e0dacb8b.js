(function() {
  var CSON, PackageList, fs, path;

  CSON = require('season');

  fs = require('fs');

  path = require('path');

  module.exports = PackageList = (function() {
    function PackageList() {}

    PackageList.prototype.getPackages = function() {
      var obj;
      if (fs.existsSync(PackageList.getPackageListPath())) {
        obj = CSON.readFileSync(PackageList.getPackageListPath());
        return obj['packages'];
      } else {
        return [];
      }
    };

    PackageList.prototype.setPackages = function() {
      if (fs.existsSync(PackageList.getPackageListPath())) {
        fs.unlinkSync(PackageList.getPackageListPath());
      }
      return CSON.writeFileSync(PackageList.getPackageListPath(), {
        'packages': atom.packages.getAvailablePackageNames()
      });
    };

    PackageList.getPackageListPath = function() {
      return this.packageListPath != null ? this.packageListPath : this.packageListPath = path.join(atom.getConfigDirPath(), 'packages.cson');
    };

    return PackageList;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3BhcmNlbC9saWIvcGFja2FnZS1saXN0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBT1AsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzBCQUlKLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxXQUFXLENBQUMsa0JBQVosQ0FBQSxDQUFkLENBQUg7UUFDRSxHQUFBLEdBQU0sSUFBSSxDQUFDLFlBQUwsQ0FBa0IsV0FBVyxDQUFDLGtCQUFaLENBQUEsQ0FBbEI7ZUFDTixHQUFJLENBQUEsVUFBQSxFQUZOO09BQUEsTUFBQTtlQUlFLEdBSkY7O0lBRFc7OzBCQVFiLFdBQUEsR0FBYSxTQUFBO01BQ1gsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLFdBQVcsQ0FBQyxrQkFBWixDQUFBLENBQWQsQ0FBSDtRQUNFLEVBQUUsQ0FBQyxVQUFILENBQWMsV0FBVyxDQUFDLGtCQUFaLENBQUEsQ0FBZCxFQURGOzthQUVBLElBQUksQ0FBQyxhQUFMLENBQW1CLFdBQVcsQ0FBQyxrQkFBWixDQUFBLENBQW5CLEVBQ21CO1FBQUMsVUFBQSxFQUFZLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQWQsQ0FBQSxDQUFiO09BRG5CO0lBSFc7O0lBU2IsV0FBQyxDQUFBLGtCQUFELEdBQXFCLFNBQUE7NENBQ25CLElBQUMsQ0FBQSxrQkFBRCxJQUFDLENBQUEsa0JBQW1CLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFtQyxlQUFuQztJQUREOzs7OztBQS9CdkIiLCJzb3VyY2VzQ29udGVudCI6WyJDU09OID0gcmVxdWlyZSAnc2Vhc29uJ1xuZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG4jIFB1YmxpYzogUmVwcmVzZW50cyB0aGUgbGlzdCBvZiBwYWNrYWdlcyB0aGF0IHRoZSB1c2VyIHdhbnRzIHN5bmNocm9uaXplZC5cbiNcbiMgIyMgRXZlbnRzXG4jXG4jIFRoaXMgY2xhc3MgaGFzIG5vIGV2ZW50cy5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhY2thZ2VMaXN0XG4gICMgUHVibGljOiBHZXRzIHRoZSBsaXN0IG9mIHBhY2thZ2VzIHRoYXQgdGhlIHVzZXIgd2FudHMgc3luY2hyb25pemVkLlxuICAjXG4gICMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHBhY2thZ2UgbmFtZXMuXG4gIGdldFBhY2thZ2VzOiAtPlxuICAgIGlmIGZzLmV4aXN0c1N5bmMoUGFja2FnZUxpc3QuZ2V0UGFja2FnZUxpc3RQYXRoKCkpXG4gICAgICBvYmogPSBDU09OLnJlYWRGaWxlU3luYyhQYWNrYWdlTGlzdC5nZXRQYWNrYWdlTGlzdFBhdGgoKSlcbiAgICAgIG9ialsncGFja2FnZXMnXVxuICAgIGVsc2VcbiAgICAgIFtdXG5cbiAgIyBQdWJsaWM6IFNldHMgdGhlIGxpc3Qgb2YgcGFja2FnZXMgdG8gdGhlIGxpc3Qgb2YgYXZhaWxhYmxlIHBhY2thZ2VzLlxuICBzZXRQYWNrYWdlczogLT5cbiAgICBpZiBmcy5leGlzdHNTeW5jKFBhY2thZ2VMaXN0LmdldFBhY2thZ2VMaXN0UGF0aCgpKVxuICAgICAgZnMudW5saW5rU3luYyhQYWNrYWdlTGlzdC5nZXRQYWNrYWdlTGlzdFBhdGgoKSlcbiAgICBDU09OLndyaXRlRmlsZVN5bmMoUGFja2FnZUxpc3QuZ2V0UGFja2FnZUxpc3RQYXRoKCksXG4gICAgICAgICAgICAgICAgICAgICAgIHsncGFja2FnZXMnOiBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpfSlcblxuICAjIEludGVybmFsOiBHZXRzIHRoZSBwYXRoIHRvIHRoZSBwYWNrYWdlIGxpc3QuXG4gICNcbiAgIyBSZXR1cm5zIGEge1N0cmluZ30gY29udGFpbmluZyB0aGUgcGF0aCB0byB0aGUgbGlzdCBvZiBhdmFpbGFibGUgcGFja2FnZXMuXG4gIEBnZXRQYWNrYWdlTGlzdFBhdGg6IC0+XG4gICAgQHBhY2thZ2VMaXN0UGF0aCA/PSBwYXRoLmpvaW4oYXRvbS5nZXRDb25maWdEaXJQYXRoKCksICdwYWNrYWdlcy5jc29uJylcbiJdfQ==
