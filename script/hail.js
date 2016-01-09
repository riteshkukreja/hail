var CONF = {};
	/* INFINITY TIME FLAG */
	CONF.REPEAT_INFINITE = -1;

	/* Speeds Constants */
	CONF.SLOW_SPEED = 20;
	CONF.DEFAULT_SPEED = 50;
	CONF.FAST_SPEED = 80;

	/* Step Constants */
	CONF.SMALL_STEP = 10;
	CONF.DEFAULT_STEP = 15;
	CONF.LARGE_STEP = 20;

	/* Size Constants */
	CONF.SMALL_SIZE = 2;
	CONF.DEFAULT_SIZE = 3;
	CONF.LARGE_SIZE = 5;

	/* Delay Constants */
	CONF.SMALL_FREQUENCY = 5;
	CONF.DEFAULT_FREQUENCY = 10;
	CONF.LARGE_FREQUENCY = 15;

var Hail = function(vars) {

	/* STOP Flag */
	this.stop = false;

	/* Mouse Coordinates */
	this.currentMousePos = { x: $('body').width() / 2, y: $('body').height() / 2 };

	/* Offsets */
	this.leftOffset = 0;

	/* Step */
	this.step = CONF.DEFAULT_STEP;

	/* Store all the blocks Y and X range */
	this.positionsY = [];
	this.rangeX = [];
	

	/* Parameters */
	this.time = vars.time ? vars.time : CONF.REPEAT_INFINITE;
	this.color = vars.color ? vars.color : 'white';
	this.speed = vars.speed ? vars.speed : CONF.DEFAULT_SPEED;
	this.frequency = vars.delay ? vars.frequency : CONF.DEFAULT_FREQUENCY;
	this.size = vars.size ? vars.size : CONF.DEFAULT_SIZE;
	this.targets = (typeof vars.targets == 'object') ? vars.targets : [];

	
	/* Let it snow..let it snow.. */
	var self = this;
	setTimeout(function () {
	   	requestAnimationFrame(function() {
	   		self.make();
	   		self.mousePosition();
	   	});
	}, 0);

	/* Stop it */
	if(self.time != CONF.REPEAT_INFINITE) {
		setTimeout(function () {
		   	requestAnimationFrame(function() {
		   		self.destroy();
		  	});
		}, self.time);
	}

	/* Settle the snow */
	if(self.targets) {
		// get random block elements
		self.targets = self.getBlocks();
	}

	self.setPositions();
}

Hail.prototype.getRandom = function(min, max) {
	return Math.floor(Math.random() * (max-min) + min);
}

Hail.prototype.make = function() {
	if(this.stop) return;

	var self = this;
	var span = $('<span />', {
		class: 'hail'
	});

	var spanStep = self.getRandom(CONF.SMALL_STEP, CONF.LARGE_STEP);

	span.css({'background': this.color});
	span.css({'left': self.getRandom(0, $('body').width())});
	span.css({'top': '-10px'});
	span.css({'height': this.size + 'px', 'width': this.size + 'px'});

	setTimeout(function() {
		self.HandleInterval(self, span, spanStep);
	}, (1000 / self.speed));

	$('body').append(span);

	setTimeout(function () {
	  	requestAnimationFrame(function() {
	  		self.make();
	   	});
	}, 1000/this.frequency);
}

Hail.prototype.HandleInterval = function(self, span, spanStep) {
	requestAnimationFrame(function() {
		var topPosition = parseFloat(span.css('top'));
		var leftPosition = parseFloat(span.css('left'));

		/* Settle It */
		if(self.settle(leftPosition, topPosition)) {
			return;
		}

		if(topPosition >= $('body').height() || leftPosition < 0 || leftPosition > $('body').width()) {
			span.remove();
			return;
		} else {
			span.css({'top': topPosition + spanStep + 'px', 'left': leftPosition + self.leftOffset + 'px'});
		}

		setTimeout(function() {
			self.HandleInterval(self, span, spanStep);
		}, (1000 / self.speed));
	});
}

Hail.prototype.destroy = function() {
	this.stop = true;
}

Hail.prototype.setPositions = function() {
	for(i = 0; i < this.targets.length; i++) {
		var p = $(this.targets[i]).offset();

		var y = p.top;
		var x_min = p.left;
		var x_max = p.left + $(this.targets[i]).width();

		this.positionsY.push(y);

		var range = {
			min: x_min,
			max: x_max
		};

		this.rangeX.push(range);

	}
}

Hail.prototype.settle = function(x, y) {
	index = $.inArray(y, this.positionsY);
	if(index >= 0) {
		var range = this.rangeX[index];
		if(x >= range.min && x <= range.max ) return true;
	}

	return false;
}

Hail.prototype.getBlocks = function() {
	var divs = $('div:visible');
	var chosen = [];
	var limit = 5;

	if(divs.length < limit) {
		return divs;
	}

	for(i = 0 ; chosen.length < limit; i++) {
		var pos = this.getRandom(0, divs.length-1);
		if(!$.inArray(divs[i], chosen)) {
			chosen.push(divs[i]);
		}
	}

	return chosen;
}

Hail.prototype.mousePosition = function() {
	var self = this;
    $(document).mousemove(function(event) {

    	if(event.pageX > self.currentMousePos.x) {
    		// on to the right
    		self.leftOffset = (event.pageX - self.currentMousePos.x) % ($('body').width() / 2);
    	} else {
    		// on to the left
    		self.leftOffset = (event.pageX - self.currentMousePos.x) % ($('body').width() / 2);
    	}

        self.currentMousePos.x = event.pageX;
        self.currentMousePos.y = event.pageY;
    });
}