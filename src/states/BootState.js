import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
import "phaser-tilemap-plus";

export default class BootState extends Phaser.State {
    create() {
        this.initGraphics();
        this.initPhysics();
        this.state.start("Menu", true, false, { foo: "bar"});        
    }

    initGraphics() {        
        // scale the game 2x
        this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;  
        this.scale.setUserScale(2, 2);

        // enable crisp rendering
        this.game.renderer.renderSession.roundPixels = true;  
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        // enable tilemap plus plugin
        this.game.plugins.add(Phaser.Plugin.TilemapPlus);
    }

    initPhysics() {
        // physics
        this.time.advancedTiming = true;
                
        // enable arcade slopes plugin
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 1000;    
    }
};

