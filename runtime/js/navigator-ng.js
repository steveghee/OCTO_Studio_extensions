if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'navigator-ng';
}

(function () {
  'use strict';

  var navigatorModule = angular.module('navigator-ng', []);
  navigatorModule.directive('ngNavigator', ['$timeout', '$interval', '$http', '$window', '$injector', ngNavigator]);

  function ngNavigator($timeout, $interval, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        idField          : '@',  
        stepsField       : '@',
        affectsField     : '@',
        tunnelcolorField : '@',
        tunnelsrcField   : '@',
        deviceField      : '@',
        headField        : '@',
        feetField        : '@',
        feetsrcField     : '@',
        feetcolorField   : '@',
        autoField        : '@',
        visibleField     : '@',
        isholoField      : '@',
        extentField      : '@',
        shaderField      : '=',
        delegateField    : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                         id: undefined,
                    affects: undefined, 
                      steps: 15,
                       auto: true,
                      force: false,
                     isholo: false,
                     extent: 0.45,
                  navigator: undefined,
                       args: undefined,
                tunnelColor: undefined,
                  feetColor: undefined,
                  tunnelSrc: 'extensions/images/navSphere.pvz',
                       head: false,
                    visible: undefined,
                    pending: undefined,
                     };
                     
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
                     
        //
        // lets create a single navigator manager
        //
        var init = function() {
          var tunnel = {
                steps: scope.data.steps,
                color: scope.data.tunnelColor,
                 geom: scope.data.tunnelSrc,
             hololens: scope.data.isholo
          };
          var targets = {
              extent: scope.data.extent,
              device: scope.data.device,
                head: scope.data.head === true ? 'extensions/images/navhead.pvz' : undefined,
                feet: scope.data.feet,
               color: scope.data.feetColor
          };
          
          scope.data.navigator = new spatialHelper(scope.renderer,tunnel,targets)
                                 .Cutoff(scope.data.cufoff,scope.data.auto);
          
          scope.$root.helper = scope.data.navigator;
        }
        //
        // we are mainly driven by the external clock which is the renderer location callback
        //
        scope.$root.$on('tracking', function(evt, arg) { 
          if (scope.data.visible) {
            scope.data.args = arg;          
            updatenavigation();
          }
        });
                     
        var executenavigation = function() {
          var arg= scope.data.args;
          if (arg                  === undefined) return;
          if (scope.data.navigator === undefined) return;
          
          //if ($window != undefined && $window.requestAnimationFrame != undefined)
          //  $window.requestAnimationFrame(scope.navigator.headnavigator(arg));
          scope.data.navigator.draw(arg);
        };
        
        //
        //
        //
        var updatenavigation = function() {
            
          $timeout(function () {
                       
            /*                     
                if (scope.data.navigator.isnavigation() === true) {
                  scope.$parent.fireEvent('navigation');
                } else {
                  scope.$parent.fireEvent('unnavigation');
                }
            */
            executenavigation();

          }, 1);
        };

        scope.$watch('affectsField', function () {
          // get the list of names
          if (scope.affectsField != undefined && scope.affectsField.length > 0) {
              
//            scope.data.pending = scope.affectsField.split(',');
          }
        });
            
        //////////////////////////////////////////////////////////////////////
        //setup stuff    
        //
        function isbool(v) {
          return (v==='true')||v===true;
        }
    
        // not updated too often, so handle as a group    
        //
        //
        scope.$watchGroup(['idField', 'stepsField', 'cutoffField', 'tunnelColorField', 'tunnelSrcField', 'isholoField'], function () {
          scope.data.id          = (scope.idField          != undefined) ? scope.idField : undefined;
          scope.data.steps       = (scope.stepsField       != undefined) ? parseFloat(scope.stepsField) : 15;                 
          scope.data.cutoff      = (scope.cutoffField      != undefined) ? parseFloat(scope.cutoffField) : 0.5;                 
          scope.data.tunnelColor = (scope.tunnelcolorField != undefined) ? scope.tunnelcolorField.split(',') : [1,1,0];
          scope.data.tunnelSrc   = (scope.tunnelsrcField   != undefined && scope.tunnelsrcField != '') ? scope.tunnelsrcField : 'extensions/images/navSphere.pvz';
          
          scope.data.isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
          if (scope.data.isholo && !twx.app.isPreview()) {
            scope.shaderField = "foggedLit";
          }
                
        });

        scope.$watchGroup(['deviceField', 'headField', 'feetField', 'feetColorField'], function () {
          scope.data.device    = (scope.deviceField != undefined && 
                                  scope.deviceField.length > 0) ? scope.deviceField : undefined;
          scope.data.head      = (scope.headField != undefined) ? isbool(scope.headField) : false;                 
          scope.data.feet      = (scope.feetField != undefined && isbool(scope.feetField)) ? scope.feetsrcField   : undefined;                 
          scope.data.feetColor = (scope.feetcolorField != undefined) ? scope.feetcolorField.split(',') : [0,1,0];                 
          
          scope.data.isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
          if (scope.data.isholo && !twx.app.isPreview()) {
            scope.shaderField = "foggedLit";
          }
                
        });
        //
        // z offset from head   
        //
        scope.$watch('extentField', function () {
          scope.data.extent = scope.extentField;                 
        });

        //
        //
        //
        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          if (scope.data.auto) show();          
          else                 hide();
        });

        //
        //
        //
        scope.$watch('visibleField', function () {
                     
          scope.data.visible = (scope.visibleField != undefined && scope.visibleField === 'true') ? true :false ;
          
          // kick off the next phase...
          if (scope.data.visible === true) show();           
          else                             hide();           
        });
            
        var show = function(){
            
          if (scope.data.navigator != undefined) {
            scope.data.navigator.show();          
          }
        
        };
        var hide = function(force) {
            
          if (scope.data.navigator != undefined) 
            scope.data.navigator.hide();
        };

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.show = function () {
              show();
            };
            delegate.hide = function () {
              hide();
            };
            delegate.capture = function () {
              if (scope.data.navigator != undefined) 
                scope.data.navigator.setAtCurrent().show();
            };
          }
        });
                
        // make sure we are triggered when the page is ready    
            
        scope.$root.$on("$ionicView.afterEnter", function (event) {
                        
          //
          init();              
        
        });
      }
    };
  }

}());
