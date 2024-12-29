if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'surfaceindicator-ng';
}

(function () {
  'use strict';

  var surfModule = angular.module('surfaceindicator-ng', []);
  surfModule.directive('ngSurfaceindicator', ['$timeout', '$http', '$window', '$injector', ngSurfaceIndicator]);
  
  let indicatorShader = twx.app.isPreview() ? undefined : 'panelHilite2gl;ff f 2;nf f 1';//"indicatorProximitygl;cutoutDepth f 1.5"
  
  function toBool(v) { return v === 'true' || v === true; }

  function renderTextToImage(title) {
      
    // generate the text ... note this uses fixed font size, colours etc.
    // it's just a simple label.  perhaps one day these coud all be CSS/parameters or something clever.
    
    var c = document.createElement('canvas');
    c.width = 500;
    c.height= 100; // small image
    
    var t = c.getContext('2d');
    t.font = '76px Arial';
    t.fillStyle = 'rgba(255,255,255,1)';
    t.strokeStyle = 'rgba(0,0,0,1)';
    t.lineWidth = 1;
    t.fillText(title,0,80);
    t.strokeText(title,0,80);
    
    return c.toDataURL();
  }
  
  function addNamedLabelOnNormal(name,title,pos,show,scope) {
    var params = {
      tracker : 'tracker1',
      id      : name,
      src     : renderTextToImage(title),
      parent  : undefined,
      leaderX : undefined, // Unused leaderX
      leaderY : undefined, // Unused leaderY
      anchor  : undefined, // Unused anchor
      width   : 0.05,
      height  : undefined, // slightly smaller than the cube
      pivot   : 8,    // center
      preload : false
    };

    scope.data.label = name;
    
    // ..  and then add the label (an image)
    scope.renderer.add3DImage(params, () => {
  
      // we added the image, so set the location
      
      //there's a bug in Preview where we MUST set the scale even though if SHOULD default to 1,1,1
      //this does not manifest itself if you run on actual devices i.e. tml runtime is OK< but preview is not
      if (twx.app.isPreview()) scope.renderer.setScale(name,1,1,1);
    
      //position it along the normal
      scope.renderer.setTranslation(name,pos.X(), pos.Y(), pos.Z());
      scope.renderer.setProperties (name,{hidden:!show, forceHidden:false,billboard:true }); 
      scope.$parent.$applyAsync();
    },
    (err) => {
  
      // something webt wrong
      console.log(`add3Dimage failed to add new image: ${JSON.stringify(err)}`); 
    });
  }
    
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

    scope.data.pointer = name;
    scope.renderer.add3DImage(params, () => {
  
      // we added the image, so set the location
      scope.data.pointer = name;
      
      //there's a bug in Preview where we MUST set the scale even though if SHOULD default to 1,1,1
      //this does not manifest itself if you run on actual devices i.e. tml runtime is OK< but preview is not
      if (twx.app.isPreview()) scope.renderer.setScale(name,1,1,1);
    
      scope.renderer.setTranslation(name,pos.X(), pos.Y(), pos.Z());
      scope.renderer.setRotation   (name,rot.X(), rot.Y(), rot.Z());
      scope.renderer.setProperties (name,{hidden:!show, forceHidden:false, shader: indicatorShader }); 
      scope.$parent.$applyAsync();
    },
    (err) => {
      // something went wrong
      console.log(`add3DImage failed to add new image: ${JSON.stringify(err)}`); 
      scope.data.pointer = undefined;
    });
  }
  
  function addNamedCone(name,pos,rot,show,scope) {
 
    scope.data.pointer = name;
    scope.renderer.addPVS( 'tracker1', name, 'extensions/images/arrow3dsmall.pvz', undefined, undefined, () => {
                          
      if (twx.app.isPreview()) scope.renderer.setScale(name,1,1,1);
    
      scope.renderer.setTranslation(name,pos.X(), pos.Y(), pos.Z());
      scope.renderer.setRotation   (name,rot.X(), rot.Y(), rot.Z());
      scope.renderer.setProperties (name,{hidden:!show, forceHidden:false, shader: indicatorShader }); 
      scope.$parent.$applyAsync();
    },
    (err) => {
      console.log(`addPVS failed to add new model: ${JSON.stringify(err)}`);
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
           is3dField : '@',
          labelField : '@',
           showField : '@',
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
                         is3d: false,
                        label: undefined,
                        title: undefined,
                    showLabel: false,
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
            
          //draw the pointer  
          if (scope.data.pointer == undefined) {
            if (scope.data.is3d) addNamedCone("octoSurfaceIndicatorPointer",pos.Add(scope.data.N.Scale(0.002)),rot,show,scope);
            else addNamedImage("octoSurfaceIndicatorPointer",pos.Add(scope.data.N.Scale(0.002)),rot,show,scope);
          } else {
            var name = scope.data.pointer;
            
            //move the position of the mrker up the normal very slightly - removes soe visual artifacts  
            var dp = pos.Add(scope.data.N.Scale(0.002));  
            
            scope.renderer.setTranslation(name,dp.X(), dp.Y(), dp.Z());
            scope.renderer.setRotation   (name,rot.X(), rot.Y(), rot.Z());
            scope.renderer.setProperties (name,{hidden:!show, forceHidden:false, shader: indicatorShader});
          }
        
          //draw the label?
          if (scope.data.label == undefined) {
            addNamedLabelOnNormal('octoSurfaceIndicatorlabel',scope.data.title,pos.Add(scope.data.N.Scale(0.04)),show && scope.data.showLabel,scope);
          } else {
            if (scope.data.title.length > 0) scope.renderer.setTexture(scope.data.label, renderTextToImage(scope.data.title));
            
            var dp = pos.Add(scope.data.N.Scale(0.04));  
            scope.renderer.setTranslation(scope.data.label,dp.X(), dp.Y(), dp.Z());
            scope.renderer.setProperties(scope.data.label,{hidden:!(scope.data.showLabel && show), billboard:true} );
          }
          
          // and report the location + normal and gaze (inverted normal)
          scope.resultsField = [ { model: scope.data.model, 
                                    path: scope.data.pathid, 
                                position: pos.ToObject(), 
                                  normal: scope.data.N.ToObject(), 
                                    gaze: scope.data.N.Negate().ToObject(), 
                                      up: scope.data.up.ToObject(), 
                                   scale: scope.data.size,
                                  label : scope.data.title} ];
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
      
              var ps  = new Vector4().Set3a(position)
              var N   = new Vector4().Set3a(normal);
              scope.data.N = N;
              
              // up should be calaulated based on the current gaze vector - this will ensure we can see the marker
              var gz = scope.data.gaze;
              
              //are these nearly parallel?
              var dp = Math.abs(N.DotP(gz));
              if (dp > 0.9) gz = scope.data.up; // choose different vector
              
              var xd = N.Normalize().CrossP(gz);
              var up = gz.CrossP(xd).Normalize();
      
              var mat = new Matrix4().makePose(ps,N,up);
              var flip = new Matrix4().Rotate([1,0,0],90,true);
              var oot = scope.data.isTangential && !scope.data.is3d ? mat.ToPosEuler(true) 
                                                                    : flip.Multiply(mat.m).ToPosEuler(true);
              
              setPointer(oot.pos, oot.rot, true);
            }
           
          } else if (scope.data.disabled == false && scope.infoField != undefined) {
            //create (or reuse) a pool of N items to show ALL the position+normal data that would appear in this list
            // ...
            // and yes, this requires a pool of pointers to be managed
            //
            // this is WIP
            //
          } else if (scope.data.pointer != undefined) {
              
            scope.renderer.setProperties(scope.data.pointer, { hidden:true, shader: indicatorShader } );
            
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
            scope.renderer.setProperties(scope.data.pointer,{hidden:scope.data.disabled,shader: indicatorShader});
          }
        });
            
        scope.$watch('sizeField', function () {
          scope.data.size = (scope.sizeField != undefined) ? parseFloat(scope.sizeField) : 0.2 ;
        });
        scope.$watch('tangentField', function () {
          scope.data.isTangential = toBool(scope.tangentField);
        });
        scope.$watch('labelField', function () {
          scope.data.title = scope.labelField;
          scope.data.showLabel = scope.data.title.length > 0 && toBool(scope.showField);           
        });
        scope.$watch('is3dField', function () {
          scope.data.is3d = toBool(scope.is3dField);
        });
        scope.$watch('modelField', function () {
          scope.data.model = scope.modelField;                 
        });
            
        /* *****************************************************
        // WIP - watch for a LIST of points - position and normal - and render these
        //
        */
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
            
            if (scope.data.info != undefined && scope.data.info.position !=undefined) {
              var ps  = new Vector4().Set3a(scope.data.info.position);
              var N   = new Vector4().Set3a(scope.data.info.normal);
              scope.data.N = N;
              
              scope.data.title = scope.data.info.label != undefined ? scope.data.info.label : '' ;
              scope.data.showLabel = scope.data.title.length > 0 && toBool(scope.showField);           
              
              // up should be calaulated based on the current gaze vector - this will ensure we can see the marker
              var gz = scope.data.gaze;
              
              //are these nearly parallel?
              var dp = Math.abs(N.DotP(gz));
              if (dp > 0.9) gz = scope.data.up; // choose different vector
             
              var xd = N.Normalize().CrossP(gz);
              var up = gz.CrossP(xd).Normalize();
      
              var mat = new Matrix4().makePose(ps,N,up);
              var flip = new Matrix4().Rotate([1,0,0],90,true);
              var oot = scope.data.isTangential ? mat.ToPosEuler(true) 
                                                : flip.Multiply(mat.m).ToPosEuler(true);
              
              setPointer(oot.pos, oot.rot, true);
            }
        });

        /*
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
