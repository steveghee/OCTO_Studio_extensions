function twxPinger() {
  return {
    elementTag: 'twx-pinger',

    label: 'Pinger',
    
    category : 'ar',

    properties: [
      {
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
      },
      {
            name: 'radius',
           label: 'Radius',
        datatype: 'number',
         default: 0.05,
             min: 0.01,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rate',
           label: 'Pulse rate (per second)',
        datatype: 'number',
         default: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rings',
           label: 'Density (# rings)',
        datatype: 'number',
         default: 5,
             min: 1,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'direction',
           label: 'Outward pulse',
        datatype: 'boolean',
         default: false,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'src',
           label: 'Indicator',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
         default: '../../extensions/images/pingerBlank.png',
 isBindingTarget: true,
      isVisible : true
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
            name: 'billboard',
           label: 'ves-ar-extension:Billboard',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       sortOrder: 200
      },
      {
            name: 'decal',
           label: 'ves-ar-extension:Always on top',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       sortOrder: 230
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
            name: 'height',
           label: 'ves-ar-extension:Height',
        datatype: 'string',
         default: '0.1',
       isVisible: false
      },
      {
            name: 'width',
           label: 'ves-ar-extension:Width',
        datatype: 'string',
         default: '0.1',
       isVisible: false
      },
   
    ],

    dependencies: {
      files         : ['images/pingerBlank.png'],
    },


    designTemplate: function () {
      return '<twx-dt-image id="#widgetId#" src="/extensions/images/Pinger.png" opacity="1" hidden="false" width="{{me.width}}" height="{{me.height}}" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" billboard="{{me.billboard}}" occlude="{{me.occlude}}" decal="{{me.decal}}" shader="{{me.shader}}" istracked="{{me.istracked}}" trackingindicator="{{me.trackingIndicator}}" stationary="{{me.stationary}}"></twx-dt-image>';
    },

    runtimeTemplate: function (props) {
      var vs = '<script name="pinger" type="x-shader/x-vertex"> attribute vec4 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texcoord; uniform mat4 modelViewProjectionMatrix; void main() { gl_Position=vec4(modelViewProjectionMatrix * vertexPosition); texcoord = vertexTexCoord - 0.5; } </script> ';
      var ps = '<script name="pinger" type="x-shader/x-fragment"> precision mediump float; const float PI=3.1415926; varying vec2 texcoord; uniform float rings; uniform float fade; uniform float rate; uniform float direction; uniform float r; uniform float g; uniform float b; uniform float tick; uniform sampler2D texSampler2D; uniform vec4 surfaceColor; void main() { float viz = 1. - fade; float wrap = 2. * PI; float speed = (direction < 0.) ? 1.+rate : -1.-rate; float o= speed * mod(tick,wrap); float l=length(texcoord)*PI; float freq = max(rings * 2.,1.); float fr=o + (l * freq); float a1=sin(fr); float a2=clamp(cos(l),0.,1.); float a = viz * a1 * a2; vec3 c = vec3(r,g,b); if (length(c) == 0.) c=vec3(0.,1.,0.); vec4 tx1 = texture2D(texSampler2D,(texcoord + 0.5)); if (tx1.a >= 1.) { c = tx1.rgb; a = tx1.a; } if (a<0.) discard; else gl_FragColor=vec4(c,a); } </script>';
      //var tmpl  = '<twx-dt-3dobject id="' + props.widgetId + '" class="ng-hide PingerWidget ' + '" ';
      //var props = 'hidden={{me.disabled}} x={{me.x}} y={{me.y}} z={{me.z}} rx={{me.rx}} ry={{me.ry}} rz={{me.rz}} sx={{me.radius*2}} sy={{me.radius*2}} sz={{me.radius*2}}';
      //var geom  = 'shader="pinger;rings f {{me.rings}};rate f {{(me.disabled?-1:me.rate)}};fade f {{(me.disabled?1:0)}};direction f {{me.direction?1:-1}};r f {{me.color.split(\',\')[0]}};g f {{me.color.split(\',\')[1]}};b f {{me.color.split(\',\')[2]}}" vertices="[-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0]" normals="[]" texcoords="[-0.5,-0.5, 0.5,-0.5, 0.5,0.5, -0.5,0.5]" indexes="[0,1,2,0,2,3]" color="{{me.color}}"></twx-dt-3dmodel>';
      var tmpl = '<twx-dt-image id="' + props.widgetId + '" class="ng-hide PingerWidget ' + '" ';
      var props = 'hidden="{{!me.visible}}" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" width="{{me.radius*2}}" height="{{me.radius*2}}" sx="1" sy="1" sz="1" pivot="5" billboard="{{me.billboard}}" decal="{{me.decal}}"';
      var geom  = 'ng-src="{{me.src}}" src="" shader="pinger;rings f {{me.rings}};rate f {{(me.disabled?-1:me.rate)}};fade f {{(me.disabled?1:0)}};direction f {{me.direction?1:-1}};r f {{me.color.split(\',\')[0]}};g f {{me.color.split(\',\')[1]}};b f {{me.color.split(\',\')[2]}}"></twx-dt-image>';
      return vs+ps+tmpl+props+geom; 
    },
  
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // automatically adjuts the Z distance of the button from the backplate  
        if(changedProps.radius) {
          let newScale = 2 * changedProps.radius;
          widgetCtrl.setProp('width', newScale.toFixed(4));
          widgetCtrl.setProp('height', newScale.toFixed(4));
        }
      };
      return this;
    }

  }
}

twxAppBuilder.widget('twxPinger', twxPinger);