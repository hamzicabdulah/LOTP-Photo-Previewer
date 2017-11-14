const App = angular.module('gingrPhotos', ['ui.materialize']);

App.controller('gingrPhotosCtrl', ['$scope', '$http', ($scope, $http) => {
    $scope.photos = [];
    $scope.loading = false;
    $scope.searchingDate = getCurrentDate();
    getPhotos();

    function getCurrentDate() {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        return (mm + '-' + dd + '-' + yyyy);
    }

    $scope.getPhotos = getPhotos;

    function getPhotos() {
        $scope.showingDate = '';
        $scope.photos = [];
        $scope.loading = true;
        console.log('Getting photos');
        $http({
            method: 'GET',
            url: '/api/photos/' + $scope.searchingDate
        }).then(response => {
            $scope.showingDate = $scope.searchingDate;
            $scope.photos = response.data;
            $scope.loading = false;
        }, err => {
            console.log(err);
            $scope.loading = false;
            $scope.photos = [];
        });
    }
}]);