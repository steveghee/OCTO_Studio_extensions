if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'multiline3D-ng';
}

(function () {
  'use strict';

  var VF_ANG_Ext = {};

  VF_ANG_Ext.getMultilineLabelHeightAttribute = function getMultilineLabelHeightAttribute(element) {
    //var height = element.attr('height');
    let padding = element.attr('padding');
    let font = element.attr('font');
    let linecount = element.attr('linecount');
    let width = element.attr('width');
    var height = (parseInt(padding.match(/[\^\d+]/g,).join(""))*2+1.2*parseInt(font.match(/[\^\d+]/g).join(""))*linecount)/(1024/parseFloat(width));
    //height = (parseInt(element.attr('padding').replace(/[^\d]/g, '')) * 2 + 1.2 * parseInt(element.attr('font').replace(/[^\d]/g, '')) * element.attr('linecount')) / (1024 / parseFloat(element.attr('width')));
    console.log(height,width,padding,font,linecount)
    return height;
  }

  VF_ANG_Ext.multilinehelper = function multilinehelper(context, text, x, y, lineHeight, fitWidth, fitHeight) {
    fitWidth = fitWidth || 0;
    if (fitWidth <= 0) {
      context.fillText(text, x, y);
      return;
    }
    var words = text.split(' ');
    for (var k = 0; k < words.length; k++) {
      if (/^(\r|\n)/.exec(words[k]) && !/^(\r|\n)$/g.exec(words[k])) {
        console.log("Starts with line break");
        words.splice(k + 1, 0, words[k].replace(/^(\r|\n)/, ''));
        words[k] = '\n'
        k++;
      }
      if (/(\r|\n)$/.exec(words[k]) && !/^(\r|\n)$/g.exec(words[k])) {
        console.log("Ends with line break");
        words[k] = words[k].replace(/(\r|\n)$/, '');
        k++;
        words.splice(k, 0, '\n');
      }
    }
    var currentLine = 0;
    var idx = 1;
    while (words.length > 0 && idx <= words.length) {
      if (y + (lineHeight * (currentLine+1)) >= fitHeight) {
        console.warn(" The text is to long to store in this widget. Change font size or use shorter text!");
        break;
      }
      if (words[idx - 1] !== '\n') {
        var str = words.slice(0, idx).join(' ');
        var w = context.measureText(str).width;
        if (w > fitWidth) {
          if (idx == 1)
            idx = 2;
          context.fillText(words.slice(0, idx - 1).join(' ').trim(), x, y + (lineHeight * currentLine));
          currentLine++;
          words = words.splice(idx - 1);
          idx = 1;
        } else
          idx++;
      } else {
        if (idx == 1)
          idx = 2;
        context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));
        currentLine++;
        words = words.splice(idx);
        idx = 1;
      }
    }
    if (idx > 0)
      context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
  }

  // Preview can only use HEX in cavas so we convert here to get same results
  VF_ANG_Ext.rgb2hex = function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
      ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
  }

  //////////////////////////////////////////////////////////////////////
  // Draws an Background Image and a label on a 3D Image
  //
  VF_ANG_Ext.bulidMultilineLabel = function bulidMultilineLabel(props) {

    // Add new property to check if the function is only called once. If we don't do it we loop the image!
    //var wdg = attr.id;

    let canvas = document.createElement("canvas");
    let fontSize = parseInt(props.font.match(/[\^\d+]/g,).join(""));
    let padding = props.padding ? parseInt(props.padding.match(/[\^\d+]/g,).join("")) : 20;
    let lineCount = props.linecount ? parseInt(props.linecount) : 5;
    canvas.width = 1024;
    canvas.height = padding * 2 + fontSize * 1.2 * lineCount;
    console.log(fontSize,padding,lineCount,canvas.height);
    let ctx = canvas.getContext("2d");


    ctx.fillStyle = VF_ANG_Ext.rgb2hex(props.fontcolor); //pass in font color prop

    ctx.font = props.font ? props.font : "bold 70px Arial"; // Segoe only works with some tricky stuff see Styles for more information
    // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
    VF_ANG_Ext.multilinehelper(ctx, props.text, padding, fontSize, fontSize * 1.2, canvas.width - (2 * padding),canvas.height-padding);
    var newimg = canvas.toDataURL()// + '#edge=clamp';

    //wdg.src = newimg; // need to save it back to src property becuase the texture will updated with the last set Image if you change for example colors
    //scope.textureField = newimg; // on hololens we need this aswell becuase he will not change it on first click!

    //scope.src = newimg;
    //renderer.setTexture(wdg, newimg);
    return newimg;

  }

  var Multiline3DModule = angular.module('multiline3D-ng', []);
  Multiline3DModule.directive('twxDtMultilinelabel', ['tml3dRenderer', '$animate', function (renderer, $animate) {
    function getLabelAttributes(el) {
      return {
        text: el.attr('text'),
        padding: el.attr('padding'),
        font: el.attr('font'),
        fontcolor: el.attr('fontcolor'),
        linecount: el.attr('linecount'),
        height: VF_ANG_Ext.getMultilineLabelHeightAttribute(el),
        width: el.attr('width')
      };
    }

    return {
      restrict: 'E',
      require: '^twxDtTracker',
      link: function (scope, element, attrs, ctrl) {
        // We have to backup tracker as it will change when next twxDtTracker is encountered by Angular.
        var tracker = scope.tracker;

        var addFunction = function addFunction(addFunctionAddAPICallCallback, addFunctionSuccessCallback,
          addFunctionFailureCallback) {
          var asset = VF_ANG.createObj("twx-dt-label", element);
          $animate.enabled(element, false);

          asset.addAsset = function () {
            var successCallback = function () {
              addFunctionSuccessCallback();

              VF_ANG.addAssetCallback(scope, asset, renderer);
            };

            var failureCallback = function (error) {
              addFunctionFailureCallback();

              console.log("twx-dt-label: Error in add3DImage id: [" + element.attr("id") + "] due to [" + error + "]");
            };

            VF_ANG.addAsset(renderer, asset, function () {
              addFunctionAddAPICallCallback();

              var properties = getLabelAttributes(element);
              renderer.add3DImage(
                tracker.name,
                element.attr("id"),
                VF_ANG_Ext.bulidMultilineLabel(properties),
                undefined,
                undefined,
                undefined,
                undefined,
                element.attr("width"),
                properties.height, //Calculated height from textToImage includes border,padding,etc.
                element.attr("pivot"),
                successCallback,
                failureCallback
              );
            });
          };

          ctrl.addAssetOrQueueForAdditionIfNeeded(tracker, asset);
        };

        var setFunction = function setFunction() {
          renderer.setTexture(element.attr('id'), VF_ANG_Ext.bulidMultilineLabel(getLabelAttributes(element)));
        };

        var attributeNames = ['padding', 'width', 'text', 'font','fontcolor'];

        var addSetTriggerFunctions = VF_ANG.setupWatchWithAddSetConvention(scope, element, attributeNames, addFunction, setFunction);

        VF_ANG.addStyleReadyListener(element, addSetTriggerFunctions.eventFunction);
      }
    };
  }]);
  /*Multiline3DModule.directive('ngMultiline3d', ['$timeout', 'tml3dRenderer', ngMultiline3d]);

  function ngMultiline3d($timeout, renderer) {

    return {
      restrict: 'EA',
      scope: {
        text: '@',
        height: '@',
        width: '@',
        font: '@',
        fontcolor: '@',
        linecount: '@',
        padding: '@',
        src: '@'
        //id: '='
      },
      link: function (scope, element, attr) {
        //scope.calcHeight = function() {
        attr.height = (scope.padding.replace(/[\^\d]/g, '') * 2 + 1.2 * parseInt(scope.font.replace(/[\^\d]/g, '')) * scope.linecount) / (1024 / parseFloat(scope.width));
        console.log(attr.height)
        //}

        scope.canvasheight;

        var multilinehelper = function (context, text, x, y, lineHeight, fitWidth) {
          fitWidth = fitWidth || 0;
          if (fitWidth <= 0) {
            context.fillText(text, x, y);
            return;
          }
          var words = text.split(' ');
          for (var k = 0; k < words.length; k++) {
            if (/^(\r|\n)/.exec(words[k]) && !/^(\r|\n)$/g.exec(words[k])) {
              console.log("Starts with line break");
              words.splice(k + 1, 0, words[k].replace(/^(\r|\n)/, ''));
              words[k] = '\n'
              k++;
            }
            if (/(\r|\n)$/.exec(words[k]) && !/^(\r|\n)$/g.exec(words[k])) {
              console.log("Ends with line break");
              words[k] = words[k].replace(/(\r|\n)$/, '');
              k++;
              words.splice(k, 0, '\n');
            }
          }
          var currentLine = 0;
          var idx = 1;
          while (words.length > 0 && idx <= words.length) {
            if (y + (lineHeight * currentLine) > scope.canvasheight)
              console.warn(attr.id + " The text is to long to store in this widget. Change font size or use shorter text!");
            if (words[idx - 1] !== '\n') {
              var str = words.slice(0, idx).join(' ');
              var w = context.measureText(str).width;
              if (w > fitWidth) {
                if (idx == 1)
                  idx = 2;
                context.fillText(words.slice(0, idx - 1).join(' ').trim(), x, y + (lineHeight * currentLine));
                currentLine++;
                words = words.splice(idx - 1);
                idx = 1;
              } else
                idx++;
            } else {
              if (idx == 1)
                idx = 2;
              context.fillText(words.slice(0, idx - 1).join(' '), x, y + (lineHeight * currentLine));
              currentLine++;
              words = words.splice(idx);
              idx = 1;
            }
          }
          if (idx > 0)
            context.fillText(words.join(' '), x, y + (lineHeight * currentLine));
        }

        // Preview can only use HEX in cavas so we convert here to get same results
        var rgb2hex = function (rgb) {
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
          let fontSize = parseInt(scope.font.substr(scope.font.indexOf(" ", 1), scope.font.indexOf("px", 1) - 1));
          let padding = scope.padding ? parseInt(scope.padding) : 20;
          let lineCount = scope.linecount ? parseInt(scope.linecount) : 5;
          canvas.width = 1024;
          canvas.height = scope.canvasheight = padding * 2 + fontSize * 1.2 * lineCount;
          console.log(canvas.height);
          let ctx = canvas.getContext("2d");


          ctx.fillStyle = rgb2hex(scope.fontcolor); //pass in font color prop

          ctx.font = scope.font ? scope.font : "bold 70px Arial"; // Segoe only works with some tricky stuff see Styles for more information
          // we may need to adjust y to take multi-line into account e..g if there are 2 lines, we need to move y(start) up 
          multilinehelper(ctx, scope.text, padding, fontSize, fontSize * 1.2, canvas.width - (2 * padding));
          var newimg = canvas.toDataURL() + '#edge=clamp';

          //wdg.src = newimg; // need to save it back to src property becuase the texture will updated with the last set Image if you change for example colors
          //scope.textureField = newimg; // on hololens we need this aswell becuase he will not change it on first click!

          scope.src = newimg;
          renderer.setTexture(wdg, newimg);


        }
        //////////////////////////////////////////////////////////////////////
        // monitor state
        //
        scope.$watchGroup(['text', 'font', 'fontColor', 'padding'], function () {
          bulidMultilineLabel();
        });

        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          $timeout(function () {
            bulidMultilineLabel();
          }, 1500);
        });

      }
    };
  }*/

}());