function twxList3D() {
  return {
    elementTag: 'twx-list3d',
      
    label    : '3D List',
    
    category : 'ar',
    groups    : ['input'],
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      return (projectSettings.projectType === 'eyewear');
    },

    properties: [
      {
            name: 'rows',
           label: 'Number of Rows',
        datatype: 'number',
         default: 1,
             min: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'cols',
           label: 'Number of Columns',
        datatype: 'number',
         default: 1,  
             min: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'buttonheight',
           label: 'Button Height',
        datatype: 'string',
         default: '0.04'
      },
      {
            name: 'buttonwidth',
           label: 'Button Width',
        datatype: 'string',
         default: '0.04'
      },
      {
            name: 'height',
           label: 'Height',
        datatype: 'string',
         default: '0.04',
       isVisible: false
      },
      {
            name: 'width',
           label: 'Width',
        datatype: 'string',
         default: '0.04',
       isVisible: false
      },
      {
            name: 'padding',
           label: 'Padding',
        datatype: 'string',
         default: '0.004'
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
            name: 'pressedColor',
           label: 'Color, pressed',
        datatype: 'color',
         default: 'rgba(78,137,188,1);',
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
            name: 'listdata',
           label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: true,
       showInput: false,
       isVisible: true
      },
      {
            name: 'datawindow',
           label: 'Data Window',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: true,
       showInput: false,
       isVisible: false
      },
      {
            name: 'value',
           label: 'Value',
        datatype: 'infotable',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false,
      },
      {
            name: 'visible',
           label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
         default: true,
 isBindingTarget: true
      },
      {
            name: 'upvis',
           label: 'Upper Visible',
        datatype: 'boolean',
         default: true,
       isVisible: false,
       showInput: false,
 isBindingTarget: false
      },
      {
            name: 'dnvis',
           label: 'Downer Visible',
        datatype: 'boolean',
         default: true,
       isVisible: false,
       showInput: false,
 isBindingTarget: false
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
        name: 'reset',
        label: 'Reset'
      },
      {
        name: 'refresh',
        label: 'Refresh'
      }
    ],
    
    dependencies: {
      files         : ['js/list3D-ng.js', 'js/press3D-ng.js', 'js/image3D-ng.js', 'images/**'],
      angularModules: ['list3D-ng','press3D-ng', 'image3D-ng']
    },
  
    designTemplate: function () {
      // if we use an image, we can at least position and size (width/height) correctly. Unfortunately we lose any 3d depth cues
      return '<twx-dt-image id="#widgetId#" src="/extensions/images/3D Image Button.png" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" shader="{{me.shader}}" istracked="{{me.istracked}}" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}" pivot="4"></twx-dt-image>';
      
      // if we add a model, we cannot scale it correcty
      //return '<twx-dt-model id="#widgetId#" src="/extensions/images/toggleButton3D.pvz" opacity="1" hidden="false" scale="{{me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" shader="{{me.shader}}""></twx-dt-model>';
      
      // turns out you cant add 3dbutton because the handlers in the editor expect the widget to be specific i.e. they are not handling the tml
      //return '<twx-dt-3dbutton id="#widgetId#" text="toggle" src="/extensions/images/placeholder_img.svg" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" shader="{{me.shader}}" color="{{me.color}}" fontcolor="{{me.fontcolor}}" fontoutlinecolor="{{me.fontoutlinecolor}}" backercolor="{{me.color}}"></twx-dt-3dbutton>';
    },
  
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
        
      var tmpl = '<div ng-list3d class="ng-hide list3DWidget ' + props.class + '" id-field="' + props.widgetId + '" isholo-field='+forholo+' rows-field={{me.rows}} cols-field={{me.cols}} height-field={{me.buttonheight}} width-field={{me.buttonwidth}} disabled-field={{me.disabled}} listdata-field="me.listdata" datawindow-field="me.datawindow" value-field="me.value" upvis-field="me.upvis" dnvis-field="me.dnvis" delegate-field="delegate"></div>\n';
      var ctrl = '';
      
      // we build up an array of buttons, cols wide, rows deep
      // buttons are spaced by 'padding' value
      let nc  = parseInt(props.cols);
      let nr  = parseInt(props.rows);
      let pp  = parseFloat(props.padding);
      let bw  = parseFloat(props.buttonwidth);
      let bh  = parseFloat(props.buttonheight);
      let ddx = parseFloat(props.buttonwidth)  + pp;
      let dx  = bw / 2;
      let dpp = (nr - 1) * pp;
      let dbh = nr * bh;
      let dy  = -(bh - dpp - dbh)/2;
      let ddy = bh + pp;
      
      for (var rows = 0; rows < nr; rows++) {
        for (var cols = 0; cols < nc; cols++) {
            
          // we need to write out an array of buttons
          var bid     = (rows * nc) + cols;
          var rowtmpl = '<div ng-image3d  id-field="' + props.widgetId + '-' + bid + '" isholo-field='+forholo+' height-field={{me.buttonheight}} width-field={{me.buttonwidth}} backer-field={{me.showbacker}} font-field="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" '+
                        'text-field={{me.datawindow['+bid+'].text}} src-field={{me.datawindow['+bid+'].srcpressed}} srcnotpressed-field={{me.datawindow['+bid+'].src}} '+
                        'pressed-field="me.datawindow['+bid+'].pressed" notpressed-field="me.datawindow['+bid+'].notpressed" disabled-field={{me.disabled}}></div>\n';
          var rowctrl = '<twx-dt-3dbutton id="' + props.widgetId + '-' + bid + '" class="list3Dwidget" ' + 
                        'text="" ' + 
                        'height="{{me.buttonheight}}" width="{{me.buttonwidth}}" '+
                        'fontcolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" fontoutlinecolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" '+
                        'color="{{me.disabled ? me.colordisabled : me.datawindow['+bid+'].pressed ? (me.pressedColor.endsWith(&apos;;&apos;)? me.pressedColor.slice(0, -1): me.pressedColor) : (me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor) }}" '+
                        'backercolor="{{me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor}}" ' + 
                        'x="{{'+dx+' + me.x}}" y="{{'+dy+' + me.y}}" z="{{me.z}}" ' + 
                        'rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" ' + 
                        'hidden="{{!app.fn.isTrue(me.visible) || !app.fn.isTrue(me.datawindow['+bid+'].visible) }}" '+
                        'shader="{{me.shader}}" interactable-hint="true"/>\n';
          dx += ddx;
          ctrl = ctrl + rowtmpl + rowctrl;
        }
        dy -= ddy;
        dx  = bw/2;
      }
      
      //
      // and the up/down control buttons
      // these are placed to the right of the button array, spaced approx 1 std button width
      //
      var cx = bw/2 + nc * ddx + 0.01;
      //
      // they are centered horizontally, stacked one above, one below
      //
      var cy = (pp + 0.04)/2;
      
      //standard press3d widget inserted inline - this is the angular controller (handles rendering etc.)
      //
      var uptmpl = '<div ng-press3d id-field="' + props.widgetId + 'upper" isholo-field='+forholo+' height-field="0.032" width-field="0.032" backer-field={{me.showbacker}} font-field="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" text-field="up" src-field="extensions/images/up-arrow.png" disabled-field={{me.disabled || !app.fn.isTrue(me.upvis)}}></div>\n';
      
      //and this is the tml button
      //
      var upctrl = '<twx-dt-3dbutton id="' + props.widgetId + 'upper" '+ 
      'text="" ' +  // set to "" so that we can render the text into the button label directly 
      'height="0.032" width="0.032" ' +
      'fontcolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" fontoutlinecolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" '+
      'color="{{(me.disabled || !app.fn.isTrue(me.upvis)) ? me.colordisabled : (me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor) }}" '+
      'backercolor="{{me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor}}" ' +
      'x="{{'+cx+' + me.x}}" y="{{me.y+'+cy+'}}" z="{{me.z}}" '+
      'rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" '+
      'hidden="{{!app.fn.isTrue(me.visible)}}" shader="{{me.shader}}" interactable-hint="true"/>\n';
      
      // same again
      var dntmpl = '<div ng-press3d id-field="' + props.widgetId + 'downer" isholo-field='+forholo+' height-field="0.032" width-field="0.032"  backer-field={{me.showbacker}} font-field="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" text-field="down" src-field="extensions/images/dn-arrow.png" disabled-field={{me.disabled || !app.fn.isTrue(me.dnvis)}}></div>\n';
      var dnctrl = '<twx-dt-3dbutton id="' + props.widgetId + 'downer" ' + 
      'text="" ' +  // set to "" so that we can render the text into the button label directly
      'height="0.032" width="0.032" '+
      'fontcolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" fontoutlinecolor="{{me.fontColor.endsWith(&apos;;&apos;)? me.fontColor.slice(0, -1): me.fontColor}}" '+
      'color="{{(me.disabled || !app.fn.isTrue(me.dnvis))? me.colordisabled : (me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor) }}" '+
      'backercolor="{{me.buttonColor.endsWith(&apos;;&apos;)? me.buttonColor.slice(0, -1): me.buttonColor}}" ' +
      'x="{{'+cx+' + me.x}}" y="{{me.y-'+cy+'}}" z="{{me.z}}" '+
      'rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" '+
      'hidden="{{!app.fn.isTrue(me.visible)}}" shader="{{me.shader}}" interactable-hint="true"/>\n';
      ctrl = ctrl + uptmpl+upctrl+dntmpl+dnctrl;
      
      //and the holo shaders
      var ps1  = '<script name="holoUI" type="x-shader/x-fragment"> Texture2D Texture:register(t0); Texture2D Iridance:register(t1); sampler Sampler:register(s0); cbuffer ShaderConstantBuffer:register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer:register(b1) { float tick; float3 padding; float4 hand; }; cbuffer MaterialConstantBuffer:register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer TMLDefinedConstants:register(b10) { float cutoffDepth; }; struct PixelShaderInput { half4 pos:SV_POSITION; half4 world:POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; }; float HoverLight(float4 hoverLight,float3 worldPosition,float alpha) { float ir = 1. - saturate(length((hoverLight.xyz - worldPosition) / hoverLight.w)); return ir*ir*alpha; } float2 raytrace(float3 x1,float3 x0,float3 I) { float3 x2=x1 + I; float3 n21=x2 - x1; float3 n10=x1 - x0; float n1=dot(n10,n21); float l21=length(n21); float t= -n1 / (l21*l21); float l10=length(n10); float d=((l10*l10)*(l21*l21) - (n1*n1)) / (l21*l21); return float2(t,d); } min16float4 main(PixelShaderInput input):SV_TARGET { const float hlw=0.05; float bigW=hlw*5.; float4 HoverLightPosition=float4 (hand.xyz,hlw); float bigD=saturate(length((HoverLightPosition.xyz - input.world.xyz) / bigW)); float brightness=1. - bigD; float falloff=pow(brightness,3.); float width=0.5; float crad=0.; float thickness=0.01; float outer=width - crad; float inner=outer - thickness; float4 f=Texture.Sample(Sampler,input.tx); f=f+diffuseColor*(1. - f.w); float3 edge; float2 mtx=abs(input.tx) % 1; if (crad > 0.) { float r1=step(crad,length(max(abs(mtx - float2(width,width)) - inner,0.))); float r2=step(length(max(abs(mtx - float2(width,width)) - outer,0.)),crad); float sq=r1*r2; edge=float3 (sq,sq,sq); f += float4(edge,sq); } else { float2 r=abs(mtx - float2(width,width)); float s=max(r.x,r.y); float sq=step(inner,s)*step(s,outer); edge=float3 (sq,sq,sq); f += float4(max(brightness,.1)*edge,sq); } float2 ray=raytrace(input.I,input.world.xyz,input.viewDir); float d=step(ray.x,0.)*smoothstep(0.005,0.0,ray.y); float3 RimColor=float3(.5,.5,.5); float RimPower=3.; f.rgb += edge*d*RimColor; float4 InnerGlowColor=float4(.9,.9,.9,.8); float2 uvGlow=(mtx - float2(.5,.5))*(InnerGlowColor.a*2.); uvGlow=uvGlow*uvGlow; uvGlow=uvGlow*uvGlow; f.rgb += falloff*lerp(float3(0.,0.,0.),InnerGlowColor.rgb,uvGlow.x + uvGlow.y); float fresnel=pow(saturate(dot(normalize(input.world.xyz-input.I),normalize(-input.N))),RimPower ); float hoverValue=HoverLight(HoverLightPosition,input.world.xyz,fresnel); float yoffset=input.color.r; float3 hoverColor=Iridance.Sample(Sampler,float2(hoverValue,yoffset)).rgb;  float ilen=length(input.world.xyz - input.I); float gz=smoothstep(0.15,0.3,ilen); f.rgb += falloff*hoverColor; f.a *= transparency; min16float4 outputColor=min16float4(f*gz); return outputColor; } </script>\n';
      var vs1  = '<script name="holoUI" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer:register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer:register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer:register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; float4x4 viewRotationInverse; }; struct VertexShaderInput { half4 pos:POSITION; half4 normal:NORMAL; half2 texcoord: TEXCOORD; uint instId:SV_InstanceID; }; struct VertexShaderOutput { half4 pos:SV_POSITION; half4 world: POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; uint rtvId:SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos=half4(input.pos); int idx=input.instId % 2; pos=mul(pos,model); output.world=(half4)pos; half4 eye=half4(0.,0.,0.,1.); output.I=mul(eye,viewInverse).xyz;  pos=mul(pos,viewProjection[idx]); output.pos=(half4)pos; output.N=normalize(mul(input.normal,inverse).xyz); output.color=half4(diffuseColor); output.tx=input.texcoord; output.viewDir=normalize(mul(half4(0,0,1,1),viewRotationInverse).xyz); output.rtvId=idx; return output; } </script>\n';
      var ps2  = '<script name="holoUIni" type="x-shader/x-fragment"> Texture2D Texture:register(t0); sampler Sampler:register(s0); cbuffer ShaderConstantBuffer:register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer:register(b1) { float tick; float3 padding; float4 hand; }; cbuffer MaterialConstantBuffer:register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer TMLDefinedConstants:register(b10) { float cutoffDepth; }; struct PixelShaderInput { half4 pos:SV_POSITION; half4 world:POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; }; float HoverLight(float4 hoverLight,float3 worldPosition,float alpha) { float ir=1. - saturate(length((hoverLight.xyz - worldPosition) / hoverLight.w)); return ir*ir*alpha; } float2 raytrace(float3 x1,float3 x0,float3 I) { float3 x2=x1 + I; float3 n21=x2 - x1; float3 n10=x1 - x0; float n1=dot(n10,n21); float l21=length(n21); float t=-n1 / (l21*l21); float l10=length(n10); float d=((l10*l10)*(l21*l21) - (n1*n1)) / (l21*l21); return float2(t,d); } min16float4 main(PixelShaderInput input):SV_TARGET { const float hlw=0.05; float bigW=hlw*5.; float4 HoverLightPosition=float4 (hand.xyz,hlw);  float bigD=saturate(length((HoverLightPosition.xyz - input.world.xyz) / bigW)); float brightness=1. - bigD; float falloff=pow(brightness,3.); float width=0.5; float crad=0.; float thickness=0.01; float outer=width - crad; float inner=outer - thickness; float4 f=Texture.Sample(Sampler,input.tx); f=f + diffuseColor*(1. - f.w); float3 edge; float2 mtx=abs(input.tx) % 1; if (crad > 0.) { float r1=step(crad,length(max(abs(mtx - float2(width,width)) - inner,0.))); float r2=step(length(max(abs(mtx - float2(width,width)) - outer,0.)),crad); float sq=r1*r2; edge=float3 (sq,sq,sq); f += float4(edge,sq); } else { float2 r=abs(mtx - float2(width,width)); float s=max(r.x,r.y); float sq=step(inner,s)*step(s,outer); edge=float3 (sq,sq,sq); f += float4(.1*edge,sq); } float2 ray=raytrace(input.I,input.world.xyz,input.viewDir); float d=step(ray.x,0.)*smoothstep(0.005,0.0,ray.y); float3 RimColor=float3(.5,.5,.5); float RimPower=3.; f.rgb += edge*d*RimColor; f.a *= transparency; float ilen=length(input.world.xyz - input.I); float gz=smoothstep(0.15,0.3,ilen); min16float4 outputColor=min16float4(f*gz); return outputColor; } </script>\n';
      var vs2  = '<script name="holoUIni" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer:register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer:register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer:register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; float4x4 viewRotationInverse; }; struct VertexShaderInput { half4 pos:POSITION; half4 normal:NORMAL; half2 texcoord: TEXCOORD; uint instId:SV_InstanceID; }; struct VertexShaderOutput { half4 pos:SV_POSITION; half4 world: POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; uint rtvId:SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos=half4(input.pos); int idx=input.instId % 2; pos=mul(pos,model); output.world=(half4)pos; half4 eye=half4(0.,0.,0.,1.); output.I=mul(eye,viewInverse).xyz;  pos=mul(pos,viewProjection[idx]); output.pos=(half4)pos; output.N=normalize(mul(input.normal,inverse).xyz); output.color=half4(diffuseColor); output.tx=input.texcoord; output.viewDir=normalize(mul(half4(0,0,1,1),viewRotationInverse).xyz); output.rtvId=idx; return output; } </script>\n';
      
      //
      return vs1+ps1+vs2+ps2+tmpl+ctrl;
    },
    
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // automatically adjuts the Z distance of the button from the backplate  
        if(changedProps.cols) {
          let newCols  = changedProps.cols;
          let oldWidth = (oldProps.buttonwidth) ? oldProps.buttonwidth.value : 0.04;
          let oldPad   = (oldProps.padding) ? oldProps.padding.value : 0.002;
          var newWidth = (newCols * oldWidth) + (newCols - 1) * oldPad + 0.06;
          widgetCtrl.setProp('width', newWidth.toFixed(4));
        }
        if(changedProps.rows) {
          let newRows  = changedProps.rows;
          let oldHeight = (oldProps.buttonheight) ? oldProps.buttonheight.value : 0.04;
          let oldPad   = (oldProps.padding) ? oldProps.padding.value : 0.002;
          var newHeight = (newRows * oldHeight) + (newRows - 1) * oldPad;
          widgetCtrl.setProp('height', newHeight.toFixed(4));
        }

      };

      return this;
    }
  }
}

twxAppBuilder.widget('twxList3D', twxList3D);
