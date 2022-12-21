if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'metagetta-ng';
}

(function () {
  'use strict';

  var mapperModule = angular.module('metagetta-ng', []);
  mapperModule.directive('ngMetagetta', ['$timeout', '$http', '$window', '$injector', ngMetaGetta]);

  function ngMetaGetta($timeout, $http, $window, $injector) {

    return {
      restrict: 'EA',
      scope: {
        modelField    : '@',
        includeField  : '@',
  singleaslistField   : '@',
        infoField     : '=',
        resultsField  : '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
          
        scope.data = {     id: undefined,
                      include: undefined,
                         info: undefined,
                     disabled: false,
            formatsingleaslist: true,    
                      results: []
                     };
                     
                             //
        // look through the presented/selected items, picking out the metadata
        //
        var apply = function() {
            if (scope.data.id != undefined && scope.data.info != undefined) 
              PTC.Metadata.fromId(scope.data.id)
                 .then( (meta) => {
                                                     
                  var isSingleList = scope.data.info.length == 1;  
                  
                  // if we have specified one or more property names ...                                   
                  if (scope.data.include != undefined && scope.data.include.length > 0) {
                      
                    scope.data.results = [];  
                    for (var i=0;i<scope.data.info.length;i++) {
                        
                      var idpath = scope.data.info[i].path;      
                        
                      //now lets see if we can get the other properies that user is asking for 
                      var ask = scope.data.include;
                      var res = meta.get(idpath, ask);
                      
                      if (res != undefined && res.length === ask.length) {
                          
                        // return name/value pair list  
                        if (isSingleList && scope.data.formatsingleaslist == true) {
                            
                          var retobj   = { model: scope.data.id,
                                            path: idpath, 
                                            rows: [] 
                                         } ;  
                          for (var p in res) {
                            retobj.rows.push({name:ask[0], value:res[p]});
                          }
                          scope.data.results = retobj;

                        } else {
                          
                          // user has asked for specific fields, so we return an array
                          // of objects containing the specified named fields
                          var retobj = {};  
                          retobj.model = scope.data.id;  
                          retobj.path  = idpath;  
                          for (var p=0;p<ask.length;p++) {
                            // add each result as a new property in the return body  
                            retobj[ask[p]] = res[p];
                          }
                          scope.data.results.push(retobj);
                        }
                        
                      }
                    }
                  } else {
                      
                    // otherwise, let's see if there a list of properties we can get  
                    scope.data.results = [];  
                    for (var i=0;i<scope.data.info.length;i++) {
                      var idpath = scope.data.info[i].path;      
                      var res = meta._getRawProps()[idpath];
                      
                      if (res != undefined) {
                          
                        if (isSingleList && scope.data.formatsingleaslist == true) {
                            
                          // lets try outputting a name/value  infotable to make it
                          // easier to represent results in a repeater etc.
                          var retobj = { model: scope.data.id,
                                          path: idpath,
                                          rows: [] 
                                       } ;  
                          for (var p in res) {
                            for (var v in res[p]) {  
                              retobj.rows.push({name:v, category:p, value:res[p][v]});
                            }
                          }

                          scope.data.results = retobj;
                          
                        } else {
                            
                          // output an array of objects with all the properties
                          // named
                          var retobj = {};  
                          retobj.model = scope.data.id;  
                          retobj.path  = idpath;  
                          retobj.categories = {};
                          for (var p in res) {
                            // add each result as a new property in the return body  
                            retobj.categories[p] = res[p];
                          }
                          scope.data.results.push(retobj);
                        }    
                      }
                    }
                     
                  }
              })
              .finally( () => {
                if (scope.data.results != undefined) 
                  scope.resultsField = scope.data.results;
                scope.$parent.fireEvent('complete');
                scope.$parent.$applyAsync();
              });
            
        };
        
        ///////////////////////////////////////////////////////////////////////////
        // if there is no bound data, but the user PICKs from the selected model,
        // we can return the filtered metadata items
        scope.$root.$on('userpick', function(evt, src, type, evtdata) { 
                        
          //only follow this IF there is no bound input and we are enabled              
          if (scope.data.id === src && !scope.data.disabled && scope.infoField === undefined) {
              
            console.log(scope.data.id+' userpick');
            var pathid      = JSON.parse(evtdata).occurrence;
            
            // we need to look at the structure to see if the selected item is welded, and if so we walk up the tree
            PTC.Metadata.fromId(scope.data.id)
                        .then( (meta) => {
                              
              var looking = true;                
              while (looking) {
                  
                // illustrate sBOMs can contain collapsed structure indicators (done using metadata!)  
                var sbominfo = meta.get(pathid, 'sBOM_Welded');
                
                if (sbominfo != undefined && sbominfo === 'true') {
                    
                  // try the parent until we reach the root, in which case abort
                  var child = pathid.lastIndexOf('/');
                  if (child === 0) 
                    looking = false;               // we've reached the root. stop here.
                  pathid = pathid.substr(0,child); // otherwise, step up
              
                } else {
                  looking = false;
                }
              }
            
              scope.data.info = [];
              scope.data.info.push({ model: scope.data.id, path: pathid });
              //scope.data.info.model = scope.data.id;
              //scope.data.info.path  = pathid;
              apply();
            })
            .catch((err) => { console.log('metadata extraction failed with reason : ' + err) 
            })
           
          }
        });
            
        ///////////////////////////////////////////////////////////////////////////
        // watch for changes
        //
        scope.$watch('includeField', function () {
          scope.data.include = (scope.includeField != undefined && scope.includeField.length>0) ? scope.includeField.split(',') : undefined;
          apply();
        });
            
        scope.$watch('singleaslistField', function () {
          scope.data.formatsingleaslist = (scope.singleaslistField != undefined && scope.singleaslistField === 'true') ? true :false ;
          apply();
        });
            
        scope.$watch('modelField', function () {
          scope.data.id = scope.modelField;                 
          apply();
        });

        scope.$watch('infoField', function () {
          scope.data.info = scope.infoField;                 
          apply();
        });
            
        scope.$watch(
          function() { return JSON.stringify(scope.infoField)},
          function(value) {
            if (value != undefined) 
              scope.data.info = scope.infoField;                 
              apply();
        });
            
        // if there is a SUBSET of data defined, lets watch to see if that list changes    
        scope.$watch(
          function() { return scope.infoField != undefined ? JSON.stringify(scope.infoField.selectedRows) : ''},
          function(value) {
            if (value != undefined && scope.infoField != undefined) {
              scope.data.info = scope.infoField.selectedRows;                 
              apply();
            }
        });
      }
    };
  }

}());
