/**
 * Trim whitespace from text
 * @memberOf _
 * @param {String} text
 */
_.trim = function (text) {
	return (text || '').replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
};