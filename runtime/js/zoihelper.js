//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//steve's positional helper library
//

function zoiHelper(renderer, targets) {

  this.targets = undefined;
    
  // constructor
  this.maxzois      = 20;
  this.mapped       = [];for (var i=0;i<this.maxzois;i++) this.mapped.push({position:new Vector4().Set3(i,0,0), hidden:false});
  this.nzois        = targets != undefined && targets.zois != undefined ? targets.zois.length : 0;
  this.color        = targets != undefined && targets.color!= undefined ? targets.color : undefined;
  this.zoiGeom      = targets != undefined && targets.geom != undefined ? targets.geom  : "extensions/images/zoiCylinder.pvz";
  this.zoiImage     = targets != undefined && targets.image!= undefined ? targets.image : "extensions/images/loading.png";
  this.showing      = false;
  this.showZOIs     = false;
  
  this.headloc      = undefined;
  this.selected     = undefined;
  this.floor        = targets != undefined && targets.floorOffset != undefined ? targets.floorOffset : 0;
  
  this.cutoff       = 0.5;
  this.autoCutoff   = false;
  this.inside       = undefined;
  this.entered      = undefined;
  this.exited       = undefined;
  this.cutout       = 666;
  
  this.dirty        = false;
  
  // we are initialised asynchronously, so we need the caller to pass in
  // certain 'capabilities; e.g. the renderer
  this.renderer     = renderer;
  
  ///////////////////////////////////////////////////////////////////////////////////////
  // public API
  //
  this.Set = function(zois) {
      
    if (zois != undefined) {
        
      //release any old targets    
      this.selected = undefined;
      this.targets  = undefined;
      
      // and set new ones
      this._addZOIs(zois);
    }
  
    return this;
  }

  // 
  // set helper to specific location. if undefined, helper is hidden
  //
  this.addAt = function(locator) {
  
    if (locator != undefined) {
          
      this.inside   = undefined;
      this.selected = this._addZOI( { position:locator.position.v }, locator.name );
    
    }
    return this;
  }
  
  //
  // auto-set helper to current tracked head location/direction
  //
  this.addAtCurrent = function(name) {
      
    // switch the endpoint to be the current headlocation
    this.selected = this._addZOI( this.headloc, name );
    this.inside   = true;
    return this;

  }
  
  //
  // get the current location of the helper - useful if you want to 
  // persist this for future use
  //
  this.get = function() { return this.selected; }
  
  //
  // hide the helper
  // note that this also pauses drawing the helper, thus optimising performance
  //
  this.hide = function() {
      
    this._toggleZOIs(false);
    return this;

  }
  
  //
  // show the helper - note the auto-cuttoff state may immediately hide it 
  // again!
  //
  this.show = function() {
      
    this._toggleZOIs(true);
    return this;

  }
  
  //
  // draw the helper - the ribbon/tunnel and any associated visuals
  //
  this.draw = function(arg) {
      
    this.headloc = arg;
      
    //do we have anything to draw?  
    if (this.targets != undefined) {

      //
      // draw the ZOIs - ths may be as simple as turning them on/off
      //
      var d = this._drawZOIs( { from: this.headloc.position } );
    
      this.showing = this.showZOIs;
          
      // are we outside, moving in? (or outside, unknown)   
      if (d.cutoff > d.dist && 
          this.inside  != true) {
        
        // inform the user?
        if (this.entered != undefined) {  // are we entering the zone? 
          this.entered(this,d);
        }
        
        this.inside   = true;
        this.selected = this.targets[d.index];
      } 
    
      // or are we inside, moving out?
      else if (d.cutoff < d.dist && 
                 this.inside != false) {   // are we exiting the cutoff zone? 
      
        if (this.exited != undefined) {          
          this.exited(this,d);
        }
        
        this.inside   = false;
        this.selected = undefined;
      }

    }
    
  }
  
  //
  // set the color of the ribbon
  //
  this.Color  = function(color)  { this.color  = color;  return this; }
  
  //
  // set the cutout distance (beyond which nothing will show)
  //
  this.Cutout = function(cutout) { this.cutout = cutout; return this; }
  
  //
  // set the height offset 
  //
  this.Offset = function(offset) { this.floor = offset; this.dirty = true; return this; }
  
  //
  // cutoff values can be specified PER poi, so this is a fallback case
  // set the cutoff distance.  if auto is true, helper will hide itself
  // when the user gets within the specified distance. the third parameter
  // is a callback funciton which can be used to perform some action based 
  // on the user entering the cutoff radius
  //
  this.Cutoff = function(cutoff,auto,enter,exit) {
      
    if (auto != undefined) {
      this.autoCutoff = auto;
      this.cutoff     = cutoff  
    } else {
      this.autoCutoff = false;
      this.cutoff     = (cutoff != undefined) ? cutoff : 0.5;
    }
    
    this.entered = enter;
    this.exited  = exit;
    return this;

  }
  
  this.Auto = function(auto) {
    this.autoCutoff = auto;
    return this;
  }
  
  //
  ///////////////////////////////////////////////////////////////////////////////////////
  // private API
  this._toggleZOIs = function(v) {
      
    if (v != undefined) this.showZOIs = v;
    else                this.showZOIs = !this.showZOIs;
    
    if (this.showZOIs === true) this.showing = true;
    
    this.dirty   = true;
    this.showing = true; //force redraw
    return this.showZOIs;
    
  }
  
  this._positionZOI = function(headloc) {
      
    var fp        = new Vector4().Set3a(headloc.position);
    var targetloc = { position:fp, name:headloc.name, visible:false, color:headloc.color, cutoff:headloc.cutoff };
    return targetloc;

  }
  
  this._addZOI = function(loc, name) {
      
    let zoi  = this._positionZOI( { position: loc.position, 
                                        name: name 
                                } );   
    
    if (this.targets === undefined) this.targets = [zoi];
    else                            this.targets.push(zoi);
    
    this.dirty = true;
    return zoi;

  }
  
  this._addZOIs = function(locs) {
    let me =this;
    locs.forEach(function(loc) {
      var vloc = loc.position.split(',');if (vloc.length<3) vloc=loc.position.split(' ');
      let zoi  = me._positionZOI( { position: vloc, 
                                        name: loc.name, 
                                       color: loc.color, 
                                      cutoff: loc.cutoff 
                                } );
          
      if (me.targets === undefined) me.targets = [zoi];
      else                          me.targets.push(zoi);
    });
        
    this.dirty = true;
    return me;

  }

  this._drawZOIs = function(arg) {
    
    var p3    = new Vector4().Set3a(arg.from); // end point
    var hp    = new Vector4().Set(p3);hp.v[1] = -this.floor;
    var mind  = undefined;
    var minds = [];
    
    for (var t=0; t<this.targets.length; t++) {
      let tzoi = this.targets[t];  
      var p0   = tzoi.position;       // staring point
      var pgd  = p3.Distance(p0,[1,0,1]);
      minds.push( { index: t,
                     dist: pgd,
                   //allow each item to potentially have its own cutoff radius
                   cutoff: tzoi.cutoff != undefined ? tzoi.cutoff : this.cutoff
                  } );
    }
  
    // sort to get minimum distance first
    if (minds.length>1) 
      minds.sort(function(a, b){return a.dist - b.dist});
    
    // do we need to change drawing 
    if (this.showing && this.dirty) {
        
      this.dirty = false;
        
      // take the nearest N items and show them if within range
      //if (minds.length>1) minds.sort(function(a, b){return a.dist - b.dist});
      // ideally here we'd look to see if the inclusion list actually changes before we redo things
      for (t=0; t<this.maxzois; t++) {
          
        tzoi = minds.length > t ? this.targets[minds[t].index] : undefined;
        
        if (tzoi != undefined) {  
            
          var tpgd = minds[t].dist;
          //console.log(t,tpgd,tzoi.position);  
    
          if (tpgd > 0 && tpgd < this.cutout ) {
              
            tzoi.visible = this.showZOIs;
            
            var tzoiid    = 'zoii'+t+'img';
            var tcol      = tzoi.color != undefined ? tzoi.color : this.color;
            var scol      = tcol != undefined ? 'r f '+tcol[0]+';g f '+tcol[1]+';b f '+tcol[2] : 'r f 0;g f 1;b f 0';
            var pingshade = 'zoipinger;rings f 15;direction f 1;rate f 4;' + scol; 
                                              
            //put the image 2m above the floor                                  
            this.renderer.setTranslation(tzoiid,tzoi.position.X(), -this.floor + 2, tzoi.position.Z());
            this.renderer.setProperties (tzoiid,{shader:'pingergl;direction f 1;rate f 4;'+scol, hidden:!tzoi.visible});
            
            //and the model on the floor
            var gzoiid = 'zoii'+t+'obj';
            this.renderer.setTranslation(gzoiid,tzoi.position.X(), -this.floor, tzoi.position.Z());
            
            if (minds[t].cutoff != undefined) {
              //cutoff is defined as a radius, and then model is defined as 1m diameter, so we need to double it
              var sc = minds[t].cutoff * 2;
              this.renderer.setScale(gzoiid,sc,1,sc);
              console.log('scale ',sc);
            }
          
            this.renderer.setProperties (gzoiid+'-/',{shader:pingshade,hidden:!tzoi.visible});
            
          } else if (tzoi.visible!=false){
            tzoi.visible = false;
            var tzoiid   = 'zoii'+t+'obj-/';
            this.renderer.setProperties(tzoiid,{hidden:true}); 
          }
        } else {
          var tzoiid = 'zoii'+t+'img';
          //this.renderer.setProperties(tzoiid,{hidden:true});
              tzoiid = 'zoii'+t+'obj-/';
          //this.renderer.setProperties(tzoiid,{hidden:true});
        }
      }
    }
  
    return minds.length > 0 ? minds[0] : undefined;
    
  }
  
  this.zois = (function(obj) {
               
    var shapes = [];
    
    for (var i=0; i< obj.maxzois; i++) {
     
      // declare using pvz
      var name = "zoii"+i;  
      shapes.push( {  name: name,
                     objid: name+"obj",
                     imgid: name+"img",
                  modelsrc: obj.zoiGeom,
                  imagesrc: obj.zoiImage,
                  position: obj.mapped[i].position,
                    hidden: obj.mapped[i].hidden
                 } ); 
    }
    this.mapped = shapes;
    return this.mapped;
  })(this);
      
  this.Set(targets.zois);

}


//
// declare the tunnel dynamically (see tml widget for the ng-repeat that uses this data)
//

/*
<div ng-repeat="obj in zoihelper.zois">
  <twx-dt-model id="{{obj.name+'obj'}}" 
                           x="{{obj.position.v[0]}}" y="{{obj.position.v[1]}}" z="{{obj.position.v[2]}}" opacity="0.5"
                           rx="0" ry="0" rz="0"
                           src="{{obj.modelsrc}}" 
                           hidden="true"
                           shader="zoipinger"
                           >
  </twx-dt-model>
</div>
<div ng-repeat="obj in zoihelper.zois">
  <twx-dt-image id="{{obj.name+'img'}}" 
                           x="{{obj.position.v[0]}}" y="{{obj.position.v[1]}}" z="{{obj.position.v[2]}}" opacity="1.0"
                           rx="0" ry="0" rz="0"                           
                           height="0.5" width="0.5"
                           src="{{obj.imagesrc}}" billboard="true" 
                           hidden="true"
                           shader="zoipinger"
                           >
  </twx-dt-model>
</div>

*/


