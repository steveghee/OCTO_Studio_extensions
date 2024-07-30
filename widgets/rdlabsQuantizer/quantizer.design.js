function twxQuantizer() {
  return {
    elementTag: 'twx-quantizer',

    label: 'Quantizer',
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
             name: 'buckets',
            label: 'Quantization (#buckets)',
         datatype: 'number',
  isBindingSource: false,
  isBindingTarget: true,
        showInput: true
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
      files         : ['js/quantizer-ng.js'],
      angularModules: ['quantizer-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="quantizerWidget">
        Quantizer
        <p>Quantization factor: ${this.me.buckets}</p>
      </div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-quantizer info-field="me.data" result-field="me.result" property-field={{me.property}} buckets-field={{me.buckets}} }}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxQuantizer', twxQuantizer);