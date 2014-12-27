import ModPoint = require("ModPoint");

class ModPointSet {
    private _points: ModPoint[];
    private _totalCount: number;
    private _duplicatesCount: number;

    constructor() {
        this._points = [];
        this._totalCount = 0;
        this._duplicatesCount = 0;
    }

    get uniqueFraction() {
        return 1.0 - (this._duplicatesCount / this._totalCount);
    }

    contains(point: ModPoint): boolean {
        for (var n = 0; n < this._points.length; n++) {
            if (point.eq(this._points[n])) {
                return true;
            }
        }
        return false;
    }

    add(point: ModPoint): void {
        this._totalCount++;

        if (this.contains(point)) {
            this._duplicatesCount++;
        } else {
            this._points.push(point);
        }
    }
}

export = ModPointSet;