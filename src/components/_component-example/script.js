const $            = Muilessium;
const _            = $.UTILS;
const STORE        = $.STORE;
const EVENTS       = $.EVENTS;
const MOUSE        = $.MOUSE;
const KEYBOARD     = $.KEYBOARD;
const TOUCHPAD     = $.TOUCHPAD;
const POLYFILLS    = $.POLYFILLS;
const DEPENDENCIES = $.DEPENDENCIES;


export default class ComponentExample extends $.FACTORY.BaseComponent {
    constructor(element, options) {
        super(element, options);

        this.domCache = _.extend(this.domCache, {

        });

        this.state = _.extend(this.state, {

        });

        this.initAria();
        this.initControls();
        this.initEvents();
    }

    initAria() {
        return this;
    }

    initControls() {
        return this;
    }

    initEvents() {
        return this;
    }

    someCustomMethod() {
        // . . .
    }
}

