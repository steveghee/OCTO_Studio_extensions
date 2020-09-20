function twxGroupy() {
  return {
    elementTag: 'twx-groupy',
      
    label    : 'Groupy',
    
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
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
      },
      {
            name: 'locdata',
           label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: false,
       showInput: false,
       isVisible: true
      },
      {
            name: 'gx',
           label: 'ves-ar-extension:X Coordinate',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'gy',
           label: 'ves-ar-extension:Y Coordinate',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'gz',
           label: 'ves-ar-extension:Z Coordinate',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
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
      files         : ['js/matrix.js', 'js/groupy-ng.js'],
      angularModules: ['groupy-ng']
    },


    designTemplate: function () {
      return '<div class="groupyWidget">Groupy</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-groupy speed-field={{me.speed}} show-field={{me.show}} auto-field={{me.auto}} affects-field={{me.affects}} locdata-field="me.locdata" x-field={{me.gx}} y-field={{me.gy}} z-field={{me.gz}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxGroupy', twxGroupy);