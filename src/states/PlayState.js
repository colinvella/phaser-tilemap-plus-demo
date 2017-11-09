import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

export default class PlayState extends Phaser.State {
    
    constructor() {
        super();
        this.collisionLayer = null;
        this.groundLayer = null;
        this.player = null;
        this.cursors = null;
        this.tilemap = null;
        this.groundTileset = null;
        this.tilemapAnimations = null;
    }

    init(params) {
        //alert(params.foo);
    }

    preload() {
        this.load.spritesheet('Player', 'assets/graphics/PlayerSpriteSheet.png', 39, 40);
        this.load.tilemap('TileMap', 'assets/maps/world1/TileMap.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('Background', 'assets/graphics/world1/Background.png');
        this.load.image('Ground', 'assets/graphics/world1/Ground.png');
        this.load.audio('Thud', 'assets/audio/thud.wav');
        this.load.audio('Spring', 'assets/audio/spring.wav');
    }
    
    create() {
        // change the background colour
        this.stage.backgroundColor = "#a9f0ff";
        
        // add tilemap
        this.tilemap = this.add.tilemap('TileMap');

        // background layer
        const backgroundTileset = this.tilemap.addTilesetImage('Background', 'Background');        
        const backgroundLayer = this.tilemap.createLayer('Background');
        backgroundLayer.scrollFactorX = backgroundLayer.scrollFactorY = 0.5;
        
        // ground layer
        this.groundTileset = this.tilemap.addTilesetImage('Ground', 'Ground');        
        this.groundLayer = this.tilemap.createLayer('Ground');
                    
        // resize world to ground layer
        this.groundLayer.resizeWorld();
            
        // player stuff
        // add the sprite to the game and enable arcade physics on it
        this.player = this.add.sprite(50, this.world.centerY, 'Player');

        this.physics.arcade.enable(this.player);
        
        // set some physics on the sprite
        this.player.body.gravity.y = 2000;
        this.player.body.gravity.x = 0;
        this.player.body.velocity.x = 0;
        this.player.anchor.setTo(0.5, 0.5);

        this.player.body.bounce.x = 0;
        this.player.body.bounce.y = 0;
        this.player.body.maxVelocity.x = 250;
        this.player.body.maxVelocity.y = 1000;
        this.player.body.collideWorldBounds = true;

        this.player.body.width = 16;
        this.player.body.setSize(10, 38, 15, 0);
     
        // Plus Feature: get start position from custom properties if set
        const tilemapProperties = this.tilemap.plus.properties;
        if (tilemapProperties.playerStartX) {
            this.player.x  = tilemapProperties.playerStartX * 16;
        }
        if (tilemapProperties.playerStartY) {
            this.player.y  = tilemapProperties.playerStartY * 16;
        }

        // Plus Feature: set capsule shape - overrides Arcade rectangle shape
        this.player.plus.setBodyCapsule(20, 40, 9);
                
        // create a running animation for the sprite and play it
        this.player.animations.add('still', [0], 20, true);
        this.player.animations.add('walk', null, 20, true);
        this.player.animations.play('still');
        
        //Make the camera follow the sprite
        this.camera.follow(this.player);
        this.camera.lerp.setTo(0.1);

        // enable cursor keys so we can create some controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Plus Feature: tile animation
        this.tilemap.plus.animation.enable();
        this.tilemap.plus.physics.enableObjectLayer("Collision");

        // add some audio
        const thudAudio = this.add.audio("Thud");
        const springAudio = this.add.audio("Spring");

        // Plus Feature: collision events
        this.tilemap.plus.events.collisions.add(this.player, (shape, oldVelocity, newVelocity, contactNormal) => {
            if (shape.properties.bounce) {
                springAudio.play();
            }
            if (oldVelocity.y - newVelocity.y > 300) {
                thudAudio.play();                
            }
        });

        // set up light effect sprite for use with region events
        // create the light texture and sprite to use it
        const gameWidth = this.game.width;
        const gameHeight = this.game.height;
        const lightTexture = this.add.bitmapData(gameWidth, gameHeight);
        lightTexture.context.fillStyle = 'rgb(0, 0, 64)';
        lightTexture.context.fillRect(0, 0, gameWidth, gameHeight);
        const lightSprite = this.add.image(0, 0, lightTexture);
        lightSprite.alpha = 0;
        lightSprite.fixedToCamera = true;

        // Plus Feature: region events
        this.tilemap.plus.events.regions.enableObjectLayer("Events");
        this.tilemap.plus.events.regions.onEnterAdd(this.player, (region) => {
            // simulate entering a poorly lit area if region has custom property isDark = true
            if (region.properties.isDark) {
                this.add.tween(lightSprite).to( { alpha: 0.5 }, 250, "Linear", true);
            }
        });
        this.tilemap.plus.events.regions.onLeaveAdd(this.player, (region) => {
            // simulate leaving a poorly lit area
            if (region.properties.isDark) {
                this.add.tween(lightSprite).to( { alpha: 0.0 }, 250, "Linear", true);
            }
        });

        // fullscreen toggle        
        this.input.onDown.add(() => toggleFullScreen(this), this);    
    }

    update() {
        const player = this.player;
        const collisionLayer = this.collisionLayer;
        const cursors = this.cursors;
        
        const gravity = this.physics.arcade.gravity;
        const body = player.body;
        const blocked = body.blocked;
        const touching = body.touching;

        // Plus Feature: collision detectino and response
        this.tilemap.plus.physics.collideWith(player);

        // Plus Feature: region events
        this.tilemap.plus.events.regions.triggerWith(player);

        // apply drag only when touching
        const isTouching = body.contactNormal.length() > 0;
        this.player.body.drag.x = isTouching ? 600 : 0;

        if (cursors.left.isDown && isTouching) {
            player.scale.x = -1;
            player.animations.play('walk');
            body.acceleration.x = -3000;
        } else if (cursors.right.isDown && isTouching) {
            player.scale.x = +1;
            player.animations.play('walk');
            body.acceleration.x = +3000;
        } else {
            player.animations.play('still');
            body.acceleration.x = 0;
        }
            
        // Make the sprite jump when the up key is pushed
        if (cursors.up.isDown) {
            if (body.contactNormal.y < 0) {
                body.velocity.y = -700;
            }
        }
    }

    render() {
        //game.debug.body(sprite, 32, 32);    
    }    
}

function toggleFullScreen(app) {
    if (app.scale.isFullScreen)
    {
        app.scale.stopFullScreen();
    }
    else
    {
        app.scale.startFullScreen(false);
    }
}
