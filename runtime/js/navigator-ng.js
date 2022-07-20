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
        cutoffField      : '@',
        extentField      : '@',
        floorField       : '@',
        poidataField     : '=',
        valueField       : '=',
        poiField         : '@',
        delegateField    : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                         id: undefined,
                    poidata: undefined,
                poiselected: -1,
                      steps: 15,
                       auto: true,
                      force: false,
                     isholo: false,
                     extent: 0.45,
                     cutoff: 0.5,
                      floor: 0,
                  navigator: undefined,
                       args: undefined,
                tunnelColor: undefined,
                  feetColor: undefined,
                  tunnelSrc: undefined,
                       head: false,
                    visible: undefined,
                    pending: undefined,
                      ready: false
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
                color: scope.data.feetColor,
          floorOffset: scope.data.floor
          };
          
          scope.data.navigator = new spatialHelper(scope.renderer,tunnel,targets)
                                 .Cutoff(scope.data.cutoff, scope.data.auto, scope.entered, scope.exited);
          
          scope.$root.helper = scope.data.navigator;
          if (scope.data.ready)
            scope.setSelected();                       
        }
        //
        // we are mainly driven by the external clock which is the renderer location callback
        //
        scope.$root.$on('tracking', function(evt, arg) { 
          if (scope.data.ready && scope.data.visible) {
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

        scope.entered = function(h,d) {
          scope.$parent.fireEvent('arrived');
        }
        scope.exited = function(h,d) {
          scope.$parent.fireEvent('departed');
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
        scope.$watchGroup(['idField', 'stepsField', 'tunnelColorField', 'tunnelSrcField', 'isholoField'], function () {
          scope.data.id          = (scope.idField          != undefined) ? scope.idField : undefined;
          scope.data.steps       = (scope.stepsField       != undefined) ? parseFloat(scope.stepsField) : 15;                 
          scope.data.tunnelColor = (scope.tunnelcolorField != undefined) ? scope.tunnelcolorField.split(',') : [1,1,0];
          scope.data.tunnelSrc   = (scope.tunnelsrcField   != undefined && scope.tunnelsrcField != '') ? scope.tunnelsrcField : undefined;
          scope.data.isholo      = (scope.isholoField      != undefined) ? isbool(scope.isholoField) : false;
        });

        scope.$watchGroup(['deviceField', 'headField', 'feetField', 'feetColorField'], function () {
          scope.data.device    = (scope.deviceField != undefined && 
                                  scope.deviceField.length > 0) ? scope.deviceField : undefined;
          scope.data.head      = (scope.headField != undefined) ? isbool(scope.headField) : false;                 
          scope.data.feet      = (scope.feetField != undefined && isbool(scope.feetField)) ? scope.feetsrcField   : undefined;                 
          scope.data.feetColor = (scope.feetcolorField != undefined) ? scope.feetcolorField.split(',') : [0,1,0];                 
        });
            
        //
        // z offset from head   
        //
        scope.$watch('extentField', function () {
          scope.data.extent = (scope.extentField != undefined) ? parseFloat(scope.extentField) : 0.45;                 
        });
            
        //
        // height offset of feet from virtual floor (tracking.y = 0)
        //
        scope.$watchGroup(['floorField'], function () {
          scope.data.floor  = (scope.floorField  != undefined) ? parseFloat(scope.floorField)  : 0;                 
          if (scope.data.navigator != undefined) {
            scope.data.navigator.Offset(scope.data.floor);
          }
        });
            
        //    
        // distance at which we trigger enter/exit crossing events    
        //
        scope.$watch('cutoffField', function () {
          scope.data.cutoff = (scope.cutoffField != undefined) ? parseFloat(scope.cutoffField) : 0.5;                 
          if (scope.data.navigator != undefined) {
            scope.data.navigator.Cutoff(scope.data.cutoff, scope.data.auto, scope.entered, scope.exited);
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
                gaze: {aspects: {}, baseType: "STRING", name: "gaze"      },            
            position: {aspects: {}, baseType: "STRING", name: "position"  },            
                  up: {aspects: {}, baseType: "STRING", name: "up"        },
            metadata: {aspects: {}, baseType: "STRING", name: "metadata"  }
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
              scope.data.navigator   != undefined && 
              scope.data.poidata     != undefined && 
              scope.data.poiselected >= 0         && 
              scope.data.poiselected < scope.data.poidata.length) $timeout(function() { 
          
            //build the locator
            let dp     = (typeof scope.data.poidata === 'string') ? JSON.parse(scope.data.poidata) : scope.data.poidata;
            let rp     = Array.isArray(dp) ? dp[scope.data.poiselected] : dp;
            let selrow = { position: rp.position, 
                               gaze: rp.gaze, 
                                 up: rp.up,
                             cutoff: rp.cutoff,
                              color: rp.color,
                           metadata: rp.metadata
                         }; // we only want these fields
            
            var locator = { position: new Vector4().FromString(selrow.position),
                                gaze: new Vector4().FromString(selrow.gaze),
                                  up: new Vector4().FromString(selrow.up),
                               color: selrow.color };
            scope.data.navigator.setAt(locator).show();
            
            // if the poi is actually a zoi (zone) then let's use the radius
            if (rp.cutoff != undefined)
              scope.data.navigator.Cutoff(rp.cutoff, scope.data.auto, scope.entered, scope.exited);
            
            // and set the shared output - note : this needs to be an infotable
            scope.valueField = buildInfoTable( [selrow] );
            scope.$parent.fireEvent('activated');
          },1);
        }
        
        //
        // look for changes in input data
        //
        scope.$watch(
          function() { return JSON.stringify(scope.poidataField)},
          function(value) {
            scope.data.poidata = scope.poidataField ;
              
            //reset the selected index if it is out of range  
            //question : should we do this always i.e. always reset to zero
            if (scope.data.poidata != undefined && 
                scope.data.poidata instanceof Array && 
                scope.data.poiselected >= scope.data.poidata.length)
              scope.data.poiselected = 0;
              
            scope.setSelected();
          }
        )
            
        scope.$watch('poiField', function () {
          scope.data.poiselected = scope.poiField != undefined ? parseInt(scope.poiField) : -1;
          scope.data.poidata = scope.poidataField ;
          scope.setSelected();
        });
            
        scope.$watch(
          function() { return JSON.stringify(scope.poidataField.selectedRows)},
          function(value) {
            // we need to work out which row (index)
            if (scope.data.poidata != undefined && 
                scope.data.poidata.length > 1) scope.data.poidata.forEach(function(row,idx) {
                    
              if (row._isSelected == true) {
                console.log(row,idx);    
                
                scope.data.poiselected = idx;
                scope.setSelected();
              }
            });
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
              if (scope.data.navigator != undefined) {
                scope.data.navigator.setAtCurrent().show();
                  
                // async, we get the new value and add to the poidata table
                // this is a bidirectional bind, so others can register interest and get the value
                $timeout(function() {
                  var newloc = scope.data.navigator.get();
                  
                  // and add it to the data
                  if (scope.data.poidata === undefined) 
                    scope.data.poidata = [];
                    
                  let newvalue = { position: newloc.position.ToString(), 
                                       gaze: newloc.gaze.ToString(), 
                                         up: newloc.up.ToString() 
                                  };
                  scope.data.poidata.push(newvalue);
                  scope.valueField = buildInfoTable([newvalue]);
                      
                  // select the last item    
                  scope.data.poiselected = scope.data.poidata.length - 1;    
                  scope.poidataField     = scope.data.poidata;
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
            
        //    
        // ugly timing hack ; retrigger initial placement when model(s) are loaded
        // ideally this would be when MY models are loaded (not any others) but there's an even
        // uglier timing problem going on underneath this
        //
        scope.$root.$on('modelLoaded', function(evt, arg) { 
          if (!scope.data.ready) {
            scope.data.ready = true;
            $timeout(scope.setSelected,2000);
          }
        });

      }
    };
  }

}());
