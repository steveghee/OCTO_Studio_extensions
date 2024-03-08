function twxAmp() {
  return {
    elementTag: 'twx-amp',

    label: 'Amp',
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
             name: 'input',
            label: 'Input',
         datatype: 'number',
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'gain',
            label: 'Gain',
         datatype: 'number',
  isBindingSource: false,
  isBindingTarget: true,
        showInput: true
      },
      {
             name: 'result',
            label: 'Output',
         datatype: 'number',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
    ],

    dependencies: {
      files         : ['js/amp-ng.js'],
      angularModules: ['amp-ng']
    },


    designTemplate: function () {
      return '<div class="ampWidget">Amp<p>Gain: {{me.gain}}</div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-amp result-field="me.result" input-field={{me.input}} gain-field={{me.gain}}>{{me.gain}}</div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxAmp', twxAmp);