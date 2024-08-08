function twxLister() {
  return {
    elementTag: 'twx-lister',

    label     : 'Lister',
    category  : 'ar',
    groups    : ['OCTO Labs'],

    properties: [
      {
            name: 'namefilter',
           label: 'Field to Include',
        datatype: 'string',
         default: '',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'catfilter',
           label: 'Category to Include',
        datatype: 'string',
         default: '',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'fields',
           label: 'Fields',
        datatype: 'Infotable',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
      {
            name: 'categories',
           label: 'Categories',
        datatype: 'Infotable',
  isBindingSource: true,
  isBindingTarget: false,
        showInput: false
      },
      {
            name: 'selected',
           label: 'Selected',
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
      }
    ],

    services: [
      {
        name: 'reset',
        label: 'Reset'
      }
    ],
    
    events: [
      {
         name: 'complete',
        label: 'Completed'
      },
    ],

    designTemplate: function (data, html) {
      return '<div class="listerWidget"></div>';
    },

    dependencies: {
      files         : ['js/lister-ng.js'],
      angularModules: ['lister-ng']
    },

    runtimeTemplate: function (props) {
        
      var tmpl = '<div ng-lister fields-field="me.fields" categories-field="me.categories" selected-field="me.selected" name-field={{me.namefilter}} cat-field={{me.catfilter}} model-field={{me.model}}  delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('twxLister', twxLister);