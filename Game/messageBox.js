import * as ConsoleImpl from "./Base/ConsoleHelp.js";
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;
const Decorations = ConsoleImpl.Decorations;

const msgbox = (text, title = "", options = [], select = -1) => {

    const w = Math.round(CH.getWidth() / 2);
    const h = Math.round(CH.getHeight() / 4);
    const lines = text.split('\n');
    const start_w = Math.round(w / 2)
    const start_h = Math.round((CH.getHeight() - h) / 2)
  
    let restricted_lines = options.length > 0 ? 1 : 0;
    //top and bottom lines
    const hLine = CH.insert_format({ color:Colors.LIGHTBLACK_EX, decoration: Decorations.Bold },  "+" + "-".repeat(w - 2) + "+");
    //char limiting the box to the sides
    const sidePiece = CH.insert_format({color:Colors.LIGHTBLACK_EX, decoration: Decorations.Bold}, "|");
    let str = hLine + "\n";
    // const info = "w: " + w + " h: " + h + " sw:" + start_w + " sh: " + start_h;
    // str += sidePiece  + CH.hcenter(info, w - 2) + sidePiece + "\n";
    // ADD TITLE
    if (title != "") {
       
        
        restricted_lines++;
        title = CH.insert_format({
            decoration: Decorations.Bold,
        }, title);
        title = CH.hcenter(title, w - 2, " ") ;
    };
    // ADD TEXT
    let textLines = "";
    for (let i = 0; i < h - (2 + restricted_lines); i++) {
        if (lines[i]) {
            CH.breakLine(lines[i], w - 2).split("\n").forEach((line) => {
                    textLines += CH.hcenter(line, w - 2) + "\n";
            });
        }
    }
    textLines = textLines.slice(0, -1); // remove last \n

    const hLen = textLines.split("\n").reduce((acc, line) => {
        return Math.max(acc, CH.getLineWidth(line));
    }, 0);
    textLines = CH.vcenter(textLines, h - (2 + restricted_lines),hLen);

    // ADD OPTIONS
    const optSize = Math.floor((w - 2) / options.length);
    let opts = "";
    for (let i = 0; i < options.length; i++) {
        let line = `${i === select ? "> " : "  "}${options[i]}${i === select ? " <" : "  "}`;
        if (i === select) {
            line = CH.insert_format({
                decoration: Decorations.Bold,
                color: Colors.RED,
            
            }, line);
        }

        line = CH.hcenter(line, optSize, " ");
        opts += line;
    }

    if (title != "")
        textLines = title + "\n" + textLines;
    if (options.length > 0)
        textLines += "\n" + opts;
    const side = (sidePiece + "\n").repeat(h - 3) + sidePiece;
    textLines = CH.merge(side, textLines, { padding: 0 });
    textLines = CH.merge(textLines, side, { padding: 0 });


    str += textLines;

    str += "\n" + hLine;
    // let i = 0;
    
    const box = str.split("\n");
    let final =box.slice(0,1) + "\n";
    const seed = Math.floor(Math.random() * 255);
    final += box.slice(1, -1).map((line) => {
        const start = CH.getSafeSubstring(line, 0, 0);
        const middle = CH.getSafeSubstring(line, 1, -2);
        const end = CH.getSafeSubstring(line, -1);
        return start + CH.insert_format({
            background: Colors.custom_colors(0, true),
        }, middle) + end;
    }).join("\n");
    final += "\n" + box.slice(-1);
    str = final
   




    return { text: str, pos: { x: start_w, y: start_h } }
}

class MsgBoxHandler {
    constructor(text = "", title = "", options = [], select = -1) {
        this.text = text;
        this.title = title;
        this.options = options;
        this.select = select;
        this.open = false;
        this.onSelect = null;
    }
    handleInput(input) {
        //input = -1 to go left and +1 to go right
        // 0 to select
        if (input === -1) {
            this.select--;
            if (this.select < 0) {
                this.select = this.options.length - 1;
            }
        } else if (input === 1) {
            this.select++;
            if (this.select >= this.options.length) {
                this.select = 0;
            }
        } else if (input === 0 && this.select >= 0) {
            this.open = false;
            if (typeof this.onSelect === "function") {
                this.onSelect(this.select);
                this.select = 0;
            }
        }

    }
    raise(text, title = "", options = [], onSelect ) {
        this.text = text;
        this.title = title;
        this.select = 0;
        if (options.length == 0) {
            options = ["OK"];
        }
        this.options = options;
        this.onSelect = onSelect;
        this.open = true;
       
    }
    print()
    {
        const { text, pos } = msgbox(this.text, this.title, this.options, this.select);
        CH.printAtPos(text, pos.x, pos.y);
    }
}

export default MsgBoxHandler;