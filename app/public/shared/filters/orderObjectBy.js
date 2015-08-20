module.exports = (function() {

  return function(items, field) {

    var filtered = [];
    angular.forEach(items, function(item, key) {
      item.key = key;
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    return filtered;

  };

})();