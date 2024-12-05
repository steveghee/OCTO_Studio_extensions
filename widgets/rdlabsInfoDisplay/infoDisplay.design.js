function twxInfoDisplay() {
  return {
    elementTag: 'octo-infodisplay',
      
    label    : 'Information Display',
    
    category : 'ar',
    groups   : ['OCTO'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return false; //!!builderSettings.octo; //WIP
    },
    
    properties: [
      {
            name: 'imgSrc',
           label: 'Image template',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png'],
         default: '../../extensions/images/infoDisplay.png',
 isBindingTarget: true,
      isVisible : true
      },
      {
            name: 'nearfade',
           label: 'Cutoff distance (m)',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
       isVisible: true
      },
      {
            name: 'farfade',
           label: 'Fade in distance (m)',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
       isVisible: true
      },
      {
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true
      },
      {
            name: 'infodata',
           label: 'ves-basic-web-widgets-extension:Data',
        datatype: 'infotable',
 isBindingTarget: true,
 isBindingSource: true,
       showInput: false,
       isVisible: true
      }
    ],

    events: [
      {
        name: 'clicked',
        label: 'Click'
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
      files         : ['js/matrix.js', 'js/infodisplay-ng.js', 'images/infoPanel.png'],
      angularModules: ['infodisplay-ng']
    },


    designTemplate: function (data, html) {
      return '';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var forholo = (projectSettings.projectType === 'eyewear');
      var vs0g  = '<script name="multifuncDisplaygl" type="x-shader/x-vertex"> attribute vec3 vertexPosition; attribute vec2 vertexTexCoord; varying vec2 texCoord; varying vec3 I; varying float dotp; uniform mat4 modelViewProjectionMatrix; uniform mat4 modelViewMatrix; uniform mat4 modelMatrix; uniform mat4 normalMatrix; void main() { vec4 vertexNormal=vec4(0.,0.,1.,0.); vec4 vp = vec4(vertexPosition,1.0); gl_Position = modelViewProjectionMatrix*vp; texCoord = vertexTexCoord; vec3 vv = vec3(modelViewMatrix*vp); vec3 N = vec3(normalize(normalMatrix*vertexNormal)); I = vv.xyz-vec3(0); dotp = dot(N,normalize(I)); } </script>';
      var ps0g  = '<script name="multifuncDisplaygl" type="x-shader/x-fragment"> precision mediump float; varying vec2 texCoord; varying vec3 I; varying float dotp; uniform sampler2D texSampler2D; uniform sampler2D texSampler2D1; uniform float r; uniform float g; uniform float b; uniform float ff; uniform float nf;void main(void) { vec4 hlt = vec4(r,g,b,1.); vec4 tx1 = texture2D(texSampler2D,texCoord); vec4 tx2 = texture2D(texSampler2D1,texCoord); vec4 rx2 = (tx2.r*hlt+vec4(1.)*tx2.b)*tx2.a; float dz = length(I); float cd = (ff>0.) ? smoothstep( (ff*2.),ff,dz):1. ; float od = smoothstep( (nf/2.),nf,dz); float gz = clamp(cd*od,0.,1.) ; if (dotp<0.) tx1 = mix(tx1,vec4(0.,0.,0.,1.-dotp),tx1.a); gl_FragColor = mix(rx2,mix(tx1,rx2,rx2.a),gz);}</script>';
      //TODO: hololens versions
      
      var shade = forholo ? "" : vs0g+ps0g;
      
      var ctrl = '<div ng-infodisplay id-field="' + props.widgetId + '" isholo-field=' + forholo +
                 ' disabled-field={{me.disabled}} infodata-field="me.infodata"'+
                 ' farfade-field={{me.farfade}} nearfade-field={{me.nearfade}} infodata-field="me.infodata"'+
                 ' src-field={{me.imgSrc}} delegate-field="delegate"></div>\n';
      return ctrl+shade;
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
        //if (root != undefined)
        //  var ete = root.getProp('enabletrackingevents');
        if (root != undefined)
          root.setProp('enabletrackingevents', true);
      }
      
      this.widgetCreated = function(widgetCtrl) {
      }
      
      this.widgetAdded = function(widgetCtrl, dropTarget) {
      }
      
      //
      // called when a widgets properties are altered
      //
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
      /*          
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
      */
      };

      return this;
    },

  }
}

twxAppBuilder.widget('twxInfoDisplay', twxInfoDisplay);