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
        xField       : '@',
        yField       : '@',
        zField       : '@',
        locdataField : '=',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                       show: false, 
                    affects: undefined, 
                       auto: true,
                     offset: new Vector4(),
                       data: undefined,  
                     matrix: new Matrix4(),
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
          
          // and are we repositioing anything?
          if (scope.data.data != undefined) {
            // lets turn the matrix into euler angles
            var es = scope.data.matrix.ToPosEuler(true);
            scope.data.affects.forEach(function(a) {  
              var wname   = a.trim();
              var subject = scope.$parent.view.wdg[wname];
              if (subject != undefined) {
                subject.x = es.pos.X();  
                subject.y = es.pos.Y();  
                subject.z = es.pos.Z();  
              }
            });

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

        scope.$watch(
          function() { return JSON.stringify(scope.locdataField); }, 
          function () {
            scope.data.data = (scope.locdataField != undefined && scope.locdataField.rows != undefined) ? scope.locdataField.rows[0] : undefined;
            var position = new Vector4().FromString(scope.data.data.position);
            var     gaze = new Vector4().FromString(scope.data.data.gaze).Negate();
            var       up = new Vector4().FromString(scope.data.data.up);

            // lets get the gaze (vector) and the up (vector)
            var yup   = new Vector4().Set3(0,1,0);
            //if (Math.abs(yup.DotP(this.gaze)) < 0.707) up = yup; // keep item vertical when head is generally looking horizontal-ish
            var xd    = yup.CrossP(gaze).Normalize();
            var nup   = gaze.CrossP(xd); // recalc up
 
            // from gaze, up  we calculate the bitangent (nup) and from this we can calculate the view matrix
            var vmat = new Matrix4().Set4V(xd,nup,gaze,position);
            // and we transform the group content RELATIVE to this
            var gmat = new Matrix4().TranslateV4(scope.data.offset);
            scope.data.matrix = gmat.Multiply(vmat.m);

            updateGroupy()
          }
        );
            
        scope.$watchGroup(['xField','yField','zField'], function () {
          var x = (scope.xField != undefined) ? parseFloat(scope.xField) : 0;
          var y = (scope.yField != undefined) ? parseFloat(scope.yField) : 0;
          var z = (scope.zField != undefined) ? parseFloat(scope.zField) : 0;
          scope.data.offset = new Vector4().Set3(x,y,z);
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
