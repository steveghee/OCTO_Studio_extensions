if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'octoPinger-ng';
}
(function() {
  'use strict';
  var octoPingerModule = angular.module('octoPinger-ng', []);
  octoPingerModule.directive('octopinger', [ 'tml3dRenderer', '$animate', function (renderer, $animate) {
        return {
            restrict: 'E',
            require: '^twxDtTracker',
            link: function (scope, element, attrs, ctrl) {
                // We have to backup tracker as it will change when next twxDtTracker is encountered by Angular.
                var tracker = scope.tracker;

                var addFunction = function addFunction (addFunctionAddAPICallCallback, addFunctionSuccessCallback,
                                                        addFunctionFailureCallback) {
                    var asset = VF_ANG.createObj("octopinger", element);
                    $animate.enabled(element, false);

                    asset.addAsset = function() {
                        var addSuccessCallback = function() {
                            addFunctionSuccessCallback();

                            VF_ANG.addAssetCallback(scope, asset, renderer);
                        };

                        var addFailureCallback = function (error) {
                            addFunctionFailureCallback();

                            console.log("Error in addPinger for [" + element.attr("id") + "] due to [" + error + "]");
                        };

                        var image = element.attr("src");
                            VF_ANG.addAsset(renderer, asset, function() {
                                addFunctionAddAPICallCallback();

                                var params = {
                                    "tracker" : tracker.name,
                                    "id" : element.attr("id"),
                                    "src" : image,
                                    "parent" : asset.parentId,
                                    "leaderX" : element.attr("leaderx"),
                                    "leaderY" : element.attr("leadery"),
                                    "anchor" : element.attr("anchorType"),
                                    "width" : element.attr("width"),
                                    "height" : element.attr("height"),
                                    "pivot" : element.attr("pivot"),
                                    "preload" : element.attr("preload")
                                };

                                renderer.add3DImage(params,
                                                    addSuccessCallback,
                                                    addFailureCallback);
                            });
                        
                    };

                    ctrl.addAssetOrQueueForAdditionIfNeeded(tracker, asset);
                };

                var setFunction = function setFunction () {
                    var image = element.attr("src");
                    renderer.setTexture(element.attr('id'), element.attr('src'));
                };

                var attributeNames = [ "class", "src" ];
                VF_ANG.setupWatchWithAddSetConvention(scope, element, attributeNames, addFunction, setFunction);
            }
        };
    }])
})();
  
  
