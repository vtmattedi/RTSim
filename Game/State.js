class State {
    constructor(onCreate, render, changeState, onSelect) {
        if (onCreate)
            this.onCreate = onCreate;
        if (render)
            this.render = render;
        if (changeState)
            this.changeState = changeState;
        if (onSelect)
            this.onSelect = onSelect;
    }
    
    onCreate = () => {

    }
    
    changeState = (input) => {

    }

    render = (current_option) => {

    }
    
    onSelect(key) {
    }

    rerender = () => {
        this.onCreate();
        this.render();

    }

}

export { State };