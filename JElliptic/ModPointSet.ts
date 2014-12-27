import ModPoint = require("ModPoint");

class ModPointSet {
    private _points: ModPoint[];

    constructor() {
        this._points = [];
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
        this._points.push(point);
    }
}

export = ModPointSet;