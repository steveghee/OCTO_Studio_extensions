if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'logic-ng';
}

function isbool(v) {
  return (v==='true')||v===true;
}
var logiccmds = {
    "_and"   : function (a, b) { return   isbool(a) && isbool(b) },
    "_or"    : function (a, b) { return   isbool(a) || isbool(b) },
    "_nand"  : function (a, b) { return !(isbool(a) && isbool(b)) },
    "_nor"   : function (a, b) { return !(isbool(a) || isbool(b)) },
    "_xor"   : function (a, b) { return   isbool(a) != isbool(b) }
};

(function () {
  'use strict';

  var logicModule = angular.module('logic-ng', []);
  logicModule.directive('ngLogic', ['$timeout', ngLogic]);

  function ngLogic($timeout) {

    return {
      restrict: 'EA',
      scope: {
        inaField     : '@',
        inbField     : '@',
        opField      : '@',
        autoField    : '@',
        resultField  : '=',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        scope.data = { auto: 'false' };

        var executeLogic = function() {
            
          var excmd  = (scope.opField != undefined && 
                        scope.opField.length > 0) ? logiccmds[scope.opField] 
                                                  : logiccmds.eq;
          
          var passed = (excmd != undefined) ? excmd(scope.inaField, scope.inbField) 
                                            : false;
          scope.resultField = passed;

          if (passed === true) {
            scope.$parent.fireEvent('passed');
          } else {
            scope.$parent.fireEvent('failed');
          }  
        };

        var updateLogic = function(auto){
          if (auto === true) $timeout(function(){
            executeLogic();
          },1);
        };

        scope.$watchGroup(['inaField','inbField','opField'], function () {
          updateLogic(scope.data.auto);
        });
            
        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          updateLogic(scope.data.auto);
        });

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.test = function () {
              updateLogic(true);
            };
          }
        });

      }
    };
  }

}());
