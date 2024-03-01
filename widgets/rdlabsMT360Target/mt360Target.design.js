/* begin copyright text
 *
 * Copyright © 2020 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function(twxAppBuilder){

  function octo360mtTarget( widgetLabel ) {
    var overlay = {};
    
    // lets use defaults 
    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.ry = Twx3dCommon.common3dProp('ry');
    overlay.rz = Twx3dCommon.common3dProp('rz');
    overlay.x  = Twx3dCommon.common3dProp('x');
    overlay.y  = Twx3dCommon.common3dProp('y');
    overlay.z  = Twx3dCommon.common3dProp('z');

    overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/360target.png');
    
    overlay.dataset = {
            name: 'dataset',
           label: 'ves-ar-extension:Data Set',
        datatype: 'resource_url',
         default: '',
    resource_url: true,
 allowedPatterns: ['.dat'],
           tFrag: 'src="#_src_#"',
       sortOrder: 1,
       isVisible: true
       };
    overlay.imgurl = {
            name: 'url',
           label: 'ves-ar-extension:Image',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
       isVisible: true,
           tFrag: 'guide-src="{{me.url}}"',
       sortOrder: 2
        };
    overlay.modelurl = {
            name: 'maskurl',
           label: 'Mask',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.pvz'],
       isVisible: false,
        };
   
    overlay.occluder = {
            name: 'occluder',
           label: 'Occlusion Geometry',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.pvz'],
       isVisible: true,
       sortOrder: 4
        };
        
        overlay.istracked = {
            name: 'istracked',
           label: 'ves-ar-extension:Tracked',
        datatype: 'boolean',
         default: false,
 isBindingSource: true,
 isBindingTarget: false,
       sortOrder: 2000
    };

    overlay.trackingIndicator = {
            name: 'trackingIndicator',
           label: 'ves-ar-extension:Display Tracking Indicator',
        datatype: 'boolean',
         default: false,
 isBindingSource: false,
 isBindingTarget: false,
 alwaysWriteAttribute: true,
       sortOrder: 3000
    };

    overlay.stationary = {
            name: 'stationary',
           label: 'ves-ar-extension:Stationary',
        datatype: 'boolean',
         default: true,
 isBindingSource: false,
 isBindingTarget: false,
       sortOrder: 4000,
       isVisible: function(props, $scope){
         let projectSettings = $scope.$root.projectSettings || {};
         return projectSettings.projectType === 'eyewear';
       }
    };
    
    var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'decal'];
    
    // create the default props list (add the ones we created, remove the list above)
    var props = Twx3dCommon.new3dProps(overlay, removals);
    // and create the template
    var template = Twx3dCommon.buildRuntimeTemplate("twx-dt-target", props, true);
    
    // create a design template - this is a 3D image (can be dragged etc.)
    var designTemplate = '<twx-dt-model id="#widgetId#-mask" src="{{me.maskurl}}" phantom="true" opacity="0.5" hidden="false" sx="1" sy="1" sz="1" x="{{me.x}}" y="{{me.y}}" z="{{me.z}}" rx="{{me.rx}}" ry="{{me.ry}}" rz="{{me.rz}}" occlude="true"></twx-dt-model>';

    var retObj = {
        
         elementTag: "octothreesixty-dt-target",
              label: widgetLabel,
 isVisibleInPalette: function(scope) {
                       let builderSettings = scope.$root.builderSettings || {};
                       return true; //!!builderSettings.octo; // whilst we await support in the viewer..
                     },
           category: 'ar',
             groups: ['Targets'],
        isContainer: false,
         properties: props,
         canBeAdded: function (ctrl, $scope) {
                       return TargetUtils.canTargetBeAdded(ctrl);
                     },
         properties: props.concat([
           {
               name: 'targetId',
              label: 'Target ID',
           readonly: false,
            default: '',
    isBindingTarget: true,
           datatype: 'string',
          isVisible: true
           },
           {
               name: 'size',
              label: 'Width (override)',
           readonly: false,
            default: '',
           datatype: 'string',
          isVisible: true
        }
      
         ]),
             events: [
               {
                 name: 'trackingacquired',
                 label: 'ves-ar-extension:Tracking Acquired'
               },
               {
                 name: 'trackinglost',
                 label: 'ves-ar-extension:Tracking Lost'
               }
             ],

       dependencies: {
         files: ['extensions/images/**']
       },

     designTemplate: function (props) {
                        var tmpl = designTemplate.replace("#widgetId#", props.widgetId);
                        return tmpl;
                     },

    runtimeTemplate: function (props) {
                       var tmpl = template.replace("#widgetId#", props.widgetId);
                       
                       // strip off .dat extension: 'app/resources/Uploaded/DB2.dat' -> 'app/resources/Uploaded/DB2'
                       var data = props.dataset ? props.dataset.replace(/\.[^\.]*$/, '') : '';
                       
                       if (props.size != '') 
                         tmpl = tmpl.replace('#_src_#"', '#_src_#" size='+props.size);
                       
                       // result is like: src="vuforia-model:///app/resources/Uploaded/DB2?id=T1"
                       tmpl = tmpl.replace('#_src_#', 'vuforia-model:///' + data + '?id=' + props.targetId);
                       var occluder = props.occluder.length > 0 ? '<twx-dt-model id="'+props.widgetId+'-occluder" src="{{me.occluder}}" occlude="true" phantom="false" opacity="1" hidden="false" decal="false" shader="" sx="1" sy="1" sz="1" x={{me.x}} y={{me.y}} z={{me.z}} rx={{me.rx}} ry={{me.ry}} rz={{me.rz}}></twx-dt-model>' : '';
                       return occluder + tmpl;
                     },
                   
           delegate: function () {

                       // called when a widgets properties are altered
                       this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
            
                         // automatically sets the viewable when the dat is chosen
                         if (changedProps.dataset) {
              
                           //note we only want the Uploaded/filename(no extension)  
                           var data = changedProps.dataset ? changedProps.dataset.replace(/\.[^\.]*$/, '') : '';
                           data = data.substring(data.indexOf('Uploaded'));
                           widgetCtrl.setProp('maskurl', data+".pvz");
                           
                         }
                       }
                       return this;
                     }
                   
    };

    TargetUtils.registerWidgetAsTarget(retObj);
    return retObj;
  }

  function octo360mt360Target() {
    var widget = Twx3dCommon.getWidget( 'OCTO 360 Model Target', octo360mtTarget );
    return widget;
  }
  twxAppBuilder.widget('octo360mt360Target', octo360mt360Target);

})(twxAppBuilder);
