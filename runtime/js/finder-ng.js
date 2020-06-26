if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = 'finder-ng';
}

var findcmds = {
    "starts": function (a, b) { return a.search(b) === 0 },
    "not"  :  function (a, b) { return a != b },
    "same"  : function (a, b) { return a === b },
    "like"  : function (a, b) { return b.length>0 && a.search(b) >= 0  },
    "unlike": function (a, b) { return b.length>0 && a.search(b) <  0  },
    "eq"    : function (a, b) { return parseFloat(a) === parseFloat(b) },
    "ne"    : function (a, b) { return parseFloat(a) !=  parseFloat(b) },
    "lt"    : function (a, b) { return parseFloat(a)  <  parseFloat(b) },
    "gt"    : function (a, b) { return parseFloat(a)  >  parseFloat(b) },
    "le"    : function (a, b) { return parseFloat(a) <=  parseFloat(b) },
    "ge"    : function (a, b) { return parseFloat(a) >=  parseFloat(b) },
    "in"    : function (a,b,c){ var pa = parseFloat(a); return  (pa >= parseFloat(b) && pa <= parseFloat(c)) },
    "out"   : function (a,b,c){ var pa = parseFloat(a); return !(pa >= parseFloat(b) && pa <= parseFloat(c)) },
    "before": function (a,b)  { var pa = Date.parse(a); var pb = Date.parse(b); return pa < pb; },
    "after" : function (a,b)  { var pa = Date.parse(a); var pb = Date.parse(b); return pa > pb; },
};

function pvmeta(pvs,linq) {
    this.pvp  = pvs;
    var linq = linq;
    this.properties = function() {
        var props = linq.from(this.pvp.components)
                        .where (function(cmp) { return cmp.properties != undefined })
                        .select(function(s) { 
                            var names = linq.from(s.properties)
                                            .select(function(n) { return n.key})
                                            .toArray();
            
                            var instances = linq.from(s.children)
                                                .where (function(c) { return c.properties != undefined; })
                                                .select(function(c) {
                                                    var inames = linq.from(c.properties)
                                                                     .select(function(n) { return n.key})
                                                                     .toArray();
                                                    return inames;
                                                })
                                                .toArray();
                
                            var result = linq.from(names)
                                             .union(instances)
                                             .toArray();
                            return result;;
                        })
                        .toArray();
    
        // now count these up    
        var unique=new Object();
        props.forEach(function (a) {
            if (a != undefined && a instanceof Array) a.forEach(function (b) {
                if (b instanceof Array) {
                    b.forEach(function(c){
                        if (unique[c] === undefined)
                             unique[c] = 1;
                        else
                            unique[c] += 1;
                    });
                }
                else {
                    if (unique[b] === undefined)
                        unique[b] = 1;
                    else
                        unique[b] += 1;
                }
            });
        });
        
        // unsorted list, but doesnt trip out the heap!
        var order = new Array();
        for (var key in unique) {
            if (unique.hasOwnProperty(key)) {
                order.push({name:key, count:unique[key]});
            }
        }
    
        // finally, sort by name (or value)
        var oot = linq.from(order)
                      .orderBy('$.name')
                    //.orderBy("$.value")
                      .select(function(n) { return n; }) //return {name:n.key, count:n.value};})
                      .toArray();
              
        // sorted list of property name:count          
        return oot;
    }

    this.byName = function(name, lval, op, kval) {
        // we have a property name  
        var pname = name.toLowerCase();
        var props = undefined;
  
        // do we have a property value?
        if (lval != undefined) {
            var pval, comparer, rval=undefined;
            if (op != undefined) {
                pval = lval.toLowerCase();

                //yes, so lets look for name < value  
                compstr  = op.toLowerCase();
                comparer = findcmds[compstr];
                if (comparer == undefined)
                    return undefined;
            }
            else {
                pval = lval.toLowerCase();

                //yes, so lets look for name==value  
                comparer = findcmds["eq"];
            }
            if (kval != undefined) 
                rval = kval.toLowerCase();
            
            var pps = linq.from(this.pvp.components)
                          .where(function (cmp) {
                              return (cmp.properties != undefined &&
                                      cmp.properties[pname] != undefined &&
                                      comparer(cmp.properties[pname],pval,rval)) })
                          .select(function (s) { return { cid: s.cid, key: pname, value: s.properties[pname] }; })
                          .toArray();
    
            var ips = new Array();
            this.pvp.components.forEach(function(cmp) {
                var kids = linq.from(cmp.children)
                               .where(function (c) {
                                   return c.properties != undefined &&
                                          c.properties[pname] != undefined &&
                                          comparer(c.properties[pname],pval,rval); })
                               .select(function(s) { 
                                   return { cid: s.cidref, key: pname, value: s.properties[pname] };})
                               .toArray();   
                kids.forEach(function(a) { ips.push(a)});
            });
            props = linq.from(pps).union(ips).toArray();
        }
        else { 
            var pps = linq.from(this.pvp.components)
                          .where(function(cmp) { return (cmp.properties != undefined && 
                                                         cmp.properties[pname] != undefined) })
                          .select(function(s) { return {cid:s.cid, key:pname, value:s.properties[pname]}; })
                          .toArray();
    
            var ips = new Array();
            this.pvp.components.forEach(function(cmp) {
                var kids = linq.from(cmp.children)
                               .where (function(c) { return c.properties != undefined &&
                                                            c.properties[pname] != undefined; })
                               .select(function(s) { 
                                   return {cid:s.cidref, key:pname, value:s.properties[pname]}; })
                               .toArray();   
                kids.forEach(function(a) { ips.push(a)});
            });
            props = linq.from(pps).union(ips).toArray();
        }
        //console.log(props);
        if (props != undefined) {  
            var inst = linq.from(this.pvp.idmap)
                           .join(props,"map=>map.value.cid","id=>id.cid","outer,inner=>{path:outer.key,key:inner.key, value:inner.value}")
                           .select(function(s) { return s; })
                           .toArray();
            return inst;               
        }
        else {
            return [];
        }
    }
}


(function () {
  'use strict';

  var finderModule = angular.module('finder-ng', []);
  finderModule.directive('ngFinder', ['$timeout', '$http', ngFinder]);

  function ngFinder($timeout, $http) {

    return {
      restrict: 'EA',
      scope: {
        nameField    : '@',
        valueField   : '@',
        opField      : '@',
        srcField     : '@',
        autoField    : '@',
        resultsField : '=',
        countField   : '=',
        delegateField: '='
      },
      template: '<div></div>',
      link: function (scope, element, attr) {

        var lastUpdated = 'unknown';
        scope.data = { name: undefined, 
                      value: undefined, 
                         op: undefined, 
                        src: undefined, 
                        pvm: undefined, 
                    results: [], 
                       prev: undefined,
                    promise: undefined,
                       auto: true
                     };

        var executeFinder = function() {
          scope.data.prev = scope.data.results;

          scope.data.results = scope.data.pvm.byName(scope.nameField,scope.valueField,scope.opField);

          // output the output variables
          scope.$parent.view.wdg[scope.$parent.widgetId]['results'] = scope.data.results;
          scope.$parent.view.wdg[scope.$parent.widgetId]['count']   = scope.data.results.length;

          scope.$parent.fireEvent('complete');
        };

        var find = function(){
          scope.$parent.fireEvent('start');
          $timeout(function () {

            // has the source data changed?  
            if (scope.srcField != scope.data.src) {  // the input source data has changed
              scope.data.src = scope.srcField;

              $http.get(scope.data.src, {},
                        { headers: { Accept: "application/json", "Content-Type": "application/json" } }
              ).then(function (response) {
                if (scope.data.pvm === undefined)
                  scope.data.pvm = new pvmeta(response.data, Enumerable);
                else             
                  scope.data.pvm.pvp = response.data;
                executeFinder()
              }, function (response) {
                console.log('failed to get ' + data.src);    
              });
            }           
            // if not, run the query again
            else
              executeFinder();

          }, 1);

        };

        var updateFinder = function(){
          if (scope.data.promise === undefined)
            scope.data.promise = $timeout(function(){
              scope.data.promise = undefined;  
              if (scope.data.auto)
                executeFinder();
          },1000);
        };

        scope.$watch('nameField', function () {
          updateFinder();
        });

        scope.$watch('valueField', function () {
          updateFinder();
        });

        scope.$watch('opField', function () {
          updateFinder();
        });

        scope.$watch('srcField', function () {
          find();
        });

        scope.$watch('autoField', function () {
          scope.data.auto = (scope.autoField != undefined && scope.autoField === 'true') ? true :false ;
          updateFinder();
        });

        scope.$watch('delegateField', function (delegate) {
          if (delegate) {
            delegate.find = function () {
              find();
            };
          }
        });

      }
    };
  }

}());
