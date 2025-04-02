import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    logoTween: Phaser.Tweens.Tween | null;
    buttons: GameObjects.Container;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 200, 'logo').setDepth(100);

        // Create buttons for game modes
        this.buttons = this.add.container(512, 350);

        const gameModes = [
            { label: 'Endless Ride', active: true },
            { label: 'Timed Sprint', active: false },
            { label: 'Challenge Runs', active: false },
            { label: 'Event Levels', active: false },
            { label: 'Tutorial', active: true } // Added Tutorial button
        ];

        gameModes.forEach((mode, index) => {
            const button = this.add.rectangle(0, index * 80, 200, 50, mode.active ? 0x028af8 : 0x555555)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive(mode.active ? { useHandCursor: true } : undefined)
                .on('pointerdown', () => {
                    if (mode.active) {
                        this.startGameMode(mode.label);
                    }
                });

            const buttonText = this.add.text(0, index * 80, mode.label, {
                fontFamily: 'Arial Black',
                fontSize: 18,
                color: mode.active ? '#ffffff' : '#aaaaaa',
                align: 'center',
            }).setOrigin(0.5);

            this.buttons.add([button, buttonText]);
        });

        EventBus.emit('current-scene-ready', this);
    }

    startGameMode(mode: string) {
        if (mode === 'Endless Ride') {
            this.scene.start('Pipeworks');
        } else if (mode === 'Tutorial') {
            this.scene.start('Tutorial'); // Start Tutorial scene
        }
        // Other modes can be implemented later
    }

    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Pipeworks');
    }

    moveLogo (reactCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
