import { Scene } from 'phaser';

export class Pause extends Scene {
    constructor() {
        super('Pause');
    }

    create() {
        this.add.text(512, 384, 'Game Paused', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // this.input.keyboard.on('keydown-P', () => {
        //     this.scene.resume('Pipeworks'); // Resume the Pipeworks scene
        //     this.scene.stop(); // Stop the Pause scene
        // });
    }
}
