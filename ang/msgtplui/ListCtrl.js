(function(angular, $, _) {

  var xt = angular.extend;

  /**
   * Given a list of MessageTemplates and translationStatuses, make placeholder record to represent each translation.
   *
   * @param records               List of MessageTemplates
   * @param translationStatuses   List of translation statuses
   * @returns {[]}                List of real and pseudo MessageTemplates. Translations have an extra property 'tx' with language+status details.
   */
  function explodeTranslations(records, translationStatuses) {
    var langIdx = {}, statusIdx = {};
    angular.forEach(translationStatuses, function(tx){
      langIdx[tx.entity_id] = langIdx[tx.entity_id] || {};
      langIdx[tx.entity_id][tx.language] = langIdx[tx.entity_id][tx.language] || {'language': tx.language, 'language:label': tx['language:label']};
      statusIdx[tx.entity_id] = statusIdx[tx.entity_id] || {};
      statusIdx[tx.entity_id][tx.language] = statusIdx[tx.entity_id][tx.language] || {};
      statusIdx[tx.entity_id][tx.language]['has_' + tx['status_id:name']] = true;
    });

    var txBlank = {'language': null, 'language:label': null, 'has_active': false, 'has_draft': false};

    var result = [];
    angular.forEach(records, function(record) {
      result.push(xt({}, record));
      angular.forEach(langIdx[record.id] || [], function(lang) {
        var status = statusIdx[record.id][lang.language];
        result.push(xt({}, record, {tx: xt({}, txBlank, lang, status)}));
      });
    });
    return result;
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
    ctrl.prefetch = prefetch;
    ctrl.records = explodeTranslations(prefetch.records || [], prefetch.translationStatuses || []);

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
      if (record.tx && record.tx.language) {
        url = url + '&lang=' + encodeURIComponent(record.tx.language);
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
