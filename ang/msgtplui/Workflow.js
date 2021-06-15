(function(angular, $, _) {

  // Display a list of system-workflow message-templates.
  angular.module('msgtplui').config(function($routeProvider) {
      $routeProvider.when('/workflow', {
        reloadOnSearch: false,
        controller: 'MsgtpluiListCtrl',
        controllerAs: '$ctrl',
        templateUrl: '~/msgtplui/Workflow.html',
        resolve: {
          prefetch: function(crmApi4, crmStatus) {
            var q = crmApi4({
              records: ['MessageTemplate', 'get', {
                select: ["id", "msg_title", "is_default", "is_active"],
                where: [["workflow_name", "IS NOT EMPTY"], ["is_reserved", "=", "0"]],
                orderBy: {"msg_title":"ASC"},
              }],
              translationStatuses: ['Translation', 'get', {
                select: ['entity_id', 'language', 'language:label', 'status_id', 'status_id:name'],
                where: [['entity_table', '=', 'civicrm_msg_template']],
                groupBy: ['entity_id', 'language', 'status_id'],
              }]
            });
            return crmStatus({start: ts('Loading...'), success: ''}, q);
          }
        },
      });
    }
  );

})(angular, CRM.$, CRM._);
