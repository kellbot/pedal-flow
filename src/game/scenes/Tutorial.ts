
export class Tutorial extends Phaser.Scene {
    constructor() {
        super('Tutorial');
    }

    create() {
        this.add.text(512, 384, 'Tutorial Scene', {
            fontFamily: 'Arial Black',
            fontSize: 48,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const backButton = this.add.rectangle(512, 500, 200, 50, 0x028af8)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('MainMenu'); // Return to Main Menu
            });

        this.add.text(512, 500, 'Back to Menu', {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);
    }
}
