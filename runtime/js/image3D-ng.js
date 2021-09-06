if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'image3D-ng';
}

(function () {
  'use strict';

  var Image3DModule = angular.module('image3D-ng', []);
  Image3DModule.directive('ngImage3d', ['$timeout', '$http', '$window', '$injector', ngImage3D]);

  function ngImage3D($timeout, $http, $window, $injector) {

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
        srcField           : '@',
        srcnotpressedField : '@',
        pressedField       : '=',
        notpressedField    : '=',
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
                      src: '',
            srcnotpressed: ''
                     };
             
        //////////////////////////////////////////////////////////////////////
        // user tapped the button
        //
        scope.$root.$on('userpick', function(evt, src) { 
          if (scope.data.id === src && !scope.data.disabled) {
            updateimage3D(true);
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
  
          function singleline(text,tx,ty,maxWidth,lineHeight,context) {
            var words = text.split(' ');
            var line = '';

            for(var n = 0; n < words.length; n++) {
              var testLine = line + words[n] + ' ' ;
              var metrics = context.measureText(testLine);
              var testWidth = metrics.width;
              
              // if we hit the limit, clip and add ellipsis
              if (testWidth > maxWidth && n > 0) {
                line = line + '...';
                break; // out of for loop
              }
              else {
                line = testLine;
              }
            }

            context.fillText(line, tx, ty - lineHeight / 2);

          }
          
          // Add new property to check if the function is only called once. If we don't do it we loop the image!
          var wdg = widget;
          
          let background = new Image();
          background.src = isrc;
          let text       = itext;
          background.onload = function() {
            let canvas = document.createElement("canvas");
            let ctx    = canvas.getContext("2d");
            
            // work out size/dims of the canvas
            let scaleH      = scope.data.height / 0.04
            var aspect      = wdg.width / wdg.height;
            canvas.width    = 512 * scaleH * aspect;
            canvas.height   = 512 * scaleH ;
            let imageWidth  = canvas.width  - 96;
            let imageHeight = canvas.height - 96;
            
            let s96  =  96 * scaleH; // scaled x margin for image
            let s170 = 170 * scaleH; // scaled y margin for image
            let s220 = 220 * scaleH; // scaled y offset for text
            let s40  =  40 * scaleH; // scaled y offset for text
            let s24  =  24 * scaleH; // scaled x margin offset for text
            
            // we need to center this image, so lets see what shape it is
            let ibase   = imageWidth / imageHeight;
            let bbase   = background.width / background.height;
            
            // note that if the image aspect is wider than the button, we need
            // to adjust by width; otherwise we fit by height
            let iaspect = ibase >= 1 && bbase < ibase ? imageHeight / background.height
                                                      : imageWidth  / background.width;

            // use largest dim to work out actual scale
            let scaled = { width  : background.width  * iaspect, 
                           height : background.height * iaspect}
                       
            // adjust and center image
            var ix =  (canvas.width/2) - (scaled.width/2); 
            var iy = (canvas.height/2) - (scaled.height/2);
            ctx.drawImage(background, ix, iy, scaled.width,scaled.height);
            
            // measure and center text - clip with ellipsis if too wide
            if (text != undefined && text != "") {
              ctx.textAlign = "center";
              ctx.fillStyle = rgb2hex(wdg.fontColor); //pass in font color prop
            
              ctx.font = "bold 70px Arial"; //Segoe only works with some tricky stuff see Styles for more information
              var tx   = canvas.width/2; // if the button is square, center the text, otherwise draw to the right of the image
              var ty   = canvas.height - s40; // if centered, draw below the image
      
              // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
              singleline(text,tx,ty,canvas.width-48,70,ctx);
            }
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
        var renderimage3D = function(trigger) {
            
          var triggered = trigger != undefined && trigger === true;  
          var pressed = undefined;  
          $timeout(function(){
            if (scope.pressedField === true) {
                
              var txt  = scope.data.text;
              var isrc = scope.data.src != "" ? scope.data.src  : scope.data.srcnotpressed;
              if (isrc === undefined || isrc === "") isrc = 'extensions/images/toggleMissing.png';
              
              pressed = true;
              drawIconAndLabel(scope.data, isrc, txt);
              
            } else {
              
              var txt  = scope.data.text;
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
              scope.data.notpressed = !scope.data.pressed;
            
            }

          },1);
        }
        
        //////////////////////////////////////////////////////////////////////
        // toggle the button
        // note that the draw is asynchronous i.e. it _should_ be picked up
        // when the $watch on pressedField spots that it changed...
        //
        var updateimage3D = function(toggle) {
          
          // this should trigger the watch(pressed/notpressed)  
          if (toggle) $timeout(function() {
            var old               = scope.pressedField;
            scope.pressedField    = scope.notpressedField;
            scope.notpressedField = old;
          },1);
        
        };
        var setimage3D = function() {
          if (!scope.data.disabled) $timeout(function() {
            scope.notpressedField = false;
            scope.pressedField = true;                                 
          },1);
        }
        var resetimage3D = function() {
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
            renderimage3D(false);  
              
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
        scope.$watchGroup(['textField', 'srcField', 'srcnotpressedField'], function () {
          scope.data.text           = (scope.textField           != undefined) ? scope.textField           : '';
          scope.data.src            = (scope.srcField            != undefined) ? scope.srcField            : '';
          scope.data.srcnotpressed  = (scope.srcnotpressedField  != undefined) ? scope.srcnotpressedField  : '';
          
          renderimage3D(false);
        });
            
        //////////////////////////////////////////////////////////////////////
        // if things change externally, we may need to fire events
        // note that we only watch pressedField.  notPressedField is output only
        //
        scope.$watchGroup(['pressedField'], function () {
          scope.notpressedField = !scope.pressedField;
          renderimage3D(true);
        });
            
        //////////////////////////////////////////////////////////////////////
        // handle external events (service calls)            
        //
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.set   = function () { setimage3D();   };
            delegate.reset = function () { resetimage3D(); };
          }
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          // check that I (as named widget) am referenced in this view              
          if (event.targetScope.view.wdg[scope.data.id] != undefined) {
            renderimage3D(false);
          }
        });
            
      }
    };
  }

}());

