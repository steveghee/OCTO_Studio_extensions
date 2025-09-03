if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'snooze-ng';
}

(function () {
  'use strict';

  var snoozeModule = angular.module('snooze-ng', []);
  snoozeModule.directive('ngSnooze', ['$timeout', '$interval', '$window', '$injector', ngSnooze]);

  function ngSnooze($timeout, $interval, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        idField       : '@',  
        timeoutField  : '@',
        disabledField : '@',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                         id: undefined,
                    timeout: 5,
                   disabled: false,
                    counter: undefined,
                 killswitch: undefined,
                  countdown: 5,
                   gameover: false,
                       game: undefined,
                        loc: {  pos: undefined, gaze:undefined, prev:undefined, d:1 },
                      ready: false
                     };
                     
        //
        // lets create a single navigator manager
        //
        var init = function() {
          scope.data.loc = { pos: undefined, gaze:undefined, prev:undefined, d:1 };
          //max countdown is 10 seconds
          scope.data.countdown = scope.data.timeout > 10 ? 10 : scope.data.timeout;
          scope.data.gameover  = false;
          
          // start the watcher ...
          scope.data.game = $interval(function() {
            stillawake(); 
          }, 1000);
              
        };
        
        var snooze = function() {
            
          var firecancel = false;  
          if (scope.data.killswitch != undefined) {
            $timeout.cancel(scope.data.killswitch);
            scope.data.killswitch = undefined; 
          }
          
          if (scope.data.counter != undefined) {
            $interval.cancel(scope.data.counter);
            scope.data.counter   = undefined;
            scope.data.countdown = scope.data.timeout > 10 ? 10 : scope.data.timeout;
            firecancel = true;
          }
          
          if (scope.data.game == undefined) {
            init();
            firecancel = true;  
          }
        
          if (firecancel) $timeout(function() {
            scope.$parent.fireEvent('countcancelled');
          },10);
        }
        
        // here we're tracking the location so let's figure out if we're still
        // moving
        //
        var stillawake = function() {
  
          if (scope.data.gameover || scope.data.loc.pos == undefined) return;
          if (!scope.data.ready || scope.data.disabled) return;
  
          //how far have we moved?
          var p = scope.data.loc.pos
          var g = scope.data.loc.gaze;
          var q = p.Add(g);
          if (scope.data.loc.prev != undefined) 
            scope.data.loc.d = q.Sub(scope.data.loc.prev).Length();
            
          scope.data.loc.prev = q;
          
          // looks like we stopped moving?
          if (scope.data.killswitch == undefined && scope.data.loc.d < 0.001) {
              
            //we're pending the countdown, but not yet...
            //console.log(scope.data.loc.d);
            scope.data.killswitch = $timeout(prepareToDie, scope.data.timeout * 1000); // N seconds

          } else if (scope.data.loc.d > 0.001) {

            //console.log(scope.data.loc.d);
            snooze();
          }
  
        };
        
        // we're in a period where we've detected 'put down' so we're waiting 
        // to confirm
        //
        var prepareToDie = function() {
            
          //fire 'countingdown' event here  
          console.log(scope.data.countdown, "seconds");
          $timeout(function() {
            scope.$parent.fireEvent('countingdown');
          },10);
      
          scope.data.counter = $interval(function() {

            scope.data.countdown -= 1;
            console.log(scope.data.countdown, "seconds");
            $timeout(function() {
              scope.$parent.fireEvent('countingdown');
            },10);
                
            // we've hit zero, so signal "times out"...
            //
            if (scope.data.countdown == 0) {
              $interval.cancel(scope.data.counter);
              
              scope.data.countdown = 5;
              scope.data.counter   = undefined;
              scope.data.gameover  = true;
              
              $interval.cancel(scope.data.game);
              scope.data.game = undefined;
              console.log("game over");
              
              //fire the 'stopped' event
              $timeout(function() {
                scope.$parent.fireEvent('stopped');
              },10);
                  
            }
          }, 1000);

        }

        //
        // we are mainly driven by the external clock which is the renderer location callback
        //
        scope.$root.$on('tracking', function(evt, args) { 
          if (scope.data.ready && scope.data.disabled == false) {
              
            // each time we track, we reset the timer if we have not moved by a certain amount
            scope.data.loc.pos  = new Vector4().Set3a(args.position); 
            scope.data.loc.gaze = new Vector4().Set3a(args.gaze);
          }
        });
                     
        //////////////////////////////////////////////////////////////////////
        //setup stuff    
        //
        function isbool(v) {
          return (v==='true')||v===true;
        }
    
        // not updated too often, so handle as a group    
        //
        //
        scope.$watchGroup(['idField', 'timeoutField'], function () {
          scope.data.id      = (scope.idField      != undefined) ? scope.idField : undefined;
          scope.data.timeout = (scope.timeoutField != undefined) ? scope.timeoutField : 5;
        });
        //
        //
        scope.$watch('disabledField', function () {
          scope.data.disabled = (scope.disabledField != undefined && scope.disabledField === 'true') ? true :false ;
        });
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.snooze = function () {
                
              //reset any countdown, if it was counting down
              snooze();
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
