(function($) {
	
	/**
	 * Weapons for shooting to the ships
	 * @constructor
	 * @param {Number} count Initial weapons count
	 * @param {Element} messageArea Html area to display weapons count status message
	 */
	SeaBattle.Weapons = function(count, messageArea) {
		/**
		 * Current weapons count
		 * @type {Number}
		 */
		this.count = count;
		
		/**
		 * Initial weapons count
		 * @type {Number}
		 */
		this.max = count;
		
		/**
		 * Html message area to displa status
		 * @type {Element}
		 */
		this.messageArea = messageArea;
		this.messageArea.html(this.count);
	};
	
	SeaBattle.Weapons.prototype = {
		/**
		 * Decrease weapon and update status message
		 */
		decrease: function() {
			if (this.count > 0) {
				this.count --;
			}
			this.messageArea.html(this.count);
		},
		
		/**
		 * Get weapons empty status
		 * @returns {Boolean} Is weapons empty
		 */
		isEmpty: function () {
			return (this.count <= 0);
		},

		/**
		 * get shots count
		 * @returns {Number}
		 */
		getShots: function() {
			return this.max - this.count;
		},
		
		/**
		 * Reset weapons count to initial values
		 */
		reset: function() {
			this.count = this.max;
		}
	
	};

})(jQuery);
