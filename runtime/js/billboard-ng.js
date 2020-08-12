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
                      angle: 0, 
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
          
          var ps  = new Vector4().Set3(arg.position[0], arg.position[1], arg.position[2]);
          var yup = new Vector4().Set3(0,1,0);
          var cosa= Math.cos(Math.PI * scope.data.angle / 180);
          
          if (scope.data.affects != undefined && scope.data.affects.length > 0) 
          scope.data.affects.forEach(function(a) {  
                                     
            var wname   = a.trim();
            var subject = scope.$parent.view.wdg[wname];
            if (subject != undefined) {
                                     
              // calc heading for subject 'a'
              var em = new Matrix4().RotateFromEuler(subject.rx, subject.ry, subject.rz, true);;
              var sz = new Vector4().Set4a(em.m[2]).Normalize();
          
              // first, find out which way it is currently heading                         
              var sps = new Vector4().Set3(subject.x, arg.position[1], subject.z);
              var dlt = ps.Sub(sps).Normalize();
              
              // this is the cos of the angle between the two vectors
              var dp = Math.abs(sz.DotP(dlt));
               
              var xd = yup.CrossP(dlt);
              var em = new Matrix4().Set3V(xd,yup,dlt);
              var es = em.ToEuler(true);
              
              // if the (cos of the) angle is less than the allowed difference...
              if (scope.data.force === true || dp < cosa) {
                subject.rx = es.attitude;
                subject.ry = es.heading;
                subject.rz = es.bank;
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
