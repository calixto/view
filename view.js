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
                    'callbackBeforeItem': false,
                    'callbackItem': false,
                    'cleanBeforeInit': false,
                    'methodInsert': 'append'
                }, params);
                return $(this).iterate(options.template, options.collection, options.callbackBeforeItem, options.callbackItem, options.cleanBeforeInit, options.methodInsert);
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
     * Method used to set innerHtml
     * @param {String} property
     * @param {String} value
     * @returns {jQuery}
     */
    $.fn.viewDataHtml = function (property, value) {
        var $this = $(this);
        if (!$(this)[0])
            return $(this);
        $.each($this, function () {
            if($this.attr('data-view-debug')){
                console.log('css:', property, value, $this)
            }
            $this.html(value);
        });
        return $(this);
    };
    
    /**
     * Method used to set innerHtml
     * @param {String} property
     * @param {String} value
     * @returns {jQuery}
     */
    $.fn.viewDataVal = function (property, value) {
        var $this = $(this);
        if (!$(this)[0])
            return $(this);
        $.each($this, function () {
            if($this.attr('data-view-debug')){
                console.log('val:', property, value, $this)
            }
            $this.val(value);
        });
        return $(this);
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
            if($this.attr('data-view-debug')){
                console.log('css:', property, value, $this)
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
    $.fn.viewDataProp = function (property, value) {
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
            if($this.attr('data-view-debug')){
                console.log('prop:', property, value, $this)
            }
            try {
                var fn = eval(attrs[1]);
                $this.prop(attrs[0], fn(value, $this));
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
    $.fn.viewDataAttr = function (property, value) {
        var $this = $(this);
        if (!$this[0])
            return;
        $.each($this, function () {
            var attr = $this.attr('data-attr-' + property);
            if (!attr) {
                console.log($this, 'value of ' + 'data-attr-' + property + ' is not found.');
                return true;
            }
            if($this.attr('data-view-debug')){
                console.log('attr:', property, value, $this)
            }
            var attrs = attr.split('|');
            $.each(attrs, function (j, v) {
                $this.attr(attrs[j], value);
            });
        });
    };
    /**
     * method to create property
     * @param string property
     * @param string value
     * @param string metodo 'html' or 'val'
     * @returns void
     */
    $.fn.viewDataTranslate = function (property, valor, metodo) {
        var $this = $(this);
        if (!$this[0])
            return;
        $.each($this, function () {
            var attr = $this.attr('data-translate-' + metodo + '-' + property);
            if (!attr) {
                console.log($this, 'value of ' + 'data-translate-' + property + ' is not found.');
                return true;
            }
            try{
                if($this.attr('data-view-debug')){
                    console.log('translate-' + metodo + ':', property, valor, $this)
                }
                $descriptor = $(attr);
                if($descriptor.is('select')){
                    $this[metodo](
                        $descriptor.find('option').filter(function(){
                            return $(this).val() == valor;
                        }).text()
                    )
                }
            }catch (e) {
                try{
                    translator = eval(attr)
                }catch(exc){
                    console.log('Erro ao compilar translate: ' + attr + ': ' + exc)
                }
            }
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
                console.log($el, 'value of ' + 'data-replace-' + property + ' is not found.');
                return true;
            }
            if($this.attr('data-view-debug')){
                console.log('attr:', $this, property, valor)
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
     *      Samples:
     *      <script>
     *      var data = {'ST_LINK_PAGINA':'https://jquery.org/', 'DS_TEXTO':'Página da jQuery', 'ID_PESSOA':'335'};
     *      $('.target').assign(data);
     *      </script>
     *      <div class='target'>
     *          <a data-attr-ST_LINK_PAGINA="href" data-html-DS_TEXTO></a>
     *          <input type="text" data-val-ID_PESSOA />
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
        if ($this.attr('data-view-debug') == 'object'){
            console.log($this, obj)
        }
        if (fnDebug) {
            for (var i in obj) {
                if ($this.attr('data-view-debug') == 'object'){
                    console.log(i)
                }
                var $html = $this.findMeToo('[data-html-' + i + ']');
                $html.viewDataHtml(i, obj[i]);
                fnDebug($html, obj[i], 'html', i);
                var $val = $this.findMeToo('[data-val-' + i + ']');
                $val.viewDataVal(i, obj[i]);
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
                var $attr = $this.findMeToo('[data-translate-val-' + i + ']');
                $attr.viewDataTranslate(i, obj[i],'val');
                fnDebug($attr, obj[i], 'translate', i);
                var $attr = $this.findMeToo('[data-translate-html-' + i + ']');
                $attr.viewDataTranslate(i, obj[i],'html');
                fnDebug($attr, obj[i], 'translate', i);
                var $replace = $this.findMeToo('[data-replace-' + i + ']');
                $replace.viewStoreBeforeReplace();
                $replace.viewDataReplace(i, obj[i]);
                fnDebug($replace, obj[i], 'replace', i);
            }
        } else {
            for (var i in obj) {
                $this.findMeToo('[data-html-' + i + ']').viewDataHtml(i, obj[i]);
                $this.findMeToo('[data-val-' + i + ']').viewDataVal(i, obj[i]);
                $this.findMeToo('[data-attr-' + i + ']').viewDataAttr(i, obj[i]);
                $this.findMeToo('[data-prop-' + i + ']').viewDataProp(i, obj[i]);
                $this.findMeToo('[data-css-' + i + ']').viewDataCss(i, obj[i]);
                $this.findMeToo('[data-translate-val-' + i + ']').viewDataTranslate(i, obj[i], 'val');
                $this.findMeToo('[data-translate-html-' + i + ']').viewDataTranslate(i, obj[i], 'html');
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
     * @param string jquery method for insert item
     * @returns jQuery
     */
    $.fn.iterate = function ($tpl, collection, callbackBeforeItem, callbackItem, cleanBeforeInit, methodInsert, callbackDebug) {
        var $this = this;
        cleanBeforeInit = cleanBeforeInit || false;
        methodInsert = methodInsert || 'append';
        if (cleanBeforeInit) {
            $this.html('');
        }
        if(!callbackBeforeItem && !callbackItem){
            $.each(collection, function (i, v) {
                $this[methodInsert]($tpl.clone(true).assign(collection[i]))
            });
        }else{
            callbackItem = callbackItem ?  callbackItem : () => {};
            callbackBeforeItem = callbackBeforeItem ?  callbackBeforeItem : () => {};
            $.each(collection, function (i, v) {
                var $clone = $tpl.clone(true);
                callbackBeforeItem($clone, collection[i]);
                $this[methodInsert]($clone.assign(collection[i]), callbackDebug)
                callbackItem($clone, collection[i]);
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
