if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'multiline3D-ng';
}

(function () {
  'use strict';

  var Multiline3DModule = angular.module('multiline3D-ng', []);
  Multiline3DModule.directive('ngMultiline3d', ['$timeout', 'tml3dRenderer', ngMultiline3d]);
  function ngMultiline3d($timeout, renderer) {

    return {
      restrict: 'EA',
      scope: {
        text: '@',
        height: '@',
        width: '@',
        font: '@',
        fontcolor: '@',
        padding: '@',
        src: '@'
        //id: '='
      },
      link: function (scope, element, attr) {
        scope.canvasheight;
        
        var multilinehelper = function ( context , text, x, y, lineHeight, fitWidth) {
          fitWidth = fitWidth || 0;
          if (fitWidth <= 0)
          {
            context.fillText( text, x, y );
            return;
          }
          var words = text.split(' ');
          for(var k = 0; k<words.length; k++) {
            if(/^(\r|\n)/.exec(words[k]) && !/^(\r|\n)$/g.exec(words[k])) {
              console.log("Starts with line break");
              words.splice(k+1, 0, words[k].replace(/^(\r|\n)/,''));
              words[k] = '\n'
              k++;
            }
            if(/(\r|\n)$/.exec(words[k]) && !/^(\r|\n)$/g.exec(words[k])) {
              console.log("Ends with line break");
              words[k] = words[k].replace(/(\r|\n)$/,'');
              k++;
              words.splice(k, 0, '\n');
            }
          }
          var currentLine = 0;
          var idx = 1;
          while (words.length > 0 && idx <= words.length)
          {
            if(y + (lineHeight*currentLine) > scope.canvasheight)
              console.warn(attr.id + " The text is to long to store in this widget. Change font size or use shorter text!");
            if(words[idx-1] !== '\n') {
              var str = words.slice(0,idx).join(' ');
              var w = context.measureText(str).width;
              if ( w > fitWidth )
              {
                if (idx==1)
                  idx=2;
                context.fillText( words.slice(0,idx-1).join(' ').trim(), x, y + (lineHeight*currentLine) );
                currentLine++;
                words = words.splice(idx-1);
                idx = 1;
              }
              else
                idx++;
            }
            else {
              if (idx==1)
                idx=2;
              context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
              currentLine++;
              words = words.splice(idx);
              idx = 1;
            }  
          }
          if (idx > 0)
            context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
        }

        // Preview can only use HEX in cavas so we convert here to get same results
        var rgb2hex = function(rgb) {
          rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
          return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
        }

        //////////////////////////////////////////////////////////////////////
        // Draws an Background Image and a label on a 3D Image
        //
        var bulidMultilineLabel = function () {         

          // Add new property to check if the function is only called once. If we don't do it we loop the image!
          var wdg = attr.id;

          let canvas = document.createElement("canvas");
          canvas.width = 1024;
          canvas.height = scope.canvasheight = 1024;
          let ctx = canvas.getContext("2d");
          let padding = scope.padding ? parseInt(scope.padding) : 20;

          ctx.fillStyle = rgb2hex(scope.fontcolor); //pass in font color prop
  
          ctx.font = scope.font ? scope.font : "bold 70px Arial"; // Segoe only works with some tricky stuff see Styles for more information
          let fontSize = parseInt(scope.font.substr(scope.font.indexOf(" ", 1), scope.font.indexOf("px", 1) - 1))
          // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
          multilinehelper(ctx, scope.text, padding, fontSize, fontSize*1.2, canvas.width-(2*padding));
          var newimg = canvas.toDataURL() + '#edge=clamp';

          //wdg.src = newimg; // need to save it back to src property becuase the texture will updated with the last set Image if you change for example colors
          //scope.textureField = newimg; // on hololens we need this aswell becuase he will not change it on first click!
          
          scope.src = newimg;
          renderer.setTexture(wdg, newimg);
        
          
        }
        //////////////////////////////////////////////////////////////////////
        // monitor state
        //
        scope.$watchGroup(['text', 'font', 'fontColor','padding'], function () {
          bulidMultilineLabel();
        });

        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          $timeout(function(){bulidMultilineLabel();},1500);
        });

      }
    };
  }

}());