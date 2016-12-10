sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/ResizeHandler",
	"./SelectionTools",
	"./AvailableItems"
], function(
	library,
	Control,
	ResizeHandler,
	SelectionTools,
	AvailableItems
) {
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
			menuItems: { type: "string", group: "Misc", defaultValue: "bold italic underline | alignLeft alignCenter alignRight alignJustify | font | link unlink | image | indent outdent orderedlist unorderedlist | undo redo" }
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




SimpleEditor.availableItems = {};
for (var sItemName in AvailableItems) {
	if (!AvailableItems.hasOwnProperty(sItemName)) {
		continue;
	}
	SimpleEditor.availableItems[sItemName] = AvailableItems[sItemName];
}



if (sap.ui.getCore().getConfiguration().getDebug()) {
	SimpleEditor.availableItems["debug-rerender"] = {
		title: "Rerender control (FOR DEBUGGING)",
		command: "rerender",
		element: "f021"
	};
}

SimpleEditor.prototype._getContentDocument = function() {
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
		body: {
			normalize: function() {}
		}
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
		getContentDocument: function() {
			return this._getContentDocument();
		}.bind(this),

		getSelection: function() {
			return this._getContentDocument().getSelection();
		}.bind(this),

		/**
		 * Returns the first selection range in the document. This will only return the first range in
		 * multiselect scenarios.
		 *
		 * @returns {Range} - The first selected Range in the editor document
		 * @protected Only to be used by editor commands added using Simpleditor.addToolbarElement
		 */
		getCurrentRange: function() {
			var oSelection = this._getContentDocument().getSelection();
			if (oSelection.rangeCount > 0) {
				return this._getContentDocument().getSelection().getRangeAt(0);
			}
		}.bind(this),


		normalize: function() {
			this._getContentDocument().body.normalize();
		}.bind(this),

		focus: function() {
			if (this._oContent) {
				this._oContent.focus();
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

SimpleEditor.prototype._executeSelectionChecks = function(/* oEvent */) {
	// var oSelection = this._oContent.contentDocument.getSelection();
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

		if (!mItem) {
			jQuery.sap.log.error("Item \"" + sItem + "\" not found in availableItems collection.");
			continue;
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
					oElement.addEventListener("click", function(mItem /*, oEvent */) {
						mItem.command(this._oEditorInterface, SelectionTools)
						this._oContent.contentDocument.body.normalize();
						this._oContent.focus();
					}.bind(this, mItem));
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
					return oEditor.getContentDocument().queryCommandState(mItem.command);
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
