function twxNavigator() {
  return {
    elementTag: 'twx-navigator',
      
    label    : 'Navigator',
    
    category : 'ar',
    groups   : ['Navigation'],
    
    properties: [
      {
            name: 'auto',
           label: 'Following',
        datatype: 'boolean',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'affects',
           label: 'Contains',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'extent',
           label: 'Offset',
        datatype: 'Number',
         default: 0.45,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
      },
      {
            name: 'tunnelSrc',
           label: 'Baseplate model',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.pvz'],
         default: '',
 isBindingTarget: true,
      isVisible : false
      },
      {
            name: 'tunnelColor',
           label: 'Color',
        datatype: 'select',
         default: "1,1,0",
 isBindingTarget: true,
       isVisible: false,
          editor: 'select',
         options: [
            {label: 'Red'      , value: "1,0,0"},
            {label: 'Green'    , value: "0,1,0"},
            {label: 'Blue'     , value: "0,0,1"},
            {label: 'Yellow'   , value: "1,1,0"},
            {label: 'Black' ,    value: "0,0,0"},
            {label: 'White'    , value: "1,1,1"},
            {label: 'Magenta',   value: "1,0,1"},
            {label: 'Turquiose', value: "0,1,1"},
                  ],
      },
      {
            name: 'feetColor',
           label: 'Feet Color',
        datatype: 'select',
         default: "0,1,0",
 isBindingTarget: true,
       isVisible: false,
          editor: 'select',
         options: [
            {label: 'Red'      , value: "1,0,0"},
            {label: 'Green'    , value: "0,1,0"},
            {label: 'Blue'     , value: "0,0,1"},
            {label: 'Yellow'   , value: "1,1,0"},
            {label: 'Black' ,    value: "0,0,0"},
            {label: 'White'    , value: "1,1,1"},
            {label: 'Magenta',   value: "1,0,1"},
            {label: 'Turquiose', value: "0,1,1"},
                  ],
      },
      {
            name: 'device',
           label: 'Device',
        datatype: 'select',
         default: '',
 isBindingTarget: true,
       isVisible: function(props, $scope) {
                    let projectSettings = $scope.$root.currentProject || {};
                    return (projectSettings.projectType != 'eyewear');
                  },
          editor: 'select',
         options: [
            {label: 'None'            , value: ''},
            {label: 'iPad'            , value: "extensions/images/navipad.pvz"},
            {label: 'iPhone landscape', value: "extensions/images/navphonl.pvz"},
            {label: 'iPhone portrait' , value: "extensions/images/navphonp.pvz"}
                  ],
      },
      {
            name: 'head',
           label: 'Show head',
        datatype: 'boolean',
         default: true,
 isBindingTarget: false
      },
      {
            name: 'feet',
           label: 'Show feet',
        datatype: 'boolean',
         default: true,
 isBindingTarget: true
      },
      {
            name: 'feetSrc',
           label: 'Image for feet',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/navfeet.png',
 isBindingTarget: true,
      isVisible : false
      },
      {
            name: 'steps',
           label: 'Steps',
        datatype: 'number',
         default: 30,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: false,
       isVisible: false
      },
      {
            name: 'cutoff',
           label: 'Cutoff distance (m)',
        datatype: 'number',
         default: 0.5,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'shader',
           label: 'Shader',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       isVisible: false
      },
      {
            name: 'visible',
           label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
         default: true,
 isBindingTarget: true
      }
    
    ],

    events: [
        {
            name: 'arrived',
            label: 'Arrived'
        }
    ],

    services: [
      {
        name: 'capture',
        label: 'Mark'
      },
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
      files         : ['js/matrix.js', 'js/navigationHelper.js', 'js/navigator-ng.js', 'images/navipad.pvz', 'images/navphonl.pvz', 'images/navphonp.pvz', 'images/navhead.pvz', 'images/navfeet.png', 'images/navSphere.pvz'],
      angularModules: ['navigator-ng']
    },


    designTemplate: function () {
      return '<twx-dt-model id="#widgetId#" src="/extensions/images/ipad.pvz" opacity="1" hidden="false" scale="{{me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" shader="{{me.shader}}""></twx-dt-model><div class="tetheredWidget">Remember to Enable Tracking Events</div>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var ctrl = '<div ng-navigator class="navigatorWidget" id-field="' + props.widgetId + '" isholo-field=' + forholo +
      ' step-field={{me.steps}} shader-field="me.shader" extend-field={{me.extent}} visible-field={{me.visible}}'+
      ' auto-field={{me.auto}} cutoff-field={{me.cutoff}} affects-field={{me.affects}}'+
      ' head-field={{me.head}} feet-field={{me.head}} device-field={{me.device}} feetsrc-field={{me.feetSrc}}'+
      ' tunnelcolor-field={{me.tunnelColor}} feetcolor-field={{me.feetColor}} delegate-field="delegate"></div>';
      return ctrl;
    },
    
    delegate: function () {

      /**
       * @param element
       * @return Returns the widget controller for the given widget element
       */
      function getWidgetController (widgetEl) {
        return angular.element(widgetEl).data('_widgetController');
      }

      //Delete related model-items before removing model from thingview, fixes memory-ptr errors
      this.beforeDestroy = function (element, widgetCtrl) {
      }
      
      // called on init!
      this.init = function(element, widgetCtrl) {
      }
      
      this.widgetCreated = function(widgetCtrl) {
      }
      
      this.widgetAdded = function(widgetCtrl, dropTarget) {
        console.log(dropTarget);
      }
      
      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
          
        if(changedProps.height) {
          let newScale = changedProps.height;
          let oldScale = (oldProps.width) ? oldProps.width.value : 1;
          
          widgetCtrl.setProp('scale', oldScale + ' ' + newScale + ' 1');
        }
        if(changedProps.width) {
          let newScale = changedProps.width;
          let oldScale = (oldProps.height) ? oldProps.height.value : 1;
          
          widgetCtrl.setProp('scale', newScale + ' ' + oldScale + ' 1');
        }

      };

      return this;
    },

  }
}

twxAppBuilder.widget('twxNavigator', twxNavigator);