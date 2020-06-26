if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'billboard-ng';
}

(function () {
  'use strict';

  var billboardModule = angular.module('billboard-ng', []);
  billboardModule.directive('ngBillboard', ['$timeout', '$http', ngBillboard]);

  function ngBillboard($timeout, $http) {

    return {
      restrict: 'EA',
      scope: {
        angleField   : '@',
        affectsField : '@',
        autoField    : '@',
        offsetField  : '@',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                      angle: undefined, 
                    affects: undefined, 
                       auto: true,
                      force: false,
                     offset: 0,
                       args: undefined
                     };
                     
        scope.$root.$on('tracking', function(evt, arg) { 
          scope.data.args = arg;          
          updateBillboard();
        });
                     
        var executeBillboard = function() {
          var arg= scope.data.args;
          if (arg === undefined) return;
          
          var gz = new Vector4().Set3(-arg.gaze[0],-arg.gaze[1],-arg.gaze[2]);
          var up = new Vector4().Set3(arg.up[0],arg.up[1],arg.up[2]);
          var xd = up.CrossP(gz);
          var em = new Matrix4().Set3V(xd,up,gz);
          var es = em.ToEuler(true);
          
          if (scope.data.affects != undefined && scope.data.affects.length > 0) 
          scope.data.affects.forEach(function(a) {  
                                     
            var wname   = a.trim();
            var subject = scope.$parent.view.wdg[wname];
            if (subject != undefined) {
                                     
              // calc heading for subject 'a'
              // first, find out which way it is currently heading                         
              var cy = subject.ry - scope.data.offset;
              
              // then see if the delta is greater than the accepted angle property
              if (scope.data.force || 
                  Math.abs(cy - es.heading) > scope.data.angle) {
                subject.ry = es.heading + scope.data.offset;
              }
            }
          });
              
          scope.data.force = false;  
          
          //future use: send out aligned event for animated alignment
          //scope.$parent.fireEvent('aligned');
        };

        var align = function(){
          $timeout(function () {
                     
            scope.data.force = true;
            executeBillboard();

          }, 1);

        };

        var updateBillboard = function(){
          if (scope.data.auto === true) $timeout(function () {

            executeBillboard();

          }, 1);
        };

        scope.$watch('affectsField', function () {
          // get the list of names
          if (scope.affectsField != undefined && scope.affectsField.length > 0) 
              scope.data.affects = scope.affectsField.split(',');
          updateBillboard();
        });

        scope.$watch('angleField', function () {
          scope.data.angle = (scope.angleField != undefined) ? parseFloat(scope.angleField) : 0;                 
          updateBillboard();
        });

        scope.$watch('offsetField', function () {
          scope.data.offset = (scope.offsetField != undefined) ? parseFloat(scope.offsetField) : 0;                 
          updateBillboard();
        });

        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          updateBillboard();
        });

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.align = function () {
              align();
            };
          }
        });

      }
    };
  }

}());
