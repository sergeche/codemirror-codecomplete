/**
 * @type contentAssistXmlModel
 * @memberOf __contentAssistXmlModel
 */
var contentAssistXmlModel = (/** @constructor */ function() {
	var defaultAttrs = {
		tagName: '*',
		attrName: '*'
	};

	var validTokens = ['tag', 'attribute', 'attribute-value'];

	var models = {};

	/**
	 * @param {String} name
	 * @returns {Array}
	 */
	function parseName(name) {
		if (name.indexOf('*') != -1) {
			return ['*'];
		}

		var list = _.compact(name.toLowerCase().split(/[\s,]/));
		return _.map(_.uniq(list), _.trim);
	}

	function validateAttributes(attrs) {
		if (!('token' in attrs))
			throw 'No "token" attribute specified for content assist model';

		if (_.indexOf(validTokens, attrs.token) == -1)
			throw 'Unknown token value: ' + attrs.token;
	}

	return {
		/**
		 * Add content assist model
		 * @memberOf contentAssistXmlModel
		 *
		 * @param {Object} attrs Model attributes
		 */
		add: function(attrs) {
			attrs = _.defaults(attrs, defaultAttrs);
			validateAttributes(attrs);

			if (!(attrs.token in models))
				models[attrs.token] = attrs.token == 'tag' ? [] : {};

			var model = models[attrs.token];

			if (attrs.token == 'tag') {
				model.push(attrs);
			} else {
				var attrNames = parseName(attrs.attrName);
				var matches = [];
				_.each(parseName(attrs.tagName), function(tagName) {
					if (attrs.token == 'attribute') {
						matches.push(tagName);
					} else {
						_.each(attrNames, function(attrName) {
							matches.push(tagName + '@' + attrName);
						});
					}
				});

				_.each(matches, function(match) {
					if (!model[match])
						model[match] = [];

					model[match].push(attrs);
				});
			}
		},

		/**
		 * Returns content assist objects matched by specified attributes
		 * @param {Object} attrs
		 * @returns {Array}
		 */
		get: function(attrs) {
			var result = [];
			attrs = _.defaults(attrs, defaultAttrs);
			validateAttributes(attrs);

			if (attrs.token in models) {
				if (attrs.token == 'tag')
					result = models[attrs.token].slice(0);
				else {
					var possibleMatches = [];
					if (attrs.token == 'attribute')
						possibleMatches.push(attrs.tagName.toLowerCase(), '*');
					else {
						var tagName = attrs.tagName.toLowerCase();
						var attrName = attrs.attrName.toLowerCase();
						possibleMatches.push(tagName + '@' + attrName, tagName + '@*', '*@' + attrName, '*@*');
					}

					_.each(models[attrs.token], function(value, key) {
						if (~_.indexOf(possibleMatches, key))
							result = result.concat(value);
					});
				}
			}

			return result;
		}
	};
})();