function twxSvg() {
  return {
    elementTag: 'octo-svg',

    label: 'Svg',
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
            name: 'src',
           label: 'SVG',
        datatype: 'resource_url',
  resource_image: true,
 allowedPatterns: ['.svg'],
         default: '',
 isBindingTarget: true,
      isVisible : true
  },
        {
            name: 'class',
           label: 'Class',
        datatype: 'string',
         default: '',
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true
      },
      {
            name: 'visible',
           label: 'ves-basic-web-widgets-extension:Visible',
        datatype: 'boolean',
         default: true,
 isBindingTarget: true
      }

    ],

    designTemplate: function (data, html) {
      return html`<object
        id="#widgetId#"
        type="image/svg+xml"
        data="${this.me.src}"
        class="${this.me.class}"
      ></object>`;
    },

    runtimeTemplate: function (props) {
      return '<div ng-show="app.fn.isTrue(me.visible)"><object id="'+props.widgetId+'" type="image/svg+xml" data="{{me.src}}" class="{{me.class}}" twx-native-events></object></div>';
    }
  }
}
twxAppBuilder.widget('twxSvg', twxSvg);