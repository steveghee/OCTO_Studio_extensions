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
        backerField        : '@',
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
                rowIndex : 0,
                fontColor: '#ffffff',
                  pressed: false,
               notpressed: true,
                 disabled: undefined,
                   backer: undefined,
                     text: '',
                      src: '',
            srcnotpressed: ''
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
                renderimage3D(true);
              }
              break;
            case 'upper' : 
              if (scope.upvisField) {
                scope.data.rowIndex-=scope.data.cols;
                if (scope.data.rowIndex < 0) 
                  scope.data.rowIndex = 0;
                renderimage3D(true);
              }
              break;
            default:  
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
        var renderimage3D = function(trigger) {
            
          var triggered = trigger != undefined && trigger === true;  
          var pressed = undefined;  
          $timeout(function(){
                   
            // and we COPY (rows*cols) fields across to the windowed output field...  
            let start = scope.data.rowIndex;
            let count = scope.data.rows * scope.data.cols;
            if (start + count >= scope.data.data.length)
              count = scope.data.data.length - start;
            scope.datawindowField = scope.data.data.slice(start,start+count);  
            
            var tf = scope.data.rows * scope.data.cols;
            scope.dnvisField = (scope.data.data.length > tf) && ((scope.data.rowIndex + scope.data.cols) < (scope.data.data.length - 1));
            scope.upvisField = (scope.data.rowIndex > 0);
              
            if (triggered) {
                
              if (pressed === true) {
                scope.$parent.fireEvent('pressed');
              } else if (pressed === false) {
                scope.$parent.fireEvent('unpressed');
              }
            
              scope.data.pressed    = (scope.pressedField    != undefined) ? isbool(scope.pressedField) : false;
              scope.data.notpressed = (scope.notpressedField != undefined) ? isbool(scope.notpressedField) : false;
            
            }

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
            renderimage3D(false);  
              
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
        scope.$watchGroup(['idField','widthField','heightField','fontField','rowsField','colsField'], function () {
          scope.data.id        = (scope.idField     != undefined) ? scope.idField                 : undefined;
          scope.data.width     = (scope.widthField  != undefined) ? parseFloat(scope.widthField)  : 0.04;
          scope.data.height    = (scope.heightField != undefined) ? parseFloat(scope.heightField) : 0.04;
          scope.data.fontColor = (scope.fontField   != undefined) ? scope.fontField               : '#ffffff';
          scope.data.rows      = (scope.rowsField   != undefined) ? parseInt(scope.rowsField)     : 1;
          scope.data.cols      = (scope.colsField   != undefined) ? parseInt(scope.colsField)     : 1;
        });
        
        //////////////////////////////////////////////////////////////////////
        // monitor state - these wont change often
        //
        scope.$watchGroup(['textField', 'srcField', 'srcnotpressedField'], function () {
          scope.data.text           = (scope.textField           != undefined) ? scope.textField           : '';
          scope.data.src            = (scope.srcField            != undefined) ? scope.srcField            : '';
          scope.data.srcnotpressed  = (scope.srcnotpressedField  != undefined) ? scope.srcnotpressedField  : '';
          
          renderimage3D(false);
        });
            
        //////////////////////////////////////////////////////////////////////
        // if things change externally, we may need to fire events
        // note that we only watch pressedField.  notPressedField is output only
        //
        scope.$watchGroup(['pressedField'], function () {
          renderimage3D(true);
        });
            
        scope.$watch(
          function() { return JSON.stringify(scope.listdataField)},
          function(value) {
            scope.data.data = scope.listdataField ;
            // and we COPY (rows*cols) fields across to the windowed output field...  
            let start = scope.data.rowIndex;
            let count = scope.data.rows * scope.data.cols;
            if (start + count >= scope.data.data.length)
              count = scope.data.data.length - start;
            scope.datawindowField = scope.data.data.slice(start,count);  
          }
          )
        
        scope.$watch(
          function() { return JSON.stringify(scope.datawindowField)},
          function(value) {
            scope.data.datawindow = scope.datawindowField ;
              
          }
        )
            
        //////////////////////////////////////////////////////////////////////
        // handle external events (service calls)            
        //
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.set   = function () { setimage3D();   };
            delegate.reset = function () { resetimage3D(); };
          }
        });
            
        // make sure we are triggered when the page is ready    
        scope.$root.$on("$ionicView.afterEnter", function (event) {
          renderimage3D(false);
        });
            
      }
    };
  }

}());

