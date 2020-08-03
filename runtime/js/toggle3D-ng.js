if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'toggle3D-ng';
}

(function () {
  'use strict';

  var Toggle3DModule = angular.module('toggle3D-ng', []);
  Toggle3DModule.directive('ngToggle3d', ['$timeout', '$http', '$window', '$injector', ngToggle3D]);

  function ngToggle3D($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        isholoField        : '@',
        widthField         : '@',  
        heightField        : '@',
        fontField          : '@',
        idField            : '@',  
        disabledField      : '@',
        backerField        : '@',
        textField          : '@',
        textnotpressedField: '@',
        srcField           : '@',
        srcnotpressedField : '@',
        pressedField       : '=',
        notpressedField    : '@',
        delegateField      : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                       id: undefined,
                    width: 0.04,
                   height: 0.04,
                fontColor: '#ffffff',
                  pressed: false,
               notpressed: true,
                 disabled: undefined,
                   backer: undefined,
                     text: '',
           textnotpressed: '',
                      src: '',
            srcnotpressed: '',
                activated: false
                     };
             
        //////////////////////////////////////////////////////////////////////
        // user tapped the button
        //
        scope.$root.$on('userpick', function(evt, src) { 
          if (scope.data.id === src && !scope.data.disabled) {
            updatetoggle3D(true);
          }
        });

        //////////////////////////////////////////////////////////////////////
        //setup stuff    
        //
        function isbool(v) {
          return (v==='true')||v===true;
        }
        
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        
        //////////////////////////////////////////////////////////////////////
        // Draws an Image and a label on a 3D Button to 
        //
        var drawIconAndLabel = function(widget,isrc,itext) {
  
          // Preview can only use HEX in cavas so we convert here to get same results
          function rgb2hex(rgb){
            rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
            return (rgb && rgb.length === 4) ? "#" +
              ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
          }
  
          function multiline(text,tx,ty,maxWidth,lineHeight,context) {
            var words = text.split(' ');
            var line = '';
            var lines = [];

            for(var n = 0; n < words.length; n++) {
              var testLine = line + words[n] + ' ' ;
              var metrics = context.measureText(testLine);
              var testWidth = metrics.width;
              if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
              }
              else {
                line = testLine;
              }
            }
            lines.push(line);

            var lc = lines.length;
            var sy = ty - lc * lineHeight / 2;
            lines.forEach(function(line) {
              context.fillText(line, tx, sy);
              sy += lineHeight;
            });

          }
          
          // Add new property to check if the function is only called once. If we don't do it we loop the image!
          var wdg = widget;
          
          let background = new Image();
          background.src = isrc;
          let text       = itext;
          background.onload = function() {
            let canvas = document.createElement("canvas");
            let aspectLimit = 1.5;  
      
            // work out size/dims of the canvas
            let scaleH    = scope.data.height / 0.04
            let imageWidth= scaleH * 172;
            var aspect    = wdg.width / wdg.height;
            canvas.width  = 512 * scaleH * aspect;
            canvas.height = 512 * scaleH;
            
            let s96  =  96 * scaleH; // scaled x margin for image
            let s170 = 170 * scaleH; // scaled y margin for image
            let s220 = 220 * scaleH; // scaled y offset for text
            let s40  =  40 * scaleH; // scaled y offset for text
            let s24  =  24 * scaleH; // scaled x margin offset for text
            
            let ctx = canvas.getContext("2d");
            var ix = aspect>aspectLimit?s96:(canvas.width/2)-(imageWidth/2);  // if the button is wide, draw the image to the left, otherwise center it
            var iy = s170;
            ctx.drawImage(background, ix, iy, imageWidth,imageWidth);
      
            ctx.textAlign = aspect>aspectLimit?"left":"center";
            ctx.fillStyle = rgb2hex(wdg.fontColor); //pass in font color prop
            
            ctx.font = "bold 70px Arial";           // Segoe only works with some tricky stuff see Styles for more information
            var tx = aspect>aspectLimit?ix+s220:canvas.width/2; // if the button is square, center the text, otherwise draw to the right of the image
            var ty = aspect>aspectLimit?(canvas.height/2)+55:canvas.height-s40; // if centered, draw below the image
      
            // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
            multiline(text,tx,ty,aspect>aspectLimit?canvas.width-tx-12:canvas.width-s24,70,ctx);
      
            var newimg = canvas.toDataURL() + '#edge=clamp';  
            
            //wdg.src = newimg; // need to save it back to src property becuase the texture will updated with the last set Image if you change for example colors
            //scope.textureField = newimg; // on hololens we need this aswell becuase he will not change it on first click!
            scope.renderer.setTexture(scope.data.id,newimg);
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!scope.data.backer});
          }          
 
        }
        
        //////////////////////////////////////////////////////////////////////
        // draw the buttton
        //
        var rendertoggle3D = function(trigger) {
          //if (!scope.data.activated) return;
            
          var triggered = trigger != undefined && trigger === true;  
          var pressed = undefined;  
          $timeout(function() {
            if (scope.pressedField === true) {
                
              var txt = scope.data.text != "" ? scope.data.text : scope.data.textnotpressed;   
              var isrc = scope.data.src != "" ? scope.data.src  : scope.data.srcnotpressed;
              if (isrc === undefined || isrc === "") isrc = 'extensions/images/toggleMissing.png';
              
              pressed = true;
              drawIconAndLabel(scope.data, isrc, txt);
              
            } else {
              
              var txt = scope.data.textnotpressed != "" ? scope.data.textnotpressed : scope.data.text;   
              var isrc = scope.data.srcnotpressed != "" ? scope.data.srcnotpressed : scope.data.src;
              if (isrc === undefined || isrc === "") isrc = 'extensions/images/toggleMissing.png';
              
              pressed = false
              drawIconAndLabel(scope.data, isrc, txt);
              
            }
            
            if (triggered) {
                
              if (pressed === true) {
                scope.$parent.fireEvent('pressed');
              } else if (pressed === false) {
                scope.$parent.fireEvent('unpressed');
              }
            
              scope.data.pressed    = (scope.pressedField    != undefined) ? isbool(scope.pressedField) : false;
              scope.data.notpressed = (scope.notpressedField != undefined) ? isbool(scope.notpressedField) : false;
            
            }

          },1);
        }
        
        //////////////////////////////////////////////////////////////////////
        // toggle the button
        // note that the draw is asynchronous i.e. it _should_ be picked up
        // when the $watch on pressedField spots that it changed...
        //
        var updatetoggle3D = function(toggle) {
          
          // this should trigger the watch(pressed/notpressed)  
          if (toggle) $timeout(function() {
            var old               =  scope.pressedField;
            scope.pressedField    = !scope.pressedField;
            scope.notpressedField = old;
          },1);
        
        };
        var settoggle3D = function() {
          if (!scope.data.disabled) $timeout(function() {
            scope.notpressedField = false;
            scope.pressedField = true;                                 
          },1);
        }
        var resettoggle3D = function() {
          if (!scope.data.disabled) $timeout(function() {
            scope.notpressedField = true;
            scope.pressedField = false;
          },1);
        }
        
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['disabledField'], function () {
          var dis = (scope.disabledField != undefined) ? isbool(scope.disabledField) : false;
          // is this has changed, we update the shader
          if (scope.data.disabled != dis) {
              
            scope.data.disabled = dis;
            
            // ideally we would toggle the shader here, but whilst we can toggle between the prototype octo shaders, we
            // cannot untoggle and return to the built-inshader, wich actually shaders the button differently (better!)
            // the switch makes this inconsistent, so disabling it for now.
            
            var isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
            if (isholo && !twx.app.isPreview()) {
              scope.renderer.setProperties(scope.data.id+'_button',{shader:dis?"holoUIni":"holoUI"});
            }
            
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!scope.data.backer});
            rendertoggle3D(false);  
              
          }
        });
            
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['backerField'], function () {
          var backer = (scope.backerField != undefined) ? isbool(scope.backerField) : false;
          
          // is this has changed, we update the shader
          if (scope.data.backer != backer) {
              
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!backer});
            scope.data.backer = backer;
          }
        });
            
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['idField','widthField','heightField','fontField'], function () {
          scope.data.id       = (scope.idField       != undefined) ? scope.idField     : undefined;
          scope.data.width    = (scope.widthField    != undefined) ? scope.widthField  : 0.04;
          scope.data.height   = (scope.heightField   != undefined) ? scope.heightField : 0.04;
          scope.data.fontColor= (scope.fontField     != undefined) ? scope.fontField   : '#ffffff';
        });
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['textField', 'textnotpressedField','srcField', 'srcnotpressedField'], function () {
          scope.data.text           = (scope.textField           != undefined) ? scope.textField           : '';
          scope.data.textnotpressed = (scope.textnotpressedField != undefined) ? scope.textnotpressedField : '';
          scope.data.src            = (scope.srcField            != undefined) ? scope.srcField            : '';
          scope.data.srcnotpressed  = (scope.srcnotpressedField  != undefined) ? scope.srcnotpressedField  : '';
          
          rendertoggle3D(false);
        });
            
        //////////////////////////////////////////////////////////////////////
        // if things change externally, we may need to fire events
        // note that we only watch pressedField.  notPressedField is output only
        //
        scope.$watchGroup(['pressedField'], function () {
          rendertoggle3D(true);
        });
            
        //////////////////////////////////////////////////////////////////////
        // handle external events (service calls)            
        //
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.set   = function () { settoggle3D();   };
            delegate.reset = function () { resettoggle3D(); };
          }
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          scope.data.activated = true;
          rendertoggle3D(false);
        });

      }
    };
  }

}());

