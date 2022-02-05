(function (twxAppBuilder) {
  function newOctoPinger(widgetLabel) {
    var ELEMENT_NAME = 'octo-pinger';
    var overlay = {};

    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.rx.default = -90;

    overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/placeholder_img.svg');

    overlay.src = {
      name: 'src',
      label: 'ves-ar-extension:Resource',
      datatype: 'resource_url',
      resource_image: true,
      allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif', '.bmp'],
      default: '',
      isBindingTarget: true,
      tFrag: 'ng-src="{{me.src | trustUrl}}" src="#src#"',
      sortOrder: 1,
    };
    overlay.color = {
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
         tFrag:'shader="pingergl;rings f {{me.rings}};rate f {{(me.disabled?-1:me.rate)}};fade f {{(me.disabled?1:0)}};direction f {{me.direction?1:-1}};r f {{me.color.split(\',\')[0]}};g f {{me.color.split(\',\')[1]}};b f {{me.color.split(\',\')[2]}}"'
      };
      overlay.radius = {
            name: 'radius',
           label: 'Radius',
        datatype: 'number',
         default: 0.05,
             min: 0.01,
 isBindingSource: false,
 isBindingTarget: true,
 showInput: true,
 tFrag:'scale="{{me.radius}}"'
      };
      overlay.rate={
            name: 'rate',
           label: 'Pulse rate (per second)',
        datatype: 'number',
         default: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      };
      overlay.rings={
            name: 'rings',
           label: 'Density (# rings)',
        datatype: 'number',
         default: 5,
             min: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      };
      overlay.direction={
            name: 'direction',
           label: 'Outward pulse',
        datatype: 'boolean',
         default: false,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      };
      overlay.disabled={
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      };

    overlay.pivot = Twx3dCommon.getPivotProperty();
    overlay.width = Twx3dCommon.getWidthProperty();
    overlay.height = Twx3dCommon.getHeightProperty();
    overlay.class = Twx3dCommon.getClassProperty();
    overlay.experimentalOneSided = Twx3dCommon.getOneSidedProperty();

    // matching the sort order in twxDtLabel
    overlay.height.sortOrder = 2;
    overlay.width.sortOrder = 2.1;
    
    var removals = ['billboard', 'occlude', 'opacity', 'shader', 'decal'];
    var props = Twx3dCommon.new3dProps(overlay,removals);
    var template = Twx3dCommon.buildRuntimeTemplate('octoPinger', props);

    var retObj = {
      elementTag: ELEMENT_NAME,

      isVisibleInPalette: true,

      category: 'ar',

      groups: ['Augmentations'],

      label: widgetLabel,

      isContainer: false,

      properties: props,

      events: [
        {
          name: 'click',
          label: 'ves-ar-extension:Click',
        },
      ],
      
      dependencies: {
        files         : ['js/pinger2-ng.js'],
        angularModules: ['octoPinger-ng']
      },


      designTemplate: function (props) {
          return '<octopinger id="#widgetId#" src="/extensions/images/Pinger.png" opacity="1" hidden="false" width="{{me.radius}}" height="{{me.radius}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}"></octopinger>';
      },

      runtimeTemplate: function (props) {
        var vs0 = '<script name="pingergl" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vertexTexCoord - 0.5; } </script> ';
        var ps0 = '<script name="pingergl" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec2 texcoord; uniform float rings; uniform float fade; uniform float rate; uniform float direction; uniform float r; uniform float g; uniform float b; uniform float tick; uniform sampler2D texSampler2D; uniform vec4 surfaceColor; void main() { float viz = 1. - fade; float wrap = 2. * PI; float speed = (direction < 0.) ? 1.+rate : -1.-rate; float o= speed * mod(tick,wrap); float l=length(texcoord)*PI; float freq = max(rings * 2.,1.); float fr=o + (l * freq); float a1=sin(fr); float a2=clamp(cos(l),0.,1.); float a = viz * a1 * a2; vec3 c = vec3(r,g,b); if (length(c) == 0.) c=vec3(0.,1.,0.); vec4 tx1 = texture2D(texSampler2D,(texcoord + 0.5)); if (tx1.a >= 1.) { c = tx1.rgb; a = tx1.a; } if (a<0.) discard; else gl_FragColor=vec4(c,a); } </script>';
        var vs1 = '<script name="pingerhl" type="x-shader/x-vertex"> cbuffer ModelConstantBuffer : register(b0) {  float4x4 model;  float4x4 inverse; }; cbuffer MaterialConstantBuffer : register(b1) {  float4 diffuseColor;  bool twoSided; }; cbuffer ViewProjectionConstantBuffer : register(b2) {  float4x4 viewProjection[2];  float4x4 viewInverse;  float4x4 viewRotationInverse; }; struct VertexShaderInput {  half4 pos : POSITION;  half4 normal : NORMAL;  half2 texcoord: TEXCOORD;  uint instId : SV_InstanceID; }; struct VertexShaderOutput {  half4 pos : SV_POSITION;  half2 tcoord : TEXCOORD0;  uint rtvId : SV_RenderTargetArrayIndex; }; VertexShaderOutput main(VertexShaderInput input) {  VertexShaderOutput output;  half4 pos = half4(input.pos);  int idx = input.instId % 2;  pos = mul(pos, model);  output.tcoord = input.texcoord - 0.5;  pos = mul(pos, viewProjection[idx]);  output.pos = (half4)pos;  output.rtvId = idx;  return output; } </script>';
        var ps1 = '<script name="pingerhl" type="x-shader/x-fragment"> Texture2D Texture1 : register(t0); sampler Sampler : register(s0); cbuffer ShaderConstantBuffer : register(b0) {  float4 highlightColor;  bool useTexture;  bool useLight;  float transparency;  int pad; };  cbuffer RenderConstantBuffer : register(b1) {  float tick;  float3 ding; }; struct PixelShaderInput {  min16float4 pos : SV_POSITION;  float2 tcoord: TEXCOORD0; }; cbuffer TMLDefinedConstants : register(b10) {  float direction;  float fade;  float rings;  float rate;  float r;  float g;  float b; }; min16float4 main(PixelShaderInput input) : SV_TARGET {  const float PI = 3.1415926;  float4 color;  float2 center = float2(.5,.5);   half4 texture1Color = Texture1.Sample(Sampler, input.tcoord + center);  float viz = 1. - fade;   float wrap = 2. * PI;   float speed = (direction < 0.) ? 1. + rate : -1. - rate;  float o = speed * tick % wrap;  float l = length(input.tcoord)*PI;  float freq = max(rings * 2.,1.);  float fr = o + (l * freq);  float a1 = sin(fr);  float a2 = clamp(cos(l),0.,1.);  float a = a1 * a2;  color = half4(r,g,b,a);  if (length(color.rgb) == 0.) color=half4(0.,1.,0.,a);  color = texture1Color.a == 1. ? texture1Color : viz * color;  if (color.a < 0.01) discard;  return min16float4(color.rgb, color.a); } </script>';

        return vs0+ps0+vs1+ps1+template.replace('#widgetId#', props.widgetId).replace('#src#', props.src);
      },
      delegate: function () {
          
        this.childWidgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
          console.log('here',currentProps);
        },
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

    };
    return retObj;
  }
  
  /*
  function pingerDirective() {
  'use strict';
  var octoPingerModule = angular.module('octoPinger-ng', []);
  octoPingerModule.directive('octopinger', [ 'tml3dRenderer', '$animate', function (renderer, $animate) {
        return {
            restrict: 'E',
            require: '^twxDtTracker',
            link: function (scope, element, attrs, ctrl) {
                // We have to backup tracker as it will change when next twxDtTracker is encountered by Angular.
                var tracker = scope.tracker;

                var addFunction = function addFunction (addFunctionAddAPICallCallback, addFunctionSuccessCallback,
                                                        addFunctionFailureCallback) {
                    var asset = VF_ANG.createObj("octopinger", element);
                    $animate.enabled(element, false);

                    asset.addAsset = function() {
                        var addSuccessCallback = function() {
                            addFunctionSuccessCallback();

                            VF_ANG.addAssetCallback(scope, asset, renderer);
                        };

                        var addFailureCallback = function (error) {
                            addFunctionFailureCallback();

                            console.log("Error in addPinger for [" + element.attr("id") + "] due to [" + error + "]");
                        };

                        var image = element.attr("src");
                            VF_ANG.addAsset(renderer, asset, function() {
                                addFunctionAddAPICallCallback();

                                var params = {
                                    "tracker" : tracker.name,
                                    "id" : element.attr("id"),
                                    "src" : image,
                                    "parent" : asset.parentId,
                                    "leaderX" : element.attr("leaderx"),
                                    "leaderY" : element.attr("leadery"),
                                    "anchor" : element.attr("anchorType"),
                                    "width" : element.attr("width"),
                                    "height" : element.attr("height"),
                                    "pivot" : element.attr("pivot"),
                                    "preload" : element.attr("preload")
                                };

                                renderer.add3DImage(params,
                                                    addSuccessCallback,
                                                    addFailureCallback);
                            });
                        
                    };

                    ctrl.addAssetOrQueueForAdditionIfNeeded(tracker, asset);
                };

                var setFunction = function setFunction () {
                    var image = element.attr("src");
                    renderer.setTexture(element.attr('id'), element.attr('src'));
                };

                var attributeNames = [ "class", "src" ];
                VF_ANG.setupWatchWithAddSetConvention(scope, element, attributeNames, addFunction, setFunction);
            }
        };
    }]);
  }
  */
  function octoPinger() {
    //This call gets a cached widget - if there is one. Arguably, though, we don't want a cached widget -
    // we want a new widget each time _BUT_ when a widget is in a scene - its ctor is called over 30 times
    // per instance of widget so lets see what happens if I return a cached value.
    var widget = Twx3dCommon.getWidget('Pinger2', newOctoPinger);
    //pingerDirective();
    return widget;
  }

  twxAppBuilder.widget('octoPinger', octoPinger);
})(twxAppBuilder);


