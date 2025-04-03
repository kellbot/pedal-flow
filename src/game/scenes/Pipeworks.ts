import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Tile, TileType, Orientation } from '../objects/Tile';

export class Pipeworks extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    grid: Phaser.GameObjects.Grid;
    upcomingTiles: Phaser.GameObjects.Container;

    scoreText: Phaser.GameObjects.Text;
    countdownText: Phaser.GameObjects.Text;
    countdown: number;
    countdownTimer: Phaser.Time.TimerEvent;

    tileQueue: { type: TileType; orientation: Orientation }[];
    occupiedPositions: Set<string>; // Track occupied grid positions

    constructor() {
        super('Pipeworks');
        this.tileQueue = [];
        this.occupiedPositions = new Set(); // Initialize the set
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        // Background
        this.background = this.add.image(512, 384, 'background');
    

        // Grid for tile placement
        this.grid = this.add.grid(512, 384, 64 * 10, 64 * 8, 64, 64, 0x000000, 0, 0xffffff, 0.2);
        this.grid.setOrigin(0.5);

        // Generate initial tile queue
        this.generateTileQueue();

        // Display upcoming tiles
        this.upcomingTiles = this.add.container(900, 200);
        this.updateTilePreview();

        // Place start and end tiles
        this.placeStartAndEndTiles();

        // Enable input on the grid
        this.grid.setInteractive();
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const gridX = Math.floor((pointer.x - this.grid.x + 320) / 64) * 64 + this.grid.x - 320 + 32;
            const gridY = Math.floor((pointer.y - this.grid.y + 320) / 64) * 64 + this.grid.y - 320 + 32;

            const positionKey = `${gridX},${gridY}`; // Create a unique key for the position

            if (gridX >= 192 && gridX <= 832 && gridY >= 64 && gridY <= 704) {
                if (!this.occupiedPositions.has(positionKey)) { // Check if the position is unoccupied
                    if (this.tileQueue.length > 0) {
                        const nextTile = this.tileQueue.shift(); // Get the next tile from the queue
                        if (nextTile) {
                            new Tile(this, gridX, gridY, nextTile.type, nextTile.orientation);
                            this.occupiedPositions.add(positionKey); // Mark the position as occupied
                            this.generateTileQueue(); // Replenish the queue if needed
                            this.updateTilePreview(); // Update the preview area
                        }
                    }
                } else {
                    console.log('Position already occupied!'); // Debug message
                }
            }
        });

        let fontSettings = {
            fontSize: '26px',
            color: '#ffffff',
            fontFamily: 'Arial Black',
            stroke: '#000000', // Stroke color for better visibility
            strokeThickness: 4, // Stroke thickness for better visibility
            
        }

        // Add Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', fontSettings);

        // Add Countdown text
        this.countdown = 10; // Start at 30 seconds
        this.countdownText = this.add.text(16, 56, `Time: ${this.countdown}`, fontSettings);

        // Start the countdown timer
        this.countdownTimer = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true,
        });
    


        EventBus.emit('current-scene-ready', this);
    }

    generateTileQueue() {
        while (this.tileQueue.length < 5) {
            const tileTypes: TileType[] = ['straight', 'turn', 'crossed'];
            const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
            const randomOrientation: Orientation = [0, 90, 180, 270][Math.floor(Math.random() * 4)] as Orientation;
            this.tileQueue.push({ type: randomType, orientation: randomOrientation });
        }
    }

    updateTilePreview() {
        this.upcomingTiles.removeAll(true); // Clear the preview area
        this.tileQueue.forEach((tile, index) => {
            const previewTile = this.add.container(0, index * 70);

            // Add the sprite image for the tile
            const tileImage = this.add.sprite(0, 0, 'roads', Tile.TILE_TYPE_TO_FRAME[tile.type]);
            tileImage.setRotation(Phaser.Math.DegToRad(tile.orientation));

            previewTile.add(tileImage);
            this.upcomingTiles.add(previewTile);
        });
    }
    updateCountdown() {
        this.countdown -= 1;
        this.countdownText.setText(`Time: ${this.countdown}`);

        if (this.countdown <= 0) {
            this.countdownTimer.remove(); // Stop the timer
            this.startOoze(); // Trigger the placeholder function
        }
    }

    startOoze() {
        console.log('Ooze started!');

        // Find the start tile
        const startTile = this.children.getAll().find(
            (child) => child instanceof Tile && (child as Tile).type === 'start'
        ) as Tile;

        if (!startTile) {
            console.error('Start tile not found!');
            return;
        }

        // Create a graphics object for the ooze
        const oozeGraphics = this.add.graphics({ lineStyle: { width: 8, color: 0xff0000 } });
        // Ensure the graphics object is always on top
        this.children.bringToTop(oozeGraphics);

        // Start drawing the ooze from the start tile
        let currentX = startTile.x;
        let currentY = startTile.y;

        // Recursive function to animate the ooze
        const animateOoze = (currentTile: Tile, previousDirection: 'top' | 'right' | 'bottom' | 'left' | null) => {
            console.log("Animating ooze from", currentTile.type ," tile at:", currentTile.x, currentTile.y, "with previous direction:", previousDirection);

            const edges = Tile.TILE_EDGES[currentTile.type][currentTile.orientation];

            // Determine the next direction based on the open edges
            const directions = ['top', 'right', 'bottom', 'left'] as const;
            const oppositeDirection: Record<typeof directions[number], typeof directions[number]> = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right',
            };
            console.log(edges);

            for (const direction of directions) {
                if (edges[direction] && (!previousDirection || !edges[oppositeDirection[previousDirection]] || direction === oppositeDirection[previousDirection])) {
                    console.log("Exit direction", direction);
                    // Calculate the next tile position
                    let nextX = currentTile.x;
                    let nextY = currentTile.y;

                    if (direction === 'top') nextY -= 64;
                    if (direction === 'right') nextX += 64;
                    if (direction === 'bottom') nextY += 64;
                    if (direction === 'left') nextX -= 64;

                    // Find the next tile
                    const nextTile = this.children.getAll().find(
                        (child) =>
                            child instanceof Tile &&
                            child.x === nextX &&
                            child.y === nextY
                    ) as Tile;

                    if (previousDirection){
                        this.tweens.add({
                            targets: { progress: 0 },
                            progress: 1,
                            duration: 3 * 1000,
                            onUpdate: (tween) => oozeIn(tween, previousDirection, currentTile),
                            onComplete: () => {
                                this.tweens.add({
                                    targets: { progress: 0 },
                                    progress: 1,
                                    duration: 3 * 1000,
                                    onUpdate: (tween2) => oozeOut(tween2, direction, currentTile),
                                    onComplete: () => {
                                        if (nextTile) {
                                            animateOoze(nextTile, oppositeDirection[direction]);
                                        }
                                    }
                                })
                            }
                            
                        });
                    } else {
                        this.tweens.add({
                            targets: { progress: 0 },
                            progress: 1,
                            duration: 3 * 1000,
                            onUpdate:(tween3) => oozeOut(tween3, direction, currentTile),
                            onComplete: () => {
                                if (nextTile) {
                                    animateOoze(nextTile, oppositeDirection[direction]);
                                }
                            }
                            
                        });
                    }
   
                    break;
                }
            }
        };

        const oozeIn = (tween: Phaser.Tweens.Tween, previousDirection: 'top' | 'right' | 'bottom' | 'left' | null, tile: Tile) => {
            let inY = tile.y;
            let inX = tile.x;
        
            if (previousDirection === 'top') inY -= 32;
            if (previousDirection === 'right') inX += 32;
            if (previousDirection === 'bottom') inY += 32;
            if (previousDirection === 'left') inX -= 32;

            const progress = tween.getValue();
            const drawX = inX + (inX - currentX) * progress;
            const drawY = inY + (inY - currentY) * progress;

            // oozeGraphics.clear();
            oozeGraphics.lineStyle(8, 0xff0000);
            oozeGraphics.beginPath();
            oozeGraphics.moveTo(inX, inY);
            oozeGraphics.lineTo(drawX, drawY);
            oozeGraphics.strokePath();
        }

        const oozeOut = (tween: Phaser.Tweens.Tween, nextDirection: 'top' | 'right' | 'bottom' | 'left' | null, tile: Tile) => {
             // Draw a line from the center to the exit
             let outX = tile.x;
             let outY = tile.y;
             
             if (nextDirection === 'top') outY -= 32;
             if (nextDirection === 'right') outX += 32;
             if (nextDirection === 'bottom') outY += 32;
             if (nextDirection === 'left') outX -= 32;

            const progress = tween.getValue();
            const drawX = tile.x + (outX - tile.x) * progress;
            const drawY = tile.y + (outY - tile.y) * progress;

            // oozeGraphics.clear();
            oozeGraphics.lineStyle(8, 0xff0000);
            oozeGraphics.beginPath();
            oozeGraphics.moveTo(tile.x, tile.y);
            oozeGraphics.lineTo(drawX, drawY);
            oozeGraphics.strokePath();

  
        }

        // Start the animation from the start tile
        animateOoze(startTile, null);
    }

    update() {
        // Placeholder for updating the UI, such as moving tiles or updating the score
    }

    // Method to place start and end tiles
    placeStartAndEndTiles() {
        const gridPositions: { x: number; y: number }[] = [];

        // Generate all valid grid positions (centered within grid squares)
        for (let x = 192; x <= 64 * 9; x += 64) {
            for (let y = 128; y <= 64 * 7; y += 64) {
                gridPositions.push({ x: x + 32, y: y + 32 }); // Offset by 32 to center within the grid square
            }
        }

        // Helper function to determine valid orientations
        const getValidOrientations = (x: number, y: number): Orientation[] => {
            const orientations: Orientation[] = [];
            if (y > 64) orientations.push(0); // Open side facing up
            if (x < 832) orientations.push(90); // Open side facing right
            if (y < 704) orientations.push(180); // Open side facing down
            if (x > 192) orientations.push(270); // Open side facing left
            return orientations;
        };

        // Randomly select positions for start and end tiles
        const startTilePosition = Phaser.Utils.Array.RemoveRandomElement(gridPositions) as { x: number; y: number };
        const endTilePosition = Phaser.Utils.Array.RemoveRandomElement(gridPositions) as { x: number; y: number };

        // Determine valid orientations for the start tile
        const startTileOrientations = getValidOrientations(startTilePosition.x, startTilePosition.y);
        const startTileOrientation = Phaser.Utils.Array.GetRandom(startTileOrientations);

        // Place the start tile
        new Tile(this, startTilePosition.x, startTilePosition.y, 'start', startTileOrientation);
        this.occupiedPositions.add(`${startTilePosition.x},${startTilePosition.y}`); // Mark as occupied

        // Determine valid orientations for the end tile
        const endTileOrientations = getValidOrientations(endTilePosition.x, endTilePosition.y);
        const endTileOrientation = Phaser.Utils.Array.GetRandom(endTileOrientations);

        // Place the end tile
        new Tile(this, endTilePosition.x, endTilePosition.y, 'stop', endTileOrientation);
        this.occupiedPositions.add(`${endTilePosition.x},${endTilePosition.y}`); // Mark as occupied
    }
}
