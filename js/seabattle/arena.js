(function($) {

	var SeaBattle = {}; // Init namespace
	
	/**
	 * Sea battle arena - main
	 * @constructor
	 * @param {Element} body Arena body
	 * @param {Element} score Score message area
	 * @param {Element} weapons Weapons message area
	 * @param {Element} status Status messages
	 * @param {Number} sizeX Arena columns count
	 * @param {Number} sizeY Arena rows count
	 * @param {Boolean} debug Shows all ships
	 */
	SeaBattle.Arena = function(body, score, weapons, status, sizeX, sizeY, debug) {
		this.sizeX = (sizeX || 10);
		this.sizeY = (sizeY || 10);
		this.debug = (debug || false);

		this.body = $("tbody", body);
		this.scoreArea = $(score); 
		this.weaponsArea = $(weapons);
		this.statusArea = $(status);
		/**
		 * Ships counters by type
		 * @type {Object.<String, Number>}
		 */
		this.shipTypes = {};
		/*
		this.shipTypes = { 
			"ship-4": [4, 1],
			"ship-3": [3, 2],
			"ship-2": [2, 4],
			"ship-1": [1, 5]
		};
		*/
		
		var self = this;
		/**
		 * Load ships counters from html list items with ship-item class
		 */
		$(".ship-item", this.scoreArea).each( function() {
			var size = this.id.substr(5);
			self.shipTypes[this.id] = [(size * 1), ($(this).html() * 1)];
		});

		/**
		 * Arena cell template
		 * @type {Element}
		 */
		this.templateCell = $(".clean:first", this.body).clone();
		
		/**
		 * Arena row template
		 * @type {Element}
		 */
		this.templateRow = $(".row:first", this.body).clone().empty();
		
		/**
		 * Init score and weapons objects, binds message areas
		 */
		this.score = new SeaBattle.Score(this.shipTypes, this.scoreArea);
		$("#weapons-ships-total", this.scoreArea).html(this.score.shipsCountTotal);
		var weaponsCountArea = $("#weapons-count", this.weaponsArea);
		
		this.weapons = new SeaBattle.Weapons(weaponsCountArea.html(), weaponsCountArea);
		
		this.reset();
		
		/**
		 * Show builded arena
		 */
		body.removeClass("hidden");
	};

	SeaBattle.Arena.prototype = {
		
		/**
		 * Reset all arena items: ships, weapons, score, status.
		 * Builds arena body and place ships on it.
		 * Update status with playing message.
		 */
		reset: function () {
			var self = this;
			this.body.click(function(event) {
				// Bind clicks to arena body
				self.onClick(event);
				// Cancel default event
				return false;
			});
		
			this.buildBody();
			this.placeShips(this.shipTypes);
			this.score.reset();
			this.weapons.reset();
			this.statusArea
				.removeClass("status-lose status-win")
				.addClass("status-playing")
				.html("playing");
		},
		
		/**
		 * Reset and build arena table body from templates.
		 * Set X and Y position data to each cell
		 * @protected
		 */
		buildBody : function() {
			this.body.empty();
			for (posY = 0; posY < this.sizeY; posY++) {
				var row = this.templateRow.clone();
				for (posX = 0; posX < this.sizeX; posX++) {
					var cell = this.templateCell.clone();
					cell.data("pos", {"X": posX, "Y": posY});
					row.append(cell);
				}
				this.body.append(row);
			}
		},
		
		/**
		 * Check some area for any ships
		 * @protected
		 * @param {{left: number, right: number, up: number, down: number}} bound
		 * @param {Array.<Number, Array.<Number>>} shipsMap thwo-dimensional array of arena ship map
		 * @returns {Boolean} Is ships found
		 */
		checkBounds: function(bound, shipsMap) {
			var placed = true;
			for(var curX = bound.left; curX <= bound.right; curX++) {
				for(var curY = bound.up ; curY <= bound.down; curY++) {
					if ( shipsMap[curX][curY] ) {
						placed = false;
						break;
					}
				}
			}
			return placed;
		},
		
		/**
		 * Found and place ship to arena
		 * @protected
		 * @param {SeaBattle.Ship} ship Ship object
		 * @param {Array.<Number, Array.<Number>>} shipsMap thwo-dimensional array of arena ship map
		 * @returns {Boolean} Is ship placed
		 */
		placeShip: function(ship, shipsMap) {
			
			/**
			 * Ship size
			 * @type {Number}
			 */
			var size = ship.size;
			
			/**
			 * Is placed to arena
			 * @type {Boolean}
			 */
			var placed = false;
			
			/**
			 * Ship X-position on arena
			 * @type {Number}
			 */
			var posX;
			
			/**
			 * Ship Y-position on arena
			 * @type {Number}
			 */
			var posY;
			
			/**
			 * Ship direction on arena
			 * 0 - horizontal
			 * 1 - vertical
			 * @type {Number}
			 */
			var direction;
			
			/**
			 * To prevent infinite script loop.
			 * in cases, when arena size is too small and ships count is too big
			 * @type {Number}
			 */
			var countIteration = 100;
			
			/**
			 * In this loop:
			 * Get random direction and positions on arena
			 * Check required area for the ship with spaces around.
			 * If area not found - repeat loop
			 * Else - place ship to this coords and exit from loop 
			 */
			do {
				/**
				 * Get random direction and positions on arena
				 */
				direction = Math.floor( Math.random() * 2 );
				posX = Math.floor( Math.random() * this.sizeX );
				posY = Math.floor( Math.random() * this.sizeY );
				
				if (direction == 0) { //horizontal
					var maxPosX = posX + size;
					if (maxPosX <= this.sizeX) {
						var bound = {};
						
						/**
						 * Calculate required area for the ship
						 * with spaces around.
						 */
						bound.left = Math.max(0, posX - 1);
						bound.up = Math.max(0, posY - 1);
						bound.right = Math.min(this.sizeX - 1, maxPosX + 1);
						bound.down = Math.min(this.sizeY - 1, posY + 1);
						
						/**
						 * Is this another ship in this area.
						 */
						placed = this.checkBounds(bound, shipsMap);
						if (placed) {
							/**
							 * If no another ships found
							 * place ship object pointer to required cells of ships map
							 */
							for (var i = posX; i < maxPosX; i++) {
								shipsMap[i][posY] = ship;
							}
						}
					}
					
				} else { // vertical
					/**
					 * Analogically for horizontal direction.
					 * For comments see above.
					 */
					var maxPosY = posY + size;
					if (maxPosY <= this.sizeY) {
						var bound = {};
						bound.left = Math.max(0, posX - 1);
						bound.up = Math.max(0, posY - 1);
						
						bound.right = Math.min(this.sizeX - 1, posX + 1);
						bound.down = Math.min(this.sizeY - 1, maxPosY + 1);
						
						placed = this.checkBounds(bound, shipsMap);
						if (placed) {
							for (var i = posY; i < maxPosY; i++) {
								shipsMap[posX][i] = ship;
							}
						}
					}
				}
				
			} while ( !placed && ( (countIteration--) > 0) );
			return placed;
		},

		/**
		 * Init ships map and place ships on it
		 * @protected 
		 * @param {Object.<String, Array<Number>>} shipTypes
		 * @returns {Array} Ship map with ships placed
		 */
		makeShipsMap : function(shipTypes) {
			var shipsMap = new Array(this.sizeX);
			for(var i = 0 ; i < this.sizeY; i++) {
				shipsMap[i] = new Array(this.sizeY);
			}
			
			for (type in shipTypes) {
				var shipItem = shipTypes[type];
				var count = shipItem[1];
				var size  = shipItem[0]; 
				for (var i = 0; i < count; i++) {
					var ship = new SeaBattle.Ship(type, size);
					this.placeShip(ship, shipsMap);
				}
			}
			return shipsMap;
		},
		
		/**
		 * Make ships map, place ships to it.
		 * And associate each cell of arena html-table with ship, obtained from ships map.
		 * @protected
		 * @param {Object.<String, Array<Number>>} shipTypes
		 */
		placeShips: function (shipTypes) {
			var self = this;
			var shipsMap = this.makeShipsMap(shipTypes);
			
			/**
			 * For each table cell
			 */
			$('.cell', this.body).each(function() {
				var cellPos = $(this).data("pos");
				/**
				 * Get ship object from ships map.
				 * @type {SeaBattle.Ship|null}
				 */
				var ship = shipsMap[cellPos.X][cellPos.Y];
				if (ship) {
					if (self.debug) {
						/**
						 * For debug - show ship on the arena
						 */
						$(this).addClass("ship");
					}
				}
				
				/**
				 * Attach ship object to table cell
				 */
				$(this).data("ship", ship);
			});
		},

		/**
		 * Arena click handler
		 * @protected
		 * @param {Object} event click event
		 */
		onClick : function(event) {
			var target = $(event.target);
			if (target.is(".cell")  ) {
				if (target.is(".clean")) {
					var ship = target.data("ship");
					if (!ship) {
						/**
						 * If not ship object attached to cell - make miss shot
						 */
						this.onShotMiss(target);
					} else {
						/**
						 * ship object found in clicked cell - make damage
						 */
						ship.shot();
						this.score.increaseGoodShotCount();
						if (!ship.isKilled()) {
							/**
							 * Ship not killed - invoke damage hook
							 */
							this.onShotDamaged(target);
						} else {
							/**
							 * Ship killed - invoke kill hook
							 * and update score
							 */
							this.onShotKilled(ship);
							this.score.decrease(ship.type);
						}
					}
					
					/**
					 * In any cases decrease weapon
					 */
					this.weapons.decrease();
					
					/**
					 * Update shot statistics
					 */
					var accuracy = Math.floor( 100 * this.score.getGoodShots() / this.weapons.getShots());
					$("#weapons-maked", this.weaponsArea).html( this.weapons.getShots() );
					$("#weapons-good-shots", this.weaponsArea).html( this.score.getGoodShots() );
					$("#weapons-accuracy", this.weaponsArea).html( accuracy );
					$("#weapons-ships-killed", this.scoreArea).html( this.score.getKilledShips() );
					
					if ( this.score.isAllShipsDestroyed() || this.weapons.isEmpty() ) {
						/**
						 * Game over
						 */
						
						if ( !this.score.isAllShipsDestroyed() ) {
							/**
							 * Weapon is empty, but not all ships are destroyed - we are lose.
							 */
							this.statusArea
								.removeClass("status-win status-playing")
								.addClass("status-lose")
								.html("You lose");
						} else {
							/**
							 * All ships destroyed - update status message - we win.
							 */
							this.statusArea
								.removeClass("status-lose status-playing")
								.addClass("status-win")
								.html("You win");
						}
						
						/**
						 * Unbind click handler to prevent continue the game.
						 */
						this.body.unbind("click");
					}
				}
			}
		},

		/**
		 * Missed shot hook
		 * Update arena cell
		 * @protected
		 * @param {Element} target Clicked arena cell
		 */
		onShotMiss : function(target) {
			target
				.removeClass("clean")
				.addClass("miss");
		},

		/**
		 * Damage shot hook
		 * Update arena cell
		 * @protected
		 * @param {Element} target Clicked arena cell
		 */
		onShotDamaged : function(target) {
			target
				.removeClass("clean ship")
				.addClass("damaged");
		},

		/**
		 * Kill shot hook
		 * Get all cells, used by killed ship
		 * and update this cells.
		 * @protected
		 * @param {SeaBattle.Ship} ship Ship object
		 */
		onShotKilled : function(ship) {
			var shipCells = $('.cell', this.body).filter(function() {
				return $(this).data("ship") == ship;
			});

			shipCells
				.removeClass("clean damaged ship")
				.addClass("killed");
		}
	};
	window.SeaBattle = SeaBattle;
})(jQuery);
