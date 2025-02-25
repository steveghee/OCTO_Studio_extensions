if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'gate-ng';
}

var cmds = {
    "starts": function (a, b) { return a.search(b) === 0 },
    "not"  :  function (a, b) { return a != b },
    "same"  : function (a, b) { return a === b },
    "like"  : function (a, b) { return a.search(b) >= 0 },
    "unlike": function (a, b) { return a.search(b) < 0 },
    "eq"    : function (a, b) { return parseFloat(a) === parseFloat(b) },
    "ne"    : function (a, b) { return parseFloat(a) !=  parseFloat(b) },
    "lt"    : function (a, b) { return parseFloat(a)  <  parseFloat(b) },
    "gt"    : function (a, b) { return parseFloat(a)  >  parseFloat(b) },
    "le"    : function (a, b) { return parseFloat(a) <=  parseFloat(b) },
    "ge"    : function (a, b) { return parseFloat(a) >=  parseFloat(b) },
    "in"    : function (a,b,c){ var pa = parseFloat(a); return  (pa >= parseFloat(b) && pa <= parseFloat(c)) },
    "out"   : function (a,b,c){ var pa = parseFloat(a); return !(pa >= parseFloat(b) && pa <= parseFloat(c)) },
    "before": function (a,b)  { var pa = Date.parse(a); var pb = Date.parse(b); return pa < pb; },
    "after" : function (a,b)  { var pa = Date.parse(a); var pb = Date.parse(b); return pa > pb; },
};

(function () {
  'use strict';

  var gateModule = angular.module('gate-ng', []);
  gateModule.directive('ngGate', ['$timeout', ngGate]);

  function ngGate($timeout) {

    return {
      restrict: 'EA',
      scope: {
        propertyField : '@',
        valueField    : '@',
        opField       : '@',
        autoField     : '@',
        resultField   : '=',
        qField        : '=',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { test: undefined, 
                      value: undefined, 
                         op: undefined, 
                       auto: false,
                     result: undefined
                     };

        var executeGate = function() {
            
          var excmd  = (scope.opField != undefined && scope.opField.length > 0) ? cmds[scope.opField] : cmds.eq;
          var passed = (excmd != undefined) ? excmd(scope.propertyField, scope.valueField) 
                                            : false;
          scope.data.result = (passed === true) ? scope.propertyField 
                                                : scope.valueField;

          // output the output variables
          if (passed === true) {
            scope.$parent.fireEvent('passed');
          } else {
            scope.$parent.fireEvent('failed');
          }  
          
          // and set the output
          scope.resultField = scope.data.result;
          scope.qField      = passed;
        };

        var updateGate = function(auto){
          if (auto === true) $timeout(function(){
            executeGate();
          },1);
        };

        scope.$watch('propertyField', function () {
          updateGate(scope.data.auto);
        });

        scope.$watch('valueField', function () {
          updateGate(scope.data.auto);
        });

        scope.$watch('opField', function () {
          updateGate(scope.data.auto);
        });

        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          updateGate(scope.data.auto);
        });

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.test = function () {
              updateGate(true);
            };
          }
        });

      }
    };
  }

}());
