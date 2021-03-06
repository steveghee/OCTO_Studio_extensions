if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'progress3D-ng';
}

(function () {
  'use strict';

  var Progress3DModule = angular.module('progress3D-ng', []);
  Progress3DModule.directive('ngProgress3d', ['$timeout', '$http', '$window', '$injector', ngProgress3D]);

  function ngProgress3D($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        isholoField        : '@',
        widthField         : '@',  
        heightField        : '@',
        percentageField    : '@',
        stepsField         : '@',
        nlinesField        : '@',
        fontField          : '@',
        fontsizeField      : '@',
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
               percentage: 0,
                    value: -1,
                   nlines: 1,
                    steps: 1,
                 fontSize: 70,
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

            //truncate to set number of lines?
            lines  = lines.slice(0,scope.data.nlines);
            var lc = lines.length; // should be nlines or fewer
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
      
              // work out size/dims of the canvas
              let scaleH    = scope.data.height / 0.04
              var aspect    = wdg.width / wdg.height;
              canvas.width  = 512 * scaleH * aspect;
              canvas.height = 512 * scaleH;
              let imageWidth  = canvas.width  - 12; //small margin?
              let imageHeight = canvas.height - 12;
            
              let s96  =  96 * scaleH; // scaled x margin for image
              let s170 = 170 * scaleH; // scaled y margin for image
              let s220 = 220 * scaleH; // scaled y offset for text
              let s40  =  40 * scaleH; // scaled y offset for text
              let s24  =  24 * scaleH; // scaled x margin offset for text
              
              // we need to center this image, so lets see what shape it is
              let ibase   = imageWidth / imageHeight;
              let iaspect = ibase > 1 ? imageHeight / background.height
                                      : imageWidth  / background.width;

              // use largest dim to work out actual scale
              let scaled = { width  : canvas.width / scope.data.steps, 
                             height : canvas.height / 3}
            
              let ctx = canvas.getContext("2d");
              // adjust and center image
              var ix = 0; 
              var iy = 0;
              var dx = canvas.width / scope.data.steps;
              var dp = scope.data.value;
              var ds = 100 / scope.data.steps;
              for (var s=0; s<scope.data.steps; s++) {
                var icu = (s + 1) * ds;  
                if (icu < scope.data.value)  
                  // draw full  
                  ctx.drawImage(background, ix, iy, scaled.width,scaled.height);
                else {
                  //draw partial (or nothing)      
                  var idu = (scope.data.value - (s * ds)) / ds; 
                  if (idu > 0) ctx.drawImage(background, ix, iy, scaled.width * idu,scaled.height);
                }
                ix = ix + dx;
              }
          
              ctx.textAlign = "center";
              ctx.fillStyle = rgb2hex(wdg.fontColor); //pass in font color prop
            
              ctx.font = "bold "+scope.data.fontSize+"px Arial";  // only works with some tricky stuff see Styles for more information
              var tx = canvas.width/2; // if the button is square, center the text, otherwise draw to the right of the image
              var ty = (canvas.height/2)+(3*scope.data.fontSize/4); 
      
              // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
              multiline(text,tx,ty,canvas.width-s24,scope.data.fontSize,ctx);
      
              var newimg = canvas.toDataURL() + '#edge=clamp';  
            
              scope.renderer.setTexture(scope.data.id,newimg);
            }          
          } 
 
        }
        
        //////////////////////////////////////////////////////////////////////
        // draw the buttton
        //
        var renderpanel3D = function() {
            
          $timeout(function(){
                
            var txt  = scope.data.text;  // should not be undefined, but can be empty
            var isrc = scope.data.src ;  // can be undefined
            
            var newval = -1;
            if (scope.data.steps > 1) {
              //quantize results
              var quant = 100 / scope.data.steps;  
              newval   = quant * Math.floor(scope.data.percentage / quant); 
            } 
            else 
              newval = scope.data.percentage;
            
            // has value changed?
            if (newval != scope.data.value) {
              scope.data.value = newval;
              drawIconAndLabel(scope.data, isrc, txt);
            }
              
          },1);
        }
        
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
            
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['idField','widthField','heightField','fontField','fontsizeField'], function () {
          scope.data.id       = (scope.idField       != undefined) ? scope.idField      : undefined;
          scope.data.width    = (scope.widthField    != undefined) ? parseFloat(scope.widthField)   : 0.10;
          scope.data.height   = (scope.heightField   != undefined) ? parseFloat(scope.heightField)  : 0.04;
          scope.data.fontColor= (scope.fontField     != undefined) ? scope.fontField    : '#ffffff';
          scope.data.fontSize = (scope.fontsizeField != undefined) ? parseInt(scope.fontsizeField): 70;
        });
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these may change often
        //
        scope.$watchGroup(['textField', 'percentageField', 'srcField','nlinesField'], function () {
          scope.data.text       = (scope.textField       != undefined) ? scope.textField   : '';
          scope.data.src        = (scope.srcField        != undefined) ? scope.srcField    : '';
          scope.data.nlines     = (scope.nlinesField     != undefined) ? parseInt(scope.nlinesField) : 1;
          scope.data.steps      = (scope.stepsField      != undefined) ? parseInt(scope.stepsField) : 1;
          scope.data.percentage = (scope.percentageField != undefined) ? parseFloat(scope.percentageField) : 0;
          
          renderpanel3D();
        });
            
        //////////////////////////////////////////////////////////////////////
        // handle external events (service calls)            
        //
        scope.$watch('delegateField', function (delegate) {
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          // check that I (as named widget) am referenced in this view              
          if (event.targetScope.view.wdg[scope.data.id] != undefined) {
            renderpanel3D();
          }
        });
            
      }
    };
  }

}());

