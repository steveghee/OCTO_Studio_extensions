if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'list3D-ng';
}

(function () {
  'use strict';

  var List3DModule = angular.module('list3D-ng', []);
  List3DModule.directive('ngList3d', ['$timeout', '$http', '$window', '$injector', ngList3D]);

  function ngList3D($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        isholoField        : '@',
        widthField         : '@',  
        heightField        : '@',
        rowsField          : '@',  
        colsField          : '@',
        fontField          : '@',
        idField            : '@',  
        disabledField      : '@',
        displayField       : '@',
        backerField        : '@',
        multiselectField   : '@',
        listdataField      : '=',
        datawindowField    : '=',
        upvisField         : '=',
        dnvisField         : '=',
        delegateField      : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = {  
                       id: undefined,
                    width: 0.04,
                   height: 0.04,
                     rows: 1, 
                     cols: 1,
                    multi: true,
                rowIndex : 0,
                fontColor: '#ffffff',
                  pressed: false,
                 disabled: undefined,
                   backer: undefined,
                     text: '',
                      src: '',
            srcnotpressed: '',
                  display: 'display'
                     };
             
        //////////////////////////////////////////////////////////////////////
        // user tapped the button
        //
        scope.$root.$on('userpick', function(evt, src) { 
          //is this one of the many buttons i 'own'
          if(!scope.data.disabled && src.startsWith(scope.data.id)) {
            //if so, execute the function of that button
            //note that the individual list elements are all buttons too - their index lets us know
            //which button was pressed
            
            var buttonid = src.substr(scope.data.id.length);
            switch(buttonid) {
            case 'downer' : 
              if (scope.dnvisField) {
                scope.data.rowIndex+=scope.data.cols;
                renderlist3D(true);
              }
              break;
            case 'upper' : 
              if (scope.upvisField) {
                scope.data.rowIndex-=scope.data.cols;
                if (scope.data.rowIndex < 0) 
                  scope.data.rowIndex = 0;
                renderlist3D(true);
              }
              break;
            default:  
              break
            }
          }
        });

        //////////////////////////////////////////////////////////////////////
        //setup stuff    
        //
        function isbool(v) {
          return (v==='true')||v===true;
        }
        
        scope.renderer = $window.cordova ? vuforia : $injector.get('threeJsTmlRenderer');
        
        //////////////////////////////////////////////////////////////////////
        // draw the buttton
        //
        var renderlist3D = function(trigger) {
            
          var triggered = trigger != undefined && trigger === true;  
          var pressed   = undefined;  
          $timeout(function(){
                   
            // and we COPY (rows*cols) fields across to the windowed output field...  
            let start = scope.data.rowIndex;
            let count = scope.data.rows * scope.data.cols;
            if (start + count >= scope.data.data.length)
              count = scope.data.data.length - start;
              
            // do we COPY or SLICE?
            // this is the SLICE  
            //scope.datawindowField = scope.data.data.slice(start,start+count);  
            
            // lets try COPY
            var result = [];
            for (var i=start;i<start+count; i++) {
                var pressed = !!scope.data.data[i].pressed;
                result.push({     pressed: pressed,
                                     text: !!scope.data.data[i][scope.data.display] ? scope.data.data[i][scope.data.display] : "",
                                      src: !!scope.data.data[i].src        ? scope.data.data[i].src : "",
                               srcpressed: !!scope.data.data[i].srcpressed ? scope.data.data[i].srcpressed: "",
                                  visible: true
                              });
    
            }
            // keep a copy as we need to know what change
            scope.datawindowField = result;
            console.log('setting',JSON.stringify(result));
            
            var tf = scope.data.rows * scope.data.cols;
            scope.dnvisField = (scope.data.data.length > tf) && ((scope.data.rowIndex + scope.data.cols) < (scope.data.data.length - 1));
            scope.upvisField = (scope.data.rowIndex > 0);
              
          },1);
        }
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['disabledField'], function () {
          var dis = (scope.disabledField != undefined) ? isbool(scope.disabledField) : false;
          // is this has changed, we update the shader
          if (scope.data.disabled != dis) {
              
            scope.data.disabled = dis;
            
            // ideally we would toggle the shader here, but whilst we can toggle between the prototype octo shaders, we
            // cannot untoggle and return to the built-inshader, wich actually shaders the button differently (better!)
            // the switch makes this inconsistent, so disabling it for now.
            
            var isholo = (scope.isholoField != undefined) ? isbool(scope.isholoField) : false;
            if (isholo && !twx.app.isPreview()) {
              scope.renderer.setProperties(scope.data.id+'_button',{shader:dis?"holoUIni":"holoUI"});
            }
            
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!scope.data.backer});
              
          }
        });
            
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['backerField'], function () {
          var backer = (scope.backerField != undefined) ? isbool(scope.backerField) : false;
          
          // is this has changed, we update the shader
          if (scope.data.backer != backer) {
              
            scope.renderer.setProperties(scope.data.id+'_backer',{hidden:!backer});
            scope.data.backer = backer;
          }
        });
            
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['idField','widthField','heightField','fontField','rowsField','colsField','multiselectField','displayField'], function () {
          scope.data.id        = (scope.idField     != undefined) ? scope.idField                 : undefined;
          scope.data.width     = (scope.widthField  != undefined) ? parseFloat(scope.widthField)  : 0.04;
          scope.data.height    = (scope.heightField != undefined) ? parseFloat(scope.heightField) : 0.04;
          scope.data.fontColor = (scope.fontField   != undefined) ? scope.fontField               : '#ffffff';
          scope.data.rows      = (scope.rowsField   != undefined) ? parseInt(scope.rowsField)     : 1;
          scope.data.cols      = (scope.colsField   != undefined) ? parseInt(scope.colsField)     : 1;
          scope.data.multi     = (scope.multiselectField != undefined) ? isbool(scope.multiselectField) : true; // default to true
          scope.data.display   = (scope.displayField!= undefined) ? scope.displayField            : 'display'; // default
        });
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
            
        //////////////////////////////////////////////////////////////////////
        // if things change externally, we may need to fire events
        //
            
        scope.$watch(
          function() { return JSON.stringify(scope.listdataField)},
          function(value) {
            scope.data.data = scope.listdataField ;
            renderlist3D(true);
          }
        )
        
        //
        // let's emit an info table - this makes the data easily consumable by Thingworx
        // not sure if there's a twx function to do this already?
        //
        function buildInfoTable(rows) {
          var itable = { 
                 rows: rows,
            dataShape: {
              fieldDefinitions: {
                  value: {aspects: {}, baseType: "STRING",  name: "value"   },            
                pressed: {aspects: {}, baseType: "BOOLEAN", name: "pressed" }
              }
            }
          };     
          return itable;
        }

        scope.$watch(
          function() { return JSON.stringify(scope.datawindowField)},
          function(value) {
              
            //work out what changed
            let start = scope.data.rowIndex;
            let count = scope.data.rows * scope.data.cols;
            if (start + count > scope.data.data.length)
              count = scope.data.data.length - start;
              
            let changeIndex = undefined;
            for (var i=0;i<count;i++) {
                
              // this is the main item that can change
              var primary = scope.data.rowIndex + i;  
              var ipressed = !!scope.data.data[primary].pressed;
              if (ipressed != scope.datawindowField[i].pressed)
                changeIndex = primary;
                
              //now copy over all the data
              scope.data.data[scope.data.rowIndex+i].pressed    = scope.datawindowField[i].pressed;
              scope.data.data[scope.data.rowIndex+i].visible    = scope.datawindowField[i].visible;
            }
            
            // we need to run over the full array to get the selectedRows
            scope.data.data.selectedRows=[];
            for (var i=0;i<scope.data.data.length;i++) {
              if (scope.data.data[i].pressed) 
                scope.data.data.selectedRows.push(scope.data.data[i]);
            }
            
            // update the output field and fire any events
            if (changeIndex != undefined) {
                
              var chgrow = scope.data.data[changeIndex];
                
              // if we;re not in multiselect mode, we must now deselect all the other buttons  
              if (scope.data.multi === false) {  
                let todo = scope.data.data.length;
                let newp = scope.datawindowField[changeIndex-start].pressed;
                for (var i=0;i<todo;i++) {
                  scope.data.data[i].pressed    = (i === changeIndex) ?  newp : false;
                }
              
                //and override selectedRows if selected
                if (chgrow.pressed)
                  scope.data.data.selectedRows = [chgrow];
              }
              
              scope.data.data.current = chgrow;
              
              if (scope.data.data[changeIndex].pressed === true) {
                scope.$parent.fireEvent('pressed',chgrow);
              } else {
                scope.$parent.fireEvent('unpressed',chgrow);
              }

            }
            
          }
        )
            
        //////////////////////////////////////////////////////////////////////
        // handle external events (service calls)            
        //
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.reset = function () { 
              scope.data.rowIndex = 0; 
              renderlist3D(true);
            };
            delegate.refresh = function () { 
              //dont change the rowindex
              renderlist3D(true);
            };
          }
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          // check that I (as named widget) am referenced in this view              
          if (event.targetScope.view.wdg[scope.data.id] != undefined) {
            renderlist3D(false);
          }
        });
            
      }
    };
  }

}());

