function twxLogic() {
  return {
    elementTag: 'twx-logic',

    label: 'Logic',
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
  isBindingSource: false,
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'inputA',
            label: 'A',
         datatype: 'boolean',
  isBindingTarget: true,
        showInput: true
      },
      {
        name: 'op',
            label: 'Op',
         datatype: 'select',
          default: '_or',
  isBindingTarget: true,
           editor: 'select',
          options: [
                     {label: 'And'  , value: "_and"},
                     {label: 'Or'   , value: "_or"},
                     {label: 'Nand' , value: "_nand"},
                     {label: 'Nor'  , value: "_nor"},
                     {label: 'Xor'  , value: "_xor"},
                   ],
      },
      {
             name: 'inputB',
            label: 'B',
         datatype: 'boolean',
  isBindingSource: false,
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'result',
            label: 'Result',
         datatype: 'boolean',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
    ],

    events: [
        {
             name: 'passed',
            label: 'Passed'
        },
        {
             name: 'failed',
            label: 'Failed'
        },
    ],

    services: [
      {
         name: 'test',
        label: 'Test'
      }
    ],
    
    dependencies: {
      files         : ['js/logic-ng.js'],
      angularModules: ['logic-ng']
    },


    designTemplate: function () {
      return '<div class="logicWidget">Logic: {{me.op}}</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-logic result-field="me.result" auto-field={{me.auto}} ina-field={{me.inputA}} op-field={{me.op}} inb-field={{me.inputB}} delegate-field="delegate">{{me.op}}</div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxLogic', twxLogic);