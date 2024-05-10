function twxFlipflop() {
  return {
    elementTag: 'twx-flipflop',

    label: 'Flipflop',
    
    // note : only specify category if you want to limit usage to a specific experience type
    //category: 'ar',  
    // in this case, we want this widget to be available anywhere, so we do NOT specify a category
    
    groups    : ['OCTO Labs'],
    isVisibleInPalette: true,

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

    designTemplate: function (data, html) {
      return html`<div class="flipflopWidget">
        Flip Flop
        <p>Toggle: ${this.me.toggle}</p>
      </div>`;
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-flipflop delegate-field="delegate" q-field="me.q" qbar-field="me.qbar" auto-field={{me.auto}} toggle-field={{me.toggle}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxFlipflop', twxFlipflop);