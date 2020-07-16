function twxBillboard() {
  return {
    elementTag: 'twx-billboard',
      
    label    : 'Billboard',
    
    category : 'ar',
    groups    : ['OCTO Labs'],
    isVisibleInPalette: function(scope) {
      let builderSettings = scope.$root.builderSettings || {};
      return !!builderSettings.octo;
    },

    properties: [
      {
        name: 'auto',
        label: 'Auto',
        datatype: 'boolean',
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'affects',
        label: 'Affects',
        datatype: 'string',
        default: '',
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'angle',
        label: 'Angle',
        datatype: 'number',
        default:0,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      },
      {
        name: 'offset',
        label: 'Offset',
        datatype: 'number',
        default:0,
        isBindingSource: false,
        isBindingTarget: true,
        showInput: true
      }
    ],

    events: [
        {
            name: 'aligned',
            label: 'Aligned'
        }
    ],

    services: [
      {
        name: 'align',
        label: 'Align'
      }
    ],
    
    dependencies: {
      files         : ['js/matrix.js', 'js/billboard-ng.js'],
      angularModules: ['billboard-ng']
    },

    designTemplate: function () {
      return '<div class="billboardWidget"></div>';
    },

    runtimeTemplate: function (props) {
      var tmpl = '<div ng-billboard class="billboardWidget" angle-field={{me.angle}} offset-field={{me.offset}} auto-field={{me.auto}} affects-field={{me.affects}} delegate-field="delegate"></div>';
      return tmpl;
    },
    
    delegate: function () {

      //
      // called on init!
      // lets force enabletrackingevents ON
      //
      this.init = function(element, widgetCtrl) {
        let view = widgetCtrl.element().closest('twx-dt-view')
        var root = angular.element(view).data('_widgetController');
        if (root != undefined)
          root.setProp('enabletrackingevents', true);
      }
      
      return this;
    }

  }
}

twxAppBuilder.widget('twxBillboard', twxBillboard);