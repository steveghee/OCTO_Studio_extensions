function twxPinger() {
  return {
    elementTag: 'twx-pinger',

    label: 'Pinger',
    
    category : 'ar',

    properties: [
      {
            name: 'color',
           label: 'Color',
        datatype: 'select',
         default: "0,1,0",
 isBindingTarget: false,
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
            name: 'radius',
           label: 'Radius',
        datatype: 'number',
         default: 0.05,
             min: 0.01,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rate',
           label: 'Pulse rate (per second)',
        datatype: 'number',
         default: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rings',
           label: 'Density (# rings)',
        datatype: 'number',
         default: 5,
             min: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'direction',
           label: 'Outward pulse',
        datatype: 'boolean',
         default: false,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'src',
           label: 'Indicator',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/pingerHand.png',
 isBindingTarget: true,
      isVisible : true
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
      {
            name: 'decal',
           label: 'ves-ar-extension:Always on top',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       sortOrder: 230
      },
      {
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'height',
           label: 'ves-ar-extension:Height',
        datatype: 'string',
         default: '0.1',
       isVisible: false
      },
      {
            name: 'width',
           label: 'ves-ar-extension:Width',
        datatype: 'string',
         default: '0.1',
       isVisible: false
      },
   
    ],

    events: [
      {
        name: 'click',
        label: 'ves-basic-web-widgets-extension:Click'
      },
    ],

    dependencies: {
      files         : ['images/pingerBlank.png','images/pingerHand.png'],
    },

    designTemplate: function (data, html) {
      return html`<twx-dt-image
        id="#widgetId#"
        src="/extensions/images/Pinger.png"
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
        billboard="false"
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
      var vs0 = '<script name="pingergl" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vertexTexCoord - 0.5; } </script> ';
      var ps0 = '<script name="pingergl" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec2 texcoord; uniform float rings; uniform float fade; uniform float rate; uniform float direction; uniform float r; uniform float g; uniform float b; uniform float tick; uniform sampler2D texSampler2D; uniform vec4 surfaceColor; void main() { float viz = 1. - fade; float wrap = 2. * PI; float speed = (direction < 0.) ? 1.+rate : -1.-rate; float o= speed * mod(tick,wrap); float l=length(texcoord)*PI; float freq = max(rings * 2.,1.); float fr=o + (l * freq); float a1=sin(fr); float a2=clamp(cos(l),0.,1.); float a = viz * a1 * a2; vec3 c = vec3(r,g,b); if (length(c) == 0.) c=vec3(0.,1.,0.); vec4 tx1 = texture2D(texSampler2D,(texcoord + 0.5)); if (tx1.a >= 1.) { c = tx1.rgb; a = tx1.a; } if (a<0.) discard; else gl_FragColor=vec4(c,a); } </script>';
      var vs1 = '<script name="pingerhl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) {  float4x4 model;  float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) {  float4 diffuseColor;  bool twoSided; }; cbuffer ViewProjectionConstantBuffer : register(b2) {  float4x4 viewProjection[2];  float4x4 viewInverse;  float4x4 viewRotationInverse; }; struct VertexShaderInput {  half4 pos : POSITION;  half4 normal : NORMAL;  half2 texcoord: TEXCOORD;  uint instId : SV_InstanceID; }; struct VertexShaderOutput {  half4 pos : SV_POSITION;  half2 tcoord : TEXCOORD0;  uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) {  VertexShaderOutput output;  half4 pos = half4(input.pos);  int idx = input.instId % 2;  pos = mul(pos, model);  output.tcoord = input.texcoord - 0.5;  pos = mul(pos, viewProjection[idx]);  output.pos = (half4)pos;  output.rtvId = idx;  return output; } </script>';
      var ps1 = '<script name="pingerhl" type="x-shader/x-fragment"> Texture2D Texture1 : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) {  float4 highlightColor;  bool useTexture;  bool useLight;  float transparency;  int pad; };  cbuffer RenderConstantBuffer : register(b1) {  float tick;  float3 ding; }; struct PixelShaderInput {  min16float4 pos : SV_POSITION;  float2 tcoord: TEXCOORD0; }; cbuffer TMLDefinedConstants : register(b10) {  float direction;  float fade;  float rings;  float rate;  float r;  float g;  float b; }; min16float4 main(PixelShaderInput input) : SV_TARGET {  const float PI = 3.1415926;  float4 color;  float2 center = float2(.5,.5);   half4 texture1Color = Texture1.Sample(Sampler, input.tcoord + center);  float viz = 1. - fade;   float wrap = 2. * PI;   float speed = (direction < 0.) ? 1. + rate : -1. - rate;  float o = speed * tick % wrap;  float l = length(input.tcoord)*PI;  float freq = max(rings * 2.,1.);  float fr = o + (l * freq);  float a1 = sin(fr);  float a2 = clamp(cos(l),0.,1.);  float a = a1 * a2;  color = half4(r,g,b,a);  if (length(color.rgb) == 0.) color=half4(0.,1.,0.,a);  color = texture1Color.a == 1. ? texture1Color : viz * color;  if (color.a < 0.01) discard;  return min16float4(color.rgb, color.a); } </script>';
      
      //cool way of doing it, but only works on tablet (not hololens)
      //var tmpl  = '<twx-dt-3dobject id="' + props.widgetId + '" class="ng-hide PingerWidget ' + '" ';
      //var props = 'hidden={{me.disabled}} x={{me.x}} y={{me.y}} z={{me.z}} rx={{me.rx}} ry={{me.ry}} rz={{me.rz}} sx={{me.radius*2}} sy={{me.radius*2}} sz={{me.radius*2}}';
      //var geom  = 'shader="pinger;rings f {{me.rings}};rate f {{(me.disabled?-1:me.rate)}};fade f {{(me.disabled?1:0)}};direction f {{me.direction?1:-1}};r f {{me.color.split(\',\')[0]}};g f {{me.color.split(\',\')[1]}};b f {{me.color.split(\',\')[2]}}" vertices="[-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0]" normals="[]" texcoords="[-0.5,-0.5, 0.5,-0.5, 0.5,0.5, -0.5,0.5]" indexes="[0,1,2,0,2,3]" color="{{me.color}}"></twx-dt-3dmodel>';
      
      var tmpl  = '<twx-dt-image id="' + props.widgetId + '"';
      var props = 'hidden="{{!me.visible}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" width="{{me.radius*2}}" height="{{me.radius*2}}" sx="1" sy="1" sz="1" pivot="5" decal="{{me.decal}}"';
      var geom  = 'ng-src="{{me.src}}" src="" shader="'+(forholo?'pingerhl':'pingergl')+';rings f {{me.rings}};rate f {{(me.disabled?-1:me.rate)}};fade f {{(me.disabled?1:0)}};direction f {{me.direction?1:-1}};r f {{me.color.split(\',\')[0]}};g f {{me.color.split(\',\')[1]}};b f {{me.color.split(\',\')[2]}}"'+' ng-click="app.fn.isTrue(me.disabled) ? fireEvent() : fireEvent(\'click\');"></twx-dt-image>';
      return (forholo?vs1+ps1:vs0+ps0)+tmpl+props+geom; 
    },
  
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // adjust the width/height based on the radius setting  
        if(changedProps.radius) {
          let newScale = 2 * changedProps.radius;
          widgetCtrl.setProp('width',  newScale.toFixed(4));
          widgetCtrl.setProp('height', newScale.toFixed(4));
        }
        // a blank (none image) pinger makes no sense, so we dont allow it 
        if(changedProps.src === "") {
          widgetCtrl.setProp('src','../../extensions/images/pingerBlank.png');
        }
      };
      return this;
    }

  }
}

twxAppBuilder.widget('twxPinger', twxPinger);
