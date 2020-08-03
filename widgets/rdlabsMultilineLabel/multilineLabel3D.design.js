function twxMultiLineLabel3D() {
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
      name: 'padding',
      label: 'ves-ar-extension:Padding',
      datatype: 'string',
      default: '20',
      isBindingTarget: true,
      sortOrder: 5
    }
  ];

  var setdefault = Twx3dCommon.getWidthProperty();
  setdefault.default = "0.1";
  properties.push(setdefault);
  setdefault = Twx3dCommon.getHeightProperty();
  //setdefault.default = "0.1";
  properties.push(setdefault);
  properties.push(Twx3dCommon.getPivotProperty());

  var overlay = Twx3dCommon.arrayToMap(properties);
  overlay.experimentalOneSided = Twx3dCommon.getOneSidedProperty();
  overlay.experimentalOneSided.default = true;
  //overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/Gate.png');

  var props = Twx3dCommon.new3dProps(overlay);

  var runtimeTemplate = Twx3dCommon.buildRuntimeTemplate('twx-dt-image', props);
  return {
    elementTag: 'twx-multilinelabel3D',

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
      files: ['js/multiline3D-ng.js', 'images/navfeet.png'],
      angularModules: ['multiline3D-ng']
    },

    designTemplate: function () {
      return runtimeTemplate;
    },

    runtimeTemplate: function (props) {
      var template3d = runtimeTemplate.replace("#widgetId#", props.widgetId).replace('>', ' ng-multiline3d>').replace('src="{{me.src}}"', 'src="extensions/images/navfeet.png"');
      return template3d;
    }
  };
}

twxAppBuilder.widget('twxMultiLineLabel3D', twxMultiLineLabel3D);