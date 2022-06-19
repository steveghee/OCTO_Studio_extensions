function twxSxslplayer() {
  return {
    elementTag: 'twx-octosxslplayer',

    label: 'SXSL Player',
    
    //category : 'ar',
    
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

    properties: [
      {
        name: 'disabled',
        label: 'Disabled',
        datatype: 'boolean',
        default:false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'physical',
        label: 'Physical Model',
        datatype: 'boolean',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
            name: 'sxsldata',
           label: 'Procedure',
        datatype: 'resource_url',
         default: '',
    resource_url: true,
 allowedPatterns: ['.sxsl2','.json'],
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
            name: 'context',
           label: 'Context',
        datatype: 'resource_url',
         default: '',
    resource_url: true,
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
            name: 'steplist',
           label: 'Step List',
        datatype: 'Infotable',
         default: [],
        isBindingSource: true,
        isBindingTarget: false,
        showInput: true
      },
      {
            name: 'reasoncode',
           label: 'Reason',
        datatype: 'Infotable',
         default: [],
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
     }
    ],

    events: [
        {
            name: 'procStart',
            label: 'Procedure Started'
        },
        {
            name: 'procEnd',
            label: 'Procedure Completed'
        },
        {
            name: 'finished',
            label: 'Terminated - successful'
        },
        {
            name: 'terminated',
            label: 'Terminated - failed'
        }
    ],

    services: [
      {
        name: 'halt',
        label: 'Stop'
      },
      {
        name: 'pause',
        label: 'Pause'
      }
    ],
    
    dependencies: {
      files         : ['js/linq.js', 'js/sxslPlayer-ng.js'],
      angularModules: ['sxslplayer-ng']
    },


    designTemplate: function () {
      return '<div class="sxslPlayerWidget"></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-sxslplayer disabled-field={{me.disabled}} physical-field={{me.physical}} resource-field={{me.sxsldata}} reasoncode-field={{me.reasoncode}} context-field="me.context" steplist-field="me.steplist" delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxSxslplayer', twxSxslplayer);