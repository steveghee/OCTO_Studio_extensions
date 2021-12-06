function twxZoi() {
  return {
    elementTag: 'octo-zoi',
      
    label    : 'Zones of Interest',
    
    category : 'ar',
    groups   : ['Navigation'],
    
    properties: [
      {
            name: 'radius',
           label: 'Radius (m)',
        datatype: 'Number',
         default: 0.5,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
       isVisible: true
      },
      {
            name: 'floor',
           label: 'Floor Offset (m)',
        datatype: 'Number',
         default: 0,
 isBindingTarget: true,
       showInput: false,
       isVisible: false
      },
      {
            name: 'zoiSrc',
           label: 'Baseplate model',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.pvz'],
         default: '../../extensions/images/zoiCylinder.pvz',
 isBindingTarget: true,
      isVisible : false
      },
      {
            name: 'zoiColor',
           label: 'Color',
        datatype: 'select',
         default: "1,1,0",
 isBindingTarget: true,
       isVisible: true,
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
            name: 'cutoff',
           label: 'Cutoff distance (m)',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: false,
       isVisible: false
      },
      {
            name: 'auto',
           label: 'Auto-cutoff',
        datatype: 'boolean',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true
      },
      {
            name: 'zoidata',
           label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: true,
       showInput: false,
       isVisible: true
      },
      {
            name: 'value',
           label: 'Value',
        datatype: 'infotable',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false,
      }
    ],

    events: [
      {
        name: 'marked',
        label: 'Marked'
      },
      {
        name: 'arrived',
        label: 'Arrived'
      },
      {
        name: 'departed',
        label: 'Departed'
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
      files         : ['js/matrix.js', 'js/zoihelper.js', 'js/zoi-ng.js', 'images/zoiCylinder.pvz', 'images/loading.png'],
      angularModules: ['zoi-ng']
    },


    designTemplate: function () {
      return '<twx-dt-model id="#widgetId#" src="../extensions/images/zoiCylinder.pvz" opacity="1" hidden="false" scale="{{me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" ></twx-dt-model>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      //zoipinger shader (holo and tablet)
      var vs0g  = '<script name="zoipinger" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vec2(1.) - vertexTexCoord; } </script>';
      var ps0g  = '<script name="zoipinger" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec2 texcoord; uniform float rings; uniform float fade; uniform float rate; uniform float direction; uniform float r; uniform float g; uniform float b; uniform float tick; uniform sampler2D texSampler2D; uniform vec4 surfaceColor; void main() { float viz = 1. - fade; float wrap = 2. * PI; float speed = (direction < 0.) ? 1.+rate : -1.-rate; float o= speed * mod(tick,wrap); float l=length(texcoord)*PI; float freq = max(rings * 2.,1.); float fr=o + (l * freq); float a1=sin(fr); float a2=clamp(cos(l),0.,1.); float a = viz * a1 * a2; vec3 c = vec3(r,g,b); if (length(c) == 0.) c=vec3(0.,1.,0.); vec4 tx1 = vec4(0.); float v2 = (texcoord.y + 0.5) / 2.; if (tx1.a >= 1.) { c = tx1.rgb; a = viz; } if (a<0.) discard; else gl_FragColor=vec4(c*v2,v2); } </script>';
      //we use pinger shader - shouldnt harm to redeclare it
      var vs1g  = '<script name="pingergl" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vertexTexCoord - 0.5; } </script> ';
      var ps1g  = '<script name="pingergl" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec2 texcoord; uniform float rings; uniform float fade; uniform float rate; uniform float direction; uniform float r; uniform float g; uniform float b; uniform float tick; uniform sampler2D texSampler2D; uniform vec4 surfaceColor; void main() { float viz = 1. - fade; float wrap = 2. * PI; float speed = (direction < 0.) ? 1.+rate : -1.-rate; float o= speed * mod(tick,wrap); float l=length(texcoord)*PI; float freq = max(rings * 2.,1.); float fr=o + (l * freq); float a1=sin(fr); float a2=clamp(cos(l),0.,1.); float a = viz * a1 * a2; vec3 c = vec3(r,g,b); if (length(c) == 0.) c=vec3(0.,1.,0.); vec4 tx1 = texture2D(texSampler2D,(texcoord + 0.5)); if (tx1.a >= 1.) { c = tx1.rgb; a = tx1.a; } if (a<0.) discard; else gl_FragColor=vec4(c,a); } </script>';
      
      //TODO: hololens versions
      var vs0h  = '<script name="zoipinger" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) {  float4x4 model;  float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) {  float4 diffuseColor;  bool twoSided; }; cbuffer ViewProjectionConstantBuffer : register(b2) {  float4x4 viewProjection[2];  float4x4 viewInverse;  float4x4 viewRotationInverse; }; struct VertexShaderInput {  half4 pos : POSITION;  half4 normal : NORMAL;  half2 texcoord: TEXCOORD;  uint instId : SV_InstanceID; }; struct VertexShaderOutput {  half4 pos : SV_POSITION;  half2 tcoord : TEXCOORD0;  uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) {  VertexShaderOutput output;  half4 pos = half4(input.pos);  int idx = input.instId % 2;  pos = mul(pos, model);  output.tcoord = input.texcoord - 0.5;  pos = mul(pos, viewProjection[idx]);  output.pos = (half4)pos;  output.rtvId = idx;  return output; } </script>\n';
      var ps0h  = '<script name="zoipinger" type="x-shader/x-fragment"> Texture2D Texture1 : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) {  float4 highlightColor;  bool useTexture;  bool useLight;  float transparency;  int pad; };  cbuffer RenderConstantBuffer : register(b1) {  float tick;  float3 ding; }; struct PixelShaderInput {  min16float4 pos : SV_POSITION;  float2 tcoord: TEXCOORD0; }; cbuffer TMLDefinedConstants : register(b10) {  float direction;  float fade;  float rings;  float rate;  float r;  float g;  float b; }; min16float4 main(PixelShaderInput input) : SV_TARGET {  const float PI = 3.1415926;  float4 color;  float2 center = float2(.5,.5);   half4 texture1Color = Texture1.Sample(Sampler, input.tcoord + center);  float viz = 1. - fade;   float wrap = 2. * PI;   float speed = (direction < 0.) ? 1. + rate : -1. - rate;  float o = speed * tick % wrap;  float l = length(input.tcoord)*PI;  float freq = max(rings * 2.,1.);  float fr = o + (l * freq);  float a1 = sin(fr);  float a2 = clamp(cos(l),0.,1.);  float a = a1 * a2;  color = half4(r,g,b,a);  if (length(color.rgb) == 0.) color=half4(0.,1.,0.,a);  color = texture1Color.a == 1. ? texture1Color : viz * color;  if (color.a < 0.01) discard;  return min16float4(color.rgb, color.a); } </script>\n';
      var shade = forholo ? vs0h+ps0h : vs0g+ps0g+vs1g+ps1g;
      
      var tml1 = '<div ng-repeat="obj in zoihelper.zois"><twx-dt-model id="{{obj.objid}}" x="{{obj.position.v[0]}}" y="0" z="{{obj.position.v[2]}}" opacity="0.7" rx="0" ry="0" rz="0" src="{{obj.modelsrc}}"  hidden="true" shader="zoipinger"></twx-dt-model></div>';                         
      var tml2 = '<div ng-repeat="obj in zoihelper.zois"><twx-dt-image id="{{obj.imgid}}" x="{{obj.position.v[0]}}" y="2" z="{{obj.position.v[2]}}" opacity="1.0" rx="0" ry="0" rz="0" height="0.25" width="0.25" src="{{obj.imagesrc}}"  billboard="false"  hidden="true" shader="pingergl;r f 0;g f 1;b f 0;direction f 1;rate f 3"></twx-dt-model></div>';                         
      var ctrl = '<div ng-zoi id-field="' + props.widgetId + '" isholo-field=' + forholo +
                 ' extent-field={{me.radius}} disabled-field={{me.disabled}} value-field="me.value"'+
                 ' auto-field={{me.auto}} cutoff-field={{me.cutoff}} floor-field={{me.floor}} zoidata-field="me.zoidata"'+
                 ' src-field={{me.zoiSrc}} color-field={{me.zoiColor}} delegate-field="delegate"></div>\n';
      return ctrl+shade+tml1+tml2;
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
      
      //
      // called on init!
      // lets force enabletrackingevents ON
      //
      this.init = function(element, widgetCtrl) {
        let view = widgetCtrl.element().closest('twx-dt-view')
        var root = angular.element(view).data('_widgetController');
        //if (root != undefined)
        //  var ete = root.getProp('enabletrackingevents');
        if (root != undefined)
          root.setProp('enabletrackingevents', true);
      }
      
      this.widgetCreated = function(widgetCtrl) {
      }
      
      this.widgetAdded = function(widgetCtrl, dropTarget) {
      }
      
      //
      // called when a widgets properties are altered
      //
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
      /*          
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
      */
      };

      return this;
    },

  }
}

twxAppBuilder.widget('twxZoi', twxZoi);