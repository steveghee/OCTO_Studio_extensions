function twxDisplayPanel3D() {
  return {
    elementTag: 'twx-displaypanel3d',
      
    label    : '3D Display Panel',
    
    category : 'ar',
    groups    : ['input'],
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo && (projectSettings.projectType === 'eyewear');
    },

    properties: [
      {
            name: 'text',
           label: 'ves-ar-extension:Text',
        datatype: 'string',
         default: 'Change me',
 isBindingTarget: true,
      },
      {
            name: 'nlines',
           label: 'Number of lines',
        datatype: 'number',
         default: 1,
             min: 1,
 isBindingSource: false,
 isBindingTarget: false,
       showInput: true
      },
      {
            name: 'src',
           label: 'ves-basic-web-widgets-extension:Image when Pressed',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '',
 isBindingTarget: true,
      },
      {
            name: 'height',
           label: 'ves-ar-extension:Height',
        datatype: 'string',
        default: '0.04',
       isVisible: false
      },
      {
            name: 'width',
           label: 'ves-ar-extension:Width',
        datatype: 'string',
         default: '0.1'
      },
      {
            name: 'fontsize',
           label: 'Font Size',
        datatype: 'select',
         default: "70",
 isBindingTarget: false,
          editor: 'select',
         options: [
            {label: 'Small'    , value: "70"},
            {label: 'Large'    , value: "120"}
                  ],
      },
      {
            name: 'fontColor',
           label: 'ves-ar-extension:Font Color',
        datatype: 'color',
         default: 'rgba(255, 255, 255, 1);',
 isBindingTarget: true,
      },
      {
            name: 'x',
           label: 'ves-ar-extension:X Coordinate',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'y',
           label: 'ves-ar-extension:Y Coordinate',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'z',
           label: 'ves-ar-extension:Z Coordinate',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rx',
           label: 'ves-ar-extension:X Rotation',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'ry',
           label: 'ves-ar-extension:Y Rotation',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rz',
           label: 'ves-ar-extension:Z Rotation',
        datatype: 'number',
         default: 0,  
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'visible',
           label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
         default: true,
 isBindingTarget: true
      },

    ],

    events: [
    ],

    services: [
    ],
    
    dependencies: {
      files         : ['js/panel3D-ng.js', 'images/**'],
      angularModules: ['panel3D-ng']
    },
  
    designTemplate: function () {
      // if we use an image, we can at least position and size (width/height) correctly. Unfortunately we lose any 3d depth cues
      return '<twx-dt-image id="#widgetId#" src="/extensions/images/3D Display Panel.png" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" shader="{{me.shader}}" istracked="{{me.istracked}}" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}"></twx-dt-image>';
      
    },
  
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var tmpl = '<div ng-panel3d class="ng-hide panel3DWidget ' + props.class + '" id-field="' + props.widgetId + '" isholo-field='+forholo+' height-field={{me.height}} width-field={{me.width}} font-field="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" text-field={{me.text}} src-field={{me.src}} nlines-field={{me.nlines}} fontsize-field={{me.fontsize}} delegate-field="delegate"></div>';
      var ps1  = ''; // need a simple texture+fade shader
      var vs1  = ''; //
      var ctrl = '<twx-dt-image id="' + props.widgetId + '" class="image3dWidget" '+ 
      'src="extensions/images/toggleMissing.png" '+ // we need to render onto something...
      'height="{{me.height}}" width="{{me.width}}" '+
      'x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" '+
      'shader="{{me.shader}}" interactable-hint="true" decal="false" pivot="5" sx="1" sy="1" sz="1"/>';
      return tmpl+ps1+vs1+ctrl;
    },
    
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // automatically adjuts the Z distance of the button from the backplate  
        if(changedProps.nlines) {
          let nlines      = changedProps.nlines;
          let fontsize    = (oldProps.fontsize) ? oldProps.fontsize.value : 70;
          var scalefactor = 512/0.04;
          var height      = (70 + (nlines * fontsize)) / scalefactor;
          widgetCtrl.setProp('height', height.toFixed(4));
        }
        if(changedProps.fontsize) {
          let nlines      = (oldProps.nlines) ? oldProps.nlines.value : 1;
          let fontsize    = changedProps.fontsize;
          var scalefactor = 512/0.04;
          var height      = (70 + (nlines * fontsize)) / scalefactor;
          widgetCtrl.setProp('height', height.toFixed(4));
        }
      };

      return this;
    }
  }
}

twxAppBuilder.widget('twxDisplayPanel3D', twxDisplayPanel3D);
