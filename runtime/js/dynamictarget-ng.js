if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'dynamictarget-ng';
}

(function () {
  'use strict';

  var dynamicTargetModule = angular.module('dynamictarget-ng', []);
  dynamicTargetModule.directive('ngDynamictarget', ['$timeout', '$http', '$window', '$rootScope', '$injector', '$interval', ngDynamicTarget]);

  function ngDynamicTarget($timeout, $http, $window, $rootScope, $injector, $interval) {

    return {
      restrict: 'EA',
      scope: {
        nameField: '@',  
        datasetField: '@',
        urlField: '@',
        targetidField: '@',
        sizeField: '@',
        trackedField: '=',
        loggingField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {
            ready:false,
            name: undefined,
            dataset: undefined,
            guidesrc: undefined,
            size: undefined,
            targetid: '',
            rootTracker: undefined,
            assets: undefined,
            processTree: undefined,
            apply: undefined,
            log:''
        };

        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        
        function log(v,s) {
          console.log(v);  
          s.data.log = scope.data.log + v + '\n';
          s.loggingField = scope.data.log;
          s.$parent.$applyAsync();
        }
        /*
        log('VF_ANG has processTree = ' + (VF_ANG.processTree != undefined && typeof (VF_ANG.processTree) === "function") , scope);
        scope.data.processTree = VF_ANG.processTree;
        VF_ANG.processTree = function (tracker, assets, apply) {
          log('intercepted processTree for tracker ' + JSON.stringify(tracker), scope);
          scope.data.rootTracker = tracker;  
          scope.data.assets = assets;
          scope.data.apply  = apply;
        }
        scope.data.addAsset = VF_ANG.addAsset;
        VF_ANG.addAsset = function(renderer, asset, addFunc) {
          log('deferred addAsset being called for ' + asset.id,scope);
          scope.data.addAsset(renderer,asset,addFunc);  
        }
        */
        var execute = function () {
            
          //grab the widget scope  
          var wscope = scope;
     
          var markerDef = [{ src: wscope.data.dataset, size: wscope.data.size }];
          wscope.renderer.loadTrackerDef(markerDef, (successMarkerSrcs) => {
                                        
            var tracker = 'tracker1';
            wscope.renderer.addTracker(tracker, () => {
                                      
              var tname = wscope.data.name;
              wscope.renderer.addMarker(tracker, tname, wscope.data.dataset, undefined, () => {
                                       
                wscope.renderer.setTranslation(tname, 0, 0, 0);
                wscope.renderer.setRotation   (tname, 0, 0, 0);
                wscope.renderer.setScale      (tname, 1, 1, 1);  // this needs to reflect target scale
                
                if (typeof (wscope.renderer.addTargetGuide) === "function") {
                  wscope.renderer.addTargetGuide({ tracker: tracker, target: tname, src: wscope.data.guidesrc });
                } else {
                  var targetGuideDiv = document.querySelector("div.targetGuide");
                  if (targetGuideDiv && wscope.data.guidesrc != undefined) {
                    var pscope = wscope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
                    pscope.hideTargetGuide = false;
                    pscope.targetGuideClass = "imagemark";
                    targetGuideDiv.style.backgroundImage = "url('" + wscope.data.guidesrc + "')";
                    pscope.$applyAsync();

                  } else {
                    log("target div not found\n",wscope);  
                  }
                }
                
                if (wscope.data.processTree != undefined) {
                  log('deferred call to processTree',wscope);  
                  wscope.data.processTree(wscope.data.rootTracker, wscope.data.assets, wscope.data.apply);
                }
              },
              (err) => {
                log('addMarker failed',wscope);
              })
            },
            (err) => {
               log('addTracker failed',wscope);
            })
          },
          (err) => {
             log('loadTrackerDef failed',wscope);
          });
          
        };
        
        //
        //todo : we should only be doing this IF we are responsible for the tracking
        scope.$root.$on('trackingacquired', function (event, args) {
          var targetGuideDiv = document.querySelector("div.targetGuide");
          if (targetGuideDiv) {
            var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
            pscope.hideTargetGuide = true;
            targetGuideDiv.style.backgroundImage = "";
            pscope.$applyAsync();
          }
          scope.trackedField = true;
          
          log("tracking",scope);
        });

        scope.$root.$on('trackinglost', function (event, args) {
          var targetGuideDiv = document.querySelector("div.targetGuide");
          if (targetGuideDiv) {
            var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
            pscope.hideTargetGuide = false;
            targetGuideDiv.style.backgroundImage = "url('" + scope.data.guidesrc + "')";
            pscope.$applyAsync();
          }
          scope.trackedField = false;
          log("not tracking",scope);
        });

        scope.$watch('nameField', function () {
          scope.data.name = scope.nameField;                         
          console.log('name',scope.data.name);
        });
            
        scope.$watch('urlField', function () {
          scope.data.guidesrc = scope.urlField;                         
          console.log('guide',scope.data.guidesrc);
        });
            
        scope.$watch('datasetField', function () {
          if (scope.datasetField != undefined && 
              scope.datasetField.length > 0 &&
              scope.datasetField != scope.data.dateset) {
          
            scope.data.dataset = scope.datasetField;               
            console.log('dataset',scope.data.dataset);
            
            if (scope.data.ready)
              execute();
          }
        });
            
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          //startup                
          scope.data.ready = true;
          console.log('startup','dataset',scope.datasetField);
          if (scope.data.dataset != undefined)
            execute();
        });
        scope.$root.$on("$ionicView.beforeLeave", function (event) {
          // clean up

        });
            
      }
    };
  }

}());


