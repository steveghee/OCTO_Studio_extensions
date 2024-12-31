if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'infodisplay-ng';
}

(function () {
  'use strict';

  var infodisplayModule = angular.module('infodisplay-ng', []);
  infodisplayModule.directive('ngInfodisplay', ['$timeout', '$window', '$rootScope', '$injector', ngInfoDisplay]);
  
   function toBool(v) { return v === 'true' || v === true; }

  function ngInfoDisplay($timeout, $window, $rootScope, $injector) {

    return {
      restrict: 'EA',
      scope: {
        disabledField : '@',
        srcField      : '@',
        nearfadeField : '@',
        farfadeField  : '@',
        infodataField : '=',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {
          
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        scope.timeout  = $timeout;
        
        scope.data = {
            imgsrc  : undefined,
            nearfade: 0.5,
            farfade : 1.2,
            panels  : [],
            panelCount: 0,
            nodes   : [],
            newdata : [],
            disabled: false
        };
        
        scope.$root.$on('userpick', function(evt, src, type, evtdata) { 
                        
          //is this one of ours?  if so, mark this as the selected row              
          if (scope.data.panels != undefined) $timeout(function() {
            scope.data.panels.forEach(function(p) {
             if ((p.tmlid+'cone' == src) || (p.tmlid+'label' == src)) {
                //there should only e one item clicked/selected at any time                          
                scope.infodataField.selectedRows = scope.infodataField.rows.filter((row) => { return p.id == row.id;});
                scope.infodataField.current = { result : scope.infodataField.selectedRows }; 
                $timeout(function() { scope.$parent.fireEvent('click'); },100);
              }
            });
          },10);
        });
            
        function show() {
          scope.data.disabled = false;  
          if (scope.data.panels != undefined) $timeout(function() {
            scope.data.panels.forEach(function(p) {
              scope.renderer.setProperties(p.tmlid+'cone', {hidden:false});                                             
              scope.renderer.setProperties(p.tmlid+'label', {hidden:false});                                             
            });
          },10);
        }
        function hide() {
          scope.data.disabled = true;  
          if (scope.data.panels != undefined) $timeout(function() {
            scope.data.panels.forEach(function(p) {
              scope.renderer.setProperties(p.tmlid+'cone', {hidden:true});                                             
              scope.renderer.setProperties(p.tmlid+'label', {hidden:true});                                             
            });
          },10);
        }
        
        //
        // look for changes in input data
        //
        scope.$watch(
          function() { return JSON.stringify(scope.infodataField)},
          function(value) {  
            scope.data.newdata = scope.infodataField ;
            if (scope.data.newdata != undefined) 
              $timeout(scope.setInfoDisplay,10);
          }
        )
        
        scope.setInfoDisplay = function() {
            
          // remove (hide) and recover any 3dimage nodes used in the previous session
          // note we could eb smart here and look for items that may have been added/removed as opposed
          // to a full change, but for now, we'll just redo the entire list
          
          // undo data.placed - hide all the nodes
          if (scope.data.panels != undefined) {
            while(scope.data.panels.length > 0) {
              var oid = scope.data.panels.pop();
              scope.renderer.setProperties(oid.tmlid+'cone', {hidden:true});
              scope.renderer.setProperties(oid.tmlid+'label', {hidden:true});
              scope.data.nodes.push(oid.tmlid);                        
            }
          }
      
          // now recreate from data.newdata
          if (scope.data.newdata.rows != undefined) scope.data.newdata.rows.forEach(function(nid) {
                                     
            var tmlid = scope.data.nodes.pop();  
            scope.data.panels.push(new infoDisplay(scope,tmlid)
                       .setId(nid.id)            
                       .SetWidth(0.05)
                       .SetPosition(nid.position)
                       .SetOrientation(nid.normal || [0,1,0])
                       .SetText(nid.label)
                       .Render()
                     );
          });
          
        }
        
        scope.$watch('srcField', function () {
          if (scope.srcField != undefined) scope.data.imgsrc = scope.srcField;  
        });

        scope.$watch('disabledField', function () {
          scope.data.disabled = toBool(scope.disabledField);
          if (scope.data.disabled) hide(); 
          else show();
        });
            
        scope.$watchGroup(['nearfadeField','farfadeField'], function () {
          scope.data.nearfade = parseFloat(scope.nearfadeField);
          scope.data.farfade  = parseFloat(scope.farfadeField);
        });
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.show   = function() { show() };
            delegate.hide   = function() { hide() };
          }
        });

      }
    };
  }
  
  function renderTextOnImage(title,src) {
    return new  Promise( (ready,failed) => {  
        
      // generate the text ... note this uses fixed font size, colours etc.
      // it's just a simple label.  perhaps one day these coud all be CSS/parameters or something clever.
      var image = new Image();
      image.onload = function() {
        var c = document.createElement('canvas');
        c.width  = image.width;
        c.height = image.height;
 
        var t = c.getContext('2d');
        t.drawImage(image, 0, 0);
        
        t.font = '128px Arial';
        t.fillStyle = 'rgba(255,255,255,1)';
        t.strokeStyle = 'rgba(0,0,0,1)';
        t.lineWidth = 1;
        
        // position the text (roughly) central on the image
        var tw = t.measureText(title);
        var x  = (image.width - tw.width)/2;
        var y  = (image.height/2) + 64;        
        t.fillText(title,x,y);
        t.strokeText(title,x,y);
    
        ready(c.toDataURL());
      }
      image.src = src;
    })
  }
  
  function addNamedLabelOnNormal(name,img,pos,show,scope) {
      
    var lname = name+'label';
    
    var params = {
      tracker : 'tracker1',
      id      : lname,
      src     : img,
      parent  : undefined,
      leaderX : undefined, // Unused leaderX
      leaderY : undefined, // Unused leaderY
      anchor  : undefined, // Unused anchor
      width   : 0.05,
      height  : undefined, // slightly smaller than the cube
      pivot   : 8,    // center
      preload : false
    };

    // ..  and then add the label (an image)
    scope.renderer.add3DImage(params, () => {
  
      // we added the image, so set the location
      
      //there's a bug in Preview where we MUST set the scale even though if SHOULD default to 1,1,1
      //this does not manifest itself if you run on actual devices i.e. tml runtime is OK< but preview is not
      if (twx.app.isPreview()) scope.renderer.setScale(lname,1,1,1);
    
      //position it along the normal
      scope.renderer.setTranslation(lname,pos.X(), pos.Y(), pos.Z());
      scope.renderer.setProperties (lname,{hidden:!show, forceHidden:false,billboard:true }); 
      scope.$parent.$applyAsync();
    },
    (err) => {
  
      // something webt wrong
      console.log(`add3Dimage failed to add new image: ${JSON.stringify(err)}`); 
    });
  }
    
  function addNamedCone(name,pos,rot,show,scope) {
 
    var cname = name+'cone';
    scope.renderer.addPVS( 'tracker1', cname, 'extensions/images/arrow3dsmall.pvz', undefined, undefined, () => {
                          
      if (twx.app.isPreview()) scope.renderer.setScale(cname,1,1,1);
    
      scope.renderer.setTranslation(cname,pos.X(), pos.Y(), pos.Z());
      scope.renderer.setRotation   (cname,rot.X(), rot.Y(), rot.Z());
      scope.renderer.setProperties (cname,{hidden:!show, forceHidden:false }); 
      scope.$parent.$applyAsync();
    },
    (err) => {
      console.log(`addPVS failed to add new model: ${JSON.stringify(err)}`);
    });
  }

  function infoDisplay(scope,id) {
      
    this.tmlid = id;
    this.scope = scope;
    
    //////////////////////////////////////////////////////////////////////////////
    //
    this.setId = function(id) {
      this.id = id;
      return this;
    }
    //////////////////////////////////////////////////////////////////////////////
    //
    this.SetWidth = function(w) {
      this.width = w;
      return this;
    }
  
    //////////////////////////////////////////////////////////////////////////////
    //
    this.SetText = function(value,color) {
      this.text  = value;
      this.color = color;
      return this;
    }
    //////////////////////////////////////////////////////////////////////////////
    //
    this.SetPosition = function(p) {
      this.position = p;
      return this;
    }
    //////////////////////////////////////////////////////////////////////////////
    //
    this.SetOrientation = function(o) {
      this.orientation = o;
      return this;
    }  
  
    this.Render = function() {
        
      var P = new Vector4().Set3a(this.position);
      var N = new Vector4().Set3a(this.orientation);
      
      //v2.1 - using quaternions
      var y = new Vector4().Set3(0,1,0);
      var q = new Quat().From2V(y,N);
      var oot= new Matrix4().RotateFromQuaternion(q).TranslateV4(P).ToPosEuler(true);
      
      var show = !scope.data.disabled;
      if (this.tmlid == undefined) {
        
        //async create the items we need
        this.tmlid = '_infopanel'+scope.data.panelCount;
        scope.data.panelCount+=1;
      
        addNamedCone(this.tmlid,oot.pos,oot.rot,show,this.scope);
        
        var dp = oot.pos.Add(N.Scale(0.04));  
        var me = this;
        renderTextOnImage(this.text,this.scope.data.imgsrc)
        .then(function(img) {
          addNamedLabelOnNormal(me.tmlid,img,dp,show && me.text!=undefined,me.scope);
        });
        
      } else {
          
        //render the items 
        this.scope.renderer.setTranslation(this.tmlid+'cone', oot.pos.X(), oot.pos.Y(), oot.pos.Z());
        this.scope.renderer.setRotation(this.tmlid+'cone', oot.rot.X(), oot.rot.Y(), oot.rot.Z());
        
        var dp = oot.pos.Add(N.Scale(0.04));  
        this.scope.renderer.setTranslation(this.tmlid+'label', dp.X(), dp.Y(), dp.Z());    
        scope.renderer.setProperties (this.tmlid+'cone',{hidden:!show, forceHidden:false }); 
        
        //and update the label
        var me = this;
        if (this.text!= undefined) renderTextOnImage(this.text,this.scope.data.imgsrc)
        .then(function(img) {
          me.scope.renderer.setTexture(me.tmlid+'label',img);
        });
        //only show it if there's text to show    
        scope.renderer.setProperties (this.tmlid+'label',{hidden:!show || this.text == undefined, forceHidden:false, billboard:true }); 
      }
    
      return this;
    }
  
  }
  
}());
