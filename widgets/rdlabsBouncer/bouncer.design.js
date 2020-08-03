function twxBouncer() {
  return {
    elementTag: 'twx-bouncer',

    label: 'Bouncer',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

    properties: [
      {
            name: 'bouncing',
           label: 'Bouncing',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rate',
           label: 'Rate',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'min',
           label: 'Minimum',
        datatype: 'number',
         default: 0.0,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'max',
           label: 'Maximum',
        datatype: 'number',
         default: 1.0,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'value',
           label: 'Value',
        datatype: 'number',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'bounceCount',
           label: 'Bounces',
        datatype: 'number',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'limit',
           label: 'Max Bounces',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
    ],

    events: [
      {
         name: 'bounce',
        label: 'Bounced'
      },
      {
         name: 'stopped',
        label: 'Stopped'
      },
    ],

    dependencies: {
      files         : ['js/bouncer-ng.js'],
      angularModules: ['bouncer-ng']
    },

    designTemplate: function () {
      return '<div class="bouncerWidget"></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-bouncer bouncing-field={{me.bouncing}} min-field={{me.min}} max-field={{me.max}} rate-field={{me.rate}} limit-field={{me.limit}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxBouncer', twxBouncer);