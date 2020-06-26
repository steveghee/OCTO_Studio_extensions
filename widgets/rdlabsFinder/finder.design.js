function twxFinder() {
  return {
    elementTag: 'twx-finder',

    label: 'Finder',
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
        name: 'src',
        label: 'Src',
        datatype: 'resource_url',
        default: '',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'name',
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
        name: 'results',
        label: 'Results',
        datatype: 'Infotable',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
      {
        name: 'count',
        label: 'Count',
        datatype: 'number',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      }
    ],

    events: [
        {
            name: 'start',
            label: 'Started'
        },
        {
            name: 'complete',
            label: 'Completed'
        },
    ],

    services: [
      {
        name: 'find',
        label: 'Find'
      }
    ],
    
    dependencies: {
      files         : ['js/linq.js', 'js/finder-ng.js', 'js/sxsl.js'],
      angularModules: ['finder-ng']
    },


    designTemplate: function () {
      return '<div class="finderWidget"></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-finder class="ng-hide finderWidget ' + props.class + '" results-field="me.results" count-field="me.count" auto-field={{me.auto}} src-field={{me.src}} name-field={{me.name}}  op-field={{me.op}}  value-field={{me.value}}  delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxFinder', twxFinder);