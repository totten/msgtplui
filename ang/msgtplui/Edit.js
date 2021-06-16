(function(angular, $, _) {

  var TRANSLATED = ['msg_subject', 'msg_html', 'msg_text'];

  /**
   * Create an APIv4 request to replace a series of translations.
   *
   * @param id
   *   The ID of the translated entity.
   * @param lang
   *   The language of the translation ('fr_CA', 'en_GB').
   * @param status
   *   The status of the translation ('active', 'draft').
   * @param values
   *   Key-value pairs. ({msg_title: 'Cheerio'})
   * @returns []
   *   An API call which replaces the translations ([entity,action,params]).
   */
  function reqReplaceTranslations(id, lang, status, values) {
    var records = [];
    angular.forEach(values, function(value, key) {
      records.push({"entity_field":key, "string":value});
    });
    return ['Translation', 'replace', {
      records: records,
      where: [
        ["entity_table", "=", "civicrm_msg_template"],
        ["entity_id", "=", id],
        ["language", "=", lang],
        ["status_id:name", "=", status]
      ]
    }];
  }

  function reqDeleteTranslations(id, lang, status) {
    return ['Translation', 'delete', {
      where: [
        ["entity_table", "=", "civicrm_msg_template"],
        ["entity_id", "=", id],
        ["language", "=", lang],
        ["status_id:name", "=", status]
      ]
    }];
  }

  /**
   * Create an APIv4 request to read a series of translations.
   *
   * @param lang
   *   The language of the translation ('fr_CA', 'en_GB').
   * @param status
   *   The status of the translation ('active', 'draft').
   * @returns []
   *   An API call which replaces the translations ([entity,action,params]).
   */
  function reqChainTranslations(lang, status) {
    return ["Translation", "get", {
      "select": ['id', 'entity_field', 'string'],
      "where": [
        ['entity_table', '=', 'civicrm_msg_template'],
        ['entity_id', '=', '$id'],
        ['language', '=', lang],
        ['status_id:name', '=', status]
      ]
    }];
  }

  function respMergeTranslations(prefetch) {
    angular.forEach(prefetch, function(results) {
      angular.forEach(results, function(result) {
        if (result.translations) {
          angular.forEach(result.translations, function(tx) {
            result[tx.entity_field] = tx.string;
          });
        }
      });
    });
    return prefetch;
  }


  function pickFirsts(prefetch) {
    return _.reduce(prefetch, function(all, record, key){
      all[key] = record[0] || undefined;
      return all;
    }, {});
  }

  angular.module('msgtplui').config(function($routeProvider) {
      $routeProvider.when('/edit', {
        controller: 'MsgtpluiEdit',
        controllerAs: '$ctrl',
        templateUrl: '~/msgtplui/Edit.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
        resolve: {
          prefetch: function(crmApi4, crmStatus, $location) {
            var args = $location.search();
            var requests = {};

            requests.main = ['MessageTemplate', 'get', {
              where: [['id', '=', args.id]],
            }];

            requests.original = ['MessageTemplate', 'get', {
              join: [["MessageTemplate AS other", "INNER", null, ["workflow_name", "=", "other.workflow_name"]]],
              where: [["other.id", "=", args.id], ["is_reserved", "=", true]],
              limit: 25
            }];

            if (args.lang) {
              requests.txActive = ['MessageTemplate', 'get', {
                where: [['id', '=', args.id]],
                chain: {translations: reqChainTranslations(args.lang, 'active')}
              }];

              requests.txDraft = ['MessageTemplate', 'get', {
                where: [['id', '=', args.id]],
                chain: {translations: reqChainTranslations(args.lang, 'draft')}
              }];
            }

            return crmStatus({start: ts('Loading...'), success: ''}, crmApi4(requests).then(respMergeTranslations).then(pickFirsts));
          }
        }
      });
    }
  );

  angular.module('msgtplui').controller('MsgtpluiEdit', function($scope, crmApi4, crmBlocker, crmStatus, crmUiAlert, crmUiHelp, $location, prefetch) {
    var block = $scope.block = crmBlocker();
    var ts = $scope.ts = CRM.ts('msgtplui');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/msgtplui/Edit'}); // See: templates/CRM/msgtplui/Edit.hlp
    var ctrl = this;
    var args = $location.search();

    ctrl.records = prefetch;
    if (args.lang) {
      ctrl.lang = args.lang;
      ctrl.tab = args.status === 'draft' ? 'txDraft' : 'txActive';
    }
    else {
      ctrl.lang = null;
      ctrl.tab = 'main';
    }

    ctrl.save = function save() {
      var requests = {};
      if (ctrl.lang) {
        requests.txActive = reqReplaceTranslations(ctrl.records.main.id, ctrl.lang, 'active', _.pick(ctrl.records.txActive, TRANSLATED));
        requests.txDraft = reqReplaceTranslations(ctrl.records.main.id, ctrl.lang, 'draft', _.pick(ctrl.records.txDraft, TRANSLATED));
      }
      else {
        requests.main = ['MessageTemplate', 'update', {
          where: [['id', '=', ctrl.records.main.id]],
          values: ctrl.records.main
        }];
      }
      return block(crmStatus({start: ts('Saving...'), success: ts('Saved')}, crmApi4(requests)));
    };
    ctrl.cancel = function() {
      window.location = '#/workflow';
    };
    ctrl.delete = function() {
      var requests = {};
      if (ctrl.lang) {
        requests.txActive = reqDeleteTranslations(ctrl.records.main.id, ctrl.lang, 'active');
        requests.txDraft = reqDeleteTranslations(ctrl.records.main.id, ctrl.lang, 'draft');
      }
      else {
        requests.main = ['MessageTemplate', 'delete', {where: [['id', '=', ctrl.records.main.id]]}];
      }
      return block(crmStatus({start: ts('Deleting...'), success: ts('Deleted')}, crmApi4(requests)))
        .then(ctrl.cancel);
    };
  });

})(angular, CRM.$, CRM._);
