function twxTethered() {
  return {
    elementTag: 'twx-tethered',
      
    label    : '3D Panel',
    
    category : 'ar',
    groups   : ['Containers'],
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      return (projectSettings.projectType === 'eyewear');
    },
   

    properties: [
      {
            name: 'auto',
           label: 'Following',
        datatype: 'boolean',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'affects',
           label: 'Contains',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'offset',
           label: 'Offset',
        datatype: 'string',
         default: '0 0.6',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
 validationRegex: '^[\\d\\.]+ [\\d\\.]+$' //Matches single decimal number or 2 decimals space separated
      },
      {
            name: 'src',
           label: 'Baseplate model',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/holoPlate.pvz',
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
            name: 'snap',
           label: 'Snap distance (m)',
        datatype: 'number',
         default: 0.5,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'height',
           label: 'ves-ar-extension:Height',
        datatype: 'string',
         default: '0.3'
      },
      {
            name: 'width',
           label: 'ves-ar-extension:Width',
        datatype: 'string',
         default: '0.3'
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
            name: 'scale',
           label: 'ves-ar-extension:Scale',
        datatype: 'string',
         default: '0.3 0.3 1',
 isBindingTarget: true,
 validationRegex: '^[\\d\\.]*$|^[\\d\\.]+ [\\d\\.]+ [\\d\\.]+$',
       isVisible: false
      },
      {
            name: 'shader',
           label: 'Shader',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       isVisible: false
      },
      {
            name: 'visible',
           label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
         default: true,
 isBindingTarget: true
      }
    
    ],

    events: [
        {
            name: 'tethered',
            label: 'Tethered'
        },
        {
            name: 'untethered',
            label: 'Untethered'
        },
        {
            name: 'aligning',
            label: 'Aligning'
        },
        {
            name: 'aligned',
            label: 'Aligned'
        }
    ],

    services: [
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
      files         : ['js/matrix.js', 'js/tetheredHelper.js', 'js/tethered-ng.js', 'images/holoPlate.pvz'],
      angularModules: ['tethered-ng']
    },


    designTemplate: function () {
      return '<twx-dt-model id="#widgetId#" src="/extensions/images/holoPlate.pvz" opacity="1" hidden="false" scale="{{me.scale}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" decal="{{me.decal}}" shader="{{me.shader}}""></twx-dt-model><div class="tetheredWidget">Remember to Enable Tracking Events</div>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var ctrl = '<div ng-tethered class="ng-hide tetheredWidget ' + props.class + '" id-field="' + props.widgetId + '" isholo-field='+forholo+' step-field={{me.steps}} shader-field="me.shader" offset-field={{me.offset}} visible-field={{me.visible}} auto-field={{me.auto}} snap-field={{me.snap}} affects-field={{me.affects}} width-field={{me.width}} height-field={{me.height}} delegate-field="delegate"></div>';
      var ps   = '<script name="holoPlate" type="x-shader/x-fragment"> Texture2D Texture:register(t0); sampler Sampler:register(s0); cbuffer ShaderConstantBuffer:register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer:register(b1) { float tick; float3 padding; float4 hand; }; cbuffer MaterialConstantBuffer:register(b2) { float4 diffuseColor; int twoSided; int useTextureMap; int useNormalMap; int useSpecularMap; }; cbuffer TMLDefinedConstants:register(b10) { float cutoffDepth; }; struct PixelShaderInput { half4 pos:SV_POSITION; half4 world:POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; }; float HoverLight(float4 hoverLight,float3 worldPosition,float alpha) { float ir=1. - saturate(length((hoverLight.xyz - worldPosition) / hoverLight.w)); return ir*ir*alpha; } float2 raytrace(float3 x1,float3 x0,float3 I) { float3 x2=x1 + I; float3 n21=x2 - x1; float3 n10=x1 - x0; float n1=dot(n10,n21); float l21=length(n21); float t=-n1 / (l21*l21); float l10=length(n10); float d=((l10*l10)*(l21*l21) - (n1*n1)) / (l21*l21); return float2(t,d); } min16float4 main(PixelShaderInput input):SV_TARGET { const float hlw=0.05; float bigW=hlw*5.; float4 HoverLightPosition=float4 (hand.xyz,hlw);  float bigD=saturate(length((HoverLightPosition.xyz - input.world.xyz) / bigW)); float brightness=1. - bigD; float falloff=pow(brightness,3.); float width=0.5; float crad=0.; float thickness=0.005; float outer=width - crad; float inner=outer - thickness; float4 f=Texture.Sample(Sampler,input.tx); f=f + diffuseColor*(1. - f.w); float3 edge; float2 mtx=abs(input.tx) % 1; if (crad > 0.) { float r1=step(crad,length(max(abs(mtx - float2(width,width)) - inner,0.))); float r2=step(length(max(abs(mtx - float2(width,width)) - outer,0.)),crad); float sq=r1*r2; edge=float3 (sq,sq,sq); f += float4(edge,sq); } else { float2 r=abs(mtx - float2(width,width)); float s=max(r.x,r.y); float sq=step(inner,s)*step(s,outer); edge=float3 (sq,sq,sq); f += float4(.1*edge,sq); } float2 ray=raytrace(input.I,input.world.xyz,input.viewDir); float d=step(ray.x,0.)*smoothstep(0.005,0.0,ray.y); float3 RimColor=float3(.5,.5,.5); float RimPower=3.; f.rgb += edge*d*RimColor; f.a *= transparency; float ilen=length(input.world.xyz - input.I); float gz=smoothstep(0.15,0.3,ilen); min16float4 outputColor=min16float4(f*gz); return outputColor; } </script>';
      var vs   = '<script name="holoPlate" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer:register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer:register(b1) { float4 diffuseColor; }; cbuffer ViewProjectionConstantBuffer:register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; float4x4 viewRotationInverse; }; struct VertexShaderInput { half4 pos:POSITION; half4 normal:NORMAL; half2 texcoord: TEXCOORD; uint instId:SV_InstanceID; }; struct VertexShaderOutput { half4 pos:SV_POSITION; half4 world: POSITION; half4 color:COLOR0; half3 I:NORMAL0; half3 N:TEXCOORD0; half2 tx:TEXCOORD1; half3 viewDir:TEXCOORD2; uint rtvId:SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos=half4(input.pos); int idx=input.instId % 2; pos=mul(pos,model); output.world=(half4)pos; half4 eye=half4(0.,0.,0.,1.); output.I=mul(eye,viewInverse).xyz;  pos=mul(pos,viewProjection[idx]); output.pos=(half4)pos; output.N=normalize(mul(input.normal,inverse).xyz); output.color=half4(diffuseColor); output.tx=input.texcoord; output.viewDir=normalize(mul(half4(0,0,1,1),viewRotationInverse).xyz); output.rtvId=idx; return output; } </script>';
      var tmpl =  '<twx-dt-model id="' + props.widgetId + '" class="ng-hide toggle3dWidget ' + props.class + '"' +
      'id-field="' + props.widgetId + '" isholo-field='+forholo+' ' +
      'ng-src="{{me.src}}" src="" opacity="1" ' +  // hidden="{{!app.fn.isTrue(me.visible)}}" ' + 
      'x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" ' + 
      'sx={{me.width}} sy={{me.height}} sz=1 '+
      'decal="{{me.decal}}" shader="{{me.shader}}"></twx-dt-model>';
      return tmpl+ps+vs+ctrl;
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
        if (root != undefined)
          root.setProp('enabletrackingevents', true);
      }
      
      this.widgetCreated = function(widgetCtrl) {
      }
      
      this.widgetAdded = function(widgetCtrl, dropTarget) {
      }
      
      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
          
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

      };

      return this;
    },

  }
}

twxAppBuilder.widget('twxTethered', twxTethered);