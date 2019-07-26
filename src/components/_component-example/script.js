// -----------------------------------------------------------------------------
// Component Example
// -----------------------------------------------------------------------------

const $ = window.Muilessium;
const _ = $.UTILS;

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

