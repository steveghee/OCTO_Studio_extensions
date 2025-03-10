/* begin copyright text
 *
 * Copyright © 2020 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function(twxAppBuilder){

  function octoParametricTarget( widgetLabel ) {
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
    overlay.occluder = {
            name: 'occluder',
           label: 'Occlusion Geometry',
        datatype: 'string',
 isBindingSource: false,
 isBindingTarget: true,
       isVisible: true,
       sortOrder: 4
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


    var retObj = {

         elementTag: "octoparametric-dt-target",
              label: widgetLabel,
 isVisibleInPalette: function(scope) {
                       return true;
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

      designTemplate: function (props, html) {
        // create a design template - this is a 3D image (can be dragged etc.)
        return html`<twx-dt-model
          id="#widgetId#"
          src="${this.me.maskurl}"
          opacity="1"
          hidden="false"
          sx="1"
          sy="1"
          sz="1"
          x="${this.me.x}"
          y="${this.me.y}"
          z="${this.me.z}"
          rx="${this.me.rx}"
          ry="${this.me.ry}"
          rz="${this.me.rz}"
          occlude="true"
          decal="false"
          shader=""
        ></twx-dt-model>`;
      },

    runtimeTemplate: function (props) {
                       var tmpl = template.replace("#widgetId#", props.widgetId);
                       var occluder = '<twx-dt-model id="'+props.widgetId+'-occluder" src="{{me.occluder}}" occlude="true" phantom="false" opacity="1" hidden={{me.occluder.length==0}} decal="false" shader="" sx="1" sy="1" sz="1" x={{me.x}} y={{me.y}} z={{me.z}} rx={{me.rx}} ry={{me.ry}} rz={{me.rz}}></twx-dt-model>';
                       return occluder + tmpl;
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

  twxAppBuilder.widget('octoParametricTarget', function() {
    var widget = Twx3dCommon.getWidget( 'OCTO Parametric Target', octoParametricTarget );
    return widget;
  });

})(twxAppBuilder);
