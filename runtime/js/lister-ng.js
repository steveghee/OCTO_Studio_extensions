if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'lister-ng';
}

(function () {
  'use strict';

  var listerModule = angular.module('lister-ng', []);
  listerModule.directive('ngLister', ['$timeout', '$http', '$window', '$injector', ngLister]);

  function ngLister($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
      modelField : '@',
       nameField : '@',
        catField : '@',
   selectedField : '=',
 categoriesField : '=',
     fieldsField : '=',
   delegateField : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
          
        scope.data = {     id: undefined,
                   namefilter: undefined,
                    catfilter: undefined,
                     disabled: false,
                      results: [],
                       fields: [],
                   categories: []
                     };
                     
                             //
        // look through the presented/selected items, picking out the metadata
        //
        var apply = function() {
          if (scope.data.results.length == 0) return;
            
          var preres = { cats:[], fields:[] };  
          
          scope.data.results.forEach(function(model) {
            var dive = false;
            var tmp = undefined;                         
            if (scope.data.catfilter != undefined) {
              var crg = RegExp(`${scope.data.catfilter}`,"g");
              var res = Object.keys(model.cats).filter( (v) => { return v.match(crg);} );                  
              res.forEach( (key) => { 
                var cat = preres.cats.filter( (v) => { return v.name == key } );                  
                if (cat.length == 0) preres.cats.push({name:key}) 
              });
            }
            else {
              for (let key in model.cats) {
                var cat = preres.cats.filter( (v) => { return v.name == key } );                  
                if (cat.length == 0) preres.cats.push({name:key}) 
              }
            }
            var keys = Object.keys(preres.cats);
            var dive   = keys.length > 0;
            var selcat = keys.length == 1 ? preres.cats[keys[0]] : undefined;
            var selmod = keys.length == 1 ? model : undefined;
            
            if (dive) {
              if (scope.data.namefilter != undefined) {
                var nrg = RegExp(`${scope.data.namefilter}`,"g");
                var res = Object.keys(model.rows).filter( (v) => { return v.match(nrg);} );                  
                res.forEach( (key) => { 
                  var row = preres.fields.filter( (v) => { return v.name == key } );                  
                  if (row.length == 0) preres.fields.push({name:key, category:model.rows[key].cat});
                });
              }
              else { 
                for(let key in model.rows) {
                  var row = preres.fields.filter( (v) => { return v.name == key } );                  
                  if (row.length == 0) preres.fields.push({name:key, category:model.rows[key].cat});
                }
                if (scope.data.catfilter) {
                  var nrg = RegExp(`${scope.data.catfilter}`,"g");
                  preres.fields = preres.fields.filter( (v) => { return v.category.match(crg);} );                  
                }
              }
            }
          })

          scope.fieldsField = preres.fields;
          scope.selectedField = preres.fields.length == 1 ? preres.fields[0] : undefined ;   
          scope.categoriesField = preres.cats;
          
          scope.$parent.fireEvent('complete');
          scope.$parent.$applyAsync();

        };
        
        ///////////////////////////////////////////////////////////////////////////
        // if there is no bound data, but the user PICKs from the selected model,
        // we can return the filtered metadata items
        scope.$root.$on('modelLoaded', function(evt, src) { 
                        
          //only follow this IF there is no bound input and we are enabled              
          if (scope.data.id != undefined && scope.data.id === src) {
            //just this one
            PTC.Metadata.fromId(scope.data.id)
                        .then( (meta) => {
                  
            })
            .catch((err) => { console.log('metadata extraction failed with reason : ' + err) 
            })
          } else if (scope.data.id == undefined || scope.data.id.length == 0) {
            //any/all
            PTC.Metadata
               .fromId(src)
               .then( (meta) => {
                  
              scope.data.info = [];
              //scope.data.info.push({ model: scope.data.id, path: pathid });
              var res = meta._getRawProps()
              if (res != undefined) {
                // lets try outputting a name/value  infotable to make it
                // easier to represent results in a repeater etc.
                var retobj = { model: src,
                              rows: {},
                              cats: {}
                } ;  
                for (var n in res) {
                  for (var p in res[n]) {
                    retobj.cats[p] = retobj.cats[p] != undefined ? retobj.cats[p] + 1 : 1;
                    for (var v in res[n][p]) {  
                      if (retobj.rows[v] == undefined) 
                        retobj.rows[v] = { cat:p, count:1 };
                      else {
                        retobj.rows[v].count +=1 ;
                      }
                    }
                  }
                }
                scope.data.results.push(retobj);
              }
            })
            .finally( () => {
              apply();       
            });
          }}      
        );
            
        ///////////////////////////////////////////////////////////////////////////
        // watch for changes
        //
        
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function () { return scope.categoriesField != undefined ? JSON.stringify(scope.categoriesField.selectedRows) : '' },
          function (value) {
            if (value != undefined && scope.categoriesField != undefined) {
              var parsed = JSON.parse(value);              // check if we CAN run
              scope.data.catfilter = parsed[0].name;  
              apply();
            }
          });
        
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function () { return scope.fieldsField != undefined ? JSON.stringify(scope.fieldsField.selectedRows) : '' },
          function (value) {
            if (value != undefined && scope.categoriesField != undefined) {
              var parsed = JSON.parse(value);              // check if we CAN run
              scope.data.namefilter = parsed[0].name;  
              apply();
            }
          });
        
        
        scope.$watch('nameField', function () {
          scope.data.namefilter = (scope.nameField != undefined && scope.nameField.length>0) ? scope.nameField.split(',') : undefined;
          apply();
        });
            
        scope.$watch('catField', function () {
          scope.data.catfilter = (scope.catField != undefined && scope.catField.length>0) ? scope.catField.split(',') : undefined;
          apply();
        });
            
        scope.$watch('modelField', function () {
          scope.data.id = scope.modelField;                 
          apply();
        });
            
        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.reset = function () {
              scope.data.catfilter  = undefined;
              scope.data.namefilter = undefined;
              apply();
            };
          }
        });

      }
    };
  }

}());
