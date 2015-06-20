'use strict';

angular.module('ngDependencyGraph')
  .controller('MainCtrl', function($scope, $timeout, dev, Graph, Const, currentView, inspectedApp, storage) {
    var ctrl = this;
    $scope.currentView = currentView;

    var rawData = inspectedApp.getData();


    init();

    ctrl.chooseScope = function(val) {
      currentView.setScope(val);
    };

    function init() {

      _.each(rawData.modules, function(module) {
          module.type = 'module';
        
          _.each(module.components, function(com) {
              com._module = module;
          });
      });

      var allComponents = [];
      _.each(rawData.modules, function(module) {
        allComponents = allComponents.concat(module.components);
      });

      var componentsGraph = Graph.createFromRawNodes(allComponents, Const.Scope.COMPONENTS);
      var modulesGraph = Graph.createFromRawNodes(rawData.modules, Const.Scope.MODULES);

      /**
       * Connect modules with components
       */
      _.each(componentsGraph.nodes, function(com) {
        var module = _.find(modulesGraph.nodes, {name: com._data._module.name});
        com.module = module;

        module.componentsByType = module.componentsByType || {};
        if (module.componentsByType[com.type] === undefined) {
          module.componentsByType[com.type] = [];
        }
        module.componentsByType[com.type].push(com);

      });

      currentView.setGraphs(modulesGraph, componentsGraph);
      currentView.apps = rawData.apps; // TODO create accessor for this in currentView

      storage.loadCurrentView().then(function() {
        console.log('ha!');

      }, function() {
        var node = _.find(modulesGraph.nodes, {name: rawData.apps[0]});
        
        if (node) {
          currentView.chooseNode(node);
        } else {
          currentView.setScope(Const.Scope.COMPONENTS);
        }
      });

    }

    // TODO this seems architecturaly lame
    // $scope.$on(Const.Events.UPDATE_GRAPH, function() {
    //   storage.saveCurrentView();
    // });

    $scope.$on(Const.Events.CHOOSE_NODE, function() {
      // storage.saveCurrentView();
    });

  });
