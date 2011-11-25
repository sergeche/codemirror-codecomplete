/**
 * A content assist processor proposes completions and computes context
 * information for a particular character offset. This interface is similar to
 * Eclipse's IContentAssistProcessor
 * @class
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
function TokenContentAssistProcessor(words) {
	if (words)
		this.setWords(words);
}

TokenContentAssistProcessor.prototype = {
	/**
	 * Returns a list of completion proposals based on the specified location
	 * within the document that corresponds to the current cursor position
	 * within the text viewer.
	 *
	 * @param {CodeMirror} editor Editor instance
	 *
	 * @param {Object} pos Position as <code>{line, ch}</code> within the
	 * document for which completions should be computed
	 *
	 * @return {Array} Array of <code>CompletionProposal</code> objects
	 */
	computeCompletionProposals: function(editor, pos) {
		if (editor.somethingSelected())
			return [];

		if (!pos)
			pos = editor.getCursor();

		var token = editor.getTokenAt(pos);













		var cur_offset = offset - 1,
			cur_word = '',
			cur_char = '';

		// search for word prefix
		while (cur_offset >= 0 && this.isAllowedChar(cur_char = editor.getChar(cur_offset))) {
			cur_word = cur_char + cur_word;
			cur_offset--;
		}

		// search for right word's bound
		var right_bound = offset;
		while (right_bound < 1000 && this.isAllowedChar(editor.getChar(right_bound))) {
			right_bound++;
		}

		var proposals = null,
			suggestions = this.suggestWords(cur_word);

		if (suggestions.length) {
			proposals = [];

			for (var i = 0, il = suggestions.length; i < il; i++) {
				var s = suggestions[i];
				var proposal = this.completitionProposalFactory(s, offset - cur_word.length, right_bound - cur_offset - 1, offset - cur_word.length + s.length);
				proposals.push(proposal);
			}
		}

		return proposals;
	},

	/**
	 * @param {String} str The actual string to be inserted into the document
	 * @param {Number} offset The offset of the text to be replaced
	 * @param {Number} length The length of the text to be replaced
	 * @param {Number} cursor The position of the cursor following the insert
	 * @return {CompletionProposal}
	 */
	completitionProposalFactory: function(str, offset, length, cursor) {
		return new CompletionProposal(str, offset, length, cursor);
	},

	/**
	 * Check if passed character is allowed for word bounds
	 * @param {String} ch
	 * @return {Boolean}
	 */
	isAllowedChar: function(ch) {
		ch = String(ch);
		if (!ch) return false;

		var re_ch = /[\s\.,\!\?\#%\^\$\(\)\{\}<>'"«»]/;
		return !re_ch.test(ch);
	},

	setWords: function(words) {
		// index words by first letter for faster search
		var _w = {};
		for (var i = 0, il = words.length; i < il; i++) {
			var ch = words[i].toString().charAt(0);
			if (!(ch in _w))
				_w[ch] = [];

			_w[ch].push(words[i]);
		}


		this.words = _w;
	},

	/**
	 * Returs suggested code assist proposals for prefix
	 * @param {String} prefix Word prefix
	 * @return {Array}
	 */
	suggestWords: function(prefix) {
		prefix = String(prefix);
		var result = [];

		if (prefix && this.words) {
			var first_ch = prefix.charAt(0),
				prefix_len = prefix.length;
			if (first_ch in this.words) {
				var words = this.words[first_ch];
				for (var i = 0, il = words.length; i < il; i++) {
					var word = words[i].toString();
					if (word.indexOf(prefix) === 0 && word.length > prefix_len)
						result.push(word);
				}
			}
		}

		return result;
	}
};