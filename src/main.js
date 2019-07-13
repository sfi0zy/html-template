import DEPENDENCIES from './dependencies';
import POLYFILLS    from './polyfills';
import UTILS        from './utils';
import MODULES      from './modules';

const GLOBAL_PREFIX = 'ui-';


document.addEventListener('DOMContentLoaded', () => {
    if (!window.Muilessium) {
        console.log('Muilessium is not defined. Include muilessium.min.js before this.');
    }

    const $ = Muilessium;
    const _ = $.UTILS;

    Muilessium.DEPENDENCIES = _.extend($.DEPENDENCIES, DEPENDENCIES);
    Muilessium.POLYFILLS    = _.extend($.POLYFILLS,    POLYFILLS);
    Muilessium.UTILS        = _.extend($.UTILS,        UTILS);
    Muilessium.MODULES      = MODULES;

    function addComponents() {
        const components = require('./components/index').default;

        _.forEach(Object.keys(components), (type) => {
            $.FACTORY.registerComponent(type, components[type]);
            $.FACTORY.create(type, `.${GLOBAL_PREFIX}${_.toLispCase(type)}`, {});
        });
    }

    addComponents();
});

