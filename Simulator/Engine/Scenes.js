/*@file: ConsoleEngine.js
* This file contains the implementation of a basic scene class for the engine.
* The main usage should an extension of this class.
* The onEnter and onExit methods are called when the scene is entered or exited.
* The handleInput method is called when an input is received. (if the message box is not open)
* the default implementation of the draw method prints the objects to a string, using the z index to sort them.
* the objects must have at least the following properties:
* pos: {x: number, y: number, z: number}, getValue: function() => string}
* Right now it only accepts SceneObjects. Check the SceneObject class for more information.
*/

import { SceneObject } from "./SceneObject.js";
import { BasicConsole } from "./ConsoleHelp.js";
const CH = new BasicConsole();
// Basic Scene class that generates a frame with
// all the objects in the scene
class Scene {
    #objects = [];// Array of objects in the scene
    //this should be sorted by z index (the lowest z index is drawn in the back)
    #finished = {value: false, navigate: null}; // if true, the scene will be removed from the stack
    constructor() {
        this.changed = false;
        this.alignment = "center"; // left, center, right
        this.kill = false; // if true, the scene will be removed from the stack
    }

    get finished() {
        return this.#finished;
    }

    /**
     * Sets the finished state and the alias for the next scene.
     *
     * @param {boolean} value - Indicates whether the scene is finished.
     * @param {string} navigate - If set, the Engine will try to navigate to this alias if it detecs that the Scene has finished.value set to true.
     */
    setFinished =(value, navigate) => {
        this.#finished.value = value;
        this.#finished.navigate = navigate;
    }
     
    onEnter() {
    }
    onExit() {
    }
    handleInput(input) {
        // Handle input for the scene
    }
    addObject(object) {
        if (!(object instanceof SceneObject)) {
            throw new Error("Object must be an instance of SceneObject");
        }
        this.#objects.push(object);
        // Sort objects by z-index (z property)
        this.#objects = this.#objects.sort((a, b) => a.pos.z - b.pos.z);
    }
    removeObject(object) {
        const index = this.#objects.indexOf(object);
        if (index > -1) {
            this.#objects.splice(index, 1);
        }
        // Sort objects by z-index (z property)
        this.#objects = this.#objects.sort((a, b) => a.pos.z - b.pos.z);
    }

    draw() {
        throw new Error("draw() method not implemented in Scene class. Please implement it in the derived class.");

        let text = "number of objects: " + this.#objects.length + "\n";
        for (let i = 0; i < this.#objects.length; i++) 
        {
            const size = CH.getSize(this.#objects[i].getValue());
            text += `[${i}: x: ${this.#objects[i].pos.x} +${size.width} y: ${this.#objects[i].pos.y} +${size.height} z: ${this.#objects[i].pos.z}],`;
        }
        console.log(text);
        text = "";
        for (let i = 0; i < this.#objects.length; i++) {
            console.log("object: ", this.#objects[i].pos);
            const object = this.#objects[i]; 
            const pos = object.pos;
            let value = object.getValue();
            const size = CH.getSize(value);
            value = value.split("\n");
            const text_size = CH.getSize(text);
            // add new lines to the text if the object is out of bounds
            for (let j = 0; j < (pos.y + size.height + 1) - text_size.height; j++) {
                text += "\n";
            }
            console.log("size: ", size, "text_size: ", text_size, CH.getSize(text));
            // merge the current object with the frame
            text = text.split("\n").map((line, index) => {
                // if the index is in this line
                if (index >= pos.y && index < pos.y + size.height -1) {
                    const new_obj_index = index - pos.y;
                    const length = CH.getLineWidth(value[new_obj_index]);
                    const line_len = CH.getLineWidth(line);
                    if (line_len < pos.x) {
                        line = " ".repeat(pos.x - line_len) + line;
                     }
                     const line_len2 = CH.getLineWidth(line);
                    // console.log(index, pos.y , length, line_len);
                     // if there is more stuff after the object, add it to the line
                     const after = line_len  > pos.x + length ? CH.getSafeSubstring(line, line_len2 - (pos.x + length)) : "";
                     //overwirte the line with the new object
                     console.log( pos.x, length, line_len,line_len2,  line_len2 - (pos.x + length), line_len  > pos.x + length, CH.getLineWidth(after));
                     return line = CH.getSafeSubstring(line, 0, pos.x - 1) + value[new_obj_index] + after;
                }
                else 
                {
                    return line;
                }
            }).join("\n");
            //CH.print(text);
        }

        return text + "\n" + "-".repeat(CH.getWidth()) + "\n" ;
        
    }
}

export { Scene, SceneObject };