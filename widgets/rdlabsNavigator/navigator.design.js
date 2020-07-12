function twxNavigator() {
  return {
    elementTag: 'twx-navigator',
      
    label    : 'Navigator',
    
    category : 'ar',
    groups   : ['Navigation'],
    
    properties: [
      {
            name: 'extent',
           label: 'Offset',
        datatype: 'Number',
         default: 0.45,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: false,
       isVisible: false
      },
      {
            name: 'floor',
           label: 'Floor Offset',
        datatype: 'Number',
         default: 0,
 isBindingTarget: true,
       showInput: false,
       isVisible: false
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
      //
      // if we are targeting tablet devices, we show the following
      //
      {
            name: 'device',
           label: 'Device',
        datatype: 'select',
         default: '',
 isBindingTarget: true,
       isVisible: function(props, $scope) {
                    let projectSettings = $scope.$root.projectSettings || {};
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
      //
      // otherwise, if the target is hololens, we show a different control
      //
      {
            name: 'holotarget',
           label: 'Holo target',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.pvz'],
 isBindingTarget: true,
       isVisible: function(props, $scope) {
                    let projectSettings = $scope.$root.projectSettings || {};
                    return (projectSettings.projectType === 'eyewear');
                  },
      },
      
      //
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
            name: 'feetColor',
           label: 'Feet Color',
        datatype: 'select',
         default: "0,1,0",
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
            name: 'auto',
           label: 'Auto-cutoff',
        datatype: 'boolean',
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
      {
            name: 'poidata',
           label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: false,
       isVisible: true
      },
      {
            name: 'poi',
           label: 'Selected',
        datatype: 'Number',
         default: 0,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
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
        name: 'activated',
        label: 'Activated'
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
      files         : ['js/matrix.js', 'js/navigationHelper.js', 'js/navigator-ng.js', 'images/navipad.pvz', 'images/navphonl.pvz', 'images/navphonp.pvz', 'images/navhead.pvz', 'images/navfeet.png', 'images/navSphere.pvz'],
      angularModules: ['navigator-ng']
    },


    designTemplate: function () {
      return '<twx-dt-model id="#widgetId#" src="../extensions/images/ipad.pvz" opacity="1" hidden="false" scale="{{me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" ></twx-dt-model><div class="tetheredWidget"></div>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      //navpinger shader (holo and tablet)
      var vs0g  = '<script name="navpinger" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vertexTexCoord - 0.5; } </script>\n';
      var ps0g  = '<script name="navpinger" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec2 texcoord; uniform float rings; uniform float fade; uniform float rate; uniform float direction; uniform float r; uniform float g; uniform float b; uniform float tick; uniform sampler2D texSampler2D; uniform vec4 surfaceColor; void main() { float viz = 1. - fade; float wrap = 2. * PI; float speed = (direction < 0.) ? 1.+rate : -1.-rate; float o= speed * mod(tick,wrap); float l=length(texcoord)*PI; float freq = max(rings * 2.,1.); float fr=o + (l * freq); float a1=sin(fr); float a2=clamp(cos(l),0.,1.); float a = viz * a1 * a2; vec3 c = vec3(r,g,b); if (length(c) == 0.) c=vec3(0.,1.,0.); vec4 tx1 = texture2D(texSampler2D,(texcoord + 0.5)); if (tx1.a >= 1.) { c = tx1.rgb; a = viz; } if (a<0.) discard; else gl_FragColor=vec4(c,a); } </script>\n';
      var vs0h  = '<script name="navpinger" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) {  float4x4 model;  float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) {  float4 diffuseColor;  bool twoSided; }; cbuffer ViewProjectionConstantBuffer : register(b2) {  float4x4 viewProjection[2];  float4x4 viewInverse;  float4x4 viewRotationInverse; }; struct VertexShaderInput {  half4 pos : POSITION;  half4 normal : NORMAL;  half2 texcoord: TEXCOORD;  uint instId : SV_InstanceID; }; struct VertexShaderOutput {  half4 pos : SV_POSITION;  half2 tcoord : TEXCOORD0;  uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) {  VertexShaderOutput output;  half4 pos = half4(input.pos);  int idx = input.instId % 2;  pos = mul(pos, model);  output.tcoord = input.texcoord - 0.5;  pos = mul(pos, viewProjection[idx]);  output.pos = (half4)pos;  output.rtvId = idx;  return output; } </script>\n';
      var ps0h  = '<script name="navpinger" type="x-shader/x-fragment"> Texture2D Texture1 : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) {  float4 highlightColor;  bool useTexture;  bool useLight;  float transparency;  int pad; };  cbuffer RenderConstantBuffer : register(b1) {  float tick;  float3 ding; }; struct PixelShaderInput {  min16float4 pos : SV_POSITION;  float2 tcoord: TEXCOORD0; }; cbuffer TMLDefinedConstants : register(b10) {  float direction;  float fade;  float rings;  float rate;  float r;  float g;  float b; }; min16float4 main(PixelShaderInput input) : SV_TARGET {  const float PI = 3.1415926;  float4 color;  float2 center = float2(.5,.5);   half4 texture1Color = Texture1.Sample(Sampler, input.tcoord + center);  float viz = 1. - fade;   float wrap = 2. * PI;   float speed = (direction < 0.) ? 1. + rate : -1. - rate;  float o = speed * tick % wrap;  float l = length(input.tcoord)*PI;  float freq = max(rings * 2.,1.);  float fr = o + (l * freq);  float a1 = sin(fr);  float a2 = clamp(cos(l),0.,1.);  float a = a1 * a2;  color = half4(r,g,b,a);  if (length(color.rgb) == 0.) color=half4(0.,1.,0.,a);  color = texture1Color.a == 1. ? texture1Color : viz * color;  if (color.a < 0.01) discard;  return min16float4(color.rgb, color.a); } </script>\n';
      //fogged shader for the tunnel (not hololens)
      var vs1g  = '<script name="navfogged" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texCoord; varying float dist; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 modelMatrix; uniform mat4 normalMatrix; void main() { vec4 vertexNormal=vec4(0.,0.,1.,0.); vec4 vp = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; texCoord = vertexTexCoord; vec3 vv = vec3(modelViewMatrix * vp); dist = length(vv); } </script>\n';
      var ps1g  = '<script name="navfogged" type="x-shader/x-fragment"> precision mediump float; varying vec2 texCoord; varying float dist; uniform sampler2D img; uniform float fade; uniform float r; uniform float g; uniform float b; uniform vec4 surfaceColor; void main(void) { vec3 fcol = vec3(r,g,b); if (length(fcol) <= 0.) fcol=vec3(0.92,0.87,0.); vec3 tcol = .5 * fcol; vec4 tx = mix(vec4(fcol,.5),vec4(tcol,.5),dist/4.); float dd = 1. - smoothstep(1.5,.6,dist); float aa = dd * tx.a; vec4 wt = vec4(1.,1.,1.,aa); if (aa <= 0.) discard; else gl_FragColor = mix(wt,tx,dd); } </script>\n';
      //fogged+lit (for heads, devices)      
      var vs2g  = '<script name="navfoggedLit" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; varying vec3 vertex; varying vec3 normal; varying float dist; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 modelMatrix; uniform mat4 normalMatrix; void main() { vec4 vp = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; normal = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); vec3 vv = vec3(modelViewMatrix * vp); dist = length(vv); vertex = vp.xyz; } </script>\n';
      var ps2g  = '<script name="navfoggedLit" type="x-shader/x-fragment"> precision mediump float; varying vec3 vertex; varying vec3 normal; varying float dist; uniform float fade; uniform vec4 surfaceColor; const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0); const vec4 specColor = vec4(0.05, 0.05, 0.05, 1.0); void main(void) { vec4 color = surfaceColor; vec3 lightPos = vec3(1.,1.,1.); vec3 lightDir = -normalize(lightPos); vec3 finalNormal = normalize(normal); float lambertian = dot(lightDir,finalNormal); float specular = 0.0; vec3 viewDir = normalize(-vertex); if (lambertian < 0.0) finalNormal = - finalNormal; vec3 reflectDir = reflect(-lightDir, finalNormal); float specAngle = max(dot(reflectDir, viewDir), 0.0); specular = pow(specAngle, 4.0); color = ambientColor * color +	 color * abs(lambertian) + 		 specColor * specular; color.a = 1. - smoothstep(1.5,.6,dist); gl_FragColor=vec4(color); } </script>\n';
      var vs2h  = '<script name="foggedLit" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; half2 texcoord: TEXCOORD; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; half4 color: COLOR0; half4 world :POSITION; half2 xray : TEXCOORD0; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); output.world = (half4)pos; half4 eye = half4(0., 0., 0., 1.); half3 I = normalize(pos - mul(eye, viewInverse)).xyz; half3 N = normalize(mul(input.normal, inverse).xyz); float dp = dot(-N, I); output.xray = half2(dp, 0.); pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.color = (half4)diffuseColor; output.rtvId = idx; return output; } </script>\n';
      var ps2h  = '<script name="foggedLit" type="x-shader/x-fragment"> cbuffer ShaderConstantBuffer : register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; struct PixelShaderInput { half4 pos : SV_POSITION; half4 color : COLOR0; half4 world: POSITION; half2 xray : TEXCOORD0; }; min16float4 main(PixelShaderInput input) : SV_TARGET { min16float4 color = min16float4(0.7,0.7,0.7,1.0); float dp = input.xray.x; float opacity = abs(dp); float xray = 1.0 - pow(opacity,3.); float gz = 1.0 - clamp((input.pos.z / input.pos.w) - 0.5, 0., 1.); min16float4 finalShadedColor = min16float4(saturate(gz * xray * color).xyz, 1.0); return finalShadedColor; } </script>\n';
      var shade = forholo ? vs0h+ps0h          +vs2h+ps2h
                          : vs0g+ps0g+vs1g+ps1g+vs2g+ps2g;
      var tml1 = '<div ng-repeat="obj in helper.tunnel_objects"><twx-dt-model id="{{obj.name}}" x="0" y="0" z="0" opacity="1.0" rx="0" ry="0" rz="0" src="{{obj.src}}" hidden="true" shader="fogged"></twx-dt-model></div>\n';
      var tml2 = '<div ng-repeat="obj in helper.nav_objects"><twx-dt-model id="{{obj.name}}" x="0" y="0" z="0" opacity="1.0" rx="0" ry="0" rz="0" sx="1" sy="1" sz="1" src="{{obj.src}}" hidden="true"></twx-dt-model></div>\n';
      var tml3 = '<div ng-repeat="obj in helper.nav_images"><twx-dt-image id="{{obj.name}}" x="0" y="0" z="0" opacity="1.0" rx="-90" ry="0" rz="0" sx="1" sy="1" sz="1" height="0.5" width="0.5" src="{{obj.src}}" hidden="true"></twx-dt-image></div>\n';
      var ctrl = '<div ng-navigator class="navigatorWidget" id-field="' + props.widgetId + '" isholo-field=' + forholo +
      ' step-field={{me.steps}} shader-field="me.shader" extent-field={{me.extent}} visible-field={{me.visible}}'+
      ' auto-field={{me.auto}} cutoff-field={{me.cutoff}} floor-field={{me.floor}} poidata-field="me.poidata" poi-field={{me.poi}} value-field="me.value" '+
      ' head-field={{me.head}} feet-field={{me.head}} feetsrc-field={{me.feetSrc}} '+(forholo?'device-field={{me.holotarget}}':'device-field={{me.device}}')+
      ' tunnelcolor-field={{me.tunnelColor}} feetcolor-field={{me.feetColor}} delegate-field="delegate"></div>\n';
      return shade+tml1+tml2+tml3+ctrl;
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

twxAppBuilder.widget('twxNavigator', twxNavigator);