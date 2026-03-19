import { IPackageInfo, IPackageMap } from "./packageMap.js";

/**
 * This class holds a path of single module along
 * with it's own package info
 */
export default class JSModule {

    public imports: IPackageMap;

    public owner: IPackageInfo;
    public main: IPackageInfo;

    public mainFolder: string;
    public ownerFolder: string;

    public src: string;

    constructor(
        p: Partial<JSModule>
    ) {
        // do nothing
        Object.setPrototypeOf(p, JSModule.prototype);
        return p as any;
    }

}