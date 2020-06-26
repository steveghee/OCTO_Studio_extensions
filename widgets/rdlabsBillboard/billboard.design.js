function twxBillboard() {
  return {
    elementTag: 'twx-billboard',
      
    label    : 'Billboard',
    
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
        name: 'affects',
        label: 'Affects',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'angle',
        label: 'Angle',
        datatype: 'number',
        default:0,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'offset',
        label: 'Offset',
        datatype: 'number',
        default:0,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
        {
            name: 'aligned',
            label: 'Aligned'
        }
    ],

    services: [
      {
        name: 'align',
        label: 'Align'
      }
    ],
    
    dependencies: {
      files         : ['js/matrix.js', 'js/billboard-ng.js'],
      angularModules: ['billboard-ng']
    },


    designTemplate: function () {
      return '<div class="billboardWidget">Remember to Enable Tracking Events</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-billboard class="ng-hide billboardWidget ' + props.class + '" angle-field={{me.angle}} offset-field={{me.offset}} auto-field={{me.auto}} affects-field={{me.affects}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxBillboard', twxBillboard);