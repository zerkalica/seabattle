(function($) {
	
	/**
	 * @constructor
	 * @param {Object.<String, Array.<Number>>} shipTypes ship types object
	 * @param {Element} messageArea Score status message area
	 */
	SeaBattle.Score = function(shipTypes, messageArea) {
		var self = this;
		this.shipTypes = shipTypes;
		this.messageArea = messageArea;
		this.shipsCount = 0;
		this.shipsCountTotal = 0;
		/**
		 * Ships counters
		 * @type {Object.<String, Number>}
		 */
		this.ships = {};
		this.reset();
	};
	
	SeaBattle.Score.prototype = {
			
		/**
		 * Decrease ship count by type
		 * and update status message
		 * @param {String} type Ship type
		 */
		decrease: function(type) {
			this.ships[type]--;
			this.shipsCount --;
			var count = this.ships[type];
			$("#" + type, this.messageArea).html(count);
		},
		
		/**
		 * Get destroyed status for all ships 
		 * @returns {Boolean} Is all ships destroyed
		 */
		isAllShipsDestroyed: function() {
			return this.shipsCount == 0;
		},
		
		/**
		 * Reset ships count to initial state
		 */
		reset: function() {
			this.ships = {};
			this.shipsCount = 0;
			this.goodShotsCount = 0;
			for (type in this.shipTypes) {
				var shipItem = this.shipTypes[type];
				var count = shipItem[1];
				this.ships[type] = count;
				this.shipsCount += count;
				$("#" + type, this.messageArea).html(count);
			}
			this.shipsCountTotal = this.shipsCount;
		},
		
		/**
		 * Get killed ships count
		 * @returns {Number}
		 */
		getKilledShips: function () {
			return this.shipsCountTotal - this.shipsCount;
		},
		
		/**
		 * Get good shots count
		 * (which make damage or kill ship)
		 * @returns {Number}
		 */
		getGoodShots: function () {
			return this.goodShotsCount;
		},
		
		/**
		 * Increase good shot count
		 */
		increaseGoodShotCount: function () {
			this.goodShotsCount++;
		}
		
	};

})(jQuery);
