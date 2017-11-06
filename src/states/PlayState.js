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
        setUpFullScreen(this);
        
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

        //this.player.body.drag.x = 600;
        this.player.body.bounce.x = 0;
        this.player.body.bounce.y = 0;
        this.player.body.maxVelocity.x = 250;
        this.player.body.maxVelocity.y = 1000;
        this.player.body.collideWorldBounds = true;

        this.player.body.width = 16;
        this.player.body.setSize(10, 38, 15, 0);

        // get start position from properties if set
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
        this.player.animations.add('still', [0], 10, true);
        this.player.animations.add('walk', null, 10, true);
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
        
        // Plus Feature: events
        this.tilemap.plus.events.collisions.add(this.player, (player, shape) => {
            if (shape.properties.bounce) {
                springAudio.play();
            }
            console.log(player.body.velocity);
        });
    }

    update() {
        const player = this.player;
        const collisionLayer = this.collisionLayer;
        const cursors = this.cursors;
        
        const gravity = this.physics.arcade.gravity;
        const body = player.body;
        const blocked = body.blocked;
        const touching = body.touching;

        this.tilemap.plus.physics.collideWith(player);

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

function setUpFullScreen(app) {
    app.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    // fullscreen toggle        
    app.input.onDown.add(() => toggleFullScreen(app), app);    
        
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
