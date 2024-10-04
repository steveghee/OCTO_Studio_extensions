function twxSurfaceIndicator() {
  return {
    elementTag: 'twx-surfaceindicator',

    label     : 'Surface Indicator',
    category  : 'ar',
    groups    : ['OCTO Labs'],

    properties: [
      {
            name: 'src',
           label: 'Indicator',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/dn-arrow.png',
 isBindingTarget: true,
      isVisible : true
      },
      {
            name: 'model',
           label: 'Model Id',
        datatype: 'string',
         default: 'model-1',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'size',
           label: 'Height',
        datatype: 'number',
         default: 0.1,
             min: 0.01,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'info',
           label: 'Data',
        datatype: 'Infotable',
 isBindingTarget: true,
       showInput: true,
       isVisible: function(props, scope){
         let builderSettings = scope.$root.builderSettings || {};
         return !!builderSettings.octo; //WIP
       }
      },
      {
            name: 'results',
           label: 'Results',
        datatype: 'Infotable',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false,
       isVisible: true
      },
      {
        name: 'tangential',
        label: 'On Surface',
        datatype: 'boolean',
        default: false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'disabled',
        label: 'Disabled',
        datatype: 'boolean',
        default: false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
      {
         name: 'complete',
        label: 'Completed'
      },
    ],

    designTemplate: function (data, html) {
      return '<div class="surfaceIndicatorWidget"></div>';
    },

    dependencies: {
      files         : ['js/surfaceindicator-ng.js','js/matrix.js'],
      angularModules: ['surfaceindicator-ng']
    },

    runtimeTemplate: function (props) {
        
      var tmpl = '<div ng-surfaceindicator tangent-field={{me.tangential}} results-field="me.results" size-field={{me.size}} src-field={{me.src}} info-field="me.info" disabled-field={{me.disabled}} model-field={{me.model}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxSurfaceIndicator', twxSurfaceIndicator);