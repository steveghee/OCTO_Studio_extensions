function twxCompressor() {
  return {
    elementTag: 'twx-compressor',

    label: 'Compressor',
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
             name: 'input',
            label: 'Input',
         datatype: 'number',
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'upper',
            label: 'Upper Limit',
         datatype: 'number',
  isBindingSource: false,
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'lower',
            label: 'Lower Limit',
         datatype: 'number',
  isBindingSource: false,
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'error',
            label: 'Error',
         datatype: 'number',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
      {
             name: 'result',
            label: 'Output',
         datatype: 'number',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
      {
            name: 'data',
           label: 'Data',
        datatype: 'Infotable',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'property',
           label: 'Property',
        datatype: 'string',
         default: '',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      }
    
    ],

    dependencies: {
      files         : ['js/compressor-ng.js'],
      angularModules: ['compressor-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="compressorWidget">
        Compressor
        <p>Range: ${this.me.upper - this.me.lower}</p>
      </div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-compressor info-field="me.data" result-field="me.result" error-field="me.error" property-field={{me.property}} input-field={{me.input}} upper-field={{me.upper}} lower-field={{me.lower}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxCompressor', twxCompressor);