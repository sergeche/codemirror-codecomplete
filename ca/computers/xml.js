/**
 * Content assist computers for xml mode
 */
(function(){
	var knownTokens = {
		'tag': 1,
		'attribute': 1,
		'attribute-value': 1
	};

	/**
	 * @param {CodeMirror} editor
	 */
	function compute(editor, pos) {
		var token = editor.getTokenAt(pos);
		if (!token.className)
			return;

		var currentStyle = null;
		var classNames = token.className.split(/\s+/);
		for (var i = 0, il = classNames.length; i < il; i++) {
			if (classNames[i] in knownTokens) {
				currentStyle = classNames[i];
				break;
			}
		}

		if (currentStyle) {
			var model = {token: currentStyle};
			var tmpPos = pos;
			if (currentStyle == 'attribute-value') {
				tmpPos = codeMirrorUtils.findTokenBackward(editor, 'attribute');
				model.attrName = editor.getTokenAt(tmpPos).string;
			}

			if (currentStyle != 'tag') {
				tmpPos = codeMirrorUtils.findTokenBackward(editor, 'tag');
				model.tagName = editor.getTokenAt(tmpPos).string;
			}

			return contentAssistXmlModel.get(model);
		}

		return null;
	}

	tokenContentAssistProcessor.addModelCollector(['xml', 'xml-placeholders'], compute);
})();