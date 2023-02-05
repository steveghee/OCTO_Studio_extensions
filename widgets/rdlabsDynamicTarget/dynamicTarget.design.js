/* begin copyright text
 *
 * Copyright © 2020 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function(twxAppBuilder){

  function octoDynamicTarget( widgetLabel ) {
    var overlay = {};
    
    // lets use defaults 
    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.ry = Twx3dCommon.common3dProp('ry');
    overlay.rz = Twx3dCommon.common3dProp('rz');
    overlay.x  = Twx3dCommon.common3dProp('x');
    overlay.y  = Twx3dCommon.common3dProp('y');
    overlay.z  = Twx3dCommon.common3dProp('z');

    overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/dynamictarget.png');
    
    overlay.dataset = {
            name: 'dataset',
           label: 'ves-ar-extension:Data Set',
        datatype: 'string',
         default: '',
           tFrag: 'ng-src="{{me.dataset + \'?id=\' + me.targetId}}"',
       sortOrder: 1,
 isBindingTarget: true,
       isVisible: true
       };
    overlay.imgurl = {
            name: 'url',
           label: 'ves-ar-extension:Image',
        datatype: 'string',
       isVisible: true,
           tFrag: 'guide-src="{{me.url}}"',
 isBindingTarget: true,
       sortOrder: 2
        };
        overlay.size = {
            name: 'size',
           label: 'width (m) override',
        datatype: 'string',
         default: '',
           tFrag: 'size="{{me.size}}"',
 isBindingSource: false,
 isBindingTarget: true,
       sortOrder: 3
    };
    
    overlay.enablescalegesture = {
      name: 'enablescalegesture',
      label: '@ptc/ves-ar-extension:Enable Scale Gesture',
      datatype: 'boolean',
      default: false,
      isBindingSource: false,
      isBindingTarget: true,
      sortOrder: 5002,
      isVisible: true,
    };

    overlay.enabletranslategesture = {
      name: 'enabletranslategesture',
      label: '@ptc/ves-ar-extension:Enable Pan Gesture',
      datatype: 'boolean',
      default: true,
      isBindingSource: false,
      isBindingTarget: true,
      sortOrder: 5000,
      isVisible: true,
    };

    overlay.enablerotategesture = {
      name: 'enablerotategesture',
      label: '@ptc/ves-ar-extension:Enable Rotate Gesture',
      datatype: 'boolean',
      default: true,
      isBindingSource: false,
      isBindingTarget: true,
      sortOrder: 5001,
      isVisible: true,
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
    var designTemplate = '<twx-dt-model id="#widgetId#" src="{{me.maskurl}}" opacity="1" hidden="false" sx="1" sy="1" sz="1" x="0" y="0" z="0" rx="0" ry="0" rz="0" occlude="true" decal="false" shader=""></twx-dt-model>';

    var retObj = {

         elementTag: "octodynamic-dt-target",
              label: widgetLabel,
 isVisibleInPalette: function(scope) {
                       let builderSettings = scope.$root.builderSettings || {};
                       return !!builderSettings.octo; // whilst we await support in the viewer..
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
                        return designTemplate;
                     },

    runtimeTemplate: function (props) {
                       var tmpl = template.replace("#widgetId#", props.widgetId);
                       return tmpl;
                     },

           delegate: function () {

                       // called when a widgets properties are altered
                       this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {

                       }
                       return this;
                     }

    };

    TargetUtils.registerWidgetAsTarget(retObj);
    return retObj;
  }

  twxAppBuilder.widget('octoDynamicTarget', function() {
    var widget = Twx3dCommon.getWidget( 'OCTO Dynamic Target', octoDynamicTarget );
    return widget;
  });

})(twxAppBuilder);
