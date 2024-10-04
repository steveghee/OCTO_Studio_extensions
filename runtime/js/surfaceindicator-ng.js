if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'surfaceindicator-ng';
}

(function () {
  'use strict';

  var surfModule = angular.module('surfaceindicator-ng', []);
  surfModule.directive('ngSurfaceindicator', ['$timeout', '$http', '$window', '$injector', ngSurfaceIndicator]);
  
  function addNamedImage(name,pos,rot,show,scope) {
    var params = {
      tracker : 'tracker1',
      id      : name,
      src     : scope.data.src,
      parent  : undefined,
      leaderX : undefined, // Unused leaderX
      leaderY : undefined, // Unused leaderY
      anchor  : undefined, // Unused anchor
      width   : undefined,
      height  : scope.data.size, 
      pivot   : scope.data.isTangential ? 5 : 8,
      preload : false
    };

    scope.renderer.add3DImage(params, () => {
  
      // we added the image, so set the location
      scope.data.pointer = name;
      
      //there's a bug in Preview where we MUST set the scale even though if SHOULD default to 1,1,1
      //this does not manifest itself if you run on actual devices i.e. tml runtime is OK< but preview is not
      if (twx.app.isPreview()) scope.renderer.setScale(name,1,1,1);
    
      scope.renderer.setTranslation(name,pos.X(), pos.Y(), pos.Z());
      scope.renderer.setRotation   (name,rot.X(), rot.Y(), rot.Z());
      scope.renderer.setProperties (name,{hidden:!show, forceHidden:false});
      scope.$parent.$applyAsync();
    },
    (err) => {
      // something went wrong
      console.log(`add3DImage failed to add new image: ${JSON.stringify(err)}`); 
    });
  }

  function ngSurfaceIndicator($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        modelField   : '@',
           sizeField : '@',
       disabledField : '@',
            srcField : '@',
        tangentField : '@',
           infoField : '=',
       resultsField  : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
          
        scope.data = {  model: undefined,
                          src: undefined,
                         info: undefined,
                      pointer: undefined,
                   tangential: false,
                         size: 0.2,
                         gaze: new Vector4().Set3(0,0,1),
                            N: new Vector4().Set3(0,1,0),
                           up: new Vector4().Set3(0,1,0),
                     disabled: false
                     };
                     
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');

        //
        var apply = function() {
        };
        
        function setPointer(pos,rot,show) {
            
          if (scope.data.pointer == undefined) {
            addNamedImage("octoSurfaceIndicatorPointer",pos,rot,show,scope);
          } else {
            var name = scope.data.pointer;
            scope.renderer.setTranslation(name,pos.X(), pos.Y(), pos.Z());
            scope.renderer.setRotation   (name,rot.X(), rot.Y(), rot.Z());
            scope.renderer.setProperties (name,{hidden:!show, forceHidden:false});
          }
          
          // and report this location+normal
          scope.resultsField = [ { model: scope.data.model, 
                                    path: scope.data.pathid, 
                                position: pos.ToObject(), 
                                    gaze: scope.data.N.ToObject(), 
                                      up: scope.data.up.ToObject(), 
                                   scale: scope.data.size } ];
          scope.$parent.fireEvent('complete');
          scope.$parent.$applyAsync();
        }
        
        scope.$root.$on('tracking', function(evt, arg) { 
          if (!scope.data.isTangential) {
            scope.data.gaze = new Vector4().Set3(arg.gaze[0],arg.gaze[1],arg.gaze[2]);
            scope.data.up   = new Vector4().Set3(arg.up[0],arg.up[1],arg.up[2]);
          }
        });
            
        scope.vertical   = new Vector4().Set3(  0,0,0);
        scope.horizontal = new Vector4().Set3(-90,0,0);
        scope.$root.$on('userpick', function(evt, src, type, evtdata) { 
                        
          //only follow this IF there is no bound input and we are enabled              
          if (scope.data.model === src && !scope.data.disabled && scope.infoField === undefined) {
              
            var evtData = JSON.parse(evtdata);
            var pathid  = evtData.occurrence;
            scope.data.pathid = pathid;
            
            if (evtData.position != undefined) {
                
              // we get the (accurate?) pick point directly from the pick
              var position = evtData.position;
              var normal   = evtData.normal;
      
              var ps  = new Vector4().Set3a(position);
              var N   = new Vector4().Set3a(normal);
              scope.data.N = N;
              
              // up should be calaulated based on the current gaze vector - this will ensure we can see the marker
              var gz = scope.data.gaze;
              
              //are these nearly parallel?
              var dp = Math.abs(N.DotP(gz));
              if (dp > 0.9) gz = scope.data.up; // choose different vector
              
              var xd = N.Normalize().CrossP(gz);
              var up = gz.CrossP(xd).Normalize();
      
              var mat = new Matrix4().makePose(ps,N.Negate(),up);
              var flip = new Matrix4().Rotate([1,0,0],-90,true);
              var oot = scope.data.isTangential ? mat.ToPosEuler(true) 
                                                : flip.Multiply(mat.m).ToPosEuler(true);
              
              setPointer(oot.pos, oot.rot, true);
          
            } else {
                
              PTC.Structure.fromId(scope.data.model)
                            .then ( (structure) => {
                //   
                // Get the properties of the 'model-1' widget
                // as we need to adjust the bbox into physical space to match where the widget has placed it
                var widgetProps = scope.$parent.view.wdg[scope.data.model];
                 
                // Get the bounding box information for part '/0/9/1/2'
                var bbox = structure.getBounds(pathid);
                 
                // Transform the bounding box to account for the 'model' widget’s location
                var xform_bbox = bbox.transform(
                                  [widgetProps.x, widgetProps.y, widgetProps.z],
                                  [widgetProps.rx, widgetProps.ry, widgetProps.rz],
                                  widgetProps.scale);

                // work out the box center/size
                var bc = xform_bbox.center; // box center
                var bx = xform_bbox.max; // max

                // position the pointer to be a the top center of the box
                setPointer(new Vector4().Set3(bc.x, bx.y, bc.z), scope.data.isTangential ? scope.horizontal : scope.vertical, true);
              }) 
            }
           
          } else if (scope.data.disabled == false && scope.infoField != undefined) {
            //create (or reuse) a pool of N items to show ALL the position+normal data that would appear in this list
            // ...
            // and yes, this requires a pool of pointers to be managed
            //
            // this is WIP
            //
          } else if (scope.data.pointer != undefined) {
              
            scope.renderer.setProperties(scope.data.pointer, { hidden:true } );
            
            //clear
            scope.resultsField = []; 
            scope.$parent.fireEvent('complete');
            scope.$parent.$applyAsync();
          }

        });
            
        ///////////////////////////////////////////////////////////////////////////
        // watch for changes
        //
        scope.$watch('srcField', function () {
          scope.data.src = scope.srcField;
          if (scope.data.src != undefined && scope.data.pointer != undefined) {
            scope.renderer.setTexture(scope.data.pointer,scope.data.src);
          }
        });
            
        scope.$watch('disabledField', function () {
          scope.data.disabled = (scope.disabledField != undefined && scope.disabledField === 'true') ? true :false ;
          if (scope.data.pointer != undefined) {
            scope.renderer.setProperties(scope.data.pointer,{hidden:scope.data.disabled});
          }
        });
        scope.$watch('sizeField', function () {
          scope.data.size = (scope.sizeField != undefined) ? parseFloat(scope.sizeField) : 0.2 ;
        });
        scope.$watch('tangentField', function () {
          scope.data.isTangential = (scope.tangentField != undefined && scope.tangentField === 'true') ? true :false ;
        });
        scope.$watch('modelField', function () {
          scope.data.model = scope.modelField;                 
        });
            
        /* *****************************************************
        // WIP - watch for a LIST of points - position and normal - and render these
        //
        
        // a new list
        scope.$watch('infoField', function () {
          scope.data.info = scope.infoField;                 
        });
            
        // changes to existing list    
        scope.$watch(
          function() { return JSON.stringify(scope.infoField)},
          function(value) {
            if (value != undefined) 
              scope.data.info = scope.infoField;                 
        });
        
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { return scope.infoField != undefined ? JSON.stringify(scope.infoField.selectedRows) : ''},
          function(value) {
            if (value != undefined && scope.infoField != undefined) {
              scope.data.info = scope.infoField.selectedRows;                 
            }
        });
        */

      }
    };
  }

}());
