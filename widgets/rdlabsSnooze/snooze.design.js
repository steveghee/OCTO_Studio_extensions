function twxSnooze() {
  return {
    elementTag: 'octo-snooze',
      
    label    : 'Snooze',
    
    category : 'ar',
    groups   : ['Navigation'],
    
    properties: [
      {
            name: 'timeout',
           label: 'Timeout (seconds)',
        datatype: 'Number',
         default: 5,
 isBindingSource: false,
 isBindingTarget: true,
       showInput: true,
       isVisible: true
      },
      {
            name: 'disabled',
           label: 'Disabled',
        datatype: 'boolean',
         default: false,
 isBindingTarget: true
      }
    ],

    events: [
      {
        name: 'countingdown',
        label: 'Countdown'
      },
      {
        name: 'countcancelled',
        label: 'Cancelled'
      },
      {
        name: 'stopped',
        label: 'Stopped'
      }
    ],

    services: [
      {
        name: 'snooze',
        label: 'Snooze'
      }
    ],
    
    dependencies: {
      files         : ['js/matrix.js', 'js/snooze-ng.js'],
      angularModules: ['snooze-ng']
    },

    designTemplate: function (data, html) {
      return html`<div class="snoozeWidget">Snooze : timeout ${this.me.timeout}</div>`;
    },

    runtimeTemplate: function (props, twxWidgetEl, fullOriginalDoc, $, projectSettings) {
      var ctrl = '<div ng-snooze id-field="' + props.widgetId + '"' + 
                 ' timeout-field={{me.timeout}} disabled-field={{me.disabled}}' +
                 ' delegate-field="delegate"></div>\n';
      return ctrl;
    },
    
    delegate: function () {

      /**
       * @param element
       * @return Returns the widget controller for the given widget element
       */
      function getWidgetController (widgetEl) {
        return angular.element(widgetEl).data('_widgetController');
      }

      //Delete related model-items before removing model from thingview, fixes memory-ptr errors
      this.beforeDestroy = function (element, widgetCtrl) {
      }
      
      //
      // called on init!
      // lets force enabletrackingevents ON
      //
      this.init = function(element, widgetCtrl) {
        let view = widgetCtrl.element().closest('twx-dt-view');
        var root = angular.element(view).data('_widgetController');
        if (root != undefined)
          root.setProp('enabletrackingevents', true);
      }
      
      this.widgetCreated = function(widgetCtrl) {
      }
      
      this.widgetAdded = function(widgetCtrl, dropTarget) {
      }
      
      this.widgetUpdated = function (widgetCtrl, currentProps, changedProps, oldProps) {
      }

      return this;
    }

  }
}

twxAppBuilder.widget('twxSnooze', twxSnooze);