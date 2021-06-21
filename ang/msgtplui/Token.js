(function(angular, $, _) {
  angular.module('msgtplui').directive('msgtpluiToken', function($uibModal, $rootScope) {
    return {
      // require: '^crmUiIdScope',
      scope: {
        onSelect: '@'
      },
      template: '<input type="text" class="form-control input-sm form-control-sm" />',
      link: function(scope, element, attrs, crmUiIdCtrl) {
        // element.on('click', function(){
        //   // window.alert('hi')
        //   var modalInstance = $uibModal.open({
        //     component: 'msgtpluiTokenModal',
        //     resolve: {
        //       tokenList: function() {
        //         return {'{ab.cd}': 'ABCD', '{ef.gh}': 'EFGH'};
        //       }
        //     }
        //   });
        //   modalInstance.result.then(function(){
        //     console.log('received value');
        //   });
        //   // $rootScope.$digest();
        // });

        $(element).addClass('crm-action-menu fa-code').crmSelect2({
          theme: "bootstrap",
          width: "12em",
          dropdownAutoWidth: true,
          data: CRM.crmMailing.mailTokens,
          placeholder: ts('Tokens')
        });
        $(element).on('select2-selecting', function(e) {
          e.preventDefault();
          $(element).select2('close').select2('val', '');
          scope.$parent.$eval(attrs.onSelect, {
            token: {name: e.val}
          });
        });
      }
    };
  });

  angular.module('msgtplui').component('msgtpluiTokenModal', {
    template: '<div><p>Hello component</p><pre>{{$ctrl.tokenList|json}}</pre></div>',
    bindings: {},
    controller: function() {
      var $ctrl = this;
      $ctrl.selected = {};
      $ctrl.tokenList = [1,2,3];

      $ctrl.ok = function () {
        $ctrl.close({$value: $ctrl.selected.item});
      };

      $ctrl.cancel = function () {
        $ctrl.dismiss({$value: 'cancel'});
      };
    }
  });

})(angular, CRM.$, CRM._);

