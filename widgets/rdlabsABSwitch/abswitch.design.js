function twxABSwitch() {
  return {
    elementTag: 'twx-abswitch',

    label: 'ABSwitch',
    // note : only specify category if you want to limit usage to a specific experience type
    //category: 'ar',  
    // in this case, we want this widget to be available anywhere, so we do NOT specify a category
    groups    : ['OCTO Labs'],
    
    isVisibleInPalette: true,

    properties: [
      {
             name: 'inputA',
            label: 'A',
         datatype: 'string',
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'polarity',
            label: 'Polarity',
         datatype: 'bool',
          default: true,
  isBindingTarget: true,
      },
      {
             name: 'inputB',
            label: 'B',
         datatype: 'string',
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
    dependencies: {
      files         : ['js/abswitch-ng.js'],
      angularModules: ['abswitch-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="abswitchWidget">
        ABSwitch
        <p>Polarity:${this.me.polarity ? "A" : "B"}</p>
      </div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-abswitch result-field="me.result" ina-field={{me.inputA}} polarity-field={{me.polarity}} inb-field={{me.inputB}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxABSwitch', twxABSwitch);