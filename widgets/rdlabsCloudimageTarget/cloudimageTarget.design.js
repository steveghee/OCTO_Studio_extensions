/* begin copyright text
 *
 * Copyright © 2020 PTC Inc., Its Subsidiary Companies, and /or its Partners. All Rights Reserved.
 *
 * end copyright text
 */

(function(twxAppBuilder){

  function ciTarget( widgetLabel ) {
    var overlay = {};

    overlay.rx = Twx3dCommon.common3dProp('rx');
    overlay.rx.default = -90;
    overlay.rx.alwaysWriteAttribute = true; // this flag is needed for any defaults different from the browser defaults

    overlay.placeholder_img = Twx3dCommon.getPlaceHolderImgProperty('/extensions/images/cloudimage_phantom.png');

    overlay.id = {
            name: 'markerId',
           label: 'Target Name',
        datatype: 'string',
         default: '',
     placeholder: 'Bind/Enter (optional) Target Name',
 isBindingTarget: true,
       sortOrder: 1
    };

    overlay.access = {
            name: 'access',
           label: 'Access Key',
        datatype: 'string',
         default: 'change me',
     placeholder: 'Bind/Enter access key',
 isBindingTarget: true,
           tFrag: 'ng-src="{{\'vuforia-cloud:///?id=\' + me.markerId + \'&access=\' + me.access + \'&secret=\' + me.secret}}"',
       sortOrder: 1
    };

    overlay.secret = {
            name: 'secret',
           label: 'Secret Key', 
        datatype: 'string',
         default: 'change me',
     placeholder: 'Bind/Enter secret key',
 isBindingTarget: true,
       sortOrder: 2
    };

    overlay.imgurl = {
            name: 'url',
           label: 'ves-ar-extension:Image',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.png', '.jpg', '.svg', '.jpeg', '.gif','.bmp'],
       isVisible: true,
         default: '../../extensions/images/cloudimage_phantom.png',
           tFrag: 'guide-src="{{me.url}}"',
       sortOrder: 2
        };
        
     overlay.width = {
            name: 'width',
           label: 'ves-ar-extension:Marker Width',
        datatype: 'number',
         default: 0.1,
 isBindingTarget: true,
 alwaysWriteAttribute: true,
           tFrag: 'size="{{me.width}}"',
             min: 0,
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
    
    var removals = ['billboard', 'occlude', 'opacity', 'visible', 'shader', 'scale', 'decal', 'trackingIndicator'];
    
    // create the default props list (add the ones we created, remove the list above)
    var props = Twx3dCommon.new3dProps(overlay, removals);
    // and create the template
    var template = Twx3dCommon.buildRuntimeTemplate("twx-dt-target", props, true);
    
    // create a design template - this is a 3D image (can be dragged etc.)
    var designTemplate = Twx3dCommon.buildRuntimeTemplate('twx-dt-image', Twx3dCommon.new3dProps(overlay, ['markerId','access','secret','visible']));

    var retObj = {
        
         elementTag: "octo-cloudimage-dt-target",
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
                        return designTemplate.replace('size="${this.me.width}"',
                                                      'src="/extensions/images/placeholder_user_defined.svg" opacity="1" hidden="false" width="{{me.width}}" height="{{me.width/2}}" sx="1" sy="1" sz="1"');
                     },

    runtimeTemplate: function (props) {
                       var tmpl = template.replace("#widgetId#", props.widgetId);
                       return tmpl;
                     },
                   
    delegate: function () {

      // called when a widgets properties are altered
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
        // a blank (none image) guide makes no sense, so we dont allow it 
        if(changedProps.url === "") {
          widgetCtrl.setProp('url','../../extensions/images/cloudimage_phantom.png');
        }
      };
      return this;
    }

    };

    TargetUtils.registerWidgetAsTarget(retObj);
    return retObj;
  }

  function cloudimageTarget() {
    var widget = Twx3dCommon.getWidget( 'OCTO Cloud Image Target', ciTarget );
    return widget;
  }
  twxAppBuilder.widget('cloudimageTarget', cloudimageTarget);

})(twxAppBuilder);
