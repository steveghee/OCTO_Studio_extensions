function twxCheckbox3D() {
  return {
    elementTag: 'octo-checkbox3D',
      
    label    : 'OCTO 3D Checkbox',
    
    category : 'ar',
    groups    : ['input'],
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      return false; // NOW DEPRICATED    
      //return (projectSettings.projectType === 'eyewear');
    },
   
    properties: [
      {
            name: 'text',
           label: 'ves-ar-extension:Text',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
      isVisible : false
      },
      {
            name: 'src',
           label: 'ves-basic-web-widgets-extension:Image when Pressed',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/checkOn.png',
 isBindingTarget: true,
      isVisible : false
      },
      {
            name: 'textnotpressed',
           label: 'ves-ar-extension:Text',
        datatype: 'string',
         default:'Unchecked',
 isBindingTarget: true,
      },
      {
            name: 'srcnotpressed',
           label: 'ves-basic-web-widgets-extension:Image when Not Pressed',
        datatype: 'resource_url',
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
  resource_image: true,
         default: '../../extensions/images/checkOff.png',
 isBindingTarget: true,
      isVisible : false
      },
      {
            name: 'pressed',
           label: 'ves-basic-web-widgets-extension:Pressed',
        datatype: 'boolean',
 isBindingSource: true,
 isBindingTarget: false,
         default: false
      },
      {
            name: 'notpressed',
           label: 'ves-basic-web-widgets-extension:Not Pressed',
        datatype: 'boolean',
 isBindingSource: true,
 isBindingTarget: false,
         default: true,
       showInput: false
      },
      {
            name: 'height',
           label: 'ves-ar-extension:Height',
        datatype: 'string',
         default: '0.04'
      },
      {
            name: 'width',
           label: 'ves-ar-extension:Width',
        datatype: 'string',
         default: '0.04'
      },
      {
            name: 'fontColor',
           label: 'ves-ar-extension:Font Color',
        datatype: 'color',
         default: 'rgba(255, 255, 255, 1);',
 isBindingTarget: true,
      },
      {
            name: 'buttonColor',
           label: 'ves-ar-extension:Button Color',
        datatype: 'color',
         default: 'rgba(38,97,148,1);',
 isBindingTarget: true,
      },
      {
            name: 'colordisabled',
           label: 'Color - disabled',
        datatype: 'color',
         default: 'rgba(40, 40, 40, 1.0);',
 isBindingTarget: true,
      isVisible : false
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
            name: 'showbacker',
           label: 'Show Backplate',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'disabled',
           label: 'ves-basic-web-widgets-extension:Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },

    ],

    events: [
      {
        name: 'pressed',
        label: 'ves-basic-web-widgets-extension:Pressed'
      },
      {
        name: 'unpressed',
        label: 'ves-basic-web-widgets-extension:Unpressed'
      }
    ],

    services: [
      {
         name: 'set',
        label: 'Set'
      },
      {
         name: 'reset',
        label: 'Reset'
      }
    ],
    
    dependencies: {
      files         : ['js/octotoggle3D-ng.js', 'images/**'],
      angularModules: ['octotoggle3D-ng']
    },

    designTemplate: function () {
      return '<twx-dt-image id="#widgetId#" src="/extensions/images/3D Checkbox.png" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" shader="{{me.shader}}" istracked="{{me.istracked}}" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}"></twx-dt-image>';
      //return '<twx-dt-model id="#widgetId#" src="/extensions/images/toggleButton3D.pvz" opacity="1" hidden="false" sx="{{me.width}}" sy="{{me.height}}" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" shader="{{me.shader}}""></twx-dt-model>';
      //return '<twx-dt-3dbutton id="#widgetId#" text="toggle" src="" opacity="1" hidden="false" width="{{me.width}}" height="{{me.width/2}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" shader="{{me.shader}}""></twx-dt-image>';
    },
  
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var tmpl = '<div ng-octotoggle3d id-field="' + props.widgetId + '" isholo-field='+forholo+' height-field={{me.height}} width-field={{me.width}}  backer-field={{me.showbacker}} font-field="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" text-field={{me.text}} textnotpressed-field={{me.textnotpressed}} src-field={{me.src}} srcnotpressed-field={{me.srcnotpressed}} pressed-field="me.pressed" notpressed-field="me.notpressed" disabled-field={{me.disabled}} delegate-field="delegate"></div>\n';
      var ps1  = '<script name="holoUI" type="x-shader/x-fragment"> Texture2D Texture:register(t0); Texture2D Iridance:register(t1); sampler Sampler:register(s0); cbuffer ShaderConstantBuffer:register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer:register(b1) { float tick; float3 padding; float4 hand; }; cbuffer MaterialConstantBuffer:register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer TMLDefinedConstants:register(b10) { float cutoffDepth; }; struct PixelShaderInput { half4 pos:SV_POSITION; half4 world:POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; }; float HoverLight(float4 hoverLight,float3 worldPosition,float alpha) { float ir = 1. - saturate(length((hoverLight.xyz - worldPosition) / hoverLight.w)); return ir*ir*alpha; } float2 raytrace(float3 x1,float3 x0,float3 I) { float3 x2=x1 + I; float3 n21=x2 - x1; float3 n10=x1 - x0; float n1=dot(n10,n21); float l21=length(n21); float t= -n1 / (l21*l21); float l10=length(n10); float d=((l10*l10)*(l21*l21) - (n1*n1)) / (l21*l21); return float2(t,d); } min16float4 main(PixelShaderInput input):SV_TARGET { const float hlw=0.05; float bigW=hlw*5.; float4 HoverLightPosition=float4 (hand.xyz,hlw); float bigD=saturate(length((HoverLightPosition.xyz - input.world.xyz) / bigW)); float brightness=1. - bigD; float falloff=pow(brightness,3.); float width=0.5; float crad=0.; float thickness=0.01; float outer=width - crad; float inner=outer - thickness; float4 f=Texture.Sample(Sampler,input.tx); f=f+diffuseColor*(1. - f.w); float3 edge; float2 mtx=abs(input.tx) % 1; if (crad > 0.) { float r1=step(crad,length(max(abs(mtx - float2(width,width)) - inner,0.))); float r2=step(length(max(abs(mtx - float2(width,width)) - outer,0.)),crad); float sq=r1*r2; edge=float3 (sq,sq,sq); f += float4(edge,sq); } else { float2 r=abs(mtx - float2(width,width)); float s=max(r.x,r.y); float sq=step(inner,s)*step(s,outer); edge=float3 (sq,sq,sq); f += float4(max(brightness,.1)*edge,sq); } float2 ray=raytrace(input.I,input.world.xyz,input.viewDir); float d=step(ray.x,0.)*smoothstep(0.005,0.0,ray.y); float3 RimColor=float3(.5,.5,.5); float RimPower=3.; f.rgb += edge*d*RimColor; float4 InnerGlowColor=float4(.9,.9,.9,.8); float2 uvGlow=(mtx - float2(.5,.5))*(InnerGlowColor.a*2.); uvGlow=uvGlow*uvGlow; uvGlow=uvGlow*uvGlow; f.rgb += falloff*lerp(float3(0.,0.,0.),InnerGlowColor.rgb,uvGlow.x + uvGlow.y); float fresnel=pow(saturate(dot(normalize(input.world.xyz-input.I),normalize(-input.N))),RimPower ); float hoverValue=HoverLight(HoverLightPosition,input.world.xyz,fresnel); float yoffset=input.color.r; float3 hoverColor=Iridance.Sample(Sampler,float2(hoverValue,yoffset)).rgb;  float ilen=length(input.world.xyz - input.I); float gz=smoothstep(0.15,0.3,ilen); f.rgb += falloff*hoverColor; f.a *= transparency; min16float4 outputColor=min16float4(f*gz); return outputColor; } </script>\n';
      var vs1  = '<script name="holoUI" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer:register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer:register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer:register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; float4x4 viewRotationInverse; }; struct VertexShaderInput { half4 pos:POSITION; half4 normal:NORMAL; half2 texcoord: TEXCOORD; uint instId:SV_InstanceID; }; struct VertexShaderOutput { half4 pos:SV_POSITION; half4 world: POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; uint rtvId:SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos=half4(input.pos); int idx=input.instId % 2; pos=mul(pos,model); output.world=(half4)pos; half4 eye=half4(0.,0.,0.,1.); output.I=mul(eye,viewInverse).xyz;  pos=mul(pos,viewProjection[idx]); output.pos=(half4)pos; output.N=normalize(mul(input.normal,inverse).xyz); output.color=half4(diffuseColor); output.tx=input.texcoord; output.viewDir=normalize(mul(half4(0,0,1,1),viewRotationInverse).xyz); output.rtvId=idx; return output; } </script>\n';
      var ps2  = '<script name="holoUIni" type="x-shader/x-fragment"> Texture2D Texture:register(t0); sampler Sampler:register(s0); cbuffer ShaderConstantBuffer:register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer:register(b1) { float tick; float3 padding; float4 hand; }; cbuffer MaterialConstantBuffer:register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer TMLDefinedConstants:register(b10) { float cutoffDepth; }; struct PixelShaderInput { half4 pos:SV_POSITION; half4 world:POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; }; float HoverLight(float4 hoverLight,float3 worldPosition,float alpha) { float ir=1. - saturate(length((hoverLight.xyz - worldPosition) / hoverLight.w)); return ir*ir*alpha; } float2 raytrace(float3 x1,float3 x0,float3 I) { float3 x2=x1 + I; float3 n21=x2 - x1; float3 n10=x1 - x0; float n1=dot(n10,n21); float l21=length(n21); float t=-n1 / (l21*l21); float l10=length(n10); float d=((l10*l10)*(l21*l21) - (n1*n1)) / (l21*l21); return float2(t,d); } min16float4 main(PixelShaderInput input):SV_TARGET { const float hlw=0.05; float bigW=hlw*5.; float4 HoverLightPosition=float4 (hand.xyz,hlw);  float bigD=saturate(length((HoverLightPosition.xyz - input.world.xyz) / bigW)); float brightness=1. - bigD; float falloff=pow(brightness,3.); float width=0.5; float crad=0.; float thickness=0.01; float outer=width - crad; float inner=outer - thickness; float4 f=Texture.Sample(Sampler,input.tx); f=f + diffuseColor*(1. - f.w); float3 edge; float2 mtx=abs(input.tx) % 1; if (crad > 0.) { float r1=step(crad,length(max(abs(mtx - float2(width,width)) - inner,0.))); float r2=step(length(max(abs(mtx - float2(width,width)) - outer,0.)),crad); float sq=r1*r2; edge=float3 (sq,sq,sq); f += float4(edge,sq); } else { float2 r=abs(mtx - float2(width,width)); float s=max(r.x,r.y); float sq=step(inner,s)*step(s,outer); edge=float3 (sq,sq,sq); f += float4(.1*edge,sq); } float2 ray=raytrace(input.I,input.world.xyz,input.viewDir); float d=step(ray.x,0.)*smoothstep(0.005,0.0,ray.y); float3 RimColor=float3(.5,.5,.5); float RimPower=3.; f.rgb += edge*d*RimColor; f.a *= transparency; float ilen=length(input.world.xyz - input.I); float gz=smoothstep(0.15,0.3,ilen); min16float4 outputColor=min16float4(f*gz); return outputColor; } </script>\n';
      var vs2  = '<script name="holoUIni" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer:register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer:register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer:register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; float4x4 viewRotationInverse; }; struct VertexShaderInput { half4 pos:POSITION; half4 normal:NORMAL; half2 texcoord: TEXCOORD; uint instId:SV_InstanceID; }; struct VertexShaderOutput { half4 pos:SV_POSITION; half4 world: POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; uint rtvId:SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos=half4(input.pos); int idx=input.instId % 2; pos=mul(pos,model); output.world=(half4)pos; half4 eye=half4(0.,0.,0.,1.); output.I=mul(eye,viewInverse).xyz;  pos=mul(pos,viewProjection[idx]); output.pos=(half4)pos; output.N=normalize(mul(input.normal,inverse).xyz); output.color=half4(diffuseColor); output.tx=input.texcoord; output.viewDir=normalize(mul(half4(0,0,1,1),viewRotationInverse).xyz); output.rtvId=idx; return output; } </script>\n';
      var ctrl = '<twx-dt-3dbutton id="' + props.widgetId + '" class="toggle3dWidget" ' + 
                 'text="" ' +  // set to "" so that we can render the text into the button label directly
                 'height="{{me.height}}" width="{{me.width}}" fontcolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" fontoutlinecolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" '+
                 'color="{{me.disabled ? me.colordisabled : (me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor) }}" '+
                 'backercolor="{{me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" '+
                 'shader="{{me.shader}}" interactable-hint="{{!me.disabled}}"/>\n';
      return tmpl+ps1+vs1+ps2+vs2+ctrl;
    },
    
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // automatically adjuts the Z distance of the button from the backplate  
        if(changedProps.height) {
          let newScale = changedProps.height;
          let oldScale = (oldProps.width) ? oldProps.width.value : 0.04;
          var shortest = (newScale < oldScale) ? newScale : oldScale;
          var newZ = (shortest - 0.04) * 0.1;
          widgetCtrl.setProp('z', newZ.toFixed(4));
        }
        if(changedProps.width) {
          let newScale = changedProps.width;
          let oldScale = (oldProps.height) ? oldProps.height.value : 0.04;
          var shortest = (newScale < oldScale) ? newScale : oldScale;
          var newZ = (shortest - 0.04) * 0.1;
          widgetCtrl.setProp('z', newZ.toFixed(4));
        }
      };
      return this;
    }
  }
}

twxAppBuilder.widget('twxCheckbox3D', twxCheckbox3D);
