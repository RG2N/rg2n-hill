var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PacketBuilder = require("../../net/PacketBuilder").default;
const AssetDownloader = require("../../class/AssetDownloader").default;
const ASSET_TYPE = {
    "Q": (p) => p.assets.face,
    "R": (p) => p.assets.shirt,
    "S": (p) => p.assets.pants,
    "T": (p) => p.assets.tshirt,
    "U": (p) => p.assets.hat1,
    "V": (p) => p.assets.hat2,
    "W": (p) => p.assets.hat3,
    "g": (p) => p.toolEquipped.model
};
function createAssetIdBuffer(entity, idString = "", packetType = "Figure") {
    return __awaiter(this, void 0, void 0, function* () {
        // No equipped tool, remove "g" if it exists.
        if (!entity.toolEquipped)
            idString = idString.replace(/g/g, "");
        // Filter any packet ids that are not in the array.
        const packetId = idString.split("").filter((id) => ASSET_TYPE[id]);
        const entityPacket = new PacketBuilder(packetType)
            .write("uint32", entity.netId);
        entityPacket.idString += packetId.join("");
        const assetRequests = [];
        // Request assets in parallel to maximize speed.
        for (const id of packetId)
            assetRequests.push(AssetDownloader.getAssetData(ASSET_TYPE[id](entity)).catch(() => { }));
        yield Promise.all(assetRequests);
        for (const id of packetId) {
            if (id === "g") {
                if (!entity.toolEquipped)
                    continue;
                entityPacket.write("uint32", entity.toolEquipped._slotId);
            }
            yield entityPacket.writeAsset(ASSET_TYPE[id](entity));
        }
        return entityPacket;
    });
}
module.exports = createAssetIdBuffer;
