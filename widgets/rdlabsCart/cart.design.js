function octoCart() {
  return {
    elementTag: 'octo-cart',

    label: 'Cart',
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return true;
    },

    properties: [
      {
            name: 'include',
           label: 'Fields to Include',
        datatype: 'string',
         default: '',
 isBindingTarget: true,
       isVisible: true,
       showInput: true
      },
      {
            name: 'items',
           label: 'Items',
        datatype: 'Infotable',
         default: false,
 isBindingSource: true,
       showInput: false
      },
      {
            name: 'data',
           label: 'Data',
        datatype: 'Infotable',
         default: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'count',
           label: 'Count',
        datatype: 'Integer',
         default: false,
 isBindingSource: true,
       showInput: false
      },
      {
        name: 'shared',
        label: 'Share across all Views',
        datatype: 'boolean',
        default:true,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
      {
         name: 'changed',
        label: 'Changed'
      },
    ],
    
  services: [
      {
         name: 'add',
        label: 'Add'
      },
      {
         name: 'remove',
        label: 'Remove'
      },
      {
         name: 'reset',
        label: 'Reset'
      }
    ],

    designTemplate: function (data, html) {
      return '<div class="cartWidget"></div>';
    },

    dependencies: {
      files         : ['js/cart-ng.js'],
      angularModules: ['cart-ng']
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      
      var tmpl = '<div ng-cart info-field="me.data" count-field="me.count" content-field="me.items" shared-field={{me.shared}} include-field={{me.include}} delegate-field="delegate"></div>';
      return tmpl;
    }
  }
}

twxAppBuilder.widget('octoCart', octoCart);