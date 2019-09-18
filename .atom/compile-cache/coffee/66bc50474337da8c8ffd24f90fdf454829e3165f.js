(function() {
  var BufferedProcess, PackageList, PackageSync, StatusMessage, fs,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  BufferedProcess = require('atom').BufferedProcess;

  PackageList = require('./package-list');

  StatusMessage = require('./status-message');

  module.exports = PackageSync = (function() {
    function PackageSync() {}

    PackageSync.prototype.apmPath = atom.packages.getApmPath();

    PackageSync.prototype.currentInstall = null;

    PackageSync.prototype.packagesToInstall = [];

    PackageSync.prototype.currentUninstall = null;

    PackageSync.prototype.packagesToUninstall = [];

    PackageSync.prototype.shortMessageTimeout = 1000;

    PackageSync.prototype.longMessageTimeout = 15000;

    PackageSync.prototype.message = null;

    PackageSync.prototype.timeout = null;

    PackageSync.prototype.sync = function() {
      var missing, packageList, removed;
      packageList = new PackageList();
      if (packageList.getPackages().length > 0) {
        removed = this.getRemovedPackages();
        this.uninstallPackages(removed);
        missing = this.getMissingPackages();
        return this.installPackages(missing);
      } else {
        return this.writePackageList();
      }
    };

    PackageSync.prototype.writePackageList = function() {
      new PackageList().setPackages();
      return this.displayMessage('Package list written to packages.cson');
    };

    PackageSync.prototype.displayMessage = function(message, timeout) {
      console.log('Parcel: ' + message);
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
      if (this.message != null) {
        this.message.setText(message);
      } else {
        this.message = new StatusMessage(message);
      }
      if (timeout != null) {
        return this.setMessageTimeout(timeout);
      }
    };

    PackageSync.prototype.apmInstall = function(pkg) {
      var args, command, exit, stderr, stdout;
      this.displayMessage("Installing " + pkg);
      command = this.apmPath;
      args = ['install', pkg];
      stdout = function(output) {};
      stderr = function(output) {};
      exit = (function(_this) {
        return function(exitCode) {
          if (exitCode === 0) {
            if (_this.packagesToInstall.length > 0) {
              _this.displayMessage(pkg + " installed!", _this.shortMessageTimeout);
            } else {
              _this.displayMessage('Package installation complete!', _this.longMessageTimeout);
            }
          } else {
            _this.displayMessage("An error occurred installing " + pkg, _this.longMessageTimeout);
          }
          _this.currentInstall = null;
          return _this.installPackage();
        };
      })(this);
      return this.currentInstall = new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    };

    PackageSync.prototype.apmUninstall = function(pkg) {
      var args, command, exit, stderr, stdout;
      this.displayMessage("Uninstalling " + pkg);
      command = this.apmPath;
      args = ['uninstall', pkg];
      stdout = function(output) {};
      stderr = function(output) {};
      exit = (function(_this) {
        return function(exitCode) {
          if (exitCode === 0) {
            if (_this.packagesToUninstall.length > 0) {
              _this.displayMessage(pkg + " uninstalled!", _this.shortMessageTimeout);
            } else {
              _this.displayMessage('Package uninstallation complete!', _this.longMessageTimeout);
            }
          } else {
            _this.displayMessage("An error occurred uninstalling " + pkg, _this.longMessageTimeout);
          }
          _this.currentUninstall = null;
          return _this.uninstallPackage();
        };
      })(this);
      return this.currentUninstall = new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    };

    PackageSync.prototype.getMissingPackages = function() {
      var availablePackages, i, len, list, packageList, results, value;
      list = new PackageList();
      packageList = list.getPackages();
      availablePackages = atom.packages.getAvailablePackageNames();
      results = [];
      for (i = 0, len = packageList.length; i < len; i++) {
        value = packageList[i];
        if (indexOf.call(availablePackages, value) < 0) {
          results.push(value);
        }
      }
      return results;
    };

    PackageSync.prototype.installPackage = function() {
      if ((this.currentInstall != null) || this.packagesToInstall.length === 0) {
        return this.displayMessage('There are no additional packages to install from packages.cson.');
      } else {
        return this.apmInstall(this.packagesToInstall.shift());
      }
    };

    PackageSync.prototype.installPackages = function(packages) {
      var ref;
      (ref = this.packagesToInstall).push.apply(ref, packages);
      return this.installPackage();
    };

    PackageSync.prototype.getRemovedPackages = function() {
      var availablePackages, i, len, list, packageList, results, value;
      list = new PackageList();
      packageList = list.getPackages();
      availablePackages = atom.packages.getAvailablePackageNames();
      results = [];
      for (i = 0, len = availablePackages.length; i < len; i++) {
        value = availablePackages[i];
        if (indexOf.call(packageList, value) < 0) {
          results.push(value);
        }
      }
      return results;
    };

    PackageSync.prototype.uninstallPackage = function() {
      if ((this.currentUninstall != null) || this.packagesToUninstall.length === 0) {
        return this.displayMessage('There are no additional packages to uninstall from packages.cson.');
      } else {
        return this.apmUninstall(this.packagesToUninstall.shift());
      }
    };

    PackageSync.prototype.uninstallPackages = function(packages) {
      var ref;
      (ref = this.packagesToUninstall).push.apply(ref, packages);
      return this.uninstallPackage();
    };

    PackageSync.prototype.setMessageTimeout = function(timeout) {
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
      return this.timeout = setTimeout((function(_this) {
        return function() {
          _this.message.remove();
          return _this.message = null;
        };
      })(this), timeout);
    };

    return PackageSync;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3BhcmNlbC9saWIvcGFja2FnZS1zeW5jLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNERBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUosa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUVwQixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSOztFQU9oQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7MEJBRUosT0FBQSxHQUFTLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUFBOzswQkFHVCxjQUFBLEdBQWdCOzswQkFFaEIsaUJBQUEsR0FBbUI7OzBCQUVuQixnQkFBQSxHQUFrQjs7MEJBRWxCLG1CQUFBLEdBQXFCOzswQkFHckIsbUJBQUEsR0FBcUI7OzBCQUVyQixrQkFBQSxHQUFvQjs7MEJBRXBCLE9BQUEsR0FBUzs7MEJBRVQsT0FBQSxHQUFTOzswQkFLVCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxXQUFBLEdBQWMsSUFBSSxXQUFKLENBQUE7TUFDZCxJQUFHLFdBQVcsQ0FBQyxXQUFaLENBQUEsQ0FBeUIsQ0FBQyxNQUExQixHQUFtQyxDQUF0QztRQUVFLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtRQUNWLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixPQUFuQjtRQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtlQUNWLElBQUMsQ0FBQSxlQUFELENBQWlCLE9BQWpCLEVBTkY7T0FBQSxNQUFBO2VBUUUsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFSRjs7SUFGSTs7MEJBYU4sZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFJLFdBQUosQ0FBQSxDQUFpQixDQUFDLFdBQWxCLENBQUE7YUFD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QixJQUFDLENBQUEsbUJBQW1CLENBQUMsTUFBckIsS0FBK0IsQ0FBeEQ7ZUFDRSxJQUFDLENBQUEsY0FBRCxDQUFnQixtRUFBaEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxLQUFyQixDQUFBLENBQWQsRUFIRjs7SUFIZ0I7OzBCQVdsQixpQkFBQSxHQUFtQixTQUFDLFFBQUQ7QUFDakIsVUFBQTtNQUFBLE9BQUEsSUFBQyxDQUFBLG1CQUFELENBQW9CLENBQUMsSUFBckIsWUFBMEIsUUFBMUI7YUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBQTtJQUZpQjs7MEJBT25CLGlCQUFBLEdBQW1CLFNBQUMsT0FBRDtNQUNqQixJQUEwQixvQkFBMUI7UUFBQSxZQUFBLENBQWEsSUFBQyxDQUFBLE9BQWQsRUFBQTs7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQUQsR0FBVztRQUZTO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBR1QsT0FIUztJQUZNOzs7OztBQTNLckIiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xuXG57QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5cblBhY2thZ2VMaXN0ID0gcmVxdWlyZSAnLi9wYWNrYWdlLWxpc3QnXG5TdGF0dXNNZXNzYWdlID0gcmVxdWlyZSAnLi9zdGF0dXMtbWVzc2FnZSdcblxuIyBQdWJsaWM6IFBlcmZvcm1zIHRoZSBwYWNrYWdlIHN5bmNocm9uaXphdGlvbi5cbiNcbiMgIyMgRXZlbnRzXG4jXG4jIFRoaXMgY2xhc3MgaGFzIG5vIGV2ZW50cy5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBhY2thZ2VTeW5jXG4gICMgSW50ZXJuYWw6IFBhdGggdG8gYGFwbWAuXG4gIGFwbVBhdGg6IGF0b20ucGFja2FnZXMuZ2V0QXBtUGF0aCgpXG5cbiAgIyBJbnRlcm5hbDogUHJvY2VzcyBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgaW5zdGFsbC5cbiAgY3VycmVudEluc3RhbGw6IG51bGxcbiAgIyBJbnRlcm5hbDogUGFja2FnZXMgaW4gdGhlIHByb2Nlc3Mgb2YgYmVpbmcgaW5zdGFsbGVkLlxuICBwYWNrYWdlc1RvSW5zdGFsbDogW11cbiAgIyBJbnRlcm5hbDogUHJvY2VzcyBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgdW5pbnN0YWxsLlxuICBjdXJyZW50VW5pbnN0YWxsOiBudWxsXG4gICMgSW50ZXJuYWw6IFBhY2thZ2VzIGluIHRoZSBwcm9jZXNzIG9mIGJlaW5nIHVuaW5zdGFsbGVkLlxuICBwYWNrYWdlc1RvVW5pbnN0YWxsOiBbXVxuXG4gICMgSW50ZXJuYWw6IFRpbWVvdXQgZm9yIG1lc3NhZ2VzIHRoYXQgc2hvdWxkIGJlIHVwIGZvciBvbmx5IGEgc2hvcnQgdGltZS5cbiAgc2hvcnRNZXNzYWdlVGltZW91dDogMTAwMFxuICAjIEludGVybmFsOiBUaW1lb3V0IGZvciBtZXNzYWdlcyB0aGF0IHNob3VsZCBiZSB1cCBsb25nZXIuXG4gIGxvbmdNZXNzYWdlVGltZW91dDogMTUwMDBcbiAgIyBJbnRlcm5hbDogU3RhdHVzIGJhciBtZXNzYWdlLlxuICBtZXNzYWdlOiBudWxsXG4gICMgSW50ZXJuYWw6IFRpbWVvdXQgZm9yIHN0YXR1cyBiYXIgbWVzc2FnZS5cbiAgdGltZW91dDogbnVsbFxuXG4gICMgUHVibGljOiBVbmluc3RhbGxzIGFueSBwYWNrYWdlcyByZW1vdmVkIGZyb20gdGhlIGBwYWNrYWdlcy5jc29uYFxuICAjIGNvbmZpZ3VyYXRpb24gZmlsZSBhbmQgaW5zdGFsbHMgYW55IHBhY2thZ2VzIGluIHRoZSBgcGFja2FnZXMuY3NvbmBcbiAgIyBjb25maWd1cmF0aW9uIGZpbGUgdGhhdCBhcmUgbm90IGluc3RhbGxlZC5cbiAgc3luYzogLT5cbiAgICBwYWNrYWdlTGlzdCA9IG5ldyBQYWNrYWdlTGlzdCgpXG4gICAgaWYgcGFja2FnZUxpc3QuZ2V0UGFja2FnZXMoKS5sZW5ndGggPiAwXG4gICAgICAjIFVuaW5zdGFsbCBwYWNrYWdlcyByZW1vdmVkIGZyb20gYHBhY2thZ2VzLmNzb25gXG4gICAgICByZW1vdmVkID0gQGdldFJlbW92ZWRQYWNrYWdlcygpXG4gICAgICBAdW5pbnN0YWxsUGFja2FnZXMocmVtb3ZlZClcbiAgICAgICMgSW5zdGFsbCBwYWNrYWdlcyBpbiBgcGFja2FnZXMuY3NvbmAgdGhhdCBhcmUgbm90IGluc3RhbGxlZFxuICAgICAgbWlzc2luZyA9IEBnZXRNaXNzaW5nUGFja2FnZXMoKVxuICAgICAgQGluc3RhbGxQYWNrYWdlcyhtaXNzaW5nKVxuICAgIGVsc2VcbiAgICAgIEB3cml0ZVBhY2thZ2VMaXN0KClcblxuICAjIFB1YmxpYzogV3JpdGVzIHRoZSBjdXJyZW50IHBhY2thZ2UgbGlzdCB0byB0aGUgYHBhY2thZ2VzLmNzb25gIGNvbmZpZ3VyYXRpb24gZmlsZS5cbiAgd3JpdGVQYWNrYWdlTGlzdDogLT5cbiAgICBuZXcgUGFja2FnZUxpc3QoKS5zZXRQYWNrYWdlcygpXG4gICAgQGRpc3BsYXlNZXNzYWdlKCdQYWNrYWdlIGxpc3Qgd3JpdHRlbiB0byBwYWNrYWdlcy5jc29uJylcblxuICAjIEludGVybmFsOiBEaXNwbGF5cyBhIG1lc3NhZ2UgaW4gdGhlIHN0YXR1cyBiYXIuXG4gICNcbiAgIyBJZiBgdGltZW91dGAgaXMgc3BlY2lmaWVkLCB0aGUgbWVzc2FnZSB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgY2xlYXJlZCBpbiBgdGltZW91dGAgbWlsbGlzZWNvbmRzLlxuICAjXG4gICMgbWVzc2FnZSAtIEEge1N0cmluZ30gY29udGFpbmluZyB0aGUgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQuXG4gICMgdGltZW91dCAtIEFuIG9wdGlvbmFsIHtOdW1iZXJ9IHNwZWNpZnlpbmcgdGhlIHRpbWUgaW4gbWlsbGlzZWNvbmRzIHVudGlsIHRoZSBtZXNzYWdlIHdpbGwgYmVcbiAgIyAgICAgICAgICAgY2xlYXJlZC5cbiAgZGlzcGxheU1lc3NhZ2U6IChtZXNzYWdlLCB0aW1lb3V0KSAtPlxuICAgIGNvbnNvbGUubG9nKCdQYXJjZWw6ICcgKyBtZXNzYWdlKVxuICAgIGNsZWFyVGltZW91dChAdGltZW91dCkgaWYgQHRpbWVvdXQ/XG4gICAgaWYgQG1lc3NhZ2U/XG4gICAgICBAbWVzc2FnZS5zZXRUZXh0KG1lc3NhZ2UpXG4gICAgZWxzZVxuICAgICAgQG1lc3NhZ2UgPSBuZXcgU3RhdHVzTWVzc2FnZShtZXNzYWdlKVxuXG4gICAgQHNldE1lc3NhZ2VUaW1lb3V0KHRpbWVvdXQpIGlmIHRpbWVvdXQ/XG5cbiAgIyBJbnRlcm5hbDogRXhlY3V0ZSBBUE0gdG8gaW5zdGFsbCB0aGUgZ2l2ZW4gcGFja2FnZS5cbiAgI1xuICAjIHBrZyAtIEEge1N0cmluZ30gY29udGFpbmluZyB0aGUgbmFtZSBvZiB0aGUgcGFja2FnZSB0byBpbnN0YWxsLlxuICBhcG1JbnN0YWxsOiAocGtnKSAtPlxuICAgIEBkaXNwbGF5TWVzc2FnZShcIkluc3RhbGxpbmcgI3twa2d9XCIpXG4gICAgY29tbWFuZCA9IEBhcG1QYXRoXG4gICAgYXJncyA9IFsnaW5zdGFsbCcsIHBrZ11cbiAgICBzdGRvdXQgPSAob3V0cHV0KSAtPlxuICAgIHN0ZGVyciA9IChvdXRwdXQpIC0+XG4gICAgZXhpdCA9IChleGl0Q29kZSkgPT5cbiAgICAgIGlmIGV4aXRDb2RlIGlzIDBcbiAgICAgICAgaWYgQHBhY2thZ2VzVG9JbnN0YWxsLmxlbmd0aCA+IDBcbiAgICAgICAgICBAZGlzcGxheU1lc3NhZ2UoXCIje3BrZ30gaW5zdGFsbGVkIVwiLCBAc2hvcnRNZXNzYWdlVGltZW91dClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkaXNwbGF5TWVzc2FnZSgnUGFja2FnZSBpbnN0YWxsYXRpb24gY29tcGxldGUhJywgQGxvbmdNZXNzYWdlVGltZW91dClcbiAgICAgIGVsc2VcbiAgICAgICAgQGRpc3BsYXlNZXNzYWdlKFwiQW4gZXJyb3Igb2NjdXJyZWQgaW5zdGFsbGluZyAje3BrZ31cIiwgQGxvbmdNZXNzYWdlVGltZW91dClcblxuICAgICAgQGN1cnJlbnRJbnN0YWxsID0gbnVsbFxuICAgICAgQGluc3RhbGxQYWNrYWdlKClcblxuICAgIEBjdXJyZW50SW5zdGFsbCA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcblxuICAjIEludGVybmFsOiBFeGVjdXRlIEFQTSB0byB1bmluc3RhbGwgdGhlIGdpdmVuIHBhY2thZ2UuXG4gICNcbiAgIyBwa2cgLSBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgdGhlIHBhY2thZ2UgdG8gdW5pbnN0YWxsLlxuICBhcG1Vbmluc3RhbGw6IChwa2cpIC0+XG4gICAgQGRpc3BsYXlNZXNzYWdlKFwiVW5pbnN0YWxsaW5nICN7cGtnfVwiKVxuICAgIGNvbW1hbmQgPSBAYXBtUGF0aFxuICAgIGFyZ3MgPSBbJ3VuaW5zdGFsbCcsIHBrZ11cbiAgICBzdGRvdXQgPSAob3V0cHV0KSAtPlxuICAgIHN0ZGVyciA9IChvdXRwdXQpIC0+XG4gICAgZXhpdCA9IChleGl0Q29kZSkgPT5cbiAgICAgIGlmIGV4aXRDb2RlIGlzIDBcbiAgICAgICAgaWYgQHBhY2thZ2VzVG9Vbmluc3RhbGwubGVuZ3RoID4gMFxuICAgICAgICAgIEBkaXNwbGF5TWVzc2FnZShcIiN7cGtnfSB1bmluc3RhbGxlZCFcIiwgQHNob3J0TWVzc2FnZVRpbWVvdXQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlzcGxheU1lc3NhZ2UoJ1BhY2thZ2UgdW5pbnN0YWxsYXRpb24gY29tcGxldGUhJywgQGxvbmdNZXNzYWdlVGltZW91dClcbiAgICAgIGVsc2VcbiAgICAgICAgQGRpc3BsYXlNZXNzYWdlKFwiQW4gZXJyb3Igb2NjdXJyZWQgdW5pbnN0YWxsaW5nICN7cGtnfVwiLCBAbG9uZ01lc3NhZ2VUaW1lb3V0KVxuXG4gICAgICBAY3VycmVudFVuaW5zdGFsbCA9IG51bGxcbiAgICAgIEB1bmluc3RhbGxQYWNrYWdlKClcblxuICAgIEBjdXJyZW50VW5pbnN0YWxsID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuXG4gICMgSW50ZXJuYWw6IEdldHMgdGhlIGxpc3Qgb2YgcGFja2FnZXMgdGhhdCBhcmUgbWlzc2luZy5cbiAgI1xuICAjIFJldHVybnMgYW4ge0FycmF5fSBvZiBuYW1lcyBvZiBwYWNrYWdlcyB0aGF0IG5lZWQgdG8gYmUgaW5zdGFsbGVkLlxuICBnZXRNaXNzaW5nUGFja2FnZXM6IC0+XG4gICAgbGlzdCA9IG5ldyBQYWNrYWdlTGlzdCgpXG4gICAgcGFja2FnZUxpc3QgPSBsaXN0LmdldFBhY2thZ2VzKClcbiAgICBhdmFpbGFibGVQYWNrYWdlcyA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKClcbiAgICB2YWx1ZSBmb3IgdmFsdWUgaW4gcGFja2FnZUxpc3Qgd2hlbiB2YWx1ZSBub3QgaW4gYXZhaWxhYmxlUGFja2FnZXNcblxuICAjIEludGVybmFsOiBJbnN0YWxscyB0aGUgbmV4dCBwYWNrYWdlIGluIHRoZSBsaXN0LlxuICBpbnN0YWxsUGFja2FnZTogLT5cbiAgICAjIEV4aXQgaWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbnN0YWxsYXRpb24gcnVubmluZyBvciBpZiB0aGVyZSBhcmUgbm8gbW9yZVxuICAgICMgcGFja2FnZXMgdG8gaW5zdGFsbC5cbiAgICBpZiBAY3VycmVudEluc3RhbGw/IG9yIEBwYWNrYWdlc1RvSW5zdGFsbC5sZW5ndGggaXMgMFxuICAgICAgQGRpc3BsYXlNZXNzYWdlKCdUaGVyZSBhcmUgbm8gYWRkaXRpb25hbCBwYWNrYWdlcyB0byBpbnN0YWxsIGZyb20gcGFja2FnZXMuY3Nvbi4nKVxuICAgIGVsc2VcbiAgICAgIEBhcG1JbnN0YWxsKEBwYWNrYWdlc1RvSW5zdGFsbC5zaGlmdCgpKVxuXG4gICMgSW50ZXJuYWw6IEluc3RhbGxzIGVhY2ggb2YgdGhlIHBhY2thZ2VzIGluIHRoZSBnaXZlbiBsaXN0LlxuICAjXG4gICMgcGFja2FnZXMgLSBBbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIG5hbWVzIG9mIHBhY2thZ2VzIHRvIGluc3RhbGwuXG4gIGluc3RhbGxQYWNrYWdlczogKHBhY2thZ2VzKSAtPlxuICAgIEBwYWNrYWdlc1RvSW5zdGFsbC5wdXNoKHBhY2thZ2VzLi4uKVxuICAgIEBpbnN0YWxsUGFja2FnZSgpXG5cbiAgIyBJbnRlcm5hbDogR2V0cyB0aGUgbGlzdCBvZiBwYWNrYWdlcyB0aGF0IHdlcmUgcmVtb3ZlZC5cbiAgI1xuICAjIFJldHVybnMgYW4ge0FycmF5fSBvZiBuYW1lcyBvZiBwYWNrYWdlcyB0aGF0IG5lZWQgdG8gYmUgdW5pbnN0YWxsZWQuXG4gIGdldFJlbW92ZWRQYWNrYWdlczogLT5cbiAgICBsaXN0ID0gbmV3IFBhY2thZ2VMaXN0KClcbiAgICBwYWNrYWdlTGlzdCA9IGxpc3QuZ2V0UGFja2FnZXMoKVxuICAgIGF2YWlsYWJsZVBhY2thZ2VzID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKVxuICAgIHZhbHVlIGZvciB2YWx1ZSBpbiBhdmFpbGFibGVQYWNrYWdlcyB3aGVuIHZhbHVlIG5vdCBpbiBwYWNrYWdlTGlzdFxuXG4gICMgSW50ZXJuYWw6IFVuaW5zdGFsbHMgdGhlIG5leHQgcGFja2FnZSBpbiB0aGUgbGlzdC5cbiAgdW5pbnN0YWxsUGFja2FnZTogLT5cbiAgICAjIEV4aXQgaWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBpbnN0YWxsYXRpb24gcnVubmluZyBvciBpZiB0aGVyZSBhcmUgbm8gbW9yZVxuICAgICMgcGFja2FnZXMgdG8gdW5pbnN0YWxsLlxuICAgIGlmIEBjdXJyZW50VW5pbnN0YWxsPyBvciBAcGFja2FnZXNUb1VuaW5zdGFsbC5sZW5ndGggaXMgMFxuICAgICAgQGRpc3BsYXlNZXNzYWdlKCdUaGVyZSBhcmUgbm8gYWRkaXRpb25hbCBwYWNrYWdlcyB0byB1bmluc3RhbGwgZnJvbSBwYWNrYWdlcy5jc29uLicpXG4gICAgZWxzZVxuICAgICAgQGFwbVVuaW5zdGFsbChAcGFja2FnZXNUb1VuaW5zdGFsbC5zaGlmdCgpKVxuXG4gICMgSW50ZXJuYWw6IFVuaW5zdGFsbHMgZWFjaCBvZiB0aGUgcGFja2FnZXMgaW4gdGhlIGdpdmVuIGxpc3QuXG4gICNcbiAgIyBwYWNrYWdlcyAtIEFuIHtBcnJheX0gY29udGFpbmluZyB0aGUgbmFtZXMgb2YgcGFja2FnZXMgdG8gdW5pbnN0YWxsLlxuICB1bmluc3RhbGxQYWNrYWdlczogKHBhY2thZ2VzKSAtPlxuICAgIEBwYWNrYWdlc1RvVW5pbnN0YWxsLnB1c2gocGFja2FnZXMuLi4pXG4gICAgQHVuaW5zdGFsbFBhY2thZ2UoKVxuXG4gICMgSW50ZXJuYWw6IFNldHMgYSB0aW1lb3V0IHRvIHJlbW92ZSB0aGUgc3RhdHVzIGJhciBtZXNzYWdlLlxuICAjXG4gICMgdGltZW91dCAtIFRoZSB7TnVtYmVyfSBvZiBtaWxsaXNlY29uZHMgdW50aWwgdGhlIG1lc3NhZ2Ugc2hvdWxkIGJlIHJlbW92ZWQuXG4gIHNldE1lc3NhZ2VUaW1lb3V0OiAodGltZW91dCkgLT5cbiAgICBjbGVhclRpbWVvdXQoQHRpbWVvdXQpIGlmIEB0aW1lb3V0P1xuICAgIEB0aW1lb3V0ID0gc2V0VGltZW91dCg9PlxuICAgICAgQG1lc3NhZ2UucmVtb3ZlKClcbiAgICAgIEBtZXNzYWdlID0gbnVsbFxuICAgICwgdGltZW91dClcbiJdfQ==
