function twxMultiLineLabel3D() {
  var ELEMENT_NAME = 'twx-dt-ext-multilinelabel';
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
      name: 'src',
      label: 'Background Image',
      datatype: 'string',
      resource_image: true,
      allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif', '.bmp'],
      default: '/extensions/images/MultilineDummy.png',
      isBindingTarget: false,
      isVisible: false,
      sortOrder: 2
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
      default: 'rgba(0, 0, 0, 1);',
      isBindingTarget: true,
      sortOrder: 4
    },
    {
      name: 'lineCount',
      label: 'Max Lines',
      datatype: 'number',
      tFrag: 'linecount="{{me.lineCount}}" height="{{ctrl.delegate.calcHeight()}}"',
      default: 5,
      isBindingTarget: true,
      sortOrder: 5
    },
    {
      name: 'padding',
      label: 'ves-ar-extension:Padding',
      datatype: 'string',
      default: '20px',
      isBindingTarget: true,
      sortOrder: 6
    }
  ];

  properties.push(Twx3dCommon.getPivotProperty());

  var overlay = Twx3dCommon.arrayToMap(properties);
  overlay.experimentalOneSided = Twx3dCommon.getOneSidedProperty();
  overlay.experimentalOneSided.default = true;
  overlay.width = Twx3dCommon.getWidthProperty();
  overlay.width.default = 0.1;

  var props = Twx3dCommon.new3dProps(overlay, ['scale']);


  var runtimeTemplate = Twx3dCommon.buildRuntimeTemplate(ELEMENT_NAME, props);
  var designTemplate = Twx3dCommon.buildRuntimeTemplate('twx-dt-image',Twx3dCommon.new3dProps(overlay, ['scale','text']));
  return {
    elementTag: ELEMENT_NAME,

    label: '3D Multiline Label',

    category: 'ar',

    groups: ['Augmentations'],

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
        let props = ctrl.properties;
        return (parseInt(props.padding.value.match(/[\^\d+]/g,).join(""))*2+1.2*parseInt(props.font.value.match(/[\^\d+]/g).join(""))*props.lineCount.value)/(1024/parseFloat(props.width.value));
      };

    },

    designTemplate: function () {
      return designTemplate;
    },

    runtimeTemplate: function (props) {
      // To get the same results in run- and design time it's necessary to add the default scale prop back to widget ctrl
      var template3d = runtimeTemplate.replace("#widgetId#", props.widgetId).replace('>', 'sx="1" sy="1" sz="1">');
      return template3d;
    }
  };
}

twxAppBuilder.widget('twxMultiLineLabel3D', twxMultiLineLabel3D);