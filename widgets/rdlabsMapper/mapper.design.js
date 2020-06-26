function twxMapper() {
  return {
    elementTag: 'twx-mapper',

    label: 'Mapper',
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
            name: 'shader',
           label: 'Shader',
        datatype: 'string',
         default: 'green',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'default',
           label: 'Default',
        datatype: 'string',
         default: 'screendoor',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'polarity',
           label: 'Polarity',
        datatype: 'boolean',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'model',
           label: 'Model Id',
        datatype: 'string',
         default: 'model-1',
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'data',
           label: 'Data',
        datatype: 'string',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
    ],

    events: [
      {
         name: 'complete',
        label: 'Completed'
      },
    ],

    designTemplate: function () {
      return '<div class="mapperWidget"></div>';
    },

    dependencies: {
      files         : ['js/mapper-ng.js'],
      angularModules: ['mapper-ng']
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-mapper class="ng-hide mapperWidget ' + props.class + '" info-field="me.data" shader-field={{me.shader}} default-field={{me.default}} polarity-field={{me.polarity}} model-field={{me.model}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxMapper', twxMapper);