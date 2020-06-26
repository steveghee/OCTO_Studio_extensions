function twxLogic() {
  return {
    elementTag: 'twx-logic',

    label: 'Logic',
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
      return '<div class="logicWidget">{{me.op}}</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-logic class="ng-hide logicWidget ' + props.class + '" result-field="me.result" auto-field={{me.auto}} ina-field={{me.inputA}} op-field={{me.op}} inb-field={{me.inputB}} delegate-field="delegate">{{me.op}}</div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxLogic', twxLogic);