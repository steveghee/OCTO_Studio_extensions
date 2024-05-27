function octoDynamicTarget() {
  return {
    elementTag: 'octodynamic-dt-target',

    label: 'Dynamic Target',

    category : 'ar',
    groups: ['Targets'],
    
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo; // whilst we await support in the viewer..
    },
    canBeAdded: function (ctrl, $scope) {
      return TargetUtils.canTargetBeAdded(ctrl);
    },

    properties: [
      {
        name: 'dataset',
        label: 'ves-ar-extension:Data Set',
        datatype: 'string',
        default:'',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'url',
        label: 'ves-ar-extension:Image',
        datatype: 'string',
        default: '',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'size',
        label: 'Width (m) override',
        datatype: 'string',
        default: '',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'targetId',
        label: 'Target ID',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        isVisible: true
      },
      {
        name: 'log',
        label: 'Debug',
        datatype: 'string',
        default: '',
        isBindingSource: true,
        isVisible: true
      },
      {
        name: 'isTracked',
        label: 'ves-ar-extension:Tracked',
        datatype: 'boolean',
        readonly: false,
        default: false,
        isBindingSource: true,
        isVisible: true
      }
    ],

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
      files         : ['js/dynamictarget-ng.js'],
      angularModules: ['dynamictarget-ng']
    },


    designTemplate: function () {
      return '<div class="dynamicTargetWidget"></div>';
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var tmpl = '<twx-dt-target id="dummy" src="spatial://"/><div ng-dynamictarget name-field="'+props.widgetId+'" logging-field="me.log" dataset-field={{me.dataset}} targetid-field={{me.targetId}} size-field={{me.size}} url-field={{me.url}} tracked-field="me.isTracked" ></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('octoDynamicTarget', octoDynamicTarget);

