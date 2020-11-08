function twxBusy3D() {
  return {
    elementTag: 'octo-busy3d',
      
    label    : 'Busy Indicator',
    
    category : 'ar',
    groups    : ['input'],
    
    isVisibleInPalette: function(scope) {
      let projectSettings = scope.$root.currentProject || {};
      return (projectSettings.projectType === 'eyewear');
    },

    properties: [
      {
            name: 'size',
           label: 'ves-ar-extension:Size',
        datatype: 'string',
         default: '0.04',
       isVisible: true
      },
      {
            name: 'height',
           label: 'ves-ar-extension:Height',
        datatype: 'string',
         default: '0.04',
       isVisible: false, 
       showInput: false
      },
      {
            name: 'width',
           label: 'ves-ar-extension:Width',
        datatype: 'string',
         default: '0.04',
       isVisible: false,
       showInput: false
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
      files         : ['images/loading.png']
    },
  
    designTemplate: function () {
      // if we use an image, we can at least position and size (width/height) correctly. Unfortunately we lose any 3d depth cues
      return '<twx-dt-image id="#widgetId#" src="/extensions/images/Busy Indicator.png" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" shader="{{me.shader}}" istracked="{{me.istracked}}" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}"></twx-dt-image>';
      
    },
  
    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var ps1  = '<script name="busybody" type="x-shader/x-fragment"> Texture2D Texture1 : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) { float4 highlightColor; bool useTexture; bool useLight; float transparency; int pad; }; cbuffer RenderConstantBuffer : register(b1) { float tick; float3 ding; }; struct PixelShaderInput { min16float4 pos : SV_POSITION; float2 tcoord: TEXCOORD0; }; min16float4 main(PixelShaderInput input) : SV_TARGET { float2 center = float2(.5,.5); float2 mtx = input.tcoord - center; float t2 = tick * 2. ; float st2 = sin(t2); float ct2 = cos(t2); float2 rtx = float2(mtx.x*ct2 - mtx.y*st2, mtx.y*ct2 + mtx.x*st2) + center; half4 textureColor = Texture1.Sample(Sampler, rtx); if (textureColor.a < 0.01) discard; return min16float4(textureColor); } </script>\n';
      var vs1  = '<script name="busybody" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) { float4x4 model; float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) { float4 diffuseColor; bool twoSided; }; cbuffer ViewProjectionConstantBuffer : register(b2) { float4x4 viewProjection[2]; float4x4 viewInverse; float4x4 viewRotationInverse; }; struct VertexShaderInput { half4 pos : POSITION; half4 normal : NORMAL; half2 texcoord: TEXCOORD; uint instId : SV_InstanceID; }; struct VertexShaderOutput { half4 pos : SV_POSITION; half2 tcoord : TEXCOORD0; uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) { VertexShaderOutput output; half4 pos = half4(input.pos); int idx = input.instId % 2; pos = mul(pos, model); output.tcoord = input.texcoord; pos = mul(pos, viewProjection[idx]); output.pos = (half4)pos; output.rtvId = idx; return output; } </script>\n';
      var ctrl = '<twx-dt-image id="' + props.widgetId + '"'+ 
                 'src="extensions/images/loading.png#edge=clamp" '+
                 'height="{{me.height}}" width="{{me.width}}" '+
                 'x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" hidden="{{!app.fn.isTrue(me.visible)}}" '+
                 'shader="busybody" interactable-hint="true" decal="false" pivot="5" sx="1" sy="1" sz="1"/>\n';
      return ctrl+ps1+vs1;
    },
    
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // automatically adjuts the Z distance of the button from the backplate  
        if(changedProps.size) {
          let size  = (oldProps.size) ? oldProps.size.value : 0.04;
          widgetCtrl.setProp('height', size);
          widgetCtrl.setProp('width' , size);
        }
      };

      return this;
    }
  }
}

twxAppBuilder.widget('twxBusy3D', twxBusy3D);
