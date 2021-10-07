function twxIncrementer() {
  return {
    elementTag: 'twx-incrementer',

    label: 'Increment',
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
            name: 'base',
           label: 'Initial Value',
        datatype: 'number',
         default: 0,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'quotient',
           label: 'Quotient',
        datatype: 'number',
         default: 1,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'sum',
           label: 'Sum',
        datatype: 'number',
         default: false,
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
    ],

    services: [
      {
         name: 'clki',
        label: 'Clock'
      },
      {
         name: 'reseti',
        label: 'Reset'
      }
    ],

    events: [
      {
         name: 'iclocked',
        label: 'Clk'
      },
    ],

    designTemplate: function () {
      return '<div class="incrementerWidget"></div>';
    },

    dependencies: {
      files         : ['js/incrementer-ng.js'],
      angularModules: ['incrementer-ng']
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-incrementer delegate-field="delegate" quotient-field={{me.quotient}} base-field={{me.base}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxIncrementer', twxIncrementer);