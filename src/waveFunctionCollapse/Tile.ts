import p5 from "p5";

export class Tile {
    img: p5.Image;
    private edges: number[];
    up: number[];
    right: number[];
    down: number[];
    left: number[];

    constructor(img, edges) {
        this.img = img;
        this.edges = edges;

        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
    }

    public analyze(tiles, vectorInversLookup) {
        for (let i = 0; i < tiles.length; i++) {
            // UP
            if (tiles[i].edges[2] === vectorInversLookup[this.edges[0]]) {
                this.up.push(i);
            }

            // RIGHT
            if (tiles[i].edges[3] === vectorInversLookup[this.edges[1]]) {
                this.right.push(i);
            }

            // DOWN
            if (tiles[i].edges[0] === vectorInversLookup[this.edges[2]]) {
                this.down.push(i);
            }

            // LEFT
            if (tiles[i].edges[1] === vectorInversLookup[this.edges[3]]) {
                this.left.push(i);
            }
        }
    }

    rotate(num: number, p: p5) {
        const width = this.img.width;
        const height = this.img.height;
        const newImg = p.createGraphics(width, height);
        newImg.imageMode(p.CENTER);
        newImg.translate(width / 2, height / 2);
        newImg.rotate(p.HALF_PI * num);
        newImg.image(this.img, 0, 0);

        const newEdges = [];
        const len = this.edges.length;
        for (let i = 0; i < len; i++) {
            newEdges[i] = this.edges[(i - num + len) % len]
        }

        return new Tile(newImg, newEdges);
    }
}
