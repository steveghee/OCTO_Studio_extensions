function twxLighttube() {
  return {
    elementTag: 'twx-lighttube',
    label: 'Light Tube',
    category : 'ar',
    groups    : ['Effects'],  
    properties: [
 
      {
        name: 'affects',
        label: 'Affects',
        datatype: 'string',
        default: '',
        placeholder: 'add modelitem(s) (, separated)',  
        isBindingTarget: true,
        showInput: true
      },
      {
         name: 'nstrips',
         label: 'Number of strips',
         datatype: 'number',
         default: 10,
         isBindingSource: false,
         isBindingTarget: true,
         showInput: true
      },
      {
        name: 'wstrip',
        label: 'Strip width %',
        datatype: 'number',
        default: '50',
        min: 0,
        max:100,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'intensity',
        label: 'Intensity %',
        datatype: 'number',
        default: '100',
        min: 0,
        max:100,
        isBindingTarget: true,
        showInput: true
      },
      {
            name: 'direction',
           label: 'Tube direction',
        datatype: 'select',
         default: "0.,0.,1.,0.,1.,0.",
 isBindingTarget: false,
       isVisible: true,
          editor: 'select',
         options: [
            {label: 'X', value: "1.,0.,0.,0.,1.,0."},
            {label: 'Y', value: "0.,1.,0.,0.,0.,1."},
            {label: 'Z', value: "0.,0.,1.,0.,1.,0."},
                  ],
      },
      {
        name: 'disable',
        label: 'Disabled',
        datatype: 'boolean',
        default: false,
        isBindingTarget: true,
        isVisible : false       
      },

    ],
    events: [
    
    ],
    dependencies: {
      files         : ['js/lighttube-ng.js'],
      angularModules: ['lighttube-ng']
    }
    ,
    designTemplate: function () {
      return ' <twx-dt-image> ';
    }
    ,
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var isholo = forholo ;   
      
      var da = props.direction.split(',');
      var dv = `${da[0]},${da[1]},${da[2]}`;
      var du = `${da[3]},${da[4]},${da[5]}`;
      
      // vertex/pixel shaders for hololens
      var ps0 = '<script name="lighttubehl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; }; struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; half3 I : NORMAL0; half3 N : TEXCOORD0; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); half4 eye = half4(0., 0., 0., 1.); output.I = (pos - mul(eye, viewInverse)).xyz; pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.N = normalize(mul(input.normal, inverse).xyz); output.rtvId = idx; return output; } </script>';
      var vs0 = '<script name="lighttubehl" type="x-shader/x-fragment"> cbuffer ShaderConstantBuffer : register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; cbuffer TMLDefinedConstants : register(b10) { float mixer; float nls; float wls; }; cbuffer MaterialConstantBuffer : register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer ModelConstantBuffer : register(b3) { float4x4 model; float4x4 inverse; }; struct PixelShaderInput { half4 pos : SV_POSITION; half3 I : NORMAL0; half3 N : TEXCOORD0; }; min16float4 main(PixelShaderInput input) : SV_TARGET { min16float4 highlightColorFinal = min16float4(0,0,0,0); if (highlightColor.x >= 0.0) { highlightColorFinal = min16float4(highlightColor); } const float PI = 3.1415; const min16float4 white = min16float4(1., 1., 1., 1.); const min16float4 black = min16float4(0., 0., 0., 1.); float3 NN = normalize(input.N); float3 II = normalize(input.I); float3 RR = - normalize(reflect(II,NN)); min16float4 color; float3 cDv = float3('+dv+'); float3 cDu = float3('+du+'); float dp = abs(dot(cDv,RR)); if (dp > 0.99) { color = min16float4(black); } else { float3 cU = normalize(cross(cDv,RR)); float3 cV = normalize(cross(cDv,cU)); float dp2 = dot(cDu,cV); float ty = 2. * (acos(dp2) / PI); float ti = frac(ty * nls); float td = 2. * abs(.5 - ti); float ta = step(td,wls); color = min16float4(ta,ta,ta,1.); } min16float4 highlightedOutputColor = color + highlightColorFinal; return highlightedOutputColor; } </script>';
      // vertex/pixel shaders for other devices
      var ps1 = '<script name="lighttubegl" type="x-shader/x-fragment"> precision highp float; varying vec3 I; varying vec3 N; const float PI = 3.14159265359; const vec4 black = vec4(0.,0.,0.,1.); const vec4 white = vec4(1.); const vec4 red = vec4(1.,0.,0.,1.); const vec3 Dv = vec3('+dv+'); const vec3 Du = vec3('+du+'); uniform mat4 inverseViewMatrix; uniform vec4 surfaceColor; uniform sampler2D tex0; uniform float mixer; uniform float nls; uniform float wls; void main() { vec4 color = surfaceColor; vec3 NN = normalize(N); vec3 II = normalize(I); vec3 RR = normalize(reflect(II, NN)); vec3 R = normalize(vec3(inverseViewMatrix * vec4(RR,0.))); float tx = 0.; float dp = abs(dot(Dv,R)); if (dp>0.99) { color= black; } else { vec3 U = normalize(cross(Dv,R)); vec3 V = normalize(cross(Dv,U)); dp = dot(Du,V); float ty = 2. * acos(dp) / PI; float ti = fract(ty*nls); float td = abs(.5-ti); color = (td < wls) ? black : white; } gl_FragColor = mix(surfaceColor,vec4(color.xyz, 1.0),mixer); } </script>';
      var vs1 = '<script name="lighttubegl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec3 vertexNormal; varying vec3 N; varying vec3 I; uniform mat4 modelMatrix; uniform mat4 modelViewProjectionMatrix; uniform mat4 normalMatrix; uniform mat4 modelViewMatrix; void main() { vec4 vp = vec4(vertexPosition, 1.0); gl_Position = modelViewProjectionMatrix * vp; vec3 vertex = vec3(modelViewMatrix * vp); N = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0))); I = vertex.xyz - vec3(0); } </script>';
      // our control defintion, with all parameters 
      var ctrl= '<div ng-lighttube id="'+props.widgetId+'" class="ng-hide lighttubeWidget' + props.class + '" isholo-field='+isholo+' nstrips-field={{me.nstrips}} wstrip-field={{me.wstrip}} intensity-field={{me.intensity}} disable-field={{me.disable}} affects={{me.affects}}></div>';
      // put them together and what have you got ...
      var shaders= forholo ? vs0 + ps0 :  vs1 + ps1;
      return shaders + ctrl;
    }
  }
}
twxAppBuilder.widget('twxLighttube', twxLighttube);
