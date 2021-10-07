function twxTurntable() {
  return {
    elementTag: 'twx-turntable',

    label: 'Turntable',
    // note : only specify category if you want to limit usage to a specific experience type
    //category: 'ar',  
    // in this case, we want this widget to be available anywhere, so we do NOT specify a category
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return true; //!!builderSettings.octo;
    },

    properties: [
      {
            name: 'spinning',
           label: 'Spinning',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'rate',
           label: 'Rate (degrees per second)',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'revs',
           label: 'Max Revolutions',
        datatype: 'number',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'angle',
           label: 'Angle',
        datatype: 'number',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'revCount',
           label: 'Revolutions',
        datatype: 'number',
 isBindingSource: true,
 isBindingTarget: false,
       showInput: false
      },
      {
            name: 'direction',
           label: 'Direction',
        datatype: 'select',
         default: '1',
 isBindingTarget: true,
          editor: 'select',
         options: [
           {label: 'Clockwise', value: "1"},
           {label: 'Counter Clockwise', value: "2"},
         ],
      }
    ],


    events: [
      {
         name: 'started',
        label: 'Started'
      },
      {
         name: 'stopped',
        label: 'Stopped'
      },
    ],

    designTemplate: function () {
      return '<div class="turntableWidget"></div>';
    },

    dependencies: {
      files         : ['js/turntable-ng.js'],
      angularModules: ['turntable-ng']
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-turntable spinning-field={{me.spinning}} direction-field={{me.direction}} rate-field={{me.rate}} revs-field={{me.revs}} angle-field=me.angle></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxTurntable', twxTurntable);