if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'zio-ng';
}

(function () {
  'use strict';

  var zoiModule = angular.module('zoi-ng', []);
  zoiModule.directive('ngZoi', ['$timeout', '$interval', '$http', '$window', '$injector', ngZoi]);

  function ngZoi($timeout, $interval, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        idField          : '@',  
        srcField         : '@',
        autoField        : '@',
        colorField       : '@',
        disabledField    : '@',
        isholoField      : '@',
        cutoffField      : '@',
        extentField      : '@',
        floorField       : '@',
        zoidataField     : '=',
        valueField       : '=',
        delegateField    : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                         id: undefined,
                    zoidata: undefined,
                zoiselected: -1,
                       auto: true,
                      force: false,
                     isholo: false,
                     extent: 0.5,
                     cutoff: 666,
                      floor: 0,
                     helper: undefined,
                       args: undefined,
                      color: undefined,
                   disabled: false,
                    pending: undefined,
                      ready: false
                     };
                     
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
                     
        //
        // lets create a single navigator manager
        //
        var init = function() {
          var targets = {
                 zois: scope.data.zoidata,
                 geom: scope.data.src,
                color: scope.data.color,
          floorOffset: scope.data.floor
          };
          
          scope.data.helper = new zoiHelper(scope.renderer,targets)
                                 .Cutoff(scope.data.extent, scope.data.auto, scope.entered, scope.exited);
          
          scope.$root.zoihelper = scope.data.helper;
          
          // are you uready to rock?
          if (scope.data.ready && scope.data.disabled == false)
            show();                       
        }
        
        //
        // we are mainly driven by the external clock which is the renderer location callback
        //
        scope.$root.$on('tracking', function(evt, arg) { 
          if (scope.data.ready && scope.data.disabled == false) {
            scope.data.args = arg;          
            updatezois();
          }
        });
                     
        var executezois = function() {
          var arg= scope.data.args;
          if (arg               === undefined) return;
          if (scope.data.helper === undefined) return;
          
          scope.data.helper.draw(arg);
        };
        
        //
        //
        //
        var updatezois = function() {
            
          $timeout(function () {
            executezois();
          }, 1);
        };
        
        //
        // these are callbacks from the helper, indicating we have entered/exited a zone
        //
        scope.entered = function(h,d) {
            
          //which target/one have we crossed into  
          var target = h.targets[d.index];
          
          // and set the shared output - note : this needs to be an infotable
          let row = { position: target.position.ToString(),
                          name: target.name,
                        cutoff: h.cutoff
                    };
          scope.valueField = buildInfoTable( [row] );
          scope.$parent.fireEvent('arrived',target);
        }
        scope.exited = function(h,d) {
            
          //which target/one have we left 
          var target = h.targets[d.index];
          
          // and set the shared output - note : this needs to be an infotable
          let row = { position: target.position.ToString(),
                          name: target.name,
                        cutoff: h.cutoff
                    };
          scope.valueField = buildInfoTable( [row] );
          scope.$parent.fireEvent('departed',target);
        }
        
        //////////////////////////////////////////////////////////////////////
        //setup stuff    
        //
        function isbool(v) {
          return (v==='true')||v===true;
        }
    
        // not updated too often, so handle as a group    
        //
        //
        scope.$watchGroup(['idField', 'colorField', 'isholoField'], function () {
          scope.data.id     = (scope.idField     != undefined) ? scope.idField : undefined;
          scope.data.color  = (scope.colorField  != undefined) ? scope.colorField.split(',') : [0,1,0];
          scope.data.isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
        });

        //
        // z offset from head   
        //
        scope.$watchGroup(['cutoffField'], function () {
          scope.data.cutoff = (scope.cutoffField != undefined) ? parseFloat(scope.cutoffField) : 666;                 
          if (scope.data.helper != undefined) {
            scope.data.helper.Cutout(scope.data.cutoff);
          }
        });
            
        //
        // height offset of feet from virtual floor (tracking.y = 0)
        //
        scope.$watch('floorField', function () {
          scope.data.floor  = (scope.floorField  != undefined) ? parseFloat(scope.floorField)  : 0;                 
          if (scope.data.helper != undefined) {
            scope.data.helper.Offset(scope.data.floor);
          }
        });
            
        //    
        // distance at which we trigger enter/exit crossing events    
        //
        scope.$watch('extentField', function () {
          scope.data.extent = (scope.extentField != undefined) ? parseFloat(scope.extentField) : 0.5;                 
          if (scope.data.helper != undefined) {
            scope.data.helper.Cutoff(scope.data.extent, scope.data.auto, scope.entered, scope.exited);
          }
        });
            
        //
        // let's emit an info table - this makes the data easily consumable by Thingworx
        // not sure if there's a twx function to do this already?
        //
        function buildInfoTable(rows) {
          var itable = { 
                 rows: rows,
            dataShape: {
              fieldDefinitions: {
                name: {aspects: {}, baseType: "STRING", name: "name"      },            
            position: {aspects: {}, baseType: "STRING", name: "position"  }            
              }
            }
          };     
          return itable;
        }
            
        //
        //
        //
        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          if (scope.data.auto) show();          
          else                 hide();
        });
            
        //
        // move locator to specified location (index)    
        //
        scope.setSelected = function() {
          if (scope.data.ready &&
              scope.data.helper  != undefined && 
              scope.data.zoidata != undefined) $timeout(function() { 
          
            scope.data.helper.Set(scope.data.zoidata).show();
          },1);
        }
        
        //
        // look for changes in input data
        //
        scope.$watch(
          function() { return JSON.stringify(scope.zoidataField)},
          function(value) {
            scope.data.zoidata = scope.zoidataField ;
            scope.setSelected();
          }
        )
            
        //
        //
        //
        scope.$watch('disabledField', function () {
                     
          scope.data.disabled = (scope.disabledField != undefined && scope.disabledField === 'true') ? true :false ;
      
        });
            
        var show = function(){
          //force visble      
          scope.data.disabled = false;  
          
          if (scope.data.helper != undefined) {
            scope.data.helper.show();          
          }
        
        };
        
        
        var hide = function(force) {
            
          if (scope.data.helper != undefined) 
            scope.data.helper.hide();
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
              if (scope.data.helper != undefined) {
                    
                var newname = scope.idField + Date.now();    
                scope.data.helper.addAtCurrent(newname).show();
                  
                // async, we get the new value and add to the zoidata table
                // this is a bidirectional bind, so others can register interest and get the value
                $timeout(function() {
                  var newzoi = scope.data.helper.get();
                  
                  // and add it to the data
                  if (scope.data.zoidata === undefined) 
                    scope.data.zoidata = [];
                    
                  let newvalue = { position: newzoi.position.ToString(),
                                       name: newzoi.name,
                                     cutoff: scope.data.extent
                                 };
                  scope.data.zoidata.push(newvalue);
                  scope.valueField = buildInfoTable([newvalue]);
                      
                  // select the last item    
                  scope.zoidataField     = scope.data.zoidata;
                  scope.$parent.fireEvent('marked');
                },1);
              }
            };
          }
        });

        //
        // make sure we are triggered when the page is ready    
        //    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          // check that I (as named widget) am referenced in this view              
          if (event.targetScope.view.wdg[scope.data.id] != undefined) {
            scope.data.ready = true;
            init();              
          }
        
        });
            
      }
    };
  }

}());
