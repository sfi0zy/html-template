import DEPENDENCIES from './dependencies';
import POLYFILLS    from './polyfills';
import UTILS        from './utils';
import MODULES      from './modules';

const GLOBAL_PREFIX = 'ui-';


document.addEventListener('DOMContentLoaded', () => {
    console.log(`__PROJECT__ = ${__PROJECT__}`);
    console.log(`__PROJECT_VERSION__ = ${__PROJECT_VERSION__}`);
    console.log(`__DEBUG__ = ${__DEBUG__}`);

    if (!window.Muilessium) {
        console.log('Muilessium is not defined. Include muilessium.min.js before this.');
    }

    const $ = window.Muilessium;
    const _ = window.Muilessium.UTILS;

    $.DEPENDENCIES = _.extend($.DEPENDENCIES, DEPENDENCIES);
    $.POLYFILLS    = _.extend($.POLYFILLS,    POLYFILLS);
    $.UTILS        = _.extend($.UTILS,        UTILS);
    $.MODULES      = MODULES;

    function addComponents() {
        const components = require('./components/index').default;

        _.forEach(Object.keys(components), (type) => {
            $.FACTORY.registerComponent(type, components[type]);
            $.FACTORY.create(type, `.${GLOBAL_PREFIX}${_.toLispCase(type)}`, {});
        });
    }

    addComponents();

    console.log($);
});

