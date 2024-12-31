function twxInfoDisplay() {
  return {
    elementTag: 'octo-infodisplay',
      
    label    : 'Information Display',
    
    category : 'ar',
    groups   : ['OCTO'],
    isVisibleInPalette: function(scope) {
      return true;
    },
    
    properties: [
      {
            name: 'imgSrc',
           label: 'Image template',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png'],
         default: '../../extensions/images/infoDisplay.png',
 isBindingTarget: true,
      isVisible : true
      },
      {
            name: 'nearfade',
           label: 'Cutoff distance (m)',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
       isVisible: false
      },
      {
            name: 'farfade',
           label: 'Fade in distance (m)',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
       isVisible: false
      },
      {
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true
      },
      {
            name: 'infodata',
           label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: true,
       showInput: false,
       isVisible: true
      }
    ],

    events: [
      {
        name: 'clicked',
        label: 'Click'
      }
    ],

    services: [
      {
        name: 'show',
        label: 'Show'
      },
      {
        name: 'hide',
        label: 'Hide'
      }

    ],
    
    dependencies: {
      files         : ['js/matrix.js', 'js/infodisplay-ng.js', 'images/infoDisplay.png', 'images/arrow3dsmall.pvz'],
      angularModules: ['infodisplay-ng']
    },


    designTemplate: function (data, html) {
      return '';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
        
      //TODO : add distance shader  
      var ctrl = '<div ng-infodisplay id-field="' + props.widgetId + 
                 ' disabled-field={{me.disabled}} infodata-field="me.infodata"'+
                 ' farfade-field={{me.farfade}} nearfade-field={{me.nearfade}} infodata-field="me.infodata"'+
                 ' src-field={{me.imgSrc}} delegate-field="delegate"></div>\n';
      return ctrl;
    }

  }
}

twxAppBuilder.widget('twxInfoDisplay', twxInfoDisplay);