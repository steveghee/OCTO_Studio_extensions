function twxLatch() {
  return {
    elementTag: 'twx-latch',

    label: 'Latch',
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
           label: 'D',
        datatype: 'boolean',
         default: false,
 isBindingSource: false,
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
      return '<div class="latchWidget">Latch</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-latch delegate-field="delegate" auto-field={{me.auto}} input-field={{me.i}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxLatch', twxLatch);