import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';
//import SAT from "expose-loader?SAT!sat/SAT.js";
//import "phaser-arcade-slopes";

export default class MenuState extends Phaser.State {
    create() {
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.SPACEBAR
        ]);

        this.stage.backgroundColor = "#00a9f0";
        
        const titleText = this.addText("Phaser Tilemap Plus Demo", 16, 20);
        const subtitleText = this.addText("Press Space to start", 12, 100);

        const subtitleText2 = this.addText("Press Left Mouse button to toggle full screen mode", 12, 110);
        
        // fullscreen toggle        
        this.input.onDown.add(() => toggleFullScreen(this), this);  
    }

    update() {
        if (this.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, 50))
        {
            this.state.start("Play", true, false, { foo: "bar"});        
        }
    }

    addText(text, size, y) {
        const style = { font: "bold " + size + "px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        const titleText = this.game.add.text(0, 0, text, style);
        titleText.setShadow(1, 1, 'rgba(0,0,0,0.5)', 1);
        titleText.setTextBounds(0, y, 320,  y + size);
    }
};

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
