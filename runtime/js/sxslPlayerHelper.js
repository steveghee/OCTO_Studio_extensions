//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//steve's sxsl player helper library
//
function sxslHelper(renderer, anchor) {

  this.anchor = anchor;
  this.renderer = renderer;
  
  function getViewpoint(ref, context) {
    if (ref != undefined) {
      let asset = context[ref.contextId].assets[ref.assetId];
      return asset.resources[0].content;  // should really look for the right role-based resource here e.g. POSE
    }
    else 
      return undefined;
  }
  
  function getResourceTypes(res) {
    return res != undefined ? res.resources.map(v => { return v.mimeType; }) : [];
  }

  function getResourceText(res,vars,type) {
      
    //ideally will search through the resources for type (and also language at somepoint)  
    var stype = type || "text/plain";  
    var txt   = res != undefined ? res.resources.filter(function(v) { return v.mimeType==stype;})[0].text : ""
    
    if (txt.length>0 && vars != undefined) {
        
        //are there any variables referenced? it would look like ${varname}.  if so, can we fill them in?
      const regexp = /\${(\w+)}/g;
      for (const match of txt.matchAll(regexp)) {
        var name = match[1];
        var nv   = vars[name];
        if (nv != undefined) {
          var rg2 = RegExp(`(\\$\{${match[1]}})`,"g");
          txt = txt.replace(rg2,nv);
        }
      }
      //look for #{subject id} and, if found, display the correctly tinted bullet point
      const regexp2 = /\#{(\w+)}/g;
      for (const match2 of txt.matchAll(regexp2)) {
        var name = match2[1];
        var nv   = vars[name];
        if (nv != undefined) {
          var rg2 = RegExp(`(\\#\{${match2[1]}})`,"g");
          txt = txt.replace(rg2,`<span style="color:${nv};">&#x26AB;&#xfe0e;</span>`);
        } else {
          var rg2 = RegExp(`(\\#\{${match2[1]}})`,"g");
          txt = txt.replace(rg2,''); // no reference found - should we show an error?
        }
      }
  
  
    }
    return txt;
  }

  this.sxslInput = function (i) {  
    this.type     = i.type;
    this.id       = i.id || i.ID || i.name;
    this.mimeType = i.mimeType;
    this.regex    = i.regex;
    this.minwarn  = i.minwarn;
    this.maxwarn  = i.maxwarn;
    this.minerror = i.minerror;
    this.maxerror = i.maxerror;
    this.nominal  = i.nominal;
    this.precision = i.precision;
    this.maxCaptures = i.maxCaptures;
    this.minCaptures = i.minCaptures || 0;
    if (i.enumerations != undefined) {
      var me = this;
      me.enumerations = [];  
      i.enumerations.forEach(function(e) {
        me.enumerations.push( { display:getResourceText(e.display), value:e.value } );                       
      });
    }
    this.required = i.required;
    this.tool     = i.tool;
    this.title    = getResourceText(i.title);  
    this.hint     = i.hint != undefined ? getResourceText(i.hint.instructions || i.hint) : undefined;
  }

  this.sxslAction = function (a, s, i, last, p) {
    this.step = s;
    this.stepid = s.id;
    this.index = i;
    this.events = p.events;
    this.isFirst = (i == 0);
    this.isLast = (last == true);
    this.introtext = (i == 0) ? s.intro : undefined;
    this.outrotext = (last == true) ? s.outro : undefined;

    // we can have procedure, step and action=level contexts, so these get passed down
    this.context = a.contexts != undefined && a.contexts.length > 0 ? a.contexts[0] : s.context;
    this.workstate = a.workstate || s.workstate;
    
    this.ack  = s.ack;
    this.type = a.type;
    this.details   = a.details != undefined ? new p.helper.sxslInput(a.details) : undefined; //a.details
    this.materials = a.materials;
    this.tint      = a.tint;
    
    this.animation = undefined;
    if (a.animations != undefined) {
      //for now, let's assume there is one
      let sub = a.animations[0];
      //really should check to see this is valid
      this.animation = this.context[sub.contextId].assets[sub.assetId].resources[0].content.animationName;
    }
    
    this.variables = [];
    this.subjects = undefined;
    var subcount = a.subjects != undefined ? a.subjects.length : 0;
    if (subcount > 0) {
      this.subjects = [];
      if (a.subjects != undefined) {
        for (var subc = 0; subc < subcount; subc++) {
          var sub = a.subjects[subc];

          // semantic or resource references?  semantic references come from context
          if (this.context != undefined && sub.contextId != undefined) {

            // idealy we will look these up from the context store  
            // work out the final context for this specific action
            var fctx;
            let mctx = this.context[sub.contextId].models;
            if (this.context[sub.contextId].trackers != undefined) {
              let tctx = this.context[sub.contextId].trackers[0];
              fctx = {
                type: tctx.mimeType,
                dataset: tctx.content.dataset,
                name: tctx.content.targetName,
                guide: tctx.content.guideView,
                occluder: mctx != undefined ? mctx[0].url : undefined
              };
            }
            let asset = this.context[sub.contextId].assets[sub.assetId];
            this.subjects.push({ context: fctx, asset: asset, id: sub.assetId, occurrenceIds:sub.occurrenceIds, tint:sub.tint, name:sub.id });
          } else {
            //no context, so is the resource defined inline?
            this.subjects.push({ asset: sub, id: sub.assetId, occurrenceIds: sub.occurrenceIds, tint:sub.tint, name:sub.id });
          }
          if (sub.tint != undefined && sub.id != undefined) {
            this.variables[sub.id] = sub.tint;
          }
        }
      }
    }

    // same for annotations
    this.annotations = undefined;
    var anyans = a.annotations != undefined ? a.annotations : s.annotations;
    var subcount = anyans != undefined ? anyans.length : 0;
    if (subcount > 0) {
      this.annotations = [];
      if (anyans != undefined) {
        for (var subc = 0; subc < subcount; subc++) {
          var sub = anyans[subc];
          // idealy we will look these up from the context store  
          // work out the final context for this specific action
          if (this.context != undefined && sub.contextId != undefined) {
            var fctx;
            let mctx = this.context[sub.contextId].models;
            if (this.context[sub.contextId].trackers != undefined) {
              let tctx = this.context[sub.contextId].trackers[0];
              fctx = {
                type: tctx.mimeType,
                dataset: tctx.content.dataset,
                name: tctx.content.targetName,
                guide: tctx.content.guideView,
                occluder: mctx != undefined ? mctx[0].url : undefined
              };
            }
            let asset = this.context[sub.contextId].assets[sub.assetId];
            this.annotations.push({ context: fctx, asset: asset, id: sub.assetId, ann:sub });
          } else {
            //no context, so is the resource defined inline?
            this.annotations.push({ asset: sub, id: sub.resources[0].id, occurrenceIds: sub.occurrenceIds, tint:sub.tint });
          }
          if (sub.tint != undefined && sub.id != undefined) 
            this.variables[sub.id] = sub.tint;
        }
      }
    }

    // same for tools, but with addition of having data to setup/execute the tool
    var toolcount = a.tools != undefined ? a.tools.length : 0;
    if (toolcount > 0) {
      this.tools = [];
      if (a.tools != undefined) {
        for (var toolc = 0; toolc < toolcount; toolc++) {
          var tool = a.tools[toolc];
          var asset, context;
          if (this.context != undefined && tool.contextId != undefined) {
            var fctx;
            let mctx = this.context[tool.contextId].models;
            if (this.context[tool.contextId].trackers != undefined) {
              let tctx = this.context[tool.contextId].trackers[0];
              fctx = {
                type: tctx.mimeType, "conclusion": {
                  "resources": [
                    {
                      "mimeType": "text/plain",
                      "text": "A procedure can end with an (optional) conclusion"
                    }
                  ]
                },

                dataset: tctx.content.dataset,
                name: tctx.content.targetName,
                guide: tctx.content.guideView,
                occluder: mctx != undefined ? mctx[0].url : undefined
              };
            }

            asset = this.context[tool.contextId].assets[tool.assetId];
          
            this.tools.push({
              name: tool.name,
              id: tool.id,
              mime: undefined, //not used at this point
              text: getResourceText(tool.extras),
              context: context,
              asset: asset
            });
          } else {
            //no context, so is the resource defined inline?
            this.tools.push({ asset: tool, id: tool.resources[0].id, occurrenceIds: tool.occurrenceIds, tint:tool.tint });
          }

          
        }
      }
    }

    var refcount = a.references != undefined ? a.references.length : 0;
    if (refcount > 0) {
      this.refs = [];
      if (a.references != undefined) {
        for (var refc = 0; refc < refcount; refc++) {
          var ref = a.references[refc];
          //TODO : we really should check that the resource etc. exists  
          this.refs.push({
            mime: ref.resources[0].mimeType,
            url: ref.resources[0].url,
            thumb: ref.thumbnail,
            desc: getResourceText(ref.description)
          });
        }
      }
    }
    
    this.viewpoint = getViewpoint(a.viewpoint != undefined ? a.viewpoint : s.viewpoint, this.context);
    this.sceneName = a.sceneName || a.workstate || s.sceneName; // if defined, use this to drive the background context (model/occluder)
    this.id = a.id;
    var cc = [];
    for(v in this.variables) { cc[v] = this.variables[v] };
    for(v in p.variables) { cc[v] = p.variables[v] };
    this.instruction = getResourceText(a.instructions, cc);

    //pointer back to the master
    this.base = a;

    // debug - what's in the action
    this.toString = function () {
      var s = '';
      //s = s + ((this.context != undefined) ? 'within context '+this.context.name+'...\n' : 'no context\n') ;  
      if (this.isFirst && this.introtext != undefined) s = s + '(intro) ' + this.introtext + '\n';
      if (this.instruction != undefined) s = s + this.instruction + ' ';
      if (this.subjects != undefined && this.subjects.length > 0) {
        // lets list all the resources
        s = s + '{' + this.subjects.length + ' subjects}';
      }
      if (this.annotations != undefined && this.annotations.length > 0) {
        // lets list all the resources
        s = s + '{' + this.annotations.length + ' annotations}';
      }
      if (this.refs != undefined && this.refs.length > 0) {
        // lets list all the resources
        s = s + '[' + this.refs.length + ' references]';
      }
      if (this.isLast) {
        if (this.outrotext != undefined) s = s + '\n(conclusion) ' + this.outrotext + ' ';
        if (this.ack != undefined) {
          s = s + '(' + this.ack.type;
          if (this.ack.reasonType === "Code" && this.ack.reasonCodes != undefined) {
            this.ack.reasonCodes.forEach(function (ec) {
              s = s + '-' + (ec.resources[0].text + '[' + ec.code + ']');
            });
          }
          s = s + ')';
        }
      }
      return s;
    }

  }
  
  //
  // step processor
  //
  this.sxslStep = function (s, p) {
    var c = p.context;
    var e = p.events;
    var r = p.stepRef;

    this.actions = s.actions;
    this.events = e;
    this.targetTime = s.targetTime;
    this.prereq = r.prereq;
    this.canBypass = p.getStepList(false).length > 1;
    this.actioncount = s.actions != undefined ? s.actions.length : 0;
    this.id = s.id;
    this.title = getResourceText(s.title, p.variables);
    this.intro = getResourceText(s.introduction, p.variables);
    this.outro = getResourceText(s.conclusion, p.variables);
    this.viewpoint = s.viewpoint;
    this.annotations = s.annotations;
    this.workstation = s.workstation;
    
    // we can have procedure, step and action=level contexts, so we capture and pass these down
    this.context = s.contexts != undefined && s.contexts.length > 0 ? s.contexts[0] : c;
    this.ack = s.acknowledgement != undefined ? s.acknowledgement : undefined;
    
    this.workstate   = s.workstate; // scenename/workstate can be used to drive per-step tracking and visuals
    this.sceneName   = s.sceneName || s.workstate; //optional - can be used to set context

    //pointers back to the master
    this.base = s; // actual step definition
    this.ref = r; // the statement that invokes this instance
  }

  //
  // the procedure player - functions to read/parse the sxsl, and to navigate through it step by step
  //
  this.sxsl2Player = function (config, helper, procValidator, stepValidator, context) {
    this.helper = helper;
    this.anchor = helper.anchor;
    this.sxslStep = helper.sxslStep;
    this.proc = {};
    this.context = context;
    this.events = config != undefined ? { emit: config.emit, on: config.on } : { emit: function () { }, on: function () { } };

    this.sti = 0;
    this.aci = 0;
    this.action = undefined;
    this.step = undefined;

    //
    // override with external validator, or use a default
    // the default local validator always passes :)
    //
    this.stepValidator = stepValidator || function (step, test) {
      return new Promise((next, reject) => {
        next();
      })
    }

    this.procValidator = procValidator || function (proc) {
      return new Promise((next, reject) => {
        next({ tools: {}, consumables: {} });
      })
    }

    var me = this;
    //
    // lets kick things off ; procedures have optional introduction section, followed by steps...
    //
    this.start = () => new Promise((next, reject) => {
      this.action = undefined;
      this.step   = undefined;
      this.intro  = getResourceText(this.proc.introduction);

      // here we would likely do some sanity checks, clean up internal data
      // e.g. if we were to keep a record of al the step/action progress, heres
      // where we'd set stuff up
      this.procValidator(this.proc, true)
        .then((pre) => {
          this.prereq = { tools:pre.tools, consumables:pre.consumables };
          if (pre.prereqs != undefined) {
            this.applyPrerequisites(pre.prereqs);
          }
          if (pre.inputs != undefined) {
            this.applyInputs(pre.inputs);
          }
          this.events.emit('procStart', this);
          next(this.intro);
        })
        .catch(e => {
          reject(e);
        });
    });

    //
    // we're being asked to end, so lets ensure we emit the (optional) conclusion section.
    //
    this.end = () => new Promise((next, reject) => {

      this.action = undefined;
      this.step = undefined;
      this.outro = getResourceText(this.proc.conclusion, this.variables);

      // user is signalling we are done, so clean up anything we need to
      //
      this.procValidator(this.proc, false)
        .then((pre) => {
          this.events.emit('procEnd', this);
          next(this.outro);
        })
        .catch(e => {
          reject(e);
        });
    });

    //
    // we're being given proof of condition/work
    //
    this.pushInput = (input) => {

      if (this.action != undefined && this.action.details != undefined) {

        // we should first of all check that the input is value
        if (this.action.details.type != input.type) {
          return false;
        }

        if (this.action.details.pending == undefined)
          this.action.details.pending = {};

        // we may need to capture multiple samples
        if (this.validateActionInputs()) {
          var myID = this.action.details.id;
          if (this.action.details.pending[myID] == undefined)
            this.action.details.pending[myID] = [];

          var mintries = this.action.details.minCaptures || 1;
          var maxtries = this.action.details.maxCaptures;
          
          if (maxtries == undefined || this.action.details.pending[myID].length < maxtries) {
            this.action.details.pending[myID].push(input);
            me.variables[myID] = input.response;
            
            //go around until we have min collected
            if (this.action.details.pending[myID].length >= mintries) 
              return true;
          }
        }
      } else if (this.input != undefined) { //procedure-level inputs (note we only deal with one)
        var myID = this.input.id;  
        if (this.input.pending == undefined) this.input.pending = {};
        if (this.input.pending[myID] == undefined) this.input.pending[myID] = [];
        this.input.pending[myID].push(input);
        me.variables[myID] = input.response;
        return true;
      }

      return false;

    };

    //
    // we're being given proof of condition/work
    //
    this.proof = (reason, proof) => new Promise((next, reject) => {

      if (this.step != undefined && this.step.ack != undefined && this.step.ack.proof != undefined) {

        // we should forst of all check that the proof requested has been delivered
        // proof is a array, so let's count the number of response elements
        if (this.step.ack.proof.length > proof.length) {
          reject({ msg: 'insufficient proof items provided (' + proof.length + '/' + this.step.ack.proof.length + ')', proof: this.step.ack.proof });
          return;
        }

        this.step.ack.proof.pending = proof;

        var proofInfo = { event: reason.event, reason: reason.reason, step: this.step, proof: proof };
        this.events.emit('stepProofDelivered', proofInfo);

        next(reason);
      } else
        reject({ msg: 'error: step is not looking for proof' });
    });


    //
    // we're being TOLD to end/abort for a reason
    //
    this.halt = (reason) => new Promise((next, reject) => {

      if (this.step != undefined) {
        this.step.ref.status = 'halt';
          
        var haltInfo = { event: reason.event, reason: reason.reason, step: this.step, proc:this };
        this.events.emit('procHalt', haltInfo);

        this.action = undefined;
        this.step = undefined;
        next(haltInfo);
      } else {
        reject('no valid step')
      }
    });

    //
    // we're pausing for a reason
    //
    this.pause = (reason) => new Promise((next, reject) => {

      var pauseInfo = { event: reason.event, reason: reason.reason, step: this.step, action: this.action };
      if (this.step != undefined) {
        this.step.ref.status = 'hold';
        this.events.emit('procPause', pauseInfo);
      }
      next(pauseInfo);
    });

    //
    // we're starting again (no reason required)
    //
    this.resume = (auto) => new Promise((next, reject) => {

      //
      // special POC2 hack until we get the sxsl writer putting step status into the sxsl when generated
      // for now, if we resume (say) step 3, we will automatically go and mark previous steps/statements (1,2) as 'done'
      // this will then ensure the player does not try to do these steps again. 
      //
      // use this carefully, for demos only!
      //
      if (auto != undefined && auto == true) {

        var p = this.proc;
        var s = this.step;
        for (var i = 0; i < p.statements.length; i++) {
          var statement = p.statements[i];
          if (statement._index == s.ref._index) {
            console.log("found the step we're on", s);
            break;
          }
          else
            statement.status = "done";
        }
      }
      //
      // end of special demo hack - remember to remove this code
      //
      
      this.step.ref.status = 'pending';
      var pauseInfo = { event: "resume", step: this.step, action: this.action };
      this.events.emit('procResume', pauseInfo);

      next(pauseInfo);
    });

    // 
    // scan all steps and actions for any tools that are referenced
    //
    this.getToolList = (aid) => {
        
      var tools  = [];
      var anchor = this.anchor;  
      var p = this.proc;
      p.steps.forEach(function (step, idx) {
        step.actions.forEach(function(action) {
          if ((aid === undefined || action.id === aid) &&                                  
             (action.tools != undefined)) {
          
            action.tools.forEach(function(tool) {
              tools.push( {
                          name: tool.name, 
                            id: tool.id, 
                          info: tool.extras != undefined ? tool.extras.resources.filter(function(v) { return v.mimeType=='text/plain';}).map(v => { return v.text }) : undefined,
                           img: tool.extras != undefined ? tool.extras.resources.filter(function(v) { return v.mimeType=='image/jpeg';}).map(v => { return anchor + v.url }) : undefined
              } );
            });
          }
        })
      });
      return tools;    
    }
    
    //
    // rollup material consumption at the step and proc level
    //
    this.consume = (materials, step) => {
        
      function gather(x,material) {  
        // we collect based on material id  
        if (x.consumed == undefined) 
          x.consumed = {}; 
      
        if (x.consumed[material.id] == undefined) {
          
          // add a new record  
          x.consumed[material.id] = { 
            amount: material.amountConsumed, 
             units: material.unitsOfConsumption != undefined ? material.unitsOfConsumption.resources.filter(v => { return v.mimeType=='text/plain'}).map(v => { return v.text })[0]: "" 
          };
        } else {
          // add to the record
          
          // should we assume its the same units for the same  
          x.consumed[material.id].amount += material.amountConsumed;   
        } 
      } 
      
      var proc = this;
      materials.forEach(function(material) {
        gather(step, material);
        gather(proc, material);
      });
  
    }
    
    // 
    // scan all steps and actions for any tools that are referenced
    //
    this.getConsumables = (aid) => {
        
      var materials = [];
      var anchor = this.anchor;  
      var p = this.proc;
      p.steps.forEach(function (step, idx) {
        step.actions.forEach(function(action) {
          if ((aid === undefined || action.id === aid) &&                                  
             (action.materials != undefined)) {
          
          action.materials.forEach(function(material) {
            let sub = material.asset;                     
            let asset = this.context != undefined ? this.context[sub.contextId].assets[sub.assetId] : {};
            
            materials.push( {
                           // should realy check the name is specified and have a proper function to ge tthis info
                          name: material.name.resources.filter(function(v) { return v.mimeType=='text/plain';}).map(v => { return v.text })[0],
                        amount: material.amountConsumed,
                         units: material.unitsOfConsumption != undefined ? material.unitsOfConsumption.resources.filter(v => { return v.mimeType=='text/plain'}).map(v => { return v.text })[0]: "",
                            id: sub != undefined ? sub.assetId : undefined, 
                          info: asset.resources != undefined ? asset.resources.filter(function(v) { return v.mimeType=='text/plain';}).map(v => { return v.text }) : undefined,
                           img: asset.resrouces != undefined ? asset.resources.filter(function(v) { return v.mimeType=='image/jpeg';}).map( v => { return anchor + v.url }) : undefined
              } );
            });
          }
        })
      });
      return materials;    
    }
    
    // 
    // scanan all steps and actions for any subject(hero) references
    // we will return these in the form {model:name, path:idpath, label:id}
    //
    this.getSubjects = (aid) => {
        
      var subjects = [];
      var anchor = this.anchor;  
      var p = this.proc;
      p.steps.forEach(function (step, idx) {
        step.actions.forEach(function(action) {
          if ((aid === undefined || action.id === aid) &&                                  
             (action.subjects != undefined)) {
          
            action.subjects.forEach(function(subject) {
              let sub = subject;                     
              let asset = this.context != undefined ? this.context[sub.contextId].assets[sub.assetId] : {};
            
              subjects.push( {
                          // should realy check the name is specified and have a proper function to ge tthis info
                          model:subject.assetId,
                          path:"/" 
              });
            });
          }
        })
      });
      return subjects;    
    }
    
    this.applyInputs = function (data) {
      if (data == undefined)
        return;
      // walk down the procedure structure looking for inputs
      // we can have proc-level inputs (proc.inputs) and per-action inputs (details)
      // each _should_ be unique within the scope of the procedure
      
      // lets start with the proc
      if (this.inputs != undefined) {
        var iname = this.inputs[0].name;
        function findnamed(v) { return v.name == iname };
        var pre = data.filter(findnamed); //only deal with the first for now
        if (pre != undefined) {
          this.inputs.response = {};
          this.inputs.response[iname] = pre;  
        }  
      }
      // then do the same for all actions in all the steps
      this.proc.steps.forEach(function(step) {
        step.actions.forEach(function(action) {
          if (action.details != undefined) {
            var aname = action.details.name;                       
            function findnamed(v) { return v.name == aname };
            var pre = data.filter(findnamed);
            if (pre != undefined) {
              action.details.response = {};
              action.details.response[aname] = pre;  
            }  
          }
        });
      });
      me.addVariables(data);    
    }
    
    this.addVariable = function(name,value) {
      me.variables[name] = value;
    } 
    
    this.addVariables = function(data) {
      if (data != undefined) data.forEach(function(v) {
        me.variables[v.name] = v.value;
      })
    } 

    this.getNamedVariable = function(name) {
      function findvar(v) { return v.name == name };
      return me.variables != undefined ? me.variables.filter(findvar) : undefined;
    }
    
    this.applyPrerequisites = function (data) {
      if (data == undefined)
        return;
            
      var prelist = data;
        
      //otherwise iterate through the list matching id to statement id            
      if (prelist != undefined && prelist.length > 0) {
        prelist.forEach(function(s) {
          for (var j=0; j<me.statementcount; j++) {                
            if (me.proc.statements[j] != undefined && s.statementId != undefined && me.proc.statements[j].id == s.statementId) {
              me.proc.statements[j].status = s.status;              
              me.proc.statements[j].pass = s.pass;  
              break;
            }
            if (me.proc.statements[j] != undefined && s.stepId != undefined && me.proc.statements[j].stepId == s.stepId) {
              me.proc.statements[j].status = s.status;              
              me.proc.statements[j].pass = s.pass;  
              break;
            }
            if (me.proc.statements[j] != undefined && s.actionId != undefined) {
              //lets look at all the step and see if this action exists; if it does, set the status at the STEP level
              //first, lets find the step
              var actionFound = false;
              for(var i=0; i<me.proc.steps.length; i++) {
                if (me.proc.steps[i].id == me.proc.statements[j].stepId) {
                  let step = me.proc.steps[i];      
                  //now lets see if this action exists
                  for (var a=0; a<step.actions.length; a++) {
                      if (step.actions[a].id == s.actionId) {
                        // we found it!!!!  We actually set the status at the statement level
                        actionFound = true;  
                        me.proc.statements[j].status = s.status;              
                        me.proc.statements[j].pass = s.pass;  
                        break; // out of this action forloop
                      }
                  }
                }
                if (actionFound) break; // out of the step forloop
              }
            }
          }
        })
      }
    };

    //
    // get a linked list of steps - we actually get the statements and the steps they refer to
    //
    this.getStepList = (includeDone) => {

      // an item is executable if it has no pre-requisites OR all pre-reqs are maked as done
      function canExec(statement, statements, execlist) {
        var can = true;
        if (execlist != undefined && statement.prereq != undefined) statement.prereq.forEach(function (req) {
          if (execlist[req] != undefined && execlist[req].statement.status != "done")
            can = false;
        });
        return can;
      }

      var steplist = [];
      var p = this.proc;
      var me = this;
      me.statementscompleted = 0;
      p.statements.forEach(function (statement, idx) {

        // can be useful, later...
        statement._index = idx;

        var done = (statement.status == "done") || false;
        if (done) me.statementscompleted += 1;
        
        if (done && includeDone != undefined && includeDone == false) {
        } else
          for (var stp = 0; stp < p.steps.length; stp++) {
              
            var step = p.steps[stp];
            // only add it if we can jump to and execute it
            if (statement.stepId == step.id && canExec(statement, p.statements, me.execlist)) {

              var title = step.title ? getResourceText(step.title) : statement.stepId;
              var done  = (statement.status == "done") || false;
              var pass  = done ? statement.pass : undefined;
              
              steplist.push({
                idx: idx,
                display: title,
                status: statement.status,
                pass: pass,
                done: done
              });
              break;
            }
          }
      });

      return steplist;
    };

    this.validateActionInputs = (input) => {

      if (me.action == undefined || me.action.details == undefined) {
        return false;
      }

      if (me.action.details.required == undefined || me.action.details.required == true) {
        // input is required, so lets check it matches 
      }
      
      var mintries = me.action.details.minCaptures || 0;
      if (input != undefined && input[me.action.details.id] != undefined && input[me.action.details.id].length < mintries) {
        console.log('being asked to collect at least',mintries,'samples of',me.action.details.id,input[me.action.details.id].length);
        return false;
      }
      
      //we've passed all the tests
      return true;
    }

    //
    // iterate through the step lists - the paremeter here is (effectively) a key press value that can be prompted
    // e.g. if we have 3 error codes a,b,c, we can ask the user to choose a,b or c.  Passing the correct option will
    // ensure the procedure can continue
    //
    this.next = (response, jumpRef) => new Promise((next, reject) => {
                                                   
      //handle procedure level inputs - are we waiting on one?
      if (me.input != undefined && me.input.response == undefined) {
          
        //if one is pending, is it mandatory?  
        if (me.input.pending == undefined && me.input.required == true) {
          me.events.emit('procInputPending', me.input);
          reject({cmd:'input'});
          return;  
        } 
        //otherwise, process the results and allow the plyer to move on
        else if (me.input.pending != undefined) {
          me.input.response = me.input.pending; // return the last pushed value
          me.input.pending  = undefined;  
          var iid = Object.keys(me.input.response)[0]; //we;re only handling the first one
          me.events.emit('procInputDelivered', { event: "input", 
                                                  proc: me.id, 
                                                  name: iid, 
                                                 value: me.input.response[iid] } );
        }
      }
    
      //the player will step through each action of each step, until
      //it reaches the end of the procedure
      //
      if (me.action != undefined) {

        // have we actually completed the previous action?  if there was a pending input, did we get it?
        if (jumpRef == undefined && me.action.details != undefined) {

          if (me.action.details.required == true && (me.action.details.pending == undefined || !this.validateActionInputs(me.action.details.pending))) {
            //
            // reject (await input)
            reject({ cmd: 'input', msg: 'action requires input' });
            return;
          }
          
          if (me.action.details.pending) {
            //
            // prepare responses for action processor
            me.action.details.response = me.action.details.pending;
            me.action.details.pending = undefined;

            me.events.emit('actionInputDelivered', { event: "input", 
                                                      step: this.step, 
                                                    action: this.action, 
                                                      name: me.action.details.id, 
                                                     value: me.action.details.response[me.action.details.id] } );
          }
        }
        
        // consume materials
        if (jumpRef == undefined && me.action.materials != undefined)
          me.consume(me.action.materials, me.step.ref);

        // and signal we're done with this action
        me.events.emit(jumpRef != undefined ? 'actionBypass' : 'actionEnd', me.action);
      }

      // are we iterating steps, or actions within a step
      //
      if (me.aci <= 0) {

        // we've reached the end of the actions, so this is the end of the step  
        me.action = undefined;
        if (me.step != undefined) {

          //if there  are acknowledgements defined, work out the keystrokes we can request
          if (jumpRef == undefined && me.step.ack != undefined) {

            if (me.step.ack.response == undefined) {
              var keyreq = [];
              switch (me.step.ack.type) {
                case 'Confirmation':
                  keyreq = ['y'];
                  break;
                case 'PassFail':
                  if ((me.step.ack.reasonType === undefined || me.step.ack.reasonType === "Generic"))
                    keyreq = ['p', 'f'];
                  else if (me.step.ack.reasonType === "Text")
                    keyreq = ['p', 'f'];
                  else {

                    // add p=pass      
                    keyreq.push('p');

                    // and add the codes to mean fail
                    // the type could be text/code - lets just use the code for now    
                    me.step.ack.reasonCodes.forEach(function (ec) {
                      keyreq.push(ec.code);
                    });
                  }
                  break;
                default:
                  console.log('incorrect sxsl specification : acknowledgement must hae associated type');
                  break;
              }

              // process the incoming response; if the user hasnt already pressed the correct key...
              if (keyreq.length > 0 && !keyreq.includes(response)) {

                //
                // inform caller of step completion requirements
                me.events.emit('stepCompletionPending', me.step);

                //
                // and reject (await confirmation)
                reject({ cmd: 'ack', msg: 'press ' + keyreq });
                return;
              }

              // prepare responses for action processor
              me.step.ack.response = response;
            }

            //finally, prcess any proof request
            if (me.step.ack.proof != undefined) {

              var keyreq = [];
              if (me.step.ack.proof.response == undefined) {
                keyreq = ['@'];
                console.log("need proof", me.step.ack.proof);
              }

              // process the incoming response; if the user hasnt already pressed the correct key...
              if (!keyreq.includes(response)) {

                //
                // inform caller of step completion requirements
                me.events.emit('stepProofPending', me.step.ack.proof);

                //
                // and reject (await confirmation)
                reject({ cmd: 'proof', msg: 'press ' + keyreq });
                return;
              }

              // prepare responses for action processor
              me.step.ack.proof.response = me.step.ack.proof.pending;
              me.step.ack.proof.pending = undefined;
            }

          } else {
            me.events.emit('stepCompletionPending', me.step);
          }

          // unless we're bypassing this mark the step as complete
          if (jumpRef == undefined) {
            me.step.ref.status = "done";
            me.step.ref.pass   = me.step.ack == undefined ? "Implied" : me.step.ack.type == "PassFail" ? me.step.ack.response == "p" ? "Passed" : "Failed" : "Confirmed";
          }
        
          // is there any closeout required on the previous step?  
          // let folks know we've reached the end of the step
          me.events.emit(jumpRef != undefined ? 'stepBypass' : 'stepEnd', me.step);
        }

        // if configured, we need to do a remote check to see if we are ok to move to the next step
        me.stepValidator(me.step, jumpRef)
          .then((newJumpRef) => {

            // now move to next step
            // console.log('iterating steps');  
            //
            me.stepRef = me.nextStatement(newJumpRef || {jumpRef:jumpRef});
            if (me.stepRef != undefined) {

              //find the next step in the step bucket  
              //
              for (var stp = 0; stp < me.proc.steps.length; stp++) {
                if (me.stepRef.stepId == me.proc.steps[stp].id) {

                  me.step = new this.sxslStep(me.proc.steps[stp], me);
                  me.aci = me.step.actioncount;

                  me.stepRef.status = "pending";
                  me.events.emit('stepStart', me.step);
                }
              }

              /// and go
              me.nextAction(next, reject);

            }
            else {
              //console.log('reached end of all steps');
              reject({ cmd: 'end' });
              return;
            }
          })
          .catch((reason) => {
            console.log(reason);
            reject({ cmd: 'validationFail', msg: reason });
            return;
          });

      } else {

        // we're all ready to move on
        me.nextAction(next, reject);
      }
    });

    this.nextAction = function (next, reject) {

      //magic case of step with no actions (is this even allowed?)                                          
      if (me.step.actioncount === 0) {
        //create a dummy action  
        var dummyaction = new this.helper.sxslAction({}, me.step, 0, true, me);
        // expose it
        next(dummyaction);
        me.action = undefined;
      }

      var idx = me.step.actioncount - (me.aci--);
      var act = me.step.actions[idx];
      if (act != undefined) {
        me.action = new this.helper.sxslAction(act, me.step, idx, me.aci == 0, me);

        // heads up - were starting a new action  
        me.events.emit('actionStart', me.action);

        // fire warning shot
        if (me.action.details != undefined) {

          // inform caller of step completion requirements
          me.events.emit('actionInputPending', me.action.details);
        }

        // and execute it - we actually defer this to an action processor ; we're just the scheduler...
        next(me.action);
      }
    };

    //
    // find the next statement - it might be we are being told to jump to a specific statement, or
    // we are iterating through the list.  if we jump around, we need to iterate through to find the
    // items we may have missed
    //
    this.nextStatement = function (jumpRef) {

      function goodToGo(statement, statements, execlist) {
        var goodtogo = true;
        var next = statement;

        // check each prerequisite to see if it has already been completed
        if (execlist != undefined && statement.prereq != undefined) statement.prereq.forEach(function (idx) {
          if (execlist[idx] != undefined && execlist[idx].statement.status != "done") {
              //recurse
              next = goodToGo(execlist[idx].statement,statements,execlist);
              if (next != undefined)
                return next; // drop out of recursion
              else
                goodtogo = false;   
          }
        });
        if (!goodtogo)
          next = undefined;

        return next;
      }
      
      if (jumpRef != undefined && jumpRef.prereqs)
        this.applyPrerequisites(jumpRef.prereqs);
      if (jumpRef != undefined && jumpRef.variables) {
        this.addVariables(jumpRef.variables);
      }
        
        
      // are we being told to go to a specific?
      var next = me.proc.statements[jumpRef.jumpRef];

      // if not, which is next? we should do "hold" item first
      if (next == undefined) {
        next = me.proc.statements[me.sti];

        //
        var donecount = 0;
        for (var i = 0; i < me.statementcount; i++) {

          var statement = me.proc.statements[i];
          if (statement.status == "done")
            donecount += 1;
          else if (statement.status == "hold") {
            next = statement;
            me.sti = i;
            break;
          }
        }

        if (donecount == me.statementcount)
          console.log('all done', donecount);

      }

      // can we execute this one yet?
      if (next != undefined)
        next = goodToGo(next, me.proc.statements, me.execlist);

      if (next == undefined || next.status == "done") {

        //do a quick check to see if all the items have been completed?
        next = undefined;

        //
        for (var i = 0; i < me.statementcount; i++) {

          var statement = me.proc.statements[i];
          if (statement.status != "done" && goodToGo(statement, me.proc.statements) != undefined) {
            next = statement;
            me.sti = i;
            break;
          }
        }
        
        if (next != undefined)
          next = goodToGo(next, me.proc.statements, me.execlist);

      }

      me.sti = jumpRef + 1 || me.sti + 1;
      if (next != undefined) console.log('moving to', next);

      return next;
    }

    //
    // read sxsl from a file
    //
    this.fromFile = function (fi) {
      return new Promise(function (loaded, error) {
        me.sti = 0;
        me.aci = 0;
        me.proc = JSON.parse(fs.readFileSync(fi, 'utf8'));
        me.id = me.proc.id;
        me.title = getResourceText(me.proc.title);
        me.versionInfo = me.proc.versionDisplayName != undefined ? me.proc.versionDisplayName : undefined;
        me.published = me.proc.publishDate != undefined ? new Date(me.proc.publishDate) : undefined;
        me.thumbnail = me.proc.thumbnail != undefined ? me.anchor + me.proc.thumbnail : me.proc.thumbnail;
        // we can have procedure, step and action=level contexts, so we capture and pass these down
        me.context = me.proc.contexts != undefined ? me.proc.contexts : me.context;
        me.inputs = me.proc.inputs;
        me.variables = [];
        me.statementcount = me.proc.statements.length;
        me.statementscompleted = 0;
        if (me.statementcount > 0) {
          me.execlist = {};
          //if the proc is more generally set to 'odered' the fill in any missing prerequisites that would be used for ordered traversal
          if (me.proc.ordered != undefined && me.proc.ordered == true) for (var i=0; i< me.statementcount; i++) {
            var s = me.proc.statements[i];  
            if (s.id == undefined) s.id = "ordered"+i;
            if (i > 0 && s.prereq == undefined) s.prereq = [ me.proc.statements[i-1].id ];
          }                                     
          me.proc.statements.forEach(function(s,i) {
            if (s.id != undefined) {
              me.execlist[s.id] = {statement:s, index:i };
            }
          })                                     
          loaded(me);
        }
        else
          error(fi);
      });
    };

    //
    // read sxsl froma json data buffer (string)
    //
    this.fromData = function (data) {
      return new Promise(function (loaded, error) {
        me.sti = 0;
        me.aci = 0;
        me.proc = data;
        me.id = me.proc.id;
        me.title = getResourceText(me.proc.title);
        me.versionInfo = me.proc.versionDisplayName != undefined ? me.proc.versionDisplayName : undefined;
        me.published = me.proc.publishDate != undefined ? new Date(me.proc.publishDate) : undefined;
        me.thumbnail = me.proc.thumbnail != undefined ? me.anchor + me.proc.thumbnail : me.proc.thumbnail;
        // we can have procedure, step and action=level contexts, so we capture and pass these down
        me.context = me.proc.contexts != undefined ? me.proc.contexts : me.context;
        me.input = me.proc.inputs != undefined ? new me.helper.sxslInput(me.proc.inputs[0]) : undefined;//me.proc.inputs;
        me.variables = [];
        me.statementcount = me.proc.statements.length;
        me.statementscompleted = 0;
        if (me.statementcount > 0) {
          me.execlist = {};
          //if the proc is more generally set to 'odered' the fill in any missing prerequisites that would be used for ordered traversal
          if (me.proc.ordered != undefined && me.proc.ordered == true) for (var i=0; i< me.statementcount; i++) {
            var s = me.proc.statements[i];  
            if (s.id == undefined) s.id = "ordered"+i;
            if (i > 0 && s.prereq == undefined) s.prereq = [ me.proc.statements[i-1].id ];
          }                                     
          me.proc.statements.forEach(function(s,i) {
            if (s.id != undefined) {
              me.execlist[s.id] = {statement:s, index:i };
            }
          })                                     
          loaded(me);
        }
        else
          error(data);
      });
    };

  }

}
