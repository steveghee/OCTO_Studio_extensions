function twxFlipflop() {
  return {
    elementTag: 'twx-flipflop',

    label: 'Flipflop',
    category : 'ar',
    groups    : ['OCTO Labs'],

    properties: [
      {
            name: 'class',
           label: 'Class',
        datatype: 'string',
         default: ''
      },
      {
            name: 'auto',
           label: 'Auto',
        datatype: 'boolean',
         default: true,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'toggle',
           label: 'Toggle',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'q',
           label: 'Q',
        datatype: 'boolean',
         default: false,
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'qbar',
           label: 'Qbar',
        datatype: 'boolean',
         default: false,
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
    ],

    services: [
      {
         name: 'clkq',
        label: 'Clock'
      },
      {
         name: 'setq',
        label: 'Set'
      },
      {
         name: 'resetq',
        label: 'Reset'
      }

    ],

    events: [
      {
         name: 'qclocked',
        label: 'Clk'
      },
    ],

    dependencies: {
      files         : ['js/flipflop-ng.js'],
      angularModules: ['flipflop-ng']
    },

    designTemplate: function () {
      return '<div class="flipflopWidget"></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-flipflop class="ng-hide flipflopWidget ' + props.class + '" delegate-field="delegate" auto-field={{me.auto}} toggle-field={{me.toggle}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxFlipflop', twxFlipflop);