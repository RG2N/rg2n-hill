"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is used for setting player & bot body colors + assets.
 *
 * To replicate the changes, use the {@link Player.setOutfit} and {@link Bot.setOutfit} method(s).
 *
 * @example
 * ```js
 * const outfit = new Outfit()
 *  // Sets body colors to white
 *  .body('#ffffff')
 *  // Change head color (body colors are still changed!)
 *  .head('#000000')
 *
 * Game.on('playerJoin', (p) => {
 *  p.on('avatarLoaded', () => {
 *      // Apply the outfit to the player
 *      p.setOutfit(outfit)
 *  })
 * })
 */
class Outfit {
    constructor() {
        this.assets = {};
        this.colors = {};
        this._idString = new Set();
    }
    /** Sets the player's hat1 to the asset id specified. */
    hat1(hatId) {
        this.assets.hat1 = hatId;
        this._idString.add("U");
        return this;
    }
    /** Sets the player's hat2 to the asset id specified. */
    hat2(hatId) {
        this.assets.hat2 = hatId;
        this._idString.add("V");
        return this;
    }
    /** Sets the player's hat3 to the asset id specified. */
    hat3(hatId) {
        this.assets.hat3 = hatId;
        this._idString.add("W");
        return this;
    }
    /** Sets the player's face to the asset id specified. */
    face(faceId) {
        this.assets.face = faceId;
        this._idString.add("Q");
        return this;
    }
    /** Sets the player's shirt to the asset id specified. */
    shirt(shirtId) {
        this.assets.shirt = shirtId;
        this._idString.add("R");
        return this;
    }
    /** Sets the player's pants to the asset id specified. */
    pants(pantsId) {
        this.assets.pants = pantsId;
        this._idString.add("S");
        return this;
    }
    /** Sets the player's tshirt to the asset id specified. */
    tshirt(tshirtId) {
        this.assets.tshirt = tshirtId;
        this._idString.add("T");
        return this;
    }
    /** Sets all of the player's body colors to a hex string. */
    body(color) {
        this.colors.head = color;
        this._idString.add("K");
        this.colors.torso = color;
        this._idString.add("L");
        this.colors.rightArm = color;
        this._idString.add("N");
        this.colors.leftArm = color;
        this._idString.add("M");
        this.colors.leftLeg = color;
        this._idString.add("O");
        this.colors.rightLeg = color;
        this._idString.add("P");
        return this;
    }
    /** Sets the player's head color to a hex string. */
    head(color) {
        this.colors.head = color;
        this._idString.add("K");
        return this;
    }
    /** Sets the player's torso color to a hex string. */
    torso(color) {
        this.colors.torso = color;
        this._idString.add("L");
        return this;
    }
    /** Sets the player's right arm color to a hex string. */
    rightArm(color) {
        this.colors.rightArm = color;
        this._idString.add("N");
        return this;
    }
    /** Sets the player's left arm color to a hex string. */
    leftArm(color) {
        this.colors.leftArm = color;
        this._idString.add("M");
        return this;
    }
    /** Sets the player's left leg color to a hex string. */
    leftLeg(color) {
        this.colors.leftLeg = color;
        this._idString.add("O");
        return this;
    }
    /** Sets the player's right leg color to a hex string. */
    rightLeg(color) {
        this.colors.rightLeg = color;
        this._idString.add("P");
        return this;
    }
    /** Copies a player or bot's entire outfit (assets + body colors). */
    copy(player) {
        this.assets = Object.assign({}, player.assets);
        this.colors = Object.assign({}, player.colors);
        this._idString = new Set("UVWQRSTKLNMOP");
        return this;
    }
    get idString() {
        return Array.from(this._idString).join("");
    }
}
exports.default = Outfit;
