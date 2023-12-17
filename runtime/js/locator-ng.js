if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'locator-ng';
}

(function () {
  'use strict';

  var locatorModule = angular.module('locator-ng', []);
  locatorModule.directive('ngLocator', ['$timeout', '$http', '$window', '$injector', ngLocator]);

  function ngLocator($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        cornerField   : '@',
        labelField    : '@',
        autogroupField: '@',
        infoField     : '=',
        locationsField: '=',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
          
        scope.data = { corner: undefined, 
                         data: undefined, 
                        model: undefined,
                        label:undefined,
                        input: [],
                      results: [],
                    autoGroup: false
                     };
        
        function toBool(v) {
          return v === 'true' || v === true;
        }
        
        var apply = function(re) {
            
          function isParent(a,b) {
            var c = b.path + '/';  
            return (!(a.path === b.path) && a.path.startsWith(c));
          }
          scope.data.input = (Array.isArray(scope.infoField)) ? scope.infoField 
                             : scope.infoField.path != undefined ? [{model:scope.infoField.model,path:scope.infoField.path}]
                                                                 : [];
          
          // if the data item has 'selectedRows' then lets use the SUBSET of data to control the list
          if (scope.data.input != undefined && scope.infoField.selectedRows != undefined && scope.infoField.selectedRows.length > 0)
            scope.data.input = scope.infoField.selectedRows;
            
          // now iterate over the results finding the bounds items for those listed
          scope.data.model = scope.data.input[0].model; // they might not all be the same model, so we may need to break this up
          scope.data.results = [];
          PTC.Structure.fromId(scope.data.model)
                       .then ( (structure) => {
            // 
            
            // Get the properties of the 'model-1' widget
            var widgetProps = scope.$parent.view.wdg[scope.data.model];
            
            scope.data.input.forEach(function(result) {
                                       
              var pathid = result.path;                         
              var label  = (scope.data.label!= undefined) ? result[scope.data.label] : undefined;
              
              // Get the bounding box information for part '/0/9/1/2'
              var bbox = structure.getBounds(pathid);

              // Transform the bounding box to account for the 'model-1' widget’s location
              var xform_bbox = bbox.transform(
                [widgetProps.x, widgetProps.y, widgetProps.z],
                [widgetProps.rx, widgetProps.ry, widgetProps.rz],
                widgetProps.scale);

              // position the pointer to be a tthe top center of the box
              var bc = xform_bbox.center; // box center
              var bm = xform_bbox.min; // min
              var bx = xform_bbox.max; // max
              
              var sx = Math.abs(bm.x - bx.x);
              var sy = Math.abs(bm.y - bx.y);    
              var sz = Math.abs(bm.z - bx.z);
              var scale = {x:sx, y:sy, z:sz};
              
              /*  {"position":{"x":0.0038,"y":0.0088,"z":-0.4077},
                     "gaze":{"x":0,"y":0,"z":1},
                     "up":{"x":0,"y":1,"z":0},
                     "cutoff":0.5,
                     "proximityThreshold":2,
                     "label":"code1"},
              */
              scope.data.results.push({ model:scope.data.model, path:pathid, position:bc, gaze:{x:0,y:0,z:0}, up:{x:0,y:1,z:0}, scale:scale, label:label });
            });

            scope.locationsField = scope.data.results;

            // signal we are done
            scope.$parent.fireEvent('complete');

          });

        };

        var reapply = function() {
          apply(true);
        };
        
        var reset = function() {
          scope.locationsField = [];
        }

        var updateLocator = function(){
          $timeout(function () {

            // what has changed?
            var changed = false;       
            
            if (scope.modelField != scope.data.model) {  
              reset();
              changed = true;  
            }           
            
            // if yes, re-apply the shaders. if not, run the query again
            if (changed === true)
              reapply();
            else
              apply();
          }, 1);

        };
        
        scope.$watchGroup(['labelField'], function () {
          scope.data.label = scope.labelField;
          updateLocator();
        });

        scope.$watch('autogroupField', function () {
          scope.data.autogroup = scope.autogroupField != undefined ? toBool(scope.autogroupField) : false;
          updateLocator();
        });
            
        scope.$watch('cornerField', function () {
          //
          scope.data.corner = scope.cornerField; 
          updateLocator();
        });

        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { 
              return scope.infoField != undefined && scope.infoField.selectedRows != undefined ? JSON.stringify(scope.infoField.selectedRows) 
                                                                                               : JSON.stringify(scope.infoField) 
          },
          function(value) {
            if (value != undefined) 
              apply();
          });
        
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.reset = function () {
              reset();  
              reapply();
            };
          }
        });

      }
    };
  }

}());
