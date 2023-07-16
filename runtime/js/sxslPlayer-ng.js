if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'sxslplayer-ng';
}

(function () {
  'use strict';

  var sxslPlayerModule = angular.module('sxslplayer-ng', []);
  sxslPlayerModule.directive('ngSxslplayer', ['$timeout', '$http', '$window', '$rootScope', '$injector', '$interval', ngSxslplayer]);

  function ngSxslplayer($timeout, $http, $window, $rootScope, $injector, $interval) {

    return {
      restrict: 'EA',
      scope: {
         loggingField : '@',
        disabledField : '@',
        physicalField : '@',
        resourceField : '@',
      reasoncodeField : '@',
            holoField : '@',
          canrunField : '=',
         runningField : '=',
           clockField : '=',
         contextField : '=',
          statusField : '=',
        steplistField : '=',
        delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { name: undefined, 
                   disabled: false,
                     isHolo: false,
                        src: undefined, 
                    context: undefined,
             loggingEnabled: false,
                 reasonCode: {}, 
                   steplist: [], 
                   physical: true,
                     anchor: "",
                      guide: "",
                  firstStep: true,
                       pois: []
                   };
             
        scope.renderer    = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        scope.helper      = new sxslHelper(scope.renderer,scope.data.anchor);
        scope.canrunField = false;
        scope.runningField= false;
        
        var startSxslPlayer = function() {
            
          var eventHandler = { 
              on: function(evt,fn)  { return scope.$parent.$on(evt,fn) }, 
            emit: function(evt,arg) { return scope.$parent.$emit(evt,arg) } 
          };

          scope.logger = new scope.data.logger();
          scope.player = new scope.helper.sxsl2Player(eventHandler,scope.helper,scope.helper.validate)
          .fromData(scope.data.sxsl)
          .then( (proc) => { 
                
             console.log('loaded',proc.getStepList().length,'steps');
             scope.canrunField = true;  
             scope.runningField = true;
             
             var eps = proc.events.on('procStart',  function(evt,proc)   { 
               scope.setHeadLabel(proc.title);
               scope.steplistField = proc.getStepList();

               scope.logger.push( { id: proc.id, 
                                 event: "procstart",
                                  time: Date.now()
                                } );
               console.log('<<<<<<<<<<<<<<<<<<<<<<<\nstarting proc',proc.id,proc.intro);
             });
                 
             var eps = proc.events.on('stepStart',  function(evt,step)   { 
               console.log('+++++++++++++++++++++++\nstarting step',step.id,step.title);
               scope.setHeadLabel(step.title);
               scope.setStepLabel(proc.sti + " OF " + proc.statementcount);

               scope.startStepTimeClock(step,scope.ticker,scope);

               scope.logger.push( { id: step.id,
                                 event: "stepstart",
                                  time: Date.now()
                                } );
                   
               if (scope.data.firstStep) {
                 scope.data.firstStep = false;
                   
                 expandContract();

                 scope.addNamedPOI('context',scope.data.context.model,undefined,undefined,scope.data.context.scale,false,scope.data.context);
 

               }
             });
                 
             var epe = proc.events.on('procEnd',  function(evt,proc)   { 
               console.log('ending proc',proc.id+'\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
               
               scope.setHeadLabel(proc.title);
               scope.canrunField  = false;
               scope.runningField = false;
               
               scope.logger.push( { id: proc.id, 
                                 event: "procend",
                                  time: Date.now()
                                } );
                   
               //and signal termination    
               scope.$parent.$emit("finished");    
             });
                 
             var ese = proc.events.on('stepEnd',    function(evt,step) {
               scope.stopStepTimeClock(step);
               hidepassfail();
               
               //update the list
               scope.steplistField = proc.getStepList();

               scope.logger.push( { id: step.id,
                                 event: "stepend",
                                  time: Date.now(),
                              duration: Math.floor(step.ref.clock.elapsedTime/1000).toString(), // seconds
                                   ack: step.ack 
                                } );
               console.log('completing step',step.id+'\n---------------------------',step.outro);
             });
                 
             var epp = proc.events.on('procPause',    function(evt,reason)   {
               console.log('proc pause');
               scope.logger.push( { id: reason.step.id, 
                                 event: reason.event,  
                                  time: Date.now(), 
                                   ack: { response:reason.reason }
                                } );
             });
                 
             var epr = proc.events.on('procResume',    function(evt,reason)   {
               console.log('proc resume');
               scope.logger.push( { id: reason.step.id, 
                                 event: reason.event,  
                                  time: Date.now()
                              } );
               maximise();    
             });

             var eph = proc.events.on('procHalt',    function(evt,reason)   {
               console.log('halting proc\n============================');
               
               //stop the clock    
               scope.stopStepTimeClock(reason.step);
               scope.canrunField = false;
               
               scope.logger.push( { id: reason.step.id, 
                                 event: reason.event,  
                                  time: Date.now(), 
                                   ack: { response:reason.reason }
                               } );
               minimise();
                   
               //and signal termination    
               scope.$parent.$emit("terminated");    
             });
                 
             var espp = proc.events.on('stepProofPending',    function(evt,proof)   {
               console.log('step proof pending - please provide ',proof.length,'items');
               $timeout(function() { collectProof(proof); },10);
             });
                 
             var espd = proc.events.on('stepProofDelivered',  function(evt,proof)   {
               console.log('step proof delivered');
               scope.logger.push( { id: proof.step.id, 
                                 event: proof.event,  
                                  time: Date.now(), 
                                 proof: proof.proof
                                } );
             });
                 
             var eaip = proc.events.on('actionInputPending',    function(evt,input)   {
               console.log('action input pending');
             });
             var eaid = proc.events.on('actionInputDelivered',  function(evt,input)   {
               console.log('action input delivered');
               scope.logger.push( { id: input.step.id, 
                                 event: input.event,  
                                  time: Date.now(), 
                              response: input.action.input.response 
                        } );
             });
                 
             var escp = proc.events.on('stepCompletionPending',    function(evt,step)   {
               console.log('step completion pending');
               scope.stopStepTimeClock(step);

               var ack = step.ack;
               if (ack != undefined) {
                 if (ack.reasonCodes != undefined) 
                   scope.presentErrorCodes(ack.reasonCodes,undefined);
      
                 switch(ack.type) {
                   case "Confirmation": 
                     //twx.app.fn.triggerWidgetService('confirm', 'setq');
                     showverify();
                     break;
                   case "PassFail": 
                     if (ack.reasonType=="Code") showpasserrorcode();
                     else                        showpassfail();
                     break;
                   default: 
                    break;  
                 }
               }
                                       
             });

             var as = proc.events.on('actionStart',function(evt,action) { 
               console.log('action Start');
             });
                 
             var ae = proc.events.on('actionEnd',  function(evt,action) { 
               console.log('completing action',action.type); 
             });
             
             var abp = proc.events.on('actionBypass',function(evt,action) { 
               console.log('skipping action',action.type); 
             });
             
             var sbp = proc.events.on('stepBypass',  function(evt,step)   { 
               console.log('step bypass');
               hidepassfail();
               scope.stopStepTimeClock(step);

               scope.logger.push( { id: step.id, 
                                 event: "bypass",  
                                  time: Date.now(), 
                                   ack: undefined
                                } );
             });
             
             scope.actions = new scope.sxsl2Actions(scope.helper);
             
             proc.start()
             .then ( intro => {
               console.log('intro',intro);      
               
               if (scope.thumbnail) {
                 scope.thumbnail.src = proc.thumbnail;
               }
               scope.actions.start(intro);
               
               scope.input = function() {
                 var validated = scope.inputValidator();
                 if (validated != undefined) {
                   return proc.pushInput(validated); 
                 }
                 return false;
               };
      
               scope.proof = function(proof) {
                 proc.proof( {event:'proof'}, proof ) // this should fire procProofDelivered event
                     .then( () => {
                       //TODO : twx.app.fn.triggerWidgetService('proofRequired', 'resetq');
                       scope.next('@');
                     })
                     .catch( e => {
                       console.log(e.msg);
                     })
               };
      
               scope.resume = function(auto) {
                 proc.resume(auto) 
                     .then( (state) => {
          
                       // Restart Timer
                       scope.startStepTimeClock(state.step,scope.ticker,scope);
                       scope.runningField = true;
                     })
               };
            
               scope.halt = function(reason) {
                 proc.halt(reason) // this should fire procHalt event
                     .then( () => {
                           
                       // note we dont terminate immediately, but put up progress/done button
                       scope.data.results = scope.logger.sanitise();
                       scope.runningField = false;
                     })
                     .catch( e => {
                       console.log(e);
                     });
               };
               
               scope.pause = function(reason) {
                  proc.pause(reason) 
                      .then( (state) => {
                 
                        //twx.app.fn.triggerWidgetService('running', 'resetq');

                        // stop the timer
                        scope.stopStepTimeClock(state.step);
                        scope.runningField = false;
                      })
               };
            
               scope.next = function(k,j) {
                 proc.next(k,j)
                     .then(a => { 
          
                     //
                     // action processing
                     //
                 
                     if (a.type == undefined)
                       console.log('no action');
                     else
                       scope.actions.find(a.type)
                            .then ( (act) => { 
                              scope.inputValidator = act(a); 
                            })
                            .catch( (err) => {
                              console.log(err);
                            });


                     })
                     .catch( e => { 
                       if (e.cmd=='end') proc.end()
                                             .then( conclusion => {
                
                                               // finish things up
                                               scope.actions.end(conclusion);
                
                                               // TODO : let thingworx know? 
//                                               scope.statusField = scope.logger.sanitise();
                                               console.log('results:',JSON.stringify(scope.logger.results,null,' '));    
                                             })
                       else if (e.cmd=='ack') { 
                         // we are waiting for user input      
                         console.log(e.msg);
                         return;
                       }
                       else if (e.cmd=='proof') { 
                         // we are waiting for user input - proof of condition required      
                         console.log(e.msg);
                         return;
                       }
                       else if (e.cmd=='input') { 
                         // we are waiting for user input      
                         console.log(e.msg);
                         //twx.app.fn.triggerWidgetService('inputRequired', 'setq');
                         return;
                       } else {
                         console.log(e.msg); 
                
                         proc.halt(e.msg) // this should fire procHalt event
                             .then( () => {
                               scope.logger.submit("halt");
                             })
                   }
               
                 })

               };
               if (scope.data.isHolo) {
              
                 //hololens platform not supported at this time  
                 scope.canrunField = false;
               
                 scope.logger.push( { id: proc.id, 
                                   event: 'halt',  
                                    time: Date.now(), 
                                     ack: { response:'hololens platform unsupported' }
                               } );

                 scope.$parent.$emit("terminated");    
               }

             });
          });
        };
             
        var executesxslPlayer = function() {
          var active = scope.canrunField && scope.runningField;
          var sleepy = scope.canrunField && !scope.runningField;  
          if (!scope.data.disabled) {
            console.log('physical',scope.data.physical);
            scope.steplistField = scope.data.steplist;
            
            if (sleepy)
              scope.resume(true);
            
          } else {
            console.log('disabled');
            scope.contextField = '';
            scope.steplistField = undefined;
            
            if (active)
              scope.pause({reason:'widget disabled',event:'pause'});
          }
        };
        
        var halt = function() {
          console.log('halting for reason',scope.data.reasonCode);
          scope.data.disabled = true;
          scope.halt({reason:'halt',reason:scope.data.reasonCode});
        }
        var pause = function() {
          console.log('pausing for reason',scope.data.reasonCode);
          scope.data.disabled = true;
          scope.pause({reason:'halt',reason:scope.data.reasonCode});
          executesxslPlayer();
        }
        var next = function() {
            console.log('moving to next action');
            if (scope.canrunField == true) {
              if (scope.runningField == true && scope.next) 
                scope.next();
              else 
                scope.resume(true);
            }
            else 
              minimise()
        }
        
        // this is, for now, taking the photo directly.
        //
        // UI is provided to prompt the user to point the camera
        // in the right direction. Information is provided (guide images, text) that should
        // be displayed
        //
        var photoGrab = function() {
            scope.photoGrab();
        }
        var collectProof = function(required) {
            
            var collectedProof = [];
            scope.data.collecting = required;
            let numberToCollect = required.length;
            
            //call camera to get proof
            console.log('step proof pending - need to collect ',required.length,'items');
            
            var gatherProof = function() {
                showProof();
                var collect = (scope.data.collecting.length > 0) ? scope.data.collecting.pop() : undefined; // pop item off the arry
                if (collect != undefined) {
                    
                    //how the ui
                    var textHint = collect.instructions != undefined && 
                                   collect.instructions.resources != undefined && 
                                   collect.instructions.resources[0] != undefined ? collect.instructions.resources[0].text : "";
                    var imgHint  = collect.guides != undefined && 
                                   collect.guides[0] != undefined && 
                                   collect.guides[0].resources != undefined && 
                                   collect.guides[0].resources[0] != undefined ? scope.data.anchor + collect.guides[0].resources[0].url : "";
                    scope.setProofHints(textHint, imgHint);
            
                }
            }
            
            var photoSuccess = function (pngBase64String) {
                var proof = 'data:image/png;base64,' + pngBase64String; 
                collectedProof.push(proof);
                
                if (collectedProof.length == numberToCollect) {
                  maximise();
                  hideProof();  
                  scope.proof(collectedProof);
                }
                else 
                  gatherProof();
            };
              
            var photoCancel = function () {
                maximise();
                scope.proof(undefined);//not sure what to do here
            };
            
            scope.photoGrab = function() {
              hideProof();
              var params = {withAugmentation:true, imageWidth:640, imageHeight:480};   
              //  params = { dataURL:bool, withAugmentation: bool, imgFormat: string, imgWidth: number, imgHeight:number} 
              scope.renderer.takeScreenshot(params, photoSuccess, photoCancel);
            }
            
            //minimse the main UI
            minimise();
            //show the helper UI
            gatherProof();
        }
        var selectedErrorCode = function() {
          var value = scope.errorcodelistWindow.value;
          //console.log('you clicked',value);
          
          if (value != undefined) {

            // if we have children, we show them
            //
            var kids = scope.presentErrorCodesAsHTML(scope.data.errorcodes,value);
            
            if (kids.length > 0) {  //there's always 1 line be default 
                scope.errorcodelistWindow.innerHTML = kids;
            }
            //
            // otherwise submit this code
            else {
              scope.next(value);
              // Reset selected item for next steps
              scope.errorcodelistWindow.innerHTML = "";
            }
          }
        };
                
        var hideProof = function() {
          scope.proofWindow.className = 'sxsl-proof-hide';
        }
        var showProof = function() {
          scope.proofWindow.className = 'sxsl-proof-container';
        }
      
        var minimise = function() {
          const t1 = document.querySelector('div.sxsl-instruction-container');
          t1.className = 'sxsl-instruction-container-hide';
          const t2 = document.querySelector('div#sxsl-instruction-max');
          t2.className = 'sxsl-thumbnail-show';
          minimisePreview()
        }
        var minimisePreview = function() {
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'preview-container-collapsed';
          const t4 = document.querySelector('div#previewPanel');
          t4.className = 'sxsl-preview-panel-collapsed';
        }
        var hidePreview = function() {
          const t1 = document.querySelector('div.sxsl-instruction-container');
          t1.className = 'sxsl-instruction-container-hide';
          const t2 = document.querySelector('div#sxsl-instruction-max');
          t2.className = 'sxsl-thumbnail-show';
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'sxsl-preview-hide';
          const t4 = document.querySelector('div#viewer-container');
          t4.className = 'viewer-container';

        }
        var showReview = function(src,isVideo) {
          const t1 = document.querySelector('div.sxsl-instruction-container');
          t1.className = 'sxsl-instruction-container-hide';
          const t2 = document.querySelector('div#sxsl-instruction-max');
          t2.className = 'sxsl-thumbnail-show';
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'sxsl-preview-hide';
          const t4 = document.querySelector('div#viewer-container');
          t4.className = 'viewer-container';
          if (isVideo) {
            const t5 = document.querySelector('video#viewVideo');
            t5.firstChild.src = src;
            t5.className = 'sxsl-viewer-image';
            
            const t6 = document.querySelector('img#viewImage');
            t6.className = 'sxsl-preview-hide';
          } else {
            const t5 = document.querySelector('img#viewImage');
            t5.src = src;
            t5.className = 'sxsl-viewer-image';
            
            const t6 = document.querySelector('video#viewVideo');
            t6.className = 'sxsl-preview-hide';
          }
        }
        var hideReview = function() {
          maximise();
        }
        var maximise = function() {
          if (scope.runningField == true) {  
            const t1 = document.querySelector('div#sxsl-instruction-container');
            t1.className = 'sxsl-instruction-container'; 
            const t2 = document.querySelector('div#sxsl-instruction-max');
            t2.className = 'sxsl-thumbnail-hide';            
            const t3 = document.querySelector('div#viewer-container');
            t3.className = 'sxsl-preview-hide';
            maximisePreview();
          }
        }
        var maximisePreview = function() {
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'preview-container';
          const t4 = document.querySelector('div#previewPanel');
          t4.className = 'sxsl-preview-panel';
        }
        var expandContract = function() {
          const t1 = document.querySelector('img#thumbnail');
          if (t1.className == 'sxsl-thumbnail-hide') {
            //expand
            t1.className = 'sxsl-thumbnail-show';
            
            // but collapse the references
            const t3 = document.querySelector('div#preview-container');
            t3.className = 'preview-container-collapsed';
            const t4 = document.querySelector('div#previewPanel');
            t4.className = 'sxsl-preview-panel-collapsed';

        } else {
              //contract
            t1.className = 'sxsl-thumbnail-hide'; 
            
            const t3 = document.querySelector('div#preview-container');
            t3.className = 'preview-container';
            const t4 = document.querySelector('div#previewPanel');
            t4.className = 'sxsl-preview-panel';
          }
          
        }
        var showpassfail = function() {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-show';
          const t2 = document.querySelector('div#verify') ;
          t2.className = 'sxsl-passfailverify-hide';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-show';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
          const t5 = document.querySelector('div#errorcodes');
          t5.className = 'sxsl-passfailverify-hide';
          const t6 = document.querySelector('button#fail');
          t6.className = 'sxsl-button sxsl-button-fail';
        }
        var showpasserrorcode = function() {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-show';
          const t2 = document.querySelector('div#verify') ;
          t2.className = 'sxsl-passfailverify-hide';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-show';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
          const t5 = document.querySelector('div#errorcodes');
          t5.className = 'sxsl-select sxsl-button-fail';
          const t6 = document.querySelector('button#fail');
          t6.className = 'sxsl-passfailverify-hide';
        }
        var hidepassfail = function() {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-hide';
          const t2 = document.querySelector('div#verify');
          t2.className = 'sxsl-passfailverify-hide';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-hide';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
        }      
        var showverify = function() {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-hide';
          const t2 = document.querySelector('div#verify');
          t2.className = 'sxsl-passfailverify-show';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-show';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
        }
      /*
        var capture = function() {
  const t1 = document.querySelector('div#passfail');
  t1.className = 'sxsl-passfailverify-hide';
  const t2 = document.querySelector('div#verify');
  t2.className = 'sxsl-passfailverify-show';
  const t3 = document.querySelector('div#actions');
  t3.className = 'sxsl-actions-hide';
  const t4 = document.querySelector('div#capture');
  t4.className = 'sxsl-capture-show';
       }
*/
        var clear = function() {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-hide';
          const t2 = document.querySelector('div#verify');
          t2.className = 'sxsl-passfailverify-hide';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-hide';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
        }
      
        function addNamedShape(name,shape,show, pass,fail) { 
          scope.renderer.addPVS(scope.data.context.target.id, name, shape, undefined, undefined, () => { 
    
            // we added the model, so set the location
            scope.renderer.setTranslation(name,0,0,0);
            scope.renderer.setRotation   (name,0,0,0);
            scope.renderer.setScale      (name,1,1,1);
            scope.renderer.setProperties (name,{hidden:!show});
            if (pass != undefined) 
              pass(name);
          },
          (err) => {
            // something went wrong
            console.log(`addPVS failed to add new model: ${JSON.stringify(err)}`); 
            if (fail != undefined) 
              fail(err);
          }); 
        } 
        
        //////////////////////////////////////////////////////////////////////////////////////
        // handle tracking context
        
        function getContext(context) {
            
          if (context == undefined) return {};
            
          // look through the context to find a a suitable model to display - if we are physical, we will show "full" (or occluder if full not avilable)
          // otherwise we use occluder
          var contextual={};
          if (context.models != undefined) context.models.forEach(function(model) {
            if (model.tags!=undefined) model.tags.forEach(function(tag) {
              switch (tag) {
              case "full":
                contextual.model = scope.data.anchor + model.url;
                contextual.mime  = model.mimeType;
                contextual.scale = model.scale != undefined ? model.scale : 1;
                contextual.tag   = tag;
                console.log("using",tag);
                break;
              case "occlusion":
                if (contextual.tag === undefined || contextual.tag != "full") {
                  contextual.model = scope.data.anchor + model.url;
                  contextual.scale = model.scale != undefined ? model.scale : 1;
                  contextual.mime  = model.mimeType;
                  contextual.tag   = tag;
                }
                console.log("using",tag);
                break;
              case "heroes":
                contextual.hero = scope.data.anchor + model.url;
                break;
              } 
            });
          });

          contextual.target = {};
          var targetExists = document.querySelector("twx-dt-target");
          if (targetExists != null) {
              contextual.target.id = targetExists.id;
              var tgtsrc = targetExists.attributes['src'].value;
              var tgttype = tgtsrc.split(':')[0];
              switch(tgttype) {
                  case "spatial"       : contextual.target.mimeType = "application/vnd.ptc.tracker.spatialtracker"; break;
                  case "vuforia-model" : contextual.target.mimeType = "application/vnd.ptc.tracker.modeltracker"; break;
                  case "vuforia-image" : contextual.target.mimeType = "application/vnd.ptc.tracker.imagetracker"; break;
                  case "vuforia-area"  : contextual.target.mimeType = "application/vnd.ptc.tracker.areatracker"; break;
                  case "vuforia-vumark": contextual.target.mimeType = "application/vnd.ptc.tracker.thingmarktracker"; break;
                  default              : contextual.target.mimeType = "application/vnd.ptc.tracker.unknown"; break;
              }
          }
          else if (context.trackers != undefined) {
            context.trackers.forEach(function(tracker) {
              switch(tracker.mimeType) {
              case "application/vnd.ptc.tracker.advancedmodeltracker":
              case "application/vnd.ptc.tracker.modeltracker":
                var target='vuforia-model:///' + scope.data.anchor;
 
                var tgt = tracker.content.dataset.dat;
                var urlidx = tgt.lastIndexOf('.dat');
                target = target + tgt.substring(0,urlidx) + '?id=';
      
                if (contextual.target.mimeType != "application/vnd.ptc.tracker.advancedmodeltracker") {
                  contextual.target.mimeType = tracker.mimeType;
                  contextual.target.target   = target;
                  contextual.target.y  = 0 ;
                  contextual.target.rx = 0 ;
      
                  if (tracker.content.guideView != undefined) {
                    contextual.target.guide = scope.data.anchor + tracker.content.guideView.url; 
                  } else if (tracker.guideview != undefined) {
                    contextual.target.guide = scope.data.anchor + tracker.guideview.url; 
                  } else {
                    contextual.target.guide = ""; 
                  }
                  contextual.target.id = tracker.content.targetName;
                }
                break;
              default:
                contextual.target = undefined; // this is an error
                break;
              }
            });

            // now create the tracker here
            var markerDef = [{src:contextual.target.target}];
            scope.renderer.loadTrackerDef(markerDef, (successMarkerSrcs) => {
                                          
              contextual.target.tracker = 'tracker1';                            
              scope.renderer.addTracker(contextual.target.tracker, () => {
                
                scope.renderer.addMarker(contextual.target.tracker, contextual.target.id, contextual.target.target, undefined, () => {
                                         
                  scope.renderer.setTranslation(name,0,0,0);
                  scope.renderer.setRotation   (name,0,0,0);
                  scope.renderer.setScale      (name,1,1,1);
                  
                  if (typeof(scope.renderer.addTargetGuide) === "function") {
                    scope.renderer.addTargetGuide({tracker: contextual.target.tracker, target: contextual.target.target, src: contextual.target.guide});
                  } else {
                    var targetGuideDiv = document.querySelectorctor("div.targetGuide");
                    if (targetGuideDiv && contextual.target.guide != undefined) {
                        
                      scope.data.guide = contextual.target.guide;
                        
                      var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
                      pscope.hideTargetGuide = false;
                      pscope.targetGuideClass = "imagemark";
                      targetGuideDiv.style.backgroundImage = "url('" + scope.data.guide + "')";
                      pscope.$applyAsync();
                      
                    }
                  }
                  
                  //and with the target now defined, we can build out the base resources
                  //context = occluder or desaturated base
  
                  //subjects
                  //annotations
                  //tools
                
                },
                (err) => {
                    console.log('addMarker failed');
                })
              },
              (err) => {
                console.log('addTracker failed');                            
              })
            },
            (err) => {
              console.log('loadTrackerDef failed');                            
            });
          }
          return contextual;
        }
      
        scope.$root.$on('trackingacquired', function(event, args) {
          var targetGuideDiv = document.querySelector("div.targetGuide");
          if (targetGuideDiv) {
            var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
            pscope.hideTargetGuide = true;
            targetGuideDiv.style.backgroundImage = "";
            pscope.$applyAsync();
          }
          scope.contextField = 'istracked set to true '+ args;
        });
            
        scope.$root.$on('trackinglost', function(event, args) {
          var targetGuideDiv = document.querySelector("div.targetGuide");
          if (targetGuideDiv) {
            var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
            pscope.hideTargetGuide = false;
            targetGuideDiv.style.backgroundImage = "url('" + scope.data.guide + "')";
            pscope.$applyAsync();
          }
          scope.contextField = 'istracked set to false for '+ args;
        });
            
        //////////////////////////////////////////////////////////////////////////////////////////////////    
        // step managment
            
        function getSteps(proc) {
        
          var steplist = [];
          if (proc.statements != undefined) proc.statements.forEach(function(statement,idx) {
            var stepid = statement.stepId;
            //now find the step
            for(var i=0;i<proc.steps.length;i++) {
                if (proc.steps[i].id == stepid) {
                    //found it
                  var step = proc.steps[i];  
                  var title = step.title != undefined ? step.title.resources[0].text : step.id;
                  steplist.push( {display:title, value:idx });  
                  break;
                }
            }
          });
          return steplist;
        }
        
        scope.$watch('resourceField', function () {
          scope.data.src    = (scope.resourceField != undefined) ? scope.resourceField : '';
          scope.data.anchor = scope.data.src.slice(0,scope.data.src.lastIndexOf('/')+1);
          if (scope.helper) scope.helper.anchor = scope.data.anchor;
          
          $http.get(scope.data.src)
          .success(function(data, status, headers, config) {
                   
            if (data != undefined) { 
              var proc = scope.data.sxsl = data;
                 
              //for now. let's just grab the context block...      
              var context = proc.contexts != undefined ? proc.contexts[Object.keys(proc.contexts)[0]] : undefined;
              scope.data.context = getContext(context);
              
              // and the steps
              scope.data.steplist = getSteps(proc);
              startSxslPlayer();
            }
          })
          .error(function(data, status, headers, config) {
            console.log(status);           
          });
                   
      
        });
            
        scope.$watch('reasoncodeField', function () {
          var newcode = (scope.reasoncodeField != undefined && scope.reasoncodeField.length > 0) ? JSON.parse(scope.reasoncodeField) : undefined;
          if (scope.runningField == true && newcode != undefined) {
            scope.data.reasoncode = newcode;
            switch (newcode.event) {
              case 'halt':
                scope.halt(newcode);
                break;
              case 'pause':
                scope.pause(newcode);
                break;
              default:
                break;
            }
          }
                     
        });
            
        scope.$watchGroup(['physicalField','disabledField','holoField','loggingField'], function () {
          scope.data.physical = (scope.physicalField    != undefined && scope.physicalField === 'true') ? true :false ;
          scope.data.disabled = (scope.disabledField    != undefined && scope.disabledField === 'true') ? true :false ;
          scope.data.isHolo   = (scope.holoField        != undefined && scope.holoField=='true') ? true :false ;
          scope.data.loggingEnabled = (scope.loggingField     != undefined && scope.loggingField=='true') ? true :false ;
          executesxslPlayer();
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { return scope.steplistField != undefined ? JSON.stringify(scope.steplistField.selectedRows) : ''},
          function(value) {
            if (value != undefined && scope.steplistField != undefined) {
              var parsed = JSON.parse(value);      
              if (parsed != undefined && parsed.length==1 && parsed[0].status != 'done') {
                console.log('being directed to move to',value);  
                scope.next('j',parsed[0].idx);
              } else {
                console.log('ignoring',value);  
              }
            }
        });


        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.resume = function() { 
              if (scope.canrunField == true) 
                scope.resume(true) 
            };
            delegate.ready = function() {
              $timeout(function() {
                  //TODO : rename this event     
                  scope.$parent.$emit("statusUpdateComplete");
                },10);
            }
          }
        });
            
        scope.presentErrorCodesAsHTML = function(reasonCodes,parent) {
                
          var header  = "<option class='item'>Select...</option>";
          var display = "";
          reasonCodes.forEach(function(item) {
            if (item.parentUID==parent) {
                display = display + "<option class='item' value="+item.code+">"+item.resources[0].text+"</option>";
            }
          });
          return display.length > 0 ? header + display : display;
        }
    
        scope.presentErrorCodes = function(codes,level) {
          scope.data.errorcodes = codes;
          scope.errorcodelistWindow.innerHTML = scope.presentErrorCodesAsHTML(codes,level);
        }
    
        function createInstructionPanelHTML() {
  const container = document.querySelector('.twx-2d-overlay > twx-container-content');
  scope.sxslPlayerWindowMinimised = document.createElement('div');
  scope.sxslPlayerWindowMinimised.innerHTML = "<div id='sxsl-instruction-max' class='sxsl-thumbnail-hide' style='position: absolute;left: 24px;bottom: 24px;'><button id='maximise' class='sxsl-button sxsl-button-round sxsl-icon-work-instruction sxsl-blue-bb'/></div>";
  
  scope.sxslPlayerWindow = document.createElement('div');
  scope.sxslPlayerWindow.innerHTML = "\
  <div id='panel' class='sxsl-instruction-panel'>\
    <div  style='margin-right:12px;margin-left:12px'>\
      <div id='cmdrow' style='padding-top: 12px'>\
        <div id='stepinfo' class='sxsl-instruction-step'>----</div>\
        <div id='cmds' class='sxsl-instruction-cmds'> \
          <button id='expandcontract' class='sxsl-button sxsl-button-round sxsl-icon-expand'/> \
          <button id='minimise' class='sxsl-button sxsl-button-round sxsl-icon-collapse-hide'/> \
          <button id='advance' class='sxsl-button sxsl-button-round sxsl-blue-bb sxsl-icon-nav-right'/></div>\
      </div>\
      <div style='margin-top:54px'><img id='thumbnail' class='sxsl-thumbnail-show' src='app/resources/Uploaded/earthNight.jpg' height=320/></div>\
      <div id='header' class='sxsl-instruction-header'>header text</div>\
      <div style='padding-bottom=12px'>\
        <div id='action' class='sxsl-instruction-actions'>action text</div>\
      </div>\
    </div>\
  </div>\
  <div id='actions' class='sxsl-actions-hide'>\
    <div id='verify' class='sxsl-passfailverify-show'>\
      <div class='checkbox' style='display:inline-flex;left: 650px;'>\
        <div style='margin-top:4px;margin-right:4px;'>Verify</div><input id='acknowledge' type='checkbox'/>\
      </div>\
    </div>\
    <div id='passfail' class='sxsl-passfailverify-hide'>\
      <div id='errorcodes' class='sxsl-select sxsl-button-fail'>\
        <div style='margin:8px' >Fail</div>\
        <select id='errorcodelist'>\
          <option class='sxsl-item' value='unkown'>TBD</option>\
        </select>\
      </div>\
      <div id='failcode' style='left:24px;'><button id='fail' class='sxsl-button sxsl-button-fail' >Fail</button></div>\
      <div style='right:24px;position:absolute;'><button id='pass' class='sxsl-button' >Pass</button></div>\
    </div>\
  </div>\
  <div id='capture' class='sxsl-capture-hide'>\
      <div id='enumerator' class='sxsl-select sxsl-button-fail'>\
        <div style='margin:8px'>Choose</div>\
        <select>\
          <option class='sxsl-item' value='red'>Red</option>\
          <option class='sxsl-item' value='grn'>Green</option>\
          <option class='sxsl-item' value='blue'>Blue</option>\
        </select>\
      </div>\
      <div style='left:24px;'><input type='text' id='textCature' style='textalign:ft' placeholder='use format 123-45678'></input></div>\
      <div style='right:24px'><button id='activate' class='sxsl-button' >Activate</button></div>\
      <div style='right:24px;position:absolute;'><button id='add' class='sxsl-button' >Add</button></div>\
  </div>";
  scope.sxslPlayerWindow.id='sxsl-instruction-container';
  scope.sxslPlayerWindow.className = 'sxsl-instruction-container';
  
  container.insertBefore(scope.sxslPlayerWindow, container.firstChild);
  container.insertBefore(scope.sxslPlayerWindowMinimised, container.firstChild);
  
  scope.headLabel = document.querySelector('div#header');
  scope.instLabel = document.querySelector('div#action');
  scope.thumbnail = document.querySelector('img#thumbnail');
  scope.stepLabel  = document.querySelector('div#stepinfo');
  
  scope.setHeadLabel = function(text) {
    scope.headLabel.innerHTML = text;
  }
  scope.setInstLabel = function(text) {
    scope.instLabel.innerHTML = text;
  }
  scope.setStepLabel = function(text) {
    scope.stepLabel.innerHTML = text;
  }
  
  scope.errorcodelistWindow = document.querySelector('select#errorcodelist');
  scope.errorcodelistWindow.addEventListener('change', selectedErrorCode);
  
  const btn3 = document.querySelector('button#advance');
  btn3.addEventListener("click", next);
  const btn2a = document.querySelector('button#minimise');
  btn2a.addEventListener("click", minimise);
  const btn2b = document.querySelector('button#maximise');
  btn2b.addEventListener("click", maximise);
  const btn2c = document.querySelector('button#expandcontract');
  btn2c.addEventListener("click", expandContract);
  const btnPass = document.querySelector('button#pass');
  btnPass.addEventListener("click", function() {
                           scope.next('p');
  });
  const btnFail = document.querySelector('button#fail');
  btnFail.addEventListener("click", function() {
                           scope.next('f');
  });
  const btnack = document.querySelector('input#acknowledge');
  btnack.addEventListener("change", function() {
                           scope.next('y');
  });
  };
  

  function createReferenceViewerHTML() {
    const container = document.querySelector('.twx-2d-overlay > twx-container-content');
    scope.referenceViewerWindow = document.createElement('div');
  
    scope.referenceViewerWindow.innerHTML = "\
    <div id='viewerPanel' class='sxsl-viewer-panel'>\
      <div class='sxsl-viewer-cmdview'>\
        <div id='viewinfo' class='sxsl-viewer-infoView'>view info</div>\
        <button id='minimiseView' class='sxsl-button sxsl-button-round sxsl-icon-close sxsl-closer'/> \
      </div>\
      <div id='viewerList' class='sxsl-viewer-view'>\
        <img id='viewImage' class='sxsl-preview-hide'/>\
        <video id='viewVideo' class='sxsl-preview-hide' autoplay><source src='' type='video/mp4' ></video>\
      </div>\
    </div>"
    scope.referenceViewerWindow.id='viewer-container';
    scope.referenceViewerWindow.className = 'sxsl-preview-hide';
    
    container.insertBefore(scope.referenceViewerWindow, container.firstChild);
    
    //close button
    const btn2b = document.querySelector('button#minimiseView');
    btn2b.addEventListener("click", hideReview);

  };
  
  function createProofCaptureHTML() {
    const container = document.querySelector('.twx-2d-overlay > twx-container-content');
    scope.proofWindow = document.createElement('div');
  
    scope.proofWindow.innerHTML = "\
    <div id='proofPanel' class='sxsl-proof-panel'>\
      <div>\
        <img id='proofHint' class='sxsl-proof-hint' src='app/resources/Uploaded/example101/beauties.jpg' width=128/>\
        <button id='capture' class='sxsl-button sxsl-button-round sxsl-icon-to-do'/> \
      </div>\
      <div id='proofInstruction' class='sxsl-proof-text'>text here</div>\
    </div>"
    scope.proofWindow.id='proof-container';
    scope.proofWindow.className = 'sxsl-proof-hide';
    
    container.insertBefore(scope.proofWindow, container.firstChild);
    
    //close button
    const btn2b = document.querySelector('button#capture');
    btn2b.addEventListener("click", photoGrab);
    
    scope.proofInstruction = document.querySelector('div#proofInstruction');
    scope.proofHint        = document.querySelector('img#proofHint');
    scope.setProofHints = function(text,img) {
        scope.proofInstruction.innerHTML = text;
        scope.proofHint.src = img;
    }
  };

  
  function createReferencePreviewHTML() {
    const container = document.querySelector('.twx-2d-overlay > twx-container-content');
    scope.referencePreviewWindow = document.createElement('div');
  
    scope.referencePreviewWindow.innerHTML = "\
    <div id='previewPanel' class='sxsl-preview-panel-collapsed'>\
      <div id='previewList' class='sxsl-previews'>\
      </div>\
    </div>"
    scope.referencePreviewWindow.id='preview-container';
    scope.referencePreviewWindow.className = 'preview-container-collapsed';
    
    container.insertBefore(scope.referencePreviewWindow, container.firstChild);
    
    scope.previewList = document.querySelector('div#previewList');
    scope.setPreviewList = function(contents) {
      scope.previewList.innerHTML = contents;
    }
  };
        var datasink = function(text) {
          console.log('swallowing this text :',text);
        }
        scope.setHeadLabel   = datasink;
        scope.setInstLabel   = datasink;
        scope.setStepLabel   = datasink;
        scope.setPreviewList = datasink;
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          if (!scope.data.isHolo) {        
            createInstructionPanelHTML();
            createReferencePreviewHTML();
            createReferenceViewerHTML();
            createProofCaptureHTML();
            
          } else {
              //TODO : creaate holographic UI
              
              //for now...

          }
        });
        scope.$root.$on("$ionicView.beforeLeave", function (event) {
          // clean up
                        
          // deallocate any event listeners we registered ($on, addEventListener etc.)              
        });

//
// example showing how to add a shape
// note you could call this from anything e.g. after receiving the results of a call into Thingworx to get the locations
// of items etc.
// this example also shows that if we succeed in creating the shape, we can create something else e.g. we can add an image
// (see above)
//
function genrotation(normal) {
  if (normal == undefined) 
    return [0,0,0];
    
  //otherwise
  var up = new Vector4().Set3a(normal);
  var rg = new Vector4().Set3(1,0,0);
  var gz = up.CrossP(rg);
      rg = up.CrossP(gz);
  var rot = new Matrix4().Set3V(rg,up,gz).ToPosEuler(true).rot;
  return rot.v;
}

// add them as we need them - a better version might use a re-usable pool of shapes but let's keep 
// it simple for now
scope.addNamedPOI = function(name,shape,pos,rot,scale,hide,context) { 
    
  //does this item exist already - are we reusing it
  if (scope.data.pois[name] != undefined) {
      
    this.renderer.setProperties (name,{hidden:false});
    scope.data.pois[name].hidden = false;
    return;
  }

  // otherwise, create a new one
  scope.data.pois[name] = { active:false };
  scope.renderer.addPVS(scope.data.context.target.tracker, name, shape, undefined, undefined, () => { 
    
    // we added the model, so set the location
    if (pos != undefined) scope.renderer.setTranslation(name,pos[0],pos[1],pos[2]);
    else                  scope.renderer.setTranslation(name,0,0,0);
    if (rot != undefined) scope.renderer.setRotation   (name,rot[0],rot[1],rot[2]);
    else                  scope.renderer.setRotation   (name,0,0,0);
    scope.renderer.setScale      (name,scale,scale,scale);
    if (context != undefined) {
      var isDigital = !(context.target.mimeType != "application/vnd.ptc.tracker.spatialtracker" || scope.data.physical);
      scope.renderer.setProperties (name,{hidden:hide,shader:isDigital?"sxsl_desaturatedgl":"sxsl_screendoorgl",occlude:false,phantom:isDigital,opacity:isDigital?0.7:1,decal:false});
    } else {
      scope.renderer.setProperties (name,{hidden:hide,shader:"sxsl_proximityHilitegl",occlude:false,phantom:false,decal:false});
      
      // we can use this later...
      scope.data.pois[name] = { pos:pos, rot:rot, scale:scale, hidden:hide, active:true, animated:false, sequenceToLoad:undefined }
    }
  
    var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
    pscope.$applyAsync();

  }, 
  (err) => {
    // something went wrong
    console.log(`addPVS failed to add new model: ${JSON.stringify(err)}`); 
  }); 
} 
scope.showPOIs = function() {
  for(const name in scope.data.pois) {
    var me = scope.data.pois[name];
    if (me.active) {  
      this.renderer.setProperties (name,{hidden:false});
      me.hidden = false;
    }
  }
}
scope.hidePOIs = function() {
  for(const name in scope.data.pois) {
    var me = scope.data.pois[name];
    if (me.active) {  
      this.renderer.setProperties (name,{hidden:true});
      //TODO :we should also disable any animations here  
      me.hidden = true;
    }
  }
}
scope.deactivateAll = function() {
  // remove all POIs  
  for(const name in scope.data.pois) {
    this.renderer.setProperties (name,{hidden:true});
    scope.data.pois[name].hidden = true;
    scope.data.pois[name].active = false;
  }
  //and remove any references
  scope.setPreviewList("");
  
}
scope.animatePOIs = function(start) {
  for(const name in scope.data.pois) {
    var me = scope.data.pois[name];
    
    if (!start && me.animated == true) {
        
      this.renderer.setProperties (name,{hidden:true});
      //TODO; stop animation  
      me.animated = false;
      
    } else if (me.active && start && !me.animated && me.sequenceToLoad != undefined) {
        
      // load and then start sequence
      console.log('TODO: load sequence',me.sequenceToLoad);  
      //note that load is async so the final me.animated should be set once the sequence has fully loaded  
    }
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// action handling - ultimately will be embedded in the sxsl widget
// right now, we're using a UI that is implemented at the experience level, so these actions are really the UI implementation layer of the sxsl widget
//
scope.sxsl2Actions = function(context) {
    
  this.registry = [];
  this.context  = context;
  //initialise all action stuff
  this.start = (intro) => {
    scope.setInstLabel(intro ? intro : "No introduction text found");
  }
  
  //terminate action handling, hide any remaining annotations etc.
  this.end = (conclusion) => {
      
    scope.deactivateAll();  
    
    scope.setInstLabel(conclusion != undefined ? conclusion : '');
                                         
  }
  
  const actionClassLookup = (act) => {
    var action = this.registry[act];
    return action != undefined ? action.icon : undefined;
  };
  
  // the action handler provides common services that ALL actions use
  // e.g. feeding the subject/annotation/tools display (wth animation)
  // handling any input for "details" (measurements, key characteristics etc.)
  // individual actions can choose to override and do their own thing
  
  this.showSubjects = (s) => {
  
  }
  
  //
  // references are broken up into 'typed' data lists that can be directly bound to repeaters
  // in this example, we break aprt the video, image (png and jpg). Others such as pdfs etc,
  // could be added.   
  //
  this.showReferences = (refs) => {
      
    //generate inline html  
    function processListAsHTML(list) {
      var inner = "";
      list.forEach(function(ref) {
        inner = inner + ref;
      });
      return inner;
    }
    
    // deliver any references (images etc.) - if there are none, hide the viewer
    // TODO : use the thumbnail (if defined) for the previewer
    if (refs != undefined) {
      
      // we can have images, videos, docs - sort into buckets
      var buckets = { image:[], video:[], docs:[] };
      let mergedBucket = [];
      
      var me = this.context;
      refs.forEach(function(ref) {
                   
        //if the mime isnt defined, lets see if we can figure it out from the file extension
        if (ref.mime == undefined) {
          var fext = ref.url.slice(ref.url.lastIndexOf('.'));
          switch(fext) {
            case ".png" : ref.mime = "image/png"; break;
            case ".jpg" : ref.mime = "image/jpg"; break;
            case ".mp4" : ref.mime = "video/mp4"; break;
            case ".gif" : ref.mime = "image/gif"; break;
            default : break;
          }
        }
        
        ref.url = me.anchor + ref.url;
        switch(ref.mime) {
          
          case "video/mp4":
            buckets.video.push(ref);
            mergedBucket.push('<video class="sxsl-preview-show"><source src="'+ref.url+'"/></video>');
            break;
          
          case "image/jpeg":
          case "image/png":
          case "image/gif":
            buckets.image.push(ref);
            mergedBucket.push('<img src="'+ref.url+'" class="sxsl-preview-show"/>');
            break;
            
          //handle others e.g. docs etc.
          default: 
            break;  
        }
      });
      
      // ideally, we'd make this pluggable so that the action code doesnt know about the UI
      //
      if (mergedBucket.length > 0) {
          
          maximisePreview();
          scope.setPreviewList(processListAsHTML(mergedBucket));
          
          const collection = document.getElementsByClassName("sxsl-preview-show");
          
          for (var i = 0; i < collection.length; i++) {
            var c = collection[i];  
            
            var tag = c.tagName != undefined ? c.tagName : "";    
            var src = tag=='VIDEO' ? c.firstChild.src : c.src;  
            
            c.addEventListener("click", (function(i,src,tag) { 
              return function() {                           
                showReview(src, tag=='VIDEO'); 
              }
            })(i,src,tag));
          }

      } else {
          minimisePreview();
      }
      
    } else {
      minimisePreview();
    }
   
  }

  //
  // this are probably UI eval validators, so they should realy be returning css/state-based UI settings
  //
  this.findInputValidator = (input, tools) => {
    
    var findInputTool = (input,target) => {
      
      // enable the button
      //$scope.view.wdg["action-input-tool"].visible = true;
      if (tools != undefined)
        tools[0].disarm = undefined;
      
      switch (input.tool) {
        case "barcode": 
          //$scope.view.wdg["action-input-tool"].text = "scan"; 
          //$scope.view.wdg["action-input-tool"].disabled  = false;
          break;
        case "camera": 
          //$scope.view.wdg["action-input-tool"].text = "take photo"; 
          //$scope.view.wdg["action-input-tool"].disabled  = false;
          break;
        default:
          
        /*
          if (tools != undefined && tools[0] != undefined && tools[0].title != undefined && tools[0].title.resources != undefined)
            $scope.view.wdg["action-input-tool"].text = tools[0].title.resources[0].text;
          else 
            $scope.view.wdg["action-input-tool"].text = "Activate";
        */
        
          // at this point, we can start the process of connecting to the tool
          //
          scope.setInstLabel("connecting to " + tools[0].name);
          twxToolConnect(tools[0].name)
          .then( () => {
            //$scope.view.wdg.spinner.visible = false;
            scope.setInstLabel("connected to " + tools[0].name + 
                               " ok!<p>Collecting " + tools[0].infoToCollect.count + " values");
        
            // once armed, we can get ready to activate
            //$scope.view.wdg["action-input-tool"].disabled = false;
        
            twxToolSet(tools[0].name, tools[0].infoToCollect.details.validation)
            .then( () => {
              console.log('tool ready')
              twxToolArm(tools[0].name, true)
         	  .then( (armed) => {

                //$scope.view.wdg["action-input-tool"].disabled  = false;
                
                tools[0].disarm = function() {
                  
                  twxToolArm(tools[0].name, false)
         	      .then( () => {
                  
                    //$scope.view.wdg["action-input-tool"].disabled  = true;
                  })
                  // what happens if it fails
                  .catch( e => { 
	     	    	console.log('tool disarm failed')
                    //$scope.view.wdg["action-input-tool"].disabled  = true;
                  })
                  
                }
                
              }) 
              .catch( e => { 
		    	console.log('tool arm failed')
                //$scope.view.wdg["action-input-tool"].disabled  = true;
              })
            })
            .catch( e => { 
		      console.log('tool set failed')
              //$scope.view.wdg["action-input-tool"].disabled  = true;
            })

          })
          .catch( e => { 
			console.log('tool connect failed')
            //$scope.view.wdg["action-input-tool"].disabled  = true;
          })
          
          break;
      }
      
      // define the handler for the button
      $scope.inputToolActivate = function(evt) {
        switch (input.tool) {
            
          // check for known cases - barcode, camera for example
          //
          case "barcode":
			//launch barcode scanner
            twx.app.fn.triggerWidgetService("barcodeScanner", 'startScan');
            
            // and listen for resultslisten            
            /*
              $scope.$watch("app.view['viewproc'].wdg.barcodeScanner.scannedValue",function(val) {

              // based on params to the tool itself, we may want to do transformation of the data here
              // eg a barcode reader might be able to san, check the code e.g. GS1, and extract specific fields
              target.text = val;
          })
                  */
            break;
          case "camera":
            twx.app.fn.triggerWidgetService("inputCamera", 'takePicture');
            
            // and listen for resultslisten            
            /*
              $scope.$watch("app.view['viewproc'].wdg.inputCamera.imageUrl",function(val) {

              // based on params to the tool itself, we may want to do transformation of the data here
              // eg a barcode reader might be able to san, check the code e.g. GS1, and extract specific fields
              target.imgsrc = val;
          })
                  */
            break;
            
          default:
            // check to see if a new tool is registered - this will either be a thingworx or kepware connected tool
            //
            
            // note that if we entered here through an event, it means we received this from the tool directly ie it
            // was activated before we asked for it.
            if (evt != undefined) {
              
              // get the data from the tool event
              target.text = evt.eventData[0].actual;
              
            } else {
              //
              // lookup the tool by name
              //
              if (tools != undefined) {
                tools.forEach(function(tool) {
                  if (tool.name == input.tool) {
             
                    console.log('activating tool',tool.name);
                  
                    twxToolActivate(tool.name)
      	            .then( (response) => {
                      console.log('tool',tool.name,'returned',response);
                      target.text = response.actual;
                    })
                    .catch( e => { 
		        	  console.log('tool activation failed')
                      //$scope.view.wdg["action-input-tool"].disabled  = true;
                    })

                  }
                })
              }
            }
            
            break;
        }
      }
    }
    var passThru    = function(i) { 
      var input   = i;
      var src     = $scope.view.wdg["action-input-value"];
      src.visible=true;
      return function() {
        //$scope.view.wdg["action-input-validated"].value = true;
        return { response:src.text, type:input.mimeType, time:Date.now()} ;
      }
    }
    var textPattern = function(i) { 
      var input   = i;
      var pattern = input.validation.regex;
      //var src     = $scope.view.wdg["action-input-value"];
      if (input.tool != undefined) {
        findInputTool(input,src);
      }
      //src.visible=true;
      return function() {
        var t = src.text;
        console.log('test',t,'against',pattern);
        var valid = t.match(pattern) != null;
        //$scope.view.wdg["action-input-validated"].value = valid;
        return valid ? { response:t, type:input.mimeType, time:Date.now() } : undefined;
      }
    }
    var rangeInput = function(i) { 
      var input   = i;
      var min     = input.validation.minerror, max    = input.validation.maxerror;
      var minwarn = input.validation.minwarn, maxwarn = input.validation.maxwarn;
      var nominal = input.validation.nominal; // expected value
      var src;//     = $scope.view.wdg["action-input-value"];
      //src.visible = true;
      //if (nominal != undefined) src.text = nominal; //preset the value

      if (input.tool != undefined) {
        findInputTool(input,src);
      }

      
      return function() {
        var t = src.text;
        console.log('test',t,'against min',min,'max',max);
        var fv = parseFloat(t);
		
        var valid = (min != undefined ?  min <= fv : true) && (max != undefined ? max >= fv : true);
        //$scope.view.wdg["action-input-validated"].value = valid;
        
		//how can we show tristate e.g. pass/fail/warn?
        var warn = (minwarn != undefined ?  minwarn > fv : false) || (maxwarn != undefined ? maxwarn < fv : false);
        if (valid && warn) console.log('warning : value',fv,'falls outside',minwarn,maxwarn);
        
        // finally, look for nominal and if defined, report the deviation from this value
        var deviation = (nominal != undefined) ? Math.abs(nominal - fv) : undefined;
        
        return valid ? { response:t, tolerance:deviation, type:input.mimeType, time:Date.now() } : undefined;
      }
    }
    var selectoneInput = function(i) { 
      var input   = i;
      var list    = input.validation.select;
      //var src     = $scope.view.wdg["action-input-select"];
      //$scope.view.wdg["action-input-value"].visible = false;
      //src.visible=true;
      //src.label="choose";
      //src.list = list;
      
      if (list == undefined) return passThru(i);
      else return function() {
        var t = src.list.current.display;
        console.log('test',t,'against list',list);
        var valid = false;
        var resp  = t;
        if (list != undefined) list.forEach(function(itm,idx) {
          if (t === itm.display) {
            valid = true;
            if (itm.value != undefined) 
              resp = itm.value;
          }
        })
        //$scope.view.wdg["action-input-validated"].value = valid;
        return valid ? { response:resp, type:input.mimeType, time:Date.now() } : undefined;
      }
    }
    var bomqtyinput = function(i) { 
      var input   = i;
      var pattern = input.validation != undefined ? input.validation.regex    : undefined;
      var min     = input.validation != undefined ? input.validation.minerror : undefined;
      var max     = input.validation != undefined ? input.validation.maxerror : undefined;
      var partno  = $scope.view.wdg.actionInputText;
      partno.visible=true;
      var qty;//     = $scope.view.wdg.actionInput2; // could be a numeric selection list if the range is limited
      //qty.visible = true;

      if (input.tool != undefined) {
        findInputTool(input,partno);
      }
      
      //qty.placeholder = 'qty';
      
      return function() {
        var t      = partno.text;
        var valid1 = pattern != undefined ? t.match(pattern) != null : true;
        var qv     = parseInt(qty.text);
		var valid2 = (min != undefined ?  min <= qv : true) && (max != undefined ? max >= qv : true);
	    var valid  = valid1 && valid2;
        console.log('test',t,'qty',qv,'against',input.validation);
        
        //$scope.view.wdg["action-input-validated"].value = valid;
        return valid ? { response:{ partno:t, qty:qv }, type:input.mimeType, time:Date.now() } : undefined;
      }
    }
    var photocapture = function(i) { 
      var input   = i;
      //var src     = $scope.view.wdg.inputCamera;
      //var target  =  $scope.view.wdg["action-input-photo"];
      //target.visible = true;
      
      if (input.tool == undefined) 
        input.tool = "camera";
      //findInputTool(input,target);
            
      return function() {
        //var photo = src.imageUrl;
        //var valid = photo.length > 0;
        
        // here we can use the validation section to manage/tweak the size of the photo
        // todo!!
        //
       
        //$scope.view.wdg["action-input-validated"].value = valid;
        return valid ? { response:photo, type:input.mimeType, time:Date.now() } : undefined;
      }
    }

    
    // chosen functions may turn one or more of these back on again 
//    $scope.view.wdg["action-input-select"].visible   = false;
//    $scope.view.wdg["action-input-photo"].visible   = false;
//    $scope.view.wdg["action-input-value"].visible   = false;
//    $scope.view.wdg["action-input-tool"].visible   = false;
//    $scope.view.wdg["action-input-tool"].disabled  = true;
    //$scope.view.wdg.actionInput2.visible      = false;
    //$scope.view.wdg.actionInputPhoto.visible  = false;

    if (input == undefined) return undefined;
    switch (input.type) {
      case 'scalar'    : return input.validation == undefined ? passThru(input) : input.validation.select != undefined ? selectoneInput(input) : textPattern(input);
      case 'range'   : return input.validation == undefined ? passThru(input) : rangeInput(input);
      case 'quantity': return bomqtyinput(input);
      case 'photo'   : return photocapture(input);
      default: 
        return undefined;
    }
  }

  this.generic = (a) => {
    //console.log(a)
    
    // a step described as one or more actions; we can have optional introduction and conclusion too, so to render out 
    // a step/action, we will show the intro, each action  as it is consumed, and the outro. For multi-action steps, we show the
    // full 
    
    var pdesc = a.step.ongoing != undefined ? "<span style='color:grey;font-size:75%'>" + a.step.ongoing + "</span>" : "";
    var odesc = "";
    var prefix = "";
    if (a.step.actioncount > 1) {
      prefix = (a.index+1).toString() + ". ";
    }
    if (a.isFirst && a.introtext!=undefined) odesc = "<p>" + a.introtext + '</p>';  
    if (a.instruction!=undefined)            odesc = odesc + "<p>" + prefix + a.instruction + "</p>";  
    if (a.isLast && a.outrotext!=undefined)  odesc = odesc + "<p>" + a.outrotext + "</p>";
    
    a.step.ongoing = pdesc + odesc ;
    
    scope.setInstLabel(pdesc+"<span style='color:black;font-size:100%'>" + odesc + "</span>");

    //$scope.view.wdg.actionClass.imgsrc = actionClassLookup(a.type); 
    //$scope.view.wdg.actionClass.visible = true; 
    
    // we should show the right UI for the input type
/*    if (a.input != undefined) {
      $scope.view.wdg["action-input-value"].text = '';
      if (a.input.hint != undefined)
        $scope.view.wdg["action-input-value"].placeholder = a.input.hint.instructions.resources[0].text;
    }
*/             
    //unpack the action subject(s) - also look for associated animations
    //which subject type (resource) can i view - 3d or 2d
    //$scope.view.wdg.alternative.visible = false;
    scope.hidePOIs();

    var isSubjectAnimated    = false;
    var isAnnotationAnimated = false;
    var isToolAnimated       = false;
    if (a.subjects!=undefined) a.subjects.forEach(function(sub) {
                                                  
      var assetId = sub.id;                                            
      if (sub.asset  != undefined) sub.asset.resources.forEach(function(res) {
        if(res.mimeType=="application/vnd.ptc.pvz" || res.mimeType=="model/gltf-binary") {
          var src     = scope.data.anchor + (res.composition == "partset" ? res.modelUrl : res.url);
         
          scope.addNamedPOI(assetId,src,res.translation,genrotation(res.normal),1,false);
          
          // this is speculative - ideally the sxsl wil tell us there is a specific pvi linked to this step
          scope.data.pois[assetId].sequenceToLoad = (res.composition == "partset" ? res.sceneName : "Figure 1");
          isSubjectAnimated = scope.data.pois[assetId].sequenceToLoad != undefined;
        }
        if(res.mimeType=="application/vnd.ptc.pvi") { 
          if (scope.data.pois[assetId] == undefined) scope.data.pois[res.id] = {};
          scope.data.pois[assetId].sequenceToLoad = res.content.animationName;
          isAnimated = true;
        }
        if(res.mimeType=="image/png") {
          //$scope.view.wdg.alternative.imgsrc = $scope.app.params.anchor + res.url;
          //$scope.view.wdg.alternative.visible = true;
        }
        else if(res.mimeType=="image/jpeg") { 
          //$scope.view.wdg.alternative.imgsrc = $scope.app.params.anchor + res.url;
          //$scope.view.wdg.alternative.visible = true;
        }
        else if(res.mimeType=="application/vnd.ptc.poi") { 
          scope.addNamedPOI(res.id,'extensions/images/diamond.pvz',res.translation,genrotation(res.normal),0.1,false);
        }
        else if(res.mimeType=="application/vnd.ptc.partref") { 
          //$scope.view.wdg.subjects.src = $scope.app.params.context.hero;
          //$scope.view.wdg.subjects.visible = true;
        }
      })
    })
    if (isSubjectAnimated) {
      scope.animatePOIs(true); 
    }
    
    if (a.annotations != undefined) {
      var me = a.annotations[0];
      var src = scope.data.anchor + me.asset.resources[0].modelUrl;
      scope.addNamedPOI(me.id,src,undefined,undefined,1,false);
      scope.data.pois[me.id].sequenceToLoad = me.asset.resources[0].sceneName; 
      isAnnotationAnimated = scope.data.pois[me.id].sequenceToLoad != undefined;
    } else {
      //$scope.view.wdg.annotations.visible  = false;
      //$scope.view.wdg.annotations.src      = undefined;
      //$scope.view.wdg.annotations.sequenceToLoad = undefined;
      //$scope.view.wdg.annotations.sequenceList   = undefined;
    }
    //stop any, if already running
    if (!isAnnotationAnimated) {
      //twx.app.fn.triggerWidgetService("annotations", 'stop');
      //$scope.view.wdg.annotations.sequence       = undefined;
      //$scope.view.wdg.annotations.sequenceToLoad = undefined;
    }

    if (a.tools != undefined) {
      // does the tool have any animation defined?
      // note technically we should do this PER tool - in general, we'll assume one tool per action, for this POC at least
      if (a.tools[0] != undefined && a.tools[0].asset != undefined) {
          
        var me = a.tools[0];
        var src = scope.data.anchor + me.asset.resources[0].modelUrl;
        scope.addNamedPOI(me.id,src,undefined,undefined,1,false);
        scope.data.pois[me.id].sequenceToLoad = me.asset.resources[0].sceneName; 
        isToolAnimated = scope.data.pois[me.id].sequenceToLoad != undefined;
      }
                
      // we also want to collect #tools * any details values
      a.tools[0].infoToCollect = {  count: a.subjects != undefined ? a.subjects.length : 1, 
                                  details: a.input
                                 };
                
    } else {
      //$scope.view.wdg.tools.visible  = false;
      //$scope.view.wdg.tools.src      = undefined;
      //$scope.view.wdg.tools.sequenceToLoad = undefined;
      //$scope.view.wdg.tools.sequenceList   = undefined;
    }
    if (!isToolAnimated) {
      //twx.app.fn.triggerWidgetService("tools", 'stop');
      //$scope.view.wdg.tools.sequence       = undefined;
      //$scope.view.wdg.tools.sequenceToLoad = undefined;
    }

    // deliver any references (images etc.) - if there are none, hide the viewer
    this.showReferences(a.refs);
    
          
    // tools and details - tool are used to aid data collection i.e. are linked to inputs
    //
    if (a.tools != undefined) {
      // are referenced from actions, generally as aids to driving and collecting feedback on settings e.g
      // set a torque value and then collect validation that the hero item(s) were torqued to that value

      // not sure if we need to do anything specific here, as the inputs should reference the tool so we can handle it there
    }
    
    return this.findInputValidator(a.input, a.tools);
  }
  
  //find the named action handler
  this.find = (actname) => new Promise((resolve,reject) => {
    
    console.log('...finding',actname,'...');
    
    var action = this.registry[actname];
    if (action != undefined && action.handler != undefined) 
      resolve(action.handler);
    else 
      reject('Error : unable to find action handler '+actname);
  });
    
  // register new actions into the pool
  this.register = (name,act,icon) => {
    this.registry[name] = { handler:act };
  }
  
  
  //CWC actions
  //
  // instructional
  // list
  // verification
  // manual entry
  // calculation
  // part validation
  // smart tool
  //
  
  // note : do NOT create your own actions here - this for internal use only, and the list of actions is managed as 
  //        part of the sxsl spec. here of course we are experimenting, but this code cannot go out into field/customer
  //        examples without there being clear definition of 'supported' and 'unsupported' actions.
  //        in this case, the "instructional" action from CWC has been added
  
  //from original sxsl1 volvo demo
  this.register('ManualPull',this.generic);
  this.register('ManualRotate',this.generic);
  this.register('Assemble',this.generic);
  this.register('Tighten',this.generic);
  this.register('Verify',this.generic);
  this.register('Verification',this.generic);
  //from cwc
  this.register('Instructional',this.generic);
  //from vantage
  this.register('VisualInspection',this.generic);
  this.register('AssetCarousel',this.generic);
  this.register('GenericActionAtPointOfInterest',this.generic);
  this.register('Move',this.generic);
          
}  

// ////////////////////////////////////////////////////////////////////////////////////////////////
// logger
//
// TODO : should this be integral to the player, or separate widget?

var sepsic = scope.$parent.$on('statusUpdateComplete', function(evt) {
  console.log('incremental sent ok');
  scope.logger.sending = undefined;
  
  if (scope.logger.async == undefined) scope.logger.async = $timeout(function(a) {
      var me = a;
      return function() {
        me.incremental(me);
      };
  }(scope.logger),500);
});

scope.data.logger = function(procID) {
  this.id      = procID;
  this.results = [];
  this.pending = [];
  this.sending = undefined;
  this.async   = undefined;
  this.incrementing = false;
  
  //
  // we record start/end events separately, but that's too much for the summary view, so here we will
  // process the data into something more suitable - this gets bound into a repeater
  //
  this.sanitise = function() {
    // turn into a simplified list for ecah step
    // name,start/end/pass/fail - ignore the error code
    var cleansed = [];
    var starts   = {};
    for (var i=0;i<this.results.length;i++) {
      // we're looking to match start and end times

      // if we see a start, mark it
      if (this.results[i].event == "stepstart") starts[this.results[i].id] = i;
      
      // if we find corresponding end, work out duration
      if (this.results[i].event == "stepend" && starts[this.results[i].id] != undefined) {
      
        var j=starts[this.results[i].id];
        var res = (this.results[i].ack == undefined)    ? true :
                  (this.results[i].ack.response == "y") ? true :
                  (this.results[i].ack.response == "p") ? true : false;
        
        var step = {   id: this.results[i].id, 
                    start: this.results[j].time, 
                      end: this.results[i].time, 
                    //dur: this.results[i].time-this.results[j].time, 
                      dur: new Date(this.results[i].duration*1000).toISOString().slice(11, -5),  // seconds 
                   status: res?"pass":"fail"
                   };
        
        cleansed.push(step);
      }
      
      if ((this.results[i].event == "hold" || this.results[i].event == "abort") && starts[this.results[i].id] != undefined) {
        var step = {   id: this.results[i].id, 
                    start: this.results[i].time, 
                   status: this.results[i].event, 
                   reason: this.results[i].ack.response
                   };
        cleansed.push(step);
      }

    }
 
    return cleansed;
  }
  
  //
  // this gets called to process the list of pending event messages back to the server
  // it sends one message and then waits for response (serviceInvokedSuccess) and then get's fired again to check the list
  //
  this.incremental = function(me) {
    me.async = undefined;
    
    if (me.pending.length > 0) {

      //strip out the first item
      var nextMessage = me.pending.splice(0,1);
      me.sending = nextMessage[0];
      
      console.log('incremental sending',JSON.stringify(me.sending));

      me.incrementing = true;
      
      // send the info
      if (scope.data.loggingEnabled) {
        scope.statusField = me.sending;
        scope.$parent.$emit("statusUpdate");    
      } else {
          // we dont get the kickback from twx is we are test mode, so we need to send it ourselves   
          $timeout(function() {
            scope.$parent.$emit("statusUpdateComplete");
        },10);
      }
      
      return;
    }
    else {
      me.incrementing = false;
    }
  }
  
  //
  // called to register an event - the event data object is ammended with the workorder information (sn/product id etc) 
  // and then queued up processing (pending list).  The results list also copi
  //
  this.push = function(data) {
    
    // schedule for submission to Thingworx
    this.pending.push(data);
    
    // loggingEnabled this for the end (confirmation screen to the user)
    this.results.push(data);

    // we need to queue these up as they take time to process...
    console.log('pending incremental',JSON.stringify(data));

    // kick the async "sender" off...
    if (this.incrementing == false && this.async == undefined) this.async = $timeout(function(a) {
      var me = a;
      return function() {
        me.incremental(me);
      };
    }(this),20);
    
  }
  
  //
  // 
  //
  this.submit = function(reason) {
    
    // turn into a simplified list for each step
    // name,start/end/pass/fail - ignore the error code
    this.submission = [];
    for (var i=0;i<this.results.length;i++){
      var res = (this.results[i].event != "stepend")    ? undefined :
                (this.results[i].ack == undefined)    ? true :
                (this.results[i].ack.response == "y") ? true :
                (this.results[i].ack.response == "p") ? true : false;
      
      var ack = (this.results[i].event == "stepstart")  ? undefined :
                (this.results[i].ack == undefined)    ? undefined :
                (this.results[i].ack.response == "y") ? "confirm" :
                (this.results[i].ack.response == "p") ? "pass"    : 
                (this.results[i].ack.response == "f") ? "fail"    : this.results[i].ack.response;
      
      var event = {
                       ID: this.results[i].id.toString(), 
                    event: this.results[i].event, 
                     time: this.results[i].time, 
                     pass: res, 
              acknowledge: ack};
      
      this.submission.push(event);
    }
    
    //
    // technically, we could do this in different ways
    // 1. we could have a central 'logging' service to which we write results
    // 2. as we are accepting a unique Thing with the procedure, we could write back to the Thing - makes a lot of sense to keep the results close (note this Thign could then ask
    //    a manager to distrubute the data)
    // 3. a central Manager wihch route the results 
    
    //Triggers a Service on a Manager Thing that expects the procID and the result and internally hands it over to the correct procedure. is overwritable so that it works with CWC SOWI and others
    //$scope.view.wdg.spinner.visible = true;
    console.log('stopping : sending',JSON.stringify(this.submission));
    
    if (this.id != undefined)
      twx.app.fn.triggerDataService('PTC.InspectionAccelerator.Imp.Manager', 'stopWorkTask', { 'workstationID': $scope.app.params.workstationID,
                                                                                                  'workTaskID': $scope.app.params.Workorder.workinstructionID.toString(),
                                                                                                'serialNumber': $scope.app.params.Workorder.serialnumber, 
      //                                                                                             'summary': JSON.stringify(this.submission),
                                                                                                      'reason': reason} ); 
    else {
      $scope.$emit("stopWorkTask.serviceInvokeComplete");
    }
  }
  
}

// ////////////////////////////////////////////////////////////////////////////////////////////////
// clocker

//
// keep a running tab on how long the step has been running
// main trick is to keep an elapsed time (if we get paused) and just work out the difference between 
// when we (last) started and the time now. Note that we store the intermediate elapsed time in the 
// step.ref i.e. the statement (steps in theory can can be reused).
//
scope.ticker = function(t,v) {
    //console.log('time',t);
    var tock = t/1000;
    var limit = v != undefined ? v : undefined;
    var overrun = limit != undefined ? tock > limit : false;
    scope.clockField = [ { tick: t,
                         target: limit,
                        overrun: overrun } ];
};
    
scope.startStepTimeClock = function(step,callback,scope) {
  var me = scope;
  function clock(step,callback) {
    return $interval((function(step,callback) {
      var s  = step;
      var cb = callback;
      s.ref.clock.start = Date.now();
      console.log('starting timer for step',step.id);
      
      // total elapsed time = saved elapsed + ongoing runtime
      return function() {
        var et = s.ref.clock.elapsedTime + (Date.now() - s.ref.clock.start);
        
        cb(et,s.targetTime);
      }
    })(step,callback),1000);
  }
  
  if (step.ref.clock == undefined) {
    step.ref.clock = { elapsedTime: 0, start: Date.now() };
    //$scope.app.stepIntervalTimerElement.removeClass("overdue");
    
    //re-iniitalise display
    callback(0,undefined);
  }
  
  step.ref.clock.timer = clock(step,callback);
 
  me.stopStepTimeClock = function(step) {
    //make sure we only stop once  
    if (step.ref.clock.timer != undefined) {
      step.ref.clock.elapsedTime += (Date.now() - step.ref.clock.start);
      $interval.cancel(step.ref.clock.timer);
      step.ref.clock.timer = undefined;
      console.log('stopping timer for step',step.id);
    }
  }
  
}


      }
    };
  }

}());
