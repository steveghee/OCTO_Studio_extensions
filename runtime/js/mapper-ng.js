if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'mapper-ng';
}

(function () {
  'use strict';

  var mapperModule = angular.module('mapper-ng', []);
  mapperModule.directive('ngMapper', ['$timeout', '$http', '$window', '$injector', ngMapper]);

  function ngMapper($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        polarityField : '@',
        shaderField   : '@',
        defaultField  : '@',
        modelField    : '@',
        colorField    : '@',
        legendField   : '@',
        isholoField   : '@',
     autoselectField  : '@',
        infoField     : '=',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
          
        let defaultHiliteShader='mapper_coloredHilite';
        let defaultUnliteShader='mapper_desaturated';
        let defaultDotlitShader='mapper_screendoor';
  
        scope.data = { shader: undefined, 
                         data: undefined, 
                     polarity: undefined, 
                        model: undefined,
                      default: undefined,
                         undo: undefined,
                       legend: undefined,
                      isholo : false,
                  hiliteColor: ';r f 1;g f 0.5;b f 0.25',
                 hiliteShader: defaultHiliteShader,
                 unliteShader: defaultUnliteShader,
                 dotlitShader: defaultDotlitShader,
                         prev: [],
                      results: [],
           autoSelectChildren: true
                     };
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        
        function toBool(v) {
          return v === 'true' || v === true;
        }
        
        function toHolo() {
          return (toBool(scope.isholoField) && !twx.app.isPreview())?'hl':'gl';
        }

        
        var hilite = function(nodeId,rd,nv) {
          var shader = scope.data.hiliteShader+toHolo()+scope.data.hiliteColor;
          if (scope.data.legend != undefined && nv!= undefined) {
            shader = scope.data.hiliteShader+toHolo()+";mixer f 1;fu f 1.0;fv f "+nv;
          }
          rd.setProperties(nodeId,
            {
              shader: shader, 
              hidden: false,
             opacity: scope.data.polarity?0.8:1.0,
             phantom: scope.data.polarity,
               decal: false
           });

        };
        var unlite = function(nodeId,rd) {
          rd.setProperties(nodeId,
            {
              shader: scope.data.unliteShader+toHolo(),
              hidden: false,
             opacity: 0.5, 
             phantom: true,
               decal: false,
             occlude: false
            });      
        };
        var dotlite = function(nodeId,rd) {
          rd.setProperties(nodeId,
            {
              shader: scope.data.dotlitShader+toHolo(),
              hidden: false,
             opacity: 0.5,
             phantom: false,
               decal: false,
             occlude: true
            });      
        };
        var normal = function(nodeId,rd) {
          rd.setProperties(nodeId,
            {
              shader: "Default",
              hidden: false,
             opacity: 1,
             phantom: false,
               decal: false,
             occlude: false
            });      
        };
        var tolist = function(ids,cb,rd) {
          if (ids != undefined && ids.length > 0) ids.forEach(function(id) {
            //make sure we're hitting a model that has been defined / loaded                                                  
            let base = scope.$parent.view.wdg[id.model];
            if (base != undefined && base.src != undefined && base.src.length > 0) { //has a model been loaded? 
              var nodeId = (scope.data.model != undefined ? scope.data.model : id.model)+'-'+id.path;                                                    
              cb(nodeId,rd,id.normalised);
            }
          });
        };

        var apply = function(re) {
            
          function isParent(a,b) {
            var c = b.path + '/';  
            return (!(a.path === b.path) && a.path.startsWith(c));
          }
          scope.data.prev = scope.data.results;
          scope.data.results = (Array.isArray(scope.infoField)) ? scope.infoField 
                             : scope.infoField.path != undefined ? [{model:scope.infoField.model,path:scope.infoField.path}]
                                                                 : [];
          
          // if the data item has 'selectedRows' then lets use the SUBSET of data to control the list
          if (scope.data.results != undefined && scope.infoField.selectedRows != undefined && scope.infoField.selectedRows.length > 0)
            scope.data.results = scope.infoField.selectedRows;
          
          if (scope.data.results === undefined || scope.data.results.length === 0) {
            scope.data.undo = (scope.data.undo != undefined) 
                            ? Enumerable.from(scope.data.undo).union([{model:scope.data.model, path:'/'}]).toArray()
                            : [];
          }
          
          // work out how many unique NEW items exist
          var left = (scope.data.results != undefined && scope.data.results.length > 0 &&
                      scope.data.prev    != undefined && scope.data.prev.length >0) 
                   ? Enumerable.from(scope.data.results)
                               //.except(scope.data.prev,"$.path")
                               .toArray() 
                   : scope.data.results;
                   
          if (scope.data.autoSelectChildren) {         
            // if the list contains parent ids, we need to 'auto-select' their children
            // 
            var mixin = (scope.data.undo != undefined) 
                      ? Enumerable.from(scope.data.undo)
                                  .where(a=>Enumerable.from(scope.data.results)
                                                      .where(b=>isParent(a,b))
                                                      .toArray()
                                                      .length > 0)
                                  .toArray()
                     : []; // empty
            left = Enumerable.from(left)                
                             .union(mixin)
                             .toArray();
          }

          // and work out how many unique OLD items need to be cleared out
          if (re === undefined && scope.data.undo != undefined && scope.data.undo.length > 0) {
            var diff = (left != undefined && left.length > 0) 
                     ? Enumerable.from(scope.data.undo)
                                 .except(left,"$.path")
                                 .toArray() 
                     : scope.data.undo;
                                 
            tolist(diff,(scope.data.polarity) ? dotlite : unlite, scope.renderer);
            
            //we need to keep a keep a running tally of ALL items we've undone
            scope.data.undo = (scope.data.undo != undefined && diff != undefined) 
                            ? Enumerable.from(scope.data.undo).union(diff).toArray()
                            : scope.data.undo != undefined ? scope.data.undo : diff;
          }
          
          tolist(left, hilite, scope.renderer);
          scope.data.undo = (scope.data.undo != undefined && left != undefined) 
                          ? Enumerable.from(scope.data.undo).union(left).toArray()
                          : scope.data.undo != undefined ? scope.data.undo : left;

          // signal we are done
          scope.$parent.fireEvent('complete');
        };

        var reapply = function() {
          apply(true);
        };
        
        var reset = function() {
          if (scope.data.undo != undefined)
            tolist(scope.data.undo, (scope.data.polarity) ? dotlite : normal, scope.renderer);
            //tolist(scope.data.undo, (scope.data.polarity === 'true') ? dotlite : unlite, scope.renderer);
          scope.data.model = scope.modelField != "" ? scope.modelField : scope.data.model;
          scope.data.undo  = [];
          scope.data.prev  = [];
        }

        var updateMapper = function(){
          scope.data.polarity = toBool(scope.polarityField);
          $timeout(function () {

            // what has changed?
            var changed = false;       
            
            if (scope.modelField != scope.data.model) {  
              reset();
              changed = true;  
            }           
            
            if (scope.legendField != scope.data.legend) {  
              scope.data.legend = scope.legendField + "?name=legend";
              scope.renderer.setTexture(scope.data.model+'-/',scope.data.legend);
              changed = true;  
            }           
            
            if (scope.shaderField != scope.data.shader) {  
              scope.data.shader = scope.shaderField;
              if (scope.data.shader != undefined && scope.data.shader != '') 
                scope.data.hiliteShader = scope.data.shader;  
              changed = true;  
            }           
            if (scope.defaultField != scope.data.default) {  
              scope.data.default = scope.defaultField;
              scope.data.unliteShader = (scope.data.default != undefined && scope.data.default != '') ? scope.data.default : defaultUnliteShader;  
              scope.data.dotlitShader = (scope.data.default != undefined && scope.data.default != '') ? scope.data.default : defaultDotlitShader;  
              changed = true;
            }           
            
            // if yes, re-apply the shaders. if not, run the query again
            if (changed === true)
              reapply();
            else
              apply();
          }, 1);

        };
        
        scope.$watchGroup(['legendField','polarityField','shaderField','modelField','defaultField','infoField'], function () {
          updateMapper();
        });

        scope.$watch('isholoField', function () {
          scope.data.isholo = scope.isholoField != undefined ? scope.isholoField : false;
        });
            
        scope.$watch('autoselectField', function () {
          scope.data.autoSelectChildren = scope.autoselectField != undefined ? toBool(scope.autoselectField) : true;
        });
            
        scope.$watch('colorField', function () {
          //
          // do we support colored highlighting, or stick with orange only?
          var rgb = scope.colorField.split(',');
          scope.data.hiliteColor = `;r f ${rgb[0]};g f ${rgb[1]};b f ${rgb[2]}`;

          updateMapper();
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
