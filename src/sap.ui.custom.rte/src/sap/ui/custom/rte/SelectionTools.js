sap.ui.define(["./library"], function(/* library */) {
"use strict";

var SelectionTools = {
	/**
	 * Either returns the (first) currently selected range or selects the whole node around the
	 * current cursor position in case nothing is selected
	 */
	selectRange: function(oEditor) {
		var oRange = oEditor.getCurrentRange();
		var oSelection = oEditor.getSelection();
		if (oRange.collapsed) {
			var oNewRange = oRange.cloneRange();
			oNewRange.selectNodeContents(oRange.endContainer);
			oSelection.removeAllRanges();
			oSelection.addRange(oNewRange);
			oRange = oNewRange;
		}
		return oRange;
	},

	selectNode: function(oEditor, oNode) {
		var oSelection = oEditor.getSelection();
		var oNewRange = oEditor.getCurrentRange().cloneRange();
		oNewRange.selectNodeContents(oNode);
		oSelection.removeAllRanges();
		oSelection.addRange(oNewRange);
	}
};

return SelectionTools;

}, /* bExport: */ true);
