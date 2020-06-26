if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'groupy-ng';
}

(function () {
  'use strict';

  var groupyModule = angular.module('groupy-ng', []);
  groupyModule.directive('ngGroupy', ['$timeout', ngGroupy]);

  function ngGroupy($timeout) {

    return {
      restrict: 'EA',
      scope: {
        affectsField : '@',
        autoField    : '@',
        speedField   : '@',
        showField    : '@',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                       show: false, 
                    affects: undefined, 
                       auto: true,
                      speed: 1,
                     };
                     
        var start  = function() { 
          scope.data.fade    = 1.0;
          $timeout(fadein,100);
        };
      
        var stop = function() {
          scope.data.fade = 0.0;
          $timeout(fadeout,100);
        };
      
        var fadeout = function() {
          scope.data.fade = scope.data.fade + scope.data.speed;
          scope.data.affects.forEach(function(a) {  
            var wname   = a.trim();
            var subject = scope.$parent.view.wdg[wname];
            if (subject != undefined) {
              subject.opacity = (1 - scope.data.fade);
              if (scope.data.fade >= 1.0) {
                subject.opacity = 0.0;; 
                subject.visible = false;
              }
            }
          });
          if (scope.data.fade >= 1.0) {
            scope.data.fade    = 1.0;
            scope.$parent.fireEvent('hidden');
          } else {
            $timeout(fadeout,100);
          }
        };
      
        var fadein = function() {
          scope.data.fade    = scope.data.fade - scope.data.speed; 
          scope.data.affects.forEach(function(a) {  
            var wname   = a.trim();
            var subject = scope.$parent.view.wdg[wname];
            if (subject != undefined) {
              subject.visible = true;  
              subject.opacity = (1 - scope.data.fade);
              if (scope.data.fade <= 0.0) {
                subject.opacity = 1.0;
              }
            }
          });
          if (scope.data.fade <= 0.0) {
            scope.data.fade    = 0.0;
            scope.$parent.fireEvent('visible');
          } else {
            $timeout(fadein,100);
          }
        };
        
        var executeGroupy = function() {
          
          if (scope.data.affects != undefined && scope.data.affects.length > 0) {
            if (scope.data.show === "true") start();
            else                            stop();
          }
      
        };

        var updateGroupy = function(force){
          if (force === true  || scope.data.auto === true) $timeout(function () {

            executeGroupy();

          }, 1);
        };

        scope.$watch('affectsField', function () {
          // get the list of names
          if (scope.affectsField != undefined && scope.affectsField.length > 0) 
              scope.data.affects = scope.affectsField.split(',');
          updateGroupy(false);
        });

        scope.$watch('speedField', function () {
          scope.data.speed = (scope.speedField != undefined) ? parseFloat(scope.speedField) : 0;                 
          updateGroupy(false);
        });

        scope.$watch('showField', function () {
          scope.data.show = (scope.showField != undefined) ? scope.showField : false;                 
          updateGroupy(false);
        });

        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
        });

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.update = function () {
              updateGroupy(true);
            };
          }
        });

      }
    };
  }

}());
