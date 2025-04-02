import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Pipeworks } from './scenes/Pipeworks';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Pause } from './scenes/Pause'; // Added Pause scene
import { Tutorial } from './scenes/Tutorial'; // Added Tutorial scene

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Pipeworks,
        Pause, 
        Tutorial, // Added Tutorial scene
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
