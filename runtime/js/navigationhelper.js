//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//steve's positional helper library
//

function spatialHelper(renderer, tunnel, targets) {
  
  // constructor
  this.isHololens   = tunnel != undefined && tunnel.hololens != undefined ? tunnel.hololens : false;
  this.nsteps       = this.isHololens ? 2 : tunnel != undefined && tunnel.steps != undefined ? tunnel.steps : 30;
  this.color        = tunnel != undefined && tunnel.color != undefined ? tunnel.color : undefined;
  this.navpathGeom  = tunnel != undefined && tunnel.geom  != undefined ? tunnel.geom 
                                                                       : this.isHololens ? 'extensions/images/navArrow.pvz' 
                                                                                         : 'extensions/images/navSphere.pvz';
  this.drawing      = false;
  this.showNavpath  = false;
  this._drawPath    = undefined;
  
  this.headloc      = undefined;
  this.target       = targets != undefined ? targets : {};
  this.target.loc   = undefined;
  this.target.tname = this.target.device != undefined ? "target" : undefined;
  this.target.tdist = this.target.extent != undefined ? this.target.extent : 0.45;
  this.target.fname = this.target.feet   != undefined ? "feet"   : undefined;
  this.target.hname = this.target.head   != undefined ? "head"   : undefined;
  this.target.floor = this.target.floorOffset != undefined ? this.target.floorOffset : 0;
  this.target.point = this.isHololens && this.target.arrow != undefined ? true : false;
  
  this.cutoff       = 0.5;
  this.autoCutoff   = false;
  this.inside       = undefined;
  this.entered      = undefined;
  this.exited       = undefined;
  
  // we are initialised asynchronously, so we need the caller to pass in
  // certain 'capabilities; e.g. the renderer
  this.renderer     = renderer;
  
  ///////////////////////////////////////////////////////////////////////////////////////
  // public API
  //
  
  // 
  // set helper to specific location. if undefined, helper is hidden
  //
  this.setAt = function(locator) {
  
    if (locator != undefined) {
          
      this.target.loc = this._positionHelpers( { position:locator.position.v, 
                                                     gaze:locator.gaze.v, 
                                                       up:locator.up.v });
          
      var hpos = new Vector4().Set3a(this.headloc.position);
      var locd = hpos.Sub(this.target.loc.position).Length();    
      this.inside = (locd < this.cutoff) ? true : false; 
    }
    else {
        this._toggleNavpath(false); 
    }
    return this;
  }
  
  //
  // set helper at specific location AND show it
  //
  this.showAt = function(locator) {
    this.setAt(locator);
    if (locator != undefined) 
      this.show();
    return this;
  }
  
  //
  // auto-set helper to current tracked head location/direction
  //
  this.setAtCurrent = function() {
    // switch the endpoint to be the current headlocation
    this.target.loc = this._positionHelpers(this.headloc);
    this.inside     = true;
    return this;
  }
  
  //
  // get the current location of the helper - useful if you want to 
  // persist this for future use
  //
  this.get = function() {
    return this.target.loc;
  }
  
  //
  // hide the helper
  // note that this also pauses drawing the helper, thus optimising performance
  //
  this.hide = function() {
    this._toggleNavpath(false);
    return this;
  }
  
  //
  // show the helper - note the auto-cuttoff state may immediately hide it 
  // again!
  //
  this.show = function() {
    this._toggleNavpath(true);
    return this;
  }
  
  //
  // draw the helper - the ribbon/tunnel and any associated visuals
  //
  this.draw = function(arg) {

    if (this.drawing) {

      //
      // draw a tunnel to this point, from the camera location
      var d = this._drawPath( {  from:arg.position, 
                                 gaze:arg.gaze, 
                                   up:arg.up });
    
      this.drawing = this.showNavpath;
          
      // are we outside, moving in? (or outside, unknown)   
      if (this.cutoff   > d     && 
          this.inside  != true) {
        
      	// turn tunnel effect off when we get close?
        if (this.autoCutoff === true) {
          this.hide();
        } 
        
        // and inform the user?
        if (this.entered != undefined) {  // are we entering the zone? 
          this.entered(this,d);
        }
        
        this.inside = true;
      } 
      // or are we inside, moving out?
      else if (this.cutoff  < d     && 
                 this.inside != false) {   // are we exiting the cutoff zone? 
      
        if (this.exited != undefined) {          
          this.exited(this,d);
        }
        
        this.inside = false;
      }

    }
    
    // and keep a record of the head position
    this.headloc = arg;

  }
  
  //
  // set the color of the ribbon
  //
  this.Color  = function(color)  { this.color  = color;  return this; }
  
  //
  // set the height offset 
  //
  this.Offset = function(offset) { this.target.floor = offset; return this; }
  
  //
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
  
  this.Steps = function(n,show) {
    this.nsteps   = this.isHololens ? 1 : n;  
    return this;
  }
  
  //
  ///////////////////////////////////////////////////////////////////////////////////////
  // private API
  
  ///////////////////////////////////////////////
  this._drawTunnel = function(arg) {
    
    var pu = new Vector4().Set3a(arg.up);	// 
    var p0 = this.target.loc.position;      // staring point
    var p3 = new Vector4().Set3a(arg.from); // end point
    var gd = p0.Sub(p3).Length();
    var ps = this.target.tdist / 2;
    var p1 = p0.Sub(this.target.loc.gaze.Normalize().Scale(0.2*gd)); // incoming direction
    var gz = new Vector4().Set3a(arg.gaze);
    var pg = gz.Scale(gd).Add(p3);
    var p2 = pg.Scale(2).Sub(p0);
    
    // this is the same for all, so calculate this once
    var navfoggedshade = this.color != undefined ? 'navfogged;r f '+this.color[0]+';g f '+this.color[1]+';b f '+this.color[2] 
                                                 : 'navfogged';
    
    // here we go : classic cubic bezier spline curve
    //
    var nsp1 = this.nsteps;
    for (var i=1; i<nsp1; i++) {
    
      var img = "tunnel"+i;
   
      //
      // precalculate some coefficients
      //
      var t    = i/nsp1;
      var omt  = 1-t;
      var omt2 = omt*omt;
      var omt3 = omt*omt2;
      var t2   = t*t;
      var t3   = t*t2;
    
      //
      //cubic bezier               B(t) = (1-t)^3.P0 + 3t(1-t)^2.P1 + 3t^2.(1-t).P2 + t^3.P3
      //
      var bt   = p0.Scale(omt3).Add(p1.Scale(3*omt2*t)).Add(p2.Scale(3*t2*omt)).Add(p3.Scale(t3));
    
      this.renderer.setTranslation(img,bt.v[0],bt.v[1],bt.v[2]);
    
      //
      //cubic differential tangent B'(t) = 3(1-t)^2.(P1-P0) + 6t.(1-t).(P2-P1) + 3t^2.(P3-P2)
      //
      var bdt = p1.Sub(p0).Scale(3*omt2).Add(p2.Sub(p1).Scale(6*t*omt)).Add(p3.Sub(p2).Scale(3*t2)).Normalize();
    
      //
      // if we get close (within 0.5m) start fading
      //
      
      this.renderer.setProperties(img,{ shader: navfoggedshade, 
                                       opacity: (gd - 0.5), 
                                        hidden: !this.showNavpath }); 
        
      //
      // finally, distance scaling of the rings
      //
      var st = (i + 1) * 0.03 * gd / (this.nsteps + 1); 
      this.renderer.setScale(img,st,st,st);
    }

    //
    // finally, the work out our xz (floor plane) distance from the stepHelp, and if we are within 0.5m, disable the 
    // tunnel. as we get close, fade the floor marker (using the shader property).
    //
    var pgd = p3.Distance(p0,[1,0,1]);
    
    if (!this.isHololens && this.target.fname != undefined && this.showNavpath) {
      var tcol      = this.target.color != undefined ? this.target.color : this.color;
      var pingshade = twx.app.isPreview() ? "Default" :
                      tcol != undefined ? 'navpinger;rings f 5;r f '+tcol[0]+';g f '+tcol[1]+';b f '+tcol[2]+';direction f -1;fade f '+(1 - (pgd - 0.5)) 
                                        : 'navpinger;rings f 5;r f 0;g f 1;b f 0;direction f -1;fade f '+(1 - (pgd - 0.5));
      this.renderer.setProperties (this.target.fname,{ shader: pingshade,  
                                                       hidden: false});
    }
    return pgd;
  }
  
  ///////////////////////////////////////////////
  this._drawPointer = function(arg) {
    var clamp = function(x) {
      if (x < 1e-6) return 0;
      else if (x>1) return 1;
      else return x;
    }
    var gz = new Vector4().Set3a(arg.gaze);
    var up = new Vector4().Set3a(arg.up);
    var at = this.target.loc.position;            // staring point
    var fm = new Vector4().Set3a(arg.from);       // end point
    var la = fm.Sub(at).Normalize();
    var dp = 20 * (1 + la.DotP(gz.Normalize()));  // fudge factor to drive opacity effect on pointer when lined up with lookat vector
    var gd = fm.Sub(at).Length();                 // actual distance to target
    
    // we do the calcs always (as we need the gd distance value), but 
    // optionally draw the arrow
    if (this.target.pointer) {
      var co = dp * (0.5 + clamp(gd));              // cutoff is a factor of distance AND look vector
      var pg = gz.Scale(this.target.tdist).Add(fm); // this is a point in front of the user head
    
      var es = new Matrix4().makeLookat(at,pg,up).ToPosEuler(true);
    
      var img = "tunnel1";
      this.renderer.setTranslation(img,es.pos.X(), es.pos.Y(), es.pos.Z());
      this.renderer.setRotation   (img,es.rot.X(), es.rot.Y(), es.rot.Z());
      this.renderer.setProperties (img,{  shader: 'Default',
                                         opacity: clamp(co-0.5), 
                                          hidden: !this.showNavpath }); 
    }
    return gd;
  }
  
  ///////////////////////////////////////////////
  this._toggleNavpath = function(force) {
  
    var navfoggedshade = twx.app.isPreview() ? "Default" : 
                         "navfoggedLit";  
                      
    // override if allowed
    this.showNavpath = force != undefined ? force 
                                         : !this.showNavpath;
  
    if (this.target.loc != undefined && this.showNavpath === true) {

      this.drawing = this.showNavpath;
 
      if (this.target.tname != undefined) 
      this.renderer.setProperties (this.target.tname,{shader: navfoggedshade, 
                                                      hidden: false });
      if (this.target.callback != undefined)
        this.target.callback({hidden:false});
      
      if (this.target.fname != undefined) {
        var tcol      = this.target.color != undefined ? this.target.color : this.color;
        var pingshade = twx.app.isPreview() ? "Default" :
                        tcol != undefined ? 'navpinger;rings f 5;r f '+tcol[0]+';g f '+tcol[1]+';b f '+tcol[2]+';direction f -1'
                                          : 'navpinger;rings f 5;r f 0;g f 1;b f 0;direction f -1';
                                                
        this.renderer.setProperties (this.target.fname,{shader: pingshade,    
                                                        hidden:false });
      }
      if (this.target.hname != undefined) 
      this.renderer.setProperties (this.target.hname,{shader: navfoggedshade,    
                                                      hidden: false });
    
    } else {
    
      if (this.target.tname != undefined) 
      this.renderer.setProperties (this.target.tname,{shader: navfoggedshade, 
                                                      hidden: true});
      if (this.target.callback != undefined)
        this.target.callback({hidden:true});
        
      if (this.target.fname != undefined) 
        this.renderer.setProperties (this.target.fname,{shader :twx.app.isPreview() ? "Default" : "navpinger",    
                                                        hidden :true});
      if (this.target.hname != undefined) 
        this.renderer.setProperties (this.target.hname,{shader: navfoggedshade,    
                                                        hidden: true});
    }
    
    return this.drawing;    
  }
  
  ///////////////////////////////////////////////
  this._positionHelpers = function(headloc) {
    var vp = new Vector4().Set3a(headloc.position);
    var gp = new Vector4().Set3a(headloc.gaze);
    
    //
    // lets get the gaze (vector) and the up (vector)
    var gaze  = new Vector4().Set3a( headloc.gaze).Negate();  
    var up    = new Vector4().Set3a( headloc.up ); 
    var xd    = up.CrossP(gaze);
  
    var ep;
    var hp; 
    if (this.isHololens === true) {
      ep = gp.Scale(this.target.tdist).Add(vp);     // position target point 45cm in front
      hp = vp;                                      // head is where we are at
    } else {
      ep = gp.Scale(0.2*this.target.tdist).Add(vp); // position 10cm in front of where device says it is
      hp = ep.Add(gaze.Scale(this.target.tdist));   // position head behind the view point
    }
    
    // from gaze, up  we calculate the bitangent (nup) and from this we can calculate the view matrix
    var nup = gaze.CrossP(xd);                     // recalc up
    var em  = new Matrix4().Set4V(xd,nup,gaze,ep); // the matrix defines the position of the target and orientation of the target/head
    
    // lets turn the matrix into euler angles
    var es = em.ToEuler(true);
    
    if (this.target.tname != undefined) {
      this.renderer.setTranslation(this.target.tname,ep.v[0],ep.v[1],ep.v[2]);
      this.renderer.setRotation   (this.target.tname,es.attitude, es.heading, es.bank);
      this.renderer.setProperties (this.target.tname,{shader:twx.app.isPreview() ? "Default" : "navfoggedLit", 
                                                      hidden:false});
    }
    if (this.target.callback != undefined) {
      var op = new Vector4().Set3(es.attitude, es.heading, es.bank);  
      this.target.callback({location:ep, orientation:op, transform:em, hidden:false});
    }
    if (this.target.hname != undefined) {
      this.renderer.setTranslation(this.target.hname,hp.v[0],hp.v[1],hp.v[2]);
      this.renderer.setRotation   (this.target.hname,es.attitude, es.heading, es.bank);
      this.renderer.setProperties (this.target.hname,{shader:twx.app.isPreview() ? "Default" :"navfoggedLit", 
                                                      hidden:false});
    }

    if (this.target.fname != undefined) {
      var fup = new Vector4().Set3(0,1,0);
      // work out the horizontal gaze vector (remove vertical offset)
      var hg  = new Vector4().Set3(gaze.v[0],0,gaze.v[2]).Normalize();
          xd  = fup.CrossP(hg);
          em  = new Matrix4().Set3V(xd,fup,hg);
          
      // the feet (image) need to be flipped -90 to align to floor
      var r90 = new Matrix4().Rotate([1,0,0],-90,true).Multiply(em.m);
      var esf = r90.ToEuler(true);
      
      // feet are positioned 0.5m back from the target
      var fdist = this.target.tdist * 1.1;
      var fp  = new Vector4().Set3(ep.v[0], - this.target.floor, ep.v[2]).Add(hg.Scale(fdist));
      
      var tcol      = this.target.color != undefined ? this.target.color : this.color;
      var pingshade = twx.app.isPreview() ? "Default" :
                      tcol != undefined ? 'navpinger;rings f 5;r f '+tcol[0]+';g f '+tcol[1]+';b f '+tcol[2]+';direction f -1'
                                        : 'navpinger;rings f 5;r f 0;g f 1;b f 0;direction f -1';
                                        
      this.renderer.setTranslation(this.target.fname, fp.v[0],      fp.v[1],     fp.v[2] ); 
      this.renderer.setRotation   (this.target.fname, esf.attitude, esf.heading, esf.bank);
      this.renderer.setProperties (this.target.fname, {shader:pingshade, 
                                                       hidden:false});
    }
    
    //
    // switch the endpoint to be the current headlocation
    var targetloc = {position:vp, gaze:gp, up:up};
    return targetloc;
  }
  
  ///////////////////////////////////////////////
  this.tunnel_objects = (function(obj) {
    var shapes = [];
    for (var i=1; i< obj.nsteps; i++) {
     
      // declare using pvz
      shapes.push( { name: "tunnel"+i, 
                      src: obj.navpathGeom
                   } ); 
     
      // optional - declare as images (see below) 
      // shapes.push( {name:"tunnel"+i, src:"app/resources/Uploaded/arrow.png?name=img"});
    }
    return shapes;
  })(this);

  ///////////////////////////////////////////////
  this.nav_objects = (function(obj) {
    var shapes = [];
    
    // declare models
    if (obj.target.tname != undefined) shapes.push( {name:obj.target.tname, src:obj.target.device } ); 
    if (obj.target.hname != undefined) shapes.push( {name:obj.target.hname, src:obj.target.head } ); 
    
    return shapes;
  })(this);
  
  ///////////////////////////////////////////////
  this.nav_images = (function(obj) {
    var shapes = [];
    
    // declare images
    if (obj.target.fname != undefined) shapes.push( {name:obj.target.fname, src:obj.target.feet } ); 
     
    return shapes;
  })(this);
      
  // setup draw bindings    
  this._drawPath = this.isHololens ? this._drawPointer : this._drawTunnel; 

}


//
// declare the tunnel dynamically (see tml widget for the ng-repeat that uses this data)
//

/*

// this is the tml for the tunnel
//
<div ng-repeat="obj in helper.tunnel_objects">
  <twx-dt-model id="{{obj.name}}" 
                           x="0" y="0" z="0" opacity="1.0"
                           rx="0" ry="0" rz="0" 
                           src="{{obj.src}}" 
                           hidden="true"
                           shader="navfogged"
                           >
  </twx-dt-model>
</div>
<div ng-repeat="obj in helper.nav_objects">
  <twx-dt-model id="{{obj.name}}" 
                           x="0" y="0" z="0" opacity="1.0"
                           rx="0" ry="0" rz="0"
                           src="{{obj.src}}" 
                           hidden="false"
                           >
  </twx-dt-model>
</div>
<div ng-repeat="obj in helper.nav_images">
  <twx-dt-image id="{{obj.name}}" 
                           x="0" y="0" z="0" opacity="1.0"
                           rx="-90" ry="0" rz="0"                           
                           height="0.5" width="0.5"
                           src="{{obj.src}}" 
                           hidden="false"
                           shader="navpinger"
                           >
  </twx-dt-model>
</div>
*/

