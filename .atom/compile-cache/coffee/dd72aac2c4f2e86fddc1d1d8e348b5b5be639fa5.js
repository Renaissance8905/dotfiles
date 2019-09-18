(function() {
  var PlantumlPreviewView, addPreviewForEditor, fs, isPlantumlPreviewView, removePreviewForEditor, toggle, uriForEditor, url;

  fs = null;

  url = require('url');

  PlantumlPreviewView = null;

  uriForEditor = function(editor) {
    return "plantuml-preview://editor/" + editor.id;
  };

  isPlantumlPreviewView = function(object) {
    if (PlantumlPreviewView == null) {
      PlantumlPreviewView = require('./plantuml-preview-view');
    }
    return object instanceof PlantumlPreviewView;
  };

  removePreviewForEditor = function(editor) {
    var previewPane, uri;
    uri = uriForEditor(editor);
    previewPane = atom.workspace.paneForURI(uri);
    if (previewPane != null) {
      previewPane.destroyItem(previewPane.itemForURI(uri));
      return true;
    } else {
      return false;
    }
  };

  addPreviewForEditor = function(editor) {
    var options, previousActivePane, uri;
    if (fs == null) {
      fs = require('fs-plus');
    }
    uri = uriForEditor(editor);
    previousActivePane = atom.workspace.getActivePane();
    if (editor && fs.isFileSync(editor.getPath())) {
      options = {
        searchAllPanes: true,
        split: 'right'
      };
      return atom.workspace.open(uri, options).then(function(plantumlPreviewView) {
        if (isPlantumlPreviewView(plantumlPreviewView)) {
          return previousActivePane.activate();
        }
      });
    } else {
      return console.warn("Editor has not been saved to file.");
    }
  };

  toggle = function() {
    var editor;
    if (isPlantumlPreviewView(atom.workspace.getActivePaneItem())) {
      atom.workspace.destroyActivePaneItem();
      return;
    }
    editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    if (!removePreviewForEditor(editor)) {
      return addPreviewForEditor(editor);
    }
  };

  module.exports = {
    config: {
      java: {
        title: 'Java Executable',
        description: 'Path to and including Java executable. If default, Java found on System Path will be used.',
        type: 'string',
        "default": 'java'
      },
      javaAdditional: {
        title: 'Additional Java Arguments',
        description: 'Such as -DPLANTUML_LIMIT_SIZE=8192 or -Xmx1024m. -Djava.awt.headless=true arguement is included by default.',
        type: 'string',
        "default": ''
      },
      jarAdditional: {
        title: 'Additional PlantUML Arguments',
        description: 'Arguments are added immediately after -jar. Arguments specified in settings may override.',
        type: 'string',
        "default": ''
      },
      jarLocation: {
        title: 'PlantUML Jar',
        description: 'Path to and including PlantUML Jar.',
        type: 'string',
        "default": 'plantuml.jar'
      },
      dotLocation: {
        title: 'Graphvis Dot Executable',
        description: "Path to and including Dot executable. If empty string, '-graphvizdot' argument will not be used.",
        type: 'string',
        "default": ''
      },
      zoomToFit: {
        type: 'boolean',
        "default": true
      },
      displayFilename: {
        title: 'Display Filename Above UML Diagrams',
        type: 'boolean',
        "default": true
      },
      bringFront: {
        title: 'Bring To Front',
        description: 'Bring preview to front when parent editor gains focus.',
        type: 'boolean',
        "default": false
      },
      useTempDir: {
        title: 'Use Temp Directory',
        description: 'Output diagrams to {OS Temp Dir}/plantuml-preview/',
        type: 'boolean',
        "default": true
      },
      outputFormat: {
        type: 'string',
        "default": 'svg',
        "enum": ['png', 'svg']
      },
      beautifyXml: {
        title: 'Beautify XML',
        description: 'Use js-beautify on XML when copying and generating SVG diagrams.',
        type: 'boolean',
        "default": true
      }
    },
    activate: function() {
      atom.commands.add('atom-workspace', 'plantuml-preview:toggle', function() {
        return toggle();
      });
      return this.openerDisposable = atom.workspace.addOpener(function(uriToOpen) {
        var host, pathname, protocol, ref;
        ref = url.parse(uriToOpen), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
        if (protocol !== 'plantuml-preview:') {
          return;
        }
        if (PlantumlPreviewView == null) {
          PlantumlPreviewView = require('./plantuml-preview-view');
        }
        return new PlantumlPreviewView({
          editorId: pathname.substring(1)
        });
      });
    },
    deactivate: function() {
      return this.openerDisposable.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2Nqc3ByYWRsaW5nLy5hdG9tL3BhY2thZ2VzL3BsYW50dW1sLXByZXZpZXcvbGliL3BsYW50dW1sLXByZXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUs7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLG1CQUFBLEdBQXNCOztFQUV0QixZQUFBLEdBQWUsU0FBQyxNQUFEO1dBQ2IsNEJBQUEsR0FBNkIsTUFBTSxDQUFDO0VBRHZCOztFQUdmLHFCQUFBLEdBQXdCLFNBQUMsTUFBRDs7TUFDdEIsc0JBQXVCLE9BQUEsQ0FBUSx5QkFBUjs7V0FDdkIsTUFBQSxZQUFrQjtFQUZJOztFQUl4QixzQkFBQSxHQUF5QixTQUFDLE1BQUQ7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBTSxZQUFBLENBQWEsTUFBYjtJQUNOLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsR0FBMUI7SUFDZCxJQUFHLG1CQUFIO01BQ0UsV0FBVyxDQUFDLFdBQVosQ0FBd0IsV0FBVyxDQUFDLFVBQVosQ0FBdUIsR0FBdkIsQ0FBeEI7YUFDQSxLQUZGO0tBQUEsTUFBQTthQUlFLE1BSkY7O0VBSHVCOztFQVN6QixtQkFBQSxHQUFzQixTQUFDLE1BQUQ7QUFDcEIsUUFBQTs7TUFBQSxLQUFNLE9BQUEsQ0FBUSxTQUFSOztJQUNOLEdBQUEsR0FBTSxZQUFBLENBQWEsTUFBYjtJQUNOLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO0lBQ3JCLElBQUcsTUFBQSxJQUFXLEVBQUUsQ0FBQyxVQUFILENBQWMsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFkLENBQWQ7TUFDRSxPQUFBLEdBQ0U7UUFBQSxjQUFBLEVBQWdCLElBQWhCO1FBQ0EsS0FBQSxFQUFPLE9BRFA7O2FBRUYsSUFBSSxDQUFDLFNB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RUFBb0MseUJBQXBDLEVBQStELFNBQUE7ZUFBRyxNQUFBLENBQUE7TUFBSCxDQUEvRDthQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBeUIsU0FBQyxTQUFEO0FBQzNDLFlBQUE7UUFBQSxNQUE2QixHQUFHLENBQUMsS0FBSixDQUFVLFNBQVYsQ0FBN0IsRUFBQyx1QkFBRCxFQUFXLGVBQVgsRUFBaUI7UUFDakIsSUFBYyxRQUFBLEtBQVksbUJBQTFCO0FBQUEsaUJBQUE7OztVQUVBLHNCQUF1QixPQUFBLENBQVEseUJBQVI7O2VBQ3ZCLElBQUksbUJBQUosQ0FBd0I7VUFBQSxRQUFBLEVBQVUsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsQ0FBbkIsQ0FBVjtTQUF4QjtNQUwyQyxDQUF6QjtJQUZaLENBckRWO0lBOERBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE9BQWxCLENBQUE7SUFEVSxDQTlEWjs7QUE3Q0YiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IG51bGxcbnVybCA9IHJlcXVpcmUgJ3VybCdcblBsYW50dW1sUHJldmlld1ZpZXcgPSBudWxsXG5cbnVyaUZvckVkaXRvciA9IChlZGl0b3IpIC0+XG4gIFwicGxhbnR1bWwtcHJldmlldzovL2VkaXRvci8je2VkaXRvci5pZH1cIlxuXG5pc1BsYW50dW1sUHJldmlld1ZpZXcgPSAob2JqZWN0KSAtPlxuICBQbGFudHVtbFByZXZpZXdWaWV3ID89IHJlcXVpcmUgJy4vcGxhbnR1bWwtcHJldmlldy12aWV3J1xuICBvYmplY3QgaW5zdGFuY2VvZiBQbGFudHVtbFByZXZpZXdWaWV3XG5cbnJlbW92ZVByZXZpZXdGb3JFZGl0b3IgPSAoZWRpdG9yKSAtPlxuICB1cmkgPSB1cmlGb3JFZGl0b3IoZWRpdG9yKVxuICBwcmV2aWV3UGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkodXJpKVxuICBpZiBwcmV2aWV3UGFuZT9cbiAgICBwcmV2aWV3UGFuZS5kZXN0cm95SXRlbShwcmV2aWV3UGFuZS5pdGVtRm9yVVJJKHVyaSkpXG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgZmFsc2VcblxuYWRkUHJldmlld0ZvckVkaXRvciA9IChlZGl0b3IpIC0+XG4gIGZzID89IHJlcXVpcmUgJ2ZzLXBsdXMnXG4gIHVyaSA9IHVyaUZvckVkaXRvcihlZGl0b3IpXG4gIHByZXZpb3VzQWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBpZiBlZGl0b3IgYW5kIGZzLmlzRmlsZVN5bmMoZWRpdG9yLmdldFBhdGgoKSlcbiAgICBvcHRpb25zID1cbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgICBzcGxpdDogJ3JpZ2h0J1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBvcHRpb25zKS50aGVuIChwbGFudHVtbFByZXZpZXdWaWV3KSAtPlxuICAgICAgaWYgaXNQbGFudHVtbFByZXZpZXdWaWV3KHBsYW50dW1sUHJldmlld1ZpZXcpXG4gICAgICAgIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG4gIGVsc2VcbiAgICBjb25zb2xlLndhcm4gXCJFZGl0b3IgaGFzIG5vdCBiZWVuIHNhdmVkIHRvIGZpbGUuXCJcblxudG9nZ2xlID0gLT5cbiAgaWYgaXNQbGFudHVtbFByZXZpZXdWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkpXG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICByZXR1cm5cblxuICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgcmV0dXJuIHVubGVzcyBlZGl0b3I/XG5cbiAgYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpIHVubGVzcyByZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgamF2YTpcbiAgICAgIHRpdGxlOiAnSmF2YSBFeGVjdXRhYmxlJ1xuICAgICAgZGVzY3JpcHRpb246ICdQYXRoIHRvIGFuZCBpbmNsdWRpbmcgSmF2YSBleGVjdXRhYmxlLiBJZiBkZWZhdWx0LCBKYXZhIGZvdW5kIG9uIFN5c3RlbSBQYXRoIHdpbGwgYmUgdXNlZC4nXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2phdmEnXG4gICAgamF2YUFkZGl0aW9uYWw6XG4gICAgICB0aXRsZTogJ0FkZGl0aW9uYWwgSmF2YSBBcmd1bWVudHMnXG4gICAgICBkZXNjcmlwdGlvbjogJ1N1Y2ggYXMgLURQTEFOVFVNTF9MSU1JVF9TSVpFPTgxOTIgb3IgLVhteDEwMjRtLiAtRGphdmEuYXd0LmhlYWRsZXNzPXRydWUgYXJndWVtZW50IGlzIGluY2x1ZGVkIGJ5IGRlZmF1bHQuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgamFyQWRkaXRpb25hbDpcbiAgICAgIHRpdGxlOiAnQWRkaXRpb25hbCBQbGFudFVNTCBBcmd1bWVudHMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0FyZ3VtZW50cyBhcmUgYWRkZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgLWphci4gQXJndW1lbnRzIHNwZWNpZmllZCBpbiBzZXR0aW5ncyBtYXkgb3ZlcnJpZGUuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgamFyTG9jYXRpb246XG4gICAgICB0aXRsZTogJ1BsYW50VU1MIEphcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnUGF0aCB0byBhbmQgaW5jbHVkaW5nIFBsYW50VU1MIEphci4nXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ3BsYW50dW1sLmphcidcbiAgICBkb3RMb2NhdGlvbjpcbiAgICAgIHRpdGxlOiAnR3JhcGh2aXMgRG90IEV4ZWN1dGFibGUnXG4gICAgICBkZXNjcmlwdGlvbjogXCJQYXRoIHRvIGFuZCBpbmNsdWRpbmcgRG90IGV4ZWN1dGFibGUuIElmIGVtcHR5IHN0cmluZywgJy1ncmFwaHZpemRvdCcgYXJndW1lbnQgd2lsbCBub3QgYmUgdXNlZC5cIlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgem9vbVRvRml0OlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGlzcGxheUZpbGVuYW1lOlxuICAgICAgdGl0bGU6ICdEaXNwbGF5IEZpbGVuYW1lIEFib3ZlIFVNTCBEaWFncmFtcydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIGJyaW5nRnJvbnQ6XG4gICAgICB0aXRsZTogJ0JyaW5nIFRvIEZyb250J1xuICAgICAgZGVzY3JpcHRpb246ICdCcmluZyBwcmV2aWV3IHRvIGZyb250IHdoZW4gcGFyZW50IGVkaXRvciBnYWlucyBmb2N1cy4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgdXNlVGVtcERpcjpcbiAgICAgIHRpdGxlOiAnVXNlIFRlbXAgRGlyZWN0b3J5J1xuICAgICAgZGVzY3JpcHRpb246ICdPdXRwdXQgZGlhZ3JhbXMgdG8ge09TIFRlbXAgRGlyfS9wbGFudHVtbC1wcmV2aWV3LydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIG91dHB1dEZvcm1hdDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnc3ZnJ1xuICAgICAgZW51bTogWydwbmcnLCAnc3ZnJ11cbiAgICBiZWF1dGlmeVhtbDpcbiAgICAgIHRpdGxlOiAnQmVhdXRpZnkgWE1MJ1xuICAgICAgZGVzY3JpcHRpb246ICdVc2UganMtYmVhdXRpZnkgb24gWE1MIHdoZW4gY29weWluZyBhbmQgZ2VuZXJhdGluZyBTVkcgZGlhZ3JhbXMuJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3BsYW50dW1sLXByZXZpZXc6dG9nZ2xlJywgLT4gdG9nZ2xlKClcbiAgICBAb3BlbmVyRGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpVG9PcGVuKSAtPlxuICAgICAge3Byb3RvY29sLCBob3N0LCBwYXRobmFtZX0gPSB1cmwucGFyc2UgdXJpVG9PcGVuXG4gICAgICByZXR1cm4gdW5sZXNzIHByb3RvY29sIGlzICdwbGFudHVtbC1wcmV2aWV3OidcblxuICAgICAgUGxhbnR1bWxQcmV2aWV3VmlldyA/PSByZXF1aXJlICcuL3BsYW50dW1sLXByZXZpZXctdmlldydcbiAgICAgIG5ldyBQbGFudHVtbFByZXZpZXdWaWV3KGVkaXRvcklkOiBwYXRobmFtZS5zdWJzdHJpbmcoMSkpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAb3BlbmVyRGlzcG9zYWJsZS5kaXNwb3NlKClcbiJdfQ==
