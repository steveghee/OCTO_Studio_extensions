function twxMultiLineLabel3D() {
  var ELEMENT_NAME = 'octo-multilinelabel';
  var properties = [
    {
      name: 'text',
      label: 'ves-ar-extension:Text',
      datatype: 'string',
      default: '',
      isBindingTarget: true,
      sortOrder: 1
    },
    {
      name: 'font',
      label: 'ves-ar-extension:Font',
      datatype: 'string',
      default: 'bold 70px Arial',
      editor: 'select',
      options: [
        {label: 'Small', value: "bold 70px Arial"},
        {label: 'Medium', value: "bold 90px Arial"},
        {label: 'Large', value: "bold 120px Arial"}
      ],
      isBindingTarget: true,
      sortOrder: 3
    },
    {
      name: 'fontColor',
      label: 'ves-ar-extension:Font Color',
      datatype: 'color',
      default: 'rgba(255, 255, 255, 1);',
      isBindingTarget: true,
      sortOrder: 4
    },
    {
      name: 'lineCount',
      label: 'Max Lines',
      datatype: 'number',
      tFrag: 'linecount="{{me.lineCount}}"', //"{{ctrl.delegate.calcHeight()}}"',
      default: 4,
      isBindingTarget: true,
      sortOrder: 5
    },
    {
      name: 'padding',
      label: 'ves-ar-extension:Padding',
      datatype: 'string',
      default: '20px',
      isBindingTarget: true,
      sortOrder: 6,
      isVisible:false
    }
  ];

  properties.push(Twx3dCommon.getPivotProperty());

  var overlay = Twx3dCommon.arrayToMap(properties);
  overlay.experimentalOneSided = Twx3dCommon.getOneSidedProperty();
  overlay.experimentalOneSided.default = true;
  overlay.width = Twx3dCommon.getWidthProperty();
  overlay.width.default = 0.1;
  overlay.height = Twx3dCommon.getHeightProperty();
  overlay.height.default = 0.025;
  overlay.height.isVisible = false;
  overlay.height.isBindingTarget = false;
  
  var removals = ['billboard', 'occlude', 'opacity', 'scale', 'decal','pivot'];
  var props    = Twx3dCommon.new3dProps(overlay, removals);

  var runtimeTemplate = Twx3dCommon.buildRuntimeTemplate(ELEMENT_NAME, props);
  var designTemplate  = Twx3dCommon.buildRuntimeTemplate('twx-dt-image',Twx3dCommon.new3dProps(overlay, ['scale','text']));
  return {
    elementTag: ELEMENT_NAME,

    label: '3D Multiline Label',

    category: 'ar',
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      return (projectSettings.projectType === 'eyewear');
    },

    groups: ['AUGMENTATIONS'],
    
    properties: props,

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      }
    ],

    dependencies: {
      files: ['js/multiline3D-ng.js'],
      angularModules: ['multiline3D-ng']
    },

    delegate: function () {
      let ctrl;

      this.init = function (element, widgetCtrl) {
        ctrl = widgetCtrl;
      };

      /**
       *   Calc dynamically the height of the widget so the author get a better feeling of widget demensions in runtime
       */
      this.calcHeight = function() {
        if (ctrl!=undefined) {
          let props = ctrl.properties;
          let scalefactor = 512/0.04;
          return (parseInt(props.padding.value.match(/[\^\d+]/g,).join(""))*2 + (parseInt(props.font.value.match(/[\^\d+]/g).join(""))*props.lineCount.value))/scalefactor;
        } else return 0; 
      };
      
      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // automatically adjuts the Z distance of the button from the backplate  
        if(changedProps.padding) {
          let scalefactor = 512/0.04;
          var height = (parseInt(changedProps.padding.match(/[\^\d+]/g,).join(""))*2 + (parseInt(oldProps.font.value.match(/[\^\d+]/g).join(""))*oldProps.lineCount.value))/scalefactor;
          widgetCtrl.setProp('height', height.toFixed(4));
        }
        if(changedProps.font) {
          let scalefactor = 512/0.04;
          var height = (parseInt(oldProps.padding.value.match(/[\^\d+]/g,).join(""))*2 + (parseInt(changedProps.font.match(/[\^\d+]/g).join(""))*oldProps.lineCount.value))/scalefactor;
          widgetCtrl.setProp('height', height.toFixed(4));
        }
        if(changedProps.lineCount) {
          let scalefactor = 512/0.04;
          var height = (parseInt(oldProps.padding.value.match(/[\^\d+]/g,).join(""))*2 + (parseInt(oldProps.font.value.match(/[\^\d+]/g).join(""))*changedProps.lineCount))/scalefactor;
          widgetCtrl.setProp('height', height.toFixed(4));
        }
      };
      
    },

    designTemplate: function () {
      return '<twx-dt-image id="#widgetId#" src="/extensions/images/3D Multiline Label.png" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}"></twx-dt-image>';
    },

    runtimeTemplate: function (props) {
      // To get the same results in run- and design time it's necessary to add the default scale prop back to widget ctrl
      var template3d = runtimeTemplate.replace("#widgetId#", props.widgetId).replace('>', 'sx="1" sy="1" sz="1">');
      return template3d;
    }
  };
}

twxAppBuilder.widget('twxMultiLineLabel3D', twxMultiLineLabel3D);

