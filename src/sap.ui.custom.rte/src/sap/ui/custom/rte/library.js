/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.custom.rte
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/base/DataType',
	'sap/ui/core/library'], // library dependency
	function(jQuery, DataType) {

	"use strict";

	/**
	 * Simple Richtext Editor
	 *
	 * @namespace
	 * @name sap.ui.3d
	 * @author Jens Himmelrath
	 * @version ${version}
	 * @public
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.custom.rte",
		version: "${version}",
		dependencies : ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [
			"sap.ui.custom.rte.SimpleEditor"
		],
		elements: []
	});


	return sap.ui.custom.rte;

});
