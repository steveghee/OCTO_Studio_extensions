/* begin copyright text
 *
 * Copyright © 2020 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function(twxAppBuilder){

  function mtTarget( widgetLabel ) {
    var overlay = {};

    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.rx.default = -90;
    overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults
    overlay.ry = Twx3dCommon.common3dProp('ry');
    overlay.rz = Twx3dCommon.common3dProp('rz');
    overlay.rx.isVisible = false; // user cannot rotate Model marker
    overlay.rx.isBindingTarget = false;
    overlay.ry.isVisible = false;
    overlay.ry.isBindingTarget = false;
    overlay.rz.isVisible = false;
    overlay.rz.isBindingTarget = false;
    overlay.x  = Twx3dCommon.common3dProp('x');
    overlay.x. isVisible = false;
    overlay.x. isBindingTarget = false;
    overlay.y  = Twx3dCommon.common3dProp('y');
    overlay.y. isVisible = false;
    overlay.y. isBindingTarget = false;
    overlay.z  = Twx3dCommon.common3dProp('z');
    overlay.z. isVisible = false;
    overlay.z. isBindingTarget = false;
    overlay.z. default = 0;

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
    var designTemplate = Twx3dCommon.buildRuntimeTemplate('twx-dt-image', Twx3dCommon.new3dProps(overlay, ['dataset','visible']));

    var retObj = {
        
         elementTag: "threesixty-dt-target",
              label: widgetLabel,
 isVisibleInPalette: true,
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
           readonly: true,
            default: '',
           datatype: 'string',
          isVisible: false
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
                        return designTemplate.replace('size="{{me.width}}"',
                                                      'src="/extensions/images/placeholder_user_defined.svg" opacity="1" hidden="false" width="{{me.width}}" height="{{me.width/2}}" sx="1" sy="1" sz="1"');
                     },

    runtimeTemplate: function (props) {
                       var tmpl = template.replace("#widgetId#", props.widgetId);
                       
                       // strip off .dat extension: 'app/resources/Uploaded/DB2.dat' -> 'app/resources/Uploaded/DB2'
                       var data = props.dataset ? props.dataset.replace(/\.[^\.]*$/, '') : '';
                       
                       // result is like: src="vuforia-model:///app/resources/Uploaded/DB2?id=T1"
                       tmpl = tmpl.replace('#_src_#', 'vuforia-model:///' + data + '?id=' + props.targetId);
                       return tmpl;
                     }
    };

    TargetUtils.registerWidgetAsTarget(retObj);
    return retObj;
  }

  function mt360Target() {
    var widget = Twx3dCommon.getWidget( '360 Model Target', mtTarget );
    return widget;
  }
  twxAppBuilder.widget('mt360Target', mt360Target);

})(twxAppBuilder);
