if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'multiline3D-ng';
}

(function () {
  'use strict';

  var VF_ANG_Ext = {};

  VF_ANG_Ext.getMultilineLabelHeightAttribute = function getMultilineLabelHeightAttribute(element) {
    let padding   = element.attr('padding');
    let font      = element.attr('font');
    let lineCount = element.attr('linecount');
    let width     = element.attr('width');
    
    var scalefactor = 512/0.04;
    return (parseInt(padding.match(/[\^\d+]/g,).join(""))*2 + (parseInt(font.match(/[\^\d+]/g).join(""))*lineCount))/scalefactor;
  }

  VF_ANG_Ext.multilinehelper = function multilinehelper(context, text, x, y, lineHeight, fitWidth, lineCount) {
    fitWidth = fitWidth || 0;
    if (fitWidth <= 0) {
      context.fillText(text, x, y);
      return;
    }
    // first split into 'forced' lines (linebreaks)
    var linesIn = text.split('\n');
    
    // then, for each sub-line, render to width
    var lines = [];
    linesIn.forEach(function(subline) {
      var words = subline.split(' ');
      var line = '';
      for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ' ;
        var metrics  = context.measureText(testLine);
        if (metrics.width > fitWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        }
        else {
          line = testLine;
        }
      }
      lines.push(line);
    });

    // finally, render out as many lines as we need
    lines  = lines.slice(0,lineCount);
    var lc = lines.length; // should be nlines or fewer
    var sy = y;
    lines.forEach(function(line) {
      context.fillText(line, x, sy);
      sy += lineHeight;
    });
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
  // Draws Canvas Image to Provide 
  //
  VF_ANG_Ext.buildMultilineLabel = function buildMultilineLabel(props) {

    let canvas    = document.createElement("canvas");
    let fontSize  = parseInt(props.font.match(/[\^\d+]/g,).join(""));
    let padding   = props.padding ? parseInt(props.padding.match(/[\^\d+]/g,).join("")) : 20;
    let lineCount = props.linecount ? parseInt(props.linecount) : 5;
    
    // we scale the rendering to fit onto a texture which starts as a 512x512 square based on a 0.04x0.04 button
    // we resize this texture to match the size of the label
    let scaleH    = props.height / 0.04
    var aspect    = props.width / props.height;
    canvas.width  = 512 * scaleH * aspect;
    canvas.height = 512 * scaleH;
    
    let ctx       = canvas.getContext("2d");
    ctx.fillStyle = VF_ANG_Ext.rgb2hex(props.fontcolor);                    // pass in font color prop
    ctx.font      = props.font ? props.font : "bold "+fontSize+"px Arial";  // only works with some tricky stuff see Styles for more information
    
    // This function make the multiline magic happen 
    VF_ANG_Ext.multilinehelper(ctx, props.text, padding, padding+fontSize, fontSize, canvas.width - (2 * padding), lineCount);
    var newimg = canvas.toDataURL();
    return newimg;

  }

  var Multiline3DModule = angular.module('multiline3D-ng', []);
  Multiline3DModule.directive('octoMultilinelabel', ['tml3dRenderer', '$animate', function (renderer, $animate) {
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
          var asset = VF_ANG.createObj("octo-multilinelabel", element);
          $animate.enabled(element, false);

          asset.addAsset = function () {
            var successCallback = function () {
              addFunctionSuccessCallback();

              VF_ANG.addAssetCallback(scope, asset, renderer);
            };

            var failureCallback = function (error) {
              addFunctionFailureCallback();

              console.log("octo-multilinelabel: Error in add3DImage id: [" + element.attr("id") + "] due to [" + error + "]");
            };

            VF_ANG.addAsset(renderer, asset, function () {
              addFunctionAddAPICallCallback();

              var properties = getLabelAttributes(element);
              renderer.add3DImage(
                tracker.name,
                element.attr("id"),
                VF_ANG_Ext.buildMultilineLabel(properties),
                undefined,
                undefined,
                undefined,
                undefined,
                element.attr("width"),
                properties.height, //Calculated height from textToImage includes padding,etc.
                element.attr("pivot"),
                successCallback,
                failureCallback
              );
            });
          };

          ctrl.addAssetOrQueueForAdditionIfNeeded(tracker, asset);
        };

        var setFunction = function setFunction() {
          renderer.setTexture(element.attr('id'), VF_ANG_Ext.buildMultilineLabel(getLabelAttributes(element)));
        };

        var attributeNames = ['padding', 'width', 'text', 'font','fontcolor'];

        var addSetTriggerFunctions = VF_ANG.setupWatchWithAddSetConvention(scope, element, attributeNames, addFunction, setFunction);

        VF_ANG.addStyleReadyListener(element, addSetTriggerFunctions.eventFunction);
      }
    };
  }]);

}());

