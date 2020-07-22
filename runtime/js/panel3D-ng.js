if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'panel3D-ng';
}

(function () {
  'use strict';

  var Panel3DModule = angular.module('panel3D-ng', []);
  Panel3DModule.directive('ngPanel3d', ['$timeout', '$http', '$window', '$injector', ngPanel3D]);

  function ngPanel3D($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        isholoField        : '@',
        widthField         : '@',  
        heightField        : '@',
        fontField          : '@',
        idField            : '@',  
        disabledField      : '@',
        textField          : '@',
        srcField           : '@',
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
                 disabled: undefined,
                     text: '',
                      src: '',
                     };
             

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
          let text = itext;
          if (isrc != undefined && isrc.length>0) {
            let background = new Image();
            background.src = isrc;
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
            
              ctx.font = "bold 120px Arial";                       // only works with some tricky stuff see Styles for more information
              var tx = aspect>aspectLimit?ix+s220:canvas.width/2; // if the button is square, center the text, otherwise draw to the right of the image
              var ty = aspect>aspectLimit?(canvas.height/2)+55:canvas.height-s40; // if centered, draw below the image
      
              // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
              multiline(text,tx,ty,aspect>aspectLimit?canvas.width-tx-12:canvas.width-s24,120,ctx);
      
              var newimg = canvas.toDataURL() + '#edge=clamp';  
            
              scope.renderer.setTexture(scope.data.id,newimg);
            }          
          } else {
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
            var ix  = s24;  // if the button is wide, draw the image to the left, otherwise center it
            var iy  = s170;
      
            ctx.textAlign = aspect>aspectLimit?"left":"center";
            ctx.fillStyle = rgb2hex(wdg.fontColor); //pass in font color prop
            
            ctx.font = "bold 70px Arial";           //Segoe only works with some tricky stuff see Styles for more information
            var tx = aspect>aspectLimit?ix:canvas.width/2; // if the button is square, center the text, otherwise draw to the right of the image
            var ty = (canvas.height/2)+55; 
      
            // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
            multiline(text,tx,ty,aspect>aspectLimit?canvas.width-tx-12:canvas.width-s24,70,ctx);
      
            var newimg = canvas.toDataURL() + '#edge=clamp';  
          
            scope.renderer.setTexture(scope.data.id,newimg);
          }
 
        }
        
        //////////////////////////////////////////////////////////////////////
        // draw the buttton
        //
        var renderimage3D = function(trigger) {
            
          var triggered = trigger != undefined && trigger === true;  
          var pressed = undefined;  
          $timeout(function(){
                
            var txt  = scope.data.text;  // should not be undefined, but can be empty
            var isrc = scope.data.src ;  // can be undefined
              
            drawIconAndLabel(scope.data, isrc, txt);
              
          },1);
        }
        
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
            
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['idField','widthField','heightField','fontField'], function () {
          scope.data.id       = (scope.idField       != undefined) ? scope.idField     : undefined;
          scope.data.width    = (scope.widthField    != undefined) ? scope.widthField  : 0.10;
          scope.data.height   = (scope.heightField   != undefined) ? scope.heightField : 0.04;
          scope.data.fontColor= (scope.fontField     != undefined) ? scope.fontField   : '#ffffff';
        });
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these may change often
        //
        scope.$watchGroup(['textField', 'srcField'], function () {
          scope.data.text           = (scope.textField != undefined) ? scope.textField           : '';
          scope.data.src            = (scope.srcField  != undefined) ? scope.srcField            : '';
          
          renderimage3D(false);
        });
            
        //////////////////////////////////////////////////////////////////////
        // handle external events (service calls)            
        //
        scope.$watch('delegateField', function (delegate) {
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          renderimage3D(false);
        });
            
      }
    };
  }

}());

