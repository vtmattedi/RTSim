import * as ConsoleImpl from  '../ConsoleHelp.js';
const CH = new ConsoleImpl.BasicConsole();
const Colors = ConsoleImpl.DefaultColors;


class Logos {
    static get MattediWorks() {
        return `
 __  __         _    _             _  _ __          __           _         
|  \\/  |       | |  | |           | |(_)\\ \\        / /          | |        
| \\  / |  __ _ | |_ | |_  ___   __| | _  \\ \\  /\\  / /___   _ __ | | __ ___ 
| |\\/| | / _\` || __|| __|/ _ \\ / _\` || |  \\ \\/  \\/ // _ \\ | '__|| |/ // __|
| |  | || (_| || |_ | |_|  __/| (_| || |   \\  /\\  /| (_) || |   |   < \\__ \\
|_|  |_| \\__,_| \\__| \\__|\\___| \\__,_||_|    \\/  \\/  \\___/ |_|   |_|\\_\\|___/
`}
static get Mattedi()
        {
    return ` __  __         _    _             _  _ 
|  \\/  |       | |  | |           | |(_)
| \\  / |  __ _ | |_ | |_  ___   __| | _ 
| |\\/| | / _\` || __|| __|/ _ \\ / _\` || |
| |  | || (_| || |_ | |_|  __/| (_| || |
|_|  |_| \\__,_| \\__| \\__|\\___| \\__,_||_|`}
static get Works() {
    return `__          __           _         
\\ \\        / /          | |        
 \\ \\  /\\  / /___   _ __ | | __ ___ 
  \\ \\/  \\/ // _ \\ | '__|| |/ // __|
   \\  /\\  /| (_) || |   |   < \\__ \\
    \\/  \\/  \\___/ |_|   |_|\\_\\|___/`}

    static get ConsoleAdventure() {
        return `
    ___                      _          _       _                 _                  
   / __\\___  _ __  ___  ___ | | ___    /_\\   __| |_   _____ _ __ | |_ _   _ _ __ ___ 
  / /  / _ \\| '_ \\/ __|/ _ \\| |/ _ \\  //_\\\\ / _\` \\ \\ / / _ | '_ \\| __| | | | '__/ _ \\
 / /__| (_) | | | \\__ | (_) | |  __/ /  _  | (_| |\\ V |  __| | | | |_| |_| | | |  __/
/____/ \\___/|_| |_|___/\\___/|_|\\___| \\_/ \\_/\\__,_| \\_/ \\___|_| |_|\\__|\\__,_|_|  \\___|
                                                                                  
`}
    static get ca_cutoff() { return 36 }
    static get mw_cutoff() { return 39 }

    static animatedSynced = (logo, ms, color = { color: Colors.RED, index: 1, bgcolor: Colors.YELLOW }, center = true) => {
        CH.show_cursor(false);
        let textArray = logo.split('\n');
        //center line and compensate for the new width
        if (center) {
            const old_len = Math.max(...textArray.map((item) => item.length));
            for (let i = 0; i < textArray.length; i++) {
                textArray[i] = CH.hcenter(textArray[i], CH.getWidth());
            }
            const w_diff = (textArray[1].length - old_len)
            color.index = Math.round(w_diff / 2) + color.index;

        }
        const hval = Math.max(...textArray.map((item) => item.length));
        const width = CH.getWidth();
        const get_partial = (sprite, index) => {

            let res = '';
            sprite.forEach(element => {
                let line = element.substring(0, index);
                if (color) {
                    line = CH.insert_color(color.bgcolor, line.substring(0, color.index)) + CH.insert_color(color.color, line.substring(color.index));
                }
                res += CH.hcenter(line, width);
                res += '\n';
            });

            return res;
        }


        for (let i = 0; i < hval; i++) {
            let start = Date.now();
            CH.clear_screen();
            CH.print(get_partial(textArray, i + 1));
            while (Date.now() - start < ms) { }
        }

    }

    static animate = (logo, ms, color = { color: Colors.RED, index: 1, bgcolor: Colors.YELLOW }, center = true, callback) => {
    
        CH.show_cursor(false);
        let textArray = logo.split('\n');
        //center line and compensate for the new width
        if (center) {
            const old_len = Math.max(...textArray.map((item) => item.length));
            for (let i = 0; i < textArray.length; i++) {
                textArray[i] = CH.hcenter(textArray[i], CH.getWidth());
            }
            const w_diff = (textArray[1].length - old_len)
            if (color)
                color.index = Math.round(w_diff / 2) + color.index;
        }
        const hval = Math.max(...textArray.map((item) => item.length));
        const width = CH.getWidth();
        const get_partial = (sprite, index) => {

            let res = '';
            sprite.forEach(element => {
                let line = element.substring(0, index);
                if (color) {
                    line = CH.insert_color(color.bgcolor, line.substring(0, color.index)) + CH.insert_color(color.color, line.substring(color.index));
                }
                res += CH.hcenter(line, width);
                res += '\n';
            });

            return res;
        }

        const render = (index) => {
            CH.clear_screen();
            CH.print(get_partial(textArray, index + 1));
            if (index < hval) {
                setTimeout(() => {
                    render(index + 1);
                }, ms);
            }
            else {
                if (callback) {
                    callback();
                }
            }
        }

        setTimeout(() => {
            render(1);
        }, ms);
    
    }


    static paintedConsoleAdventure = (center = true) => {
        let logo_sprite = Logos.ConsoleAdventure.split('\n');//Get Lines
        const max_len = Math.max(...logo_sprite.map((item) => item.length));//Max h length
        logo_sprite = logo_sprite.map((item) => item.padEnd(max_len, ' '));//Pad all lines to max length
        const old_len = logo_sprite[1].length;
        let cut_off = Logos.ca_cutoff;

        if (center) {
            for (let i = 0; i < logo_sprite.length; i++) {
                logo_sprite[i] = CH.hcenter(logo_sprite[i], CH.getWidth());
            }
            cut_off = Math.round((logo_sprite[1].length - old_len) / 2) + cut_off;
        }
        return logo_sprite.map((item) => CH.insert_color(Colors.YELLOW, item.substring(0, cut_off)) + CH.insert_color(Colors.GREEN, item.substring(cut_off))).join('\n');
    }
    static paintedMattediWorks = (center = true, colors = { color1: 39, color2: 208 }) => {
        let logo_sprite = Logos.MattediWorks.split('\n');
        const max_len = Math.max(...logo_sprite.map((item) => item.length));
        logo_sprite = logo_sprite.map((item) => item.padEnd(max_len, ' '));
        const old_len = logo_sprite[1].length;
        let cut_off = Logos.mw_cutoff + 1;

        if (center) {
            for (let i = 0; i < logo_sprite.length; i++) {
                logo_sprite[i] = CH.hcenter(logo_sprite[i], CH.getWidth());
            }
            cut_off = Math.floor((logo_sprite[1].length - old_len) / 2) + cut_off;

        }

        return logo_sprite.map((item) => CH.insert_color(Colors.custom_colors(colors.color1), item.substring(0, cut_off)) + CH.insert_color(Colors.custom_colors(colors.color2), item.substring(cut_off))).join('\n');
    }
};

class GenieSprite {
    static #image_1 =
        `⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣠⣄⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⡿⢿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠹⠿⠛⣁⣤⣤⣈⠛⠿⠏⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣤⣴⣶⣤⣈⠙⠻⠟⠋⣁⣤⣶⣦⣤⣀⠀⠀⠀⠀
⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⠀
⣾⣿⣿⣿⣿⣿⣧⣀⣀⣀⣀⣀⡀⠀⢀⣀⣠⣿⣿⣿⣿⣿⣿⣷
⠙⠿⣿⣿⣿⣿⣿⣿⠿⠿⠋⠁⠀⠶⢿⣿⣿⣿⣿⣿⣿⠿⠿⠋
⠀⠀⠀⠀⠀⣀⣀⣤⣤⣶⣾⣿⣷⣶⣤⣤⣀⣀⣀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⠿⠟⠛⢉⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⢤⣤⣶⣾⣿⣿⣿⣶⣶⣶⠶⠒⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠙⠛⠉⠉⠉⠀⠀⠀⠀`;
    static #image_2 = `
⠀⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣿⠟⠋⣉⣉⠙⠻⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠉⢠⣾⣿⣿⣷⡄⠉⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣤⡄⠘⣿⣿⣿⣿⠃⢠⣤⣄⡀⠀⠀⠀
⠀⢀⣴⣿⣿⣿⣿⣦⣈⠉⠉⣁⣴⣿⣿⣿⣿⣷⣄⠀
⠀⣾⣿⣿⣿⡿⠛⠛⠛⠛⠛⠛⠛⠛⢿⣿⣿⣿⣿⣧
⢸⣿⣿⣿⣿⣷⣤⣤⣤⡄⢠⣤⣤⣤⣾⣿⣿⣿⣿⣿
⠀⢻⣿⣿⣿⣿⣿⣿⡿⠁⠀⢻⣿⣿⣿⣿⣿⣿⣿⠏
⠀⠀⠙⠻⠿⠿⠟⠛⢁⣼⣷⣄⠙⠛⠿⠿⠿⠟⠁⠀
⠀⠀⠀⠀⠠⣤⣶⣾⣿⣿⣿⣿⣿⣶⣶⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣄⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⢿⣿⣿⣿⣿⣷⠄`;

    static getSprite(value) {
        if (typeof value === `boolean`)
            return value ? GenieSprite.#image_1 : GenieSprite.#image_2;
        const genie_seed = Math.random() > 0.5;//50-50 chance
        if (genie_seed) {
            return GenieSprite.#image_1;
        }
        else
            return CH.vcenter(GenieSprite.#image_2.split('\n'), GenieSprite.#image_1.split('\n').length, Math.max(...GenieSprite.#image_1.split('\n').map(line => line.length))).join('\n');
    }
}


export default
{
    Logos,
    GenieSprite,
}