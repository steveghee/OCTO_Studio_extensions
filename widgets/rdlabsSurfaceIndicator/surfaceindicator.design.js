function twxSurfaceIndicator() {
  return {
    elementTag: 'twx-surfaceindicator',

    label     : 'Surface Indicator',
    category  : 'ar',
    groups    : ['OCTO Labs'],

    properties: [
      {
            name: 'label',
           label: 'Label',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'src',
           label: 'Indicator',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/dn-arrow.png',
 isBindingTarget: true,
        isVisible: function(props) {
                    return (props.is3d != true);
                  }
      },
      {
            name: 'model',
           label: 'Model Id',
        datatype: 'string',
         default: 'model-1',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'size',
           label: 'Height',
        datatype: 'number',
         default: 0.1,
             min: 0.01,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'info',
           label: 'Data',
        datatype: 'Infotable',
 isBindingTarget: true,
       showInput: true,
       isVisible: function(props, scope){
         let builderSettings = scope.$root.builderSettings || {};
         return !!builderSettings.octo; //WIP
       }
      },
      {
            name: 'results',
           label: 'Results',
        datatype: 'Infotable',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false,
       isVisible: true
      },
      {
        name: 'tangential',
        label: 'On Surface',
        datatype: 'boolean',
        default: false,
        isBindingSource: false,
        isBindingTarget: true,
        isVisible: function(props) {
                    return (props.is3d != true);
                  },
        showInput: true
      },
      {
        name: 'is3d',
        label: '3D pointer',
        datatype: 'boolean',
        default: false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'showLabel',
        label: 'Show Label',
        datatype: 'boolean',
        default: true,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'disabled',
        label: 'Disabled',
        datatype: 'boolean',
        default: false,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
      {
         name: 'complete',
        label: 'Completed'
      },
    ],

    designTemplate: function (data, html) {
      return '<div class="surfaceIndicatorWidget"></div>';
    },

    dependencies: {
      files         : ['js/surfaceindicator-ng.js','js/matrix.js','images/arrow3dsmall.pvz'],
      angularModules: ['surfaceindicator-ng']
    },

    runtimeTemplate: function (props) {
      var psgl = '<script name="indicatorProximitygl" type="x-shader/x-fragment">  precision mediump float;  varying vec3 vertex;  varying vec3 normal;  varying vec2 texcoord;  varying float dist;  uniform sampler2D texSampler2D;  uniform float cutoutDepth;  void main() { vec4 color = texture2D(texSampler2D,texcoord);    float d2 = cutoutDepth/2.;    if (color.a < 1.) discard;    else color.a  = smoothstep(d2,cutoutDepth,dist);    gl_FragColor = vec4(color);  }</script>';
      var vsgl = '<script name="indicatorProximitygl" type="x-shader/x-vertex">  attribute vec3 vertexPosition;  attribute vec3 vertexNormal;  attribute vec2 vertexTexCoord;  varying vec2 texcoord;  varying vec3 normal;  varying vec3 vertex;  varying float dist;  uniform mat4 modelViewProjectionMatrix;  uniform mat4 modelViewMatrix;  uniform mat4 normalMatrix;  void main() {    vec4 vp     = vec4(vertexPosition, 1.0);    gl_Position = modelViewProjectionMatrix * vp;    normal      = vec3(normalize(normalMatrix * vec4(vertexNormal,0.0)));    texcoord    = vertexTexCoord;    vertex      = vp.xyz;    vec3 vv     = vec3(modelViewMatrix * vp);    dist        = length(vv); } </script>';
        
      var tmpl = '<div ng-surfaceindicator show-field={{me.showLabel}} label-field={{me.label}} is3d-field={{me.is3d}} tangent-field={{me.tangential}} results-field="me.results" size-field={{me.size}} src-field={{me.src}} info-field="me.info" disabled-field={{me.disabled}} model-field={{me.model}}></div>';
      return tmpl+psgl+vsgl;
    }
  }
}

twxAppBuilder.widget('twxSurfaceIndicator', twxSurfaceIndicator);