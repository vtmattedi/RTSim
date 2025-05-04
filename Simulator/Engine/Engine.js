/*@file: ConsoleEngine.js
* This is a sudo Engine for a console aplication.
* It basically draws a frame in the console from the current scene.
* The scene can draw a frame bigger than the console it self. In this case, 
* the camera system will be used to move the frame around.
* Altough it was made for a console. it theoretically can be used in any kind of 
* text output stream that supports ANSI escape codes.
* Check the ConsoleHelp.js for more information about how it works and how to implement 
* in other enviroments.
* Decided to use a singleton pattern for the engine, so it can be used in any part of the code.
* since it makes no sense to have more than one instance of the engine.
* The MessageBox is also a singleton. Therefore,  messages can be raised and will be shown in front of anything on the drawed scene.
*/
import { BasicConsole, Decorations, DefaultColors } from "./ConsoleHelp.js";
import { MsgBoxHandler } from "./messageBox.js";
import { delta } from "./Symbols.js";
import { Scene } from "./Scenes.js";

const CH = new BasicConsole();

class performaceCheck {
    constructor() {
        this.times = {};
        this.lastDelta = 0;
        this.history = [];
        this.historySize = 10;
        this.historyIndex = 0;
    }
    addTime(time) {
        this.history[this.historyIndex] = time;
        this.historyIndex++;
        if (this.historyIndex >= this.historySize) {
            this.historyIndex = 0;
        }


    }
    fps() {
        let oldIndex = this.historyIndex - 1;
        if (oldIndex < 0) {
            oldIndex = this.historySize - 1;
        }
        const delta = this.history[this.historyIndex] - this.history[oldIndex];
        const fps = Math.round(1000 / (delta === 0 ? 1 : delta));
        const avg = this.history.reduce((a, b) => a + b, 0) / this.history.length;
        const min = Math.min(...this.history);
        const max = Math.max(...this.history);
        return `FPS: ${(1000 / avg).toFixed(1)} AVG: ${avg.toFixed(1)} | MIN: ${min} | MAX: ${max} |`;
    }

}

class ConsoleEngine {
    static #instance = null // Singleton instance of the ConsoleEngine Should not have 2 instances
    #timer = null; // Timer for the rendering loop
    #tagetFPS = 30; // Target frames per second for the engine
    /*The camera position starts at the top left corner of the frame.
     *Then it is offset by the camera position. 
    */
    #camera_pos = { x: 0, y: 0 }; // Camera position in the console
    #minSize = { w: -1, h: -1 }; // Minimum size for the console
    #lastInput = null; // Last input received by the engine
    #Version = "1.0";
    get Version() {
        return this.#Version;
    }
    constructor() {
        if (ConsoleEngine.#instance) {
            return ConsoleEngine.#instance;
        }
        ConsoleEngine.#instance = this;
        this.performaceCheck = new performaceCheck();
        this.msgBox = new MsgBoxHandler();
        this.scenes = [];
        this.sceneHistory = [];
        this.locked = false;
        this.debug = false;
        this.lastFrame = Date.now();
        this.onExit = null;
        this.resize();
        this.#start();
    }

    /**
     * Starts the engine's rendering loop with a specified frame rate.
     * If a timer is already running, it clears the existing interval before starting a new one.
     * The frame rate is determined by the `#tagetFPS` property, defaulting to 30 FPS if not set or invalid.
     * The interval duration is slightly adjusted to account for overhead.
     * 
     * @private
     */
    #start() {
        if (this.#timer) {
            clearInterval(this.#timer);
        }
        const fps = this.#tagetFPS > 0 ? this.#tagetFPS : 30;
        const ms = Math.round(1000 / (fps * 1.1));
        this.#timer = setInterval(() => {
            this.draw();
        }, ms);
    }

    /**
     * Sets the minimum size for the engine and triggers a resize operation.
     * A value of 0 for width or height will not change the respective dimension.
     * A negative value will mean no minimum size restriction.
     * @param {number} w - The minimum width to set.
     * @param {number} h - The minimum height to set.
     */
    setMinSize(w, h) {
        if (w !== undefined && w != 0) {
            this.#minSize.w = w;
        }
        if (h !== undefined && h != 0) {
            this.#minSize.h = h;
        }
        this.resize();
    }
    /**
     * Sets the target frames per second (FPS) for the engine and (re)starts the engine loop.
     * 
     * @param {number} fps - The desired frames per second. Must be greater than 0.
     */
    targetFPS(fps) {
        if (fps > 0) {
            this.#tagetFPS = fps;
            this.#start();
        }
    }


    /**
     * Adds a new scene to the engine and optionally assigns it an alias.
     * If the scene history is empty, it automatically navigates to the added scene.
     *
     * @param {Scene} scene - The scene to be added. Must be an instance of the `Scene` class.
     * @param {string} [alias] - An optional alias for the scene. Defaults to the scene's constructor name.
     * It is not allowed to be "Exit".
     * @throws {Error} Throws an error if the provided scene is not an instance of `Scene`.
     */
    addScene(scene, alias) {
        if (!(scene instanceof Scene)) {
            throw new Error("Scene must be an instance of Scene");
        }
        if (alias === "Exit")
        {
            throw new Error("Scene must not be named Exit, this is reserved.");
        }

        if (scene) {
            this.scenes.push({ scene: scene, alias: alias || scene.constructor.name });
            if (this.sceneHistory.length <= 0)
                this.goToScene(alias || scene.constructor.name);
        }
    }


    /**
     * Navigates to a specified scene by its alias or navigates back to the previous scene.
     *
     * @param {string|number} alias - The alias of the scene to navigate to, or -1/"back" to go to the previous scene.
     * @returns {boolean} - Returns `true` if the navigation was successful, otherwise `false`.
     */
    goToScene(alias, whoiam) {
        //this.lastAlias = alias + " by " + whoiam ;
        if (alias == "Exit" && this.onExit) 
        {
            this.msgBox.raise("Are you sure you want to exit?","Exit", ["Yes", "No"],
                (res) => {
                    if (res == 0) {
                        this.onExit();
                    }
                });
                return true;
        }

        if (alias === -1 || alias === "back") {
            if (this.sceneHistory.length > 1) {
                this.sceneHistory[0]?.scene.onExit();
                this.sceneHistory.shift();
                this.sceneHistory[0].scene.onEnter();
            }
            return true;
        }
        

        const scene = this.scenes.find((s) => s.alias === alias);
        if (scene) {
            this.sceneHistory[0]?.scene.onExit();
            // prevent going back and forth to the same scene
            if (this.sceneHistory.length > 1 && this.sceneHistory[1].alias == scene.alias) {
                this.sceneHistory.splice(1, 1);
            }
            this.sceneHistory.unshift({...scene, added: whoiam});
            scene.scene.onEnter();
            return true;
        }
        return false;

    }

    /**
     * Sets the position of the camera.
     * Ensures that the camera position does not go below 0 for both x and y coordinates.
     *  
     * The camera position is the offset from the top left corner of the frame. 
     * 
     * @param {number} [x] - The x-coordinate of the camera position. If undefined, the x-coordinate remains unchanged.
     * @param {number} [y] - The y-coordinate of the camera position. If undefined, the y-coordinate remains unchanged.
     */
    setCameraPos(x, y) {
        if (x !== undefined) {
            if (x < 0) {
                x = 0;
            }
            this.#camera_pos.x = x;
        }
        if (y !== undefined) {
            if (y < 0) {
                y = 0;
            }
            this.#camera_pos.y = y;
        }
    }

    /**
     * Moves the camera by the specified x and y offsets.
     * This triggers a redraw of the console to reflect the new camera position.
     * The camera position is the offset from the top left corner of the frame. 
     * @param {number} x - The horizontal offset to move the camera.
     * @param {number} y - The vertical offset to move the camera.
     */
    moveCamera(x, y) {
        this.setCameraPos(this.#camera_pos.x + x, this.#camera_pos.y + y);
        this.draw();
    }


    /**
     * Retrieves the current scene from the list of scenes.
     * If there are no scenes available, it returns null.
     *
     * @returns {Object|null} The current scene object if available, otherwise null.
     */
    currentScene() {
        if (this.sceneHistory.length > 0) {
            return this.sceneHistory[0].scene;
        }
        return null;
    }


    /**
     * Resizes the console and adjusts the engine's state accordingly.
     * 
     * - Checks the new console dimensions and compares them against the minimum size.
     * - If the new size is smaller than the minimum, displays a warning message and locks the engine.
     * - If the size is valid, unlocks the engine and triggers a redraw.
     * 
     * @private
     * @method resize
     * @throws {Error} If the console dimensions are invalid or cannot be retrieved.
     */
    resize() {
        const newWidth = CH.getWidth();
        const newHeight = CH.getHeight();
        // console.log("Resizing console to: " + newWidth + "x" + newHeight);
        // Check if the new size is smaller than the minimum size
        if ((this.#minSize.w > 0 && newWidth < this.#minSize.w) || (this.#minSize.h > 0 && newHeight < this.#minSize.h)) {
            CH.clear_screen();
            let minSizeWarning = "Warning:\n";
            minSizeWarning += `Minimum size is ${this.#minSize.w}x${this.#minSize.h}, current size is ${newWidth}x${newHeight}`;
            minSizeWarning += "\nResize the console to continue.";
            const wColor = (this.#minSize.w > 0 && newWidth < this.#minSize.w) ? DefaultColors.RED : DefaultColors.WHITE;
            const hColor = (this.#minSize.h > 0 && newHeight < this.#minSize.h) ? DefaultColors.RED : DefaultColors.WHITE;
            minSizeWarning = CH.matchAndReplace(minSizeWarning,
                [
                    { text: `${newWidth}`, format: { color: wColor, decoration: Decorations.Bold } },
                    { text: `${newHeight}`, format: { color: hColor, decoration: Decorations.Bold } },
                    { text: `${this.#minSize.h}`, format: { color: DefaultColors.YELLOW, decoration: Decorations.Bold } },
                    { text: `${this.#minSize.w}`, format: { color: DefaultColors.YELLOW, decoration: Decorations.Bold } },
                    { text: `Warning:`, format: { color: DefaultColors.YELLOW, decoration: Decorations.Bold } },
                ]
            );

            CH.hprint(minSizeWarning);
            this.locked = true;
            return false;
        }
        this.locked = false;
        this.draw();
        return true;
    }

    handleInput(input, modifiers) {
        if (this.debug) {
        this.#lastInput = `${input} [s:${modifiers.shift?1:0}, c: ${modifiers.ctrl? 1 : 0}, a:${modifiers.alt? 1 : 0}]`;
        }
        if (input == "d" && modifiers.ctrl) {
            this.toggleDebug();
        }

        if (this.locked) {
            return;
        }
        if (this.msgBox.open) {
            if (input == "enter" || input == "space") {
                this.msgBox.handleInput(0);
            }
            else if (input == "arrowleft") {
                this.msgBox.handleInput(-1);
            }
            else if (input == "arrowright") {
                this.msgBox.handleInput(1);
            }
        }
        else {
           const res =  this.currentScene()?.handleInput(input, modifiers);
           if (typeof res == "string" || res == -1) {
                const went = this.goToScene(res);
                if (went) {
                    this.draw();
                }
            }
        }
    }

    toggleDebug() {
        this.debug = !this.debug;
        this.draw(true);
    }

    /**
     * Draws the current scene or displays debug information and messages.
     * This method handles rendering the current scene, managing the camera system,
     * and optionally displaying debug information.
     *
     * @method
     * @param {boolean} [force=false] - If true, forces the screen to redraw even if locked.
     * @memberof Engine
     * @returns {void}
     */
    draw(force = false) {
        //if the scene is finished and has a navigate property, go to the next scene.
        if (this.currentScene()?.finished.value)
        {
            if (this.currentScene().finished.navigate) {
                if (this.goToScene(this.currentScene().finished?.navigate))
                {
                    this.draw(true);
                }
                return;
            }
        }

        if (this.locked && !force) {
            return;
        }
        if (this.scenes.length == 0) {
            CH.clear_screen();
            CH.write("No scenes to draw.");
            return;
        }
        //If this line is not commented, the screen will be redraw every frame.
        //if this is commented, the screen will be redraw only if the scene is changed.
        //this.currentScene().changed = false; // Reset the changed flag for the current scene
        let text = this.currentScene()?.draw() || "";
        const size = CH.getSize(text); // Get the size of the text to be drawn
        CH.home_cursor();
        //console.log("Size: ", size, CH.getWidth(), CH.getHeight(), this.debug * 4);
        if (this.debug) {
            this.performaceCheck.addTime(Date.now() - this.lastFrame);
            let debugText = "Debug: " + this.scenes.length + " scenes loaded [" + this.sceneHistory[0].alias + "]";
            debugText += ` w:${size.width}, h:${size.height} d:${(CH.getHeight() - this.debug * 4) - size.height}` +"\n";
            debugText += "Console: " + CH.getWidth() + "x" + CH.getHeight() + " " + delta + `t: ${Date.now() - this.lastFrame}` + " camera: " + this.#camera_pos.x + "," + this.#camera_pos.y + " " + this.#lastInput+ "\n";
            const ms = Math.round(1000 / this.#tagetFPS);
            debugText += `Target: ${this.#tagetFPS}, MS: ${ms} ` + this.performaceCheck.fps() + "\n";
            CH.write(CH.hcenter(debugText, CH.getWidth(), " ", "left"));
        }
        else {
        }

        //Simple camera system, only moves the text around.
        //The camera position is set to the top left corner of the frame.
        const getPos = (size, camera) => {
            let start_x = camera.x;
            let start_y = camera.y;
            if (size.width <= CH.getWidth()) {
                start_x = 0;
            }
            else if (start_x + CH.getWidth() - 1 > size.width) {
                start_x = size.width - CH.getWidth() + 1;
            }
            if (size.height <= CH.getHeight()) {
                start_y = 0;
            }
            else if (start_y + CH.getHeight() - 1 > size.height) {
                start_y = size.height - CH.getHeight() + 1;
            }
            return { start_x, start_y };
        }



        this.currentScene().changed = false;
        if (text) {

            // Remove the last line if it is empty
            if (text[text.length - 1] === "\n") {
                text = text.slice(0, -1);
            }
            // get the position of the frame
            const pos = getPos(size, this.#camera_pos);
            text = text.split("\n").map((line) => {
                const oldSize = CH.getLineWidth(line);
                if (oldSize <= pos.start_x)
                    return CH.hcenter("");
                //const midSize = CH.getLineWidth(line);
                line = CH.getSafeSubstring(line, pos.start_x, pos.start_x + CH.getWidth() - 1);
                //console.log(oldSize, midSize, CH.getLineWidth(line),  pos.start_x, CH.getWidth()-1, pos.start_x + CH.getWidth()-1);
                return line = CH.hcenter(line, CH.getWidth(), " ", "left");
            }).slice(pos.start_y, pos.start_y + CH.getHeight() - this.debug * 5).join("\n")


            const adjusted_size = CH.getSize(text);

            // Fill the screen with spaces vertically
            const delta = (CH.getHeight() - this.debug * 5) - adjusted_size.height;
            for (let i = 0; i < delta; i++) {
                text += "\n" + " ".repeat(CH.getWidth());
            }

            //Add the message box to the frame
            if (this.msgBox.open) {
                const msgBox = this.msgBox.getText();
                const msgBoxLines = msgBox.text.split("\n");
                const msgBoxLength = CH.getSize(msgBox.text);
                text = text.split("\n").map((line, index) => {
                    if (index >= msgBox.pos.y && index < msgBox.pos.y + msgBoxLength.height) 
                    {
                        msgBoxLines[index - msgBox.pos.y].length;
                        line = CH.getSafeSubstring(line,0, msgBox.pos.x - 1) + msgBoxLines[index - msgBox.pos.y] + CH.getSafeSubstring(line, msgBox.pos.x + msgBoxLength.width, CH.getWidth());
                    }
                    return line;
                }).join("\n");
            }

            //print the frame
            CH.write(text);
        }
        

        this.lastFrame = Date.now();
    }

}

export { ConsoleEngine };