(function($) {

	/**
	 * Ship object
	 * @constructor
	 * @param {String} type Ship type
	 * @param {Number} size Ship size
	 */
	SeaBattle.Ship = function(type, size) {
		/**
		 * Ship type
		 * @type {Object.<String>}
		 */
		this.type = type;
		/**
		 * 
		 * @type {Object.<Number>}
		 */
		this.size = size;
		/**
		 * Shots count to this ship 
		 * @type {Object.<Number>}
		 */
		this.shotCount = 0;
	};

	SeaBattle.Ship.prototype = {
		/**
		 * Make some damage to the ship.
		 * Decrease this.shotCount value.
		 */
		shot : function() {
			if (this.shotCount < this.size) {
				this.shotCount++;
			}
		},

		/**
		 * return Kill ship status
		 * @returns {Boolean} Is ship killed
		 */
		isKilled : function() {
			return this.shotCount >= this.size;
		}
	};

})(jQuery);
