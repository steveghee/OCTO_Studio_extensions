function twxGroupy() {
  return {
    elementTag: 'twx-groupy',
      
    label    : 'Groupy',
    
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
        name: 'show',
        label: 'Show',
        datatype: 'boolean',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'affects',
        label: 'Affects',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'speed',
        label: 'Speed',
        datatype: 'number',
        default:0,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
        {
            name: 'hidden',
            label: 'Hidden'
        },
        {
            name: 'visible',
            label: 'Visible'
        }
    ],

    services: [
      {
        name: 'update',
        label: 'Update'
      }
    ],
    
    dependencies: {
      files         : ['js/groupy-ng.js'],
      angularModules: ['groupy-ng']
    },


    designTemplate: function () {
      return '<div class="groupyWidget">Groupy</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-groupy class="ng-hide groupyWidget ' + props.class + '" speed-field={{me.speed}} show-field={{me.show}} auto-field={{me.auto}} affects-field={{me.affects}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxGroupy', twxGroupy);