/*@file: SceneObject.js
* The SceneObject class incapsulates the properties of an object in a scene.
* It has a position (x, y, z) and a function that returns the value of the object.
* the value of the object is a string sprite that will be drawn in the scene.
* the position x and y are the coordinates of the top left corner of the object.
* the z index is used to determine the order in which the objects are drawn (back to front ground).
* Special values for the x and y positions: (not yet implemented)
* A value of -1 in the y postion means that the object will be drawn after new line at the end of the scene.
* A value of -2 in the y position means that the object will be drawn at the start of the scene.
* A value of -1 in the x position means that the object will be drawn at the end of the line. (CH.merge(currentFrame, object.getValue())
* A value of -2 in the x position means that the object will be drawn at the start of the line. (CH.merge(object.getValue(), currentFrame)
*/
import { BasicConsole } from "./ConsoleHelp.js";
import fs from 'fs';
const CH = new BasicConsole();
class SceneObject {
    constructor(pos, getValue) {
        if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number') {
            throw new Error("pos must have numeric x, y, and z properties");
        }
        if (pos.x < -2 || pos.y < -2 || pos.z < 0) {
            throw new Error("pos x, y, and z must be greater than or equal to -2. -1: means at the end. -2: means at the start");
        }
        this.pos = pos;
        this.getValue = getValue;
        this.size = CH.getSize(getValue());
        this.rotation = 0;
    }
    // rotate the object in 2D in 90 or -90 degrees
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }
    draw() {
        let text = this.getValue(this.rotation);
        // for (let i = 0; i < this.rotation; i++) {
        //     text = CH.safeTranslate(text);
        // }
        return text;
    }
}

class BasicObjects {

    static square(w, h) {
        let text = "+";
        const w_repeat = w - 2 > 0 ? w - 2 : 0;
        const h_repeat = h - 2 > 0 ? h - 2 : 0;
        text += "-".repeat(w_repeat) + "+\n";
        for (let i = 0; i < h - 2; i++) {
            text += "|" + " ".repeat(w_repeat) + "|\n";
        }
        text += "+" + "-".repeat(w_repeat) + "+\n";;
        return text;
    }

}

export { SceneObject, BasicObjects };