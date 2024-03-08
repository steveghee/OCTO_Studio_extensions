function twxFinder() {
  return {
    elementTag: 'twx-finder',

    label: 'Finder',
    
    //category : 'ar',  // by NOT specifying a category, this widget can
    //                     exist in any template
    
    groups    : ['OCTO Labs'],
    
    isVisibleInPalette: true,

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
        name: 'modelid',
        label: 'Model ID',
        datatype: 'string',
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
            {label: 'Within'      , value: "within"},
            {label: 'Contains'    , value: "contains"}
        ],
      },
      {
        name: 'value',
        label: 'Value',
        datatype: 'string',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'category',
        label: 'Category',
        datatype: 'string',
        default: '',
        isVisible:false, 
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'include',
        label: 'Fields to Include',
        datatype: 'string',
        default: '',
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
        name: 'selected',
        label: 'Selected',
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
      files         : ['js/linq.js', 'js/finder-ng.js'],
      angularModules: ['finder-ng']
    },


    designTemplate: function () {
      return '<div class="finderWidget">Finder<p>Op: {{me.op}}</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-finder results-field="me.results" selected-field="me.selected" count-field="me.count" include-field={{me.include}} auto-field={{me.auto}} modelid-field={{me.modelid}} category-field={{me.category}} name-field={{me.name}}  op-field={{me.op}}  value-field={{me.value}}  delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxFinder', twxFinder);