function twxLocator() {
  return {
    elementTag: 'octo-locator',

    label: 'Locator',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return true; //!!builderSettings.octo;
    },

    properties: [
      {
            name: 'corner',
           label: 'Corner',
        datatype: 'string',
         default: 'mmm',
 isBindingTarget: true,
       isVisible: false,
       showInput: true
      },
      {
            name: 'label',
           label: 'Label field',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'autogroup',
           label: 'Compound',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'data',
           label: 'Data',
        datatype: 'Infotable',
 isBindingTarget: true,
       showInput: false
      },
      {
        name: 'locations',
        label: 'Locations',
        datatype: 'Infotable',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      }
    ],

    events: [
      {
         name: 'complete',
        label: 'Completed'
      },
    ],

  services: [],

    designTemplate: function (data, html) {
      return '<div class="locatorWidget"></div>';
    },

    dependencies: {
      files         : ['js/locator-ng.js'],
      angularModules: ['locator-ng']
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var tmpl = '<div ng-locator info-field="me.data" autogroup-field={{me.autogroup}}  locations-field="me.locations" corner-field={{me.corner}} label-field={{me.label}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxLocator', twxLocator);