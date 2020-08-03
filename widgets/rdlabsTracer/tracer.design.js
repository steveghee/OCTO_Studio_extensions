function twxTracer() {
  return {
    elementTag: 'twx-tracer',

    label: 'Tracer',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

    properties: [
      {
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'x',
           label: 'X',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'y',
           label: 'Y',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'z',
           label: 'Z',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rx',
           label: 'rX',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'ry',
           label: 'rY',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rz',
           label: 'rZ',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'speed',
           label: 'Speed',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'frequency',
           label: 'Frequency',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'cutoff',
           label: 'Cutoff',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
        name: 'color',
        label: 'Color',
        datatype: 'select',
        default: 'like',
        isBindingTarget: false,
        editor: 'select',
        options: [
            {label: 'Red'      , value: "[1,0,0,1]"},
            {label: 'Green'    , value: "[0,1,0,1]"},
            {label: 'Blue'     , value: "[0,0,1,1]"},
            {label: 'Yellow'   , value: "[1,1,0,1]"},
            {label: 'Black' ,    value: "[0,0,0,1]"},
            {label: 'White'    , value: "[1,1,1,1]"},
            {label: 'Magenta',   value: "[1,0,1,1]"},
            {label: 'Turquiose', value: "[0,1,1,1]"},
        ],
      },
    ],

    designTemplate: function () {
      return '<div class="TracerWidget">tracer</div>';
    },

    dependencies: {
      files         : ['js/tracer-ng.js'],
      angularModules: ['tracer-ng']
    },

    runtimeTemplate: function (props) {
      var vs = '<script name="tracer" type="x-shader/x-vertex">attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vertexTexCoord;}</script>';
      var ps = '<script name="tracer" type="x-shader/x-fragment">precision mediump float; const float twoPI=3.1415926; varying vec2 texcoord; uniform float frequency; uniform float tick; uniform vec4 surfaceColor; void main() { float o=-10.*mod(tick,20.0); float l=length(texcoord); float r=o + (l * frequency); float a1=sin(r); float a2=clamp(cos(l*twoPI),0.,1.); float a = a1 * a2; vec3 c = vec3(a1,l,a1); if (a<0.) discard; else gl_FragColor=vec4(c*surfaceColor.xyz,a);}</script>';
      var tmpl  = '<twx-dt-3dobject id="'+props.widgetId+'" class="tracerWidget" ';
      var props = 'hidden={{me.disabled}} x={{me.x}} y={{me.y}} z={{me.z}} rx={{me.rx}} ry={{me.ry}} rz={{me.rz}} sx={{me.radius*2}} sy={{me.radius*2}} sz={{me.radius*2}} ';
      var geom  = 'shader="tracer;frequency f {{me.frequency}}" vertices="[-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0]" normals="[]" texcoords="[-0.5,-0.5, 0.5,-0.5, 0.5,0.5, -0.5,0.5]" indexes="[0,1,2,0,2,3]" color="{{me.color}}"></twx-dt-3dmodel>';
      return vs+ps+tmpl+props+geom;
    }
  }
}

twxAppBuilder.widget('twxTracer', twxTracer);