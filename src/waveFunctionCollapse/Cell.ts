export class Cell {
    public collapsed: boolean;
    public index: number;
    public options: number[];

    constructor(value, index) {
        this.collapsed = false;
        this.index = index;
        if (value instanceof Array) {
            this.options = value;
        } else {
            this.options = new Array(value).fill(0).map((_, i) => i);
        }
    }

    public clone() {
        const clonedCell = new Cell([...this.options], this.index);
        clonedCell.collapsed = this.collapsed;
        return clonedCell;
    }
}
