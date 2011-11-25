CodeMirror.defineMode("xml-placeholders", function(config, parserConfig) {
	var xmlMode = CodeMirror.getMode(config, {
		name : "xml",
		htmlMode : false
	});

	var curTagName = null;
	var curAttrName = null;

	/**
	 * @param {StringStream} stream
	 * @param {Object} state
	 */
	function html(stream, state) {
		var ch = stream.peek();
		var style = xmlMode.token(stream, state.xmlState);

		if (style == 'tag') {
			if (stream.current() == '>')
				curTagName = curAttrName = null;
			else
				curTagName = state.xmlState.tagName;
		} else if (style == 'attribute') {
			curAttrName = stream.current();
		}

		if ((ch == '"' || ch == "'") && style == 'string') {  // matched attribute value
			stream.backUp(stream.current().length);
			state.token = inAttribute(ch);

			return state.token(stream, state);
		}

		 // check for new style for current token
		if (style == 'tag' || style == 'attribute') {
			style = getStyleForModel({
				token: style,
				tagName: curTagName
			});
		}

		return style;
	}


	function inAttribute(quote) {
		var valueEntered = false;

		return function(stream, state) {
			if (stream.next() == quote) {
				if (!valueEntered) { // opening quote
					valueEntered = true;
				} else { // closing quote
					state.token = html;
				}
				return 'attribute-quote';
			} else {
				while (!stream.eol() && stream.peek() != quote) {
					stream.next();
				}

				return getStyleForModel({
					token: 'attribute-value',
					tagName: curAttrName,
					attrName: curAttrName
				});
			}
		};
	}

	/**
	 * Returns new style (token name) for specified content assist model
	 * @param {Object} model Content Assist model
	 * @returns {String}
	 */
	function getStyleForModel(model) {
		var tokens = [];
		_.each(contentAssistXmlModel.get(model), function(item) {
			if (item.returnToken) {
				tokens.push(item.returnToken);
			}
		});

		return _.trim(model.token + ' ' + tokens.join(' '));
	}

	return {
		startState : function() {
			var state = xmlMode.startState();
			return {
				mode : "html",
				token: html,
				xmlState : state
			};
		},

		copyState : function(state) {
			return {
				mode : state.mode,
				token: state.token,
				xmlState : CodeMirror.copyState(xmlMode, state.xmlState)
			};
		},

		token : function(stream, state) {
			return state.token(stream, state);
		},

		electricChars : "/{}:"
	};
});

CodeMirror.defineMIME("text/html", "xml-placeholders");