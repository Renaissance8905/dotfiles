Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
* Created by Sam Deane, 10/05/2018.
* All code (c) 2018 - present day, Elegant Chaos Limited.
* For licensing terms, see http://elegantchaos.com/license/liberal/.
*/

var _atom = require('atom');

/**
* Transforms SourceKitten sourcetext into a snippet that Atom can consume.
* SourceKitten sourcetext looks something like this:
*
*   foobar(<#T##x: Int##Int#>, y: <#T##String#>, baz: <#T##[String]#>)
*
* Here, <#T##...#> represents the snippet location to highlight when the tab
* key is pressed. I don't know why the first snippet in the above example is
* "x: Int##Int" -- it seems to me it should be simply "x: Int" -- but we must
* handle this case as well. This function transforms this into the format
* Atom expects:
*
*   foobar(${1:x: Int}, y: ${2:String}, baz: ${3:[String]})
*
* (borrowed with thanks from https://github.com/facebook/nuclide/blob/master/pkg/nuclide-swift/lib/sourcekitten/Complete.js)
*
*/

'use babel';function sourceKittenSourcetextToAtomSnippet(sourcetext) {
    // Atom expects numbered snippet location, beginning with 1.
    var index = 1;
    // Match on each instance of <#T##...#>, capturing the text in between.
    // We then specify replacement text via a function.
    var replacedParameters = sourcetext.replace(/<#T##(.+?)#>/g, function (_, groupOne) {
        // The index is incremented after each match. We split the match group
        // on ##, to handle the strange case mentioned in this function's docblock.
        return '${' + index++ + ':' + groupOne.split('##')[0] + '}';
    });

    // When overriding instance methods, SourceKitten uses the string <#code#>
    // as a marker for the body of the method. Replace this with an empty Atom
    // snippet location.
    return replacedParameters.replace('<#code#>', '${' + index++ + '}');
}

/**
* Maps a SourceKitten kind to an atom type.
*
* TODO: Some of the kinds don't have predefined Atom styles that suit them. These should use custom HTML.
*
* (borrowed with thanks from https://github.com/facebook/nuclide/blob/master/pkg/nuclide-swift/lib/sourcekitten/Complete.js)
*/

function sourceKittenKindToAtomType(kind) {
    switch (kind) {
        case 'source.lang.swift.keyword':
            return 'keyword';
        case 'source.lang.swift.decl.associatedtype':
            return 'type';
        case 'source.lang.swift.decl.class':
            return 'class';
        case 'source.lang.swift.decl.enum':
            return 'class';
        case 'source.lang.swift.decl.enumelement':
            return 'property';
        case 'source.lang.swift.decl.extension.class':
            return 'class';
        case 'source.lang.swift.decl.function.accessor.getter':
            return 'method';
        case 'source.lang.swift.decl.function.accessor.setter':
            return 'method';
        case 'source.lang.swift.decl.function.constructor':
            return 'method';
        case 'source.lang.swift.decl.function.free':
            return 'function';
        case 'source.lang.swift.decl.function.method.class':
            return 'method';
        case 'source.lang.swift.decl.function.method.instance':
            return 'method';
        case 'source.lang.swift.decl.function.method.static':
            return 'method';
        case 'source.lang.swift.decl.function.operator.infix':
            return 'function';
        case 'source.lang.swift.decl.function.subscript':
            return 'method';
        case 'source.lang.swift.decl.generic_type_param':
            return 'variable';
        case 'source.lang.swift.decl.protocol':
            return 'type';
        case 'source.lang.swift.decl.struct':
            return 'class';
        case 'source.lang.swift.decl.typealias':
            return 'type';
        case 'source.lang.swift.decl.var.global':
            return 'variable';
        case 'source.lang.swift.decl.var.instance':
            return 'variable';
        case 'source.lang.swift.decl.var.local':
            return 'variable';
    }

    return 'variable';
}

/**
* Maps a SourceKitten kind to short description to show on the righthand side of the suggestion list.
*
* (borrowed with thanks from https://github.com/facebook/nuclide/blob/master/pkg/nuclide-swift/lib/sourcekitten/Complete.js)
*/

function sourceKittenKindToAtomRightLabel(kind) {
    switch (kind) {
        case 'source.lang.swift.keyword':
            return 'Keyword';
        case 'source.lang.swift.decl.associatedtype':
            return 'Associated type';
        case 'source.lang.swift.decl.class':
            return 'Class';
        case 'source.lang.swift.decl.enum':
            return 'Enum';
        case 'source.lang.swift.decl.enumelement':
            return 'Enum element';
        case 'source.lang.swift.decl.extension.class':
            return 'Class extension';
        case 'source.lang.swift.decl.function.accessor.getter':
            return 'Getter';
        case 'source.lang.swift.decl.function.accessor.setter':
            return 'Setter';
        case 'source.lang.swift.decl.function.constructor':
            return 'Constructor';
        case 'source.lang.swift.decl.function.free':
            return 'Free function';
        case 'source.lang.swift.decl.function.method.class':
            return 'Class method';
        case 'source.lang.swift.decl.function.method.instance':
            return 'Instance method';
        case 'source.lang.swift.decl.function.method.static':
            return 'Static method';
        case 'source.lang.swift.decl.function.operator.infix':
            return 'Infix operator';
        case 'source.lang.swift.decl.function.subscript':
            return 'Subscript';
        case 'source.lang.swift.decl.generic_type_param':
            return 'Generic type parameter';
        case 'source.lang.swift.decl.protocol':
            return 'Protocol';
        case 'source.lang.swift.decl.struct':
            return 'Struct';
        case 'source.lang.swift.decl.typealias':
            return 'Typealias';
        case 'source.lang.swift.decl.var.global':
            return 'Global variable';
        case 'source.lang.swift.decl.var.instance':
            return 'Instance variable';
        case 'source.lang.swift.decl.var.local':
            return 'Local variable';
    }
    return '';
}

/**
Provider which calls sourcekitten asynchronously to supply completions.
*/

var IdeSwiftAutocompleteProvider = (function () {
    function IdeSwiftAutocompleteProvider() {
        _classCallCheck(this, IdeSwiftAutocompleteProvider);

        this.selector = '.source.swift';
        this.disableForSelector = '.source.swift .comment';
        this.suggestionPriority = 1;
        this.showError = true;
    }

    _createClass(IdeSwiftAutocompleteProvider, [{
        key: 'getSuggestions',
        value: function getSuggestions(options) {
            var editor = options.editor;
            var bufferPosition = options.bufferPosition;
            var prefix = options.prefix;

            var text = editor.getText();
            var index = editor.getBuffer().characterIndexForPosition(bufferPosition);
            var offset = index - prefix.length;

            console.debug('prefix: <' + prefix + '>, position: ' + bufferPosition + ', index: ' + index + ', offset: ' + offset);

            return this.findMatchingSuggestions(text, offset, prefix);
        }
    }, {
        key: 'findMatchingSuggestions',
        value: function findMatchingSuggestions(text, offset, prefix) {
            var _this = this;

            return new Promise(function (resolve) {
                var command = atom.config.get('ide-swift.sourceKittenLocation') || "sourcekitten";
                var args = ['complete', '--text', text, '--offset', offset];
                var output = "";
                var errors = "";

                var stdout = function stdout(text) {
                    output += text;
                };
                var stderr = function stderr(text) {
                    errors += text;
                };

                var exit = function exit(code) {
                    if (code == 0) {
                        var suggestions = JSON.parse(output);
                        console.debug('suggestions: ' + suggestions.length);
                        if (prefix.trim() != "") {
                            suggestions = suggestions.filter(function (suggestion) {
                                return suggestion.sourcetext.startsWith(prefix);
                            });
                            console.debug('filtered: ' + suggestions.length);
                        }

                        var inflatedSuggestions = suggestions.map(function (suggestion) {
                            return {
                                text: suggestion.descriptionKey,
                                snippet: sourceKittenSourcetextToAtomSnippet(suggestion.sourcetext),
                                type: sourceKittenKindToAtomType(suggestion.kind),
                                leftLabel: suggestion.typeName,
                                rightLabel: sourceKittenKindToAtomRightLabel(suggestion.kind),
                                description: suggestion.docBrief,
                                replacementPrefix: prefix
                            };
                        });
                        resolve(inflatedSuggestions);
                    } else {
                        atom.notifications.addError("SourceKitten returned an error.", {
                            description: 'SourceKitten failed to get suggestions.\n\nError: ' + code + '.',
                            detail: errors
                        });
                        resolve([]);
                    }
                };

                var process = new _atom.BufferedProcess({ command: command, args: args, stdout: stdout, stderr: stderr, exit: exit });
                process.onWillThrowError(function (error) {
                    if (_this.showError) {
                        atom.notifications.addFatalError('Couldn\'t launch SourceKitten (' + command + ').', {
                            detail: "Please make sure that SourceKitten is installed, and either put it into your PATH or enter its location in the plugin settings."
                        });
                        _this.showError = false;
                    }
                    error.handle();
                    resolve([]);
                });
                _this.process = process;
            });
        }
    }]);

    return IdeSwiftAutocompleteProvider;
})();

exports['default'] = IdeSwiftAutocompleteProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL2lkZS1zd2lmdC1hdXRvY29tcGxldGUtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBUThCLE1BQU07Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUnBDLFdBQVcsQ0FBQyxBQTZCWixTQUFTLG1DQUFtQyxDQUFDLFVBQVUsRUFBRTs7QUFFckQsUUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDOzs7QUFHZCxRQUFNLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQ3pDLGVBQWUsRUFDZixVQUFDLENBQUMsRUFBRSxRQUFRLEVBQUs7OztBQUdiLHNCQUFhLEtBQUssRUFBRSxTQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQUk7S0FDdEQsQ0FDSixDQUFDOzs7OztBQUtGLFdBQU8sa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQVUsU0FBUSxLQUFLLEVBQUUsT0FBSSxDQUFDO0NBQ25FOzs7Ozs7Ozs7O0FBVUQsU0FBUywwQkFBMEIsQ0FBQyxJQUFJLEVBQUU7QUFDdEMsWUFBUSxJQUFJO0FBQ1IsYUFBSywyQkFBMkI7QUFDaEMsbUJBQU8sU0FBUyxDQUFDO0FBQUEsQUFDakIsYUFBSyx1Q0FBdUM7QUFDNUMsbUJBQU8sTUFBTSxDQUFDO0FBQUEsQUFDZCxhQUFLLDhCQUE4QjtBQUNuQyxtQkFBTyxPQUFPLENBQUM7QUFBQSxBQUNmLGFBQUssNkJBQTZCO0FBQ2xDLG1CQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2YsYUFBSyxvQ0FBb0M7QUFDekMsbUJBQU8sVUFBVSxDQUFDO0FBQUEsQUFDbEIsYUFBSyx3Q0FBd0M7QUFDN0MsbUJBQU8sT0FBTyxDQUFDO0FBQUEsQUFDZixhQUFLLGlEQUFpRDtBQUN0RCxtQkFBTyxRQUFRLENBQUM7QUFBQSxBQUNoQixhQUFLLGlEQUFpRDtBQUN0RCxtQkFB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QUMsVUFBVSxDQUFDLElBQUksQ0FBQztBQUM3RCwyQ0FBVyxFQUFFLFVBQVUsQ0FBQyxRQUFRO0FBQ2hDLGlEQUFpQixFQUFFLE1BQU07NkJBQzVCLENBQUM7eUJBQ0wsQ0FBQyxDQUFDO0FBQ0gsK0JBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO3FCQUNoQyxNQUFNO0FBQ0gsNEJBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxFQUFFO0FBQzNELHVDQUFXLHlEQUF1RCxJQUFJLE1BQUc7QUFDekUsa0NBQU0sRUFBRSxNQUFNO3lCQUNqQixDQUFDLENBQUM7QUFDSCwrQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUNmO2lCQUNKLENBQUE7O0FBRUQsb0JBQUksT0FBTyxHQUFHLDBCQUFvQixFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDLENBQUE7QUFDeEUsdUJBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFDLEtBQUssRUFBSztBQUNoQyx3QkFBSSxNQUFLLFNBQVMsRUFBRTtBQUNoQiw0QkFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLHFDQUFrQyxPQUFPLFNBQU07QUFDM0Usa0NBQU0sRUFBRSxpSUFBaUk7eUJBQzVJLENBQUMsQ0FBQztBQUNILDhCQUFLLFNBQVMsR0FBRyxLQUFLLENBQUM7cUJBQzFCO0FBQ0QseUJBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNmLDJCQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2YsQ0FBQyxDQUFDO0FBQ0gsc0JBQUssT0FBTyxHQUFHLE9BQU8sQ0FBQzthQUcxQixDQUFDLENBQUM7U0FDTjs7O1dBN0VnQiw0QkFBNEI7OztxQkFBNUIsNEJBQTRCIiwiZmlsZSI6Ii9Vc2Vycy9janNwcmFkbGluZy8uYXRvbS9wYWNrYWdlcy9pZGUtc3dpZnQvbGliL2lkZS1zd2lmdC1hdXRvY29tcGxldGUtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLyoqXG4qIENyZWF0ZWQgYnkgU2FtIERlYW5lLCAxMC8wNS8yMDE4LlxuKiBBbGwgY29kZSAoYykgMjAxOCAtIHByZXNlbnQgZGF5LCBFbGVnYW50IENoYW9zIExpbWl0ZWQuXG4qIEZvciBsaWNlbnNpbmcgdGVybXMsIHNlZSBodHRwOi8vZWxlZ2FudGNoYW9zLmNvbS9saWNlbnNlL2xpYmVyYWwvLlxuKi9cblxuaW1wb3J0IHtCdWZmZXJlZFByb2Nlc3N9IGZyb20gJ2F0b20nXG5cblxuLyoqXG4qIFRyYW5zZm9ybXMgU291cmNlS2l0dGVuIHNvdXJjZXRleHQgaW50byBhIHNuaXBwZXQgdGhhdCBBdG9tIGNhbiBjb25zdW1lLlxuKiBTb3VyY2VLaXR0ZW4gc291cmNldGV4dCBsb29rcyBzb21ldGhpbmcgbGlrZSB0aGlzOlxuKlxuKiAgIGZvb2Jhcig8I1QjI3g6IEludCMjSW50Iz4sIHk6IDwjVCMjU3RyaW5nIz4sIGJhejogPCNUIyNbU3RyaW5nXSM+KVxuKlxuKiBIZXJlLCA8I1QjIy4uLiM+IHJlcHJlc2VudHMgdGhlIHNuaXBwZXQgbG9jYXRpb24gdG8gaGlnaGxpZ2h0IHdoZW4gdGhlIHRhYlxuKiBrZXkgaXMgcHJlc3NlZC4gSSBkb24ndCBrbm93IHdoeSB0aGUgZmlyc3Qgc25pcHBldCBpbiB0aGUgYWJvdmUgZXhhbXBsZSBpc1xuKiBcIng6IEludCMjSW50XCIgLS0gaXQgc2VlbXMgdG8gbWUgaXQgc2hvdWxkIGJlIHNpbXBseSBcIng6IEludFwiIC0tIGJ1dCB3ZSBtdXN0XG4qIGhhbmRsZSB0aGlzIGNhc2UgYXMgd2VsbC4gVGhpcyBmdW5jdGlvbiB0cmFuc2Zvcm1zIHRoaXMgaW50byB0aGUgZm9ybWF0XG4qIEF0b20gZXhwZWN0czpcbipcbiogICBmb29iYXIoJHsxOng6IEludH0sIHk6ICR7MjpTdHJpbmd9LCBiYXo6ICR7MzpbU3RyaW5nXX0pXG4qXG4qIChib3Jyb3dlZCB3aXRoIHRoYW5rcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9udWNsaWRlL2Jsb2IvbWFzdGVyL3BrZy9udWNsaWRlLXN3aWZ0L2xpYi9zb3VyY2VraXR0ZW4vQ29tcGxldGUuanMpXG4qXG4qL1xuXG5mdW5jdGlvbiBzb3VyY2VLaXR0ZW5Tb3VyY2V0ZXh0VG9BdG9tU25pcHBldChzb3VyY2V0ZXh0KSB7XG4gICAgLy8gQXRvbSBleHBlY3RzIG51bWJlcmVkIHNuaXBwZXQgbG9jYXRpb24sIGJlZ2lubmluZyB3aXRoIDEuXG4gICAgbGV0IGluZGV4ID0gMTtcbiAgICAvLyBNYXRjaCBvbiBlYWNoIGluc3RhbmNlIG9mIDwjVCMjLi4uIz4sIGNhcHR1cmluZyB0aGUgdGV4dCBpbiBiZXR3ZWVuLlxuICAgIC8vIFdlIHRoZW4gc3BlY2lmeSByZXBsYWNlbWVudCB0ZXh0IHZpYSBhIGZ1bmN0aW9uLlxuICAgIGNvbnN0IHJlcGxhY2VkUGFyYW1ldGVycyA9IHNvdXJjZXRleHQucmVwbGFjZShcbiAgICAgICAgLzwjVCMjKC4rPykjPi9nLFxuICAgICAgICAoXywgZ3JvdXBPbmUpID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCBpcyBpbmNyZW1lbnRlZCBhZnRlciBlYWNoIG1hdGNoLiBXZSBzcGxpdCB0aGUgbWF0Y2ggZ3JvdXBcbiAgICAgICAgICAgIC8vIG9uICMjLCB0byBoYW5kbGUgdGhlIHN0cmFuZ2UgY2FzZSBtZW50aW9uZWQgaW4gdGhpcyBmdW5jdGlvbidzIGRvY2Jsb2NrLlxuICAgICAgICAgICAgcmV0dXJuIGBcXCR7JHtpbmRleCsrfToke2dyb3VwT25lLnNwbGl0KCcjIycpWzBdfX1gO1xuICAgICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBXaGVuIG92ZXJyaWRpbmcgaW5zdGFuY2UgbWV0aG9kcywgU291cmNlS2l0dGVuIHVzZXMgdGhlIHN0cmluZyA8I2NvZGUjPlxuICAgIC8vIGFzIGEgbWFya2VyIGZvciB0aGUgYm9keSBvZiB0aGUgbWV0aG9kLiBSZXBsYWNlIHRoaXMgd2l0aCBhbiBlbXB0eSBBdG9tXG4gICAgLy8gc25pcHBldCBsb2NhdGlvbi5cbiAgICByZXR1cm4gcmVwbGFjZWRQYXJhbWV0ZXJzLnJlcGxhY2UoJzwjY29kZSM+JywgYFxcJHske2luZGV4Kyt9fWApO1xufVxuXG4vKipcbiogTWFwcyBhIFNvdXJjZUtpdHRlbiBraW5kIHRvIGFuIGF0b20gdHlwZS5cbipcbiogVE9ETzogU29tZSBvZiB0aGUga2luZHMgZG9uJ3QgaGF2ZSBwcmVkZWZpbmVkIEF0b20gc3R5bGVzIHRoYXQgc3VpdCB0aGVtLiBUaGVzZSBzaG91bGQgdXNlIGN1c3RvbSBIVE1MLlxuKlxuKiAoYm9ycm93ZWQgd2l0aCB0aGFua3MgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svbnVjbGlkZS9ibG9iL21hc3Rlci9wa2cvbnVjbGlkZS1zd2lmdC9saWIvc291cmNla2l0dGVuL0NvbXBsZXRlLmpzKVxuKi9cblxuZnVuY3Rpb24gc291cmNlS2l0dGVuS2luZFRvQXRvbVR5cGUoa2luZCkge1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5rZXl3b3JkJzpcbiAgICAgICAgcmV0dXJuICdrZXl3b3JkJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5hc3NvY2lhdGVkdHlwZSc6XG4gICAgICAgIHJldHVybiAndHlwZSc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuY2xhc3MnOlxuICAgICAgICByZXR1cm4gJ2NsYXNzJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5lbnVtJzpcbiAgICAgICAgcmV0dXJuICdjbGFzcyc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZW51bWVsZW1lbnQnOlxuICAgICAgICByZXR1cm4gJ3Byb3BlcnR5JztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5leHRlbnNpb24uY2xhc3MnOlxuICAgICAgICByZXR1cm4gJ2NsYXNzJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5mdW5jdGlvbi5hY2Nlc3Nvci5nZXR0ZXInOlxuICAgICAgICByZXR1cm4gJ21ldGhvZCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZnVuY3Rpb24uYWNjZXNzb3Iuc2V0dGVyJzpcbiAgICAgICAgcmV0dXJuICdtZXRob2QnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmZ1bmN0aW9uLmNvbnN0cnVjdG9yJzpcbiAgICAgICAgcmV0dXJuICdtZXRob2QnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmZ1bmN0aW9uLmZyZWUnOlxuICAgICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5mdW5jdGlvbi5tZXRob2QuY2xhc3MnOlxuICAgICAgICByZXR1cm4gJ21ldGhvZCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZnVuY3Rpb24ubWV0aG9kLmluc3RhbmNlJzpcbiAgICAgICAgcmV0dXJuICdtZXRob2QnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmZ1bmN0aW9uLm1ldGhvZC5zdGF0aWMnOlxuICAgICAgICByZXR1cm4gJ21ldGhvZCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZnVuY3Rpb24ub3BlcmF0b3IuaW5maXgnOlxuICAgICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5mdW5jdGlvbi5zdWJzY3JpcHQnOlxuICAgICAgICByZXR1cm4gJ21ldGhvZCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZ2VuZXJpY190eXBlX3BhcmFtJzpcbiAgICAgICAgcmV0dXJuICd2YXJpYWJsZSc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wucHJvdG9jb2wnOlxuICAgICAgICByZXR1cm4gJ3R5cGUnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLnN0cnVjdCc6XG4gICAgICAgIHJldHVybiAnY2xhc3MnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLnR5cGVhbGlhcyc6XG4gICAgICAgIHJldHVybiAndHlwZSc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wudmFyLmdsb2JhbCc6XG4gICAgICAgIHJldHVybiAndmFyaWFibGUnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLnZhci5pbnN0YW5jZSc6XG4gICAgICAgIHJldHVybiAndmFyaWFibGUnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLnZhci5sb2NhbCc6XG4gICAgICAgIHJldHVybiAndmFyaWFibGUnO1xuICAgIH1cblxuICAgIHJldHVybiAndmFyaWFibGUnO1xufVxuXG4vKipcbiogTWFwcyBhIFNvdXJjZUtpdHRlbiBraW5kIHRvIHNob3J0IGRlc2NyaXB0aW9uIHRvIHNob3cgb24gdGhlIHJpZ2h0aGFuZCBzaWRlIG9mIHRoZSBzdWdnZXN0aW9uIGxpc3QuXG4qXG4qIChib3Jyb3dlZCB3aXRoIHRoYW5rcyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9udWNsaWRlL2Jsb2IvbWFzdGVyL3BrZy9udWNsaWRlLXN3aWZ0L2xpYi9zb3VyY2VraXR0ZW4vQ29tcGxldGUuanMpXG4qL1xuXG5mdW5jdGlvbiBzb3VyY2VLaXR0ZW5LaW5kVG9BdG9tUmlnaHRMYWJlbChraW5kKSB7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmtleXdvcmQnOlxuICAgICAgICByZXR1cm4gJ0tleXdvcmQnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmFzc29jaWF0ZWR0eXBlJzpcbiAgICAgICAgcmV0dXJuICdBc3NvY2lhdGVkIHR5cGUnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmNsYXNzJzpcbiAgICAgICAgcmV0dXJuICdDbGFzcyc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZW51bSc6XG4gICAgICAgIHJldHVybiAnRW51bSc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZW51bWVsZW1lbnQnOlxuICAgICAgICByZXR1cm4gJ0VudW0gZWxlbWVudCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZXh0ZW5zaW9uLmNsYXNzJzpcbiAgICAgICAgcmV0dXJuICdDbGFzcyBleHRlbnNpb24nO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmZ1bmN0aW9uLmFjY2Vzc29yLmdldHRlcic6XG4gICAgICAgIHJldHVybiAnR2V0dGVyJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5mdW5jdGlvbi5hY2Nlc3Nvci5zZXR0ZXInOlxuICAgICAgICByZXR1cm4gJ1NldHRlcic7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZnVuY3Rpb24uY29uc3RydWN0b3InOlxuICAgICAgICByZXR1cm4gJ0NvbnN0cnVjdG9yJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5mdW5jdGlvbi5mcmVlJzpcbiAgICAgICAgcmV0dXJuICdGcmVlIGZ1bmN0aW9uJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5mdW5jdGlvbi5tZXRob2QuY2xhc3MnOlxuICAgICAgICByZXR1cm4gJ0NsYXNzIG1ldGhvZCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZnVuY3Rpb24ubWV0aG9kLmluc3RhbmNlJzpcbiAgICAgICAgcmV0dXJuICdJbnN0YW5jZSBtZXRob2QnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmZ1bmN0aW9uLm1ldGhvZC5zdGF0aWMnOlxuICAgICAgICByZXR1cm4gJ1N0YXRpYyBtZXRob2QnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmZ1bmN0aW9uLm9wZXJhdG9yLmluZml4JzpcbiAgICAgICAgcmV0dXJuICdJbmZpeCBvcGVyYXRvcic7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wuZnVuY3Rpb24uc3Vic2NyaXB0JzpcbiAgICAgICAgcmV0dXJuICdTdWJzY3JpcHQnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLmdlbmVyaWNfdHlwZV9wYXJhbSc6XG4gICAgICAgIHJldHVybiAnR2VuZXJpYyB0eXBlIHBhcmFtZXRlcic7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wucHJvdG9jb2wnOlxuICAgICAgICByZXR1cm4gJ1Byb3RvY29sJztcbiAgICAgICAgY2FzZSAnc291cmNlLmxhbmcuc3dpZnQuZGVjbC5zdHJ1Y3QnOlxuICAgICAgICByZXR1cm4gJ1N0cnVjdCc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wudHlwZWFsaWFzJzpcbiAgICAgICAgcmV0dXJuICdUeXBlYWxpYXMnO1xuICAgICAgICBjYXNlICdzb3VyY2UubGFuZy5zd2lmdC5kZWNsLnZhci5nbG9iYWwnOlxuICAgICAgICByZXR1cm4gJ0dsb2JhbCB2YXJpYWJsZSc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wudmFyLmluc3RhbmNlJzpcbiAgICAgICAgcmV0dXJuICdJbnN0YW5jZSB2YXJpYWJsZSc7XG4gICAgICAgIGNhc2UgJ3NvdXJjZS5sYW5nLnN3aWZ0LmRlY2wudmFyLmxvY2FsJzpcbiAgICAgICAgcmV0dXJuICdMb2NhbCB2YXJpYWJsZSc7XG4gICAgfVxuICAgIHJldHVybiAnJztcbn1cblxuXG4vKipcblByb3ZpZGVyIHdoaWNoIGNhbGxzIHNvdXJjZWtpdHRlbiBhc3luY2hyb25vdXNseSB0byBzdXBwbHkgY29tcGxldGlvbnMuXG4qL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJZGVTd2lmdEF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnNlbGVjdG9yID0gJy5zb3VyY2Uuc3dpZnQnO1xuICAgICAgICB0aGlzLmRpc2FibGVGb3JTZWxlY3RvciA9ICcuc291cmNlLnN3aWZ0IC5jb21tZW50JztcbiAgICAgICAgdGhpcy5zdWdnZXN0aW9uUHJpb3JpdHkgPSAxO1xuICAgICAgICB0aGlzLnNob3dFcnJvciA9IHRydWU7XG4gICAgfVxuXG4gICAgZ2V0U3VnZ2VzdGlvbnMob3B0aW9ucykge1xuICAgICAgICBjb25zdCB7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4fSA9IG9wdGlvbnM7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGNvbnN0IGluZGV4ID0gZWRpdG9yLmdldEJ1ZmZlcigpLmNoYXJhY3RlckluZGV4Rm9yUG9zaXRpb24oYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGluZGV4IC0gcHJlZml4Lmxlbmd0aFxuXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYHByZWZpeDogPCR7cHJlZml4fT4sIHBvc2l0aW9uOiAke2J1ZmZlclBvc2l0aW9ufSwgaW5kZXg6ICR7aW5kZXh9LCBvZmZzZXQ6ICR7b2Zmc2V0fWApXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZE1hdGNoaW5nU3VnZ2VzdGlvbnModGV4dCwgb2Zmc2V0LCBwcmVmaXgpO1xuICAgIH1cblxuICAgIGZpbmRNYXRjaGluZ1N1Z2dlc3Rpb25zKHRleHQsIG9mZnNldCwgcHJlZml4KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgnaWRlLXN3aWZ0LnNvdXJjZUtpdHRlbkxvY2F0aW9uJykgfHwgXCJzb3VyY2VraXR0ZW5cIlxuICAgICAgICAgICAgY29uc3QgYXJncyA9IFsgJ2NvbXBsZXRlJywgJy0tdGV4dCcsIHRleHQsICctLW9mZnNldCcsIG9mZnNldCBdXG4gICAgICAgICAgICBsZXQgb3V0cHV0ID0gXCJcIlxuICAgICAgICAgICAgbGV0IGVycm9ycyA9IFwiXCJcblxuICAgICAgICAgICAgbGV0IHN0ZG91dCA9ICh0ZXh0KSA9PiB7IG91dHB1dCArPSB0ZXh0IH1cbiAgICAgICAgICAgIGxldCBzdGRlcnIgPSAodGV4dCkgPT4geyBlcnJvcnMgKz0gdGV4dCB9XG5cbiAgICAgICAgICAgIGxldCBleGl0ID0gKGNvZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29kZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWdnZXN0aW9ucyA9IEpTT04ucGFyc2Uob3V0cHV0KVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBzdWdnZXN0aW9uczogJHtzdWdnZXN0aW9ucy5sZW5ndGh9YClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZWZpeC50cmltKCkgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5maWx0ZXIoKHN1Z2dlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi5zb3VyY2V0ZXh0LnN0YXJ0c1dpdGgocHJlZml4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgZmlsdGVyZWQ6ICR7c3VnZ2VzdGlvbnMubGVuZ3RofWApXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mbGF0ZWRTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLm1hcCgoc3VnZ2VzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNuaXBwZXQ6IHNvdXJjZUtpdHRlblNvdXJjZXRleHRUb0F0b21TbmlwcGV0KHN1Z2dlc3Rpb24uc291cmNldGV4dCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogc291cmNlS2l0dGVuS2luZFRvQXRvbVR5cGUoc3VnZ2VzdGlvbi5raW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0TGFiZWw6IHN1Z2dlc3Rpb24udHlwZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmlnaHRMYWJlbDogc291cmNlS2l0dGVuS2luZFRvQXRvbVJpZ2h0TGFiZWwoc3VnZ2VzdGlvbi5raW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogc3VnZ2VzdGlvbi5kb2NCcmllZixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcHJlZml4XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShpbmZsYXRlZFN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJTb3VyY2VLaXR0ZW4gcmV0dXJuZWQgYW4gZXJyb3IuXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgU291cmNlS2l0dGVuIGZhaWxlZCB0byBnZXQgc3VnZ2VzdGlvbnMuXFxuXFxuRXJyb3I6ICR7Y29kZX0uYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuICAgICAgICAgICAgcHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRmF0YWxFcnJvcihgQ291bGRuJ3QgbGF1bmNoIFNvdXJjZUtpdHRlbiAoJHtjb21tYW5kfSkuYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiBcIlBsZWFzZSBtYWtlIHN1cmUgdGhhdCBTb3VyY2VLaXR0ZW4gaXMgaW5zdGFsbGVkLCBhbmQgZWl0aGVyIHB1dCBpdCBpbnRvIHlvdXIgUEFUSCBvciBlbnRlciBpdHMgbG9jYXRpb24gaW4gdGhlIHBsdWdpbiBzZXR0aW5ncy5cIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXJyb3IuaGFuZGxlKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShbXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucHJvY2VzcyA9IHByb2Nlc3M7XG5cblxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=