(function(){
	"use strict";

	angular.module('app')
		.controller('reminder', reminder);

	reminder.$inject = ['$scope', '$interval', 'Reminder', 'ReminderService'];

	function reminder($scope, $interval, Reminder, ReminderService) {
		var _menuActive = null;
		$scope.setMenuActive = _setMenuActive;
		$scope.getMenuActive = _getMenuActive;

		$scope.getStatusClass = _getStatusClass;

		$scope.sortType = ['-complete', 'created_at'];
		$scope.sortReverse = true;
		$scope.filter;
		$scope.filterStr = 'all';

		function _setMenuActive(reminder){
			_menuActive = reminder;
		}
		function _getMenuActive(){
			return _menuActive;
		}
		$scope.getPriority = function(reminder){
			switch(reminder.priority){
				case 'L':
					return 'Low';
					break;
				case 'M':
					return 'Medium';
					break;
				case 'H':
					return 'High';
					break;
				default:
					return 'Low';
			}
		}
		$scope.setFilter = function (filter){
			if (filter =='upcoming'){
				$scope.filter = {complete: false};
				$scope.filterStr = 'upcoming';
				$scope.sortType = '-remind_date';
			}
			else if (filter=='sent'){
				$scope.filter = {complete: true};
				$scope.filterStr = 'sent';
			}
			else{
				$scope.filter = '';
				$scope.filterStr = 'all';
				$scope.sortType = ['-complete', 'created_at'];
			}
		};

		function _getStatusClass(reminder) {
			var now = new Date().getTime();
			var rt = new Date(reminder.remind_date).getTime();
			if (reminder.on_hold){
				return "fa fa-pause fa-pink"
			} else if (rt > now){
				return "fa fa-clock-o fa-blue"
			} else {
				return "fa fa-check fa-green"
			}
			// if (reminder.complete){
			// 	return "fa fa-check fa-green"
			// } else if (reminder.on_hold){
			// 	return "fa fa-pause fa-pink"
			// } else {
			// 	return "fa fa-clock-o fa-blue"
			// }
		};

		$scope.isActiveFilter = function (filter){
			if(filter == $scope.filterStr){
				return true;
			}
			return false;
		}
		$scope.toggleReverse = function() {
			$scope.sortReverse = !$scope.sortReverse;
		};

		$scope.setSortType = function(sortType){
			$scope.sortType = sortType;
		};
		$scope.getDirectionClass = function(){
			if($scope.sortReverse === true){
				return 'glyphicon-arrow-up';
			}else{
				return 'glyphicon-arrow-down';
			}
		};

		$scope.reminders = ReminderService.reminders;

		$scope.delete = function(reminder) {
			ReminderService.deleteReminder(reminder);
		};
	}
})();
