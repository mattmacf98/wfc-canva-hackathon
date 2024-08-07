import p5 from "p5";

export class Tile {
    img: p5.Image | p5.__Graphics__ & p5;
    private edges: number[];
    up: number[];
    right: number[];
    down: number[];
    left: number[];

    constructor(img: p5.Image | p5.__Graphics__ & p5, edges: number[]) {
        this.img = img;
        this.edges = edges;

        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
    }

    public analyze(tiles: Tile[], vectorInverseLookup: number[]) {
        for (let i = 0; i < tiles.length; i++) {
            // UP
            if (tiles[i].edges[2] === vectorInverseLookup[this.edges[0]]) {
                this.up.push(i);
            }

            // RIGHT
            if (tiles[i].edges[3] === vectorInverseLookup[this.edges[1]]) {
                this.right.push(i);
            }

            // DOWN
            if (tiles[i].edges[0] === vectorInverseLookup[this.edges[2]]) {
                this.down.push(i);
            }

            // LEFT
            if (tiles[i].edges[1] === vectorInverseLookup[this.edges[3]]) {
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
