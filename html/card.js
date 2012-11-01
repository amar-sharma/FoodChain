// Card component with image, text and sound
enyo.kind({
	name: "FoodChain.Card",
	kind: enyo.Control,
	published: { cardname: "", x: 0, y: 0, z: 0 },
	classes: "card",
	components: [
		{ name: "itemImage", classes: "cardImage", kind: "Image" },
		{ kind: "Image", src: "images/sound_icon.png", classes: "cardSoundIcon" },
		{ name: "itemText", classes: "cardText" }
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.cardnameChanged();
		this.xChanged();
		this.yChanged();
		this.zChanged();
	},
	
	// Rendering
	rendered: function() {
		this.inherited(arguments);		
	},
	
	// Card setup
	cardnameChanged: function() {
		var image = "images/cards/"+this.cardname+".png";
		var text = this.cardname.substring(0,1).toUpperCase()+this.cardname.substring(1);
		this.sound = "audio/en/cards/"+this.cardname+".ogg";
		
		this.$.itemImage.setAttribute("src", image);
		this.$.itemText.setContent(text);
	},
	
	// Coordinate setup
	xChanged: function() {
		this.applyStyle("margin-left", this.x+"px");
	},
	
	// Coordinate setup
	yChanged: function() {
		this.applyStyle("margin-top", this.y+"px");
	},
	
	// Coordinate setup
	zChanged: function() {
		this.applyStyle("z-index", this.z);
	},
	
	// Play sound using the media
	play: function(media) {
		media.play(this.sound);
	},
	
	// Change position
	moveTo: function(x, y) {
		this.x = x;
		this.xChanged();
		this.y = y;
		this.yChanged();		
	}
});