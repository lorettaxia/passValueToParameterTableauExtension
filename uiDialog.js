'use strict';

/**
 * UINamespace Sample Extension
 * 
 * This is the popup extension portion of the UINamespace sample, please see
 * uiNamespace.js in addition to this for context.  This extension is 
 * responsible for collecting configuration settings from the user and communicating
 * that info back to the parent extension.
 * 
 * This sample demonstrates two ways to do that:
 *   1) The suggested and most common method is to store the information 
 *      via the settings namespace.  The parent can subscribe to notifications when
 *      the settings are updated, and collect the new info accordingly.
 *   2) The popup extension can receive and send a string payload via the open 
 *      and close payloads of initializeDialogAsync and closeDialog methods.  This is useful
 *      for information that does not need to be persisted into settings.
 */


// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  /**
   * This extension collects the IDs of each datasource the user is interested in
   * and stores this information in settings when the popup is closed.
   */
  const parameterSettingsKey = 'selectedParameters';
  const filterSettingKey = 'selectedFilters';
  let selectedParameters = []; //to store parameter id selected by user 
  let selectedFilters = '';
	
  $(document).ready(function () {
    // The only difference between an extension in a dashboard and an extension 
    // running in a popup is that the popup extension must use the method
    // initializeDialogAsync instead of initializeAsync for initialization.
    // This has no affect on the development of the extension but is used internally.
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      // The openPayload sent from the parent extension in this sample is the 
      // default time interval for the refreshes.  This could alternatively be stored
      // in settings, but is used in this sample to demonstrate open and close payloads.
      
	  
	  $('#parameter').val(openPayload);
      $('#closeButton').click(closeDialog);

      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let visibleParameters = []; //array of current dashboard's parameters id
     // selectedParameters = parseSettingsForParameters();
	  console.log('selected parameter');
	  console.log(selectedParameters);

      // Loop through datasources in this sheet and create a checkbox UI 
      // element for each one.  The existing settings are used to 
      // determine whether a datasource is checked by default or not.
      dashboard.worksheets.forEach(function (worksheet) {
		  
        worksheet.getParametersAsync().then(function (parameters) {
          parameters.forEach(function (parameter) {
			let isActive = (selectedParameters.indexOf(parameter.id) >= 0);	
			
			if (visibleParameters.indexOf(parameter.id) < 0) {
              console.log(parameter);
			  //console.log(parameter.id);
			  //console.log(selectedParameters.indexOf(parameter.id));
			 // console.log(isActive);
			  addParameterItemToUI(parameter, isActive);
              visibleParameters.push(parameter.id);
			  //console.log(visibleParameters);
			}
           });
          });
        });
      });
    });


  /**
   * Helper that parses the settings from the settings namesapce and 
   * returns a list of IDs of the datasources that were previously
   * selected by the user.
   
  function parseSettingsForParameters() {
    let parameterIdList = [];
    let settings = tableau.extensions.settings.getAll();
	console.log(settings);
    if (settings.selectedParameters) {
      parameterIdList = JSON.parse(settings.selectedParameters);
	  console.log(settings.selectedParameters);
	  
    }

    return parameterIdList;
  } */

  /**
   * Helper that updates the internal storage of datasource IDs
   * any time a datasource checkbox item is toggled.
   */
  function updateParameterList(name) {
	  console.log('update');
	  console.log(name);
    let idIndex = selectedParameters.indexOf(name);
    if (idIndex < 0) {			//if the box is not ticked(the value should be -1) and now being ticked, add it to selectedParameters
     // console.log(idIndex);
	  selectedParameters.push(name);
    } else {
	 // console.log(selectedParameters);
      selectedParameters.splice(idIndex, 1); //if the box is origianlly ticked and now being untick, removie it from selectedParameters array --at postion idIndex, remove 1 item
	 // console.log( selectedParameters.splice(idIndex, 1));
	  console.log(selectedParameters);
	}
  }

  /**
   * UI helper that adds a checkbox item to the UI for a datasource.
   */
  function addParameterItemToUI(parameter, isActive) {
    let containerDiv = $('<div />');

    $('<input />', {
      type: 'checkbox',
	  id:parameter.id,
      value: parameter.name,
	  checked: isActive,
      click: function() { updateParameterList(parameter.name) } 
    }).appendTo(containerDiv);

    $('<label />', {
      'for': parameter.id,
      text: parameter.name,
    }).appendTo(containerDiv);

    $('#parameter').append(containerDiv);
  }

  /**
   * Stores the selected datasource IDs in the extension settings,
   * closes the dialog, and sends a payload back to the parent. 
   */
  function closeDialog() {
    let currentSettings = tableau.extensions.settings.getAll();
	console.log('executing close dialog');
	console.log(currentSettings);
	
	selectedFilters = $('#filter').val();
	console.log(selectedFilters);
    tableau.extensions.settings.set(parameterSettingsKey, JSON.stringify(selectedParameters[0])); //convert js object into a string
	tableau.extensions.settings.set(filterSettingKey, JSON.stringify(selectedFilters));
	
	
	//console.log(parameterSettingsKey);
	//console.log(JSON.stringify(selectedParameters[0]));
    
	tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
	  console.log('Settings Saved.');
      tableau.extensions.ui.closeDialog('');
	 // tableau.extensions.ui.closeDialog($('#filter').val());
	 // console.log($('#filter').val()); 
	 // console.log(selectedParameters[0]);

    }); 
  }
})();
