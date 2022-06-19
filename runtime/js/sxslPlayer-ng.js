if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'sxslplayer-ng';
}

(function () {
  'use strict';

  var sxslPlayerModule = angular.module('sxslplayer-ng', []);
  sxslPlayerModule.directive('ngSxslplayer', ['$timeout', '$http', ngSxslplayer]);

  function ngSxslplayer($timeout, $http) {

    return {
      restrict: 'EA',
      scope: {
        disabledField : '@',
        physicalField : '@',
        resourceField : '@',
      reasoncodeField : '@',
         contextField : '=',
        steplistField : '=',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { name: undefined, 
                   disabled: false, 
                        src: undefined, 
                    context: undefined,
                 reasonCode: {}, 
                   steplist: [], 
                   physical: true
                     };
                     
        //make up some steps
        for(var i=0;i<10;i++) {
          scope.data.steplist.push({display:"step "+(i+1),value:i})
        }

        var executesxslPlayer = function() {
          if (!scope.data.disabled) {
            console.log('physical',scope.data.physical);
            scope.contextField = scope.data.context;
            scope.steplistField = scope.data.steplist;
          } else {
            console.log('disabled');
            scope.contextField = '';
            scope.steplistField = undefined;
          }
        };
        
        var halt = function() {
          console.log('halting for reason',scope.data.reasonCode);
          scope.data.disabled = true;
          executesxslPlayer();
          scope.$parent.fireEvent('terminated');
        }
        var pause = function() {
          console.log('pausing for reason',scope.data.reasonCode);
          scope.data.disabled = true;
          executesxslPlayer();
        }
        
        function getContext(context) {

          // look through the context to find a a suitable model to display - if we are physical, we will show "full" (or occluder if full not avilable)
          // otherwise we use occluder
          var contextual={};
          if (context.models != undefined) context.models.forEach(function(model) {
            if (model.tags!=undefined) model.tags.forEach(function(tag) {
              switch (tag) {
              case "full":
                contextual.model = model.url;
                contextual.mime  = model.mimeType;
                contextual.tag   = tag;
                console.log("using",tag);
                break;
              case "occlusion":
                if (contextual.tag === undefined || contextual.tag != "full") {
                  contextual.model = model.url;
                  contextual.mime  = model.mimeType;
                  contextual.tag   = tag;
                }
                console.log("using",tag);
                break;
              } 
            });
          });
  
          contextual.target = {};
          if (context.trackers != undefined) context.trackers.forEach(function(tracker) {
            switch(tracker.mimeType) {
            case "application/vnd.ptc.tracker.modeltracker":
              var target='vuforia-model:///';
 
              var tgt = tracker.content.dataset.dat;
              var urlidx = tgt.lastIndexOf('.dat');
              target = target + tgt.substring(0,urlidx) + '?id=';
      
              contextual.target.target = target;
              contextual.target.y  = 0 ;
              contextual.target.rx = 0 ;
      
              if (tracker.content.guideView != undefined) {
                contextual.target.guide = tracker.content.guideView.url; 
              } else if (tracker.guideview != undefined) {
                contextual.target.guide = tracker.guideview.url; 
              } else {
                contextual.target.guide = ""; 
              }
        
              break;
            default:
              contextual.target.target ='spatial://';
              break;
            }
          });

          return contextual;

        }
        function getSteps(proc) {
        
          var steplist = [];
          if (proc.statements != undefined) proc.statements.forEach(function(statement,idx) {
            var stepid = statement.stepId;
            //now find the step
            for(var i=0;i<proc.steps.length;i++) {
                if (proc.steps[i].id == stepid) {
                    //found it
                  var step = proc.steps[i];  
                  var title = step.title != undefined ? step.title.resources[0].text : step.id;
                  steplist.push( {display:title, value:idx });  
                  break;
                }
            }
          });
          return steplist;
        }
        
        scope.$watch('resourceField', function () {
          scope.data.src = (scope.resourceField != undefined) ? scope.resourceField : '';
          
          $http.get(scope.data.src)
               .success(function(data, status, headers, config) {
                  var proc = scope.data.sxsl = data;
                  //for now. let's just grab the context block...      
                  var context = proc.contexts[Object.keys(proc.contexts)[0]];
                  scope.data.context = getContext(context);
                  // and the steps
                  scope.data.steplist = getSteps(proc);
                  executesxslPlayer();
               })
               .error(function(data, status, headers, config) {
                 console.log(status);           
               });
      
        });
            
        scope.$watch('reasoncodeField', function () {
          scope.data.reasonCode = (scope.reasoncodeField != undefined) ? scope.reasoncodeField : {};
        });
            
        scope.$watchGroup(['physicalField','disabledField'], function () {
          scope.data.physical = (scope.physicalField    != undefined && scope.physicalField === 'true') ? true :false ;
          scope.data.disabled = (scope.disabledField    != undefined && scope.disabledField === 'true') ? true :false ;
          executesxslPlayer();
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { return scope.steplistField != undefined ? JSON.stringify(scope.steplistField.selectedRows) : ''},
          function(value) {
            if (value != undefined && scope.steplistField != undefined) 
              console.log('being directed to move to',value);  
        });


        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.halt = function () { 
              halt(); 
            };
            delegate.pause = function () { 
              pause(); 
            };
          }
        });

      }
    };
  }

}());
