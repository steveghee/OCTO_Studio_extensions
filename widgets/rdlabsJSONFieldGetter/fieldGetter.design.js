function twxFieldGetter() {
  return {
    elementTag: 'twx-fieldgetter',

    label: 'FieldGetter',
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
             name: 'dataset',
            label: 'Dataset',
         datatype: 'string',
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'field',
            label: 'Field',
         datatype: 'string',
          default: true,
  isBindingTarget: true,
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
    dependencies: {
      files         : ['js/fieldgetter-ng.js'],
      angularModules: ['fieldgetter-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="fieldGetterWidget">${this.me.field}</div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-fieldgetter result-field="me.result" src-field={{me.dataset}} field-field={{me.field}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxFieldGetter', twxFieldGetter);