/**
 * @type codeMirrorUtils
 * @memberOf __codeMirrorUtils
 */
var codeMirrorUtils = (/** @constructor */ function() {
	return {
		/**
		 * Normalizes CodeMirror position object: translates negative <code>ch</code>
		 * positions into position on previous line
		 * @param {CodeMirror} editor
		 * @param {Object} pos
		 * @returns {Object} Normalized position or <code>null</code> if position
		 * cannot be normalized
		 */
		normalizePos: function(editor, pos, count) {
			count = count || 0;
			if (pos.line < 0 || count > 100000)
				return null;

			var lineInfo = editor.lineInfo(pos.line);

			if (pos.ch >= 0 && pos.ch < lineInfo.text.length) // everything OK
				return pos;

			if (pos.ch < 0 && pos.line) {
				var prevLine = editor.lineInfo(pos.line - 1);
				return this.normalizePos(editor, {
					line: pos.line - 1,
					// XXX should I respect line break character?
					ch: pos.ch + prevLine.text.length
				}, count + 1);
			}

			if (pos.ch >= lineInfo.text.length && pos.line + 1 < editor.lineCount()) {
				return this.normalizePos(editor, {
					line: pos.line + 1,
					ch: pos.ch - lineInfo.text.length
				}, count + 1);
			}

			return null;
		},

		/**
		 * Search for <code>name</code> token in <code>editor</code>, staring at
		 * <code>pos</code> position and moving backward
		 * @memberOf codeMirrorUtils
		 * @param {CodeMirror} editor
		 * @param {String} name
		 * @param {Object} pos
		 * @returns {Object} Position at which token can be retrieved or <code>null</code>
		 */
		findTokenBackward: function(editor, name, pos) {
			while (pos = this.normalizePos(pos)) {
				var token = editor.getTokenAtPos(pos);
				if (token.className && ~_.indexOf(token.className.split(/\s+/), name)) {
					return pos;
				}

				pos.ch = token.start - 1;
			}

			return null;
		}
	};
})();