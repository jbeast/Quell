(function(){

	var Quell = {
		width: 608,
		height: 384,
		tileSize: 32,
		imageFolder: 'img',
		frameRate: 25,
		draw: {},
		mapHeight: 0, // Set at init
		mapWidth: 0,
		numOfSpheres: 0,
		loop: '',
		debug: 0
	};
	
	var images;
	
	
/*******************************************************************************
 * A couple of global helper funtions
 ******************************************************************************/

	function debug(message) {
		if (Quell.debug == true) {
			console.log(message);
		}
	}
	
	function loadImages(sources) {
		var images = {};
	
		for (var key in sources) {
			images[key] = new Image();
			images[key].src = Quell.imageFolder + '/' + sources[key];
		}
		
		return images;
	}
	
	debug('Starting...');
	
	
/*******************************************************************************
 * Map Class
 ******************************************************************************/
	function Map() {
			
		this.mapDefinitions = {
			0: "nothing",
			1: "edge",
			2: "wall",
			3: "sphere",
			4: "upSpike",
			5: "downSpike",
			6: "leftSpike",
			7: "rightSpike",
			8: "allWaysSpike",
			9: "nothing"
		}
		
		this.collisionMap = [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,0,0,2,3,0,0,0,3,0,0,1],
			[1,0,0,0,2,0,9,0,0,6,2,0,0,0,1],
			[1,0,0,0,0,4,0,2,0,2,2,3,0,0,1],
			[1,0,0,0,0,2,0,3,0,2,0,2,0,0,1],
			[1,0,3,0,0,2,3,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]	
		];
		
		this.init = function() {
			Quell.mapHeight = this.collisionMap.length;
			Quell.mapWidth = this.collisionMap[0].length;
			
			for (i = 0, j = this.collisionMap.length; i < j; i++) {
				for (x = 0, y = this.collisionMap[i].length; x < y; x++) {
					if (this.collisionMap[i][x] == 3) {
						Quell.numOfSpheres++;
					}	
				}
			}
		}
			
		this.drawMap = function() {
			
			//Draw the background
			Quell.draw.background();
					
			//Draw the map's background
			Quell.draw.mapBackground(Quell.mapWidth, Quell.mapHeight);
			
			var mapX = mapY = 0;
			
			for (i = 0, j = this.collisionMap.length; i < j; i++) {
				
				for (x = 0, y = this.collisionMap[i].length; x < y; x++) {
					
					Quell.draw.tile(this.mapDefinitions[this.collisionMap[i][x]], mapX, mapY);
					mapX = mapX + Quell.tileSize;
				}
				
				mapY = mapY + Quell.tileSize;
				mapX = 0;
			}
		}
	}
	
	
/*******************************************************************************
 * Bubble Class
 ******************************************************************************/

	function Bubble(collisionMap) {
		
		this.started = false;
		this.moving = false;
		this.radius = 15;
		this.direction = '';
		this.x = 0; // bubble's center 
		this.y = 0;
		this.collisionMap = collisionMap;
		this.speed = 10;
		this.currentTile = {};
		
		var $this = this;
		
		var collisionTest = function() {
			
			$this.currentTile = getCurrentTile(); 
			
			switch ($this.collisionMap[$this.currentTile['y']][$this.currentTile['x']]) {
				case 1:
					debug('hitting a wall!!!!')
					if (wallStopTest($this.currentTile['x'], $this.currentTile['y'])) {
						
						stopBubble($this.currentTile['x'], $this.currentTile['y']);
						
						return true;
					}
					return false;
					break;
				case 2:
					debug('stop stop stop');
					
					stopBubble($this.currentTile['x'], $this.currentTile['y']);
					
					return true;
					break;
				case 3:
					debug('got a sphere!');
					$this.collisionMap[$this.currentTile['y']][$this.currentTile['x']] = 0;
					Quell.numOfSpheres--;
					
					if (Quell.numOfSpheres == 0) {
						alert('You win!');
						clearInterval(Quell.loop);
					}
					
					return false;
					break;
				case 4:
					return testSpike('down');
					break;
				case 5:
					return testSpike('up');
					break;
				case 6:
					return testSpike('right');
					break;
				case 7:
					return testSpike('left');
					break;
				case 8:
					return testSpike('all');
					break;
			}
			
			return false;
		}
		
		var testSpike = function(direction) {
			if ($this.direction == direction || direction == 'all') {
				this.started = false;
				alert('dead!');
				clearInterval(Quell.loop);
				return false;
			} else {
				stopBubble($this.currentTile['x'], $this.currentTile['y']);
				return true;
			}
		}
		
		// Tests whether the opposite side of the map to the one that the bubble is going through
		// has a wall blocking it. MUST BE ABLE TO SIMPLIFY IT SURELY!!!!!
		var wallStopTest = function(x, y) {
			switch ($this.direction) {
				case 'left': 
					for (i = (Quell.mapWidth - 1); i >= 0; i--) {
						if ($this.collisionMap[y][i] == 1) break;
					}
					
					var tile = $this.collisionMap[y][i-1];
					
					if (tile == 2 || tile == 4 || tile == 5 || tile == 6) {
						return true;
					}
					
					return false;
					break;
				case 'up':
					for (i = (Quell.mapHeight - 1); i >= 0; i--) {
						if ($this.collisionMap[i][x] == 1) break;
					}
					
					var tile = $this.collisionMap[i-1][x]; 
					
					if (tile == 2 || tile == 4 || tile == 6 || tile == 7) {
						return true;
					}
					
					return false;
					break;
				case 'right':
					for (i = 0; i <= Quell.mapWidth; i++) {
						if ($this.collisionMap[y][i] == 1) break;
					}
					
					var test = $this.collisionMap[y][i+1];	
					
					if (test == 2 || test == 4 || test == 5 || test == 7) {
						return true;
					}
					
					return false;
					
					break;
				case 'down':
					for (i = 0; i <= Quell.mapHeight; i++) {
						if ($this.collisionMap[i][x] == 1) break;
					}
					
					var test = $this.collisionMap[i+1][x];
					
					if (test == 2 || test == 5 || test == 6 || test == 7) {
						return true;
					}
					
					return false;
					break;
			}
		} 
		
		var edgeTest = function() {
			if ($this.collisionMap[$this.currentTile['y']][$this.currentTile['x']] == 1) {
				underEdge()
			}
		}
		
		var offMapTests = function() {
			offMapTestX();
			offMapTestY();
		}
		
		var offMapTestX = function() {
			if (($this.x - $this.radius) <= 0) {
				$this.x = (Quell.mapWidth * Quell.tileSize) - $this.radius;
				return;
			} 
			
			if (($this.x + $this.radius) >= (Quell.mapWidth * Quell.tileSize)) {
				$this.x = 0 + $this.radius;
				return;
			}
		}
		
		var offMapTestY = function() {
			if (($this.y - $this.radius) <= 0) {
				$this.y = (Quell.mapHeight * Quell.tileSize) - $this.radius;
				return;	
			} 
			
			if (($this.y + $this.radius) >= (Quell.mapHeight * Quell.tileSize)) {
				$this.y = 0 + $this.radius;
				return
			}
		}
		
		var underEdge = function() {
			Quell.draw.tile('edge', $this.currentTile['x'] * Quell.tileSize, $this.currentTile['y'] * Quell.tileSize);
		}
		
		var getCurrentTile = function() {
			var x = y = 0;
			
			if ($this.direction == 'left') {
				x = $this.x - $this.radius;
				return {
					x: Math.floor(x / Quell.tileSize),
					y: Math.floor($this.y / Quell.tileSize)	
				}
			} else if ($this.direction == 'right') {
				x = $this.x + $this.radius;
				return {
					x: Math.floor(x / Quell.tileSize),
					y: Math.floor($this.y / Quell.tileSize)	
				}
			}
			
			if ($this.direction == 'up') {
				y = $this.y - $this.radius;
				return {
					x: Math.floor($this.x / Quell.tileSize),
					y: Math.floor(y / Quell.tileSize)	
				}
			} else if ($this.direction == 'down') {
				y = $this.y + $this.radius;
				return {
					x: Math.floor($this.x / Quell.tileSize),
					y: Math.floor(y / Quell.tileSize)	
				}
			}
		}
		
		var stopBubble = function(x, y) {
					
			switch ($this.direction) {
				case 'left':
					x = x + 1;
					break;
				case 'up':
					y = y + 1;
					break;
				case 'right':
					x = x - 1;
					break;
				case 'down':
					y = y - 1;
					break; 
			}
					
			debug(x + ' ' + y);
	
			$this.x = (x * Quell.tileSize) + (Quell.tileSize / 2),
			$this.y = (y * Quell.tileSize) + (Quell.tileSize / 2);
			
			Quell.draw.bubble($this.x, $this.y, $this.radius);
			$this.direction = '';
			$this.moving = false;
		}
		
		this.drawBubble = function() {
					
			if (!this.started) {
				this.initBubble();
				return;
			}
			
			if (!this.moving) {
				Quell.draw.bubble(this.x, this.y, this.radius);
				return;
			}		
			
			var collision = collisionTest();
			
			if (collision) { return ; }
					
			switch (this.direction) {
				case 'left':
					this.x = this.x - this.speed;
					break;
				case 'up':
					this.y = this.y - this.speed;
					break;
				case 'right':
					this.x = this.x + this.speed;
					break;
				case 'down':
					this.y = this.y + this.speed;
					break;
			}
			
			Quell.draw.bubble(this.x, this.y, this.radius);
			
			// If the bubble is overlapping a edge, draw the edge over the top of it
			edgeTest();
			
			offMapTests();		
		}
		
		this.initBubble = function() {
			for (i = 0, j = this.collisionMap.length; i < j; i++) {
							
				for (x = 0, y = this.collisionMap[i].length; x < y; x++) {
					if (this.collisionMap[i][x] != 9) continue;
					
					this.x = (x * Quell.tileSize) + (Quell.tileSize / 2),
					this.y = (i * Quell.tileSize) + (Quell.tileSize / 2);
						
					Quell.draw.bubble(this.x, this.y, this.radius);
					
					break;  
				}
			}
		}
		
		this.move = function(e) {
	
			if (this.moving) { return; }
			
			this.started = true;
			
			switch (e.keyCode) {
				case 37:
					e.preventDefault();
					this.direction = 'left';
					break;
				case 38:
					e.preventDefault();
					this.direction = 'up';
					break;
				case 39:
					e.preventDefault();
					this.direction = 'right';
					break;
				case 40:
					e.preventDefault();
					this.direction = 'down';
					break;
				default:
					return;
			}
							
			this.moving = true;		
			this.drawBubble();
		}
	}
	
/*******************************************************************************
 * Draw Class
 ******************************************************************************/

	function Draw(ctx) {
		this.ctx = ctx;
	}
	
	Draw.prototype = {
		clear: function() {
			this.ctx.clearRect(0, 0, Quell.width, Quell.height);
		},
		background: function() {
			this.ctx.drawImage(images['bg'], 0, 0);
		},
		mapBackground: function(width, height) {
			this.ctx.fillStyle = '#747170';
			this.ctx.fillRect(0, 0, width * Quell.tileSize, height * Quell.tileSize);
		},
		tile: function(image, x, y) {
			if (image == 'nothing') return;
			this.ctx.drawImage(images[image], x, y, Quell.tileSize, Quell.tileSize);
		},
		bubble: function(x, y, radius) {
			this.ctx.beginPath();
			this.ctx.fillStyle = '#2B65EC';
			this.ctx.arc(x, y, radius, 0, Math.PI*2, false);
			this.ctx.fill();
		} 
	}
	
/*******************************************************************************
 * Let's go....
 ******************************************************************************/
	window.onload = function() {
		
		// Register the event handlers
		function registerEvents() {
		
			document.onkeyup = function(e) {
				bubble.move(e);
			}
		}
		
		var ctx = document.getElementById('canvas').getContext('2d');	
		
		Quell.draw = new Draw(ctx);
		
		var sources = {
			bg: 'bg.jpg',
			edge: 'edge.png',
			wall: 'wall.png',
			sphere: 'sphere.png',
			upSpike: 'upSpike.png',
			downSpike: 'downSpike.png',
			leftSpike: 'leftSpike.png',
			rightSpike: 'rightSpike.png'
		};
		
		images = loadImages(sources);
		var map = new Map(ctx);
		var bubble = new Bubble(map.collisionMap);	
			
		map.init();
		registerEvents();
		
		function go() {
			Quell.draw.clear();
			map.drawMap();
			bubble.drawBubble();
		}
	
		Quell.loop = setInterval(function() {	
			go();
		}, 1000 / Quell.frameRate);
		
		
	}
})();
