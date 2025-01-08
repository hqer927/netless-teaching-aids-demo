declare module '@amoutonbrady/lz-string' {
    export const compress:(str:string) => string;
    export const decompress:(data:string) => string;
    export const compressToUint8Array:(str:unknown) => Uint8Array;
    export const decompressFromUint8Array:(data:Uint8Array) => string;
}