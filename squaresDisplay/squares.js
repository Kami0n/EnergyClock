"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.packSquares = void 0;
var eps = 0.0001;
var packSquares = function (values, maxValue) {
    var max = Math.sqrt(maxValue);
    var square0Size = Math.sqrt(values[0]) / max;
    var squares = [{ x: 0, y: 0, width: square0Size, height: square0Size }];
    // This is const, but only the ref. We splice the array as we
    // iterate through the data points, thus changing the value.
    var outline = [[0, 0], [square0Size, 0], [square0Size, square0Size], [0, square0Size]];
    // Naming conventions:
    //
    // - v{0,1,2,3}: The four vertices of the square which will be inserted into the result list.
    // - n{1,2,...}: Vertices which are used to calculate the direction.
    // - d{1,2,...}: Normalised vectors in the direction vX -> nY
    values.slice(1).forEach(function (value) {
        var size = Math.sqrt(value) / max;
        var centroid = polygonCentroid(outline);
        // The closest vertex to that centroid is used as one of the vertices
        // for the current rectangle. Saved as the index into the 'outline'
        // list because we need its neighbours.
        var v0Index = outline.reduce(function (a, v, i) {
            return distance(v, centroid) < distance(outline[a], centroid) ? i : a;
        }, 0);
        var v0 = outline[v0Index];
        // Now we need to decide into which direction the rectangle grows. We
        // can pick one side arbitrarily towards one of the neighbours of the
        // closest index.
        // The n1 vertex is the /direction/ into which the side grows.
        // We still need to do some vector arithmetic to determine where the
        // actual vertex needs to be.
        var n1Index = (v0Index + 1) % outline.length;
        var n1 = outline[n1Index];
        // The unit vector from v0 in the direction towards n1.
        var d1 = normalize(subtract(n1, v0));
        // The second vertex of the rectangle.
        var v1 = add(v0, multiply(d1, [size, size]));
        // The third vertex is from 'v0' along the line towards
        // the other (previous) neighbour. But we may need to invert the direction so
        // that the vector points away from the centroid.
        //
        // We compute the direction, and add that the 'v0'. If the
        // result ends up on the same side of the line between 'v0'
        // and 'v1', it means the point is on the wrong side and we have to
        // invert the direction.
        //
        // In the degenerate case where the direction from v0 to n2 is parallel
        // to d1, rotate the vector 90 degrees to the right. This works because
        // the outline is always counter-clockwise (I think).
        var n2Index = (v0Index - 1 + outline.length) % outline.length;
        var n2 = outline[n2Index];
        // The vector along the line between v0 and v2. We may have to invert
        // it if it is rotated by 180 degrees.
        var d2 = (function () {
            // The unit vector from v0 towards n2.
            var d = normalize(subtract(n2, v0));
            var dot2v = dot2(d, d1);
            if (Math.abs(dot2v) < eps) {
                return d;
            }
            else if (dot2v < 0) {
                return [d[1], -d[0]];
            }
            else {
                return d;
            }
        })();
        // Direction from 'v0' to the centroid.
        var centroidDirection = subtract(centroid, v0);
        // For v2 we have two choices where to go. Use the direction which results in
        // the vertex being outside of the outline.
        var v2_a = add(v0, multiply(negate(d2), [size, size]));
        var v2_b = add(v0, multiply(d2, [size, size]));
        var d3_fwd = pointIsInside(v2_a, outline);
        var v2 = d3_fwd ? v2_b : v2_a;
        // Push the square into the result list.
        squares.push({
            x: Math.min(Math.min(v0[0], v1[0]), v2[0]),
            y: Math.min(Math.min(v0[1], v1[1]), v2[1]),
            width: size,
            height: size
        });
        // Update the outline.
        var v4 = add(add(v0, subtract(v2, v0)), subtract(v1, v0));
        var toInsert = [distance(v2, n2) < eps ? undefined : v2,
            v4,
            distance(v1, n1) < eps ? undefined : v1
        ].filter(function (x) { return x !== undefined; });
        if (!d3_fwd) {
            outline.splice.apply(outline, __spreadArray([v0Index + 1, 0], toInsert));
        }
        else {
            outline.splice.apply(outline, __spreadArray([v0Index, 1], toInsert));
        }
    });
    return {
        squares: squares,
        outline: outline,
        centroid: polygonCentroid(outline),
        extent: polygonExtent(outline)
    };
};
exports.packSquares = packSquares;
var polygonExtent = function (vertices) {
    var _a = vertices.reduce(function (_a, v) {
        var min = _a.min, max = _a.max;
        return ({
            min: min2(min, v),
            max: max2(max, v)
        });
    }, { min: [999, 999], max: [-999, -999] }), min = _a.min, max = _a.max;
    return {
        x: min[0],
        y: min[1],
        width: max[0] - min[0],
        height: max[1] - min[1]
    };
};
// https://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon
var polygonCentroid = function (vertices) {
    var _a = vertices.reduce(function (_a, _b, i) {
        var A = _a.A, cx = _a.cx, cy = _a.cy;
        var x1 = _b[0], y1 = _b[1];
        var _c = vertices[(i + 1) % vertices.length], x2 = _c[0], y2 = _c[1];
        var f = (x1 * y2 - x2 * y1);
        return {
            A: A + f,
            cx: cx + (x1 + x2) * f,
            cy: cy + (y1 + y2) * f
        };
    }, { A: 0, cx: 0, cy: 0 }), A = _a.A, cx = _a.cx, cy = _a.cy;
    return multiply([1 / (6 * 0.5 * A), 1 / (6 * 0.5 * A)], [cx, cy]);
};
var pointIsInside = function (_a, vs) {
    var x = _a[0], y = _a[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var _b = vs[i], xi = _b[0], yi = _b[1];
        var _c = vs[j], xj = _c[0], yj = _c[1];
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
};
// ----------------------------------------------------------------------------
// Vec2
var distance = function (_a, _b) {
    var x1 = _a[0], y1 = _a[1];
    var x2 = _b[0], y2 = _b[1];
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};
var subtract = function (a, b) {
    return [a[0] - b[0], a[1] - b[1]];
};
var normalize = function (_a) {
    var x = _a[0], y = _a[1];
    var len = x * x + y * y;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        return [x * len, y * len];
    }
    else {
        return [0, 0];
    }
};
var multiply = function (a, b) {
    return [a[0] * b[0], a[1] * b[1]];
};
var add = function (a, b) {
    return [a[0] + b[0], a[1] + b[1]];
};
var dot2 = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};
var cross = function (a, b) {
    return [0, 0, a[0] * b[1] - a[1] * b[0]];
};
var negate = function (a) {
    return [-a[0], -a[1]];
};
var min2 = function (a, b) {
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
};
var max2 = function (a, b) {
    return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
};
var colinear = function (a, b, c) {
    return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) < eps;
};
// ----------------------------------------------------------------------------
// Vec3
var dot3 = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};
