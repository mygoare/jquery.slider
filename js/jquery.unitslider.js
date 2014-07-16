/**
 * version: 1.0.1
 * Example:
 * $("#unitslider").unitslider();
 *
 * With #unitslider element, You'd better set it with `width` and `height` properties.
 */

(function($){

    function Unitslider(props, settings)
    {
        if (typeof props == 'object')
        {
            settings = props;
        }

        this.options = $.extend({}, $.fn.unitslider.defaultSettings, settings || {});
        this.el = null;

        // Orientation & Touch Device
        this.VorH = this.options.orientation;

        // DOM
        this.unitSlider = null;
        this.sliderbar = null;
        this.sliderbarClone = null;
        this.sliderbarArr = [];
        this.sliderProcessColor = null;
        this.reduceBtn = null;
        this.increaseBtn = null;

        // Variables
        this.baseNum = this.options.max - this.options.min;
        this.drag = false;
        this.sliderLen = 0;
        this.sliderbarR = 0;
        this.snapBreak = 0;

        // start position
        this.startP = null;
        this.startP0 = null;
        this.startP1 = null;

        // number of sliderbars
        this.barNum = this.options.current.length;

        // record sliderbar percent position
        this.p = null;
        this.p0 = null;
        this.p1 = null;

        // record current value (number or array)
        this.current = this.options.current;
    }

    Unitslider.prototype =
    {
        generateHtml: function(el)
        {
            var theme = this.options.theme;
            this.el = el;

            el.addClass("unit-slider-element "+theme);
            if (this.VorH == "vertical")
            {
                // add .vertical class mark
                el.addClass("vertical");
            }

            this.unitSlider = $('<div class="unit-slider"></div>');
            this.sliderbar = $('<div class="unit-slider-bar"><div class="unit-slider-bar-m"></div></div>');

            // should have only one sliderbar
            if (!this.options.withSliderbar && this.barNum === undefined)
            {
                this.sliderbar.hide();
                this.reduceBtn = $('<div class="unit-reduce-btn"></div>');
                this.increaseBtn = $('<div class="unit-increase-btn"></div>');

                var snap = this.options.snap,
                    self = this,
                    min = this.options.min,
                    max = this.options.max;

                // todo: need fix here
                this.reduceBtn.on('click', function()
                {
                    var pre = self.current - snap;
                    self.isValid(pre, function()
                    {
                        self.updateSlider(pre);
                        self.current = pre;
                    });
                });
                this.increaseBtn.on('click', function()
                {
                    var pre = self.current + snap;
                    self.isValid(pre, function()
                    {
                        self.updateSlider(pre);
                        self.current = pre;
                    });
                });
            }

            this.sliderbarArr.push(this.sliderbar);
            if (Array.isArray(this.options.current))
            {
                this.sliderbarClone = this.sliderbar.clone();
                this.sliderbarArr.push(this.sliderbarClone);
            }

            this.sliderProcessColor = $('<div class="unit-slider-process-color"></div>');

            if (!this.options.withProcessColor)
            {
                this.sliderProcessColor.css('background-color', 'transparent');
            }

            // append unitslider html
            this.unitSlider.append(this.sliderbar, this.sliderbarClone, this.sliderProcessColor, this.reduceBtn, this.increaseBtn);
            el.append(this.unitSlider);

            this.init(el);

            // 第三方 init (第一次 init 时)
            this.options.init(this.p, this.current);
        },
        init: function(el)
        {
            var _this = this,
                padding = this.options.padding,
                VorH = this.VorH,
                baseNum = this.baseNum,
                drag = this.drag,
                sliderLen,
                sliderbarR,
                snapBreak;

            // sliderLen will be used by updateSlider method
            if (VorH == "vertical")
            {
                sliderbarR = this.sliderbarR = parseInt(this.sliderbar.css("height")) / 2;
                el.css(
                    {
                        "padding-top"   : (sliderbarR + padding) + "px",
                        "padding-bottom": (sliderbarR + padding) + "px"
                    }
                );
                sliderLen = this.sliderLen = parseInt(this.unitSlider.css("height"));
            }
            else if (VorH == "horizontal")
            {
                sliderbarR = this.sliderbarR = parseInt(this.sliderbar.css("width")) / 2;
                el.css(
                    {
                        "padding-left" : (sliderbarR + padding) + "px",
                        "padding-right": (sliderbarR + padding) + "px"
                    }
                );
                sliderLen = this.sliderLen = parseInt(this.unitSlider.css("width"));
            }

            if (this.options.snap !== 1 && this.options.snap !== 0)
            {
                snapBreak = this.snapBreak = sliderLen / ( baseNum / this.options.snap ); // no Math.round() here
            }

            if (this.options.handle)
            {
                if (VorH == "vertical")
                {
                    this.initV();
                }
                else if (VorH == "horizontal")
                {
                    this.initH();
                }
            }
        },
        initV: function()
        {
            var _this = this,
                mouseP,
                startP,
                max = this.options.max,
                min = this.options.min,
                snap = this.options.snap,

                baseNum = this.baseNum,
                sliderLen = this.sliderLen,
                sliderbarR = this.sliderbarR,
                snapBreak = this.snapBreak
                ;

            // slider event listening start
            var sliderBarMove = function (e)
            {
                e = e.originalEvent.touches ? e.originalEvent.touches[0] : e;

                if (_this.drag)
                {
                    e.data = this;
                    _this.slide(e, _this, max, min, snap, baseNum, sliderLen, sliderbarR, snapBreak);
                }
            };

            var clearBindings = function ()
            {
                _this.drag = false;
                $(this).off(".slider");

                _this.sliderVal("change", sliderLen, baseNum, max, min, snap);
            };

            $.each
            (
                _this.sliderbarArr,
                function(i, el)
                {
                    el.on("mousedown touchstart",function(e)
                    {
                        e.preventDefault();
                        e = e.originalEvent.touches? e.originalEvent.touches[0] : e;

                        var offset = $(this).position();

                        startP = offset.top + sliderbarR; // position() have no return bottom
                        mouseP = e.pageY;

                        _this.drag = true;

                        /////
                        var objPara =
                        {
                            sliderbar: el,
                            mouseP: mouseP,
                            startP: startP
                        };
                        if (_this.barNum == 2)
                        {
                            objPara = $.extend(objPara, {index: i});
                        }
                        /////

                        $(window).on(
                            {
                                "mousemove.slider touchmove.slider": $.proxy(sliderBarMove, objPara),
                                "mouseup.slider touchend.slider": clearBindings
                            }
                        );
                    });
                }
            );
            // slider end

            this.updateSlider(this.options.current);
        },
        initH: function()
        {
            var _this = this,
                mouseP,
                startP,
                max = this.options.max,
                min = this.options.min,
                snap = this.options.snap,

                baseNum = this.baseNum,
                sliderLen = this.sliderLen,
                sliderbarR = this.sliderbarR,
                snapBreak = this.snapBreak
                ;

            // slider event listening start
            var sliderBarMove = function (e)
            {
                if (_this.drag)
                {
                    e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;

                    e.data = this;
                    _this.slide(e, _this, max, min, snap, baseNum, sliderLen, sliderbarR, snapBreak);
                }
            };

            var clearBindings = function()
            {
                _this.drag = false;
                $(window).off(".slider");

                _this.sliderVal("change", sliderLen, baseNum, max, min, snap);
            };

            $.each(
                _this.sliderbarArr,
                function(i, el)
                {
                    el.on('mousedown touchstart', function(e)
                    {
                        e.preventDefault();
                        e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;

                        var offset = $(this).position();

                        startP = offset.left + sliderbarR;  // let sliderbar startP from it's circle position
                        mouseP = e.pageX;

                        _this.drag = true;

                        /////
                        var objPara =
                        {
                            sliderbar: el,
                            mouseP: mouseP,
                            startP: startP
                        };
                        if (_this.barNum == 2)
                        {
                            objPara = $.extend(objPara, {index: i});
                        }
                        /////

                        // start from here.
//                            $(window).mousemove(
//                                $.proxy(sliderBarMove, objPara)
//                            ).mouseup(windowUnbind);
                        $(window).on(
                            {
                                "mousemove.slider touchmove.slider": $.proxy(sliderBarMove, objPara),
                                "mouseup.slider touchend.slider": clearBindings
                            }
                        );
                    });
                }
            );
            // slider end

            // set current value
            this.updateSlider(this.options.current);
        },
        updateSlider: function(v)  // v is Num or Array
        {
            var max = this.options.max,
                min = this.options.min,
                baseNum = this.baseNum,
                sliderbarR = this.sliderbarR,
                sliderLen = this.sliderLen,
                VorH = this.VorH,
                _this = this,
                a;

            a = function(v, i)
            {
                _this.isValid(v, function()
                {
                    var left = (v - min) * sliderLen / baseNum;
                    if (VorH == "horizontal")
                    {
                        _this["startP"+i] = left;

                        _this.sliderbarArr[i].css("left", left - sliderbarR);
                        _this.updateProcess("left", "width", left / sliderLen * 100, i);
                    }
                    else if (VorH == "vertical")
                    {
                        _this["startP"+i] = sliderLen - left;

                        _this.sliderbarArr[i].css("bottom", left - sliderbarR);
                        _this.updateProcess("bottom", "height", left / sliderLen * 100, i);
                    }
                });
            };

            if (Array.isArray(v))
            {
                $.each
                (
                    v,
                    function(i, value)
                    {
                        a(value, i);
                    }
                );
            }
            else
            {
                a(v, 0);
                this.startP = this.startP0;
            }
        },
        sliderbarRelativeXY: function()
        {
            var sliderbar = this.sliderbar,
                sliderbarM = sliderbar.find('.unit-slider-bar-m'),
                ReObj = {};
            var Rx = parseInt (sliderbar.css('left') ) + this.sliderbarR * 2;
            var Ry = parseInt ( sliderbarM.css('width') ) / 2;

            ReObj['x'] = Rx;
            ReObj['y'] = Ry;

            return ReObj;
        },
        updateProcess: function(p1, p2, v, i)  // v is percent num
        {
            if (this.barNum == 2)
            {
                if (i == 0)
                {
                    this.p0 = v;
                    this.sliderProcessColor.css(
                        p1, v + "%"
                    );
                    if (this.drag)
                    {
                        var w = this.p1 - this.p0;
                        this.sliderProcessColor.css(
                            p2, w + "%"
                        );
                    }
                }
                if ( i == 1)
                {
                    this.p1 = v;
                    v = this.p1 - this.p0;
                    this.sliderProcessColor.css(
                        p2, v + "%"
                    );
                }

            }
            else
            {
                this.p = v;
                this.sliderProcessColor.css(
                    p2, v + "%"
                );
            }
        },
        slide: function(e, self, max, min, snap, baseNum, sliderLen, sliderbarR, snapBreak)
        {
            var relate, a;
            if (this.VorH == "horizontal")
            {
                relate = e.pageX - e.data.mouseP;

                a = function()
                {
                    var left = e.data.startP + relate;

                    e.data.sliderbar.css("left", left - sliderbarR +"px" );

                    var percent = Math.round(left/sliderLen * 100);

                    var b = function(startP, lPos, rPos)  // javascript reference parameter -> startP
                    {
                        e.data.startP = self[startP] = left;
                        e.data.mouseP = e.pageX;

                        // two side border
                        if (e.data.startP < lPos)
                        {
                            e.data.startP = self[startP] = lPos;
                            self.updateProcess("left", "width", (e.data.startP / sliderLen) * 100, 0);
                            e.data.sliderbar.css("left", lPos - sliderbarR + "px" );
                        }
                        if (e.data.startP > rPos)
                        {
                            e.data.startP = self[startP] = rPos;
                            self.updateProcess("left", "width", (e.data.startP / sliderLen) * 100, 1);
                            e.data.sliderbar.css("left", rPos - sliderbarR +"px" );
                        }
                        // two side border

                        // debug
                        // console.error("left="+left, "sliderLen="+sliderLen, "snapBreak="+snapBreak, "e.data.startP="+e.data.startP, "relate="+relate);
                        self.p = Math.round(e.data.startP / sliderLen * 100);
                    };

                    if (e.data.index !== undefined)
                    {
                        self.updateProcess("left", "width", percent, e.data.index);

                        if (e.data.index == 0)
                        {
                            b("startP0", 0, self.startP1);
                        }
                        if (e.data.index == 1)
                        {
                            b("startP1", self.startP0, sliderLen)
                        }
                        self.toggleZ(e.data.sliderbar);
                    }
                    else
                    {
                        self.updateProcess("left", "width", percent);

                        b("startP", 0, sliderLen);
                    }

                    self.sliderVal("slider", sliderLen, baseNum, max, min, snap);
                };
            }
            else if (this.VorH == "vertical")
            {
                relate = e.pageY - e.data.mouseP;

                a = function()
                {
                    var top = e.data.startP + relate, bottomVal = sliderLen - top;

                    e.data.sliderbar.css("bottom", bottomVal - sliderbarR +"px" );

                    var percent = Math.round(bottomVal/sliderLen * 100);

                    var b = function(startP, bPos, tPos)
                    {
                        e.data.startP = self[startP] = top; // vertical startP 是从上往下算的
                        e.data.mouseP = e.pageY;

                        // two side border
                        if (e.data.startP < bPos)  // bottom high
                        {
                            e.data.startP = self[startP] = bPos;
                            self.updateProcess("bottom", "height", (1 - ( e.data.startP / sliderLen )) * 100, 1);
                            e.data.sliderbar.css("bottom", sliderLen - e.data.startP - sliderbarR + "px" );
                        }
                        if (e.data.startP > tPos)  // bottom low
                        {
                            e.data.startP = self[startP] = tPos;
                            self.updateProcess("bottom", "height", (1 - ( e.data.startP / sliderLen )) * 100, 0);
                            e.data.sliderbar.css("bottom", sliderLen - tPos - sliderbarR);
                        }
                        // two side border

                        // debug
                        // console.error("bottomVal="+bottomVal, "sliderLen="+sliderLen, "snapBreak="+snapBreak, "e.data.startP="+e.data.startP, "relate="+relate);
                        self.p = Math.round( (1 - e.data.startP / sliderLen) * 100);
                    };

                    if (e.data.index !== undefined)
                    {
                        self.updateProcess("bottom", "height", percent, e.data.index);

                        if (e.data.index == 0)
                        {
                            b("startP0", self.startP1, sliderLen);
                        }
                        if (e.data.index == 1)
                        {
                            b("startP1", 0, self.startP0);
                        }
                        self.toggleZ(e.data.sliderbar);
                    }
                    else
                    {
                        self.updateProcess("bottom", "height", percent);

                        b("startP", 0, sliderLen);
                    }

                    self.sliderVal("slider", sliderLen, baseNum, max, min, snap);
                };
            }
            if(snapBreak !== 0)
            {
                if (Math.abs(relate) >= snapBreak)
                {
                    relate = ( relate < 0 ) ? - snapBreak : snapBreak;
                    a();
                }
            }
            else
            {
                a();
            }

        },
        toggleZ: function(el)
        {
            $.each
            (
                this.sliderbarArr,
                function(i, elment)
                {
                    elment.css(
                        {
                            "z-index": 1
                        }
                    );
                }
            );
            el.css(
                {
                    "z-index": 2
                }
            );
        },
        sliderVal: function(type, sliderLen, baseNum, max, min, snap)
        {
            // params "slider" or "change"
            if (this.options[type] == undefined)
            {
                return false;
            }

            var _this = this,
                p = this.p,
                p0 = this.p0,
                p1 = this.p1,
                v, v0, v1;

            function calVal(startP)
            {
                var a;
                if (_this.VorH == "horizontal")
                {
                    a = Math.round( (startP / sliderLen * baseNum + min) / snap ) * snap;
                }
                else if (_this.VorH == "vertical")
                {
                    a = Math.round( (- (startP / sliderLen * baseNum) + max) / snap) * snap;
                }
                return a;
            }
            if (this.barNum == 2)
            {
                v0 = calVal(this.startP0);
                v1 = calVal(this.startP1);

                this.current = [v0, v1];

                this.options[type]([p0, p1], [v0, v1]);
            }
            else
            {
                v = calVal(this.startP);

                this.current = v;

                this.options[type](p, v);
            }
        },
        isValid: function(v, callback)
        {
            var max = this.options.max,
                min = this.options.min;

            if(v >= min && v <= max)
            {
                callback();
            }
            else
            {
                return false;
            }
        },
        destroy: function()
        {
            this.el.removeAttr("style").removeAttr("class").empty().removeData('unitslider');
            delete this.el[0].el;
        },
        resize: function(w, h)
        {
            var VorH = this.VorH,
                _this = this;

            if (VorH == 'horizontal')
            {
                _this.sliderLen = parseInt(_this.unitSlider.css('width'));
            }
            else if (VorH == 'vertical')
            {
                _this.sliderLen = parseInt(_this.unitSlider.css('height'));
            }
            _this.updateSlider(_this.current);
        }
    };
    $.fn.unitslider = function(props, settings)
    {
        return this.each(
            function()
            {
                var slider = new Unitslider(props, settings);
                if (!this.el)
                {
                    this.el = $(this);  // `this` here is elementObject, delete in the destroy method

                    slider.generateHtml(this.el);

                    this.el.data('unitslider', slider);
                }
            }
        );
    };

    $.fn.unitslider.defaultSettings =
    {
        min             : 0,
        max             : 100,
        current         : 0,
        orientation     : "horizontal",
        handle          : true,
        snap            : 1,
        padding         : 5,
        theme           : "default",
        withProcessColor: true,
        withSliderbar   : true,
        slider          : function (p, v) {
        },
        change          : function (p, v) {
        },
        init            : function (p, v) {
        }
    };
})(window.jQuery || window.Zepto);