declare module 'lineclip' {
    type Point = [number, number];
    type BoundingBox = [number, number, number, number];
    type LineClipResult = Point[];
    export const polyline:(points: Point[], bbox: BoundingBox, result?: LineClipResult[]) => LineClipResult[];
}