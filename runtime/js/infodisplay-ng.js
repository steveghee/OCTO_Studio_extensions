if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'infodisplay-ng';
}

(function () {
  'use strict';

  var infodisplayModule = angular.module('infodisplay-ng', []);
  infodisplayModule.directive('ngInfodisplay', ['$timeout', '$window', '$rootScope', '$injector', ngInfoDisplay]);
  
  function Radians(angle) { return angle * Math.PI/180; }

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
            newdata : []
        };
        console.log('infodisplay');
        
        function show() {
          console.log('show');
          if (scope.data.placed != undefined) $timeout(function() {
            scope.data.placed.forEach(function(p) {
              scope.renderer.setProperties(p.tmlid, {hidden:false});                                             
            });
          },10);
        }
        function hide() {
          console.log('hide');
          if (scope.data.placed != undefined) $timeout(function() {
            scope.data.placed.forEach(function(p) {
              scope.renderer.setProperties(p.tmlid, {hidden:true});                                             
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
          if (scope.data.placed != undefined) {
            console.log(scope.data.placed.length);
            while(scope.data.placed.length > 0) {
              var oid = scope.data.placed.pop();
              scope.renderer.setProperties(oid.tmlid, {hidden:true});
              scope.data.nodes.push(oid.tmlid);                        
            }
            console.log(scope.data.placed.length, scope.data.nodes.length);
          }
      
          // now recreate from data.newdata
          scope.data.newdata.forEach(function(nid) {
                                     
            var tmlid = scope.data.nodes.pop();                   
            scope.data.panels.push(new multiFunctionalDisplay(scope,tmlid)
                                   
                       // the following are all optional - they modify/enhance the base display 
                       .SetWidth(0.15*nid.status)
                       .SetPosition(nid.position.x, nid.position.y, nid.position.z)
                       .SetOrientation(nid.angle!=undefined ? 0 : nid.orientation.x,
                                       nid.angle!=undefined ? nid.angle : nid.orientation.y,
                                       nid.angle!=undefined ? 0 : nid.orientation.z)
                       .SetIndicator(nid.status)
                       .SetTitle(nid.title)
                       .SetValue(nid.value,nid.units,nid.color)
                       .SetBadge(nid.badge)
                       .SetText(nid.text)
                       .SetPivot(nid.pivot)
                     );

//            scope.renderer.setProperties(tmlid, {hidden:true});

          });
          
        }
        
        scope.$watch('srcField', function () {
          console.log('srcField',scope.srcField);             
          if (scope.srcField != undefined) scope.data.imgsrc = scope.srcField;  
          
        });

        scope.$watch('disabledField', function () {
          console.log('disabledField',scope.disabledField);             
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
  
  function multiFunctionalDisplay(scope,id) {
      
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetWidth = function(w) {
    this.width = w;
    return this;
  }
  
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetIndicator = function(indicate, forceShow) {
    // near and far fade values (distance from item, in meters).
    var fs = forceShow || false;
    var nnf = fs ? 1.5 : this.scope.data.nearfade;
    var nff = fs ? 0   : this.scope.data.farfade;
    
    // encode the indicator (1,2,3) as a color (red/amber/green)
    var color = `r f ${(indicate<=2?1:0)};g f ${(indicate>=2?1:0)};b f 0`;
    
    // build the shader call
    this.indicator = `multifunctionalDisplayDisplaygl;${color};nf f ${nnf};ff f ${nff}`;
    return this;
  }
  
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetBadge = function(badge) {
    this.badge = badge;
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetPivot = function(p) {
    this.pivot = p;
    return this;
  }
  
  //////////////////////////////////////////////////////////////////////////////
  //
  
  /* example displayInfo you can set as a table or using individual calls (see below)
   [
    {class:"alert", value:'Predicted',fillcolor:'rgba(6,254,6,1)'} :
    {class:"title", value:'I am label ' + i}, 
    {class:"property", name:'status', value:status} ,
    {class:"text", value:'hello world'} ,
    {class:"value",value:angle, units:"º", fillcolor:'rgba(6,254,6,1)'}
  ]
  */
  this.SetDisplayInfo = function(data) {
    this.displayInfo = data;
  }
  this.ResetDisplayInfo = function() {
    this.displayInfo = [];
  }
  
  
  //////////////////////////////////////////////////////////////////////////////
  //
  this._findByClass = function(c, n) {
    if (this.displayInfo != undefined) for (var i=0;i<this.displayInfo.length;i++) {
      if (n == undefined && this.displayInfo[i].class == c) return i;
      if (n != undefined && this.displayInfo[i].name == n && this.displayInfo[i].class == c) return i;
    }
    return undefined;
  }
  
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetTitle = function(text) {
    var e = this._findByClass('title');
    if (e != undefined) this.displayInfo[e].value = text;
    else this.displayInfo.push({class:'title', value:text});
    return this;
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetAlert = function(text, color) {
    var e = this._findByClass('alert');
    if (e != undefined) {
      this.displayInfo[e].value = text;
      this.displayInfo[e].fillcolor = color;
    }
    else this.displayInfo.push({class:'alert', value:text, fillcolor:color});
    return this;
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this.ClearAlert = function() {
    var e = this._findByClass('alert');
    if (e != undefined) {
      this.displayInfo.splice(e,1);
    }
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetValue = function(value, units, color) {
    if (value != undefined) {  
      var vt = (typeof value === 'number') ? value.toString() : value;
      var ut = (units != undefined) ? units : "";
      var e = this._findByClass('value');
      if (e != undefined) {
        this.displayInfo[e].value = vt;
        this.displayInfo[e].units = ut;
        this.displayInfo[e].fillcolor = color;
      }
      else this.displayInfo.push({class:'value', value:vt, units:ut, fillcolor:color});
    }
    return this;
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetProperty = function(name, value, color) {
    var vt = (typeof value === 'number') ? value.toString() : value;
    var e = this._findByClass('property', name);
    if (e != undefined) {
      this.displayInfo[e].value = vt;
      this.displayInfo[e].fillcolor = color;
    }
    else this.displayInfo.push({class:'property', name:name, value:vt, fillcolor:color});
    return this;
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetText = function(value,color) {
    var vt = (typeof value === 'number') ? value.toString() : value;
    var e = this._findByClass('text');
    if (e != undefined) {
      this.displayInfo[e].value = vt;
      this.displayInfo[e].fillcolor = color;
    }
    else this.displayInfo.push({class:'text', value:vt, fillcolor:color});
    return this;
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetPosition = function(x,y,z) {
    this.position = [x,y,z];
    return this;
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this.SetOrientation = function(x,y,z) {
    this.orientation = [x,y,z];
    return this;
  }  
  
  //////////////////////////////////////////////////////////////////////////////
  //
  // private funcs

  //////////////////////////////////////////////////////////////////////////////
  //
  this._displayType = function() {
    var ext = this.scope.data.imgsrc.lastIndexOf('.');
    var noext = this.scope.data.imgsrc.slice(0,ext);
    return `${this.scope.data.imgsrc} ${noext}Mask.png`;
  }
  
  //////////////////////////////////////////////////////////////////////////////
  //
  this._encodeImg = function(objctx, src, data, callback) {
    var retImg;

    var tdata = data;
    var txobj = objctx;

    //if we have nothing to do...
    if (src === undefined) {
  
      // ...do nothing
      callback(retImg);
      return;
    }
  
    // otherwise, render the image that we load (after this definition)
    var image = new Image();
    image.onload = function () {
  
      tdata.canvas        = document.createElement('canvas');
      tdata.canvas.width  = image.width;
      tdata.canvas.height = image.height;
    
      // Get drawing context for the Canvas
      var ctx = tdata.canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
    
      // Draw the actual text - we get xy location, font and color info in  structure
      // so iterate through the list of drawables and draw them
      data.textAttrs.forEach(function(ta) {
        ctx.font      = ta.font;
        ctx.fillStyle = ta.fillcolor;
      
        // draw the badge, if required
        if (ta.badge!=undefined) {
          ctx.beginPath();
          ctx.arc(ta.x, ta.y, ta.r, 0, 2 * Math.PI);
          ctx.fill();
        }
      
        // finally render the text to the specified location
        if (ta.text!=undefined) {
          ctx.fillText(ta.text, ta.x, ta.y);
        }
      });
    
      // pull the pixels from the canvas and return to sender.
      tdata.retImg = tdata.canvas.toDataURL();
      callback(txobj, tdata.retImg, image.width, image.height);
    
    };
  
    // load the image - this will trigger the lambda above
    image.src = src;
  }
 
  //////////////////////////////////////////////////////////////////////////////
  //
  this._renderText2Panel = function(scope, panel, data, encoder, cb) {
  
    var tblock = [];
    var yline  = 500;
    let rgbindicator = 'rgba('+(data.indicator<=2?255:0)+','+(data.indicator>=2?255:0)+',0,1)';
  
    // build up the text blocK
    // class: "text" HOW TO DISPLAY (options are text,title,alert,value,link)
    // name : "Note" WHAT NAME
    // value: "XBOX" WHAT VALUE
  
    if (data.display != undefined) data.display.forEach(function (line) {
      switch(line.class) {
        case 'title':
          // title sits at the top, larger font, indented to center 
          // todo : add alignment/justification settings e.g center, left etc.
          tblock.push( { text:`${line.value}`, x:500, y:365, font:'120px Arial', fillcolor:'rgba(254,150,6,1)'} );
          break;
        case 'alert':  
          // alert sits ABOVE the panel, near the indicator.  unless user specifies a color, it will use the indicator color
          tblock.push( { text:`${line.value}`, x:500, y:165, font:'120px Arial', fillcolor:line.fillcolor != undefined ? line.fillcolor : rgbindicator } );
          break;
        case 'property':  
          // multiple text lines are supported, each advances the cursor down to the next line.  Different font size, different color to the title
          tblock.push( { text:`${line.name}:${line.value}`, x:350, y:yline, font:'96px Arial', fillcolor:'rgba(255,168,36,1)'} );
          yline+=150; // move the drawing cursor down a line
          break;
        case 'text':  
          // multiple text lines are supported, each advances the cursor down to the next line.  Different font size, different color to the title
          tblock.push( { text:`${line.value}`, x:350, y:yline, font:'96px Arial', fillcolor:'rgba(255,168,36,1)'} );
          yline+=150; // move the drawing cursor down a line
          break;
        case 'value':
          // a value, if specified, sits in a fixed space to the bottom/right, and is drawn in a large font to make it easy to read from afar.
          tblock.push( { text:`${line.value}${line.units}`, x:line.x!=undefined?line.x :660, y:1000, font:'300px Arial', fillcolor:line.fillcolor != undefined ? line.fillcolor :'rgba(196,196,4,1)'} );
          break;
        default:
          break;
      }

    });
  
    // is there a badge required?
    if (data.badge > 0) {
    
      tblock.push( { badge:true,           x:1310, y:100, r:100,              fillcolor:'rgba(240,10,10,1)'} ); // badge is red
      tblock.push( { text:`${data.badge}`, x:1280, y:130, font:'120px Arial', fillcolor:'rgba(10,10,10,1)' } ); // badge text is dark grey 
  
    }

    // we have our data
    data.textAttrs = tblock;
  
    //keep these around for the async callbac
    var ccb    = cb;
  
    // async update the factory line indicator to show that we are now simulating production changes ith new line in place...
    //
    encoder(panel, scope.data.imgsrc, data, function(target, img, w, h) {
      scope.timeout((function(t, i) {
        var nm = t.trim();
        var ig = i;
        return function() {
          scope.renderer.setTexture(nm, ig);
        }
      })(target, img), 100);

      // short delay before calling the next item
      if (ccb != undefined) scope.timeout(ccb, 100);
  
    });
  
  }
  //////////////////////////////////////////////////////////////////////////////
  //
  this._shader = function() {
    // build the shader call
    return `multifuncDisplaygl;r f 0.3;g f 0.3;b f 0.3;nf f ${this.scope.data.nearfade};ff f ${this.scope.data.farfade}`;
  }
  
  //////////////////////////////////////////////////////////////////////////////
  //
  this.Render = function(callback) {
    
    var p = {
            name: this.tmlid, 
           width: this.width,
       indicator: this.indicator,
           badge: this.badge,
         display: this.displayInfo
    };
        
    if (this.widget != undefined) {
      this.widget.billboard = false;	// billboarding MUST be disabled
      this.widget.shader    = this.indicator;
      this.widget.src       = this.src;
    } else {
      // ensure billboarding is turned OFF
      this.scope.renderer.setProperties(this.tmlid, {shader: this.indicator, billboard: false, hidden:false});
      this.scope.renderer.setTexture   (this.tmlid, this.src);
    }
   
    // defer the call to set the data - we need to ensure the images have loaded first. Ideally there would be the imageloaded event 
    // that was asked for ... instead, we wait on a timeout. ugly.
    
    scope.timeout((function(scope, id, data, renderer, encoder, callback) {
                   
      var s = scope;             
      var i = id;
      var d = data;
      var _render = renderer;
      var _encode = encoder;
      var _ccb = callback;
      return function() {
          console.log('render',i);
          _render(s, i, d, _encode, _ccb);
        }
    })(scope, this.tmlid, p ,this._renderText2Panel, this._encodeImg, callback), 500);
    
    return this;
  }
   
  //////////////////////////////////////////////////////////////////////////////
  //

  this.scope  = scope;
  this.badge  = 0;
  this.tmlid  = id;
  this.src    = this._displayType();
  this.widget = undefined;
  
  this.displayInfo = [];
  this.SetIndicator(2);         // setup default representation
  this.position    = [0,0,0];
  this.orientation = [0,0,0];

      this.scope.popPlacing = (function(scope) {
        var localscope = scope;
        return function() {

        // assuming we still have something to do....
        if (localscope.data.placing.length > 0) {
  
          // pop the next item of the stack
          var p = localscope.data.placing.pop();
    
          localscope.data.placed.push(p);
    
          // add to the scene; pass a reference to myself (pop) to be called once this item has completed processing
          localscope.addNodeToScene(p.tmlid, p, localscope.popPlacing);
        } else {
  
          console.log('done',localscope.data.placed);
  
        }
      }})(this.scope);
      
      this.scope.addNodeToScene = (function(scope) {
        var localscope = scope;
        return function(newid, data, cb) {
    
        var params = {
          "tracker" : 'tracker1',
          "id"      : newid,
          "src"     : data.src,
          "parent"  : undefined,
          "leaderX" : undefined, // deprecated leaderX
          "leaderY" : undefined, // deprecated leaderY
          "anchor"  : undefined, // deprecated anchor
          "width"   : data.width || 0.25,
          "height"  : undefined, // Calculated height from textToImage includes border,padding,etc.
          "pivot"   : 8,
          "preload" : false
        };

        localscope.renderer.add3DImage(params, function() {
    
          var ccb = cb;
console.log('added',newid);    
          // position the item
          localscope.renderer.setScale      (newid, 1,1,1);
          localscope.renderer.setTranslation(newid, data.position[0], data.position[1], data.position[2]);
          localscope.renderer.setRotation   (newid, data.orientation[0], data.orientation[1], data.orientation[2]);
    
          data.Render(ccb);

        }, function() {
    
          console.log('failed');
  
        });
        }
        })(this.scope);

    
  // if no ID is specified, we dont have a widget to attach to, so let's create a label dynamically
  if (this.tmlid == undefined) {
  
    if (this.scope.data.placing == undefined) {
    
      this.scope.data.placing = [];
      this.scope.data.placed  = [];
            
      // and do we have  daemon to preloadocess these
      scope.timeout(this.scope.popPlacing,1000);
    }
    
    if (this.scope._privateCounter == undefined) this.scope._privateCounter = 0;
    this.tmlid = '__mfd__' + this.scope._privateCounter;  this.scope._privateCounter += 1;
    
    this.scope.data.placing.push(this);
  } else {
    //it's already created, so just fill it in
    var localscope = scope;
    var data = this;
    
    scope.timeout(function() {
      localscope.renderer.setScale      (data.tmlid, 1,1,1);
      localscope.renderer.setTranslation(data.tmlid, data.position[0], data.position[1], data.position[2]);
      localscope.renderer.setRotation   (data.tmlid, data.orientation[0], data.orientation[1], data.orientation[2]);
      localscope.renderer.setTexture    (data.tmlid, data.src);

      localscope.data.placed.push(data);    
      data.Render(scope.popPlacing);
    },200);
      
  }
}
  
}());
