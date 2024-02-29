function twxSxslplayer() {
  return {
    elementTag: 'twx-octosxslplayer',

    label: 'SXSL Player',

    category : 'ar',
    
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return true; //!!builderSettings.octo;
    },

    properties: [
      {
        name: 'disabled',
        label: 'Disabled',
        datatype: 'boolean',
        default:false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'physical',
        label: 'Physical Model',
        datatype: 'boolean',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'tracking',
        label: 'Is Tracking',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
        name: 'canrun',
        label: 'Ready',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
        name: 'running',
        label: 'Running',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
        name: 'executing',
        label: 'Active',
        datatype: 'boolean',
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
        name: 'tick',
        label: 'Step Clock',
        datatype: 'Infotable',
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
            name: 'sxsldata',
           label: 'Procedure',
        datatype: 'resource_url',
         default: '',
    resource_url: true,
 allowedPatterns: ['.sxsl2','.json'],
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
            name: 'anchor',
           label: 'Content Location',
        datatype: 'String',
         default: '',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: false,
       isVisible: false
      },
      {
            name: 'include',
           label: 'Metadata to Include',
        datatype: 'String',
         default: '',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: false,
       isVisible: false
      },
      {
            name: 'hilite',
           label: 'Highlight Shader',
        datatype: 'String',
         default: '',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: false,
       isVisible: false
      },
      {
            name: 'steplist',
           label: 'Step List',
        datatype: 'Infotable',
         default: [],
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
            name: 'toollist',
           label: 'Tools Required',
        datatype: 'Infotable',
         default: [],
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
            name: 'consumables',
           label: 'Consumables',
        datatype: 'Infotable',
         default: [],
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
            name: 'focus',
           label: 'Focus',
        datatype: 'Infotable',
         default: [],
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
            name: 'reasoncode',
           label: 'Reason',
        datatype: 'Infotable',
         default: [],
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
            name: 'status',
           label: 'Status',
        datatype: 'infotable',
         default: {},
        isBindingSource: true,
        isBindingTarget: false,
        showInput: false
      },
      {
        name: 'logIncremental',
        label: 'Enable Status Logging',
        datatype: 'boolean',
        default:false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
        {
            name: 'statusUpdate',
            label: 'Status Update'
        },
        {
            name: 'procStart',
            label: 'Procedure Started'
        },
        {
            name: 'procEnd',
            label: 'Procedure Completed'
        },
        {
            name: 'finished',
            label: 'Terminated - successful'
        },
        {
            name: 'terminated',
            label: 'Terminated - failed'
        }
    ],

      defaultBindings: [
        {
          sourceType: 'event',
          sourceEvent: 'statusUpdate',
          targetPath: 'ready',
          targetType: 'widget',
          handlerService: 'ready'
        },
      ],

    services: [
      {
        name: 'reset',
        label: 'Reset'
      },
      {
        name: 'resume',
        label: 'Resume'
      },
      {
        name: 'ready',
        label: 'Ready'
      }

    ],
    
    dependencies: {
      files         : ['js/matrix.js', 'js/linq.js', 'js/sxslPlayerHelper.js', 'js/sxslPlayer-ng.js', 'images/diamond.pvz', 'Metadata.js', 'Structure.js'],
      angularModules: ['sxslplayer-ng']
    },


    designTemplate: function () {
      return '<div class="sxslPlayerWidget"></div>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var isholo  = forholo ;   
      var ps1gl ='<script name="sxsl_screendoorgl" type="x-shader/x-fragment">precision mediump float; vec2 rotate2D(vec2 _st, float _angle) { _st -= 0.5;_st =  mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle)) * _st; _st += 0.5; return _st;} vec2 tile(vec2 _st, float _zoom){ _st *= _zoom; return fract(_st);}float box(vec2 _st, vec2 _size, float _smoothEdges){ _size = vec2(0.5)-_size*0.5; vec2 aa = vec2(_smoothEdges*0.5); vec2 uv = smoothstep(_size,_size+aa,_st); uv *= smoothstep(_size,_size+aa,vec2(1.0)-_st); return uv.x*uv.y;} void main(void){ vec2 st = gl_FragCoord.xy / 32. ;vec3 color = vec3(0.0); st = tile(st,4.); st = rotate2D(st,0.785398163); float b = box(st,vec2(0.7),0.01); if (b < 0.01) discard; gl_FragColor = vec4(b,b,b,1.0); }</script>';
      var vs1gl ='<script name="sxsl_screendoorgl" type="x-shader/x-vertex">attribute vec4 vertexPosition;uniform mat4 modelViewProjectionMatrix;void main() {gl_Position = modelViewProjectionMatrix * vertexPosition;}</script>';
      var ps1hl ='<script name="sxsl_screendoorhl" type="x-shader/x-fragment">  cbuffer ShaderConstantBuffer : register(b0) {  float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; struct PixelShaderInput { half4 pos : SV_POSITION; }; min16float4 main(PixelShaderInput input) : SV_TARGET {  min16float4 color = min16float4(0.0,0.0,0.0,0.0); min16float4 finalShadedColor = color; return finalShadedColor; } </script>';
      var vs1hl ='<script name="sxsl_screendoorhl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos : POSITION; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.rtvId = idx; return output; } </script>';
      
      var ps2hl ='<script name="sxsl_coloredHilitehl" type="x-shader/x-fragment"> cbuffer ShaderConstantBuffer : register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; cbuffer TMLDefinedConstants : register(b10) { float r;  float g;  float b;  } struct PixelShaderInput { half4 pos : SV_POSITION; half4 color : COLOR0; half3 I : NORMAL0; half2 xray : TEXCOORD0; }; min16float4 main(PixelShaderInput input) : SV_TARGET { min16float4 color = min16float4(r,g,b,1.0); float dp = input.xray.x; float opacity = abs(dp); float xray = 1.0 - pow(opacity,3.); min16float4 finalShadedColor = min16float4(saturate(xray * color).xyz, 1.0); return finalShadedColor; } </script>';
      var vs2hl ='<script name="sxsl_coloredHilitehl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; half2 texcoord : TEXCOORD; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; half4 color : COLOR0; half3 I : NORMAL0; half2 xray : TEXCOORD0; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); half4 eye = half4(0., 0., 0., 1.); half3 I = (pos - mul(eye, viewInverse)).xyz; output.I = I; half3 N = normalize(mul(input.normal, inverse).xyz); float dp = dot(-N, normalize(I)); output.xray = half2(dp, 0.); pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.color = (half4)diffuseColor; output.rtvId = idx; return output; } </script>';
      var ps2gl ='<script name="sxsl_coloredHilitegl" type="x-shader/x-fragment">   precision mediump float;   const float PI=3.1415926;    varying vec3 vertex;   varying vec3 normal;   varying vec2 texcoord;   varying vec4 vcolor;   varying float dist;   uniform sampler2D tex0;   uniform vec4 surfaceColor;   uniform float cutoutDepth;  uniform float r; uniform float g; uniform float b;   const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0);    const vec4 specColor    = vec4(0.05, 0.05, 0.05, 1.0);   void main() {     vec4 color = vec4(r,g,b,1.); 				      vec3 lightPos = vec3(1.,1.,1.);     vec3 lightDir = -normalize(lightPos);     vec3 finalNormal = normalize(normal); 				     float lambertian = dot(lightDir,finalNormal);     float specular = 0.0;     vec3 viewDir = normalize(-vertex);      if (lambertian < 0.0)        finalNormal = - finalNormal;      vec3 reflectDir = reflect(-lightDir, finalNormal);     float specAngle = max(dot(reflectDir, viewDir), 0.0);     specular = pow(specAngle, 4.0);      color = ambientColor * color + color * abs(lambertian); 					     float d2 = cutoutDepth/2.;     color.a  = smoothstep(d2,cutoutDepth,dist);     gl_FragColor=vec4(color);   } </script>';
      var vs2gl ='<script name="sxsl_coloredHilitegl" type="x-shader/x-vertex">   attribute vec3 vertexPosition;   attribute vec3 vertexNormal;   attribute vec2 vertexTexCoord; 			   varying vec2 texcoord;   varying vec3 normal;     varying vec3 vertex;   varying float dist;      uniform mat4 modelViewProjectionMatrix;   uniform mat4 modelViewMatrix;   uniform mat4 normalMatrix;    void main() {     vec4 vp     = vec4(vertexPosition, 1.0);     gl_Position = modelViewProjectionMatrix * vp;     normal      = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0)));     texcoord    = vertexTexCoord;     vertex      = vp.xyz;     vec3 vv     = vec3(modelViewMatrix * vp);     dist        = length(vv);   } </script>';
      
      var ps3hl = '<script name="sxsl_desaturatedhl" type="x-shader/x-fragment"> cbuffer ShaderConstantBuffer : register(b0) {float4  highlightColor; bool    useTexture; bool    useLight; float   transparency; int     pad; }; cbuffer RenderConstantBuffer : register(b1) {float   tick; float3  ding; }; cbuffer MaterialConstantBuffer : register(b2) {float4  diffuseColor; int     twoSided; int     useTextureMap; int     useNormalMap; int     useSpecularMap; }; cbuffer TMLDefinedConstants : register(b10) {float   cutoffDepth; float   cutoutDepth; }; struct PixelShaderInput {half4   pos : SV_POSITION; half3   I   : NORMAL0; half3   N   : TEXCOORD0; half3   P   : TEXCOORD1; }; half4 luma(half4 inc) { float mc = min(min(inc.x, inc.y), inc.z); float xc = max(max(inc.x, inc.y), inc.z); float dc = (mc + xc) / 2.; return half4(dc, dc, dc, inc.w); } min16float4 main(PixelShaderInput input) : SV_TARGET {min16float4 highlightColorFinal = min16float4(0,0,0,0); if (highlightColor.x >= 0.0) {highlightColorFinal = min16float4(highlightColor); } float4 color  = luma(float4(diffuseColor.xyz,transparency)); float opacity = abs(dot(normalize(-input.N), normalize(-input.I))); min16float4 finalShadedColor = min16float4(color * opacity); float od = length(input.I); float gz=smoothstep(0.5,0.5,od); min16float4 highlightedOutputColor; highlightedOutputColor.xyz = lerp(finalShadedColor.xyz, highlightColorFinal.xyz, highlightColorFinal.w); highlightedOutputColor.w = min16float(finalShadedColor.w); return highlightedOutputColor * gz; } </script> '
      var vs3hl = '<script name="sxsl_desaturatedhl" type="x-shader/x-vertex">cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4   diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos     : POSITION; half4 normal  : NORMAL; half2 texcoord: TEXCOORD; uint  instId  : SV_InstanceID; }; struct VertexShaderOutput { half4 pos     : SV_POSITION; half3 I       : NORMAL0; half3 N       : TEXCOORD0; half3 P       : TEXCOORD1; uint  rtvId   : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); output.P = pos.xyz; half4 eye = half4(0., 0., 0., 1.); output.I = (pos - mul(eye, viewInverse)).xyz; pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.N = -normalize(mul(input.normal, inverse).xyz); output.rtvId = idx; return output; }</script>' 
      var ps3gl = '<script name="sxsl_desaturatedgl" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec3 vertex; varying vec3 normal; uniform vec4 surfaceColor; const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0); const vec4 specColor    = vec4(0.05, 0.05, 0.05, 1.0); vec4 luma(vec4 cin) {float min = min( min(cin.x, cin.y), cin.z ); float max = max( max(cin.x, cin.y), cin.z ); float v = (max+min)/2.; return vec4(v,v,v,cin.w); } void main() {vec4 color = luma(surfaceColor); vec3 lightPos    = vec3(1.,1.,1.); vec3 lightDir    = -normalize(lightPos); vec3 finalNormal = normalize(normal); float lambertian = dot(lightDir,finalNormal); float specular   = 0.0; vec3 viewDir     = normalize(-vertex); if (lambertian < 0.0) finalNormal = - finalNormal; vec3 reflectDir = reflect(-lightDir, finalNormal); float specAngle = max(dot(reflectDir, viewDir), 0.0); specular = pow(specAngle, 4.0); color = ambientColor * color + color * abs(lambertian)   + specColor * specular; color.a = 1.; gl_FragColor=vec4(color); } </script>'
      var vs3gl = '<script name="sxsl_desaturatedgl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; varying   vec3 normal; varying   vec3 vertex; uniform   mat4 modelViewProjectionMatrix; uniform   mat4 normalMatrix; void main() {vec4 vp     = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; normal      = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); vertex      = vp.xyz; } </script>'
      
      var ps4gl = '<script name="sxsl_proximityHilitegl" type="x-shader/x-fragment">  precision mediump float;  const float PI=3.1415926;   varying vec3 vertex;  varying vec3 normal;  varying vec2 texcoord;  varying vec4 vcolor;  varying float dist; uniform sampler2D tex0;  uniform vec4 surfaceColor;  uniform float cutoutDepth;  const vec4 ambientColor = vec4(0.15, 0.15, 0.15, 1.0);   const vec4 specColor    = vec4(0.05, 0.05, 0.05, 1.0);  void main() {    vec4 color = vec4(1.,.5,.25,1.); surfaceColor + texture2D(tex0,texcoord);;				     vec3 lightPos = vec3(1.,1.,1.);    vec3 lightDir = -normalize(lightPos);    vec3 finalNormal = normalize(normal);				    float lambertian = dot(lightDir,finalNormal);    float specular = 0.0;    vec3 viewDir = normalize(-vertex);    if (lambertian < 0.0)       finalNormal = - finalNormal;    vec3 reflectDir = reflect(-lightDir, finalNormal);    float specAngle = max(dot(reflectDir, viewDir), 0.0);    specular = pow(specAngle, 4.0);    color = ambientColor * color + color * abs(lambertian);					    float d2 = cutoutDepth/2.;    color.a  = smoothstep(d2,cutoutDepth,dist);    gl_FragColor=vec4(color);  }</script>';
      var vs4gl = '<script name="sxsl_proximityHilitegl" type="x-shader/x-vertex">  attribute vec3 vertexPosition;  attribute vec3 vertexNormal;  attribute vec2 vertexTexCoord;			  varying vec2 texcoord;  varying vec3 normal;    varying vec3 vertex;  varying float dist;    uniform mat4 modelViewProjectionMatrix;  uniform mat4 modelViewMatrix;  uniform mat4 normalMatrix;  void main() {    vec4 vp     = vec4(vertexPosition, 1.0);    gl_Position = modelViewProjectionMatrix * vp;    normal      = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0)));    texcoord    = vertexTexCoord;    vertex      = vp.xyz;    vec3 vv     = vec3(modelViewMatrix * vp);    dist        = length(vv); } </script>';
      
      var tmpl = `<div ng-sxslplayer holo-field=${isholo} hilite-field={{me.hilite}} logging-field={{me.logIncremental}} disabled-field={{me.disabled}} tracking-field="me.tracking" physical-field={{me.physical}} anchor-field={{me.anchor}} include-field={{me.include}} resource-field={{me.sxsldata}} status-field="me.status" executing-field="me.executing" running-field="me.running" canrun-field="me.canrun" clock-field="me.tick" reasoncode-field={{me.reasoncode}} steplist-field="me.steplist" toollist-field="me.toollist" focus-field="me.focus" consumables-field="me.consumables" delegate-field="delegate"></div>`;
      return tmpl+ps1gl+vs1gl+ps2gl+vs2gl+ps3gl+vs3gl+ps1hl+vs1hl+ps2hl+vs2hl+ps3hl+vs3hl+ps4gl+vs4gl;
    }
  }
}

twxAppBuilder.widget('twxSxslplayer', twxSxslplayer);