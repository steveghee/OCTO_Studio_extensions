//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//steve's positional helper library
//

function tetheredHelper(renderer, interval, panels, offset) {
  
  // constructor
  this.lerping    = undefined;
  this.transiting = undefined;
  this.panels     = undefined;
  this.pending    = panels;
  this.renderer   = renderer;
  this.interval   = interval;
  this.offset     = (offset != undefined) ? offset : 0.5;
  this.step       = 0.05;
  this.tethering  = true;  // lets default to working unless we are told otherwise
  
  //generally not used anymore, but keeping the code around for the time being
  //this(if true) will disable the submenu items (hide) during tethered movement
  this.noControlsOnTransition = false;
  
  // and some defaults
  this.position = new Vector4();
  this.gaze     = new Vector4().Set3(0,0,1);
  this.em       = new Matrix4();
    
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // based on the head location (arg) let's determine if we need to move the
  // tracked items ('panels') - it we do need to move them, kick off a small
  // animation to move the items to the final resting location
  this.headTether = function(arg) {
      console.log('tether called with',JSON.stringify(arg));
    if (this.tethering === true) this._headTether(arg);
    if (this.transiting != undefined) this.transiting();  
  }
  
  ////////////////////////////////////////////////////////////////////
  // change the panels we are managing
  this.setPanels = function(panels,callback) {
      
    // only switch panels if the panel actuall changes!  
    if (this.panels === undefined || 
             panels === undefined || 
             this.panels[0].name != panels[0].name) { // technically there could be more then one panel
    //TODO : do we really want to support >1 panel at any time?
        
      //kill off and hide any existing panels that we have under management
      if (this.lerping != undefined) {
        this,interval.cancel(this.lerping);
        this.lerping = undefined;
      }  
    
      // hide the old, bring in the new
      var transition = {
          outgoing : this.panels,
          incoming : panels,
          tpos     : new Vector4(),
          tgaze    : new Vector4().Set3(0,0,0),  // these are angles, not a vector.
          tem      : new Matrix4()
      };
      
      // start the transition
      this.transiting = this._transfer(this,transition);
    }
    return this;
  }
  
  ////////////////////////////////////////////////////////////////////
  // set the offset at whch the panel starts moving
  this.Offset = function(offset) {
    this.offset = offset;
    return this;
  }
  this.Steps = function(steps) {
    this.step = (steps!=undefined && steps>0) ? 1/steps : 0.05;
    return this;
  }
  this.ControlsOnTransition = function(onoff) {
    this.noControlsOnTransition = onoff;
    return this;
  }
  
  ////////////////////////////////////////////////////////////////////
  //
  this.Start = function(panels) {
    this.tethering = true;
    if (panels!=undefined) 
      this.pending = panels;
    if (this.pending != undefined)
      this.setPanels(this.pending);  // replace any panels  
    this.pending = undefined;
      
    return this;  
  }
  this.Pause = function() {
    this.tethering = false;
    return this;
  }
  this.Stop = function() {
    this.tethering = false;
    return this.setPanels(undefined);  // remove any panels  
  }

  ////////////////////////////////////////////////////////////////////
  // if we are mid motion, let the user know
  //
  this.isBusy = function() {
    return (this.transiting != undefined);
  }
  this.isTethered = function() {
    return this.tethering;
  }
  
  //////////////////////////////////////////////////////////////////
  // (private) 
  // based on the head location (arg) let's determine if we need to move the
  // tracked items ('panels') - it we do need to move them, kick off a small
  // animation to move the items to the final resting location
  this._headTether = function(arg) { 
  
    // arg containts position, gaze and up
    // lets get the position (this is the xyz position of the head RELATIVE to the tracking target)
  
    this.position = new Vector4().Set3a(arg.position);	   //Position as a vector
    this.gaze     = new Vector4().Set3a(arg.gaze).Negate();

    // lets get the gaze (vector) and the up (vector)
    var up    = new Vector4().Set3a(arg.up); 
    var yup   = new Vector4().Set3(0,1,0);
    //if (Math.abs(yup.DotP(this.gaze)) < 0.707) up = yup; // keep item vertical when head is generally looking horizontal-ish
    var xd    = yup.CrossP(this.gaze).Normalize();
    var nup   = this.gaze.CrossP(xd).Normalize(); // recalc up
 
    // from gaze, up  we calculate the bitangent (nup) and from this we can calculate the view matrix
    this.em = new Matrix4().Set3V(xd,nup,this.gaze);
    
    // lets turn the matrix into euler angles
    var es = this.em.ToPosEuler(true).rot;
    
    var dolerp = 0;
    
    // put the destination point a certain x,z offset  away from the head
    if (this.panels!=undefined) for(var p=0;p<this.panels.length;p++) {
        
      var panel  = this.panels[p];
      var dx     = panel.delta!=undefined?panel.delta[0]:0;
      var dz     = panel.delta!=undefined?panel.delta[1]:1;
      var hdelta = this.gaze.Add(xd.Scale(dx));
      
      // set the final destination location - note that this can change whilst the
      // panel(s) are moving i.e. they will rty to keep up with the head
      panel.targetPos = this.position.Sub(hdelta.Scale(dz));
      
      // the panels may need this information when they are animating
      panel.es   = es;
      panel.em   = this.em;
    
      // first time, just position the item at the destination point
      if (panel.ipos === undefined) {
        panel.ipos = new Vector4(); //panel.targetPos;
      }
  
      // otherwise, only move it IF it is greater than (parameter) distance 
      // away from where it was last placed
      // note also : we only try this IF it is not already moving to the new position.
      else if (this.lerping === undefined && 
               panel.ipos.Sub(panel.targetPos).Length() > this.offset) {
    
        // the image rotates to always point towards the camera 
        panel.tweend = 0;
        
        // make sure we call only once
        panel.triggered = false;
        if (!panel.triggered && panel.onMoveStart != undefined) { 
          // let the caller know that the panel is about to move; they
          // might choose to do something
          panel.onMoveStart(this,panel)
        } 
        
        // for the first step, we only need to rotote the panel 
        this.renderer.setRotation   (panel.name,   panel.es.X(),  panel.es.Y(),  panel.es.Z());
        // and any attachments
        if (!panel.triggered && panel.buttons != undefined) {
          var me = this;          
          panel.buttons.forEach(function(button) {
            if (me.noControlsOnTransition) {
              me.renderer.setProperties(button.name, {hidden:true});
              if(button.backpanel!=undefined) {
                me.renderer.setProperties(button.name+'_button',{hidden:true});
                me.renderer.setProperties(button.name+'_backer',{hidden:true});
              }
            } else {
              // note : we dont rotate them here - only at the start and at the end
              var ab = new Vector4().Set3a(button.loc).Transform(panel.em).Add(panel.ipos);    
              me.renderer.setTranslation(button.name,ab.X(),ab.Y(),ab.Z());
              me.renderer.setRotation   (button.name,panel.es.X(), panel.es.Y(), panel.es.Z());
            }
          });
        }
        panel.triggered = true;
            
        dolerp += 1;
      }
    }
    
    // only start the animation if ALL the panels say so
    if (this.panels != undefined && dolerp === this.panels.length) {
        this.lerping = this._lerp(this);
    }
    
    // execute any pending animation
    if (this.lerping!=undefined) 
      this.lerping();
  }
  
 
  //////////////////////////////////////////////////////////////////
  // (private) handles the animated tehtered behaviour, moving the
  // panels to the new target
  this._lerp = function(obj) {
    
    var tobj = obj;
    return function() {
      
      var endlerp = 0;
      
      // for each panel...
      for(var p=0;p<tobj.panels.length;p++) {
        var tpan  = tobj.panels[p];
        
        // we are blending/lerping our way along a vector from 0..1 where the end is panel.targetPos
        // the current location is that lerped value
        var lerp        = tpan.targetPos != undefined ? tpan.ipos.Tween2(tpan.targetPos, tpan.tweend) 
                                                      : tpan.ipos;
        tpan.tweend    += tobj.step;
        
        // the orientation is the current head orientation
        tpan.targetGaze = tpan.es;
        tpan.targetem   = tpan.em;
        
        // lets move the panel
        tobj.renderer.setTranslation(tpan.name,            lerp.X(),            lerp.Y(),            lerp.Z());
        tobj.renderer.setRotation   (tpan.name, tpan.targetGaze.X(), tpan.targetGaze.Y(), tpan.targetGaze.Z());          
        
        if (!tobj.noControlsOnTransition && tpan.buttons != undefined) tpan.buttons.forEach(function(button) {
                                                                                
            // new location for ths button is the button offset transformed by the matrix which orients the panel and then
            // positioned along the lerped vector
            var ab = new Vector4().Set3a(button.loc).Transform(tpan.targetem).Add(lerp);    
            tobj.renderer.setTranslation(button.name,ab.X(),ab.Y(),ab.Z());
            tobj.renderer.setRotation   (button.name,tpan.targetGaze.X(), tpan.targetGaze.Y(), tpan.targetGaze.Z());
        });
                
        // when we reach the end, stop lerping this panel
        if(tpan.tweend>=1.0) {
            
          endlerp   += 1;
          tpan.ipos  = lerp;
          tpan.igaze = tpan.targetgaze;
          tpan.iem   = tpan.targetem;
          
          if (tpan.triggered === true && tpan.onMoveEnded != undefined) { 
            // let the caller know that the panel is finished moving; they
            // might choose to do something
            tpan.onMoveEnded(tobj,tpan)
          } 
          
          // final set rotation
          if (!tobj.noControlsOnTransition)
            tobj.renderer.setRotation   (tpan.name, tpan.targetGaze.X(), tpan.targetGaze.Y(), tpan.targetGaze.Z());          
          
          // final rotate of buttons etc.
          if (tpan.triggered && tpan.buttons != undefined) tpan.buttons.forEach(function(button) {
            if (tobj.noControlsOnTransition) {
              // note : we dont rotate them here - only at the start and at the end
              var ab = new Vector4().Set3a(button.loc).Transform(tpan.targetem).Add(tpan.targetPos);    
              tobj.renderer.setTranslation(button.name,ab.X(),ab.Y(),ab.Z());
              tobj.renderer.setRotation   (button.name,tpan.targetGaze.X(), tpan.targetGaze.Y(), tpan.targetGaze.Z());
              
              tobj.renderer.setProperties(button.name, {hidden:false});
              if(button.backpanel!=undefined) {
                tobj.renderer.setProperties(button.name+'_button',{hidden:false});
                tobj.renderer.setProperties(button.name+'_backer',{hidden:!button.backpanel});
              }
            } else {
              tobj.renderer.setRotation   (button.name,tpan.targetGaze.X(), tpan.targetGaze.Y(), tpan.targetGaze.Z());
            }
          });
          tpan.triggered = false;    
        }
      }
      
      // once all the panels have stopped, we kill off the animation
      if (endlerp === tobj.panels.length) {
        tobj.lerping = undefined;
      }
    }
  }

  //////////////////////////////////////////////////////////////////
  // (private) handles the animated transition from panels(outgoing) to panels(incoming)
  // 
  this._transfer = function(obj,transit) {
      
      
    var tobj = obj;
    var transition = transit;  
    
    transition.btnscale  = new Vector4().Set3(1,1,1);
    
    // capture the position of the panel(s)
    if (transition.outgoing != undefined) {
      for (var p=0;p<transition.outgoing.length;p++) {
            
        var panel = transition.outgoing[p];
          
        // inform the 'owner' of the panel that it's being disconnected   
        if (panel.onDisconnecting != undefined)
          panel.onDisconnecting(panel,transition);
        
        transition.tpos  = panel.ipos != undefined ? panel.ipos  : panel.targetPos;
        transition.tgaze = panel.igaze!= undefined ? panel.igaze : panel.targetGaze;
        transition.tem   = panel.iem  != undefined ? panel.iem   : panel.targetem;
        transition.ipos  = panel.ipos != undefined ? panel.ipos  : panel.targetPos;
        
        transition.outscale = new Vector4().Set3(panel.size[0],panel.size[1],1);
        transition.outtgt   = new Vector4().Set3(0,0,0.1);
      }
    }
    
    if (transition.incoming != undefined) {
      for (var p=0;p<transition.incoming.length;p++) {
          
        var panel = transition.incoming[p];
        
        panel.targetPos  = transition.tpos;
        panel.targetGaze = transition.tgaze;
        panel.targetem   = transition.tem;
        panel.ipos       = transition.ipos;
      
        transition.inscale  = new Vector4().Set3(0,0,1);
        transition.intgt    = new Vector4().Set3(panel.size[0],panel.size[1],1);
        
        //sg TODO
        //i have no idea why this will not work
        // is it just that this is being called too early in the cycle?
        // why is the result that the label appears to disappear?
        
        if (panel.buttons != undefined) for (var b=0;b<panel.buttons.length;b++) {
          var button = panel.buttons[b];
          /**/
          tobj.renderer.setProperties (button.name, {hidden:false});
          if(button.backpanel!=undefined) {
            tobj.renderer.setProperties (button.name+'_button',{hidden:false});
            tobj.renderer.setProperties (button.name+'_backer',{hidden:!button.backpanel});
          }
          /**/
          // note : we dont rotate them here - only at the start and at the end
          var ab = new Vector4().Set3a(button.loc).Transform(panel.targetem).Add(panel.targetPos);    
          tobj.renderer.setTranslation(button.name,ab.X(),ab.Y(),ab.Z());
          tobj.renderer.setRotation   (button.name,panel.targetGaze.X(), panel.targetGaze.Y(), panel.targetGaze.Z());
          tobj.renderer.setScale      (button.name,0.001,0.001,0.001);
        }
        /**/
        tobj.renderer.setProperties (panel.name,{hidden:false});
        /**/
        tobj.renderer.setTranslation(panel.name,panel.targetPos.X(),  panel.targetPos.Y(),  panel.targetPos.Z() );
        tobj.renderer.setRotation   (panel.name,panel.targetGaze.X(), panel.targetGaze.Y(), panel.targetGaze.Z());
        tobj.renderer.setScale      (panel.name,0.001,0.001,0.001);
  
      }
    }

    transition.tweend = 0;
    
    //and install new ones
    tobj.panels = transition.incoming;
    
    return function() {
      
      var endtransit = 0;
      
      transition.tweend += 0.1;
      
      // we transition the outgoing panels with tweend in the range 0..1
      if (transition.outgoing != undefined) {
        for (var p=0;p<transition.outgoing.length;p++) {
            
          var panel = transition.outgoing[p];
          var lerp  = transition.outscale.Tween2(transition.outtgt,transition.tweend,true);  
          tobj.renderer.setScale(panel.name,lerp.X(),lerp.Y(),lerp.Z());
          
          // at the end, hide the items
          if (panel.buttons != undefined) for (var b=0;b<panel.buttons.length;b++) {
            var button = panel.buttons[b];
            
            lerp  = transition.btnscale.Tween2(transition.outtgt,transition.tweend,true);  
            tobj.renderer.setScale(button.name,lerp.X(),lerp.Y(),lerp.Z());
            
            if (transition.tweend >= 1) {
                
              // inform the 'owner' of the panel that it's being disconnected   
              if (panel.onDisconnected != undefined)
                panel.onDisconnected(panel);
              
              /**/
              tobj.renderer.setProperties (button.name,{hidden:true});
              if(button.backpanel!=undefined) {
                tobj.renderer.setProperties (button.name+'_button',{hidden:true});
                tobj.renderer.setProperties (button.name+'_backer',{hidden:true});
              }
              /**/
            }
            
          }
        
          /**/
          if (transition.tweend >= 1) {
            tobj.renderer.setProperties (panel.name,{hidden:true});
          }
          /**/
        }
      
        // if we are done, stop
        if (transition.tweend >= 1) 
          transition.outgoing = undefined;
      }
    
      if (transition.incoming != undefined) {
        // we transition the incoming panels with tweend in the range 0.5..1.5
        var tweenin = transition.tweend - 0.5; // add a small delay
      
        if (tweenin > 0) for (var p=0;p<transition.incoming.length;p++) {
          var panel = transition.incoming[p];
      
          var lerp  = transition.inscale.Tween2(transition.intgt,tweenin,true);  
          tobj.renderer.setScale(panel.name,lerp.X(),lerp.Y(),lerp.Z());
        
          if (panel.buttons != undefined) for (var b=0;b<panel.buttons.length;b++) {
            var button = panel.buttons[b];
          
            lerp  = transition.inscale.Tween2(transition.btnscale,tweenin,true);  
            tobj.renderer.setScale(button.name,lerp.X(),lerp.Y(),lerp.Z());
          }        
        }
      }
      
      // finish    
      if (transition.tweend >= 1.5) {
        //done!
        tobj.transiting = undefined;
      }

    }
    
  }
  
}



