sap.ui.define(['sap/ui/core/Control', 'sap/ui/core/ResizeHandler'], function(Control, ResizeHandler) {
"use strict";

jQuery.sap.includeStyleSheet(sap.ui.resource('sap.ui.custom.rte', "fonts/css/font-awesome.min.css"));



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
 * @param {string|function} mElement.icon - string or function returning an HTMLElement
 * @param {string|function} mElement.command - string to send to execCommand or function invoked when element is activated by user. The command function has its this-reference set to mElement and gets the Editor instance as first argument. This is the only place where the private method getContenDocument of the SimpleEditor may be used.
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
// 	icon: "|" // Separator without command
// }, {
// 	command: "cut",
// 	icon: "f0c4"
// }, {
// 	command: "copy",
// 	icon: "f0c5"
// }, {
// 	command: "paste",styleWithCSS
// 	icon: "f0ea"
// }, {
// 	command: "emoticon",
// 	icon: "f118"

SimpleEditor.availableItems = {
	bold: {
		title: "Make selection bold",
		command: "bold",
		icon: "f032"
	},
	italic: {
		title: "Make selection italic",
		command: "italic",
		icon: "f033"
	},
	underline: {
		title: "Underline selection",
		command: "underline",
		icon: "f0cd"
	},
	strikethrough: {
		title: "Strike through selection",
		command: "strikethrough",
		icon: "f0cc"
	},
	alignLeft: {
		title: "Align left",
		command: "justifyLeft",
		icon: "f036"
	},
	alignCenter: {
		title: "Align center",
		command: "justifyCenter",
		icon: "f037"
	},
	alignRight: {
		title: "Align right",
		command: "justifyRight",
		icon: "f038"
	},
	alignJustify: {
		title: "Justify content",
		command: "justifyFull",
		icon: "f039"
	},
	fontSize: {
		title: "Choose the font size",
		icon: function(oEditor) {
			var oSelect = document.createElement("select");
			[1, 2, 3, 4, 5, 6, 7].map(function(iNum) {
				var oOption = document.createElement("option");
				oOption.value = oOption.textContent = iNum;
				oSelect.appendChild(oOption);
			});
			oSelect.classList.add("simpleRteIcon");
			oSelect.style.width = "4rem";
			oSelect.addEventListener("input", function(e) {
				oEditor.getContenDocument().execCommand("fontSize", false, e.target.value);
			});
			return oSelect;
		},
		command: function(oEditor) {

			debugger;
		},
		check: function(oSelection) {
			if (oSelection.rangeCount > 0) {
				var debug = oSelection.getRangeAt(0);
				debugger;
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
		icon: "f0c1",
		check: false
	},
	unlink: {
		title: "Unlink current selection",
		command: function(oEditor) {
			var oContentDocument = oEditor.getContenDocument();

			var oSelection = oContentDocument.getSelection();
			if (oSelection.rangeCount !== 1) {
				// TODO: Decide what to do with multiple selections
				debugger;
			} else {
				var oRange = oSelection.getRangeAt(0);
				if (oRange.collapsed) {
					var oNewRange = oRange.cloneRange();
					oNewRange.selectNodeContents(oRange.endContainer);
					oSelection.removeAllRanges();
					oSelection.addRange(oNewRange);
				}

				oContentDocument.execCommand("unlink", false);
			}

			oContentDocument.body.normalize();
		},
		icon: "f127",
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
		icon: "f03e",
		check: false
	},
	indent: {
		title: "Indent current selection",
		command: "indent",
		icon: "f03c",
		check: false
	},
	outdent: {
		title: "Outdent current selection",
		command: "outdent",
		icon: "f03b",
		check: false
	},
	undo: {
		title: "Undo last action",
		command: "undo",
		icon: "f0e2",
		check: false
	},
	redo: {
		title: "Redo last action",
		command: "redo",
		icon: "f01e",
		check: false
	},
	unorderedlist: {
		command: "insertUnorderedList",
		icon: "f0ca"
	},
	orderedlist: {
		command: "insertOrderedList",
		icon: "f0cb"
	}
};


if (sap.ui.getCore().getConfiguration().getDebug()) {
	SimpleEditor.availableItems["debug-rerender"] = {
		title: "Rerender control (FOR DEBUGGING)",
		command: "rerender",
		icon: "f021"
	};
}


	///////////////////////////////////////////// Control Lifecycle Methods ////////////////////////////////////////////

SimpleEditor.prototype.init = function() {
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
	if ( this.getSanitizeValue() ) {
		jQuery.sap.log.trace("sanitizing HTML content for " + this);
		// images are using the URL whitelist support
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


/**
 * Internal API to be used by editor commands to manipulate the editor content when a toolbar element is activated by
 * the user. This method should never be called from outside. See Simpleditor.addToolbarElement for details
 *
 * @protected Only to be used by editor commands added using Simpleditor.addToolbarElement
 */
SimpleEditor.prototype.getContenDocument = function(sCommand) {
	if (this._oContent) {
		return this._oContent.contentDocument;
	}
	return undefined;
};

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
	this._selectionChecks.map(function(mCheck) {
		if (mCheck.test(oSelection)) {
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
				icon: "|"
			};
		} else {
			mItem = SimpleEditor.availableItems[sItem];
		}


		var oIcon;
		if (typeof mItem.icon === "function") {
			oIcon = mItem.icon(this);
		} else {
			oIcon = document.createElement("div");
			oIcon.classList.add("simpleRteIcon");

			if (mItem.icon === "|") {
				oIcon.classList.add("simpleRteSepatarorIcon");
			} else {
				oIcon.innerHTML = "&#x" + mItem.icon + ";";
				oIcon.style.cursor = "pointer";
			}
		}

		if (mItem.command) {
			if (typeof mItem.command === "function") {
				oIcon.addEventListener("click", mItem.command.bind(mItem, this));
			} else {
				oIcon.addEventListener("click", this.execCommand.bind(this, mItem.command));
			}
		}

		if (mItem.title) {
			oIcon.setAttribute("title", mItem.title);
		}

		if (mItem.check !== false) {
			// TODO: Actually check
			var mCheck = {};
			if (typeof mItem.check === "function") {
				mCheck.test = mItem.check;
			} else /* if (typeof mItem.command === "string") */ {
				mCheck.test = function(mItem, oSelection) {
					return this.getContenDocument().queryCommandState(mItem.command);
				}.bind(this, mItem);
			}
			mCheck.element = oIcon;

			this._selectionChecks.push(mCheck);
		}

		oToolbar.appendChild(oIcon);
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
