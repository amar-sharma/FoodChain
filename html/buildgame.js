// Level config
FoodChain.buildLevels = [
	{ size: 2, time: 10 }, // Level 1
	{ size: 3, time: 30 }, // Level 2
	{ size: 3, time: 20 }, // Level 3
	{ size: 3, time: 10 }, // Level 4
	{ size: 4, time: 30 }, // Level 5
	{ size: 4, time: 20 }, // Level 6
	{ size: 5, time: 30 }  // Level 7
];

// Build Game class
enyo.kind({
	name: "FoodChain.BuildGame",
	kind: enyo.Control,
	published: {level: 1},
	classes: "board",
	components: [
		{ name: "cards", components: [
			// Level - Score - Time bar
			{ components: [
				{ content: "Level", classes: "title level-value" },
				{ name: "level", content: "0", classes: "title level-value" },
				{ content: "Score:", classes: "title score" },
				{ name: "score", content: "0000", classes: "title score-value" },
				{ name: "timercount", content: "0:0,0", classes: "title timer-value" }				
			]},			
			{ name: "timer", kind: "Timer", onTriggered: "updateTimer" },
			
			// Board zone
			{ name: "gamebox", classes: "box", ondrop: "drop", ondragover: "dragover", components: [] },
			
			// Buttons bar
			{ name: "validate", kind: "ShadowButton", img: "validate", classes: "validate", ontap: "controlOrder" },
			{ name: "play", kind: "ShadowButton", img: "play", classes: "play", ontap: "play" },	
			{ name: "pause", kind: "ShadowButton", img: "pause", classes: "play", ontap: "pause" },	
			{ name: "restart", kind: "ShadowButton", img: "restart", classes: "restart", ontap: "restart" },
			{ name: "forward", kind: "ShadowButton", img: "forward", classes: "restart", ontap: "next" },
			{ name: "home", kind: "ShadowButton", img: "home", classes: "home", ontap: "home" },
			
			// Sound effect
			{ name: "winSound", kind: "HTML5.Audio", src: ["audio/applause.mp3", "audio/applause.ogg"], preload: "auto", autobuffer: true, controlsbar: false },
			{ name: "lostSound", kind: "HTML5.Audio", src: ["audio/disappointed.mp3", "audio/disappointed.ogg"], preload: "auto", autobuffer: true, controlsbar: false }
		]}		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.mixed = null;
		this.levelChanged();
	},
	
	// Level changed, init board then start game
	levelChanged: function() {
		// Delete current cards on board
		var cards = [];
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			cards.push(card);
		});		
		for (var i = 0 ; i < cards.length ; i++) {
			cards[i].destroy();
		}
		
		// Compute the start chain
		if (this.mixed == null) {
			this.chain = FoodChain.randomChain(FoodChain.buildLevels[this.level-1].size);
			this.mixed = FoodChain.mix(this.chain);
		}
	
		// Display cards
		var x = 10, y = 10;
		for (var i = 0 ; i < this.mixed.length ; i++) {
			this.$.gamebox.createComponent({ kind: "FoodChain.Card", cardname: this.mixed[i], x: x, y: y, ontap: "taped", ondragstart: "dragstart", ondragfinish: "dragfinish" }, {owner: this});
			x = x + 240;
		}
		
		// Box handling
		this.dragobject = null;
		this.zmax = 0;
		this.$.gamebox.removeClass("box-win");
		this.$.gamebox.removeClass("box-lost");

		// Button handling
		this.$.play.hide();
		this.$.pause.show();
		this.$.validate.show();
		this.$.restart.hide();
		this.$.forward.hide();
		this.$.home.hide();
		
		// Timer and level init
		this.$.level.setContent(" "+this.level);
		this.timecount = {mins:0, secs:0, tenth:0};
		this.$.timercount.removeClass("timer-overtime");
		this.displayTimer();
		this.$.timer.pause();
		this.$.timer.start();
		this.$.timer.resume();
		
		this.render();
	},
	
	// Display timer value
	displayTimer: function() {
		this.$.timercount.setContent(this.timecount.mins+":"+String("00"+this.timecount.secs).slice(-2)+","+this.timecount.tenth);
	},
	
	// Update timer
	updateTimer: function(s, e) {
		this.timecount.tenth = this.timecount.tenth + 1;
		if (this.timecount.tenth == 10) {
			this.timecount.tenth = 0;
			this.timecount.secs = this.timecount.secs + 1;
			var currentcount = this.timecount.mins * 60 + this.timecount.secs;
			if (currentcount >= FoodChain.buildLevels[this.level-1].time) {
				this.$.timercount.addClass("timer-overtime");
			}
			if (this.timecount.secs == 60) {
				this.timecount.secs = 0;
				this.timecount.mins = this.timecount.mins + 1;
			}
		}
		this.displayTimer();
	},
	
	// Play sound when card taped
	taped: function(s, e) {
		s.play();
		console.log("taped");
	},
	
	// Card drag start, change style to dragged
	dragstart: function(s, e) {
		s.addClass("card-dragged");
		this.$.gamebox.addClass("box-dragging");
		s.play();
		this.dragobject = s;
		this.dragx = e.clientX-s.x;
		this.dragy = e.clientY-s.y;
		this.toTop(this.dragobject);
	},
	
	// Card drag end, change style to not dragged
	dragfinish: function(s, e) {
		s.removeClass("card-dragged");
		this.$.gamebox.removeClass("box-dragging");
	},
	
	// Drag over the box, allow dragging
	dragover: function(s, e) {
		if (this.dragobject == null)
			return true;
		e.preventDefault();
		return false;
	},
	
	// Dropped in the box, change card parent
	drop: function(s, e) {
		if (this.dragobject == null)
			return true;		
		e.preventDefault();
		this.dragobject.moveTo(e.clientX-this.dragx, e.clientY-this.dragy);
		this.dragobject = null;
	},
	
	// Set the card to top of the stack
	toTop: function(card) {
		this.zmax = this.zmax + 1;
		card.applyStyle("z-index", this.zmax)
	},
	
	// Validate cards order
	controlOrder: function() {
		// Stop timer
		this.$.timer.pause();
		
		// Hide button
		this.$.play.hide();
		this.$.pause.hide();
		this.$.validate.hide();		
		
		// Get cards
		var cards = [];
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			cards.push(card);
		});	
		
		// Sort using x card position
		cards = cards.sort(function (c1, c2) { return c1.x - c2.x; });
		
		// Check order
		var win = true;
		for (var i = 0 ; win && i < this.chain.length ; i++) {
			if (cards[i].cardname != this.chain[i])
				win = false;
		}
		
		// Play win or loose sound
		if (win) {
			this.$.winSound.play();
			this.$.gamebox.addClass("box-win");
			this.computeScore();
			this.$.home.show();
			if (this.level != FoodChain.buildLevels.length)
				this.$.forward.show();
		}
		else {
			this.$.lostSound.play();
			this.$.gamebox.addClass("box-lost");
			this.$.home.show();
			this.$.restart.show();
		}
	},
	
	// Compute score
	computeScore: function() {
		var score = 10;
		var currentcount = this.timecount.mins * 60 + this.timecount.secs;
		if (currentcount < FoodChain.buildLevels[this.level-1].time) {
			score += (FoodChain.buildLevels[this.level-1].time - currentcount);
		}
		FoodChain.context.score += score;
		this.$.score.setContent(String("0000"+FoodChain.context.score).slice(-4));
	},
	
	// Resume game
	play: function() {
		// Show cards
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			card.show();
		});
		
		// Show pause button, hide play button
		this.$.timer.resume();
		this.$.play.hide();		
		this.$.pause.show();
		this.$.home.hide();
	},
	
	// Pause game
	pause: function() {
		// Hide cards
		enyo.forEach(this.$.gamebox.getControls(), function(card) {
			card.hide();
		});
		
		// Show play button, hide pause button
		this.$.timer.pause();
		this.$.pause.hide();
		this.$.play.show();
		this.$.home.show();
	},
	
	// Restart the current level
	restart: function() {
		this.levelChanged();
	},
	
	// Go to the next level
	next: function() {
		this.level = this.level + 1;
		this.mixed = null;
		this.levelChanged();
	},
	
	// Go to the home page of the app
	home: function() {
		FoodChain.goHome();
	}
});