//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//steve's sxsl player helper library
//
function sxslHelper(renderer, anchor) {

  this.anchor = anchor;
  this.renderer = renderer;

  this.sxslAction = function (a, s, i, last, e) {
    this.step = s;
    this.stepid = s.id;
    this.index = i;
    this.events = e;
    this.isFirst = (i == 0);
    this.isLast = (last == true);
    this.introtext = (i == 0) ? s.intro : undefined;
    this.outrotext = (last == true) ? s.outro : undefined;

    // we can have procedure, step and action=level contexts, so these get passed down
    this.context = a.contexts != undefined && a.contexts.length > 0 ? a.contexts[0] : s.context;

    this.ack  = s.ack;
    this.type = a.type;
    this.details   = a.details;
    this.materials = a.materials;

    this.subjects = undefined;
    var subcount = a.subjects != undefined ? a.subjects.length : 0;
    if (subcount > 0) {
      this.subjects = [];
      if (a.subjects != undefined) {
        for (var subc = 0; subc < subcount; subc++) {
          var sub = a.subjects[subc];

          // semantic or resource references?  semantic references come from context
          if (this.context != undefined) {

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
            this.subjects.push({ context: fctx, asset: asset, id: sub.assetId });
          } else {
            //no context, so is the resource defined inline?
            this.subjects.push({ asset: sub, id: sub.assetId });
          }
        }
      }
    }

    // same for annotations
    this.annotations = undefined;
    var subcount = a.annotations != undefined ? a.annotations.length : 0;
    if (subcount > 0) {
      this.annotations = [];
      if (a.annotations != undefined) {
        for (var subc = 0; subc < subcount; subc++) {
          var sub = a.annotations[subc];
          // idealy we will look these up from the context store  
          // work out the final context for this specific action
          if (this.context != undefined) {
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
            this.annotations.push({ context: fctx, asset: asset, id: sub.assetId });
          }
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
          }
          this.tools.push({
            name: tool.name,
            id: tool.id,
            mime: tool.extras != undefined ? tool.extras.resources[0].mimeType : undefined,
            text: tool.extras != undefined ? tool.extras.resources[0].text : undefined,
            context: context,
            asset: asset
          }
          );
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
            desc: ref.description != undefined ? ref.description.resources[0].text : ""
          });
        }
      }
    }

    this.id = a.id;
    this.instruction = a.instructions != undefined ? a.instructions.resources[0].text : undefined;

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
    this.title = s.title != undefined ? s.title.resources[0].text : undefined;
    this.intro = s.introduction != undefined ? s.introduction.resources[0].text : undefined;
    this.outro = s.conclusion != undefined ? s.conclusion.resources[0].text : undefined;

    // we can have processordure, step and action=level contexts, so we capture and pass these down
    this.context = s.contexts != undefined && s.contexts.length > 0 ? s.contexts[0] : c;
    this.ack = s.acknowledgement != undefined ? s.acknowledgement : undefined;

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
      this.step = undefined;
      this.intro = this.proc.introduction != undefined ? this.proc.introduction.resources[0].text : undefined;

      // here we would likely do some sanity checks, clean up internal data
      // e.g. if we were to keep a record of al the step/action progress, heres
      // where we'd set stuff up
      this.procValidator(this.proc, true)
        .then((pre) => {
          this.prereq = pre;
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
      this.outro = this.proc.conclusion != undefined ? this.proc.conclusion.resources[0].text : undefined;

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
        if (this.validateActionInputs(input)) {
          var myID = this.action.details.ID;
          if (this.action.details.pending[myID] == undefined)
            this.action.details.pending[myID] = [];

          var mintries = this.action.details.minCaptures != undefined ? this.action.details.minCaptures : 0;
          if (this.action.details.pending[myID].length <= mintries) {
            this.action.details.pending[myID].push(input);
            return true;
          }
        }
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
        var haltInfo = { event: reason.event, reason: reason.reason, step: this.step };
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

      var pauseInfo = { event: reason.event, reason: reason.reason, step: this.step };
      if (this.step != undefined)
        this.events.emit('procPause', pauseInfo);

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

      var pauseInfo = { event: "resume", step: this.step };
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
                           img: tool.extras != undefined ? tool.extras.resources.filter(function(v) { return v.mimeType=='image/jpeg';}).map( v => { return anchor + v.url }) : undefined
              } );
            });
          }
        })
      });
      return tools;    
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
    // get a linked list of steps - we actually get the statements and the steps they refer to
    //
    this.getStepList = (includeDone) => {

      // an item is executable if it has no pre-requisites OR all pre-reqs are maked as done
      function canExec(statement, statements) {
        var can = true;
        if (statement.prereq != undefined) statement.prereq.forEach(function (req) {
          if (statements[req].status != "done")
            can = false;
        });
        return can;
      }

      var steplist = [];
      var p = this.proc;
      p.statements.forEach(function (statement, idx) {

        // can be useful, later...
        statement._index = idx;

        var done = (statement.status == "done") || false;
        if (done && includeDone != undefined && includeDone == false) {
        } else
          for (var stp = 0; stp < p.steps.length; stp++) {

            // only add it if we can jump to and execute it
            if (statement.stepId == p.steps[stp].id && canExec(statement, p.statements)) {

              var title = p.steps[stp].title ? p.steps[stp].title.resources[0].text : statement.stepId;
              steplist.push({
                idx: idx,
                display: title,
                status: statement.status,
                done: (statement.status == "done") || false
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

      //we've passed all the tests
      return true;
    }

    //
    // iterate through the step lists - the paremeter here is (effectively) a key press value that can be prompted
    // e.g. if we have 3 error codes a,b,c, we can ask the user to choose a,b or c.  Passing the correct option will
    // ensure the procedure can continue
    //
    this.next = (response, jumpRef) => new Promise((next, reject) => {

      //the player willl step through each action of each step, until
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

          //
          // prepare responses for action processor
          me.action.details.response = me.action.details.pending;
          me.action.details.pending = undefined;

          me.events.emit('actionInputDelivered', { event: "input", step: this.step, action: this.action });

        }

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
              }

              // process the incoming response; if the user hasnt already pressed the correct key...
              if (!keyreq.includes(response)) {

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

          // unless we're bypassing this, mark the step as complete
          if (jumpRef == undefined)
            me.step.ref.status = "done";

          // is there any closeout required on the previous step?  
          // let folks know we've reached the end of the step
          me.events.emit(jumpRef != undefined ? 'stepBypass' : 'stepEnd', me.step);
        }

        // if configured, we need to do a remote check to see if we are ok to move to the next step
        me.stepValidator(me.step, me.step != undefined ? me.step.ack : undefined)
          .then((newJumpRef) => {

            // now move to next step
            // console.log('iterating steps');  
            //
            me.stepRef = me.nextStatement(jumpRef);
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
        var dummyaction = new this.helper.sxslAction({}, me.step, 0, true, me.events);
        // expose it
        next(dummyaction);
        me.action = undefined;
      }

      var idx = me.step.actioncount - (me.aci--);
      var act = me.step.actions[idx];
      if (act != undefined) {
        me.action = new this.helper.sxslAction(act, me.step, idx, me.aci == 0, me.events);

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

      function goodToGo(statement, statements) {
        var goodtogo = true;
        var next = statement;

        // check each prerequisite to see if it has already been completed
        if (statement.prereq != undefined) statement.prereq.forEach(function (idx) {
          if (statements[idx].status != "done")
            goodtogo = false;
        });
        if (!goodtogo)
          next = undefined;

        return next;
      }

      // are we being told to go to a specific?
      var next = me.proc.statements[jumpRef];

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
        next = goodToGo(next, me.proc.statements);

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
        me.title = me.proc.title != undefined ? me.proc.title.resources[0].text : undefined;
        me.thumbnail = me.proc.thumbnail != undefined ? me.anchor + me.proc.thumbnail : me.proc.thumbnail;
        // we can have procedure, step and action=level contexts, so we capture and pass these down
        me.context = me.proc.contexts != undefined ? me.proc.contexts : me.context;
        me.statementcount = me.proc.statements.length;
        if (me.statementcount > 0) {
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
        me.title = me.proc.title != undefined ? me.proc.title.resources[0].text : undefined;
        me.thumbnail = me.proc.thumbnail != undefined ? me.anchor + me.proc.thumbnail : me.proc.thumbnail;
        // we can have procedure, step and action=level contexts, so we capture and pass these down
        me.context = me.proc.contexts != undefined ? me.proc.contexts : me.context;
        me.statementcount = me.proc.statements.length;
        if (me.statementcount > 0) {
          loaded(me);
        }
        else
          error(data);
      });
    };
  }


}
