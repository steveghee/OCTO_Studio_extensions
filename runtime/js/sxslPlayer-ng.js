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
        loggingField: '@',
        disabledField: '@',
        physicalField: '@',
        resourceField: '@',
        reasoncodeField: '@',
        anchorField: '@',
        holoField: '@',
        canrunField: '=',
        runningField: '=',
        clockField: '=',
        trackingField: '=',
        statusField: '=',
        steplistField: '=',
        toollistField: '=',
        consumablesField: '=',
        focusField: '=',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {
          name: undefined,
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
          isProcessThingAvailable: false,
          isToolThingAvailable: false,
          heroWidget: undefined,
          pois: [],
          events:[]
        };

        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        scope.helper = new sxslHelper(scope.renderer, scope.data.anchor);
        scope.canrunField = false;
        scope.runningField = false;

        var startSxslPlayer = function () {

          // can we start yet?  
          if (scope.data.sxsl == undefined) {
            //no, so lets minimse the UI for now...  
            scope.deactivateAll();
            minimise();
            return;
          }

          var eventHandler = {
            on: function (evt, fn) { return scope.$parent.$on(evt, fn) },
            emit: function (evt, arg) { return scope.$parent.$emit(evt, arg) }
          };
          
          scope.logger = new scope.data.logger();
          scope.player = new scope.helper.sxsl2Player(eventHandler, scope.helper, scope.procValidator, scope.stepValidator)
            .fromData(scope.data.sxsl)
            .then((proc) => {
                  
              scope.data.events = [];
              var registerEvent = function(evt,fn) {
                scope.data.events.push(proc.events.on(evt,fn));
              }
          
              console.log('loaded', proc.getStepList().length, 'steps');
              scope.canrunField = true;
              scope.runningField = true;
              scope.toollistField = proc.getToolList();
              scope.consumablesField = proc.getConsumables();
              
              // time to wake up the UI
              maximise();
              
              registerEvent('procStart', function (evt, proc) {
                scope.setHeadLabel(proc.title);
                scope.steplistField = proc.getStepList();

                scope.logger.push({
                  id: proc.id,
                  event: "procstart",
                  time: Date.now()
                });
                console.log('<<<<<<<<<<<<<<<<<<<<<<<\nstarting proc', proc.id, proc.intro);
              });

              registerEvent('stepStart', function (evt, step) {
                console.log('+++++++++++++++++++++++\nstarting step', step.id, step.title);
                scope.setHeadLabel(step.title);
                scope.setStepLabel(proc.sti + " OF " + proc.statementcount);

                scope.startStepTimeClock(step, scope.ticker, scope);

                scope.logger.push({
                  id: step.id,
                  event: "stepstart",
                  time: Date.now()
                });

                if (scope.data.firstStep) {
                  scope.data.firstStep = false;

                  expandContract();

                  //add the contextual model, if defined
                  if (scope.data.context.model != undefined)
                    scope.addNamedPOI('context', scope.data.context.model, undefined, undefined, scope.data.context.scale, false, scope.data.context);


                }
              });

              registerEvent('procEnd', function (evt, procedure) {
                console.log('ending proc', procedure.id + '\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

                scope.setHeadLabel(procedure.title);
                scope.canrunField = false;
                scope.runningField = false;

                scope.logger.push({
                  id: procedure.id,
                  event: "procend",
                  time: Date.now()
                });
                    
                if (procedure.consumed != undefined) 
                  console.log('in total, we consumed', procedure.consumed);     
                    
                //and signal termination    
                scope.$parent.$emit("finished");
              });

              registerEvent('stepEnd', function (evt, step) {
                scope.stopStepTimeClock(step);
                hidepassfail();

                //update the list
                scope.steplistField = proc.getStepList();

                scope.logger.push({
                  id: step.id,
                  event: "stepend",
                  time: Date.now(),
                  duration: Math.floor(step.ref.clock.elapsedTime / 1000).toString(), // seconds
                  ack: step.ack
                });
                    
                if (step.ref.consumed != undefined) 
                  console.log('for this step, we consumed',step.ref.consumed);     
                    
                console.log('completing step', step.id + '\n---------------------------', step.outro);
              });

              registerEvent('procPause', function (evt, reason) {
                console.log('proc pause');
                scope.logger.push({
                  id: reason.step.id,
                  event: reason.event,
                  time: Date.now(),
                  ack: { response: reason.reason }
                });
              });

              registerEvent('procResume', function (evt, reason) {
                console.log('proc resume');
                scope.logger.push({
                  id: reason.step.id,
                  event: reason.event,
                  time: Date.now()
                });
                maximise();
              });

              registerEvent('procHalt', function (evt, reason) {
                console.log('halting proc\n============================');

                //stop the clock    
                if (reason.step) scope.stopStepTimeClock(reason.step);
                scope.canrunField = false;
                scope.runningField = false;

                scope.logger.push({
                  id: reason.step != undefined ? reason.step.id : "",
                  event: reason.event,
                  time: Date.now(),
                  ack: { response: reason.reason }
                });

                //shut down the UI    
                scope.deactivateAll();
                minimise();

                //and signal termination    
                scope.$parent.$emit("terminated");
              });

              registerEvent('stepProofPending', function (evt, proof) {
                console.log('step proof pending - please provide ', proof.length, 'items');
                $timeout(function () { collectProof(proof); }, 10);
              });

              registerEvent('stepProofDelivered', function (evt, proof) {
                console.log('step proof delivered');
                scope.logger.push({
                  id: proof.step.id,
                  event: proof.event,
                  time: Date.now(),
                  proof: proof.proof
                });
              });

              registerEvent('actionInputPending', function (evt, input) {
                console.log('action input pending', input.type);
                scope.advanceWindow.className = 'sxsl-button sxsl-button-round sxsl-icon-nav-right';
              });

              registerEvent('actionInputDelivered', function (evt, input) {
                console.log('action input delivered');
                hideCapture();
                scope.logger.push({
                  id: input.step.id,
                  event: input.event,
                  time: Date.now(),
                  response: input.action.details.response
                });
              });

              registerEvent('stepCompletionPending', function (evt, step) {
                console.log('step completion pending');
                scope.stopStepTimeClock(step);

                var ack = step.ack;
                if (ack != undefined) {
                  if (ack.reasonCodes != undefined)
                    scope.presentErrorCodes(ack.reasonCodes, undefined);

                  switch (ack.type) {
                    case "Confirmation":
                      //twx.app.fn.triggerWidgetService('confirm', 'setq');
                      showverify();
                      break;
                    case "PassFail":
                      if (ack.reasonType == "Code") showpasserrorcode();
                      else showpassfail();
                      break;
                    default:
                      break;
                  }
                }

              });

              registerEvent('actionStart', function (evt, action) {
                console.log('action Start');
                scope.toollistField    = proc.getToolList(action.id);
                scope.consumablesField = proc.getConsumables(action.id);
                hideCapture();
              });

              registerEvent('actionEnd', function (evt, action) {

                console.log('completing action', action.type);
                
                scope.toollistField    = [];
                scope.consumablesField = [];
                
                // disarm any tools that were in use
                if (action.tools != undefined && action.tools[0].disarm != undefined) {
                  action.tools[0].disarm();
                }
                
                // were there any materials consumed in this action?
                //
                if (action.materials != undefined) {
                    
                  // TODO: should we roll these up at the step/proc level?  
                  
                  
                  // let's log the info
                  scope.logger.push({
                    id: action.materials.id,
                    event: "materialConsumed",
                    time: Date.now(),
                    response:action.materials
                  });
                }
              });

              registerEvent('actionBypass', function (evt, action) {
                console.log('skipping action', action.type);
              });

              registerEvent('stepBypass', function (evt, step) {
                console.log('step bypass');
                hidepassfail();
                scope.stopStepTimeClock(step);

                scope.logger.push({
                  id: step.id,
                  event: "bypass",
                  time: Date.now(),
                  ack: undefined
                });
              });
                  
                  
              scope.actions = new scope.sxsl2Actions(scope.helper);

              proc.start()
                .then(intro => {
                  console.log('intro', intro);

                  if (scope.thumbnail) {
                    scope.thumbnail.src = proc.thumbnail;
                  }
                  scope.actions.start(intro);

                  scope.pushInput = function (value) {
                    return proc.pushInput(value);
                  }

                  scope.input = function () {

                    //run the validator we were given (by the action)  
                    scope.inputValidator()
                      .then((validated) => {

                        scope.setFeedbackLabel('Confirmed. Press (>) to proceed');

                        //we have valid content, so we can enable the next button    
                        scope.advanceWindow.className = 'sxsl-button sxsl-button-round sxsl-blue-bb sxsl-icon-nav-right';
                        return scope.pushInput(validated);
                      })
                      .catch(e => {

                        scope.setFeedbackLabel(e);

                        //invalid input / content
                        console.log('invalid input content', e);
                        return false;
                      })
                  };

                  scope.proof = function (proof) {

                    proc.proof({ event: 'proof' }, proof) // this should fire procProofDelivered event
                      .then(() => {
                        //TODO : twx.app.fn.triggerWidgetService('proofRequired', 'resetq');
                        scope.next('@');
                      })
                      .catch(e => {
                        console.log(e.msg);
                      })
                  };

                  scope.resume = function (auto) {
                    proc.resume(auto)
                      .then((state) => {

                        // Restart Timer
                        scope.startStepTimeClock(state.step, scope.ticker, scope);
                        scope.runningField = true;
                      })
                  };

                  scope.halt = function (reason) {
                    proc.halt(reason) // this should fire procHalt event
                      .then(() => {

                        // note we dont terminate immediately, but put up progress/done button
                        scope.data.results = scope.logger.sanitise();

                        scope.data.disabled = true;
                        scope.runningField = false;
                        scope.canrunField = false;
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  };

                  scope.pause = function (reason) {
                    proc.pause(reason)
                      .then((state) => {

                        // stop the timer
                        scope.stopStepTimeClock(state.step);
                        scope.runningField = false;
                      })
                  };

                  scope.next = function (k, j) {
                    proc.next(k, j)
                      .then(a => {

                        //
                        // action processing
                        //

                        if (a.type == undefined)
                          console.log('no action');
                        else
                          scope.actions.find(a.type)
                            .then((act) => {
                              scope.inputValidator = act(a);
                            })
                            .catch((err) => {
                              console.log(err);
                            });


                      })
                      .catch(e => {
                        if (e.cmd == 'end') proc.end()
                          .then(conclusion => {

                            // finish things up
                            scope.actions.end(conclusion);

                            // TODO : let thingworx know? 
                            //                                                scope.statusField = scope.logger.sanitise();
                            console.log('results:', JSON.stringify(scope.logger.results, null, ' '));
                          })
                          .catch(e => {

                            // abort
                            var abortmsg = "Procedure failed<p>" + e.reason;
                            scope.actions.end(abortmsg);

                            proc.events.emit('procHalt', { event: e.event, reason: abortmsg });
                          })
                        else if (e.cmd == 'ack') {
                          // we are waiting for user input      
                          console.log(e.msg);
                          return;
                        }
                        else if (e.cmd == 'proof') {
                          // we are waiting for user input - proof of condition required      
                          console.log(e.msg);
                          return;
                        }
                        else if (e.cmd == 'input') {
                          // we are waiting for user input      
                          console.log(e.msg);
                          return;
                        } else {
                          console.log(e.msg);

                          proc.halt(e.msg) // this should fire procHalt event
                            .then(() => {
                              //
                              // is there anything else we need to do here?    
                              // e.g. scope.logger.submit()("halt");

                            })
                        }

                      })

                  };
                  if (scope.data.isHolo) {

                    //hololens platform not supported at this thisime  
                    scope.canrunField = false;

                    scope.logger.push({
                      id: proc.id,
                      event: 'halt',
                      time: Date.now(),
                      ack: { response: 'hololens platform unsupported' }
                    });

                    scope.$parent.$emit("terminated");
                  }

                })
                .catch(e => {
                  console.log('proc error' + e);
                });
            });
        };

        var executesxslPlayer = function () {
          var active = scope.canrunField && scope.runningField;
          var sleepy = scope.canrunField && !scope.runningField;
          if (!scope.data.disabled) {
            console.log('physical', scope.data.physical);
            scope.steplistField = scope.data.steplist;

            if (sleepy)
              scope.resume(true);

          } else {
            console.log('disabled');
            scope.trackingField = false;
            scope.steplistField = undefined;

            if (active) {
              scope.pause({ reason: 'widget disabled', event: 'pause' });
            
              minimise();
            }

          }
        };

        var halt = function () {
          console.log('halting for reason', scope.data.reasonCode);
          scope.data.disabled = true;
          scope.halt({ event: 'halt', reason: scope.data.reasonCode });
        }
        var pause = function () {
          console.log('pausing for reason', scope.data.reasonCode);
          scope.data.disabled = true;
          scope.pause({ event: 'halt', reason: scope.data.reasonCode });
          executesxslPlayer();
        }
        var next = function () {
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

        //detail capture (inputs)
        var capturePhoto = function () {
          console.log('grabbing input photo');
          scope.input();
        }
        var selectedCaptureEnum = function () {
          var value = scope.captureEnumWindow.value;
          console.log('user selected', value);
          scope.input();
        }

        // this is, for now, taking the photo directly.
        //
        // UI is provided to prompt the user to point the camera
        // in the right direction. Information is provided (guide images, text) that should
        // be displayed
        //
        var captureProofPhoto = function () {
          scope.captureProofPhoto();
        }
        var collectProof = function (required) {

          var collectedProof = [];
          scope.data.collecting = required;
          let numberToCollect = required.length;

          //call camera to get proof
          console.log('step proof pending - need to collect ', required.length, 'items');

          var gatherProof = function () {
            showProof();
            var collect = (scope.data.collecting.length > 0) ? scope.data.collecting.pop() : undefined; // pop item off the arry
            if (collect != undefined) {

              //how the ui
              var textHint = collect.instructions != undefined &&
                collect.instructions.resources != undefined &&
                collect.instructions.resources[0] != undefined ? collect.instructions.resources[0].text : "";
              var imgHint = collect.guides != undefined &&
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

          scope.captureProofPhoto = function () {
            hideProof();
            var params = { withAugmentation: true, imageWidth: 640, imageHeight: 480 };
            //  params = { dataURL:bool, withAugmentation: bool, imgFormat: string, imgWidth: number, imgHeight:number} 
            scope.renderer.takeScreenshot(params, photoSuccess, photoCancel);
          }

          //minimse the main UI
          minimise();
          //show the helper UI
          gatherProof();
        }
        var selectedErrorCode = function () {
          var value = scope.errorcodelistWindow.value;
          //console.log('you clicked',value);

          if (value != undefined) {

            // if we have children, we show them
            //
            var kids = scope.presentErrorCodesAsHTML(scope.data.errorcodes, value);

            if (kids.length > 0) {
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

        var hideProof = function () {
          scope.proofWindow.className = 'sxsl-proof-hide';
        }
        var showProof = function () {
          scope.proofWindow.className = 'sxsl-proof-container';
        }

        var minimise = function () {
          const t1 = document.querySelector('div.sxsl-instruction-container');
          t1.className = 'sxsl-instruction-container-hide';
          const t2 = document.querySelector('div#sxsl-instruction-max');
          t2.className = 'sxsl-thumbnail-show';
          minimisePreview()
        }
        var minimisePreview = function () {
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'preview-container-collapsed';
          const t4 = document.querySelector('div#previewPanel');
          t4.className = 'sxsl-preview-panel-collapsed';
        }
        var hidePreview = function () {
          const t1 = document.querySelector('div.sxsl-instruction-container');
          t1.className = 'sxsl-instruction-container-hide';
          const t2 = document.querySelector('div#sxsl-instruction-max');
          t2.className = 'sxsl-thumbnail-show';
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'sxsl-preview-hide';
          const t4 = document.querySelector('div#viewer-container');
          t4.className = 'viewer-container';

        }
        var showReview = function (src, desc, isVideo) {
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
          if (desc != undefined) {
            const t7 = document.querySelector('div#viewinfo');
            t7.innerHTML = desc;
          }
        }
        var hideReview = function () {
          maximise();
        }
        var maximise = function () {
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
        var maximisePreview = function () {
          const t3 = document.querySelector('div#preview-container');
          t3.className = 'preview-container';
          const t4 = document.querySelector('div#previewPanel');
          t4.className = 'sxsl-preview-panel';
        }
        var expandContract = function () {
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
        var hideCapture = function () {
          const t5 = document.querySelector('button#activateCapture');
          t5.className = 'sxsl-actions-hide';
          const t6 = document.querySelector('div#enumeratedCapture');
          t6.className = 'sxsl-capture-hide';
          const t7 = document.querySelector('input#captureText');
          t7.className = 'sxsl-capture-hide';
          const btn2e = document.querySelector('button#addCapture');
          btn2e.className = 'sxsl-capture-hide';
          var target = document.querySelector('img#photoCapture');
          target.className = "sxsl-capture-hide";
          scope.setFeedbackLabel("");
        }
        var showpassfail = function () {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-show';
          const t2 = document.querySelector('div#verify');
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
        var showpasserrorcode = function () {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-show';
          const t2 = document.querySelector('div#verify');
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
        var hidepassfail = function () {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-hide';
          const t2 = document.querySelector('div#verify');
          t2.className = 'sxsl-passfailverify-hide';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-hide';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
        }
        var showverify = function () {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-hide';
          const t2 = document.querySelector('div#verify');
          t2.className = 'sxsl-passfailverify-show';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-show';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
        }
        var clear = function () {
          const t1 = document.querySelector('div#passfail');
          t1.className = 'sxsl-passfailverify-hide';
          const t2 = document.querySelector('div#verify');
          t2.className = 'sxsl-passfailverify-hide';
          const t3 = document.querySelector('div#actions');
          t3.className = 'sxsl-actions-hide';
          const t4 = document.querySelector('div#capture');
          t4.className = 'sxsl-capture-hide';
        }

        function addNamedShape(name, shape, show, pass, fail) {
          scope.renderer.addPVS(scope.data.context.target.id, name, shape, undefined, undefined, () => {

            // we added the model, so set the location
            scope.renderer.setTranslation(name, 0, 0, 0);
            scope.renderer.setRotation(name, 0, 0, 0);
            scope.renderer.setScale(name, 1, 1, 1);
            scope.renderer.setProperties(name, { hidden: !show });
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

        function getContext(context, cscope) {

          if (context == undefined) return {};

          // look through the context to find a a suitable model to display - if we are physical, we will show "full" (or occluder if full not avilable)
          // otherwise we use occluder
          //
          // todo : should we allow useExternalContext setting and, if defined, we use existing 'model' as the context 
          //
          var contextual = {};
          if (context.models != undefined) context.models.forEach(function (model) {
            if (model.tags != undefined) model.tags.forEach(function (tag) {
              switch (tag) {
                case "full":
                  contextual.model = cscope.data.anchor + model.url;
                  contextual.mime = model.mimeType;
                  contextual.scale = model.scale != undefined ? model.scale : 1;
                  contextual.tag = tag;
                  console.log("using", tag);
                  break;
                case "occlusion":
                  if (contextual.tag === undefined || contextual.tag != "full") {
                    contextual.model = cscope.data.anchor + model.url;
                    contextual.scale = model.scale != undefined ? model.scale : 1;
                    contextual.mime = model.mimeType;
                    contextual.tag = tag;
                  }
                  console.log("using", tag);
                  break;
                case "heroes":
                  contextual.hero = cscope.data.anchor + model.url;
                  break;
              }
            });
          });

          contextual.target = {};
          
          // does an external (this view) target already exist? if so lets use that
          // todo : we should probably leave this to the widget user e.g. a boolean "useExistingContext" settinf
          //
          var targetExists = document.querySelector("twx-dt-target");
          if (targetExists != null) {
            contextual.target.isExistingTarget = true;  
            contextual.target.tracker = 'tracker1';
            contextual.target.id = targetExists.id;
            var tgtsrc = targetExists.attributes['src'].value;
            var tgttype = tgtsrc.split(':')[0];
            switch (tgttype) {
              case "spatial": contextual.target.mimeType = "application/vnd.ptc.tracker.spatialtracker"; break;
              case "vuforia-model": contextual.target.mimeType = "application/vnd.ptc.tracker.modeltracker"; break;
              case "vuforia-image": contextual.target.mimeType = "application/vnd.ptc.tracker.imagetracker"; break;
              case "vuforia-area": contextual.target.mimeType = "application/vnd.ptc.tracker.areatracker"; break;
              case "vuforia-vumark": contextual.target.mimeType = "application/vnd.ptc.tracker.thingmarktracker"; break;
              default: contextual.target.mimeType = "application/vnd.ptc.tracker.unknown"; break;
            }
          }
          // 
          // otherwise, find the context target definition within the sxsl, and create a new target tracker for this
          //
          else if (context.trackers != undefined) {
            context.trackers.forEach(function (tracker) {
              switch (tracker.mimeType) {
                case "application/vnd.ptc.tracker.advancedmodeltracker":
                case "application/vnd.ptc.tracker.modeltracker":
                  var target = 'vuforia-model:///' + cscope.data.anchor;

                  var tgt = tracker.content.dataset.dat;
                  var urlidx = tgt.lastIndexOf('.dat');
                  target = target + tgt.substring(0, urlidx) + '?id=' + tracker.content.targetName;

                  if (contextual.target.mimeType != "application/vnd.ptc.tracker.advancedmodeltracker") {
                    contextual.target.mimeType = tracker.mimeType;
                    contextual.target.target = target;
                    contextual.target.position = tracker.content.offset != undefined && tracker.content.offset.translation != undefined 
                                               ? new Vector4().Set3a(tracker.content.offset.translation)
                                               : new Vector4();
                    contextual.target.rotation = tracker.content.offset != undefined && tracker.content.offset.rotation != undefined 
                                               ? new Quat().Set4a(tracker.content.offset.rotation)
                                               : new Quat().Set4(0,0,0,1);
                    contextual.target.size = tracker.content.offset != undefined ? tracker.content.offset.size : undefined;

                    if (tracker.content.guideView != undefined) {
                      contextual.target.guidesrc = cscope.data.anchor + tracker.content.guideView.url;
                    } else if (tracker.guideview != undefined) {
                      contextual.target.guidesrc = cscope.data.anchor + tracker.guideview.url;
                    } else {
                      contextual.target.guidesrc = "";
                    }
                    contextual.target.id = tracker.content.targetName;
                  }
                  break;
                default:
                  contextual.target = undefined; // this is an error
                  break;
              }
            });

            var wscope = cscope; //grab the scope into local var

            // now create the tracker here
            var markerDef = [{ src: contextual.target.target }];
            wscope.renderer.loadTrackerDef(markerDef, (successMarkerSrcs) => {
                                          
              contextual.target.isExistingTarget = false;  
              contextual.target.tracker = 'tracker1';
              wscope.renderer.addTracker(contextual.target.tracker, () => {
                                         
                wscope.renderer.addMarker(contextual.target.tracker, contextual.target.id, contextual.target.target, contextual.target.size, () => {
                                          
                  var tgtmat = new Matrix4().RotateFromQuaternion(contextual.target.rotation).TranslateV(contextual.target.position.v).ToPosEuler(true);
                  wscope.renderer.setTranslation(name, tgtmat.pos.X(), tgtmat.pos.Y(), tgtmat.pos.Z());
                  wscope.renderer.setRotation(name, tgtmat.rot.X(), tgtmat.rot.X(), tgtmat.rot.X());
                  wscope.renderer.setScale(name, 1, 1, 1);
                  
                  if (typeof (wscope.renderer.addTargetGuide) === "function") {
                    wscope.renderer.addTargetGuide({ tracker: contextual.target.tracker, target: contextual.target.id, src: contextual.target.guidesrc });
                  } else {
                    var targetGuideDiv = document.querySelector("div.targetGuide");
                    if (targetGuideDiv && contextual.target.guidesrc != undefined) {

                      wscope.data.guide = contextual.target.guidesrc;
                      var pscope = wscope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
                      pscope.hideTargetGuide = false;
                      pscope.targetGuideClass = "imagemark";
                      targetGuideDiv.style.backgroundImage = "url('" + contextual.target.guidesrc + "')";
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
        
        //
        //todo : we should only be doing this IF we are responsible for the tracking
        scope.$root.$on('trackingacquired', function (event, args) {
          var targetGuideDiv = document.querySelector("div.targetGuide");
          if (targetGuideDiv) {
            var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
            pscope.hideTargetGuide = true;
            targetGuideDiv.style.backgroundImage = "";
            pscope.$applyAsync();
          }
          scope.trackingField = true;
        });

        scope.$root.$on('trackinglost', function (event, args) {
          var targetGuideDiv = document.querySelector("div.targetGuide");
          if (targetGuideDiv) {
            var pscope = scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent;
            pscope.hideTargetGuide = false;
            targetGuideDiv.style.backgroundImage = "url('" + scope.data.guide + "')";
            pscope.$applyAsync();
          }
          scope.trackingField = false;
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////    
        // step managment

        function getSteps(proc) {

          var steplist = [];
          if (proc.statements != undefined) proc.statements.forEach(function (statement, idx) {
            var stepid = statement.stepId;
            //now find the step
            for (var i = 0; i < proc.steps.length; i++) {
              if (proc.steps[i].id == stepid) {
                //found it
                var step = proc.steps[i];
                var title = step.title != undefined ? step.title.resources[0].text : step.id;
                steplist.push({ display: title, value: idx });
                break;
              }
            }
          });
          return steplist;
        }

        scope.$watch('anchorField', function () {
          if (scope.anchorField != undefined && scope.anchorField.length > 0) 
            scope.data.anchor = scope.anchorField;           
        })
        
        const isValidUrl = urlString => {
          try { 
      	    return Boolean(new URL(urlString)); 
          }
          catch(e){ 
      	    return false; 
          }
        }
        
        const isSxsl = val => {
          try { 
            val = JSON.parse(val);
          }
          catch(e){ 
      	    return false; 
          }
            
          if (val === null) { return false;}
          return (typeof val === 'object') && val.sxslVersion != undefined ;
        }

        scope.$watch('resourceField', function () {
          scope.data.src = (scope.resourceField != undefined) ? scope.resourceField : '';
          if (scope.data.src != undefined && scope.data.src.length > 0 && !isSxsl(scope.data.src)) {
              
            // hopefullly this has already been set
            if (scope.anchorField != undefined && scope.anchorField.length > 0) {
              scope.data.anchor   = scope.anchorField;           
            } else {
              scope.data.anchor = scope.data.src.slice(0, scope.data.src.lastIndexOf('/') + 1);
            }
            if (scope.helper) scope.helper.anchor = scope.data.anchor;

            $http.get(scope.data.src)
              .success(function (data, status, headers, config) {

                if (data != undefined) {
                  var proc = scope.data.sxsl = data;

                  //for now. let's just grab the context block...      
                  var context = proc.contexts != undefined ? proc.contexts[Object.keys(proc.contexts)[0]] : undefined;
                  scope.data.context = getContext(context, scope);

                  // and the steps
                  scope.data.steplist = getSteps(proc);
                  startSxslPlayer();
                }
              })
              .error(function (data, status, headers, config) {
                console.log(status);
              });
          } else if (scope.data.src != undefined && scope.data.src.length > 0) {
              
            // lets assume/hope its the sxsl in string form
            var proc = scope.data.sxsl = JSON.parse(scope.data.src);
            
            // hopefullly this has already been set
            if (scope.anchorField != undefined && scope.anchorField.length > 0) {
              scope.data.anchor   = scope.anchorField;           
              scope.helper.anchor = scope.data.anchor;
            }

            //for now. let's just grab the context block...      
            var context = proc.contexts != undefined ? proc.contexts[Object.keys(proc.contexts)[0]] : undefined;
            scope.data.context = getContext(context, scope);

            // and the steps
            scope.data.steplist = getSteps(proc);
            startSxslPlayer();
             
          }

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

        scope.$watchGroup(['physicalField', 'disabledField', 'holoField', 'loggingField'], function () {
          scope.data.physical = (scope.physicalField != undefined && scope.physicalField === 'true') ? true : false;
          scope.data.disabled = (scope.disabledField != undefined && scope.disabledField === 'true') ? true : false;
          scope.data.isHolo = (scope.holoField != undefined && scope.holoField == 'true') ? true : false;
          scope.data.loggingEnabled = (scope.loggingField != undefined && scope.loggingField == 'true') ? true : false;
          executesxslPlayer();
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function () { return scope.steplistField != undefined ? JSON.stringify(scope.steplistField.selectedRows) : '' },
          function (value) {
            if (value != undefined && scope.steplistField != undefined) {
              var parsed = JSON.parse(value);
              // check if we CAN run
              if (scope.canrunField && scope.runningField &&
                  //and if we can, then do we have a valid jump point?
                  parsed != undefined && parsed.length == 1 && parsed[0].status != 'done') {
                console.log('being directed to move to', value);
                scope.next('j', parsed[0].idx);
              } else {
                //TODO; we should probably emit some event here saying we're not able to do what was asked
                console.log('ignoring', value);
              }
            }
          });


        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.reset = function () {
              if (scope.runningField == true)
                scope.halt({event:'reset', reason:'reset'})
              //TODO: and now we need to reset/restart the main proc
              $timeout(startSxslPlayer(),1000);  
            };
            delegate.resume = function () {
              if (scope.canrunField == true)
                scope.resume(true)
            };
            delegate.ready = function () {
              $timeout(function () {
                //TODO : rename this event     
                scope.$parent.$emit("statusUpdateComplete");
              }, 10);
            }
          }
        });

        scope.presentErrorCodesAsHTML = function (reasonCodes, parent) {

          var header = "<option class='item'>Select...</option>";
          var display = "";
          reasonCodes.forEach(function (item) {
            if (item.parent == parent) {
              display = display + "<option class='sxsl-item' value=" + item.code + ">" + item.resources[0].text + "</option>";
            }
          });
          return display.length > 0 ? header + display : display;
        }

        scope.presentErrorCodes = function (codes, level) {
          scope.data.errorcodes = codes;
          scope.errorcodelistWindow.innerHTML = scope.presentErrorCodesAsHTML(codes, level);
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
              <div id='enumeratedCapture' class='sxsl-select sxsl-button-fail sxsl-capture-hide'>\
                <div id='enumChooser' style='margin:8px'>Choose</div>\
                <select id='captureEnums'>\
                  <option class='sxsl-item' value='unkown'>TBD</option>\
                </select>\
              </div>\
              <div style='left:24px;display:flex;'><input type='text' id='captureText' class='sxsl-capture-hide sxsl-capture-text' style='    padding: 20px;' placeholder='...'></input><button id='addCapture' class='sxsl-button sxsl-capture-button' >Submit</button></div>\
              <div style='left:24px;'><img id='photoCapture' class='sxsl-capture-photo sxsl-capture-hide'></img></div>\
              <div style='right:24px'><button id='activateCapture' class='sxsl-button sxsl-capture-activate sxsl-capture-hide' >Activate</button></div>\
              <div id='captureFeedback' class='sxsl-capture-feedback'>info here</div>\
            </div>";
          scope.sxslPlayerWindow.id = 'sxsl-instruction-container';
          scope.sxslPlayerWindow.className = 'sxsl-instruction-container';

          container.insertBefore(scope.sxslPlayerWindow, container.firstChild);
          container.insertBefore(scope.sxslPlayerWindowMinimised, container.firstChild);

          scope.headLabel = document.querySelector('div#header');
          scope.instLabel = document.querySelector('div#action');
          scope.thumbnail = document.querySelector('img#thumbnail');
          scope.stepLabel = document.querySelector('div#stepinfo');
          scope.feedbackLabel = document.querySelector('div#captureFeedback');

          scope.setHeadLabel = function (text) {
            scope.headLabel.innerHTML = text;
          }
          scope.setInstLabel = function (text) {
            scope.instLabel.innerHTML = text;
            scope.instLabel.scrollTop = scope.instLabel.scrollHeight;
            scope.instLabel.scrollIntoView(false);
          }
          scope.setStepLabel = function (text) {
            scope.stepLabel.innerHTML = text;
          }
          scope.setFeedbackLabel = function (text) {
            scope.feedbackLabel.innerHTML = text;
          }

          scope.errorcodelistWindow = document.querySelector('select#errorcodelist');
          scope.errorcodelistWindow.addEventListener('change', selectedErrorCode);

          scope.advanceWindow = document.querySelector('button#advance');
          scope.advanceWindow.addEventListener('click', next);
          const btn2a = document.querySelector('button#minimise');
          btn2a.addEventListener('click', minimise);
          const btn2b = document.querySelector('button#maximise');
          btn2b.addEventListener('click', maximise);
          const btn2c = document.querySelector('button#expandcontract');
          btn2c.addEventListener('click', expandContract);
          const btnPass = document.querySelector('button#pass');
          btnPass.addEventListener('click', function () {
            scope.next('p');
          });
          const btnFail = document.querySelector('button#fail');
          btnFail.addEventListener('click', function () {
            scope.next('f');
          });
          const btnack = document.querySelector('input#acknowledge');
          btnack.addEventListener('change', function () {
            var val = btnack.checked;                      
            console.log('verify=',val);
            if (val) scope.next('y');
            btnack.checked = false;
          });
          //capture photo button
          const btn2d = document.querySelector('button#activateCapture');
          btn2d.addEventListener('click', capturePhoto);
          //capture photo button
          const btn2e = document.querySelector('button#addCapture');
          btn2e.addEventListener('click', function () {
            scope.input();
          });

          scope.captureTextWindow = document.querySelector('input#captureText');

          scope.captureEnumWindow = document.querySelector('select#captureEnums');
          scope.captureEnumWindow.addEventListener('change', selectedCaptureEnum);
          const btn2f = document.querySelector('input#captureText');
          btn2f.addEventListener("change", function () {
            scope.input();
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
          scope.referenceViewerWindow.id = 'viewer-container';
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
              <div style='display:flex;vertical-align: middle; align-items: center;'>\
                <img id='proofHint' class='sxsl-proof-hint' src='app/resources/Uploaded/example101/beauties.jpg' width=128/>\
                <button id='proofCapture' class='sxsl-button sxsl-button-round sxsl-icon-to-do' style='position:relative;left: 12px;'/> \
              </div>\
              <div id='proofInstruction' class='sxsl-proof-text'>text here</div>\
            </div>"
          scope.proofWindow.id = 'proof-container';
          scope.proofWindow.className = 'sxsl-proof-hide';

          container.insertBefore(scope.proofWindow, container.firstChild);

          //capture button
          const btn2b = document.querySelector('button#proofCapture');
          btn2b.addEventListener("click", captureProofPhoto);

          scope.proofInstruction = document.querySelector('div#proofInstruction');
          scope.proofHint = document.querySelector('img#proofHint');
          scope.setProofHints = function (text, img) {
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
          scope.referencePreviewWindow.id = 'preview-container';
          scope.referencePreviewWindow.className = 'preview-container-collapsed';

          container.insertBefore(scope.referencePreviewWindow, container.firstChild);

          scope.previewList = document.querySelector('div#previewList');
          scope.setPreviewList = function (contents) {
            scope.previewList.innerHTML = contents;
          }
        };
        var datasink = function (text) {
          console.log('swallowing this text :', text);
        }
        scope.setHeadLabel = datasink;
        scope.setInstLabel = datasink;
        scope.setStepLabel = datasink;
        scope.setPreviewList = datasink;

        scope.$root.$on("$ionicView.afterEnter", function (event) {
          if (!scope.data.isHolo) {
            createInstructionPanelHTML();
            createReferencePreviewHTML();
            createReferenceViewerHTML();
            createProofCaptureHTML();

            startSxslPlayer();
          } else {
            //TODO : creaate holographic UI

            //for now...

          }
        });
        scope.$root.$on("$ionicView.beforeLeave", function (event) {
          // clean up

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
            return [0, 0, 0];

          //otherwise
          var up = new Vector4().Set3a(normal);
          var rg = new Vector4().Set3(1, 0, 0);
          var gz = up.CrossP(rg);
          rg = up.CrossP(gz);
          var rot = new Matrix4().Set3V(rg, up, gz).ToPosEuler(true).rot;
          return rot.v;
        }

        // add them as we need them - a better version might use a re-usable pool of shapes but let's keep 
        // it simple for now
        scope.$parent.$on('stepcompleted', function (event, target, unused, data) {
          //console.log('stepcomplete for',target,data);
          var me = scope.data.pois[target];

          if (me.animated) {

            var currentStep = me.seqplayer.getCurrentStep();

            //console.log('on step',currentStep);
            if (currentStep > me.seqplayer.getTotalSteps()) {
              //console.log('resetting...');  
              me.seqplayer.reset(function () {
                $timeout(me.seqplayer.playSequence, 100);
              });
            } else
              $timeout(me.seqplayer.playSequence, 100);
          }
        });

        scope.addNamedPOI = function (name, shape, pos, rot, scale, hide, context, seq, oid) {

          //does this item exist already - are we reusing it
          if (scope.data.pois[name] != undefined) {

            console.log('reusing', name);
            var me = scope.data.pois[name];

            //it must be the occurrences that have change - 
            //undo the old ones
            if (me.occurrenceIds != undefined) {
              me.occurrenceIds.forEach(function(id) {
                if (oid != undefined && !oid.includes(id))                       
                  scope.renderer.setProperties(name+"-"+id, { hidden: true });                                                            
              });
            }
            //add the new ones
            if (oid != undefined) {
              oid.forEach(function(id) {
                scope.renderer.setProperties(name+"-"+id, { hidden: false, shader: "sxsl_proximityHilitegl"});                                                            
              });
              me.occurrenceIds = oid;    
            } else {
              scope.renderer.setProperties(name+"-/", { hidden: false, shader: "sxsl_proximityHilitegl"});                        
              me.occurrenceIds = ['/'];    
            }

            me.hidden = false;
            me.active = true;
            me.deactivated = false;
            
            if (me.animated) {

              var currentStep = me.seqplayer.getCurrentStep();

              //console.log('on step',currentStep);
              if (currentStep > me.seqplayer.getTotalSteps()) {
                //console.log('resetting...');  
                me.seqplayer.reset(function () {
                  $timeout(me.seqplayer.playSequence, 100);
                });
              } else
                $timeout(me.seqplayer.playSequence, 100);
            }

            return;
          }

          // otherwise, create a new one
          scope.data.pois[name] = { active: false, sequenceToLoad: seq, occurrenceIds: oid };
          scope.renderer.addPVS(scope.data.context.target.tracker, name, shape, undefined, undefined, () => {

            // we added the model, so set the location
            if (pos != undefined) scope.renderer.setTranslation(name, pos[0], pos[1], pos[2]);
            else scope.renderer.setTranslation(name, 0, 0, 0);
            if (rot != undefined) scope.renderer.setRotation(name, rot[0], rot[1], rot[2]);
            else scope.renderer.setRotation(name, 0, 0, 0);
            scope.renderer.setScale(name, scale, scale, scale);
            
            if (context != undefined) {
              var isDigital = !(context.target.mimeType != "application/vnd.ptc.tracker.spatialtracker" || scope.data.physical);
              scope.renderer.setProperties(name, { hidden: hide, shader: isDigital ? "sxsl_desaturatedgl" : "sxsl_screendoorgl", occlude: !isDigital, phantom: isDigital, opacity: isDigital ? 0.7 : 1, decal: false });
            } else {
              scope.renderer.setProperties(name, { hidden: hide, shader: "sxsl_proximityHilitegl", occlude: false, phantom: false, decal: false });

              var seq2load = scope.data.pois[name].sequenceToLoad;
              var oids = scope.data.pois[name].occurrenceIds;
              if (seq2load != undefined) {
                $timeout(function () {
                  scope.data.pois[name].seqplayer = VF_ANG.NativeSequencerHelper(name, VF_ANG.nativeEventHandler, scope.renderer);
                  scope.data.pois[name].seqplayer.loadSequence(seq2load, 1, function () {
                    console.log('sequence loaded', seq2load);
                    scope.data.pois[name].sequenceToLoad = undefined;
                    scope.data.pois[name].animated = true;

                    scope.data.pois[name].seqplayer.playSequence();

                  }, function (failed) {
                    console.log('failed to load', failed);
                    scope.data.pois[name].sequenceToLoad = undefined;
                    scope.data.pois[name].animated = false;
                  });
                }, 10);
              } else if (oids != undefined) {
                oids.forEach(function(oid) {
                  scope.renderer.setProperties(name+'-'+oid, { hidden: false, shader: "sxsl_proximityHilitegl", occlude: false, phantom: false, decal: false });
                });
              } else {
                oids = ['/'];
                scope.renderer.setProperties(name+'-/', { hidden: false, shader: "sxsl_proximityHilitegl", occlude: false, phantom: false, decal: false });
              }

              // we can use this later...
              scope.data.pois[name] = { pos: pos, rot: rot, scale: scale, hidden: hide, active: true, animated: false, sequenceToLoad: seq2load, occurrenceIds:oids  }
            }
            
            if (scope.data.pois[name].occurrenceIds != undefined) {
              var focusField = [];
              scope.data.pois[name].occurrenceIds.forEach(function(id) {
                focusField.push({model:name, path:id});
              });
              scope.focusField = focusField;     
            }

          },
          (err) => {
            // something went wrong
            console.log(`addPVS failed to add new model: ${JSON.stringify(err)}`);
          });
        }
        scope.showPOIs = function () {
          for (const name in scope.data.pois) {
            var me = scope.data.pois[name];
            if (me.active) {
              this.renderer.setProperties(name, { hidden: false });
              me.hidden = false;
            }
          }
        }
        scope.hidePOIs = function () {
          //
          for (const name in scope.data.pois) {
            var me = scope.data.pois[name];
            if (me.deactivated != undefined && me.deactivated == true) {
              this.renderer.setProperties(name, { forceHidden: true });
              if (me.animated == true) {
                me.animated = false;
                scope.renderer.loadPVI({ modelID: name, url: "" }, function () {
                  console.log('sequence unloaded ok');
                });
              }
              me.active = false;
              me.hidden = true;
            }
          }
          scope.focusField = undefined;
        }
        scope.deactivatePOIs = function () {
          //
          for (const name in scope.data.pois) {
            var me = scope.data.pois[name];
            if (me.active == true) {
              //this.renderer.setProperties(name, { forceHidden: true });
              //me.hidden = true;
              me.deactivated = true;
            }
          }
          scope.focusField = undefined;
        }
        scope.deactivateAll = function () {
          // remove all POIs  
          for (const name in scope.data.pois) {
            this.renderer.setProperties(name, { forceHidden: true });
            scope.data.pois[name].hidden = true;
            scope.data.pois[name].active = false;
            if (scope.data.pois[name].animated) {
              scope.renderer.loadPVI({ modelID: name, url: "" }, function () {
                console.log('sequence unloaded ok');
                scope.data.pois[name].animated = false;
              });
            }
          }
          
          //and remove any references
          scope.setPreviewList("");
          scope.focusField = undefined;
          
          // deallocate any event listeners we registered ($on, addEventListener etc.)              
          scope.data.events.forEach(function(evtfn) {
            evtfn();
          });

        }
        scope.animatePOIs = function (start) {
          for (const name in scope.data.pois) {
            var me = scope.data.pois[name];

            if (!start && me.animated == true) {

              this.renderer.setProperties(name, { hidden: true });
              //TODO; stop animation  
              me.animated = false;

            } else if (me.active && start && !me.animated && me.sequenceToLoad != undefined) {

              // load and then start sequence
              console.log('TODO: load sequence', me.sequenceToLoad);
              //note that load is async so the final me.animated should be set once the sequence has fully loaded  
            }
          }
        }



        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // action handling - ultimately will be embedded in the sxsl widget
        // right now, we're using a UI that is implemented at the experience level, so these actions are really the UI implementation layer of the sxsl widget
        //
        scope.sxsl2Actions = function (context) {

          this.registry = [];
          this.context = context;
          //initialise all action stuff
          this.start = (intro) => {
            scope.setInstLabel(intro ? intro : "Press the play (>) button to start...");
          }

          //terminate action handling, hide any remaining annotations etc.
          this.end = (conclusion) => {

            scope.deactivateAll();
            minimisePreview();

            scope.setInstLabel(conclusion != undefined ? conclusion : 'Procedure completed');
            
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
              list.forEach(function (ref) {
                inner = inner + ref;
              });
              return inner;
            }

            // deliver any references (images etc.) - if there are none, hide the viewer
            // TODO : use the thumbnail (if defined) for the previewer
            if (refs != undefined) {

              // we can have images, videos, docs - sort into buckets
              var buckets = { image: [], video: [], docs: [] };
              let mergedBucket = [];

              var me = this.context;
              refs.forEach(function (ref) {

                //if the mime isnt defined, lets see if we can figure it out from the file extension
                if (ref.mime == undefined) {
                  var fext = ref.url.slice(ref.url.lastIndexOf('.'));
                  switch (fext) {
                    case ".png": ref.mime = "image/png"; break;
                    case ".jpg": ref.mime = "image/jpg"; break;
                    case ".mp4": ref.mime = "video/mp4"; break;
                    case ".gif": ref.mime = "image/gif"; break;
                    default: break;
                  }
                }

                ref.url = me.anchor + ref.url;
                if (ref.thumb != undefined) ref.thumb = me.anchor + ref.thumb;
                switch (ref.mime) {

                  case "video/mp4":
                    buckets.video.push(ref);
                    mergedBucket.push(`<video class="sxsl-preview-show" title="${ref.desc}"><source src="${ref.url}"/></video>`);
                    break;

                  case "image/jpeg":
                  case "image/png":
                  case "image/gif":
                    buckets.image.push(ref);
                    mergedBucket.push(`<img src="${ref.thumb != undefined ? ref.thumb : ref.url}" longdesc="${ref.url}" title="${ref.desc}" class="sxsl-preview-show"/>`);
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
                  var src = tag == 'VIDEO' ? c.firstChild.src : c.longDesc;
                  var desc = c.title;
                  c.addEventListener("click", (function (i, src, tag) {
                    return function () {
                      showReview(src, desc, tag == 'VIDEO');
                    }
                  })(i, src, tag));
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

            var cameraTool = function (callback) {
              var cb = callback;
              var params = { withAugmentation: true, imageWidth: 640, imageHeight: 480 };
              //  params = { dataURL:bool, withAugmentation: bool, imgFormat: string, imgWidth: number, imgHeight:number} 
              return function () {
                return new Promise((next, reject) => {
                  scope.renderer.takeScreenshot(params, function (pngBase64String) {
                    var proof = 'data:image/png;base64,' + pngBase64String;
                    var res = cb(proof);
                    if (res != undefined)
                      next(res);
                    else
                      reject('no camera image')
                  });
                });
              }
            }
            var barcodeTool = function (src, callback) {
              var cb = callback;
              var display = src;
              if (scope.renderer.scanForNextBarCode) {
                scope.renderer.scanForNextBarCode(function (scannedValue) {
                  display.value = scannedValue;
                });
              } else {
                //inject dummy value for now  
                src.value = "Enter barcode here";
              }
              return callback;
            }
            var findInputTool = (input, target, callback) => {

              // enable the button
              if (tools != undefined)
                tools[0].disarm = undefined;
              if (input.tool == undefined)
                return callback;

              switch (input.tool) {
                case "barcode":
                  return barcodeTool(target, callback);

                case "camera":
                  return cameraTool(target);

                default:

                  // at this point, we can start the process of connecting to the tool
                  //
                  scope.twxToolConnect(tools[0].name)
                    .then(() => {
                          
                      let tc = tools[0].infoToCollect.count;
                      scope.setFeedbackLabel("Connected to " + tools[0].name +
                        " ok!<p>Collecting " + tc + (tc > 1 ? " values" : " value"));

                      scope.twxToolSet(tools[0].name, tools[0].infoToCollect)
                        .then(() => {
                          console.log('tool ready')
                          scope.twxToolArm(tools[0].name, true)
                            .then((armed) => {

                              //setup the tool name/title on the cmmand button    
                              const btn2e = document.querySelector('button#addCapture');
                              btn2e.innerHTML = 'Activate';

                              tools[0].disarm = function () {

                                scope.twxToolArm(tools[0].name, false)
                                  .then(() => {
                                    console.log('tool disarmed', tools[0].name);
                                  })
                                  // what happens if it fails
                                  .catch(e => {
                                    console.log('Tool disarm failed<p>' + e.reason)
                                  })

                              }

                            })
                            .catch(e => {
                              console.log('tool arm failed')
                              scope.setFeedbackLabel('Failed to arm ' + tools[0].name + '<p>' + e.reason);
                              scope.inputValidator = callback;
                            })
                        })
                        .catch(e => {
                          console.log('tool set failed')
                          scope.setFeedbackLabel('Failed to initialise ' + tools[0].name + '<p>' + e.reason);
                          scope.inputValidator = callback;
                        })

                    })
                    .catch(e => {
                      console.log('tool connect failed')
                      scope.setFeedbackLabel('Failed to connect to ' + tools[0].name + '<p>' + e.reason);
                      scope.inputValidator = callback;
                    })

                  break;
              }

              scope.inputToolActivate = function (resp) {
                console.log(resp);
                target.value = resp.eventData[0].actual;
                callback()
                  .then(validated => {
                    scope.advanceWindow.className = 'sxsl-button sxsl-button-round sxsl-blue-bb sxsl-icon-nav-right';
                    scope.pushInput(validated)
                  })
                  .catch(err => {
                    console.log(err);
                  })
              };

              // and return the primary data handler
              return function () {
                return new Promise((next, reject) => {
                  scope.twxToolActivate(tools[0].name)
                    .then((resp) => {
                      target.value = resp.actual;
                      console.log('tool delivered', resp);
                      callback()
                        .then(res => {
                          next(res);
                        })
                        .catch(err => {
                          reject(err)
                        });
                    })
                    .catch(e => {
                      reject('Tool activation failed<p>' + e.reason);
                      scope.inputValidator = callback;
                    });
                });
              }
            }
            var passThru = function (i) {
              var input = i;
              var src = scope.captureTextWindow
              if (i.hint != undefined && i.hint.instructions != undefined) {
                src.placeholder = i.hint.instructions.resources[0].text;
              }
              src.className = 'sxsl-capture-text';
              src.value = '';

              document.querySelector('div#capture').className = 'sxsl-capture-show';
              document.querySelector('button#addCapture').className = 'sxsl-button sxsl-capture-button';

              return function () {
                return new Promise((next, reject) => {
                  next({ response: src.value, type: input.type, time: Date.now() });
                });
              }
            }
            var textPattern = function (i) {
              var input = i;
              var pattern = input.regex;
              var src = scope.captureTextWindow;
              if (i.hint != undefined && i.hint.instructions != undefined) {
                src.placeholder = i.hint.instructions.resources[0].text;
              }
              src.value = '';
              src.className = 'sxsl-capture-text';

              document.querySelector('div#capture').className = 'sxsl-capture-show';
              document.querySelector('button#addCapture').className = 'sxsl-button sxsl-capture-button';

              return findInputTool(input, src, function () {
                return new Promise((next, reject) => {
                  var t = src.value;
                  console.log('test', t, 'against', pattern);
                  var valid = t.match(pattern) != null;
                  src.className = 'sxsl-capture-text' + (valid == false ? ' sxsl-capture-error' : '');
                  if (valid)
                    next({ response: t, type: input.type, time: Date.now() })
                  else {
                    var message = 'Invalid response.<p>' + (i.hint != undefined && i.hint.instructions != undefined ? i.hint.instructions.resources[0].text : '');
                    reject(message);
                  }
                });
              });
            }
            var rangeInput = function (i) {
              var input = i;
              var min = input.minerror, max = input.maxerror;
              var minwarn = input.minwarn, maxwarn = input.maxwarn;
              var nominal = input.nominal; // expected value

              var src = scope.captureTextWindow;
              src.className = 'sxsl-capture-text';
              if (input.hint != undefined && input.hint.instructions != undefined) {
                src.placeholder = input.hint.instructions.resources[0].text;
              }
              src.value = nominal != undefined ? nominal : ''; //preset the value

              document.querySelector('div#capture').className = 'sxsl-capture-show';
              const btnAC = document.querySelector('button#addCapture');
              btnAC.className = 'sxsl-button sxsl-capture-button';
              btnAC.innerHTML = 'Submit'; //default title

              return findInputTool(input, src, function () {
                return new Promise((next, reject) => {
                  var t = src.value;
                  console.log('test', t, 'against min', min, 'max', max);
                  var fv = parseFloat(t);

                  var valid = (min != undefined ? min <= fv : true) && (max != undefined ? max >= fv : true);

                  //how can we show tristate e.g. pass/fail/warn?
                  var warn = (minwarn != undefined ? minwarn > fv : false) || (maxwarn != undefined ? maxwarn < fv : false);
                  if (valid && warn)
                    scope.setFeedbackLabel('Warning<p>Value ', fv, ' falls outside of range [', minwarn, maxwarn, ']');

                  src.className = 'sxsl-capture-text' + (valid == false ? ' sxsl-capture-error' : (warn == true ? ' sxsl-capture-warn' : ''));

                  // finally, look for nominal and if defined, report the deviation from this value
                  var deviation = (nominal != undefined) ? Math.abs(nominal - fv) : undefined;

                  if (valid)
                    next({ response: t, tolerance: deviation, type: input.type, time: Date.now() });
                  else {
                    var message = 'Invalid response<p>Value ' + fv + ' falls outside of range [' + min + ',' + max + ']';
                    reject(message);
                  }
                });
              });
            }

            var presentEnumsAsHTML = function (enums) {
              var header = "<option class='item'>Select...</option>";
              var display = "";
              enums.forEach(function (item) {
                display = display + "<option class='sxsl-item' value=" + item.value + ">" + item.display.resources[0].text + "</option>";
              });
              return display.length > 0 ? header + display : display;
            }

            var selectoneInput = function (i) {
              var input = i;
              var src = scope.captureEnumWindow;

              var list = input.enumerations;
              if (list == undefined) return passThru(i);
              src.innerHTML = presentEnumsAsHTML(list);

              //show the UI
              document.querySelector('div#capture').className = 'sxsl-capture-show';
              document.querySelector('div#enumeratedCapture').className = 'sxsl-select sxsl-button-fail';

              return function () {
                return new Promise((next, reject) => {
                  var t = src.value;
                  console.log('submitting', t);
                  var resp = t;
                  next({ response: resp, type: input.type, time: Date.now() });
                });
              }
            }

            var photocapture = function (i) {
              var input = i;

              document.querySelector('div#capture').className = 'sxsl-capture-show';
              const btnAC = document.querySelector('button#activateCapture');
              btnAC.className = 'sxsl-button sxsl-capture';
              if (i.hint != undefined)
                btnAC.innerHTML = i.hint.resources[0].text;

              if (input.tool == undefined)
                input.tool = "camera";

              return findInputTool(input, function (res) {

                // this is the recipient (img) for previewing...
                var target = document.querySelector('img#photoCapture');
                target.className = "sxsl-capture-photo";
                target.src = res;

                var photo = res;
                var valid = photo.length > 0;
                return valid ? { response: photo, type: input.type, time: Date.now() } : undefined;
              })
            }

            // chosen functions may turn one or more of these back on again 
            hideCapture();
            if (input == undefined) return undefined;
            switch (input.type) {
              case 'CaptureString': return input.enumerations != undefined ? selectoneInput(input) : input.regex != undefined ? textPattern(input) : passThru(input);
              case 'CaptureNumber': return rangeInput(input);
              case 'CaptureImage': return photocapture(input);
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
              prefix = (a.index + 1).toString() + ". ";
            }
            if (a.isFirst && a.introtext != undefined) odesc = "<p>" + a.introtext + '</p>';
            if (a.instruction != undefined) odesc = odesc + "<p>" + prefix + a.instruction + "</p>";
            if (a.isLast && a.outrotext != undefined) odesc = odesc + "<p>" + a.outrotext + "</p>";

            a.step.ongoing = pdesc + odesc;

            //TODO : push the html generation piece down into the setter
            scope.setInstLabel(pdesc + "<span style='color:black;font-size:100%'>" + odesc + "</span>");

            //unpack the action subject(s) - also look for associated animations
            //which subject type (resource) can i view - 3d or 2d

            //TODO: how do we deal with alternative representations e.g 2d vs 3d
            //$scope.view.wdg.alternative.visible = false;

            scope.deactivatePOIs();

            var isAnimated = false;

            if (a.subjects != undefined) a.subjects.forEach(function (sub) {

              var assetId = sub.id;
              if (sub.asset != undefined) sub.asset.resources.forEach(function (res) {
                                                                      
                // inherit any subject occurences IF we dont have any ourselves                                                      
                var occurrenceIds = (res.occurrenceIds == undefined) ? sub.occurrenceIds : res.occurrenceIds;
                
                if (res.mimeType == "application/vnd.ptc.pvz" || res.mimeType == "model/gltf-binary") {

                  var src = scope.data.anchor + (res.composition == "partset" ? res.modelUrl : res.url);
                  scope.addNamedPOI(assetId, src, res.translation, genrotation(res.normal), 1, true, undefined, (res.composition == "partset" ? res.sceneName : undefined), occurrenceIds); //"Figure 1");
                  isAnimated = isAnimated || scope.data.pois[assetId].sequenceToLoad != undefined;
                }
                if (res.mimeType == "application/vnd.ptc.pvi") {
                  if (scope.data.pois[assetId] == undefined) scope.data.pois[res.id] = {};
                  scope.data.pois[assetId].sequenceToLoad = res.content.animationName;
                  isAnimated = true;
                }
                if (res.mimeType == "image/png") {
                  //$scope.view.wdg.alternative.imgsrc = $scope.app.params.anchor + res.url;
                  //$scope.view.wdg.alternative.visible = true;
                }
                else if (res.mimeType == "image/jpeg") {
                  //$scope.view.wdg.alternative.imgsrc = $scope.app.params.anchor + res.url;
                  //$scope.view.wdg.alternative.visible = true;
                }
                else if (res.mimeType == "application/vnd.ptc.poi") {
                  scope.addNamedPOI(res.id, 'extensions/images/diamond.pvz', res.translation, genrotation(res.normal), 0.1, false);
                }
                else if (res.mimeType == "application/vnd.ptc.partref") {
                  //TODO : how do we deal with gltf node referencing; thingview doesnt support it  
                  //$scope.view.wdg.subjects.src = $scope.app.params.context.hero;
                  //$scope.view.wdg.subjects.visible = true;
                }
              })
            })

            if (a.annotations != undefined) {
              var me = a.annotations[0];
              var src = scope.data.anchor + me.asset.resources[0].modelUrl;
              scope.addNamedPOI(me.id, src, undefined, undefined, 1, false);
              scope.data.pois[me.id].sequenceToLoad = me.asset.resources[0].sceneName;
              isAnimated = isAnimated || scope.data.pois[me.id].sequenceToLoad != undefined;
            }

            if (a.tools != undefined) {
              // does the tool have any animation defined?
              // note technically we should do this PER tool - in general, we'll assume one tool per action, for this POC at least
              if (a.tools[0] != undefined && a.tools[0].asset != undefined) {

                var me = a.tools[0];
                var src = scope.data.anchor + me.asset.resources[0].modelUrl;
                scope.addNamedPOI(me.id, src, undefined, undefined, 1, false);
                scope.data.pois[me.id].sequenceToLoad = me.asset.resources[0].sceneName;
                isAnimated = isAnimated || scope.data.pois[me.id].sequenceToLoad != undefined;
              }

              // we also want to collect #tools * any details values
              a.tools[0].infoToCollect = {
                count: a.subjects != undefined ? a.subjects.length : 1,
                details: a.details
              };

            }

            // start up the animation(s)
            scope.hidePOIs();
            if (isAnimated) {
              scope.animatePOIs(true);
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

            return this.findInputValidator(a.details, a.tools);
          }

          //find toolshe named action handler
          this.find = (actname) => new Promise((resolve, reject) => {

            console.log('...finding', actname, '...');

            var action = this.registry[actname];
            if (action != undefined && action.handler != undefined)
              resolve(action.handler);
            else
              reject('Error : unable to find action handler ' + actname);
          });

          // register new actions into the pool
          this.register = (name, act, icon) => {
            this.registry[name] = { handler: act };
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
          this.register('ManualPull', this.generic);
          this.register('ManualRotate', this.generic);
          this.register('Assemble', this.generic);
          this.register('Tighten', this.generic);
          this.register('Verify', this.generic);
          //from cwc
          this.register('Instructional', this.generic);
          //from vantage
          this.register('VisualInspection', this.generic);
          this.register('AssetCarousel', this.generic);
          this.register('GenericActionAtPointOfInterest', this.generic);
          this.register('Move', this.generic);
          //new
          this.register('Identify', this.generic);

        }

        // ////////////////////////////////////////////////////////////////////////////////////////////////
        // logger
        //
        // TODO : should this be integral to the player, or separate widget?

        var sepsic = scope.$parent.$on('statusUpdateComplete', function (evt) {
          console.log('incremental sent ok');
          scope.logger.sending = undefined;

          if (scope.logger.async == undefined) scope.logger.async = $timeout(function (a) {
            var me = a;
            return function () {
              me.incremental(me);
            };
          }(scope.logger), 500);
        });

        scope.data.logger = function (procID) {
          this.id = procID;
          this.results = [];
          this.pending = [];
          this.sending = undefined;
          this.async = undefined;
          this.incrementing = false;

          //
          // we record start/end events separately, but that's too much for the summary view, so here we will
          // process the data into something more suitable - this gets bound into a repeater
          //
          this.sanitise = function () {
            // turn into a simplified list for ecah step
            // name,start/end/pass/fail - ignore the error code
            var cleansed = [];
            var starts = {};
            for (var i = 0; i < this.results.length; i++) {
              // we're looking to match start and end times

              // if we see a start, mark it
              if (this.results[i].event == "stepstart") starts[this.results[i].id] = i;

              // if we find corresponding end, work out duration
              if (this.results[i].event == "stepend" && starts[this.results[i].id] != undefined) {

                var j = starts[this.results[i].id];
                var res = (this.results[i].ack == undefined) ? true :
                  (this.results[i].ack.response == "y") ? true :
                    (this.results[i].ack.response == "p") ? true : false;

                var step = {
                  id: this.results[i].id,
                  start: this.results[j].time,
                  end: this.results[i].time,
                  //dur: this.results[i].time-this.results[j].time, 
                  dur: new Date(this.results[i].duration * 1000).toISOString().slice(11, -5),  // seconds 
                  status: res ? "pass" : "fail"
                };

                cleansed.push(step);
              }

              if ((this.results[i].event == "hold" || this.results[i].event == "abort") && starts[this.results[i].id] != undefined) {
                var step = {
                  id: this.results[i].id,
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
          this.incremental = function (me) {
            me.async = undefined;

            if (me.pending.length > 0) {

              //strip out the first item
              var nextMessage = me.pending.splice(0, 1);
              me.sending = nextMessage[0];

              console.log('incremental sending', JSON.stringify(me.sending));

              me.incrementing = true;

              // send the info
              if (scope.data.loggingEnabled) {
                scope.statusField = me.sending;
                scope.$parent.$emit("statusUpdate");
              } else {
                // we dont get the kickback from twx is we are test mode, so we need to send it ourselves   
                $timeout(function () {
                  scope.$parent.$emit("statusUpdateComplete");
                }, 10);
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
          this.push = function (data) {

            // schedule for submission to Thingworx
            this.pending.push(data);

            // loggingEnabled this for the end (confirmation screen to the user)
            this.results.push(data);

            // we need to queue these up as they take time to process...
            console.log('pending incremental', JSON.stringify(data));

            // kick the async "sender" off...
            if (this.incrementing == false && this.async == undefined) this.async = $timeout(function (a) {
              var me = a;
              return function () {
                me.incremental(me);
              };
            }(this), 20);

          }

          //
          // 
          //
          this.submit = function (reason) {

            // turn into a simplified list for each step
            // name,start/end/pass/fail - ignore the error code
            this.submission = [];
            for (var i = 0; i < this.results.length; i++) {
              var res = (this.results[i].event != "stepend") ? undefined :
                (this.results[i].ack == undefined) ? true :
                  (this.results[i].ack.response == "y") ? true :
                    (this.results[i].ack.response == "p") ? true : false;

              var ack = (this.results[i].event == "stepstart") ? undefined :
                (this.results[i].ack == undefined) ? undefined :
                  (this.results[i].ack.response == "y") ? "confirm" :
                    (this.results[i].ack.response == "p") ? "pass" :
                      (this.results[i].ack.response == "f") ? "fail" : this.results[i].ack.response;

              var event = {
                ID: this.results[i].id.toString(),
                event: this.results[i].event,
                time: this.results[i].time,
                pass: res,
                acknowledge: ack
              };

              this.submission.push(event);
            }

            //
            // technically, we could do this in different ways
            // 1. we could have a central 'logging' service to which we write results
            // 2. as we are accepting a unique Thing with the procedure, we could write back to the Thing - makes a lot of sense to keep the results close (note this Thign could then ask
            //    a manager to distrubute the data)
            // 3. a central Manager wihch route the results 

            //Triggers a Service on a Manager Thing that expects the procID and the result and internally hands it over to the correct procedure. is overwritable so that it works with CWC SOWI and others
            console.log('stopping : sending', JSON.stringify(this.submission));

            if (this.id != undefined)
              twx.app.fn.triggerDataService('PTC.InspectionAccelerator.Imp.Manager', 'stopWorkTask', {
                'workstationID': $scope.app.params.workstationID,
                'workTaskID': $scope.app.params.Workorder.workinstructionID.toString(),
                'serialNumber': $scope.app.params.Workorder.serialnumber,
                //                                                                                             'summary': JSON.stringify(this.submission),
                'reason': reason
              });
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
        scope.ticker = function (t, v) {
          //console.log('time',t);
          var tock = t / 1000;
          var limit = v != undefined ? v : undefined;
          var overrun = limit != undefined ? tock > limit : false;
          scope.clockField = [{
            tick: t,
            target: limit,
            overrun: overrun
          }];
        };

        scope.startStepTimeClock = function (step, callback, scope) {
          var me = scope;
          function clock(step, callback) {
            return $interval((function (step, callback) {
              var s = step;
              var cb = callback;
              s.ref.clock.start = Date.now();
              console.log('starting timer for step', step.id);

              // total elapsed time = saved elapsed + ongoing runtime
              return function () {
                var et = s.ref.clock.elapsedTime + (Date.now() - s.ref.clock.start);

                cb(et, s.targetTime);
              }
            })(step, callback), 1000);
          }

          if (step.ref.clock == undefined) {
            step.ref.clock = { elapsedTime: 0, start: Date.now() };

            //re-iniitalise display
            callback(0, undefined);
          }

          step.ref.clock.timer = clock(step, callback);

          me.stopStepTimeClock = function (step) {
            //make sure we only stop once  
            if (step.ref.clock.timer != undefined) {
              step.ref.clock.elapsedTime += (Date.now() - step.ref.clock.start);
              $interval.cancel(step.ref.clock.timer);
              step.ref.clock.timer = undefined;
              console.log('stopping timer for step', step.id);
            }
          }

        }

        /* ************************************************************************************** */

        ////////////////////////////////////////////////////////////////////////////////////////
        // smart tools
        //
        // how this works; 
        // 1. the tools are enabled by the presence of supporting thingworx data model (toolThing)
        //    which must be present in the experience/view
        // 2. initialiseTools service must be called (can set it to auto-invoke on startup) and here we
        //    listen for the serviceInvokeComplete event to confirm the data model and services are available.


        //this is the default - it might be overridden if we get the invokecomplete event below
        //
        scope.twxToolConnect = (tool) => new Promise((next, reject) => {
          reject({
            reason: 'Interface not configured yet'
          });
        });
            
        // list for the serviceinvokecomplete event. Ideally we should get back a list of valid services
        // but for now lsts get back the boolean 
        //
        scope.$parent.$on('initialiseTools.serviceInvokeComplete', function (evt) {

          scope.data.isToolThingAvailable = scope.$parent.app.mdl['toolThing'].svc['initialiseTools'].data[0].result;

          //if we get success, this is where we shoud register the other services.                
          if (scope.data.isToolThingAvailable) {

            scope.$parent.$on('toolConnect.serviceInvokeComplete', function (evt) {
              if (scope.toolConnectResponse != undefined) {
                var valid = scope.$parent.app.mdl['toolThing'].svc['toolConnect'].data[0].result;
                scope.toolConnectResponse(valid);
              }
            });

            scope.$parent.$on('toolConnect.serviceFailure', function (evt) {
              if (scope.toolConnectResponse != undefined) {
                scope.toolConnectResponse(false);
              }
            });

            scope.twxToolConnect = (tool) => new Promise((next, reject) => {

              if (!scope.data.isToolThingAvailable)
                reject();

              scope.data.sxslToolConnectTimeout = undefined;
              // register callback

              // note this is ugly - im sure there's a better way to do this and somone far better at javascript programming would know how to do it,
              // but here i'm using essentially an application global var to store a dynamic callback function that wil call me back when the
              // asycn thigworx service responds.  I havnt a clue nor the time to figure out how to do this properly so this will do for now :)
              scope.toolConnectResponse = function (valid) {

                $timeout.cancel(scope.data.sxslToolConnectTimeout);
                scope.data.sxslToolConnectTimeout = undefined;

                if (valid)
                  next();
                else
                  reject({
                    reason: 'because '
                  });

                // unregister
                scope.toolConnectResponse = undefined;
              }

              // a timeout in case we dont have the twx bindings
              scope.data.sxslToolConnectTimeout = $timeout(function () {
                scope.data.isToolThingAvailable = false;
                reject({ reason: 'Invalid or missing interface: Use manual entry' });
              }, 3000);

              // ask if things are ok
              scope.setFeedbackLabel("Connecting to " + tool);
              twx.app.fn.triggerDataService('toolThing', 'toolConnect', { 'name': tool });
            });

            //
            // now tool set (this can set/configure the tool e.g. value settings etc.)
            // settings values are passed as raw json object - the Thing on the other side is assumed to be
            // a building block implementation so it can do whatever specialist stuff it needs to with the json
            //
            scope.$parent.$on('toolSet.serviceInvokeComplete', function (evt) {
              if (scope.toolSetResponse != undefined) {
                var valid = scope.$parent.app.mdl['toolThing'].svc['toolSet'].data[0].result;
                scope.toolSetResponse(valid);
              }
            });
            scope.$parent.$on('toolSet.serviceFailure', function (evt) {
              if (scope.toolSetResponse != undefined) {
                scope.toolSetResponse(false);
              }
            });
            scope.twxToolSet = (tool, settings) => new Promise((next, reject) => {

              scope.data.sxslToolSetTimeout = undefined;

              // register callback
              scope.toolSetResponse = function (valid) {

                $timeout.cancel(scope.data.sxslToolSetTimeout);
                scope.data.sxslToolSetTimeout = undefined;

                if (valid)
                  next();
                else
                  reject({
                    reason: 'because '
                  });

                // unregister
                scope.toolSetResponse = undefined;
              }

              // ask if things are ok
              if (settings == undefined)
                reject();

              // a timeout in case we dont have the twx bindings
              scope.data.sxslToolSetTimeout = $timeout(function () {
                scope.data.isToolThingAvailable = false;
                reject({ reason: 'Invalid or missing interface: Use manual entry' });
              }, 3000);
              twx.app.fn.triggerDataService('toolThing', 'toolSet', { 'name': tool, 'settings': JSON.stringify(settings) });
            });

            //
            // now (dis)arm the tool (turn it on/off, prepare it...)
            //
            scope.$parent.$on('toolArm.serviceInvokeComplete', function (evt) {
              if (scope.toolArmResponse != undefined) {
                var armedok = scope.$parent.app.mdl['toolThing'].svc['toolArm'].data[0].result;
                scope.toolArmResponse(armedok);
              }
            });
            scope.$parent.$on('toolSet.serviceFailure', function (evt) {
              if (scope.toolArmResponse != undefined) {
                scope.toolArmResponse(false);
              }
            });
            //arm or disarm
            scope.twxToolArm = (tool, arm) => new Promise((next, reject) => {

              scope.data.sxslToolArmTimeout = undefined;

              // register callback
              scope.toolArmResponse = function (armedok) {

                $timeout.cancel(scope.data.sxslToolArmTimeout);
                scope.data.sxslToolArmTimeout = undefined;

                if (armedok)
                  next();
                else
                  reject({
                    reason: 'failed to ' + arm ? 'arm' : 'disarm'
                  });

                // unregister
                scope.toolArmResponse = undefined;
              }

              scope.data.sxslToolArmTimeout = $timeout(function () {
                scope.data.isToolThingAvailable = false;
                reject({ reason: 'Invalid or missing interface: Use manual entry' });
              }, 3000);

              // ask if things are ok
              twx.app.fn.triggerDataService('toolThing', 'toolArm', { 'name': tool, 'arm': arm });
            });

            //
            // finally, activate it
            //
            scope.$parent.$on('toolActivate.serviceInvokeComplete', function (evt) {
              if (scope.toolActivateResponse != undefined) {
                var response = scope.$parent.app.mdl['toolThing'].svc['toolActivate'].data;
                scope.toolActivateResponse(response);
              }
            });
            scope.$parent.$on('toolActivate.serviceFailure', function (evt) {
              if (scope.toolActivateResponse != undefined) {
                scope.toolActivateResponse(false);
              }
            });
            // the events above are responses to service calls i.e. us asking thingworx to activate the tool
            // this event below is a secondary event handler that is registered to a direct push event that thingworx
            // can send us - if the user activates the tool without us having to ask them. 
            scope.onToolActivated = function (evt) {
              console.log(evt);
              scope.inputToolActivate(evt);
            }

            var twxConnectorCtrl = $injector.get('ThingworxConnector');
            twxConnectorCtrl.subscribe("toolThing", "Things", "activated", "", scope.onToolActivated);

            //activate
            scope.twxToolActivate = (tool) => new Promise((next, reject) => {

              scope.data.sxslToolActivateTimeout = undefined;

              // register callback
              scope.toolActivateResponse = function (response) {

                $timeout.cancel(scope.data.sxslToolActivateTimeout);
                scope.data.sxslToolActivateTimeout = undefined;

                if (response.success)
                  next(response);
                else
                  reject({
                    reason: 'because '
                  });

                // unregister
                scope.toolActivateResponse = undefined;
              }

              scope.data.sxslToolActivateTimeout = $timeout(function () {
                scope.data.isToolThingAvailable = false;
                reject({ reason: 'Invalid or missing interface: Use manual entry' });
              }, 3000);

              // ask if things are ok
              twx.app.fn.triggerDataService('toolThing', 'toolActivate', { 'name': tool });
            });
          }
        });




        // end of smart tool integration
        /////////////////////////////////////////////////////////////////////////////////

        /* ****************************************************************************** */
        //
        // check the procedure, look at any prerequisites (tools, parts, consumables etc)
        scope.procValidator = function (proc, entry) {

          // if its a valid step and there is a configured external (twx) validator, lets call it  
          if (proc != undefined && scope.data.isProcessThingAvailable && scope.twxProcValidator)
            return scope.twxProcValidator(proc, entry);
          else {

            // a dummy call which always returns true
            if (entry) return new Promise((next, reject) => {

              var prereqs = { tools: {}, consumables: {} };

              // iterate through all the actions in all the steps, and pull out any tool, parts, consumables that are referenced
              proc.steps.forEach(function (s) {
                s.actions.forEach(function (a) {
                  if (a.tools != undefined) {

                    //TODO : should we initialise the tools interface here?                  

                    //it is possible to reuse tools, so we want to index these by the ID
                    a.tools.forEach(function (tool) {
                      prereqs.tools[tool.id] = tool;
                    });
                  }
                  if (a.materialConsumed != undefined) {
                    // can be defined inline, or referenced as context assets
                    a.materialConsumed.forEach(function (consumable) {
                      prereqs.consumables[consumable.asset.id] = { amount: consumable.amountConsumed, units: consumable.unitsOfConsumption.resources[0].text, material: consumable.asset };
                    });
                  }
                });
              })

              //
              next(prereqs);
            });
            else return new Promise((next, reject) => {
              next();
            });
          }
        };

        scope.stepValidator = function (step, test) {

          // if its a valid step and there is a configured external (twx) validator, lets call it  
          if (step != undefined && scope.data.isProcessThingAvailable && scope.twxStepValidator)
            return scope.twxStepValidator(step, test);
          else {
            // a dummy call which always returns true
            return new Promise((next, reject) => {
              next(); // signal it is ok to move on
            });
          }
        }

        //
        // is remote validation configured?
        //
        scope.$parent.$on('initialiseProcess.serviceInvokeComplete', function (evt) {

          scope.data.isProcessThingAvailable = scope.$parent.app.mdl['processThing'].svc['initialiseProcess'].data[0].result;

          if (scope.data.isProcessThingAvailable) {
            // lets now register the other services

            scope.$parent.$on('validateStep.serviceInvokeComplete', function (evt) {
              if (scope.sxslStepValidated != undefined) {
                var valid = scope.$parent.app.mdl['processThing'].svc['validateStep'].data[0].result;
                scope.sxslStepValidated(valid);
              }
            });
            scope.$parent.$on('validateStep.serviceFailure', function (evt) {
              if (scope.sxslStepValidated != undefined) {
                scope.sxslStepValidated(false);
              }
            });
            scope.twxStepValidator = (step, test) => new Promise((next, reject) => {

              scope.data.sxslStepValidatorTimeout = undefined;

              // register callback
              scope.sxslStepValidated = function (valid) {

                $timeout.cancel(scope.data.sxslStepValidatorTimeout);
                scope.data.sxslStepValidatorTimeout = undefined;

                if (valid)
                  next();
                else
                  reject({
                    event: 'remoteStepValidationRejected',
                    reason: 'Because of some issue with ' + step.id
                  });

                // unregister
                scope.sxslStepValidated = undefined;
              }

              // a timeout in case we dont have the twx bindings
              scope.data.sxslStepValidatorTimeout = $timeout(function () {
                scope.twxStepValidator = false;
                next();
              }, 3000);

              // ask if things are ok
              twx.app.fn.triggerDataService('processThing', 'validateStep', {
                'stepID': step != undefined ? step.id : undefined,
                'test': JSON.stringify(test)
              });

            });

            scope.$parent.$on('validateProc.serviceInvokeComplete', function (evt) {
              if (scope.sxslProcValidated != undefined) {
                var valid = scope.$parent.app.mdl['processThing'].svc['validateProc'].data[0].result;
                scope.sxslProcValidated(valid);
              }
            });
            scope.$parent.$on('validateProc.serviceFailure', function (evt) {
              if (scope.sxslProcValidated != undefined) {
                scope.sxslProcValidated(false);
              }
            });
            scope.twxProcValidator = (proc, entry) => new Promise((next, reject) => {

              scope.data.sxslProcValidatorTimeout = undefined;

              // register callback
              scope.sxslProcValidated = function (valid) {

                $timeout.cancel(scope.data.sxslProcValidatorTimeout);
                scope.data.sxslStepValidatorTimeout = undefined;


                if (valid)
                  next();
                else
                  reject({
                    event: 'remoteProcValidationRejected',
                    reason: 'Because of something to do with ' + proc.id
                  });

                // unregister
                scope.sxslProcValidated = undefined;
              }

              // a timeout in case we dont have the twx bindings
              scope.data.sxslProcValidatorTimeout = $timeout(function () {
                scope.twxProcValidator = false;
                next();
              }, 3000);

              // ask if things are ok
              twx.app.fn.triggerDataService('processThing', 'validateProc', {
                'procID': proc != undefined ? proc.id : undefined,
              });

            });

          }
        });

      }
    };
  }

}());
