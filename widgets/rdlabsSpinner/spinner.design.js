function twxSpinner() {
  return {
    elementTag: 'twx-spinner',

    label: 'Turntable',
    category : 'ar',
    groups    : ['OCTO Labs'],

    properties: [
      {
            name: 'class',
           label: 'Class',
        datatype: 'string',
         default: ''
      },
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
           label: 'Rate',
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
      return '<div class="spinnerWidget"></div>';
    },

    dependencies: {
      files         : ['js/spinner-ng.js'],
      angularModules: ['spinner-ng']
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-spinner class="ng-hide spinnerWidget ' + props.class + '" spinning-field={{me.spinning}} direction-field={{me.direction}} rate-field={{me.rate}} revs-field={{me.revs}} angle-field=me.angle></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxSpinner', twxSpinner);