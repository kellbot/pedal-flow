import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Tile, TileType, Orientation } from '../objects/Tile';
import {  TILE_SIZE, FONT_SETTINGS, OOZE_COLOR, GRID_COLUMNS, GRID_ROWS } from '../constants';


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

    gridOriginX: number; // Store the grid's top-left X coordinate
    gridOriginY: number; // Store the grid's top-left Y coordinate

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
        this.background.setAlpha(0.5);

        // Grid for tile placement
        this.grid = this.add.grid(512, 384, TILE_SIZE * GRID_COLUMNS, TILE_SIZE * GRID_ROWS, TILE_SIZE, TILE_SIZE, 0x000000, 0, 0xffffff, 0.2);
        this.grid.setOrigin(0.5);

        // Calculate and store the grid's top-left corner
        this.gridOriginX = this.grid.x - (TILE_SIZE * GRID_COLUMNS) / 2;
        this.gridOriginY = this.grid.y - (TILE_SIZE * GRID_ROWS) / 2;

        // Generate initial tile queue
        this.generateTileQueue();

        // Display upcoming tiles
        this.upcomingTiles = this.add.container(900, 200);
        this.updateTilePreview();

        // Place start and end tiles
        this.placeStartAndEndTiles();

        // Enable input on the grid
        this.grid.setInteractive();
        this.input.on('pointerdown', this.handlePointerDown, this);

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

    handlePointerDown(pointer: Phaser.Input.Pointer) {
        // Calculate the tile's position relative to the grid
        const gridX = Math.floor((pointer.x - this.gridOriginX) / TILE_SIZE) * TILE_SIZE + this.gridOriginX + TILE_SIZE / 2;
        const gridY = Math.floor((pointer.y - this.gridOriginY) / TILE_SIZE) * TILE_SIZE + this.gridOriginY + TILE_SIZE / 2;

        const positionKey = `${gridX},${gridY}`; // Create a unique key for the position

        // Ensure the tile is within the grid bounds
        if (
            gridX >= this.gridOriginX + TILE_SIZE / 2 &&
            gridX <= this.gridOriginX + TILE_SIZE * GRID_COLUMNS - TILE_SIZE / 2 &&
            gridY >= this.gridOriginY + TILE_SIZE / 2 &&
            gridY <= this.gridOriginY + TILE_SIZE * GRID_ROWS - TILE_SIZE / 2
        ) {
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

            // Use the Tile.createSprite method to create the sprite
            const tileSprite = Tile.createSprite(this, tile.type, tile.orientation);

            previewTile.add(tileSprite);
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

        // Recursive function to animate the ooze
        const animateOoze = (currentTile: Tile, previousDirection: 'top' | 'right' | 'bottom' | 'left' | null) => {
            console.log("Animating ooze from tile at:", currentTile.x, currentTile.y, "with type:", currentTile.type, "orientation:", currentTile.orientation, "and previous direction:", previousDirection);

            // Trigger the animation for the current tile
            currentTile.animate(this, previousDirection);

            // Wait for the current tile's animation to complete before determining the next tile
            this.time.delayedCall(1000, () => {
                const edges = Tile.TILE_EDGES[currentTile.type][currentTile.orientation];

                // Determine the next direction based on the open edges
                const directions = ['top', 'right', 'bottom', 'left'] as const;
                const oppositeDirection: Record<typeof directions[number], typeof directions[number]> = {
                    top: 'bottom',
                    right: 'left',
                    bottom: 'top',
                    left: 'right',
                };

                for (const direction of directions) {
                    if (edges[direction] && // this edge is open
                    direction !== previousDirection && // not coming from where we just were
                    ( //this is the opposite direction OR the opposite edge of the previous direction is not open OR we had no previous direction
                        !previousDirection ||
                        (previousDirection && direction === oppositeDirection[previousDirection]) || 
                        (previousDirection && !edges[oppositeDirection[previousDirection]]) 
                    )
                 ) {

                    console.log(`Coming from ${previousDirection} and Following direction: ${direction} from tile at (${currentTile.x}, ${currentTile.y})`);
                    
                        // Calculate the next tile position
                        let nextX = currentTile.x;
                        let nextY = currentTile.y;

                        if (direction === 'top') nextY -= TILE_SIZE;
                        if (direction === 'right') nextX += TILE_SIZE;
                        if (direction === 'bottom') nextY += TILE_SIZE;
                        if (direction === 'left') nextX -= TILE_SIZE;

                        // Dynamically find the next tile after the animation completes
                        const nextTile = this.children.getAll().find(
                            (child) =>
                                child instanceof Tile &&
                                child.x === nextX &&
                                child.y === nextY
                        ) as Tile;

                        if (nextTile) {
                            // Continue the animation with the next tile
                            animateOoze(nextTile, oppositeDirection[direction]);
                        }
                        break;
                    }
                }
            });
        };

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
        for (let x = this.gridOriginX; x < this.gridOriginX + TILE_SIZE * GRID_COLUMNS; x += TILE_SIZE) {
            for (let y = this.gridOriginY; y < this.gridOriginY + TILE_SIZE * GRID_ROWS; y += TILE_SIZE) {
                gridPositions.push({ x: x + TILE_SIZE / 2, y: y + TILE_SIZE / 2 }); // Offset by TILE_SIZE / 2 to center within the grid square
            }
        }

        // Helper function to determine valid orientations
        const getValidOrientations = (x: number, y: number): Orientation[] => {
            const orientations: Orientation[] = [];
            if (y > this.gridOriginY) orientations.push(0); // Open side facing up
            if (x < this.gridOriginX + TILE_SIZE * (GRID_COLUMNS - 1)) orientations.push(90); // Open side facing right
            if (y < this.gridOriginY + TILE_SIZE * (GRID_ROWS - 1)) orientations.push(180); // Open side facing down
            if (x > this.gridOriginX) orientations.push(270); // Open side facing left
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
