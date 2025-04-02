import { GameObjects, Scene } from 'phaser';

export type TileType = 'straight' | 'turn' | 'tee' | 'crossed' | 'blocked' | 'start' | 'stop';
export type Orientation = 0 | 90 | 180 | 270; // Orientation in degrees

export class Tile extends GameObjects.Container {
    type: TileType;
    orientation: Orientation;

    static TILE_TYPE_TO_FRAME: Record<TileType, number> = {
        straight: 2,
        turn: 8,
        tee: 12,
        crossed: 16,
        blocked: 17,
        start: 4,
        stop: 5,
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
        tee: {
            0: { top: true, right: true, bottom: true, left: false },
            90: { top: false, right: true, bottom: true, left: true },
            180: { top: true, right: false, bottom: true, left: true },
            270: { top: true, right: true, bottom: false, left: true },
        },
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

    constructor(scene: Scene, x: number, y: number, type: TileType, orientation: Orientation = 0) {
        super(scene, x, y);

        this.type = type;
        this.orientation = orientation;

        // Add an image from the roads sprite sheet based on the tile type
        const tileImage = scene.add.sprite(0, 0, 'roads', Tile.TILE_TYPE_TO_FRAME[type]);
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
}
