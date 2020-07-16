function twxFogger() {
  return {
    elementTag: 'twx-fogger',

    label: 'Fogger',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

    properties: [
      {
            name: 'class',
           label: 'Class',
        datatype: 'string',
         default: ''
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
            name: 'radius',
           label: 'Radius',
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
      return '<div class="foggerWidget">fog</div>';
    },


    runtimeTemplate: function (props) {
      var vs = '<script name="circle" type="x-shader/x-vertex">attribute vec3 vertexPosition; varying vec2 vertex; void main() {vertex=vertexPosition.xy; gl_Position=vec4(vertex.x, vertex.y, 0.0, 1.0);}</script>';
      var ps = '<script name="circle" type="x-shader/x-fragment">precision mediump float; varying vec2 vertex; uniform vec4 surfaceColor; uniform float radius; void main() { float r=1.0 - radius*length(vertex);gl_FragColor=vec4(surfaceColor.r, surfaceColor.g, surfaceColor.b,r);}</script>';
      var tmpl = '<twx-dt-3dobject id="'+props.widgetId+'" class="ng-hide foggerWidget ' + props.class + '" hidden={{me.disabled}} shader="circle;radius f {{me.radius}}" vertices="[-0.95,-0.95,1, 0.95,-0.95,1, 0.95,0.95,1, -0.95,0.95,1]" normals="[]" indexes="[0,1,2,0,2,3]" color="{{me.color}}"></twx-dt-3dmodel>';
      return vs+ps+tmpl;
    }
  }
}

twxAppBuilder.widget('twxFogger', twxFogger);