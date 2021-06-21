(function (angular, $, _) {
  angular.module('msgtplui').component('msgtpluiEditContent', {
    bindings: {
      options: '='
    },
    templateUrl: '~/msgtplui/EditContent.html',
    controller: function ($scope, $element, crmStatus, crmUiAlert, $uibModal, $rootElement) {
      var ts = $scope.ts = CRM.ts('msgtplui');
      var $ctrl = this;

      $ctrl.monacoOptions = function (opts) {
        return angular.extend({}, {
          readOnly: $ctrl.options.disabled,
          wordWrap: 'wordWrapColumn',
          wordWrapColumn: 100,
          wordWrapMinified: false,
          wrappingIndent: 'indent'
        }, opts);
      };

      $ctrl.openFull = function(fld) {
        crmUiAlert({type: 'error', title: ts('TODO: openFull'), text: ts('Not yet implemented')});
      };

      $ctrl.openPreview = function(fld) {
        crmUiAlert({type: 'error', title: ts('TODO: openPreview'), text: ts('Not yet implemented')});
      };

      $ctrl.insertToken = function(fld) {
        // crmUiAlert({type: 'error', title: ts('TODO: insertToken'), text: ts('Not yet implemented')});

        var top = $('<div id="bootstrap-theme" class="foozball"></div>');
        // top.css({top: 15, position: 'fixed'});
        // top.css({
        //   position: "absolute",
        //   marginLeft: 0, marginTop: CRM.$('#civicrm-menu').height(),
        //   top: 0, left: 0
        // });
        // $element.prepend(top);
        $('body').prepend(top);
        CRM.$('#civicrm-menu').hide();

        // console.log('$uibModal', $uibModal);
        $uibModal.open({
          // template: '<p>HELLO!</p>',
          component: 'msgtpluiTokenModal',
          resolve: {
            tokenList: function() {
              return CRM.crmMailing.mailTokens;
            }
          },
          appendTo: top,
          animation: false
        });
        // $timeout(function() {
        //
        //   $('.modal,.modal-backdrop').each(function(){
        //
        //   });
        // });

        // var modalInstance = $uibModal.open({
        //   component: 'msgtpluiTokenModal',
        // });
        // modalInstance.result.then(function(){
        //   console.log('received value');
        // });

      };

    }
  });
})(angular, CRM.$, CRM._);
