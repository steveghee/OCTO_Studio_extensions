if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'press3D-ng';
}

(function () {
  'use strict';

  var press3DModule = angular.module('press3D-ng', []);
  press3DModule.directive('ngPress3d', ['$timeout', '$http', '$window', '$injector', ngPress3D]);

  function ngPress3D($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
          isholoField : '@',
        widthField    : '@',  
        heightField   : '@',
          fontField   : '@',
        idField       : '@',  
        disabledField : '@',
        backerField   : '@',
        textField     : '@',
        srcField      : '@',
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                       id: undefined,
                    width: 0.04,
                   height: 0.04,
                fontColor: '#ffffff',
                 disabled: false,
                   backer: undefined,
                     text: '',
                      src: '',
                     };
             
        scope.$root.$on('userpick', function(evt, src) { 
          if (scope.data.id === src && !scope.data.disabled) {
            console.log(scope.data.id+' userpick');
            updatepress3D(true);
          }
        });

        function isbool(v) {
          return (v==='true')||v===true;
        }
        
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        
        // Draws an Image and a label on a 3D Button to 
        var drawIconAndLabel = function(widget,isrc,itext,ipressed) {
  
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
          let pressed    = ipressed;
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
            
            ctx.font = "bold 70px Segoe";                      // only works with some tricky stuff see Styles for more information
            var tx = aspect>aspectLimit?ix+s220:canvas.width/2; // if the button is square, center the text, otherwise draw to the right of the image
            var ty = aspect>aspectLimit?(canvas.height/2)+55:canvas.height-s40; // if centered, draw below the image
      
            // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
            multiline(text,tx,ty,aspect>aspectLimit?canvas.width-tx-12:canvas.width-s24,70,ctx);
            
            var newimg = canvas.toDataURL() + '#edge=clamp';  
            
            //wdg.src = newimg; // need to save it back to src property becuase the texture will updated with the last set Image if you change for example colors
            //scope.textureField = newimg; // on hololens we need this aswell becuase he will not change it on first click!
            scope.renderer.setTexture(scope.data.id,newimg);
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!scope.data.backer});

            if (pressed) {
              console.log(scope.data.id+' firing pressed');
              scope.$parent.fireEvent('pressed');
            }
          }
  
        }
        
        
        var updatepress3D = function(pressed,force) {
            
          console.log(scope.data.id+' pressed');
          if (force != undefined || !scope.data.disabled) $timeout(function() {
            drawIconAndLabel(scope.data, scope.data.src, scope.data.text,pressed);
          },1);
        
        };
        
        // these wont change often
        scope.$watchGroup(['disabledField'], function () {
          var dis = (scope.disabledField != undefined) ? isbool(scope.disabledField) : false;
          // is this has changed, we update the shader
          if (scope.data.disabled != dis) {
              
            console.log(scope.data.id+' disabled='+scope.data.disabled);
            scope.data.disabled = dis;
            
            // ideally we would toggle the shader here, but whilst we can toggle between the prototype octo shaders, we
            // cannot untoggle and return to the built-inshader, wich actually shaders the button differently (better!)
            // the switch makes this inconsistent, so disabling it for now.
            
            var isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
            if (isholo && !twx.app.isPreview()) {
              scope.renderer.setProperties(scope.data.id+'_button',{shader:dis?"holoUIni":"holoUI"});
            }
            
              
            if (!dis) {
              scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!scope.data.backer});
              updatepress3D(false,true);  
            }
              
          }
        });
            
        scope.$watchGroup(['backerField'], function () {
          var backer = (scope.backerField != undefined) ? isbool(scope.backerField) : false;
          // is this has changed, we update the shader
          if (scope.data.backer != backer) {
              
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!backer});
            scope.data.backer = backer;
          }
        });
            
        // these wont change often
        scope.$watchGroup(['idField','widthField','heightField','fontField'], function () {
          scope.data.id       = (scope.idField       != undefined) ? scope.idField : undefined;
          scope.data.width    = (scope.widthField    != undefined) ? scope.widthField  : 0.04;
          scope.data.height   = (scope.heightField   != undefined) ? scope.heightField : 0.04;
          scope.data.fontColor= (scope.fontField     != undefined) ? scope.fontField   : '#ffffff';
        });
        
        // these wont change often
        scope.$watchGroup(['textField','srcField'], function () {
          scope.data.text           = (scope.textField           != undefined) ? scope.textField           : '';
          scope.data.src            = (scope.srcField            != undefined) ? scope.srcField            : '';
          
          updatepress3D(false,true);
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          updatepress3D(false);
        });

      }
    };
  }

}());

