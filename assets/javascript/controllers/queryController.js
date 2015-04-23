'use strict';

var QueryController = function($scope, $rootScope, $http, $timeout, $filter, leafletData, services) {

  $scope.suggestions = [];

  $scope.$on('$typeahead.select',
    function(value, index) {
      $scope.applyQuery();
    }
  );

  $scope.getSuggestion = function(query) {
    $scope.suggestions = [];

    if (query && query.length >= 3) {
      // TODO Improvement
      // Pass the applied queries to restrict suggestion
      // with the possible values
      services.getSuggestion(query, $scope.points, $scope.advancedQuery,
        function(array) {
          $scope.suggestions = array;
        }
      );
    }
  };

  $scope.itemRemoved = function($select) {
    $scope.applyQuery($select.$select.selected);
  };

  $scope.itemSelected = function($select) {
    // Reset search value
    $select.$select.search = '';

    if ($scope.checkLimit($select.$select.selected)) {
      // Limit size of selected text in input box
      $select.$select.selected.forEach(
        function(item, index) {
          if (item.text.length > 28) {
            $select.$select.selected[index].name = $filter('limitTo')(item.text, 25) + '...';
          }
        }
      );

      $scope.applyQuery($select.$select.selected);
    } else {
      // Remove the last item added
      $select.$select.selected = $select.$select.selected.slice(0, -1);
    }
  };

  $scope.checkLimit = function(selected) {
    if (selected.length <= 3) {
      return true;
    }

    return false;
  };

  $scope.applyQuery = function(selected) {

    var andQuery = [];

    var name = [];
    var cnaes = [];
    var fantasy_name = [];
    var free = [];

    selected.forEach(
      function(item) {
        if (item.prefix === '@') {
          name.push(item.text);
        } else if (item.prefix === '#') {
          cnaes.push(item.text);
        } else if (item.id) {
          fantasy_name.push(item.text);
        } else {
          var array = [];
          item.text.split(' ').forEach(
            function(i) {
              array.push(i.toLowerCase());
            }
          );
          free = free.concat(array);
        }
      }
    );

    // console.log('name', name);
    // console.log('cnaes', cnaes);
    // console.log('fantasy_name', fantasy_name);
    console.log('free', free);

    if (name.length > 0) {
      var arrayUsers = [];
      name.forEach(
        function(user) {
          arrayUsers.push(user.toLowerCase());
        }
      );

      andQuery.push({
        query: {
          match_phrase: {
            name: arrayUsers.join(' ')
          }
        }
      });
    }

    if (cnaes.length > 0) {
      andQuery.push({
        query: {
          match_phrase: {
            cnae_p_label: cnaes.join(' ')
          }
        }
      });
    }

    if (fantasy_name.length > 0) {
      andQuery.push({
        query: {
          match_phrase: {
            fantasy_name: fantasy_name.join(' ')
          }
        }
      });
    }

    if (free.length > 0) {
      andQuery.push({
        query: {
          match_phrase: {
            fantasy_name: free.join(' ')
          }
        }
      });
    }

    $scope.advancedQuery = null;

    if (andQuery.length > 0) {
      $scope.advancedQuery = {
        query: {
          filtered: {
            filter: {
              and: andQuery
            }
          }
        }
      };
    }

    if (window._gaq && $scope.advancedQuery) {
      window._gaq.push(['_trackEvent', services.config().demoName, 'search']);
    }

    $rootScope.$emit('event:queryChanged', $scope.advancedQuery);
  };

  $rootScope.$on('event:updateGeoAggregation',
    function(event, geom, points, query) {
      $scope.geom = geom;
      $scope.points = points || geom;

      services.pointsToGeojson(points);
    }
  );
};