if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'tethered-ng';
}

(function () {
  'use strict';

  var tetheredModule = angular.module('tethered-ng', []);
  tetheredModule.directive('ngTethered', ['$timeout', '$interval', '$http', '$window', '$injector', ngTethered]);

  function ngTethered($timeout, $interval, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        idField      : '@',  
        stepsField   : '@',
        affectsField : '@',
        widthField   : '@',
        heightField  : '@',
        autoField    : '@',
        visibleField : '@',
        isholoField  : '@',
        offsetField  : '@',
        shaderField  : '=',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                         id: undefined,
                    affects: undefined, 
                       auto: true,
                       snap: 0.5,
                      force: false,
                     offset: [0, 0.6],
                     tether: undefined,
                       args: undefined,
                   disabled: true,
                    visible: undefined,
                    pending: undefined
                     };
                     
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
                     
        //
        // lets create a single tether manager
        //
        if (scope.$root != undefined && scope.$root.tetherManager === undefined)
          scope.$root.tetherManager = new tetheredHelper(scope.renderer,$interval).Offset(scope.snap).Pause();
        scope.data.tether = scope.$root.tetherManager;
        
        //
        // we are mainly driven by the external clock which is the renderer location callback
        //
        scope.$root.$on('tracking', function(evt, arg) { 
          if (!scope.data.disabled) {
            scope.data.args = arg;          
            updateTethered();
          }
        });
                     
        var executeTethered = function() {
          var arg= scope.data.args;
          if (arg === undefined) return;
          
          //if ($window != undefined && $window.requestAnimationFrame != undefined)
          //  $window.requestAnimationFrame(scope.tether.headTether(arg));
          scope.data.tether.headTether(arg);
        };
        
        //
        //
        //
        var updateTethered = function() {
            
          $timeout(function () {
                     
            if (scope.data.pending != undefined) {
              scope.data.affects = scope.data.pending;
              scope.data.pending = undefined;           
            
              // we need to grab the location of these items
              scope.panels = [];
              
              // find ME and my location
              let base = scope.$parent.view.wdg[scope.data.id];
              
              scope.data.affects.forEach(function(a) {  
                var wname   = a.trim();
                var subject = scope.$parent.view.wdg[wname];
                if (subject != undefined) {
                  scope.panels.push({name: wname, 
                                      loc: [subject.x - base.x, 
                                            subject.y - base.y, 
                                            subject.z - base.z], 
                                backpanel: subject.showbacker!=undefined?subject.showbacker:undefined});
                }
              });
                
              if (scope.panels!=undefined && scope.data.id != undefined) {
                  
                // assign new control set   
                scope.data.tether.setPanels( [{
                                         name: scope.data.id,
                                         size: [scope.data.width,scope.data.height],
                                      buttons: scope.panels,
                                        delta: scope.data.offset,
                                onMoveStarted: scope.moveStarted,
                                  onMoveEnded: scope.moveEnded,
                              onDisconnecting: scope.disconnecting,
                               onDisconnected: scope.disconnected
                                             }]
                                           ).Offset(scope.data.snap);
                    
                //    
                // inform any controls of the state of the tethering    
                //
                if (scope.data.tether.isTethered() === true) {
                  scope.$parent.fireEvent('tethered');
                } else {
                  scope.$parent.fireEvent('untethered');
                }
              }
            }

            executeTethered();

          }, 1);
        };

        scope.$watch('affectsField', function () {
          // get the list of names
          if (scope.affectsField != undefined && scope.affectsField.length > 0) {
              
//            scope.data.pending = scope.affectsField.split(',');
          }
        });
            
        scope.disconnecting = function(panel,transition) {
          scope.data.disabled = transition.incoming != undefined;  
        }
        scope.disconnected = function(panel) {
          scope.data.disabled = true;  
          scope.data.affects  = undefined;
        }
        scope.moveStarted = function(){
          scope.$parent.fireEvent('aligning');
        }
        scope.moveEnded = function(){
          scope.$parent.fireEvent('aligned');
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
        scope.$watchGroup(['idField', 'stepsField', 'snapField', 'width', 'height', 'isholoField'], function () {
          scope.data.id     = (scope.idField     != undefined) ? scope.idField     : undefined;
          scope.data.steps  = (scope.stepsField  != undefined) ? parseFloat(scope.stepsField) : 15;                 
          scope.data.snap   = (scope.snapField   != undefined) ? parseFloat(scope.snapField) : 0.5;                 
          scope.data.width  = (scope.widthField  != undefined) ? parseFloat(scope.widthField) : 0.3;                 
          scope.data.height = (scope.heightField != undefined) ? parseFloat(scope.heightField) : 0.3;                 
          
          var isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
          if (isholo && !twx.app.isPreview()) {
            scope.shaderField = "holoPlate";
          }
                
        });

        //
        //xyz offset from head, so 2 comma-separated floats    
        //
        scope.$watch('offsetField', function () {
          scope.data.offset = (scope.offsetField != undefined) ? scope.offsetField.split(' ') : [0, 0.6];                 
        });

        //
        //
        //
        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          if (scope.data.auto) scope.data.tether.Start();          
          else                 scope.data.tether.Pause();
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
          $timeout(function () {
                   
            scope.data.pending = scope.affectsField.split(',');
            scope.data.disabled = false;

          }, 1);

        };
        var hide = function(force) {
            
          scope.data.pending = undefined;  
          if (force != undefined || scope.data.affects != undefined) $timeout(function () {
                   
            // if we are not attached (yet) then just hide
                   
            if (force || !twx.app.isPreview() && scope.data.affects === undefined) {
                
              let base = scope.$parent.view.wdg[scope.data.id];
              //base.visible = false;
              scope.renderer.setProperties(scope.data.id,{hidden:true});
              
              var affects = scope.affectsField.split(',');  
              affects.forEach(function(a) {  
                var wname   = a.trim();
                var subject = scope.$parent.view.wdg[wname];
                if (subject != undefined) {
                    //subject.visible = false;
                    scope.renderer.setProperties(wname,{hidden:true});
                }
              });
               
            } 
              
            // otherwise, we need to unlink
            scope.data.tether.setPanels( undefined );
            
          }, 1);

        };

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.show = function () {
              show();
            };
            delegate.hide = function () {
              hide();
            };
          }
        });
                
        // make sure we are triggered when the page is ready    
        /*    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
                        
          // kick off the next phase...
          if (scope.data.visible === true) show(true);           
          else                             hide(true);           
          
          updateTethered();
        });
        */    
        scope.$root.$on('modelLoaded', function(evt, arg) { 
          if (arg === scope.data.id) {              
            // kick off the next phase...
            if (scope.data.visible === true) show(true);           
            else                             hide(true);           
          
            updateTethered();
          }
        });

      }
    };
  }

}());
