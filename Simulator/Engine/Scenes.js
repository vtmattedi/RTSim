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
    //objects = [];// Array of objects in the scene
    //this should be sorted by z index (the lowest z index is drawn in the back)
    #finished = {value: false, navigate: null}; // if true, the scene will be removed from the stack
    constructor() {
        this.objects = [];// Array of objects in the scene
        this.changed = false;
        this.alignment = "center"; // left, center, right
        this.kill = false; // if true, the scene will be removed from the stack
        this.engine = null; // reference to the engine
        this.bottom = false; // if true, the scene will be drawn at the bottom of the screen
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
        this.objects.push(object);
        // Sort objects by z-index (z property)
        this.objects = this.objects.sort((a, b) => a.pos.z - b.pos.z);
    }
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
        // Sort objects by z-index (z property)
        this.objects = this.objects.sort((a, b) => a.pos.z - b.pos.z);
    }

    draw() {
        let t = CH.hcenter("Num of objects: " + this.objects.length);
         t += CH.vcenter(" ".repeat(CH.getWidth()),CH.getHeight() -1, CH.getWidth()," ");
        
            for (let i = 0; i < this.objects.length; i++) {
                const object = this.objects[i];
                let newy = this.bottom? CH.getHeight() - object.pos.y - object.size : object.pos.y;
                const spr = object.draw();
                t = CH.insert_sprite(t, spr, {
                    x: object.pos.x,
                    y: newy
                });
            }

            return t;
        
    }
}

export { Scene, SceneObject };