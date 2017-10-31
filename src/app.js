import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

import BootState from "./states/BootState";
import MenuState from "./states/MenuState";
import PlayState from "./states/PlayState";

const bootState = new BootState();
const menuState = new MenuState();
const playState = new PlayState();
let game = new Phaser.Game(320, 240, Phaser.AUTO, '', bootState);

game.state.add("Boot", bootState);
game.state.add("Menu", menuState);
game.state.add("Play", playState);

