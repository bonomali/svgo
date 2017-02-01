'use strict';

exports.type = 'perItem';

exports.active = true;

exports.description = 'removes specified attributes';

exports.params = {
};

exports.fn = function(item, params) {
    function descend(d) {
        if (['text', 'tspan'].indexOf(d.local) >= 0) {
            return true;
        }
        if (d.content) {
            for (var i = 0; i < d.content.length; i++) {
                if (descend(d.content[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    var attrsToRemove = ['color', 'font-family'];
    if (!attrsToRemove.some(function(a) {
        return item.hasAttr(a);
    })) {
        return;
    }

    if (descend(item)) {
        return;
    }

    attrsToRemove.forEach(function(a) {
        item.removeAttr(a);
    });
};
