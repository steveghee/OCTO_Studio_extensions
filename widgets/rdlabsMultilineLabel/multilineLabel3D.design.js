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
      tFrag: "linecount={{me.lineCount}} height={{ctrl.delegate.calcHeight()}}",//"height={{calcHeight()}}",//"height={{(parseInt(me.padding.replace(/[\^\d]/g,''))*2)*(1.2*parseInt(me.font.replace(/[\^\d]/g,''))*me.lineCount)/(1024/me.width)}}",
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
  overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/Gate.png');

  var props = Twx3dCommon.new3dProps(overlay, ['scale']);


  var runtimeTemplate = Twx3dCommon.buildRuntimeTemplate('twx-dt-multilinelabel', props);
  var designTemplate = Twx3dCommon.buildRuntimeTemplate('twx-dt-image',Twx3dCommon.new3dProps(overlay, ['scale','text']));
  return {
    elementTag: 'twx-dt-multilinelabel',

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

    delegate: function () {
      let ctrl;

      this.init = function (element, widgetCtrl) {
        ctrl = widgetCtrl;
      };

      /**
       * @returns {Array} Returns the paths for each of the resources this widget references.  Will be used to remove
       *         the resources when the widget is removed.
       */
      this.calcHeight = function() {
        let props = ctrl.properties;
        return (parseInt(props.padding.value.match(/[\^\d+]/g,).join(""))*2+1.2*parseInt(props.font.value.match(/[\^\d+]/g).join(""))*props.lineCount.value)/(1024/parseFloat(props.width.value));
      };

    },

    designTemplate: function () {
      return designTemplate//.replace('width="{{me.width}}"', 'height="{{(me.padding*2)*(1.2*me.font.replace( /[^\d]/g,""))*me.lineCount)/(1024/me.width)}}" width="{{me.width}}"');
    },

    runtimeTemplate: function (props) {
      var template3d = runtimeTemplate.replace("#widgetId#", props.widgetId).replace('src="{{me.src}}"', 'src="extensions/images/navfeet.png" sx="1" sy="1" sz="1"');
      return template3d;
    }
  };
}

twxAppBuilder.widget('twxMultiLineLabel3D', twxMultiLineLabel3D);