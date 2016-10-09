sap.ui.define(['sap/ui/core/Control', 'sap/ui/core/ResizeHandler'], function(Control, ResizeHandler) {
"use strict";

jQuery.sap.includeStyleSheet(sap.ui.resource('sap.ui.custom.rte', "fonts/css/font-awesome.min.css"));


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
	}
};


/**
 * Constructor for a new SimpleEditor.
 *
 * The SimpleEditor is a free alternative to the commercially available sap.ui.richtexteditor.RichTextEditor meant to be
 * used in simple scenarios and optimized to handle the string based rendering of openUI5 which can lead to problems
 * with third party components that rely on the availability of the content frame in the DOM in combination with
 * asynchronous event handlers.
 *
 * The icons used in this editor are from the <a href="http://fontawesome.io/">Font Awesome</a> project.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The SimpleEditor-Control is used to enter formatted text.
 * @extends sap.ui.core.Control
 *
 * @author Jens Himmelrath
 *
 * @constructor
 * @public
 * @alias sap.ui.custom.rte.SimpleEditor
 */
var SimpleEditor = Control.extend("sap.ui.custom.rte.SimpleEditor", {
	metadata: {
		properties: {
			/**
			 * Width of Editor control in CSS units.
			 */
			width:  { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%" },

			/**
			 * Height of Editor control in CSS units.
			 */
			height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%" },

			/**
			 * An HTML string representing the editor content. Because this is HTML, the value cannot be generically escaped to prevent cross-site scripting, so the application is responsible for doing so.
			 */
			value: { type: "string", group: "Data", defaultValue: "" },

			/**
			 * Whether to run the HTML sanitizer once the value (HTML markup) is applied or not. To configure allowed URLs please use the whitelist API via jQuery.sap.addUrlWhitelist
			 */
			sanitizeValue : { type: "boolean", group: "Misc", defaultValue: true },

			/**
			 * List of UI elements shown in the editor toolbar
			 */
			menuItems: { type: "string", group: "Misc", defaultValue: "bold italic underline | alignLeft alignCenter alignRight alignJustify | fontSize | link unlink | image | indent outdent orderedlist unorderedlist | undo redo" }
		}
	},

	renderer: {
		render: function(oRm, oControl) {
			oRm.write('<div');
			oRm.writeControlData(oControl);

			oRm.addClass("simpleRte");
			oRm.writeClasses();

			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();

			if (oControl.getTooltip_AsString()) { // ensure not to render null
				oRm.writeAttributeEscaped("title", oControl.getTooltip_AsString());
			}
			oRm.write('>');
			oRm.write('</div>');
		}
	}
});

// mElement-structure:
// command method:
// function(oEditor, oEditorSelection) --> this points to mElement

/**
 * This method can be used to add new UI-elements to the editor toolbar and at the same time provide new features.
 *
 * @param {map} mElement - A map containing all information about the added element
 * @param {string} mElement.name - The name/id of the command
 * @param {string} mElement.title - The description to show on hover
 * @param {string|function} mElement.element - string or function returning an HTMLElement
 * @param {string|function} mElement.command - string to send to execCommand or function invoked when element is activated by user. The function will only be called if element is not a function and thus created automatically. The command function has its this-reference set to mElement and gets the Editor interface as first argument.
 * @param {string|function} mElement.check - function checking whether the element should be marked as active, returns true or false based on the current selection (Automatically created for string execCommand commands) false to diasble checking
 *
 *
 * @static
 * @public
 */
SimpleEditor.addToolbarElement = function(mElement) {
	SimpleEditor.availableItems[mElement.name] = mElement;
};

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

SimpleEditor.availableItems = {
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
	fontSize: {
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
				// "cursive",
				// "fantasy",
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

			var oRange = oEditor.getCurrentRange();
			if (oRange && oRange.endContainer) {
				var oElement = oRange.endContainer;
				if (oElement.nodeType === Node.TEXT_NODE) {
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
			var oContentDocument = oEditor.getContenDocument();
			// TODO: replace prompt with modal dialog
			var sHref = prompt("Link target:");
			oContentDocument.execCommand("createLink", false, sHref);
		},
		element: "f0c1",
		check: false
	},
	unlink: {
		title: "Unlink current selection",
		command: function(oEditor) {
			var oRange = oEditor.getCurrentRange();
			// TODO: Decide what to do with multiple selections

			if (oRange) {
				oRange = SelectionTools.selectCollapsed(oRange);

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
			var oContentDocument = oEditor.getContenDocument();
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


if (sap.ui.getCore().getConfiguration().getDebug()) {
	SimpleEditor.availableItems["debug-rerender"] = {
		title: "Rerender control (FOR DEBUGGING)",
		command: "rerender",
		element: "f021"
	};
}

SimpleEditor.prototype._getContenDocument = function() {
	if (this._oContent) {
		return this._oContent.contentDocument;
	}

	// TODO: Is this really a good idea?
	// return undefined;
	return {
		getSelection: function() {
			return {
				rangeCount: 0,
				getRangeAt: function() {}
			}
		},

	};
};

	///////////////////////////////////////////// Control Lifecycle Methods ////////////////////////////////////////////

SimpleEditor.prototype.init = function() {
	// "Interface" (as in UI5-Interface concept) that only allow access to a subset of the control's methods
	this._oEditorInterface = {
		/**
		 * Internal API to be used by editor commands to manipulate the editor content when a toolbar element is activated by
		 * the user. This method should never be called from outside. See Simpleditor.addToolbarElement for details
		 *
		 * @protected Only to be used by editor commands added using Simpleditor.addToolbarElement
		 */
		getContenDocument: function() {
			return this._getContenDocument();
		}.bind(this),

		getSelection: function() {
			return this._getContenDocument().getSelection();
		}.bind(this),

		/**
		 * Returns the first selection range in the document. This will only return the first range in
		 * multiselect scenarios.
		 *
		 * @returns {Range} - The first selected Range in the editor document
		 * @protected Only to be used by editor commands added using Simpleditor.addToolbarElement
		 */
		getCurrentRange: function() {
			var oSelection = this._getContenDocument().getSelection();
			if (oSelection.rangeCount > 0) {
				return this._getContenDocument().getSelection().getRangeAt(0);
			}
		}.bind(this)
	};

	this._contentElements = [];
	this._selectionChecks = [];

	// Handle resized correctly.
	this._boundResizeEditor = this._resizeEditor.bind(this);
	if (!this._resizeHandlerId) {
		this._resizeHandlerId = ResizeHandler.register(this, this._boundResizeEditor);
	}
};

SimpleEditor.prototype.exit = function() {
	ResizeHandler.deregister(this._resizeHandlerId);
};

SimpleEditor.prototype.onBeforeRendering = function() {
	if (this._oContent && this._oContent.contentDocument) {
		var i;

		this._saveEditorContent();

		// Save current selection(s)
		var oSelection = this._oContent.contentDocument.getSelection();
		if (oSelection.rangeCount > 0)	{
			this._contentRanges = [];
			for (i = 0; i < oSelection.rangeCount; ++i) {
				var oRange = oSelection.getRangeAt(i);
				this._contentRanges.push({
					collapsed: oRange.collapsed,
					startOffset: oRange.startOffset,
					startContainer: oRange.startContainer,
					endContainer: oRange.endContainer,
					endOffset: oRange.endOffset
				});
			}
		}

		// Save current content body elements
		var oContentBody = this._oContent.contentDocument.body;
		this._contentElements = Array.prototype.slice.call(oContentBody.childNodes, 0);
		this._contentElements.map(oContentBody.removeChild.bind(oContentBody));
	}
};

SimpleEditor.prototype.onAfterRendering = function() {
	var oDom = this.getDomRef();

	this._getEditorDom().map(oDom.appendChild.bind(oDom));

	this._resizeEditor();
};

	////////////////////////////////////////////////// Public Methods //////////////////////////////////////////////////

SimpleEditor.prototype.setValue = function(sValue) {
	if (this.getSanitizeValue()) {
		sValue = jQuery.sap._sanitizeHTML(sValue);
	}

	if (sValue !== this.getValue()){
		this.setProperty("value", sValue, true);
		if (this._oContent && this._oContent.contentDocument) {
			this._oContent.contentDocument.body.innerHTML = sValue;
		}
	}
	return this;
};

/**
 * Executes a command on the editor content document.
 *
 * @param {string} sCommand - The command to execute
 * @protected
 */
SimpleEditor.prototype.execCommand = function(sCommand) {
	if (sCommand === "rerender") {
		this.invalidate();
	} else {
		this._oContent.contentDocument.execCommand(sCommand);
		this._oContent.contentDocument.body.normalize();
		this._oContent.focus();
		this._executeSelectionChecks();
	}
};

	///////////////////////////////////////////////// Protected Methods ////////////////////////////////////////////////




	////////////////////////////////////////////////// Private Methods /////////////////////////////////////////////////

SimpleEditor.prototype._getEditorDom = function() {
	if (!this._oEditorDom) {
		this._oEditorDom = [];

		this._oToolbar = this._createToolbar();
		this._oEditorDom.push(this._oToolbar);

		this._oContent = document.createElement("iframe");
		this._oEditorDom.push(this._oContent);


		this._oContent.classList.add("simpleRteContent");

		this._oContent.addEventListener("load", function() {
			var oContentDocument = this._oContent.contentDocument;



			oContentDocument.body.contentEditable = true;

			oContentDocument.execCommand("styleWithCSS", false, true);

			if (this._contentElements.length === 0) {
				oContentDocument.body.innerHTML = this.getValue();
			} else {
				this._contentElements.map(oContentDocument.body.appendChild.bind(oContentDocument.body));
			}

			oContentDocument.body.addEventListener("input", function() {
				this._saveEditorContent();
			}.bind(this));

			// Set Selection as it was before re-rendering
			if (this._contentRanges) {
				var oSelection = oContentDocument.getSelection();
				this._contentRanges.map(function(mRange) {
					var oRange = oContentDocument.createRange();
					oRange.setStart(mRange.startContainer, mRange.startOffset);
					oRange.setEnd(mRange.endContainer, mRange.endOffset);
					oSelection.addRange(oRange);
				});
			}

			// Listen to selectionChanges to enable toolbar highlighting
			oContentDocument.addEventListener("selectionchange", this._executeSelectionChecks.bind(this), false);

		}.bind(this));
	}

	return this._oEditorDom;
};

SimpleEditor.prototype._executeSelectionChecks = function(oEvent) {
	var oSelection = this._oContent.contentDocument.getSelection();
	var oEditor = this._oEditorInterface;
	this._selectionChecks.map(function(mCheck) {
		if (mCheck.test(oEditor)) {
			mCheck.element.classList.add("simpleRteActiveElement");
		} else {
			mCheck.element.classList.remove("simpleRteActiveElement");
		}
	});
};

SimpleEditor.prototype._createToolbar = function() {
	var oToolbar = document.createElement("div");
	oToolbar.classList.add("simpleRteToolbar");

	var aToolbarItems = this.getMenuItems().split(" ");
	for (var i = 0; i < aToolbarItems.length; ++i) {
		var sItem = aToolbarItems[i];

		var mItem;
		if (sItem === "|") {
			// Separator
			mItem = {
				element: "|"
			};
		} else {
			mItem = SimpleEditor.availableItems[sItem];
		}


		var oElement;
		if (typeof mItem.element === "function") {
			oElement = mItem.element(this._oEditorInterface, SelectionTools);
		} else {
			oElement = document.createElement("div");
			oElement.classList.add("simpleRteIcon");

			if (mItem.element === "|") {
				oElement.classList.add("simpleRteSepatarorIcon");
			} else {
				oElement.innerHTML = "&#x" + mItem.element + ";";
				oElement.style.cursor = "pointer"; // TODO: Move to CSS
			}

			// Command will only be called when the element is created automatically
			if (mItem.command) {
				if (typeof mItem.command === "function") {
					oElement.addEventListener("click", mItem.command.bind(mItem, this._oEditorInterface, SelectionTools));
				} else {
					oElement.addEventListener("click", this.execCommand.bind(this, mItem.command));
				}
			}

		}


		if (mItem.title) {
			oElement.setAttribute("title", mItem.title);
		}

		if (mItem.check !== false) {
			// TODO: Actually check
			var mCheck = {};
			if (typeof mItem.check === "function") {
				mCheck.test = mItem.check.bind(mItem);
			} else /* if (typeof mItem.command === "string") */ {
				mCheck.test = function(mItem, oEditor) {
					return oEditor.getContenDocument().queryCommandState(mItem.command);
				}.bind(this, mItem);
			}
			mCheck.element = oElement;

			this._selectionChecks.push(mCheck);
		}

		oToolbar.appendChild(oElement);
	}

	return oToolbar;
};

SimpleEditor.prototype._saveEditorContent = function() {
	this.setProperty("value", this._oContent.contentDocument.body.innerHTML, true);
};

SimpleEditor.prototype._resizeEditor = function() {
	this._oContent.style.height = "calc(100% - " + this._oToolbar.offsetHeight + "px)";
};


return SimpleEditor;

}, /* bExport: */ true);
