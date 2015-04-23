'use strict';

var PopupController = function($scope, $rootScope, $http) {
  if ($scope.tweetData['user.profile_image_url']) {
    $scope.tweetData['user.profile_image_url'] = $scope.tweetData['user.profile_image_url'].replace('_normal', '');
  }

  var string = $scope.tweetData['text'];

  if (string) {
    string = string.replaceAll('"@', '" @');
    $scope.tweetData['text'] = window.linkify(string);
  }

  $scope.formatAddress = function(data) {
    console.log('data', data);

    var address = [];

    var addressFields = [
      'logradouro',
      'complemento',
      'number',
      'zipcode',
      'city',
      'state'
    ];

    addressFields.forEach(
      function(field) {
        if (data[field]) {

          if (field === 'zipcode') {
            var zip = data[field];
            zip = zip.substring(0, 5) + '-' + zip.substring(5, 8);
            address.push(zip);
          } else if (field === 'number') {
            address.push('Nº: ' + data[field]);
          } else {
            address.push(data[field]);
          }
        }
      }
    );

    return address.join(' - ') || 'No address';
  }
};