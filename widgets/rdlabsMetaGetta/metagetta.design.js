function twxMetaGetta() {
  return {
    elementTag: 'twx-metagetta',

    label     : 'MetaGetta',
    category  : 'ar',
    groups    : ['OCTO Labs'],

    properties: [
      {
            name: 'include',
           label: 'Fields to Include',
        datatype: 'string',
         default: '',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'results',
           label: 'Results',
        datatype: 'Infotable',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
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
            name: 'info',
           label: 'Data',
        datatype: 'Infotable',
 isBindingTarget: true,
       showInput: true
      },
      {
        name: 'singleaslist',
        label: 'Format single-select as list',
        datatype: 'boolean',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
      {
         name: 'complete',
        label: 'Completed'
      },
    ],

    designTemplate: function (data, html) {
      return '<div class="metaGettaWidget"></div>';
    },

    dependencies: {
      files         : ['js/metagetta-ng.js'],
      angularModules: ['metagetta-ng']
    },

    runtimeTemplate: function (props) {
        
      var tmpl = '<div ng-metagetta results-field="me.results" info-field="me.info" include-field={{me.include}} singleaslist-field={{me.singleaslist}} model-field={{me.model}}></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxMetaGetta', twxMetaGetta);