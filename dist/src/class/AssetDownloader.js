"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetDownloader = void 0;
const phin = require("phin")
    .defaults({ "timeout": 12000 });
const ASSET_API = (assetId) => `https://api.brick-hill.com/v1/assets/getPoly/1/${assetId}`;
const GET_ASSET_DATA = (assetId) => `https://api.brick-hill.com/v1/assets/get/${assetId}`;
class AssetDownloader {
    constructor() {
        this.cache = {};
    }
    fetchAssetUUID(type, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield phin({ url: GET_ASSET_DATA(assetId) });
            if (data.statusCode !== 302)
                return Promise.reject(`AssetDownloader: Unexpected status code when retrieving asset data for ${assetId}.`);
            const path = data.headers.location.split("/");
            return { [type]: path.pop() };
        });
    }
    getAssetData(assetId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!assetId)
                return;
            if (this.cache[assetId])
                return this.cache[assetId];
            const promises = [];
            const assetData = {
                mesh: null,
                texture: null
            };
            let req;
            try {
                req = (yield phin({ url: ASSET_API(assetId), followRedirects: true, parse: "json" })).body[0];
                if (req.error)
                    throw new Error(req.error.message);
            }
            catch (_c) {
                return Promise.reject(`AssetDownloader: Failure retrieving asset data for ${assetId}.`);
            }
            const mesh = (_a = req.mesh) === null || _a === void 0 ? void 0 : _a.replace("asset://", "");
            const texture = (_b = req.texture) === null || _b === void 0 ? void 0 : _b.replace("asset://", "");
            if (mesh)
                promises.push(this.fetchAssetUUID("mesh", mesh));
            if (texture)
                promises.push(this.fetchAssetUUID("texture", texture));
            const assetUUID = yield Promise.all(promises);
            Object.assign(assetData, ...assetUUID);
            this.cache[assetId] = Object.assign({}, assetData);
            return assetData;
        });
    }
}
exports.AssetDownloader = AssetDownloader;
const assetDownloader = new AssetDownloader();
exports.default = assetDownloader;
