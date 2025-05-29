import { Scene } from '../Engine/Scenes.js';
import { BasicConsole, Decorations, DefaultColors } from '../Engine/ConsoleHelp.js';
import Assets from '../Engine/Assets/Assets.js';
import SceneAlias from './Alias.js';
import { Arrows } from '../Engine/Symbols.js';
import { getFiGlet, mergeChars, mergeFiGlet } from '../Engine/Assets/Fonts.js';
const Colors = DefaultColors;
const CH = new BasicConsole();
const sprites = {
  normal: [" \n/", "_\n ", "_\n ", "_\n ", " \n\\", " \n_", " \n_", " \n_"],
  back: [" \n/", " \n_", " \n_", " \n_", " \n\\", "_\n ", "_\n ", "_\n "]
}
class welcomeScreen extends Scene {
  constructor(animation_ms = 100) {
    super();
    this.timer = null;
    this.animation_ms = animation_ms;
    this.animIndex = 0;
  }
  onEnter() {
    if (this.animation_ms <= 0 || this.timer) {
    };
    this.timer = setInterval(() => {
      this.animIndex++;
      if (this.animIndex > CH.getWidth() * 2) {
        this.animIndex = 0;
      }
    }, this.animation_ms);
  }
  onExit() {
    clearInterval(this.timer);
    this.timer = null;
  }

  draw() {
    const perfectpaintedMw = CH.getWidth() > 75 ? CH.merge(
      CH.paint(Assets.Logos.Mattedi, Colors.custom_colors(39)),
      CH.paint(Assets.Logos.Works, Colors.custom_colors(208)),
      { padding: 0 }) : CH.paint(Assets.Logos.Mattedi, Colors.custom_colors(39)) + "\n" + CH.paint(Assets.Logos.Works, Colors.custom_colors(208));
    // const final = perfectpaintedMw.split("\n").slice(0,-1).join("\n");

    let text = CH.hcenter(perfectpaintedMw);
    text += "\n";
    const title = CH.getWidth() > 93 ? "Scheduler Simulator" : "Scheduler\nSimulator";
    let titleText = "";

    for (let i = 0; i < title.length; i++) {
      if (title[i] === "\n") {
        text += CH.hcenter(titleText) + "\n";
        titleText = "";
        continue;
      }
      const maxSeed = 9;
      let  seed  = maxSeed - Math.floor(Date.now() / 100) % (maxSeed + 1);
      // if (seed >= maxSeed/2){
      //   seed = maxSeed - seed;
      // }
      
      let dist = i >= 9 ? (i-9)  : ( 9 - i) ;
      dist = (dist + seed) % (maxSeed + 1);
      
      

      titleText = CH.merge(
        titleText,
        CH.paint(getFiGlet(title[i]), Colors.custom_colors(245 + dist )),
        {
          padding: 0,
          align: "bottom",
        }
      );
    }
    text += CH.hcenter(titleText);
   
    text += "\n\n\n";
    
    text += CH.matchAndReplace("Press Space to start.",
      [{ text: "Space", format: { color: Colors.custom_colors(39), decoration: Decorations.Bold } }]
    );
    text = CH.hcenter(text);
    if (this.timer === null) {
      return text;
    }
    text += "\n".repeat(8);
    const colors = [
      Colors.custom_colors(7),
      Colors.custom_colors(255),
      Colors.custom_colors(244),
      Colors.custom_colors(238),
    ]
    let spr = "";
    for (let i = 0; i < 4; i++) {
      let index = this.animIndex - i;
      let back = false;
      if (index > CH.getWidth()) {
        index = index - CH.getWidth();
        back = true;
      }
      if (index < 0) {
        index = CH.getWidth() + index;
        back = true;
      }
      let char = sprites[back ? "back" : "normal"][index % 8];
      if (i === 0) {
        char = char.replace("/", back ? Arrows.downLeft : Arrows.upRight);
        char = char.replace("\\", back ? Arrows.upLeft : Arrows.downRight);
        char = char.replace("_", back ? Arrows.left : Arrows.right);
      }
      char = char.replace("_", "-");
      spr = back ? CH.merge(
        spr,
        CH.paint(char, colors[i]),
        { padding: 0, align: "bottom" }
      ) :
        CH.merge(
          CH.paint(char, colors[i]),
          spr,
          { padding: 0, align: "bottom"  }
        );
    }
    let dist = this.animIndex > CH.getWidth() ? CH.getWidth() * 2 - this.animIndex : this.animIndex;
    dist = dist >= 4 ? dist - 4 : 0;
    const sep = " ".repeat(dist) + "\n" + " ".repeat(dist);
    spr = CH.merge(
      sep,
      spr,
      { padding: 0 }
    );
    let t = "";
    for (let i = 0; i < CH.getWidth(); i++) {
      t += " ";
    }
    text += "\n" + CH.hcenter(spr, CH.getWidth(), " ", 1) + "\n";
    return text;

  }
  handleInput(input) {
    if (input === "enter" || input === "space") {
      return SceneAlias.mainMenu;
    }
  }
}

export { welcomeScreen };