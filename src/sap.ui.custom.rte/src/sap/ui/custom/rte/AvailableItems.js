sap.ui.define(["./library", "./SelectionTools"], function(library, SelectionTools) {
"use strict";



// }, {
// 	element: "|" // Separator without command
// }, {
// 	command: "cut",
// 	element: "f0c4"
// }, {
// 	command: "copy",
// 	element: "f0c5"
// }, {
// 	command: "paste",styleWithCSS
// 	element: "f0ea"
// }, {
// 	command: "emoticon",
// 	element: "f118"


var AvailabeItems = {
	bold: {
		title: "Make selection bold",
		command: "bold",
		element: "f032"
	},
	italic: {
		title: "Make selection italic",
		command: "italic",
		element: "f033"
	},
	underline: {
		title: "Underline selection",
		command: "underline",
		element: "f0cd"
	},
	strikethrough: {
		title: "Strike through selection",
		command: "strikethrough",
		element: "f0cc"
	},
	alignLeft: {
		title: "Align left",
		command: "justifyLeft",
		element: "f036"
	},
	alignCenter: {
		title: "Align center",
		command: "justifyCenter",
		element: "f037"
	},
	alignRight: {
		title: "Align right",
		command: "justifyRight",
		element: "f038"
	},
	alignJustify: {
		title: "Justify content",
		command: "justifyFull",
		element: "f039"
	},
	font: {
		title: "Choose a font",
		element: function(oEditor, SelectionTools) {
			var fnFilterAvailableFonts = function(sFontname) {
				// TODO: Check if the fonts are really available by checking width of "mmmnnl" string
				var oSpan = document.createElement("span");
				var oReferenceSpan = document.createElement("span");

				oReferenceSpan.textContent = "mmmnnl";
				oReferenceSpan.style.fontFamily = "InvalidFontFallbackToDefault";
				oReferenceSpan.style.display = "block";
				oReferenceSpan.style.position = "absolute";
				oReferenceSpan.style.left = "-1000px";

				oSpan.textContent = "mmmnnl";
				oSpan.style.fontFamily = sFontname;
				oSpan.style.display = "block";
				oSpan.style.position = "absolute";
				oSpan.style.left = "-1000px";

				document.body.appendChild(oReferenceSpan);
				document.body.appendChild(oSpan);

				var fReferenceWidth = parseFloat(window.getComputedStyle(oReferenceSpan).width);
				var fWidth = parseFloat(window.getComputedStyle(oSpan).width);

				document.body.removeChild(oReferenceSpan);
				document.body.removeChild(oSpan);

				return fReferenceWidth != fWidth;
			}

			var aFonts = [
				// TODO: This is a pretty bad and Windows centered list of fonts that might be available
				// "default", -> Must be added after filter
				// "serif", -> Must be added after filter
				// "sans-serif", -> Must be added after filter
				// "monospace", -> Must be added after filter
				"Andale Mono",
				"Arial",
				"Arial Black",
				"Book Antiqua",
				"Century Gothic",
				"Comic Sans MS",
				"Courier",
				"Courier New",
				"DejaVu Sans",
				"DejaVu Serif",
				"Droid Sans",
				"Droid Serif",
				"Geneva",
				"Georgia",
				"Helvetica",
				"Impact",
				"Charcoal",
				"Liberation Mono",
				"Liberation Sans",
				"Liberation Serif",
				"Lucida",
				"Lucida Console",
				"Lucida Grande",
				"Lucida Sans",
				"Monaco",
				"MS Serif",
				"Nimbus Mono",
				"Nimbus Roman",
				"Nimbus Sans",
				"Tahoma",
				"Times",
				"Times New Roman",
				"Trebuchet MS",
				"New York",
				"Palatino",
				"Palatino Linotype",
				"Ubuntu",
				"Verdana",
				"Webdings"
			];

			aFonts = aFonts.filter(fnFilterAvailableFonts);
			aFonts = [
				"default",
				"serif",
				"sans-serif",
				"monospace",
				// "cursive",
				// "fantasy",
				"-"
			].concat(aFonts);

			var oSelect = document.createElement("select");
			aFonts.forEach(function(sFontname) {
				var oOption = document.createElement("option");
				if (sFontname === "-") {
					oOption.textContent = "-----";
				} else {
					oOption.value = oOption.textContent = sFontname;
					oOption.style.fontFamily = sFontname;
					if (sFontname === "default") {
						oOption.setAttribute("selected", "selected");
					}
				}
				oSelect.appendChild(oOption);
			});
			oSelect.classList.add("simpleRteIcon");
			oSelect.style.width = "8rem";
			oSelect.style.fontSize = "0.8rem";
			oSelect.addEventListener("input", function(e) {
				// TODO: Maybe set the current editor before so we do not need to provide it as argument

				var oRange = oEditor.getCurrentRange();
				oRange = SelectionTools.selectRange(oEditor);

				// TODO: This can fail with an exception. I need to find out when this can happen in the RTE scenario
				var oNewNode = document.createElement("span");
				try {
					oRange.surroundContents(oNewNode);
				} catch(ex) {
					oNewNode = oRange.commonAncestorContainer;
				}

				var fnSetFont = function(oNode, sFont) {
					// TODO: Combine/Remove sub elements that only have font-family style
					if (oNode.hasChildNodes()) {
						// remove fontFamily for sub-nodes
						for (var i = 0; i < oNode.children.length; ++i) {
							fnSetFont(oNode.children[i], sFont);
						}
					}
					oNode.style.fontFamily = sFont;
				}


				fnSetFont(oNewNode, e.target.value);

				SelectionTools.selectNode(oEditor, oNewNode);

				oEditor.normalize();
				oEditor.focus();
			});

			this._oElement = oSelect;
			return oSelect;
		},
		command: undefined, // Not called since element function exists
		check: function(oEditor) {
			function trimCustom(sString, aChars) {
				var i, n;
				for (i = 0; i < sString.length; i++) {
					if (aChars.indexOf(sString[i]) === -1) {
						break;
					}
				}

				for (n = sString.length - 1; n >= 0; n--) {
					if (aChars.indexOf(sString[n]) === -1) {
						break;
					}
				}

				return sString.substring(i, n + 1);
			}

			var oBody = oEditor.getContentDocument().body;

			var oRange = oEditor.getCurrentRange();
			if (oRange && oRange.endContainer) {
				var oElement = oRange.endContainer;
				while (oElement != oBody && (!oElement.style || oElement.style.fontFamily == "")) {
					oElement = oElement.parentElement;
				}

				var sFont = trimCustom(oElement.style.fontFamily, ["\"", "'"]);
				var oOptions = this._oElement.children;
				var bSelected = false;
				for (var i = 0; i < oOptions.length; i++) {
					if (oOptions[i].value == sFont) {
						oOptions[i].selected = true;
						bSelected = true;
					} else {
						oOptions[i].selected = false;
					}
				}

				if (!bSelected) {
					// Select the default entry;
					this._oElement.children[0].setAttribute("selected", "selected");
				}
			}
		}

	},
	link: {
		title: "Add link to current selection",
		command: function(oEditor) {
			var oContentDocument = oEditor.getContentDocument();
			var oRange = oEditor.getCurrentRange();
			if (oRange) {
				oRange = SelectionTools.selectRange(oEditor);
				// TODO: replace prompt with modal dialog
				var sHref = prompt("Link target:");
				oContentDocument.execCommand("createLink", false, sHref);
			}
		},
		element: "f0c1",
		check: false
	},
	unlink: {
		title: "Unlink current selection",
		command: function(oEditor) {
			var oContentDocument = oEditor.getContentDocument();
			var oRange = oEditor.getCurrentRange();
			// TODO: Decide what to do with multiple selections

			if (oRange) {
				oRange = SelectionTools.selectRange(oEditor);
				oContentDocument.execCommand("unlink", false);
				oContentDocument.body.normalize();
			}
		},
		element: "f127",
		check: false
	},
	image: {
		title: "Add an image by URL",
		command: function(oEditor) {
			var oContentDocument = oEditor.getContentDocument();
			// TODO: replace prompt with modal dialog
			var sHref = prompt("Image URL:");
			oContentDocument.execCommand("insertImage", false, sHref);
		},
		element: "f03e",
		check: false
	},
	indent: {
		title: "Indent current selection",
		command: "indent",
		element: "f03c",
		check: false
	},
	outdent: {
		title: "Outdent current selection",
		command: "outdent",
		element: "f03b",
		check: false
	},
	undo: {
		title: "Undo last action",
		command: "undo",
		element: "f0e2",
		check: false
	},
	redo: {
		title: "Redo last action",
		command: "redo",
		element: "f01e",
		check: false
	},
	unorderedlist: {
		command: "insertUnorderedList",
		element: "f0ca"
	},
	orderedlist: {
		command: "insertOrderedList",
		element: "f0cb"
	}
};

return AvailabeItems;

}, /* bExport: */ true);
