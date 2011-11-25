/**
 * @type tokenContentAssistProcessor
 * @memberOf __tokenContentAssistProcessor
 */
var tokenContentAssistProcessor = (/** @constructor */ function() {
	var modelCollectors = {};


	return {
		/**
		 * @memberOf tokenContentAssistProcessor
		 */
		addModelCollector: function(name, fn) {
			_.each(_.isArray(name) ? name : [name], function(item) {
				modelCollectors[_.trim(name)] = fn;
			});
		},

		/**
		 * Compute content assist proposals for token as <code>pos</code>
		 * position
		 * @param {CodeMirror} editor Editor instance
		 * @param {Object} pos Position (as <code>{line, ch}</code> object)
		 * in editor where to get token. If not specified, current cursor
		 * position is used
		 * @returns {Array} Array of content assist proposals
		 */
		computeProposals: function(editor, pos) {
			var mode = editor.getOption('mode');
			if (editor.somethingSelected() || !(mode in modelCollectors))
				return [];

			if (!pos)
				pos = editor.getCursor();

			var models = modelCollectors[mode](editor, pos);
			if (!models || !models.length)
				return [];

			// get prefix for current token
			var token = editor.getTokenAt(pos);
			var prefix = token.string.substring(0, pos.ch - token.start);
			var proposals = [];
			_.each(models, function(m) {
				if (m.contentAssist) {
					_.each(m.contentAssist, function(proposal) {
						if (proposal.matches(prefix))
							proposals.push(proposal);
					});
				}
			});

			return proposals;
		}
	};
})();