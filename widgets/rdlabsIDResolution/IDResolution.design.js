function twxIDResolution() {
  return {
    elementTag: 'twx-idresolution',

    label: 'ID Resolution',
    // note : only specify category if you want to limit usage to a specific experience type
    //category: 'ar',  
    // in this case, we want this widget to be available anywhere, so we do NOT specify a category
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return true; //!!builderSettings.octo;
    },

    properties: [
      {
             name: 'urn',
            label: 'Identity',
         datatype: 'string',
  isBindingTarget: true,
        showInput: true
      },
      {
        name: 'include',
        label: 'Fields to Include',
        datatype: 'string',
        default: '',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
             name: 'result',
            label: 'Result',
         datatype: 'string',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
    ],
    events: [
      {
        name: 'resolved',
        label: 'Resolved'
      },
      {
        name: 'failed',
        label: 'Failed'
      },
      {
        name: 'unresolved',
        label: 'Unresolved'
      }
    ],

    dependencies: {
      files         : ['js/idresolution-ng.js'],
      angularModules: ['idresolution-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="idResolutionWidget">${this.me.field}</div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-idresolution result-field="me.result" include-field={{me.include}} urn-field={{me.urn}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxIDResolution', twxIDResolution);