(function(angular, $, _) {

  /**
   * Convert keys with literal dots to Javascript subtrees.
   *
   * @param rec
   *   Ex: {'foo.bar.whiz:bang': 123}
   * @returns {{}}
   *   Ex: {foo_bar_whiz_bang: 123}
   */
  function simpleKeys(rec) {
    var newRec = {};
    angular.forEach(rec, function(value, key) {
      newRec[key.replaceAll('.','_').replaceAll(':', '_')] = value;
    });
    return newRec;
  }

  angular.module('msgtplui').controller('MsgtpluiListCtrl', function($scope, $route, crmApi4, crmStatus, crmUiAlert, crmUiHelp, prefetch, $location) {
    var ts = $scope.ts = CRM.ts('msgtplui');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/msgtplui/User'}); // See: templates/CRM/msgtplui/User.hlp
    $scope.crmUrl = CRM.url;
    $scope.crmUiAlert = crmUiAlert;
    $scope.location = $location;
    $scope.checkPerm = CRM.checkPerm;
    $scope.help = CRM.help;

    $scope.$bindToRoute({
      param: 'f',
      expr: 'filters',
      default: {text: ''}
    });

    var ctrl = this;
    ctrl.records = [].concat(prefetch.records, _.map(prefetch.translations || [], simpleKeys));

    /**
     *
     * @param record
     * @param variant - One of null 'legacy', 'current', 'draft'. (If null, then 'current'.)
     * @returns {string}
     */
    ctrl.editUrl = function(record, variant) {
      if (variant === 'legacy') {
        return CRM.url('civicrm/admin/messageTemplates/add', {action: 'update', id: record.id, reset: 1});
      }
      var url = '#/edit?id=' + encodeURIComponent(record.id);
      if (record.tx_language) {
        url = url + '&lang=' + encodeURIComponent(record.tx_language);
      }
      if (variant === 'draft') {
        url = url + '&status=draft';
      }
      return url;
    };

    ctrl.delete = function (record) {
      var q = crmApi4('MessageTemplate', 'delete', {where: [['id', '=', record.id]]}).then(function(){
        $route.reload();
      });
      return crmStatus({start: ts('Deleting...'), success: ts('Deleted')}, q);
    };

    ctrl.toggle = function (record) {
      var wasActive = !!record.is_active;
      var q = crmApi4('MessageTemplate', 'update', {where: [['id', '=', record.id]], values: {is_active: !wasActive}})
        .then(function(resp){
          record.is_active = !wasActive;
        });
      return wasActive ? crmStatus({start: ts('Disabling...'), success: ts('Disabled')}, q)
        : crmStatus({start: ts('Enabling...'), success: ts('Enabled')}, q);
    };

  });

})(angular, CRM.$, CRM._);
