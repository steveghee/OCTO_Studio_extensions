function twxGate() {
  return {
    elementTag: 'twx-gate',

    label: 'Gate',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

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
        name: 'test',
        label: 'Property',
        datatype: 'string',
        default: 'Name',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'op',
        label: 'Op',
        datatype: 'select',
        default: 'like',
        isBindingTarget: true,
        editor: 'select',
        options: [
            {label: 'Like'        , value: "like"},
            {label: 'Unlike'      , value: "unlike"},
            {label: 'Same'        , value: "same"},
            {label: 'Not'         , value: "not"},
            {label: 'Starts with' , value: "starts"},
            {label: 'Equal to'    , value: "eq"},
            {label: 'Not equal to', value: "ne"},
            {label: 'Greater than', value: "gt"},
            {label: 'Less than'   , value: "lt"},
            {label: 'Before'      , value: "before"},
            {label: 'After'       , value: "after"},
        ],
      },
      {
        name: 'value',
        label: 'Value',
        datatype: 'number',
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
      files         : ['js/gate-ng.js'],
      angularModules: ['gate-ng']
    },


    designTemplate: function () {
      return '<div class="gateWidget"></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-gate class="ng-hide gateWidget ' + props.class + '" result-field="me.result" auto-field={{me.auto}} test-field={{me.test}} op-field={{me.op}} value-field={{me.value}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxGate', twxGate);