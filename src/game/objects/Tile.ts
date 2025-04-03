import { GameObjects, Scene } from 'phaser';

export type TileType = 'straight' | 'turn' | 'crossed' | 'blocked' | 'start' | 'stop';
export type Orientation = 0 | 90 | 180 | 270; // Orientation in degrees

export class Tile extends GameObjects.Container {
    type: TileType;
    orientation: Orientation;

    static TILE_TYPE_TO_FRAME: Record<TileType, number> = {
        straight:  3 * 26 + 17 - 1, // Openings top and bottom
        turn: 26 * 11 + 1 - 1, // Openings top and right
        crossed: 26 * 13 + 3 - 1,
        blocked: 2,
        start: 26 * 25 + 3 -1,
        stop: 0,
    };

    // Map tile types to their respective frame counts
    static TILE_TYPE_TO_FRAME_COUNT: Record<TileType, number> = {
        straight: 30, // Example: 24 frames for straight pipes
        turn: 27,     // Example: 16 frames for turn pipes
        crossed: 30,  // Example: 32 frames for crossed pipes
        blocked: 1,   // Example: 8 frames for blocked pipes
        start: 24,    // Example: 24 frames for start pipes
        stop: 24,     // Example: 24 frames for stop pipes
    };

    // Define open edges for each tile type and orientation
    static TILE_EDGES: Record<TileType, Record<Orientation, { top: boolean; right: boolean; bottom: boolean; left: boolean }>> = {
        straight: {
            0: { top: true, right: false, bottom: true, left: false },
            90: { top: false, right: true, bottom: false, left: true },
            180: { top: true, right: false, bottom: true, left: false },
            270: { top: false, right: true, bottom: false, left: true },
        },
        turn: {
            0: { top: true, right: true, bottom: false, left: false },
            90: { top: false, right: true, bottom: true, left: false },
            180: { top: false, right: false, bottom: true, left: true },
            270: { top: true, right: false, bottom: false, left: true },
        },
        // tee: {
        //     0: { top: true, right: true, bottom: true, left: false },
        //     90: { top: false, right: true, bottom: true, left: true },
        //     180: { top: true, right: false, bottom: true, left: true },
        //     270: { top: true, right: true, bottom: false, left: true },
        // },
        crossed: {
            0: { top: true, right: true, bottom: true, left: true },
            90: { top: true, right: true, bottom: true, left: true },
            180: { top: true, right: true, bottom: true, left: true },
            270: { top: true, right: true, bottom: true, left: true },
        },
        blocked: {
            0: { top: false, right: false, bottom: false, left: false },
            90: { top: false, right: false, bottom: false, left: false },
            180: { top: false, right: false, bottom: false, left: false },
            270: { top: false, right: false, bottom: false, left: false },
        },
        start: {
            0: { top: true, right: false, bottom: false, left: false },
            90: { top: false, right: true, bottom: false, left: false },
            180: { top: false, right: false, bottom: true, left: false },
            270: { top: false, right: false, bottom: false, left: true },
        },
        stop: {
            0: { top: true, right: false, bottom: false, left: false },
            90: { top: false, right: true, bottom: false, left: false },
            180: { top: false, right: false, bottom: true, left: false },
            270: { top: false, right: false, bottom: false, left: true },
        },
    };

    // Static method to create a sprite for a tile
    static createSprite(scene: Scene, type: TileType, orientation: Orientation): Phaser.GameObjects.Sprite {
        const sprite = scene.add.sprite(0, 0, 'pipes', Tile.TILE_TYPE_TO_FRAME[type]);
        sprite.setRotation(Phaser.Math.DegToRad(orientation));
        return sprite;
    }

    constructor(scene: Scene, x: number, y: number, type: TileType, orientation: Orientation = 0) {
        super(scene, x, y);

        this.type = type;
        this.orientation = orientation;

        // Add an image from the roads sprite sheet based on the tile type
        const tileImage = scene.add.sprite(0, 0, 'pipes', Tile.TILE_TYPE_TO_FRAME[type]);
        this.add(tileImage);

        // Rotate the container to match the orientation
        this.setRotation(Phaser.Math.DegToRad(this.orientation));

        // Add this container to the scene
        scene.add.existing(this);
    }

    // Method to update the orientation
    setOrientation(newOrientation: Orientation) {
        this.orientation = newOrientation;
        this.setRotation(Phaser.Math.DegToRad(this.orientation));
    }

    // Method to check if two tiles connect
    static doTilesConnect(tileA: Tile, tileB: Tile, direction: 'top' | 'right' | 'bottom' | 'left'): boolean {
        const edgesA = Tile.TILE_EDGES[tileA.type][tileA.orientation];
        const edgesB = Tile.TILE_EDGES[tileB.type][tileB.orientation];

        // Determine the opposite edge of the direction
        const oppositeEdge: Record<'top' | 'right' | 'bottom' | 'left', 'top' | 'right' | 'bottom' | 'left'> = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
        };

        // Check if the edges are open
        return edgesA[direction] && edgesB[oppositeEdge[direction]];
    }

    // Method to animate the tile
    animate(scene: Scene, previousDirection?: 'top' | 'right' | 'bottom' | 'left' | null) {
        const startFrame = Tile.TILE_TYPE_TO_FRAME[this.type];
const frameCount = Tile.TILE_TYPE_TO_FRAME_COUNT[this.type];
        const animationKey = `tile-animate-${this.type}-${this.orientation}`;

        // Check if the animation already exists, if not, create it
        if (!scene.anims.exists(animationKey)) {
            scene.anims.create({
                key: animationKey,
                frames: scene.anims.generateFrameNumbers('pipes', {
                    start: startFrame,
                    end: startFrame + frameCount - 1, // Adjust end frame based on frame count
                }),
                frameRate: frameCount, // Match frame rate to frame count for 1-second duration
                duration: 1000, // 1 second
                repeat: 0, // Play once
            });
        }

        // Play the animation on the tile's sprite
        const tileSprite = this.list[0] as Phaser.GameObjects.Sprite; // Assuming the sprite is the first child
        if (tileSprite) {
// Adjust the sprite's rotation based on the previous direction
            if (previousDirection) {
                const directionToRotation: Record<'top' | 'right' | 'bottom' | 'left', number> = {
                    bottom: 0,
                    left: 90,
                    top: 180,
                    right: 270,
                };

                // Calculate the rotation offset to align the animation
                const rotationOffset = Phaser.Math.DegToRad(directionToRotation[previousDirection] - this.orientation);
                tileSprite.setRotation(rotationOffset);
            }

            // Play the animation
            tileSprite.play(animationKey);
        }
    }
}
