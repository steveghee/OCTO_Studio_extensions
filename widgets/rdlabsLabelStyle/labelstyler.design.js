function twxLabelStyler() {
  return {
    elementTag: 'twx-labelstyler',

    label: '3D Label Style',
    
    category : 'ar',

    properties: [
      {
            name: 'style',
           label: 'Style',
        datatype: 'select',
         default: "onesided-text",
 isBindingTarget: false,
          editor: 'select',
         options: [
            {label: 'Single Sided'      , value: "onesided-text"},
            {label: 'Double - Mirrored' , value: "twosided-text"},
            {label: 'Double - Blanked'  , value: "twosided-blank"}
         ]
      },
      {
            name: 'color',
           label: 'Color',
        datatype: 'select',
         default: "0.,1.,0.",
 isBindingTarget: false,
          editor: 'select',
         options: [
            {label: 'Red'      , value: "1.,0.,0."},
            {label: 'Green'    , value: "0.,1.,0."},
            {label: 'Blue'     , value: "0.,0.,1."},
            {label: 'Yellow'   , value: "1.,1.,0."},
            {label: 'Black' ,    value: "0.,0.,0."},
            {label: 'White'    , value: "1.,1.,1."},
            {label: 'Magenta',   value: "1.,0.,1."},
            {label: 'Turquiose', value: "0.,1.,1."},
            ],
         isVisible:function(props) {
             return props.style=="twosided-blank";
             }
      },
    ],
    
    runtimeTemplate: function (props) {
      var vs0 = '<script name="onesided-text" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texCoord; varying float dotp; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 modelMatrix; uniform mat4 normalMatrix; void main() { vec4 vertexNormal=vec4(0.,0.,1.,0.); vec4 vp = vertexPosition; gl_Position = modelViewProjectionMatrix * vp; texCoord = vertexTexCoord; vec3 vv = vec3(modelViewMatrix * vp); vec3 N = vec3(normalize(normalMatrix * vertexNormal)); vec3 I = normalize(vv.xyz - vec3(0)); dotp = dot(N,I); } </script>;'
      var ps0 = '<script name="onesided-text" type="x-shader/x-fragment"> precision mediump float; varying vec2 texCoord; varying float dotp; uniform float transparency; uniform sampler2D texSampler2D; void main(void) { if (dotp < 0.) discard; else { vec4 tx = texture2D(texSampler2D, texCoord.xy); tx.a = transparency * tx.a; gl_FragColor = tx; } } </script>;'

      var vs1 = '<script name="twosided-text" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texCoord; varying float dotp; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 modelMatrix; uniform mat4 normalMatrix; void main() { vec4 vertexNormal=vec4(0.,0.,1.,0.); gl_Position = modelViewProjectionMatrix * vertexPosition; vec4 vv = modelViewMatrix * vertexPosition; vec3 N = vec3(normalize(normalMatrix * vertexNormal)); vec3 I = normalize(vv.xyz - vec3(0)); dotp = dot(N,I); texCoord = dotp < 0. ? vec2(1. - vertexTexCoord.x, vertexTexCoord.y) : vertexTexCoord; } </script>';
      var ps1 = '<script name="twosided-text" type="x-shader/x-fragment"> precision mediump float; varying vec2 texCoord; varying float dotp; uniform sampler2D texSampler2D; void main(void) { vec4 tx = texture2D(texSampler2D, texCoord.xy); gl_FragColor = tx; } </script>';
      
      var vs2 = '<script name="twosided-blank" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texCoord; varying float dotp; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 modelMatrix; uniform mat4 normalMatrix; void main() { vec4 vertexNormal=vec4(0.,0.,1.,0.); vec4 vp = vertexPosition; gl_Position = modelViewProjectionMatrix * vp; texCoord = vertexTexCoord; vec3 vv = vec3(modelViewMatrix * vp); vec3 N = vec3(normalize(normalMatrix * vertexNormal)); vec3 I = normalize(vv.xyz - vec3(0)); dotp = dot(N,I); } </script>';
      var ps2 = '<script name="twosided-blank" type="x-shader/x-fragment"> precision mediump float; varying vec2 texCoord; varying float dotp; uniform float transparency; uniform sampler2D texSampler2D; void main(void) { vec4 tx; if (dotp < 0.) tx = vec4('+props.color+',1.); else { tx = texture2D(texSampler2D, texCoord.xy); tx.a = transparency * tx.a; } gl_FragColor = tx; } </script>';
      
      var tmpl = '<style id="styles"> twx-dt-label, twx-dt-image {  shader:'+props.style+'; } </style>';
      return vs0+ps0+vs1+ps1+vs2+ps2+tmpl; 
    }
  
  }
}

twxAppBuilder.widget('twxLabelStyler', twxLabelStyler);
