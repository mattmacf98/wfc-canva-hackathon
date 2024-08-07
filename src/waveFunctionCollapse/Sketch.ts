import p5 from "p5";
import {Tile} from "./Tile";
import {Cell} from "./Cell";

const DISTANCE_THRESHOLD = 300;

export class Sketch {
    private readonly dim: number;
    private readonly canvasDimension: number;
    private readonly numTiles: number;
    private readonly imageUrls: string[];
    private tileImages: p5.Image[];
    private tiles: Tile[];
    private sideSocketColorVectors: number[][];
    private tileImageVectorSockets: number[][];
    private grid: Cell[];
    private stateStack: Cell[][];
    private socketVectorInverses: number[];
    private cellSize: number;
    private p: p5 | undefined;
    private loop: boolean;

    constructor(canvasDimension: number, dim: number, imageUrls: string[]) {
        this.dim = dim;
        this.canvasDimension = canvasDimension;
        this.cellSize = canvasDimension / dim;
        this.numTiles = imageUrls.length;
        this.imageUrls = imageUrls;

        this.p = undefined;
        this.loop = false;
        this.tileImages = [];
        this.grid = [];
        this.stateStack = [];
        this.tiles = [];
        this.sideSocketColorVectors = [];
        this.tileImageVectorSockets = [];
        this.socketVectorInverses = [];
    }

    public startOver() {
        this.loop = false;
        for (let i = 0; i < this.dim * this.dim; i++) {
            this.grid[i] = new Cell(this.tiles.length, i);
        }
    }

    public isDone() {
        return this.grid.filter(cell => !cell.collapsed).length === 0;
    }

    public drawNext() {
        this.loop = false;
        this.p?.draw();
    }

    public completeDrawing() {
        if (this.grid.filter(cell => !cell.collapsed).length == 0) {
            this.startOver();
        }
        this.loop = true;
        this.p?.draw();
    }

    public goBack() {
        this.loop = false;
        if (this.stateStack.length > 0) {
            this.grid = this.stateStack.pop()!;
        }

        this.p?.background(0);
        for (let i = 0; i < this.grid.length; i++) {
            const col = i % this.dim;
            const row =  Math.floor(i / this.dim);

            if (this.grid[i].collapsed) {
                this.p?.image(this.tiles[this.grid[i].options[0]].img, col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
            } else {
                this.p?.fill(0);
                this.p?.stroke(255);
                this.p?.rect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    public createSketch = () => (p: p5) => {
        this.p = p;
        p.preload = async () => {
            for (let i = 0; i < this.numTiles; i++) {
                this.tileImages[i] = p.loadImage(this.imageUrls[i]);
            }
        }
        p.setup = () => {
            p.createCanvas(this.canvasDimension, this.canvasDimension);
            p.background(220);

            for (let i = 0; i < this.numTiles; i++) {
                const image = this.tileImages[i];
                const imageSocketVectorIndices: number[] = [];

                const top = image.get(0, 0, image.width, 1);
                top.loadPixels();
                imageSocketVectorIndices.push(this.populateSideSocketVectors(top.pixels));

                const right = image.get(image.width - 1, 0, 1, image.height);
                right.loadPixels();
                imageSocketVectorIndices.push(this.populateSideSocketVectors(right.pixels));

                const bottom = image.get(0, image.height - 1, image.width, 1);
                bottom.loadPixels();
                const reversedBottom = this.reverseRGBAArray(bottom.pixels)
                imageSocketVectorIndices.push(this.populateSideSocketVectors(reversedBottom));

                const left = image.get(0, 0, 1, image.height);
                left.loadPixels();
                const reversedLeft = this.reverseRGBAArray(left.pixels)
                imageSocketVectorIndices.push(this.populateSideSocketVectors(reversedLeft));

                this.tileImageVectorSockets[i] = imageSocketVectorIndices;
            }

            this.populateVectorInverses();

            for (let i = 0; i < this.numTiles; i++) {
                this.tiles[i] = new Tile(this.tileImages[i], [this.tileImageVectorSockets[i][0], this.tileImageVectorSockets[i][1], this.tileImageVectorSockets[i][2], this.tileImageVectorSockets[i][3]])
            }

            // ROTATE EVERYTHING BY DEFAULT (maybe some smart dup detection?)
            for (let i = 0; i < this.numTiles; i++) {
                for (let rotNum = 1; rotNum < 4; rotNum++) {
                    this.tiles.push(this.tiles[i].rotate(rotNum, p));
                }
            }

            // generate adjacency rules
            for (let i = 0; i < this.tiles.length; i++) {
                const tile = this.tiles[i];
                tile.analyze(this.tiles, this.socketVectorInverses);
            }

            this.startOver();
        };

        p.draw = () => {
            if (this.grid.filter(cell => !cell.collapsed).length == 0) {
                return;
            }

            // sort grid by entropy
            const gridCopy = this.grid.slice();
            gridCopy.sort((a, b) => {
                return a.options.length - b.options.length
            });

            // collapse a cell
            const minEntropy = gridCopy.filter(cell => !cell.collapsed)[0].options.length;
            const candidateCellsToCollapse = gridCopy.filter(cell => !cell.collapsed).filter(cell => cell.options.length === minEntropy);
            const cellToCollapse: Cell = p.random(candidateCellsToCollapse);
            const collapsedOption: number | undefined = p.random(cellToCollapse.options);

            if (collapsedOption === undefined) {
                if (this.stateStack.length > 0) {
                    this.grid = this.stateStack.pop()!;
                } else {
                    this.startOver();
                }
                return;
            }

            this.stateStack.push(this.grid.map(cell => cell.clone()))

            cellToCollapse.collapsed = true;
            cellToCollapse.options = [collapsedOption];

            p.background(0);
            // painting cells
            for (let i = 0; i < this.grid.length; i++) {
                const col = i % this.dim;
                const row =  Math.floor(i / this.dim);

                if (this.grid[i].collapsed) {
                    p.image(this.tiles[this.grid[i].options[0]].img, col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
                } else {
                    p.fill(0);
                    p.stroke(255);
                    p.rect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
                }
            }

            const checkedCells = new Array(this.grid.length).fill(false);
            const cellCheckStack = [];

            for (let i = 0; i < this.dim * this.dim; i++) {
                if (this.grid[i].collapsed) {
                    checkedCells[i] = true;
                }
            }

            cellCheckStack.push(cellToCollapse)
            while (cellCheckStack.length > 0) {
                const cellToCheck: Cell = cellCheckStack.pop()!;
                checkedCells[cellToCheck.index] = true;

                const index = cellToCheck.index;
                const col = index % this.dim;
                const row =  Math.floor(index / this.dim);

                if (row > 0) {
                    const up = this.grid[index - this.dim];
                    if (!checkedCells[up.index]) {
                        const validOptions = [...new Set(cellToCheck.options.flatMap(option => this.tiles[option].up))];
                        const newOptions = this.checkValid(up.options, validOptions);

                        if (newOptions.length !== up.options.length) {
                            up.options = newOptions;
                            cellCheckStack.push(up);
                        }
                    }
                }

                if (col < this.dim - 1) {
                    const right = this.grid[index + 1];
                    if (!checkedCells[right.index]) {
                        const validOptions = [...new Set(cellToCheck.options.flatMap(option => this.tiles[option].right))];
                        const newOptions = this.checkValid(right.options, validOptions);

                        if (newOptions.length !== right.options.length) {
                            right.options = newOptions;
                            cellCheckStack.push(right);
                        }
                    }
                }

                if (row < this.dim - 1) {
                    const down = this.grid[index + this.dim];
                    if (!checkedCells[down.index]) {
                        const validOptions = [...new Set(cellToCheck.options.flatMap(option => this.tiles[option].down))];
                        const newOptions = this.checkValid(down.options, validOptions);

                        if (newOptions.length !== down.options.length) {
                            down.options = newOptions;
                            cellCheckStack.push(down);
                        }
                    }
                }
                if (col > 0) {
                    const left = this.grid[index - 1];
                    if (!checkedCells[left.index]) {
                        const validOptions: number[] = [...new Set(cellToCheck.options.flatMap(option => this.tiles[option].left))];
                        const newOptions = this.checkValid(left.options, validOptions);

                        if (newOptions.length !== left.options.length) {
                            left.options = newOptions;
                            cellCheckStack.push(left);
                        }
                    }
                }
            }

            if (!this.loop) {
                p.noLoop();
            } else {
                p.loop();
            }
        };
    };

    private checkValid(arr: number[], valid: number[]) {
        for (let i = arr.length - 1; i >= 0; i--) {
            const element = arr[i];
            if (!valid.includes(element)) {
                arr.splice(i, 1);
            }
        }

        return arr;
    }

    private populateSideSocketVectors(vector: number[]) {
        for (let i = 0; i < this.sideSocketColorVectors.length; i++) {
            const dist = this.getDistance(this.sideSocketColorVectors[i], vector);
            if (dist < DISTANCE_THRESHOLD) {
                return i;
            }
        }

        this.sideSocketColorVectors.push(vector);
        return this.sideSocketColorVectors.length - 1;
    }

    private populateVectorInverses() {
        for (let i = 0; i < this.sideSocketColorVectors.length; i++) {
            if (this.socketVectorInverses[i] !== undefined) {
                continue;
            }

            const invertedVector = this.reverseRGBAArray(this.sideSocketColorVectors[i]);
            let closestVectorIndex = -1;
            let closestDistance = Infinity;
            for (let j = i; j < this.sideSocketColorVectors.length; j++) {
                const dist = this.getDistance(invertedVector, this.sideSocketColorVectors[j]);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestVectorIndex = j;
                }
            }
            this.socketVectorInverses[i] = closestVectorIndex;
            this.socketVectorInverses[closestVectorIndex] = i;
        }
    }

    private reverseRGBAArray(arr: number[]) {
        const results = [];
        for (let i = arr.length - 1; i >= 3 ; i -= 4) {
            results.push(arr[i-3], arr[i-2], arr[i-1], arr[i]);
        }

        return results;
    }

    private getDistance(v1: number[], v2: number[]) {
        const sumOfSquares = v1.reduce((sum, val, index) => {
            const diff = val - v2[index];
            return sum + diff * diff;
        }, 0);
        return Math.sqrt(sumOfSquares);
    }
}
