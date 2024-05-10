function twxProgress3D() {
  return {
    elementTag: 'octo-progress3d',
      
    label    : '3D Progress',
    
    category : 'ar',
    groups    : ['input'],
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      return (projectSettings.projectType === 'eyewear');
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
            name: 'percentage',
           label: 'Progress (%)',
        datatype: 'number',
         default: 0,
             min: 0,
             max: 100,
 isBindingSource: false,
 isBindingTarget: true,
      },
      {
            name: 'isQuantised',
           label: 'Stepped',
        datatype: 'boolean',
 isBindingTarget: false,
         default: false,
      },      
      {
            name: 'steps',
           label: 'Number of Steps',
        datatype: 'number',
         default: 1,
             min: 1,
       isVisible: function(props) {
                    return (props.isQuantised === true);
                  },
 isBindingSource: false,
 isBindingTarget: true,
      },
      {
            name: 'nlines',
           label: 'Number of lines',
        datatype: 'number',
         default: 2,
             min: 2,
 isBindingSource: false,
 isBindingTarget: false,
       isVisible: false,
       showInput: false
      },
      {
            name: 'src',
           label: 'ves-basic-web-widgets-extension:Image',
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
      files         : ['js/progress3D-ng.js', 'images/**'],
      angularModules: ['progress3D-ng']
    },

    designTemplate: function (data, html) {
      // if we use an image, we can at least position and size (width/height) correctly. Unfortunately we lose any 3d depth cues
      return html`<twx-dt-image
        id="#widgetId#"
        src="/extensions/images/3D Progress.png"
        opacity="1"
        hidden="false"
        width="${this.me.width}"
        height="${this.me.height}"
        sx="1"
        sy="1"
        sz="1"
        x="${this.me.x}"
        y="${this.me.y}"
        z="${this.me.z}"
        rx="${this.me.rx}"
        ry="${this.me.ry}"
        rz="${this.me.rz}"
        billboard="${this.me.billboard}"
        occlude="${this.me.occlude}"
        decal="${this.me.decal}"
        shader="${this.me.shader}"
        istracked="${this.me.istracked}"
        trackingindicator="${this.me.trackingIndicator}"
        stationary="${this.me.stationary}"
      ></twx-dt-image>`;
    },
  
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var tmpl = '<div ng-progress3d id-field="' + props.widgetId + '" isholo-field='+forholo+' height-field={{me.height}} width-field={{me.width}} font-field="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" text-field={{me.text}} steps-field={{me.steps}} percentage-field={{me.percentage}} src-field={{me.src}} nlines-field={{me.nlines}} fontsize-field={{me.fontsize}} delegate-field="delegate"></div>\n';
      var ps1  = ''; // need a simple texture+fade shader
      var vs1  = ''; //
      var ctrl = '<twx-dt-image id="' + props.widgetId + '"'+ 
      'src="extensions/images/toggleMissing.png" '+ // we need to render onto something...
      'height="{{me.height}}" width="{{me.width}}" '+
      'x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" '+
      'shader="{{me.shader}}" interactable-hint="true" decal="false" pivot="5" sx="1" sy="1" sz="1"/>\n';
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

twxAppBuilder.widget('twxProgress3D', twxProgress3D);
