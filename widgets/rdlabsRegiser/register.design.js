function twxRegister() {
  return {
    elementTag: 'twx-register',

    label: 'Register',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

    properties: [
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
            name: 'i',
           label: 'Input',
        datatype: 'string',
         default: false,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'q',
           label: 'Register',
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
      }
    ],

    events: [
      {
         name: 'qclocked',
        label: 'Clk'
      },
    ],

    dependencies: {
      files         : ['js/latch-ng.js'],
      angularModules: ['latch-ng']
    },

    designTemplate: function () {
      return '<div class="registerWidget">register</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-latch delegate-field="delegate" auto-field={{me.auto}} input-field={{me.i}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxRegister', twxRegister);