function twxBouncer() {
  return {
    elementTag: 'twx-bouncer',

    label: 'Oscillator',
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
        name: 'wave',
        label: 'Waveform',
        datatype: 'select',
        default: 'sine',
        isBindingTarget: true,
        editor: 'select',
        options: [
            {label: 'Sine'    , value: "sine"},
            {label: 'Saw'     , value: "saw"},
            {label: 'Triangle', value: "triangle"},
            {label: 'Square'  , value: "square"},
        ],
      },
      {
            name: 'oscillating',
           label: 'Oscillating',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rate',
           label: 'Rate',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'min',
           label: 'Minimum',
        datatype: 'number',
         default: 0.0,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'max',
           label: 'Maximum',
        datatype: 'number',
         default: 1.0,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'start',
           label: 'Cycle Start (0..1)',
        datatype: 'number',
         default: 0.0,
             min: 0,
             max: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'value',
           label: 'Value',
        datatype: 'number',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'cycleCount',
           label: '# Cycles',
        datatype: 'number',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'maxCycles',
           label: 'Max Cycles',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
    ],

    services: [
      {
         name: 'reset',
        label: 'Reset'
      }
    ],
    
    events: [
      {
         name: 'bounce',
        label: 'Cycled'
      },
      {
         name: 'stopped',
        label: 'Stopped'
      },
    ],

    dependencies: {
      files         : ['js/bouncer-ng.js'],
      angularModules: ['bouncer-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="bouncerWidget">
        Oscillator
        <p>Wave: ${this.me.wave}</p>
      </div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-bouncer delegate-field="delegate" value-field="me.value" cycle-field="me.cycleCount" wave-field={{me.wave}} bouncing-field={{me.oscillating}} min-field={{me.min}} max-field={{me.max}} start-field={{me.start}} rate-field={{me.rate}} limit-field={{me.maxCycles}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxBouncer', twxBouncer);