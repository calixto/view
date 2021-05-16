/*
 *	Copyright 2015 Calixto Jorge calixto.jorge@gmail.com
 *
 *	Licensed under the Apache License, Version 2.0 (the "License");
 *	you may not use this file except in compliance with the License.
 *	You may obtain a copy of the License at
 *	
 *	    http://www.apache.org/licenses/LICENSE-2.0
 *	
 *	Unless required by applicable law or agreed to in writing, software
 *	distributed under the License is distributed on an "AS IS" BASIS,
 *	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	See the License for the specific language governing permissions and
 *	limitations under the License.
 */

(function ($) {
    /**
     * A router method of this plugin
     * @param {String} method
     * @param {Json} params
     * @returns {Json}
     */
    $.fn.view = function (method, params, callbackDebug) {
        switch (method) {
            case 'assign':
                return $(this).assign(params, callbackDebug);
                break;
            case 'unreplace':
                return $(this).viewDataUnreplace();
                break;
            case 'extract':
                return $(this).extract(params, callbackDebug);
            case 'iterate':
                var options = $.extend({
                    'template': $(),
                    'collection': [],
                    'callbackItem': false,
                    'cleanBeforeInit': false
                }, params);
                return $(this).iterate(options.template, options.collection, options.callbackItem, options.cleanBeforeInit);
                break;
            case 'extractCollection':
                var options = $.extend({
                    'valueObject': {},
                    'selector': ''
                }, params);
                return $(this).extractCollection(options.valueObject, options.selector, callbackDebug);
        }
    };


    /**
     * Default find and add $(this) too if selector found
     * @param {type} selector
     * @returns {jQuery}
     */
    $.fn.findMeToo = function (selector) {
        if ($(this).is(selector)) {
            return $(this).add($(this).find(selector));
        } else {
            return $(this).find(selector);
        }
    };
    /**
     * Method used to set css
     * @param {String} property
     * @param {String} value
     * @returns {jQuery}
     */
    $.fn.viewDataCss = function (property, value) {
        var $this = $(this);
        if (!$(this)[0])
            return $(this);
        $.each($this, function () {
            var attr = $this.attr('data-css-' + property);
            if (!attr) {
                console.log($this, 'value of ' + 'data-css-' + property + ' is not found.');
                return true;
            }
            var attrs = attr.split('|');
            $.each(attrs, function (j, v) {
                $this.css(attrs[j], value);
            });
        });
        return $(this);
    };

    /**
     * Method used to set property
     * @param string property
     * @param string value
     * @returns void
     */
    $.fn.viewDataProp = function (property, valor) {
        var $this = $(this);
        if (!$this[0])
            return;
        $.each($this, function () {
            var attr = $this.attr('data-prop-' + property);
            if (!attr) {
                console.log($this, 'not found value of: ' + 'data-prop-' + property);
                return true;
            }
            var attrs = attr.split('|');
            if (attrs.length < 2) {
                console.log($this, 'not found value of: ' + 'data-prop-' + property + ' expected something like "checked|functionValidateCheck"');
                return true;
            }
            ;
            try {
                var fn = eval(attrs[1]);
                $this.prop(attrs[0], fn(valor, $this));
            } catch (e) {
                console.log($this, 'it was not possible to apply in ' + 'data-prop-' + property + ' property ' + attrs[0] + ' or function ' + attrs[1] + ' not exists.');
            }
        });
    };
    /**
     * method to create property
     * @param string property
     * @param string value
     * @returns void
     */
    $.fn.viewDataAttr = function (property, valor) {
        var $this = $(this);
        if (!$this[0])
            return;
        $.each($this, function () {
            var attr = $this.attr('data-attr-' + property);
            if (!attr) {
                console.log($this, 'value of ' + 'data-attr-' + property + ' is not found.');
                return true;
            }
            var attrs = attr.split('|');
            $.each(attrs, function (j, v) {
                $this.attr(attrs[j], valor);
            });
        });
    };
    $.fn.viewDataUnreplace = function () {
        $.each($(this), function () {
            var $this = $(this);
            $.each($this.findMeToo('[data-view-replaced="true"]'), function () {
                $el = $(this);
                $.each($el.data('data-view-attrs-replaced'), function (attribute, value) {
                    $el.attr(attribute, value);
                });
            });
        });
        return $(this);
    };
    $.fn.viewStoreBeforeReplace = function () {
        $.each($(this), function () {
            var $this = $(this);
            if (!$this.attr('data-view-replaced')) {
                var replace = {};
                var reg = /^data-replace/;
                $.each($this, function () {
                    $.each(this.attributes, function () {
                        var attribute = this;
                        if (reg.test(attribute.name)) {
                            $.each($this.attr(attribute.name).split('|'), function (i, configured) {
                                replace[configured] = $this.attr(configured);
                            });
                        }
                    });
                });
                $this.data('data-view-attrs-replaced', replace);
                $this.attr('data-view-replaced', 'true');
            }

        });
    };
    /**
     * method to replace of property
     * @param string property
     * @param string value
     * @returns void
     */
    $.fn.viewDataReplace = function (property, valor) {
        var $this = $(this);
        if (!$this[0])
            return;
        $.each($this, function () {
            var $el = $(this);
            var attr = $el.attr('data-replace-' + property);
            if (!attr) {
                console.log($el, 'value of ' + 'data-attr-' + property + ' is not found.');
                return true;
            }
            var attrs = attr.split('|');
            $.each(attrs, function (j, attr) {
                $el.attr(attr, $el.attr(attr).replaceAll('{' + property + '}', valor));
            });
        });
    };
    /**
     * Assign values of json object in to jquery object
     * <element  data-val-{index} to execute jquery "val" method in element
     * <element data-html-{index} to execute jquery "html" method in element
     * <element data-attr-{index}="{new-attribute-name}" adds the element of the index value in the attribute-related
     * <element data-attr-{index}="{new-attribute-name|[callback-for-value-in]}" adds the element of the index value in the attribute related, with callback for value
     * <element data-prop-{index}="{property-name}" set element property
     * <element data-prop-{index}="{property-name|callback-for-value-in}" set element property, with callback for value
     * <element data-replace-{index}="{attr-name}" replace value of index on attribute element property, with callback for value
     *      Samples:
     *      <script>
     *      var data = {'ST_LINK_PAGINA':'https://jquery.org/', 'DS_TEXTO':'Página da jQuery', 'ID_PESSOA':'335'};
     *      $('.target').assign(data);
     *      </script>
     *      <div class='target'>
     *          <a data-attr-ST_LINK_PAGINA="href" data-html-DS_TEXTO></a>
     *          <input type="text" data-val-ID_PESSOA />
     *          <input type="checkbox" 
     *                 data-replace-ST_LINK_PAGINA="title" 
     *                 data-replace-ID_PESSOA="name|title" 
     *                 name="mycheck{ID_PESSOA}" 
     *                 title="This is my check: {ID_PESSOA} linked on {ST_LINK_PAGINA}" 
     *                 />
     *      </div>
     *      will be executed on <a> tag:
     *          $(this).find('[data-attr-ST_LINK_PAGINA="href"]').attr('href',ST_LINK_PAGINA);
     *          $(this).find('[data-html-DS_TEXTO]').html(DS_TEXTO);
     *      will be executed on <input> tag:
     *          $(this).find('[data-val-ID_PESSOA]').val(ID_PESSOA);
     * @param Object json
     * @param function to debug
     * @returns jQuery
     */
    $.fn.assign = function (obj, fnDebug) {
        var $this = $(this);
        fnDebug = fnDebug || function () {
        };
        if (!$this.length)
            return;
        if (fnDebug) {
            for (var i in obj) {
                var $html = $this.findMeToo('[data-html-' + i + ']');
                $html.html(obj[i]);
                fnDebug($html, obj[i], 'html', i);
                var $val = $this.findMeToo('[data-val-' + i + ']');
                $val.val(obj[i]);
                fnDebug($val, obj[i], 'val', i);
                var $attr = $this.findMeToo('[data-attr-' + i + ']');
                $attr.viewDataAttr(i, obj[i]);
                fnDebug($attr, obj[i], 'attr', i);
                var $prop = $this.findMeToo('[data-prop-' + i + ']');
                $prop.viewDataProp(i, obj[i]);
                fnDebug($prop, obj[i], 'prop', i);
                var $css = $this.findMeToo('[data-css-' + i + ']');
                $css.viewDataCss(i, obj[i]);
                fnDebug($css, obj[i], 'css', i);
                var $replace = $this.findMeToo('[data-replace-' + i + ']');
                $replace.viewStoreBeforeReplace();
                $replace.viewDataReplace(i, obj[i]);
                fnDebug($replace, obj[i], 'replace', i);
            }
        } else {
            for (var i in obj) {
                $this.findMeToo('[data-html-' + i + ']').html(obj[i]);
                $this.findMeToo('[data-val-' + i + ']').val(obj[i]);
                $this.findMeToo('[data-attr-' + i + ']').viewDataAttr(i, obj[i]);
                $this.findMeToo('[data-prop-' + i + ']').viewDataProp(i, obj[i]);
                $this.findMeToo('[data-css-' + i + ']').viewDataCss(i, obj[i]);
                $this.findMeToo('[data-replace-' + i + ']').viewStoreBeforeReplace();
                $this.findMeToo('[data-replace-' + i + ']').viewDataReplace(i, obj[i]);
            }
        }
        return $this;
    };
    /**
     * returns a result set for each item found
     * @param json attributes for search
     * @param string selector for item
     * @param function to debug
     * @returns Array with json objects
     */
    $.fn.extractCollection = function (obj, seletor, fn) {
        var res = [];
        $.each($(this).find(seletor), function () {
            res.push($(this).extract($.extend(true, {}, obj), fn));
        });
        return res;
    };
    /**
     * returns a json completed for element
     * @param Object json
     * @param function to debug
     * @returns Object json
     */
    $.fn.extract = function (objeto, fn) {
        fn = fn || function () {
        };
        var $this = $(this);
        if (!$this[0])
            return objeto;
        if (fn) {
            for (var i in objeto) {
                var attr = $this.findMeToo('[data-' + i + ']').attr('data-' + i);
                var val = $this.findMeToo('[data-val-' + i + ']').val();
                var html = $this.findMeToo('[data-html-' + i + ']').html();
                objeto[i] = attr ? attr : (val ? val : (html ? html : null));
                fn(i, objeto[i], attr, val, html);
            }
        } else {
            for (var i in objeto) {
                var attr = $this.findMeToo('[data-' + i + ']').attr('data-' + i);
                var val = $this.findMeToo('[data-val-' + i + ']').val();
                var html = $this.findMeToo('[data-html-' + i + ']').html();
                objeto[i] = attr ? attr : (val ? val : (html ? html : null));
            }
        }
        return objeto;
    };
    /**
     * Fills the element with several templates filled with the collection object
     * @param jQuery template for to cloning in loop
     * @param Array collection of json for assign in template
     * @param function for callback in item loop
     * @param boolean to clean before init operation
     * @returns jQuery
     */
    $.fn.iterate = function ($tpl, collection, callbackItem, cleanBeforeInit, callbackDebug) {
        var $this = this;
        cleanBeforeInit = cleanBeforeInit || false;
        if (cleanBeforeInit) {
            $this.html('');
        }
        if (callbackItem) {
            $.each(collection, function (i, v) {
                var $clone = $tpl.clone(true);
                $this.append($clone.assign(collection[i]), callbackDebug)
                callbackItem($clone, collection[i]);
            });
        } else {
            $.each(collection, function (i, v) {
                $this.append($tpl.clone(true).assign(collection[i]))
            });
        }
        return $this;
    };
})(jQuery);

/**
 * Replace all occurrences of a string
 * @param string search
 * @param string replacement
 * @returns {String}
 */
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
