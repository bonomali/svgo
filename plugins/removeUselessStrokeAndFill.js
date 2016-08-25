'use strict';

exports.type = 'perItem';

exports.active = true;

exports.description = 'removes useless stroke and fill attributes';

exports.params = {
    stroke: true,
    fill: true
};

var shape = require('./_collections').elemsGroups.shape,
    regStrokeProps = /^stroke/,
    regFillProps = /^fill-/,
    styleOrScript = ['style', 'script'],
    hasStyleOrScript = false;

/**
 * Remove useless stroke and fill attrs.
 *
 * @param {Object} item current iteration item
 * @param {Object} params plugin params
 * @return {Boolean} if false, item will be filtered out
 *
 * @author Kir Belevich
 */
exports.fn = function(item, params) {

    if (item.isElem(styleOrScript)) {
        hasStyleOrScript = true;
    }

    if (!hasStyleOrScript && item.isElem(shape) && !item.computedAttr('id')) {

        var stroke = params.stroke && item.computedAttr('stroke'),
            fill = params.fill && !item.computedAttr('fill', 'none');
        var missing = [];

        // remove stroke*
        if (
            params.stroke &&
            (!stroke ||
                stroke == 'none' ||
                item.computedAttr('stroke-opacity', '0') ||
                item.computedAttr('stroke-width', '0')
            )
        ) {
            var parentStroke = item.parentNode.computedAttr('stroke'),
                declineStroke = parentStroke && parentStroke != 'none';

            item.eachAttr(function(attr) {
                if (regStrokeProps.test(attr.name)) {
                    item.removeAttr(attr.name);
                }
            });

            if (declineStroke) item.addAttr({
                name: 'stroke',
                value: 'none',
                prefix: '',
                local: 'stroke'
            });

            missing.push('stroke');
        }

        // remove fill*
        if (
            params.fill &&
            (!fill || item.computedAttr('fill-opacity', '0'))
        ) {
            item.eachAttr(function(attr) {
                if (regFillProps.test(attr.name)) {
                    item.removeAttr(attr.name);
                }
            });

            if (fill) {
                if (item.hasAttr('fill'))
                    item.attr('fill').value = 'none';
                else
                    item.addAttr({
                        name: 'fill',
                        value: 'none',
                        prefix: '',
                        local: 'fill'
                    });
            }

            missing.push('fill');
        }

        // remove paint-order if it is the default order
        if (item.hasAttr('paint-order')) {
            if (
                !item.hasAttr('marker-start') &&
                !item.hasAttr('marker-mid') &&
                !item.hasAttr('marker-end')
            ) {
                missing.push('markers');
            }

            var parts = item.attr('paint-order').value.split(/\s+/);
            for (var i = 0; i < missing.length; i++) {
                var index = parts.indexOf(missing[i]);
                if (index >= 0) {
                    parts.splice(index, 1);
                }
            }

            var result = parts.join(' ');
            if ([
                'fill stroke markers',
                'fill stroke', 'fill markers', 'stroke markers',
                'fill', 'stroke', 'markers', ''
            ].indexOf(result) >= 0) {
                item.removeAttr('paint-order');
            } else {
                item.attr('paint-order').value = result;
            }
        }
    }

};
