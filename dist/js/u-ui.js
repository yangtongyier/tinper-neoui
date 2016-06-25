'use strict';

var BaseComponent = u.Class.create({
    initialize: function initialize(element) {
        if (u.isDomElement(element)) {
            this.element = element;
            this.options = {};
        } else {
            this.element = element['el'];
            this.options = element;
        }
        this.element = typeof this.element === 'string' ? document.querySelector(this.element) : this.element;

        this.compType = this.compType || this.constructor.compType;
        this.element[this.compType] = this;
        this.element['init'] = true;
        this.init();
    },
    /**
     * 绑定事件
     * @param {String} name
     * @param {Function} callback
     */
    on: function on(name, callback) {
        name = name.toLowerCase();
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({
            callback: callback
        });
        return this;
    },
    /**
     * 触发事件
     * @param {String} name
     */
    trigger: function trigger(name) {
        name = name.toLowerCase();
        if (!this._events || !this._events[name]) return this;
        var args = Array.prototype.slice.call(arguments, 1);
        var events = this._events[name];
        for (var i = 0, count = events.length; i < count; i++) {
            events[i].callback.apply(this, args);
        }
        return this;
    },
    /**
     * 初始化
     */
    init: function init() {},
    /**
     * 渲染控件
     */
    render: function render() {},
    /**
     * 销毁控件
     */
    destroy: function destroy() {
        delete this.element['comp'];
        this.element.innerHTML = '';
    },
    /**
     * 增加dom事件
     * @param {String} name
     * @param {Function} callback
     */
    addDomEvent: function addDomEvent(name, callback) {
        u.on(this.element, name, callback);
        return this;
    },
    /**
     * 移除dom事件
     * @param {String} name
     */
    removeDomEvent: function removeDomEvent(name, callback) {
        u.off(this.element, name, callback);
        return this;
    },
    setEnable: function setEnable(enable) {
        return this;
    },
    /**
     * 判断是否为DOM事件
     */
    isDomEvent: function isDomEvent(eventName) {
        if (this.element['on' + eventName] === undefined) return false;else return true;
    },
    createDateAdapter: function createDateAdapter(options) {
        var opt = options['options'],
            model = options['model'];
        var Adapter = u.compMgr.getDataAdapter(this.compType, opt['dataType']);
        if (Adapter) {
            this.dataAdapter = new Adapter(this, options);
        }
    },
    Statics: {
        compName: '',
        EVENT_VALUE_CHANGE: 'valueChange',
        getName: function getName() {
            return this.compName;
        }
    }
});

function adjustDataType(options) {
    var types = ['integer', 'float', 'currency', 'percent', 'string', 'textarea'];
    var _type = options['type'],
        _dataType = options['dataType'];
    if (types.indexOf(_type) != -1) {
        options['dataType'] = _type;
        options['type'] = 'originText';
    }
}

u.BaseComponent = BaseComponent;
'use strict';

var URipple = function URipple(element) {
  if (u.isIE8) return;
  this._element = element;

  // Initialize instance.
  this.init();
};
//window['URipple'] = URipple;

URipple.prototype._down = function (event) {
  if (u.isIE8) return;
  if (!this._rippleElement.style.width && !this._rippleElement.style.height) {
    var rect = this._element.getBoundingClientRect();
    this.rippleSize_ = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2 + 2;
    this._rippleElement.style.width = this.rippleSize_ + 'px';
    this._rippleElement.style.height = this.rippleSize_ + 'px';
  }

  u.addClass(this._rippleElement, 'is-visible');

  if (event.type === 'mousedown' && this._ignoringMouseDown) {
    this._ignoringMouseDown = false;
  } else {
    if (event.type === 'touchstart') {
      this._ignoringMouseDown = true;
    }
    var frameCount = this.getFrameCount();
    if (frameCount > 0) {
      return;
    }
    this.setFrameCount(1);
    var t = event.currentTarget || event.target || event.srcElement;
    var bound = t.getBoundingClientRect();
    var x;
    var y;
    // Check if we are handling a keyboard click.
    if (event.clientX === 0 && event.clientY === 0) {
      x = Math.round(bound.width / 2);
      y = Math.round(bound.height / 2);
    } else {
      var clientX = event.clientX ? event.clientX : event.touches[0].clientX;
      var clientY = event.clientY ? event.clientY : event.touches[0].clientY;
      x = Math.round(clientX - bound.left);
      y = Math.round(clientY - bound.top);
    }
    this.setRippleXY(x, y);
    this.setRippleStyles(true);
    if (window.requestAnimationFrame) window.requestAnimationFrame(this.animFrameHandler.bind(this));
  }
};

/**
 * Handle mouse / finger up on element.
 *
 * @param {Event} event The event that fired.
 * @private
 */
URipple.prototype._up = function (event) {
  if (u.isIE8) return;
  var self = this;
  // Don't fire for the artificial "mouseup" generated by a double-click.
  if (event && event.detail !== 2) {
    u.removeClass(this._rippleElement, 'is-visible');
  }
  // Allow a repaint to occur before removing this class, so the animation
  // shows for tap events, which seem to trigger a mouseup too soon after
  // mousedown.
  window.setTimeout(function () {
    u.removeClass(self._rippleElement, 'is-visible');
  }, 0);
};

/**
     * Getter for frameCount_.
     * @return {number} the frame count.
     */
URipple.prototype.getFrameCount = function () {
  if (u.isIE8) return;
  return this.frameCount_;
};
/**
     * Setter for frameCount_.
     * @param {number} fC the frame count.
     */
URipple.prototype.setFrameCount = function (fC) {
  if (u.isIE8) return;
  this.frameCount_ = fC;
};

/**
     * Getter for _rippleElement.
     * @return {Element} the ripple element.
     */
URipple.prototype.getRippleElement = function () {
  if (u.isIE8) return;
  return this._rippleElement;
};

/**
 * Sets the ripple X and Y coordinates.
 * @param  {number} newX the new X coordinate
 * @param  {number} newY the new Y coordinate
 */
URipple.prototype.setRippleXY = function (newX, newY) {
  if (u.isIE8) return;
  this.x_ = newX;
  this.y_ = newY;
};

/**
 * Sets the ripple styles.
 * @param  {boolean} start whether or not this is the start frame.
 */
URipple.prototype.setRippleStyles = function (start) {
  if (u.isIE8) return;
  if (this._rippleElement !== null) {
    var transformString;
    var scale;
    var size;
    var offset = 'translate(' + this.x_ + 'px, ' + this.y_ + 'px)';

    if (start) {
      scale = 'scale(0.0001, 0.0001)';
      size = '1px';
    } else {
      scale = '';
      size = this.rippleSize_ + 'px';
    }

    transformString = 'translate(-50%, -50%) ' + offset + scale;

    this._rippleElement.style.webkitTransform = transformString;
    this._rippleElement.style.msTransform = transformString;
    this._rippleElement.style.transform = transformString;

    if (start) {
      u.removeClass(this._rippleElement, 'is-animating');
    } else {
      u.addClass(this._rippleElement, 'is-animating');
    }
  }
};

/**
   * Handles an animation frame.
   */
URipple.prototype.animFrameHandler = function () {
  if (u.isIE8) return;
  if (this.frameCount_-- > 0) {
    window.requestAnimationFrame(this.animFrameHandler.bind(this));
  } else {
    this.setRippleStyles(false);
  }
};

/**
 * Initialize element.
 */
URipple.prototype.init = function () {
  if (u.isIE8) return;
  var self = this;
  if (this._element) {
    this._rippleElement = this._element.querySelector('.u-ripple');
    if (!this._rippleElement) {
      this._rippleElement = document.createElement('span');
      u.addClass(this._rippleElement, 'u-ripple');
      this._element.appendChild(this._rippleElement);
      this._element.style.overflow = 'hidden';
      this._element.style.position = 'relative';
    }
    this.frameCount_ = 0;
    this.rippleSize_ = 0;
    this.x_ = 0;
    this.y_ = 0;

    // Touch start produces a compat mouse down event, which would cause a
    // second ripples. To avoid that, we use this property to ignore the first
    // mouse down after a touch start.
    this._ignoringMouseDown = false;
    u.on(this._element, 'mousedown', function (e) {
      self._down(e);
    });
    u.on(this._element, 'touchstart', function (e) {
      self._down(e);
    });

    u.on(this._element, 'mouseup', function (e) {
      self._up(e);
    });
    u.on(this._element, 'mouseleave', function (e) {
      self._up(e);
    });
    u.on(this._element, 'touchend', function (e) {
      self._up(e);
    });
    u.on(this._element, 'blur', function (e) {
      self._up(e);
    });
  }
};

u.Ripple = URipple;
'use strict';

u.Button = u.BaseComponent.extend({
    init: function init() {
        var rippleContainer = document.createElement('span');
        u.addClass(rippleContainer, 'u-button-container');
        this._rippleElement = document.createElement('span');
        u.addClass(this._rippleElement, 'u-ripple');
        if (u.isIE8) u.addClass(this._rippleElement, 'oldIE');
        rippleContainer.appendChild(this._rippleElement);
        u.on(this._rippleElement, 'mouseup', this.element.blur);
        this.element.appendChild(rippleContainer);

        u.on(this.element, 'mouseup', this.element.blur);
        u.on(this.element, 'mouseleave', this.element.blur);
        this.ripple = new u.Ripple(this.element);
    }

});

u.compMgr.regComp({
    comp: u.Button,
    compAsString: 'u.Button',
    css: 'u-button'
});
'use strict';

u.NavLayout = u.BaseComponent.extend({
    _Constant: {
        MAX_WIDTH: '(max-width: 1024px)',
        TAB_SCROLL_PIXELS: 100,

        MENU_ICON: 'menu',
        CHEVRON_LEFT: 'chevron_left',
        CHEVRON_RIGHT: 'chevron_right'
    },
    /**
     * Modes.
     *
     * @enum {number}
     * @private
     */
    _Mode: {
        STANDARD: 0,
        SEAMED: 1,
        WATERFALL: 2,
        SCROLL: 3
    },
    /**
     * Store strings for class names defined by this component that are used in
     * JavaScript. This allows us to simply change it in one place should we
     * decide to modify at a later date.
     *
     * @enum {string}
     * @private
     */
    _CssClasses: {
        CONTAINER: 'u-navlayout-container',
        HEADER: 'u-navlayout-header',
        DRAWER: 'u-navlayout-drawer',
        CONTENT: 'u-navlayout-content',
        DRAWER_BTN: 'u-navlayout-drawer-button',

        ICON: 'fa',

        //JS_RIPPLE_EFFECT: 'mdl-js-ripple-effect',
        //RIPPLE_CONTAINER: 'mdl-layout__tab-ripple-container',
        //RIPPLE: 'mdl-ripple',
        //RIPPLE_IGNORE_EVENTS: 'mdl-js-ripple-effect--ignore-events',

        HEADER_SEAMED: 'seamed',
        HEADER_WATERFALL: 'waterfall',
        HEADER_SCROLL: 'scroll',

        FIXED_HEADER: 'fixed',
        OBFUSCATOR: 'u-navlayout-obfuscator',

        TAB_BAR: 'u-navlayout-tab-bar',
        TAB_CONTAINER: 'u-navlayout-tab-bar-container',
        TAB: 'u-navlayout-tab',
        TAB_BAR_BUTTON: 'u-navlayout-tab-bar-button',
        TAB_BAR_LEFT_BUTTON: 'u-navlayout-tab-bar-left-button',
        TAB_BAR_RIGHT_BUTTON: 'u-navlayout-tab-bar-right-button',
        PANEL: 'u-navlayout-tab-panel',

        HAS_DRAWER: 'has-drawer',
        HAS_TABS: 'has-tabs',
        HAS_SCROLLING_HEADER: 'has-scrolling-header',
        CASTING_SHADOW: 'is-casting-shadow',
        IS_COMPACT: 'is-compact',
        IS_SMALL_SCREEN: 'is-small-screen',
        IS_DRAWER_OPEN: 'is-visible',
        IS_ACTIVE: 'is-active',
        IS_UPGRADED: 'is-upgraded',
        IS_ANIMATING: 'is-animating',

        ON_LARGE_SCREEN: 'u-navlayout-large-screen-only',
        ON_SMALL_SCREEN: 'u-navlayout-small-screen-only',

        NAV: 'u-nav',
        NAV_LINK: 'u-nav-link',
        NAV_LINK_CURRENT: 'u-nav-link-current',
        NAV_LINK_OPEN: 'u-nav-link-open',
        NAV_SUB: 'u-nav-sub'
    },
    init: function init() {
        var container = document.createElement('div');
        u.addClass(container, this._CssClasses.CONTAINER);
        this.element.parentElement.insertBefore(container, this.element);
        this.element.parentElement.removeChild(this.element);
        container.appendChild(this.element);

        var directChildren = this.element.childNodes;
        var numChildren = directChildren.length;
        for (var c = 0; c < numChildren; c++) {
            var child = directChildren[c];
            if (u.hasClass(child, this._CssClasses.HEADER)) {
                this._header = child;
            }

            if (u.hasClass(child, this._CssClasses.DRAWER)) {
                this._drawer = child;
            }

            if (u.hasClass(child, this._CssClasses.CONTENT)) {
                this._content = child;
                var layoutHeight = this.element.offsetHeight;
                var headerHeight = typeof this._header === 'undefined' ? 0 : this._header.offsetHeight;
                this._content.style.height = layoutHeight - headerHeight + 'px';
                var self = this;
                u.on(window, 'resize', function () {
                    var layoutHeight = self.element.offsetHeight;
                    var headerHeight = typeof self._header === 'undefined' ? 0 : self._header.offsetHeight;
                    self._content.style.height = layoutHeight - headerHeight + 'px';
                });
            }
        }

        if (this._header) {
            this._tabBar = this._header.querySelector('.' + this._CssClasses.TAB_BAR);
        }

        var mode = this._Mode.STANDARD;

        if (this._header) {
            if (u.hasClass(this._header, this._CssClasses.HEADER_SEAMED)) {
                mode = this._Mode.SEAMED;
                //} else if (u.hasClass(this._header,this._CssClasses.HEADER_SEAMED)) {
                //    mode = this._Mode.WATERFALL;
                //    u.on(this._header,'transitionend', this._headerTransitionEndHandler.bind(this));
                //    // this._header.addEventListener('transitionend', this._headerTransitionEndHandler.bind(this));
                //    u.on(this._header,'click', this._headerClickHandler.bind(this));
                //    // this._header.addEventListener('click', this._headerClickHandler.bind(this));
            } else if (u.hasClass(this._header, this._CssClasses.HEADER_SCROLL)) {
                    mode = this._Mode.SCROLL;
                    u.addClass(container, this._CssClasses.HAS_SCROLLING_HEADER);
                }

            if (mode === this._Mode.STANDARD) {
                u.addClass(this._header, this._CssClasses.CASTING_SHADOW);
                if (this._tabBar) {
                    u.addClass(this._tabBar, this._CssClasses.CASTING_SHADOW);
                }
            } else if (mode === this._Mode.SEAMED || mode === this._Mode.SCROLL) {
                u.removeClass(this._header, this._CssClasses.CASTING_SHADOW);
                if (this._tabBar) {
                    u.removeClass(this._tabBar, this._CssClasses.CASTING_SHADOW);
                }
            } else if (mode === this._Mode.WATERFALL) {
                // Add and remove shadows depending on scroll position.
                // Also add/remove auxiliary class for styling of the compact version of
                // the header.
                u.on(this._content, 'scroll', this._contentScrollHandler.bind(this));
                this._contentScrollHandler();
            }
        }

        // Add drawer toggling button to our layout, if we have an openable drawer.
        if (this._drawer) {
            var drawerButton = this.element.querySelector('.' + this._CssClasses.DRAWER_BTN);
            if (!drawerButton) {
                drawerButton = document.createElement('div');
                u.addClass(drawerButton, this._CssClasses.DRAWER_BTN);

                var drawerButtonIcon = document.createElement('i');
                drawerButtonIcon.className = 'fa fa-bars';
                //drawerButtonIcon.textContent = this._Constant.MENU_ICON;
                drawerButton.appendChild(drawerButtonIcon);
            }

            if (u.hasClass(this._drawer, this._CssClasses.ON_LARGE_SCREEN)) {
                //If drawer has ON_LARGE_SCREEN class then add it to the drawer toggle button as well.
                u.addClass(drawerButton, this._CssClasses.ON_LARGE_SCREEN);
            } else if (u.hasClass(this._drawer, this._CssClasses.ON_SMALL_SCREEN)) {
                //If drawer has ON_SMALL_SCREEN class then add it to the drawer toggle button as well.
                u.addClass(drawerButton, this._CssClasses.ON_SMALL_SCREEN);
            }
            u.on(drawerButton, 'click', this._drawerToggleHandler.bind(this));

            // Add a class if the layout has a drawer, for altering the left padding.
            // Adds the HAS_DRAWER to the elements since this._header may or may
            // not be present.
            u.addClass(this.element, this._CssClasses.HAS_DRAWER);

            // If we have a fixed header, add the button to the header rather than
            // the layout.
            if (u.hasClass(this.element, this._CssClasses.FIXED_HEADER) && this._header) {
                this._header.insertBefore(drawerButton, this._header.firstChild);
            } else {
                this.element.insertBefore(drawerButton, this._content);
            }
            this.drawerButton = drawerButton;

            var obfuscator = document.createElement('div');
            u.addClass(obfuscator, this._CssClasses.OBFUSCATOR);
            this.element.appendChild(obfuscator);
            u.on(obfuscator, 'click', this._drawerToggleHandler.bind(this));
            this._obfuscator = obfuscator;

            var leftnav = this.element.querySelector('.' + this._CssClasses.NAV);
            u.on(leftnav, 'click', this._navlinkClickHander.bind(this));

            var items = leftnav.querySelectorAll('.' + this._CssClasses.NAV_LINK);
            for (var i = 0; i < items.length; i++) {
                new u.Ripple(items[i]);
            }
        }

        // Keep an eye on screen size, and add/remove auxiliary class for styling
        // of small screens.

        if (u.isIE8 || u.isIE9) {
            u.on(window, 'resize', this._screenSizeHandler.bind(this));
        } else {
            this._screenSizeMediaQuery = window.matchMedia(
            /** @type {string} */this._Constant.MAX_WIDTH);
            this._screenSizeMediaQuery.addListener(this._screenSizeHandler.bind(this));
        }

        this._screenSizeHandler();

        // Initialize tabs, if any.
        if (this._header && this._tabBar) {
            u.addClass(this.element, this._CssClasses.HAS_TABS);

            var tabContainer = document.createElement('div');
            u.addClass(tabContainer, this._CssClasses.TAB_CONTAINER);
            this._header.insertBefore(tabContainer, this._tabBar);
            this._header.removeChild(this._tabBar);

            var leftButton = document.createElement('div');
            u.addClass(leftButton, this._CssClasses.TAB_BAR_BUTTON);
            u.addClass(leftButton, this._CssClasses.TAB_BAR_LEFT_BUTTON);
            var leftButtonIcon = document.createElement('i');
            u.addClass(leftButtonIcon, this._CssClasses.ICON);
            leftButtonIcon.textContent = this._Constant.CHEVRON_LEFT;
            leftButton.appendChild(leftButtonIcon);
            u.on(leftButton, 'click', function () {
                this._tabBar.scrollLeft -= this._Constant.TAB_SCROLL_PIXELS;
            }.bind(this));

            var rightButton = document.createElement('div');
            u.addClass(rightButton, this._CssClasses.TAB_BAR_BUTTON);
            u.addClass(rightButton, this._CssClasses.TAB_BAR_RIGHT_BUTTON);
            var rightButtonIcon = document.createElement('i');
            u.addClass(rightButtonIcon, this._CssClasses.ICON);
            rightButtonIcon.textContent = this._Constant.CHEVRON_RIGHT;
            rightButton.appendChild(rightButtonIcon);
            u.on(rightButton, 'click', function () {
                this._tabBar.scrollLeft += this._Constant.TAB_SCROLL_PIXELS;
            }.bind(this));

            tabContainer.appendChild(leftButton);
            tabContainer.appendChild(this._tabBar);
            tabContainer.appendChild(rightButton);

            // Add and remove buttons depending on scroll position.
            var tabScrollHandler = function () {
                if (this._tabBar.scrollLeft > 0) {
                    u.addClass(leftButton, this._CssClasses.IS_ACTIVE);
                } else {
                    u.removeClass(leftButton, this._CssClasses.IS_ACTIVE);
                }

                if (this._tabBar.scrollLeft < this._tabBar.scrollWidth - this._tabBar.offsetWidth) {
                    u.addClass(rightButton, this._CssClasses.IS_ACTIVE);
                } else {
                    u.removeClass(rightButton, this._CssClasses.IS_ACTIVE);
                }
            }.bind(this);

            u.on(this._tabBar, 'scroll', tabScrollHandler);
            tabScrollHandler();

            if (u.hasClass(this._tabBar, this._CssClasses.JS_RIPPLE_EFFECT)) {
                u.addClass(this._tabBar, this._CssClasses.RIPPLE_IGNORE_EVENTS);
            }

            // Select element tabs, document panels
            var tabs = this._tabBar.querySelectorAll('.' + this._CssClasses.TAB);
            var panels = this._content.querySelectorAll('.' + this._CssClasses.PANEL);

            // Create new tabs for each tab element
            for (var i = 0; i < tabs.length; i++) {
                new UNavLayoutTab(tabs[i], tabs, panels, this);
            }
        }

        u.addClass(this.element, this._CssClasses.IS_UPGRADED);
    },

    /**
     * Handles scrolling on the content.
     *
     * @private
     */
    _contentScrollHandler: function _contentScrollHandler() {
        if (u.hasClass(this._header, this._CssClasses.IS_ANIMATING)) {
            return;
        }

        if (this._content.scrollTop > 0 && !u.hasClass(this._header, this._CssClasses.IS_COMPACT)) {
            u.addClass(this._header, this._CssClasses.CASTING_SHADOW).addClass(this._header, this._CssClasses.IS_COMPACT).addClass(this._header, this._CssClasses.IS_ANIMATING);
        } else if (this._content.scrollTop <= 0 && u.hasClass(this._header, this._CssClasses.IS_COMPACT)) {
            u.removeClass(this._header, this._CssClasses.CASTING_SHADOW).removeClass(this._header, this._CssClasses.IS_COMPACT).addClass(this._header, this._CssClasses.IS_ANIMATING);
        }
    },

    /**
     * Handles changes in screen size.
     *
     * @private
     */
    _screenSizeHandler: function _screenSizeHandler() {
        if (u.isIE8 || u.isIE9) {
            this._screenSizeMediaQuery = {};
            var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (w > 1024) this._screenSizeMediaQuery.matches = false;else this._screenSizeMediaQuery.matches = true;
        }
        if (this._screenSizeMediaQuery.matches) {
            u.addClass(this.element, this._CssClasses.IS_SMALL_SCREEN);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_SMALL_SCREEN);
            // Collapse drawer (if any) when moving to a large screen size.
            if (this._drawer) {
                u.removeClass(this._drawer, this._CssClasses.IS_DRAWER_OPEN);
                u.removeClass(this._obfuscator, this._CssClasses.IS_DRAWER_OPEN);
            }
        }
    },
    /**
     * Handles toggling of the drawer.
     *
     * @private
     */
    _drawerToggleHandler: function _drawerToggleHandler() {
        u.toggleClass(this._drawer, this._CssClasses.IS_DRAWER_OPEN);
        u.toggleClass(this._obfuscator, this._CssClasses.IS_DRAWER_OPEN);
    },
    /**
     * Handles (un)setting the `is-animating` class
     *
     * @private
     */
    _headerTransitionEndHandler: function _headerTransitionEndHandler() {
        u.removeClass(this._header, this._CssClasses.IS_ANIMATING);
    },
    /**
     * Handles expanding the header on click
     *
     * @private
     */
    _headerClickHandler: function _headerClickHandler() {
        if (u.hasClass(this._header, this._CssClasses.IS_COMPACT)) {
            u.removeClass(this._header, this._CssClasses.IS_COMPACT);
            u.addClass(this._header, this._CssClasses.IS_ANIMATING);
        }
    },
    /**
     * Reset tab state, dropping active classes
     *
     * @private
     */
    _resetTabState: function _resetTabState(tabBar) {
        for (var k = 0; k < tabBar.length; k++) {
            u.removeClass(tabBar[k], this._CssClasses.IS_ACTIVE);
        }
    },
    /**
     * Reset panel state, droping active classes
     *
     * @private
     */
    _resetPanelState: function _resetPanelState(panels) {
        for (var j = 0; j < panels.length; j++) {
            u.removeClass(panels[j], this._CssClasses.IS_ACTIVE);
        }
    },
    _navlinkClickHander: function _navlinkClickHander(e) {
        //var _target = e.currentTarget || e.target || e.srcElement;
        var curlink = this.element.querySelector('.' + this._CssClasses.NAV_LINK_CURRENT);
        curlink && u.removeClass(curlink, this._CssClasses.NAV_LINK_CURRENT);
        // if (curlink && u.isIE8){
        // 	var sub = curlink.parentNode.querySelector('.'+this._CssClasses.NAV_SUB);
        // 	if (sub){
        // 		sub.style.maxHeight = '0';
        // 	}
        // }

        var item = u.closest(e.target, this._CssClasses.NAV_LINK);

        if (item) {
            u.addClass(item, this._CssClasses.NAV_LINK_CURRENT);
            var sub = item.parentNode.querySelector('.' + this._CssClasses.NAV_SUB),
                open = u.hasClass(item, this._CssClasses.NAV_LINK_OPEN);
            if (sub && open) {
                u.removeClass(item, this._CssClasses.NAV_LINK_OPEN);
                if (u.isIE8) sub.style.maxHeight = 0;
            }
            if (sub && !open) {
                u.addClass(item, this._CssClasses.NAV_LINK_OPEN);
                if (u.isIE8) sub.style.maxHeight = '999px';
            }
            // sub && open && u.removeClass(item, this._CssClasses.NAV_LINK_OPEN);
            // sub && !open && u.addClass(item, this._CssClasses.NAV_LINK_OPEN);
        }
    }
});

/**
 * Constructor for an individual tab.
 *
 * @constructor
 * @param {HTMLElement} tab The HTML element for the tab.
 * @param {!Array<HTMLElement>} tabs Array with HTML elements for all tabs.
 * @param {!Array<HTMLElement>} panels Array with HTML elements for all panels.
 * @param {UNavLayout} layout The UNavLayout object that owns the tab.
 */
function UNavLayoutTab(tab, tabs, panels, layout) {

    /**
     * Auxiliary method to programmatically select a tab in the UI.
     */
    function selectTab() {
        var href = tab.href.split('#')[1];
        var panel = layout._content.querySelector('#' + href);
        layout._resetTabState(tabs);
        layout._resetPanelState(panels);
        u.addClass(tab, layout._CssClasses.IS_ACTIVE);
        u.addClass(panel, layout._CssClasses.IS_ACTIVE);
    }

    //if (layout.tabBar_.classList.contains(layout._CssClasses.JS_RIPPLE_EFFECT)) {
    var rippleContainer = document.createElement('span');
    u.addClass(rippleContainer, 'u-ripple');
    //rippleContainer.classList.add(layout._CssClasses.JS_RIPPLE_EFFECT);
    //var ripple = document.createElement('span');
    //ripple.classList.add(layout._CssClasses.RIPPLE);
    //rippleContainer.appendChild(ripple);
    tab.appendChild(rippleContainer);
    new URipple(tab);
    //}
    u.on(tab, 'click', function (e) {
        if (tab.getAttribute('href').charAt(0) === '#') {
            e.preventDefault();
            selectTab();
        }
    });

    tab.show = selectTab;

    u.on(tab, 'click', function (e) {
        e.preventDefault();
        var href = tab.href.split('#')[1];
        var panel = layout._content.querySelector('#' + href);
        layout._resetTabState(tabs);
        layout._resetPanelState(panels);
        u.addClass(tab, layout._CssClasses.IS_ACTIVE);
        u.addClass(panel, layout._CssClasses.IS_ACTIVE);
    });
}
u.NavLayoutTab = UNavLayoutTab;

u.compMgr.regComp({
    comp: u.NavLayout,
    compAsString: 'u.NavLayout',
    css: 'u-navlayout'
});
'use strict';

u.NavMenu = u.BaseComponent.extend({
    _Constant: {},
    _CssClasses: {
        NAV: 'u-navmenu',
        NAV_LINK: 'u-navmenu-link',
        NAV_LINK_CURRENT: 'u-navmenu-link-current',
        NAV_LINK_OPEN: 'u-navmenu-link-open',
        NAV_SUB: 'u-navmenu-sub'
    },
    init: function init() {

        if (u.hasClass(this.element, 'u-navmenu-horizontal')) {
            u.on(this.element, 'click', this._horNavlinkClickHander.bind(this));
        } else {
            u.on(this.element, 'click', this._navlinkClickHander.bind(this));
        }

        var items = this.element.querySelectorAll('.' + this._CssClasses.NAV_LINK);
        for (var i = 0; i < items.length; i++) {
            new u.Ripple(items[i]);
        }
    },
    _horNavlinkClickHander: function _horNavlinkClickHander(e) {
        var item = u.closest(e.target, this._CssClasses.NAV_LINK);

        if (item) {
            var curlink = this.element.querySelector('.' + this._CssClasses.NAV_LINK_CURRENT);
            curlink && u.removeClass(curlink, this._CssClasses.NAV_LINK_CURRENT);
            u.addClass(item, this._CssClasses.NAV_LINK_CURRENT);
        }
    },
    _navlinkClickHander: function _navlinkClickHander(e) {
        //var _target = e.currentTarget || e.target || e.srcElement;
        var curlink = this.element.querySelector('.' + this._CssClasses.NAV_LINK_CURRENT);
        curlink && u.removeClass(curlink, this._CssClasses.NAV_LINK_CURRENT);
        // if (curlink && u.isIE8){
        // 	var sub = curlink.parentNode.querySelector('.'+this._CssClasses.NAV_SUB);
        // 	if (sub){
        // 		sub.style.maxHeight = '0';
        // 	}
        // }

        var item = u.closest(e.target, this._CssClasses.NAV_LINK);

        if (item) {
            u.addClass(item, this._CssClasses.NAV_LINK_CURRENT);
            var sub = item.parentNode.querySelector('.' + this._CssClasses.NAV_SUB),
                open = u.hasClass(item, this._CssClasses.NAV_LINK_OPEN);
            if (sub && open) {
                u.removeClass(item, this._CssClasses.NAV_LINK_OPEN);
                if (u.isIE8) sub.style.maxHeight = 0;
            }
            if (sub && !open) {
                u.addClass(item, this._CssClasses.NAV_LINK_OPEN);
                if (u.isIE8) sub.style.maxHeight = '999px';
            }
            // sub && open && u.removeClass(item, this._CssClasses.NAV_LINK_OPEN);
            // sub && !open && u.addClass(item, this._CssClasses.NAV_LINK_OPEN);
        }
    }
});

u.compMgr.regComp({
    comp: u.NavMenu,
    compAsString: 'u.NavMenu',
    css: 'u-navmenu'
});
'use strict';

u.Text = u.BaseComponent.extend({
    _Constant: {
        NO_MAX_ROWS: -1,
        MAX_ROWS_ATTRIBUTE: 'maxrows'
    },

    _CssClasses: {
        LABEL: 'u-label',
        INPUT: 'u-input',
        IS_DIRTY: 'is-dirty',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_INVALID: 'is-invalid',
        IS_UPGRADED: 'is-upgraded'
    },

    init: function init() {
        var oThis = this;
        this.maxRows = this._Constant.NO_MAX_ROWS;
        this.label_ = this.element.querySelector('.' + this._CssClasses.LABEL);
        this._input = this.element.querySelector('input');

        if (this._input) {
            if (this._input.hasAttribute(
            /** @type {string} */this._Constant.MAX_ROWS_ATTRIBUTE)) {
                this.maxRows = parseInt(this._input.getAttribute(
                /** @type {string} */this._Constant.MAX_ROWS_ATTRIBUTE), 10);
                if (isNaN(this.maxRows)) {
                    this.maxRows = this._Constant.NO_MAX_ROWS;
                }
            }

            this.boundUpdateClassesHandler = this._updateClasses.bind(this);
            this.boundFocusHandler = this._focus.bind(this);
            this.boundBlurHandler = this._blur.bind(this);
            this.boundResetHandler = this._reset.bind(this);
            this._input.addEventListener('input', this.boundUpdateClassesHandler);
            if (u.isIE8) {
                this._input.addEventListener('propertychange', function () {
                    oThis._updateClasses();
                });
            }
            this._input.addEventListener('focus', this.boundFocusHandler);
            if (u.isIE8 || u.isIE9) {
                if (this.label_) {
                    this.label_.addEventListener('click', function () {
                        this._input.focus();
                    }.bind(this));
                }
            }

            this._input.addEventListener('blur', this.boundBlurHandler);
            this._input.addEventListener('reset', this.boundResetHandler);

            if (this.maxRows !== this._Constant.NO_MAX_ROWS) {
                // TODO: This should handle pasting multi line text.
                // Currently doesn't.
                this.boundKeyDownHandler = this._down.bind(this);
                this._input.addEventListener('keydown', this.boundKeyDownHandler);
            }
            var invalid = u.hasClass(this.element, this._CssClasses.IS_INVALID);
            this._updateClasses();
            u.addClass(this.element, this._CssClasses.IS_UPGRADED);
            if (invalid) {
                u.addClass(this.element, this._CssClasses.IS_INVALID);
            }
        }
    },

    /**
     * Handle input being entered.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _down: function _down(event) {
        var currentRowCount = event.target.value.split('\n').length;
        if (event.keyCode === 13) {
            if (currentRowCount >= this.maxRows) {
                event.preventDefault();
            }
        }
    },
    /**
     * Handle focus.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _focus: function _focus(event) {
        u.addClass(this.element, this._CssClasses.IS_FOCUSED);
    },
    /**
     * Handle lost focus.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _blur: function _blur(event) {
        u.removeClass(this.element, this._CssClasses.IS_FOCUSED);
    },
    /**
     * Handle reset event from out side.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _reset: function _reset(event) {
        this._updateClasses();
    },
    /**
     * Handle class updates.
     *
     * @private
     */
    _updateClasses: function _updateClasses() {
        this.checkDisabled();
        this.checkValidity();
        this.checkDirty();
    },

    // Public methods.

    /**
     * Check the disabled state and update field accordingly.
     *
     * @public
     */
    checkDisabled: function checkDisabled() {
        if (this._input.disabled) {
            u.addClass(this.element, this._CssClasses.IS_DISABLED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DISABLED);
        }
    },
    /**
     * Check the validity state and update field accordingly.
     *
     * @public
     */
    checkValidity: function checkValidity() {
        if (this._input.validity) {
            if (this._input.validity.valid) {
                u.removeClass(this.element, this._CssClasses.IS_INVALID);
            } else {
                u.addClass(this.element, this._CssClasses.IS_INVALID);
            }
        }
    },
    /**
     * Check the dirty state and update field accordingly.
     *
     * @public
     */
    checkDirty: function checkDirty() {
        if (this._input.value && this._input.value.length > 0) {
            u.addClass(this.element, this._CssClasses.IS_DIRTY);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DIRTY);
        }
    },
    /**
     * Disable text field.
     *
     * @public
     */
    disable: function disable() {
        this._input.disabled = true;
        this._updateClasses();
    },
    /**
     * Enable text field.
     *
     * @public
     */
    enable: function enable() {
        this._input.disabled = false;
        this._updateClasses();
    },
    /**
     * Update text field value.
     *
     * @param {string} value The value to which to set the control (optional).
     * @public
     */
    change: function change(value) {
        this._input.value = value || '';
        this._updateClasses();
    }

});

//if (u.compMgr)
//    u.compMgr.addPlug({
//        name:'text',
//        plug: u.Text
//    })

u.compMgr.regComp({
    comp: u.Text,
    compAsString: 'u.Text',
    css: 'u-text'
});
'use strict';

u.Menu = u.BaseComponent.extend({
    _Keycodes: {
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        UP_ARROW: 38,
        DOWN_ARROW: 40
    },
    _CssClasses: {

        BOTTOM_LEFT: 'u-menu-bottom-left', // This is the default.
        BOTTOM_RIGHT: 'u-menu-bottom-right',
        TOP_LEFT: 'u-menu-top-left',
        TOP_RIGHT: 'u-menu-top-right',
        UNALIGNED: 'u-menu-unaligned'
    },

    init: function init() {

        // Create container for the menu.
        var container = document.createElement('div');
        u.addClass(container, 'u-menu-container');
        this.element.parentElement.insertBefore(container, this.element);
        this.element.parentElement.removeChild(this.element);
        container.appendChild(this.element);
        this._container = container;

        // Create outline for the menu (shadow and background).
        var outline = document.createElement('div');
        u.addClass(outline, 'u-menu-outline');
        this._outline = outline;
        container.insertBefore(outline, this.element);

        // Find the "for" element and bind events to it.
        var forElId = this.element.getAttribute('for') || this.element.getAttribute('data-u-for');
        var forEl = null;
        if (forElId) {
            forEl = document.getElementById(forElId);
            if (forEl) {
                this.for_element = forEl;
                u.on(forEl, 'click', this._handleForClick.bind(this));
                u.on(forEl, 'keydown', this._handleForKeyboardEvent.bind(this));
            }
        }

        var items = this.element.querySelectorAll('.u-menu-item');
        this._boundItemKeydown = this._handleItemKeyboardEvent.bind(this);
        this._boundItemClick = this._handleItemClick.bind(this);
        for (var i = 0; i < items.length; i++) {
            // Add a listener to each menu item.
            u.on(items[i], 'click', this._boundItemClick);
            // Add a tab index to each menu item.
            items[i].tabIndex = '-1';
            // Add a keyboard listener to each menu item.
            u.on(items[i], 'keydown', this._boundItemKeydown);
        }

        for (i = 0; i < items.length; i++) {
            var item = items[i];

            var rippleContainer = document.createElement('span');
            u.addClass(rippleContainer, 'u-ripple');
            item.appendChild(rippleContainer);
            new URipple(item);
        }
        //}

        // Copy alignment classes to the container, so the outline can use them.
        if (u.hasClass(this.element, 'u-menu-bottom-left')) {
            u.addClass(this._outline, 'u-menu-bottom-left');
        }
        if (u.hasClass(this.element, 'u-menu-bottom-right')) {
            u.addClass(this._outline, 'u-menu-bottom-right');
        }
        if (u.hasClass(this.element, 'u-menu-top-left')) {
            u.addClass(this._outline, 'u-menu-top-left');
        }
        if (u.hasClass(this.element, 'u-menu-top-right')) {
            u.addClass(this._outline, 'u-menu-top-right');
        }
        if (u.hasClass(this.element, 'u-menu-unaligned')) {
            u.addClass(this._outline, 'u-menu-unaligned');
        }

        u.addClass(container, 'is-upgraded');
    },
    _handleForClick: function _handleForClick(evt) {
        if (this.element && this.for_element) {
            var rect = this.for_element.getBoundingClientRect();
            var forRect = this.for_element.parentElement.getBoundingClientRect();

            if (u.hasClass(this.element, 'u-menu-unaligned')) {
                // Do not position the menu automatically. Requires the developer to
                // manually specify position.
            } else if (u.hasClass(this.element, 'u-menu-bottom-right')) {
                    // Position below the "for" element, aligned to its right.
                    this._container.style.right = forRect.right - rect.right + 'px';
                    this._container.style.top = this.for_element.offsetTop + this.for_element.offsetHeight + 'px';
                } else if (u.hasClass(this.element, 'u-menu-top-left')) {
                    // Position above the "for" element, aligned to its left.
                    this._container.style.left = this.for_element.offsetLeft + 'px';
                    this._container.style.bottom = forRect.bottom - rect.top + 'px';
                } else if (u.hasClass(this.element, 'u-menu-top-right')) {
                    // Position above the "for" element, aligned to its right.
                    this._container.style.right = forRect.right - rect.right + 'px';
                    this._container.style.bottom = forRect.bottom - rect.top + 'px';
                } else {
                    // Default: position below the "for" element, aligned to its left.
                    this._container.style.left = this.for_element.offsetLeft + 'px';
                    this._container.style.top = this.for_element.offsetTop + this.for_element.offsetHeight + 'px';
                }
        }

        this.toggle(evt);
    },
    /**
     * Handles a keyboard event on the "for" element.
     *
     * @param {Event} evt The event that fired.
     * @private
     */
    _handleForKeyboardEvent: function _handleForKeyboardEvent(evt) {
        if (this.element && this._container && this.for_element) {
            var items = this.element.querySelectorAll('.u-menu-item:not([disabled])');

            if (items && items.length > 0 && u.hasClass(this._container, 'is-visible')) {
                if (evt.keyCode === this._Keycodes.UP_ARROW) {
                    u.stopEvent(evt);
                    // evt.preventDefault();
                    items[items.length - 1].focus();
                } else if (evt.keyCode === this._Keycodes.DOWN_ARROW) {
                    u.stopEvent(evt);
                    // evt.preventDefault();
                    items[0].focus();
                }
            }
        }
    },
    /**
     * Handles a keyboard event on an item.
     *
     * @param {Event} evt The event that fired.
     * @private
     */
    _handleItemKeyboardEvent: function _handleItemKeyboardEvent(evt) {
        if (this.element && this._container) {
            var items = this.element.querySelectorAll('.u-menu-item:not([disabled])');

            if (items && items.length > 0 && u.hasClass(this._container, 'is-visible')) {
                var currentIndex = Array.prototype.slice.call(items).indexOf(evt.target);

                if (evt.keyCode === this._Keycodes.UP_ARROW) {
                    u.stopEvent(evt);
                    // evt.preventDefault();
                    if (currentIndex > 0) {
                        items[currentIndex - 1].focus();
                    } else {
                        items[items.length - 1].focus();
                    }
                } else if (evt.keyCode === this._Keycodes.DOWN_ARROW) {
                    u.stopEvent(evt);
                    // evt.preventDefault();
                    if (items.length > currentIndex + 1) {
                        items[currentIndex + 1].focus();
                    } else {
                        items[0].focus();
                    }
                } else if (evt.keyCode === this._Keycodes.SPACE || evt.keyCode === this._Keycodes.ENTER) {
                    u.stopEvent(evt);
                    // evt.preventDefault();
                    // Send mousedown and mouseup to trigger ripple.
                    var e = new MouseEvent('mousedown');
                    evt.target.dispatchEvent(e);
                    e = new MouseEvent('mouseup');
                    evt.target.dispatchEvent(e);
                    // Send click.
                    evt.target.click();
                } else if (evt.keyCode === this._Keycodes.ESCAPE) {
                    u.stopEvent(evt);
                    // evt.preventDefault();
                    this.hide();
                }
            }
        }
    },
    /**
     * Handles a click event on an item.
     *
     * @param {Event} evt The event that fired.
     * @private
     */
    _handleItemClick: function _handleItemClick(evt) {
        if (evt.target.hasAttribute('disabled')) {
            u.stopEvent(evt);
            // evt.stopPropagation();
        } else {
                // Wait some time before closing menu, so the user can see the ripple.
                this._closing = true;
                window.setTimeout(function (evt) {
                    this.hide();
                    this._closing = false;
                }.bind(this), 150);
            }
    },
    /**
     * Calculates the initial clip (for opening the menu) or final clip (for closing
     * it), and applies it. This allows us to animate from or to the correct point,
     * that is, the point it's aligned to in the "for" element.
     *
     * @param {number} height Height of the clip rectangle
     * @param {number} width Width of the clip rectangle
     * @private
     */
    _applyClip: function _applyClip(height, width) {
        if (u.hasClass(this.element, 'u-menu-unaligned')) {
            // Do not clip.
            this.element.style.clip = '';
        } else if (u.hasClass(this.element, 'u-menu-bottom-right')) {
            // Clip to the top right corner of the menu.
            this.element.style.clip = 'rect(0 ' + width + 'px ' + '0 ' + width + 'px)';
        } else if (u.hasClass(this.element, 'u-menu-top-left')) {
            // Clip to the bottom left corner of the menu.
            this.element.style.clip = 'rect(' + height + 'px 0 ' + height + 'px 0)';
        } else if (u.hasClass(this.element, 'u-menu-top-right')) {
            // Clip to the bottom right corner of the menu.
            this.element.style.clip = 'rect(' + height + 'px ' + width + 'px ' + height + 'px ' + width + 'px)';
        } else {
            // Default: do not clip (same as clipping to the top left corner).
            this.element.style.clip = 'rect(' + 0 + 'px ' + 0 + 'px ' + 0 + 'px ' + 0 + 'px)';
        }
    },
    /**
     * Adds an event listener to clean up after the animation ends.
     *
     * @private
     */
    _addAnimationEndListener: function _addAnimationEndListener() {
        var cleanup = function () {
            u.off(this.element, 'transitionend', cleanup);
            // this.element.removeEventListener('transitionend', cleanup);
            u.off(this.element, 'webkitTransitionEnd', cleanup);
            // this.element.removeEventListener('webkitTransitionEnd', cleanup);
            u.removeClass(this.element, 'is-animating');
        }.bind(this);

        // Remove animation class once the transition is done.
        u.on(this.element, 'transitionend', cleanup);
        // this.element.addEventListener('transitionend', cleanup);
        u.on(this.element, 'webkitTransitionEnd', cleanup);
        // this.element.addEventListener('webkitTransitionEnd', cleanup);
    },
    /**
     * Displays the menu.
     *
     * @public
     */
    show: function show(evt) {
        if (this.element && this._container && this._outline) {
            // Measure the inner element.
            var height = this.element.getBoundingClientRect().height;
            var width = this.element.getBoundingClientRect().width;

            if (!width) {
                var left = this.element.getBoundingClientRect().left;
                var right = this.element.getBoundingClientRect().right;
                width = right - left;
            }

            if (!height) {
                var top = this.element.getBoundingClientRect().top;
                var bottom = this.element.getBoundingClientRect().bottom;
                height = bottom - top;
            }

            // Apply the inner element's size to the container and outline.
            this._container.style.width = width + 'px';
            this._container.style.height = height + 'px';
            this._outline.style.width = width + 'px';
            this._outline.style.height = height + 'px';

            var transitionDuration = 0.24;

            // Calculate transition delays for individual menu items, so that they fade
            // in one at a time.
            var items = this.element.querySelectorAll('.u-menu-item');
            for (var i = 0; i < items.length; i++) {
                var itemDelay = null;
                if (u.hasClass(this.element, 'u-menu-top-left') || u.hasClass(this.element, 'u-menu-top-right')) {
                    itemDelay = (height - items[i].offsetTop - items[i].offsetHeight) / height * transitionDuration + 's';
                } else {
                    itemDelay = items[i].offsetTop / height * transitionDuration + 's';
                }
                items[i].style.transitionDelay = itemDelay;
            }

            // Apply the initial clip to the text before we start animating.
            this._applyClip(height, width);

            // Wait for the next frame, turn on animation, and apply the final clip.
            // Also make it visible. This triggers the transitions.
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(function () {
                    u.addClass(this.element, 'is-animating');
                    this.element.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
                    u.addClass(this._container, 'is-visible');
                }.bind(this));
            } else {
                u.addClass(this.element, 'is-animating');
                this.element.style.clip = 'rect(0 ' + width + 'px ' + height + 'px 0)';
                u.addClass(this._container, 'is-visible');
            }

            // Clean up after the animation is complete.
            this._addAnimationEndListener();

            // Add a click listener to the document, to close the menu.
            var firstFlag = true;
            var callback = function (e) {
                if (u.isIE8) {
                    if (firstFlag) {
                        firstFlag = false;
                        return;
                    }
                }
                if (e !== evt && !this._closing && e.target.parentNode !== this.element) {
                    u.off(document, 'click', callback);
                    // document.removeEventListener('click', callback);
                    this.hide();
                }
            }.bind(this);
            u.on(document, 'click', callback);
            // document.addEventListener('click', callback);
        }
    },

    /**
     * Hides the menu.
     *
     * @public
     */
    hide: function hide() {
        if (this.element && this._container && this._outline) {
            var items = this.element.querySelectorAll('.u-menu-item');

            // Remove all transition delays; menu items fade out concurrently.
            for (var i = 0; i < items.length; i++) {
                items[i].style.transitionDelay = null;
            }

            // Measure the inner element.
            var rect = this.element.getBoundingClientRect();
            var height = rect.height;
            var width = rect.width;

            if (!width) {
                var left = rect.left;
                var right = rect.right;
                width = right - left;
            }

            if (!height) {
                var top = rect.top;
                var bottom = rect.bottom;
                height = bottom - top;
            }

            // Turn on animation, and apply the final clip. Also make invisible.
            // This triggers the transitions.
            u.addClass(this.element, 'is-animating');
            this._applyClip(height, width);
            u.removeClass(this._container, 'is-visible');

            // Clean up after the animation is complete.
            this._addAnimationEndListener();
        }
    },
    /**
     * Displays or hides the menu, depending on current state.
     *
     * @public
     */
    toggle: function toggle(evt) {
        if (u.hasClass(this._container, 'is-visible')) {
            this.hide();
        } else {
            this.show(evt);
        }
    }
});

u.compMgr.regComp({
    comp: u.Menu,
    compAsString: 'u.Menu',
    css: 'u-menu'
});
'use strict';

u.MDLayout = u.BaseComponent.extend({
	_CssClasses: {
		MASTER: 'u-mdlayout-master',
		DETAIL: 'u-mdlayout-detail',
		PAGE: 'u-mdlayout-page',
		PAGE_HEADER: 'u-mdlayout-page-header',
		PAGE_SECTION: 'u-mdlayout-page-section',
		PAGE_FOOTER: 'u-mdlayout-page-footer'
	},
	init: function init() {
		//this.browser = _getBrowserInfo();
		var me = this;
		this.minWidth = 600;
		//this.options = $.extend({}, MDLayout.DEFAULTS, options)
		//this.$element.css('position','relative').css('width','100%').css('height','100%').css('overflow','hidden')
		this._master = this.element.querySelector('.' + this._CssClasses.MASTER);
		this._detail = this.element.querySelector('.' + this._CssClasses.DETAIL);

		//this.$master.css('float','left').css('height','100%')
		//this.$detail.css('height','100%').css('overflow','hidden').css('position','relative');

		this.masterWidth = this._master.offsetWidth;
		this.detailWidth = this._detail.offsetWidth;
		this.mPages = this._master.querySelectorAll('.' + this._CssClasses.PAGE);
		this.dPages = this._detail.querySelectorAll('.' + this._CssClasses.PAGE);
		this.mPageMap = {};
		this.dPageMap = {};
		this.initPages(this.mPages, 'master');
		this.initPages(this.dPages, 'detail');

		this.mHistory = [];
		this.dHistory = [];
		this.isNarrow = null;
		this.response();
		u.on(window, 'resize', function () {
			me.response();
		});
	},

	initPages: function initPages(pages, type) {
		var pageMap, pWidth;
		if (type === 'master') {
			pageMap = this.mPageMap;
			pWidth = this.masterWidth;
		} else {
			pageMap = this.dPageMap;
			pWidth = this.detailWidth;
		}
		for (var i = 0; i < pages.length; i++) {
			var pid = pages[i].getAttribute('id');
			if (!pid) throw new Error('u-mdlayout-page mast have id attribute');
			pageMap[pid] = pages[i];
			if (i === 0) {
				if (type === 'master') this.current_m_pageId = pid;else this.current_d_pageId = pid;
				u.addClass(pages[i], 'current');
				//pages[i].style.transform = 'translate3d('+ pWidth +'px,0,0)';
				pages[i].style.transform = 'translate3d(0,0,0)';
			} else {
				pages[i].style.transform = 'translate3d(' + pWidth + 'px,0,0)';
			}
			if (u.isIE8 || u.isIE9) {
				u.addClass(pages[i], 'let-ie9');
			}
		}
	},

	//	MDLayout.DEFAULTS = {
	//		minWidth: 600,
	////		masterFloat: false,
	//		afterNarrow:function(){},
	//		afterUnNarrow:function(){},
	//		afterMasterGo:function(pageId){},
	//		afterMasterBack:function(pageId){},
	//		afterDetailGo:function(pageId){},
	//		afterDetailBack:function(pageId){}
	//	}

	response: function response() {
		var totalWidth = this.element.offsetWidth;
		if (totalWidth < this.minWidth) {
			if (this.isNarrow == null || this.isNarrow == false) this.isNarrow = true;
			this.hideMaster();
		} else {
			if (this.isNarrow == null || this.isNarrow == true) this.isNarrow = false;
			this.showMaster();
		}
		this.calcWidth();
	},

	calcWidth: function calcWidth() {
		if (!(u.isIE8 || u.isIE9)) {
			this.detailWidth = this._detail.offsetWidth;
			this.masterWidth = this._master.offsetWidth;
			//TODO this.mHistory中的panel应该置为-值
			for (var i = 0; i < this.dPages.length; i++) {
				var pid = this.dPages[i].getAttribute('id');
				if (pid !== this.current_d_pageId) {
					this.dPages[i].style.transform = 'translate3d(' + this.detailWidth + 'px,0,0)';
				}
			}
			//this.$detail.find('[data-role="page"]').css('transform','translate3d('+ this.detailWidth +'px,0,0)')
			//this.$detail.find('#' + this.current_d_pageId).css('transform','translate3d(0,0,0)')
		}
	},

	mGo: function mGo(pageId) {
		if (this.current_m_pageId == pageId) return;
		this.mHistory.push(this.current_m_pageId);
		_hidePage(this.mPageMap[this.current_m_pageId], this, '-' + this.masterWidth);
		this.current_m_pageId = pageId;
		_showPage(this.mPageMap[this.current_m_pageId], this);
	},

	mBack: function mBack() {
		if (this.mHistory.length == 0) return;
		_hidePage(this.mPageMap[this.current_m_pageId], this, this.masterWidth);
		this.current_m_pageId = this.mHistory.pop();
		_showPage(this.mPageMap[this.current_m_pageId], this);
	},

	dGo: function dGo(pageId) {
		if (this.current_d_pageId == pageId) return;
		this.dHistory.push(this.current_d_pageId);
		_hidePage(this.dPageMap[this.current_d_pageId], this, '-' + this.detailWidth);
		this.current_d_pageId = pageId;
		_showPage(this.dPageMap[this.current_d_pageId], this);
	},

	dBack: function dBack() {
		if (this.dHistory.length == 0) return;
		_hidePage(this.dPageMap[this.current_d_pageId], this, this.detailWidth);
		this.current_d_pageId = this.dHistory.pop();
		_showPage(this.dPageMap[this.current_d_pageId], this);
	},

	showMaster: function showMaster() {
		if (u.isIE8 || u.isIE9) this._master.style.display = 'block';else {
			this._master.style.transform = 'translate3d(0,0,0)';
		}
		if (!this.isNarrow) this._master.style.position = 'relative';
	},

	hideMaster: function hideMaster() {
		if (this._master.offsetLeft < 0 || this._master.style.display == 'none') return;
		if (u.isIE8 || u.isIE9) this._master.style.display = 'none';else {
			this._master.style.transform = 'translate3d(-' + this.masterWidth + 'px,0,0)';
		}
		this._master.style.position = 'absolute';
		this._master.style.zIndex = 5;
		this.calcWidth();
	}
});

/**
 * masterFloat属性只有在宽屏下起作用，为true时，master层浮动于detail层之上
 *
 */
//	MDLayout.fn.setMasterFloat = function(float){
//		this.masterFloat = float;
//
//	}

//function _getBrowserInfo(){
//	var browser = {};
//	var ua = navigator.userAgent.toLowerCase();
//	var s;
//	(s = ua.match(/rv:([\d.]+)\) like gecko/)) ? browser.ie = parseInt(s[1]) :
//			(s = ua.match(/msie ([\d.]+)/)) ? browser.ie = s[1] :
//					(s = ua.match(/firefox\/([\d.]+)/)) ? browser.firefox = s[1] :
//							(s = ua.match(/chrome\/([\d.]+)/)) ? browser.chrome = s[1] :
//									(s = ua.match(/opera.([\d.]+)/)) ? browser.opera = s[1] :
//											(s = ua.match(/version\/([\d.]+).*safari/)) ? browser.safari = s[1] : 0;
//	return browser;
//}

function _showPage(el, me) {
	u.addClass(el, 'current');
	if (!(u.isIE8 || u.isIE9)) el.style.transform = 'translate3d(0,0,0)';
}

function _hidePage(el, me, width) {
	u.removeClass(el, 'current');
	if (!(u.isIE8 || u.isIE9)) el.style.transform = 'translate3d(' + width + 'px,0,0)';
}

u.compMgr.regComp({
	comp: u.MDLayout,
	compAsString: 'u.MDLayout',
	css: 'u-mdlayout'
});
'use strict';

u.Tabs = u.BaseComponent.extend({
	_Constant: {},
	_CssClasses: {
		TAB_CLASS: 'u-tabs__tab',
		PANEL_CLASS: 'u-tabs__panel',
		ACTIVE_CLASS: 'is-active',
		UPGRADED_CLASS: 'is-upgraded',

		U_JS_RIPPLE_EFFECT: 'u-js-ripple-effect',
		U_RIPPLE_CONTAINER: 'u-tabs__ripple-container',
		U_RIPPLE: 'u-ripple',
		U_JS_RIPPLE_EFFECT_IGNORE_EVENTS: 'u-js-ripple-effect--ignore-events'
	},

	/**
  * Handle clicks to a tabs component
  *
  * @private
  */
	initTabs_: function initTabs_() {
		u.addClass(this.element, this._CssClasses.U_JS_RIPPLE_EFFECT_IGNORE_EVENTS);

		// Select element tabs, document panels
		this.tabs_ = this.element.querySelectorAll('.' + this._CssClasses.TAB_CLASS);
		this.panels_ = this.element.querySelectorAll('.' + this._CssClasses.PANEL_CLASS);

		// Create new tabs for each tab element
		for (var i = 0; i < this.tabs_.length; i++) {
			new Tab(this.tabs_[i], this);
		}
		u.addClass(this.element, this._CssClasses.UPGRADED_CLASS);
	},

	/**
  * Reset tab state, dropping active classes
  *
  * @private
  */
	resetTabState_: function resetTabState_() {
		for (var k = 0; k < this.tabs_.length; k++) {
			u.removeClass(this.tabs_[k], this._CssClasses.ACTIVE_CLASS);
		}
	},

	/**
  * Reset panel state, droping active classes
  *
  * @private
  */
	resetPanelState_: function resetPanelState_() {
		for (var j = 0; j < this.panels_.length; j++) {
			u.removeClass(this.panels_[j], this._CssClasses.ACTIVE_CLASS);
		}
	},
	show: function show(itemId) {
		var panel = this.element.querySelector('#' + itemId);
		var tab = this.element.querySelector("[href='#" + itemId + "']");
		this.resetTabState_();
		this.resetPanelState_();
		u.addClass(tab, this._CssClasses.ACTIVE_CLASS);
		u.addClass(panel, this._CssClasses.ACTIVE_CLASS);
	},

	/**
  * Initialize element.
  */
	init: function init() {
		if (this.element) {
			this.initTabs_();
		}
	}
});

/**
 * Constructor for an individual tab.
 *
 * @constructor
 * @param {Element} tab The HTML element for the tab.
 * @param {Tabs} ctx The Tabs object that owns the tab.
 */
function Tab(tab, ctx) {
	if (tab) {
		var rippleContainer = document.createElement('span');
		u.addClass(rippleContainer, ctx._CssClasses.U_RIPPLE_CONTAINER);
		u.addClass(rippleContainer, ctx._CssClasses.U_JS_RIPPLE_EFFECT);
		var ripple = document.createElement('span');
		u.addClass(ripple, ctx._CssClasses.U_RIPPLE);
		rippleContainer.appendChild(ripple);
		tab.appendChild(rippleContainer);

		tab.ripple = new u.Ripple(tab);

		tab.addEventListener('click', function (e) {
			u.stopEvent(e);
			// e.preventDefault();
			var href = tab.href.split('#')[1];
			var panel = ctx.element.querySelector('#' + href);
			ctx.resetTabState_();
			ctx.resetPanelState_();
			u.addClass(tab, ctx._CssClasses.ACTIVE_CLASS);
			u.addClass(panel, ctx._CssClasses.ACTIVE_CLASS);
		});
	}
}

u.compMgr.regComp({
	comp: u.Tabs,
	compAsString: 'u.Tabs',
	css: 'u-tabs'
});
'use strict';

u.Checkbox = u.BaseComponent.extend({
    _Constant: {
        TINY_TIMEOUT: 0.001
    },

    _CssClasses: {
        INPUT: 'u-checkbox-input',
        BOX_OUTLINE: 'u-checkbox-outline',
        FOCUS_HELPER: 'u-checkbox-focus-helper',
        TICK_OUTLINE: 'u-checkbox-tick-outline',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked',
        IS_UPGRADED: 'is-upgraded'
    },
    init: function init() {
        this._inputElement = this.element.querySelector('input');

        var boxOutline = document.createElement('span');
        u.addClass(boxOutline, this._CssClasses.BOX_OUTLINE);

        var tickContainer = document.createElement('span');
        u.addClass(tickContainer, this._CssClasses.FOCUS_HELPER);

        var tickOutline = document.createElement('span');
        u.addClass(tickOutline, this._CssClasses.TICK_OUTLINE);

        boxOutline.appendChild(tickOutline);

        this.element.appendChild(tickContainer);
        this.element.appendChild(boxOutline);

        //if (this.element.classList.contains(this._CssClasses.RIPPLE_EFFECT)) {
        //  u.addClass(this.element,this._CssClasses.RIPPLE_IGNORE_EVENTS);
        this.rippleContainerElement_ = document.createElement('span');
        //this.rippleContainerElement_.classList.add(this._CssClasses.RIPPLE_CONTAINER);
        //this.rippleContainerElement_.classList.add(this._CssClasses.RIPPLE_EFFECT);
        //this.rippleContainerElement_.classList.add(this._CssClasses.RIPPLE_CENTER);
        this.boundRippleMouseUp = this._onMouseUp.bind(this);
        this.rippleContainerElement_.addEventListener('mouseup', this.boundRippleMouseUp);

        //var ripple = document.createElement('span');
        //ripple.classList.add(this._CssClasses.RIPPLE);

        //this.rippleContainerElement_.appendChild(ripple);
        this.element.appendChild(this.rippleContainerElement_);
        new URipple(this.rippleContainerElement_);

        //}
        this.boundInputOnChange = this._onChange.bind(this);
        this.boundInputOnFocus = this._onFocus.bind(this);
        this.boundInputOnBlur = this._onBlur.bind(this);
        this.boundElementMouseUp = this._onMouseUp.bind(this);
        //this._inputElement.addEventListener('change', this.boundInputOnChange);
        //this._inputElement.addEventListener('focus', this.boundInputOnFocus);
        //this._inputElement.addEventListener('blur', this.boundInputOnBlur);
        //this.element.addEventListener('mouseup', this.boundElementMouseUp);
        if (!u.hasClass(this.element, 'only-style')) {
            u.on(this.element, 'click', function (e) {
                if (!this._inputElement.disabled) {
                    this.toggle();
                    u.stopEvent(e);
                }
            }.bind(this));
        }

        this._updateClasses();
        u.addClass(this.element, this._CssClasses.IS_UPGRADED);
    },

    _onChange: function _onChange(event) {
        this._updateClasses();
        this.trigger('change', { isChecked: this._inputElement.checked });
    },

    _onFocus: function _onFocus() {
        u.addClass(this.element, this._CssClasses.IS_FOCUSED);
    },

    _onBlur: function _onBlur() {
        u.removeClass(this.element, this._CssClasses.IS_FOCUSED);
    },

    _onMouseUp: function _onMouseUp(event) {
        this._blur();
    },

    /**
     * Handle class updates.
     *
     * @private
     */
    _updateClasses: function _updateClasses() {
        this.checkDisabled();
        this.checkToggleState();
    },

    /**
     * Add blur.
     *
     * @private
     */
    _blur: function _blur() {
        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this._inputElement.blur();
        }.bind(this), /** @type {number} */this._Constant.TINY_TIMEOUT);
    },

    // Public methods.

    /**
     * Check the inputs toggle state and update display.
     *
     * @public
     */
    checkToggleState: function checkToggleState() {
        if (this._inputElement.checked) {
            u.addClass(this.element, this._CssClasses.IS_CHECKED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_CHECKED);
        }
    },

    /**
     * Check the inputs disabled state and update display.
     *
     * @public
     */
    checkDisabled: function checkDisabled() {
        if (this._inputElement.disabled) {
            u.addClass(this.element, this._CssClasses.IS_DISABLED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DISABLED);
        }
    },

    isChecked: function isChecked() {
        //return u.hasClass(this.element,this._CssClasses.IS_CHECKED);
        return this._inputElement.checked;
    },

    toggle: function toggle() {
        //return;
        if (this.isChecked()) {
            this.uncheck();
        } else {
            this.check();
        }
    },

    /**
     * Disable checkbox.
     *
     * @public
     */
    disable: function disable() {
        this._inputElement.disabled = true;
        this._updateClasses();
    },

    /**
     * Enable checkbox.
     *
     * @public
     */
    enable: function enable() {
        this._inputElement.disabled = false;
        this._updateClasses();
    },

    /**
     * Check checkbox.
     *
     * @public
     */
    check: function check() {
        this._inputElement.checked = true;
        this._updateClasses();
        this.boundInputOnChange();
    },

    /**
     * Uncheck checkbox.
     *
     * @public
     */
    uncheck: function uncheck() {
        this._inputElement.checked = false;
        this._updateClasses();
        this.boundInputOnChange();
    }

});

if (u.compMgr) u.compMgr.regComp({
    comp: u.Checkbox,
    compAsString: 'u.Checkbox',
    css: 'u-checkbox'
});
'use strict';

u.Radio = u.BaseComponent.extend({
    Constant_: {
        TINY_TIMEOUT: 0.001
    },

    _CssClasses: {
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked',
        IS_UPGRADED: 'is-upgraded',
        JS_RADIO: 'u-radio',
        RADIO_BTN: 'u-radio-button',
        RADIO_OUTER_CIRCLE: 'u-radio-outer-circle',
        RADIO_INNER_CIRCLE: 'u-radio-inner-circle'
    },

    init: function init() {
        this._btnElement = this.element.querySelector('input');

        this._boundChangeHandler = this._onChange.bind(this);
        this._boundFocusHandler = this._onChange.bind(this);
        this._boundBlurHandler = this._onBlur.bind(this);
        this._boundMouseUpHandler = this._onMouseup.bind(this);

        var outerCircle = document.createElement('span');
        u.addClass(outerCircle, this._CssClasses.RADIO_OUTER_CIRCLE);

        var innerCircle = document.createElement('span');
        u.addClass(innerCircle, this._CssClasses.RADIO_INNER_CIRCLE);

        this.element.appendChild(outerCircle);
        this.element.appendChild(innerCircle);

        var rippleContainer;
        //if (this.element.classList.contains( this._CssClasses.RIPPLE_EFFECT)) {
        //  u.addClass(this.element,this._CssClasses.RIPPLE_IGNORE_EVENTS);
        rippleContainer = document.createElement('span');
        //rippleContainer.classList.add(this._CssClasses.RIPPLE_CONTAINER);
        //rippleContainer.classList.add(this._CssClasses.RIPPLE_EFFECT);
        //rippleContainer.classList.add(this._CssClasses.RIPPLE_CENTER);
        rippleContainer.addEventListener('mouseup', this._boundMouseUpHandler);

        //var ripple = document.createElement('span');
        //ripple.classList.add(this._CssClasses.RIPPLE);

        //rippleContainer.appendChild(ripple);
        this.element.appendChild(rippleContainer);
        new URipple(rippleContainer);
        //}

        this._btnElement.addEventListener('change', this._boundChangeHandler);
        this._btnElement.addEventListener('focus', this._boundFocusHandler);
        this._btnElement.addEventListener('blur', this._boundBlurHandler);
        this.element.addEventListener('mouseup', this._boundMouseUpHandler);

        this._updateClasses();
        u.addClass(this.element, this._CssClasses.IS_UPGRADED);
    },

    _onChange: function _onChange(event) {
        // Since other radio buttons don't get change events, we need to look for
        // them to update their classes.
        var radios = document.querySelectorAll('.' + this._CssClasses.JS_RADIO);
        for (var i = 0; i < radios.length; i++) {
            var button = radios[i].querySelector('.' + this._CssClasses.RADIO_BTN);
            // Different name == different group, so no point updating those.
            if (button.getAttribute('name') === this._btnElement.getAttribute('name')) {
                if (radios[i]['u.Radio']) {
                    radios[i]['u.Radio']._updateClasses();
                }
            }
        }
        this.trigger('change', { isChecked: this._btnElement.checked });
    },

    /**
     * Handle focus.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _onFocus: function _onFocus(event) {
        u.addClass(this.element, this._CssClasses.IS_FOCUSED);
    },

    /**
     * Handle lost focus.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _onBlur: function _onBlur(event) {
        u.removeClass(this.element, this._CssClasses.IS_FOCUSED);
    },

    /**
     * Handle mouseup.
     *
     * @param {Event} event The event that fired.
     * @private
     */
    _onMouseup: function _onMouseup(event) {
        this._blur();
    },

    /**
     * Update classes.
     *
     * @private
     */
    _updateClasses: function _updateClasses() {
        this.checkDisabled();
        this.checkToggleState();
    },

    /**
     * Add blur.
     *
     * @private
     */
    _blur: function _blur() {

        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this._btnElement.blur();
        }.bind(this), /** @type {number} */this.Constant_.TINY_TIMEOUT);
    },

    // Public methods.

    /**
     * Check the components disabled state.
     *
     * @public
     */
    checkDisabled: function checkDisabled() {
        if (this._btnElement.disabled) {
            u.addClass(this.element, this._CssClasses.IS_DISABLED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DISABLED);
        }
    },

    /**
     * Check the components toggled state.
     *
     * @public
     */
    checkToggleState: function checkToggleState() {
        if (this._btnElement.checked) {
            u.addClass(this.element, this._CssClasses.IS_CHECKED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_CHECKED);
        }
    },

    /**
     * Disable radio.
     *
     * @public
     */
    disable: function disable() {
        this._btnElement.disabled = true;
        this._updateClasses();
    },

    /**
     * Enable radio.
     *
     * @public
     */
    enable: function enable() {
        this._btnElement.disabled = false;
        this._updateClasses();
    },

    /**
     * Check radio.
     *
     * @public
     */
    check: function check() {
        this._btnElement.checked = true;
        this._updateClasses();
    },

    uncheck: function uncheck() {
        this._btnElement.checked = false;
        this._updateClasses();
    }

});

u.compMgr.regComp({
    comp: u.Radio,
    compAsString: 'u.Radio',
    css: 'u-radio'
});
'use strict';

u.Switch = u.BaseComponent.extend({
    _Constant: {
        TINY_TIMEOUT: 0.001
    },

    _CssClasses: {
        INPUT: 'u-switch-input',
        TRACK: 'u-switch-track',
        THUMB: 'u-switch-thumb',
        FOCUS_HELPER: 'u-switch-focus-helper',
        IS_FOCUSED: 'is-focused',
        IS_DISABLED: 'is-disabled',
        IS_CHECKED: 'is-checked'
    },

    init: function init() {
        this._inputElement = this.element.querySelector('.' + this._CssClasses.INPUT);

        var track = document.createElement('div');
        u.addClass(track, this._CssClasses.TRACK);

        var thumb = document.createElement('div');
        u.addClass(thumb, this._CssClasses.THUMB);

        var focusHelper = document.createElement('span');
        u.addClass(focusHelper, this._CssClasses.FOCUS_HELPER);

        thumb.appendChild(focusHelper);

        this.element.appendChild(track);
        this.element.appendChild(thumb);

        this.boundMouseUpHandler = this._onMouseUp.bind(this);

        //if (this.element.classList.contains(this._CssClasses.RIPPLE_EFFECT)) {
        //  u.addClass(this.element,this._CssClasses.RIPPLE_IGNORE_EVENTS);
        this._rippleContainerElement = document.createElement('span');
        //this._rippleContainerElement.classList.add(this._CssClasses.RIPPLE_CONTAINER);
        //this._rippleContainerElement.classList.add(this._CssClasses.RIPPLE_EFFECT);
        //this._rippleContainerElement.classList.add(this._CssClasses.RIPPLE_CENTER);
        this._rippleContainerElement.addEventListener('mouseup', this.boundMouseUpHandler);

        //var ripple = document.createElement('span');
        //ripple.classList.add(this._CssClasses.RIPPLE);

        //this._rippleContainerElement.appendChild(ripple);
        this.element.appendChild(this._rippleContainerElement);
        new URipple(this._rippleContainerElement);
        //}

        this.boundChangeHandler = this._onChange.bind(this);
        this.boundFocusHandler = this._onFocus.bind(this);
        this.boundBlurHandler = this._onBlur.bind(this);

        this._inputElement.addEventListener('change', this.boundChangeHandler);
        this._inputElement.addEventListener('focus', this.boundFocusHandler);
        this._inputElement.addEventListener('blur', this.boundBlurHandler);
        this.element.addEventListener('mouseup', this.boundMouseUpHandler);

        this._updateClasses();
        u.addClass(this.element, 'is-upgraded');
    },

    _onChange: function _onChange(event) {
        this._updateClasses();
        this.trigger('change', { isChecked: this._inputElement.checked });
    },

    _onFocus: function _onFocus(event) {
        u.addClass(this.element, this._CssClasses.IS_FOCUSED);
    },

    _onBlur: function _onBlur(event) {
        u.removeClass(this.element, this._CssClasses.IS_FOCUSED);
    },

    _onMouseUp: function _onMouseUp(event) {
        this._blur();
    },

    _updateClasses: function _updateClasses() {
        this.checkDisabled();
        this.checkToggleState();
    },

    _blur: function _blur() {
        // TODO: figure out why there's a focus event being fired after our blur,
        // so that we can avoid this hack.
        window.setTimeout(function () {
            this._inputElement.blur();
        }.bind(this), /** @type {number} */this._Constant.TINY_TIMEOUT);
    },

    // Public methods.

    checkDisabled: function checkDisabled() {
        if (this._inputElement.disabled) {
            u.addClass(this.element, this._CssClasses.IS_DISABLED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_DISABLED);
        }
    },

    checkToggleState: function checkToggleState() {
        if (this._inputElement.checked) {
            u.addClass(this.element, this._CssClasses.IS_CHECKED);
        } else {
            u.removeClass(this.element, this._CssClasses.IS_CHECKED);
        }
    },

    isChecked: function isChecked() {
        //return u.hasClass(this.element,this._CssClasses.IS_CHECKED);
        return this._inputElement.checked;
    },

    toggle: function toggle() {
        //return;
        if (this.isChecked()) {
            this.uncheck();
        } else {
            this.check();
        }
    },

    disable: function disable() {
        this._inputElement.disabled = true;
        this._updateClasses();
    },

    enable: function enable() {
        this._inputElement.disabled = false;
        this._updateClasses();
    },

    check: function check() {
        this._inputElement.checked = true;
        this._updateClasses();
    },

    uncheck: function uncheck() {
        this._inputElement.checked = false;
        this._updateClasses();
    }

});

u.compMgr.regComp({
    comp: u.Switch,
    compAsString: 'u.Switch',
    css: 'u-switch'
});
'use strict';

u.Loading = u.BaseComponent.extend({
  _Constant: {
    U_LOADING_LAYER_COUNT: 4
  },

  _CssClasses: {
    U_LOADING_LAYER: 'u-loading-layer',
    U_LOADING_CIRCLE_CLIPPER: 'u-loading-circle-clipper',
    U_LOADING_CIRCLE: 'u-loading-circle',
    U_LOADING_GAP_PATCH: 'u-loading-gap-patch',
    U_LOADING_LEFT: 'u-loading-left',
    U_LOADING_RIGHT: 'u-loading-right'
  },

  init: function init() {
    if (u.isIE8 || u.isIE9) {
      var img = document.createElement('div');
      img.className = "loadingImg";
      this.element.appendChild(img);
    } else {
      for (var i = 1; i <= this._Constant.U_LOADING_LAYER_COUNT; i++) {
        this.createLayer(i);
      }
    }
    u.addClass(this.element, 'is-upgraded');
  },

  createLayer: function createLayer(index) {
    var layer = document.createElement('div');
    u.addClass(layer, this._CssClasses.U_LOADING_LAYER);
    u.addClass(layer, this._CssClasses.U_LOADING_LAYER + '-' + index);

    var leftClipper = document.createElement('div');
    u.addClass(leftClipper, this._CssClasses.U_LOADING_CIRCLE_CLIPPER);
    u.addClass(leftClipper, this._CssClasses.U_LOADING_LEFT);

    var gapPatch = document.createElement('div');
    u.addClass(gapPatch, this._CssClasses.U_LOADING_GAP_PATCH);

    var rightClipper = document.createElement('div');
    u.addClass(rightClipper, this._CssClasses.U_LOADING_CIRCLE_CLIPPER);
    u.addClass(rightClipper, this._CssClasses.U_LOADING_RIGHT);

    var circleOwners = [leftClipper, gapPatch, rightClipper];

    for (var i = 0; i < circleOwners.length; i++) {
      var circle = document.createElement('div');
      u.addClass(circle, this._CssClasses.U_LOADING_CIRCLE);
      circleOwners[i].appendChild(circle);
    }

    layer.appendChild(leftClipper);
    layer.appendChild(gapPatch);
    layer.appendChild(rightClipper);

    this.element.appendChild(layer);
  },

  stop: function stop() {
    u.removeClass(this.element, 'is-active');
  },

  start: function start() {
    u.addClass(this.element, 'is-active');
  }

});

u.compMgr.regComp({
  comp: u.Loading,
  compAsString: 'u.Loading',
  css: 'u-loading'
});

u.showLoading = function (op) {
  var htmlStr = '<div class="alert alert-waiting"><i class="fa fa-spinner fa-spin"></i></div>';
  document.body.appendChild(u.makeDOM(htmlStr));
  htmlStr = '<div class="alert-backdrop" role="waiting-backdrop"></div>';
  document.body.appendChild(u.makeDOM(htmlStr));
};

u.hideLoading = function () {
  var divs = document.querySelectorAll('.alert-waiting,.alert-backdrop');
  for (var i = 0; i < divs.length; i++) {
    document.body.removeChild(divs[i]);
  }
};

//兼容性保留
u.showWaiting = u.showLoading;
u.removeWaiting = u.hideLoading;
"use strict";

/*
*加载loading
*/
u.loadTemplate = "<div class='u-loader-container'><div class='u-loader'>{centerContent}</div>{loadDesc}</div>"; //{centerContent}为加载条中间内容
/**
 * @param  {Object} options 
 * @return {[type]}
 */
u.showLoader = function (options) {
	// hasback:是否含有遮罩层，centerContent加载图标中的内容，parEle加载图标的父元素,hasDesc加载条说明
	var hasback, centerContent, template, parEle, templateDom, loadDesc;
	options = options || {};
	hasback = options["hasback"];
	centerContent = options["centerContent"] || '';
	// hasDesc=options["hasDesc"];
	template = u.loadTemplate.replace('{centerContent}', centerContent);
	loadDesc = options["hasDesc"] ? "<div class='u-loader-desc'>页面加载中，请稍后。。。</div>" : " ";

	template = template.replace("{loadDesc}", loadDesc);

	templateDom = u.makeDOM(template);
	parEle = options["parEle"] || document.body;
	if (hasback) {
		var overlayDiv = u.makeModal(templateDom, parEle);
	}
	if (parEle == document.body) {
		templateDom.style.position = 'fixed';
	}
	parEle.appendChild(templateDom);
};
u.hideLoader = function () {
	var divs = document.querySelectorAll('.u-overlay,.u-loader-container');
	for (var i = 0; i < divs.length; i++) {
		divs[i].parentNode.removeChild(divs[i]);
	}
};
'use strict';

u.Progress = u.BaseComponent.extend({
	_Constant: {},
	_CssClasses: {
		INDETERMINATE_CLASS: 'u-progress__indeterminate'
	},
	setProgress: function setProgress(p) {

		if (u.hasClass(this.element, this._CssClasses.INDETERMINATE_CLASS)) {
			return;
		}

		this.progressbar_.style.width = p + '%';
		return this;
	},
	setBuffer: function setBuffer(p) {
		this.bufferbar_.style.width = p + '%';
		this.auxbar_.style.width = 100 - p + '%';
		return this;
	},

	init: function init() {
		var el = document.createElement('div');
		el.className = 'progressbar bar bar1';
		this.element.appendChild(el);
		this.progressbar_ = el;

		el = document.createElement('div');
		el.className = 'bufferbar bar bar2';
		this.element.appendChild(el);
		this.bufferbar_ = el;

		el = document.createElement('div');
		el.className = 'auxbar bar bar3';
		this.element.appendChild(el);
		this.auxbar_ = el;

		this.progressbar_.style.width = '0%';
		this.bufferbar_.style.width = '100%';
		this.auxbar_.style.width = '0%';

		u.addClass(this.element, 'is-upgraded');

		if (u.isIE8 || u.isIE9) {

			if (u.hasClass(this.element, this._CssClasses.INDETERMINATE_CLASS)) {
				var p = 0;
				var oThis = this;
				setInterval(function () {
					p += 5;
					p = p % 100;
					oThis.progressbar_.style.width = p + '%';
				}, 100);
			}
		}
	}

});

u.compMgr.regComp({
	comp: u.Progress,
	compAsString: 'u.Progress',
	css: 'u-progress'
});
/**
 * Created by dingrf on 2015-11-18.
 */
'use strict';
// u.messageTemplate ='<div class="u-message"><button type="button" class="u-msg-close u-button floating  mini"><span class="">X</span></button>{msg}</div>';

u.messageTemplate = '<div class="u-message"><span class="u-msg-close fa fa-close"></span>{msg}</div>';
// u.nocloseTemplate ='<div class="u-message">{msg}</div>';

u.showMessage = function (options) {
    var msg, position, width, height, showSeconds, msgType, template;
    if (typeof options === 'string') {
        options = { msg: options };
    }
    msg = options['msg'] || "";
    position = options['position'] || "bottom-right"; //center. top-left, top-center, top-right, bottom-left, bottom-center, bottom-right,
    //TODO 后面改规则：没设宽高时，自适应
    width = options['width'] || "";
    // height = options['height'] || "100px";
    msgType = options['msgType'] || 'info';
    //默认为当用户输入的时间，当用户输入的时间为false并且msgType=='info'时，默认显示时间为2s
    showSeconds = parseInt(options['showSeconds']) || (msgType == 'info' ? 2 : 0);

    template = options['template'] || u.messageTemplate;

    template = template.replace('{msg}', msg);
    var msgDom = u.makeDOM(template);
    u.addClass(msgDom, 'u-mes' + msgType);
    msgDom.style.width = width;
    // msgDom.style.height = height;
    // msgDom.style.lineHeight = height;
    if (position == 'bottom-right') {
        msgDom.style.bottom = '10px';
    }

    if (position == 'center') {
        msgDom.style.bottom = '50%';
        msgDom.style.transform = 'translateY(50%)';
    }
    var closeBtn = msgDom.querySelector('.u-msg-close');
    //new u.Button({el:closeBtn});
    u.on(closeBtn, 'click', function () {
        u.removeClass(msgDom, "active");
        setTimeout(function () {
            try {
                document.body.removeChild(msgDom);
            } catch (e) {}
        }, 500);
    });
    document.body.appendChild(msgDom);

    if (showSeconds > 0) {
        setTimeout(function () {
            closeBtn.click();
        }, showSeconds * 1000);
    }
    setTimeout(function () {
        u.addClass(msgDom, "active");
    }, showSeconds * 1);
};

u.showMessageDialog = u.showMessage;
/**
 * Created by dingrf on 2015-11-19.
 */

'use strict';

/**
 * 消息提示框
 * @param options
 */

u.messageDialogTemplate = '<div class="u-msg-dialog">' + '<div class="u-msg-title">' + '<h4>{title}</h4>' + '</div>' + '<div class="u-msg-content">' + '<p>{msg}</p>' + '</div>' + '<div class="u-msg-footer"><button class="u-msg-button u-button primary raised">{btnText}</button></div>' + '</div>';

u.messageDialog = function (options) {
    var title, msg, btnText, template;
    if (typeof options === 'string') {
        options = { msg: options };
    }
    msg = options['msg'] || "";
    title = options['title'] || "提示";
    btnText = options['btnText'] || "确定";
    template = options['template'] || u.messageDialogTemplate;

    template = template.replace('{msg}', msg);
    template = template.replace('{title}', title);
    template = template.replace('{btnText}', btnText);

    var msgDom = u.makeDOM(template);

    var closeBtn = msgDom.querySelector('.u-msg-button');
    new u.Button({ el: closeBtn });
    u.on(closeBtn, 'click', function () {
        document.body.removeChild(msgDom);
        document.body.removeChild(overlayDiv);
    });
    var overlayDiv = u.makeModal(msgDom);
    document.body.appendChild(msgDom);

    this.resizeFun = function () {
        var cDom = msgDom.querySelector('.u-msg-content');
        if (!cDom) return;
        cDom.style.height = '';
        var wholeHeight = msgDom.offsetHeight;
        var contentHeight = msgDom.scrollHeight;
        if (contentHeight > wholeHeight && cDom) cDom.style.height = wholeHeight - (56 + 46) + 'px';
    }.bind(this);

    this.resizeFun();
    u.on(window, 'resize', this.resizeFun);
};
'use strict';

/**
 * Created by dingrf on 2015-11-19.
 */

/**
 * 确认框
 */
u.confirmDialogTemplate = '<div class="u-msg-dialog">' + '<div class="u-msg-title">' + '<h4>{title}</h4>' + '</div>' + '<div class="u-msg-content">' + '<p>{msg}</p>' + '</div>' + '<div class="u-msg-footer"><button class="u-msg-ok u-button primary raised">{okText}</button><button class="u-msg-cancel u-button">{cancelText}</button></div>' + '</div>';

u.confirmDialog = function (options) {
    var title, msg, okText, cancelText, template, onOk, onCancel;
    msg = options['msg'] || "";
    title = options['title'] || "确认";
    okText = options['okText'] || "确定";
    cancelText = options['cancelText'] || "取消";
    onOk = options['onOk'] || function () {};
    onCancel = options['onCancel'] || function () {};
    template = options['template'] || u.confirmDialogTemplate;

    template = template.replace('{msg}', msg);
    template = template.replace('{title}', title);
    template = template.replace('{okText}', okText);
    template = template.replace('{cancelText}', cancelText);

    var msgDom = u.makeDOM(template);
    var okBtn = msgDom.querySelector('.u-msg-ok');
    var cancelBtn = msgDom.querySelector('.u-msg-cancel');
    new u.Button({ el: okBtn });
    new u.Button({ el: cancelBtn });
    u.on(okBtn, 'click', function () {
        if (onOk() !== false) {
            document.body.removeChild(msgDom);
            document.body.removeChild(overlayDiv);
        }
    });
    u.on(cancelBtn, 'click', function () {
        if (onCancel() !== false) {
            document.body.removeChild(msgDom);
            document.body.removeChild(overlayDiv);
        }
    });
    var overlayDiv = u.makeModal(msgDom);
    document.body.appendChild(msgDom);

    this.resizeFun = function () {
        var cDom = msgDom.querySelector('.u-msg-content');
        if (!cDom) return;
        cDom.style.height = '';
        var wholeHeight = msgDom.offsetHeight;
        var contentHeight = msgDom.scrollHeight;
        if (contentHeight > wholeHeight && cDom) cDom.style.height = wholeHeight - (56 + 46) + 'px';
    }.bind(this);

    this.resizeFun();
    u.on(window, 'resize', this.resizeFun);
};
"use strict";

/**
 * Created by dingrf on 2015-11-19.
 */

/**
 * 三按钮确认框（是 否  取消）
 */
u.threeBtnDialog = function () {};
/**
 * Created by dingrf on 2015-11-19.
 */

'use strict';

/**
 * 提示框
 * @param options
 */

u.dialogTemplate = '<div class="u-msg-dialog" id="{id}" style="{width}{height}">' + '{close}' + '</div>';

var dialogMode = function dialogMode(options) {
    if (typeof options === 'string') {
        options = { content: options };
    }
    var defaultOptions = {
        id: '',
        content: '',
        hasCloseMenu: true,
        template: u.dialogTemplate,
        width: '',
        height: ''
    };

    options = u.extend(defaultOptions, options);
    this.id = options['id'];
    this.hasCloseMenu = options['hasCloseMenu'];
    this.content = options['content'];
    this.template = options['template'];
    this.width = options['width'];
    this.height = options['height'];
    this.lazyShow = options['lazyShow'];
    this.create();

    this.resizeFun = function () {
        var cDom = this.contentDom.querySelector('.u-msg-content');
        cDom.style.height = '';
        var wholeHeight = this.templateDom.offsetHeight;
        var contentHeight = this.contentDom.offsetHeight;
        if (contentHeight > wholeHeight && cDom) cDom.style.height = wholeHeight - (56 + 46) + 'px';
    }.bind(this);

    this.resizeFun();
    u.on(window, 'resize', this.resizeFun);
};

dialogMode.prototype.create = function () {
    var closeStr = '';
    var oThis = this;
    if (this.hasCloseMenu) {
        var closeStr = '<div class="u-msg-close"> <span aria-hidden="true">&times;</span></div>';
    }
    var templateStr = this.template.replace('{id}', this.id);
    templateStr = templateStr.replace('{close}', closeStr);
    templateStr = templateStr.replace('{width}', this.width ? 'width:' + this.width + ';' : '');
    templateStr = templateStr.replace('{height}', this.height ? 'height:' + this.height + ';' : '');

    this.contentDom = document.querySelector(this.content); //
    this.templateDom = u.makeDOM(templateStr);
    if (this.contentDom) {
        // msg第一种方式传入选择器，如果可以查找到对应dom节点，则创建整体dialog之后在msg位置添加dom元素
        this.contentDomParent = this.contentDom.parentNode;
        this.contentDom.style.display = 'block';
    } else {
        // 如果查找不到对应dom节点，则按照字符串处理，直接将msg拼到template之后创建dialog
        this.contentDom = u.makeDOM('<div><div class="u-msg-content"><p>' + this.content + '</p></div></div>');
    }
    this.templateDom.appendChild(this.contentDom);
    this.overlayDiv = u.makeModal(this.templateDom);
    if (this.hasCloseMenu) {
        this.closeDiv = this.templateDom.querySelector('.u-msg-close');
        u.on(this.closeDiv, 'click', function () {
            oThis.close();
        });
    }
    if (this.lazyShow) {
        this.templateDom.style.display = 'none';
        this.overlayDiv.style.display = 'none';
    }
    document.body.appendChild(this.templateDom);
    this.isClosed = false;
};

dialogMode.prototype.show = function () {
    if (this.isClosed) {
        this.create();
    }
    this.templateDom.style.display = 'block';
    this.overlayDiv.style.display = 'block';
};

dialogMode.prototype.hide = function () {
    this.templateDom.style.display = 'none';
    this.overlayDiv.style.display = 'none';
};

dialogMode.prototype.close = function () {
    if (this.contentDom) {
        this.contentDom.style.display = 'none';
        this.contentDomParent.appendChild(this.contentDom);
    }
    document.body.removeChild(this.templateDom);
    document.body.removeChild(this.overlayDiv);
    this.isClosed = true;
};

u.dialog = function (options) {
    return new dialogMode(options);
};

/**
 * 对话框向导
 * @param options:  {dialogs: [{content:".J-goods-pro-add-1-dialog",hasCloseMenu:false},
                               {content:".J-goods-pro-add-2-dialog",hasCloseMenu:false},
                            ]
                    }
 */
u.dialogWizard = function (options) {
    var dialogs = [],
        curIndex = 0;
    options.dialogs = options.dialogs || [], len = options.dialogs.length;
    if (len == 0) {
        throw new Error('未加入对话框');
    }
    for (var i = 0; i < len; i++) {
        dialogs.push(u.dialog(u.extend(options.dialogs[i], { lazyShow: true })));
    }
    var wizard = function wizard() {};
    wizard.prototype.show = function () {
        dialogs[curIndex].show();
    };
    wizard.prototype.next = function () {
        dialogs[curIndex].hide();
        dialogs[++curIndex].show();
    };
    wizard.prototype.prev = function () {
        dialogs[curIndex].hide();
        dialogs[--curIndex].show();
    };
    wizard.prototype.close = function () {
        for (var i = 0; i < len; i++) {
            dialogs[i].close();
        }
    };
    return new wizard();
};
'use strict';

u.Combobox = u.BaseComponent.extend({
	DEFAULTS: {
		dataSource: {},
		mutil: false,
		enable: true,
		single: true,
		onSelect: function onSelect() {}
	},
	init: function init() {
		var self = this;
		var element = this.element;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.items = [];
		//this.oLis = [];
		this.mutilPks = [];
		this.oDiv = null;
		Object.defineProperty(element, 'value', {
			get: function get() {

				return this.trueValue;
			},
			set: function set(pk) {

				var items = self.items;
				//var oLis = self.oLis;
				var oLis = self.oDiv.childNodes;

				if (self.options.single == "true" || self.options.single == true) {

					for (var i = 0, length = items.length; i < length; i++) {

						var ipk = items[i].pk;
						if (ipk == pk) {
							this.innerHTML = items[i].name;
							this.trueValue = pk;
							break;
						} else {

							this.trueValue = '';
							this.innerHTML = '';
						}
					}
				} else if (self.options.mutil == "true" || self.options.mutil == true) {

					if (!u.isArray(pk)) {
						if (typeof pk == "string" && pk !== "") {
							pk = pk.split(',');
							self.mutilPks = pk;
						} else {
							return;
						}
					}

					if (self.mutilPks.length == 0) {
						self.mutilPks = pk;
					}

					this.innerHTML = '';
					var valueArr = [];

					for (var j = 0; j < pk.length; j++) {

						for (var i = 0, length = oLis.length; i < length; i++) {
							var ipk = oLis[i].item.pk;
							if (pk[j] == ipk) {

								valueArr.push(pk[j]);

								oLis[i].style.display = 'none';
								var activeSelect = document.createElement("Div");
								activeSelect.className = "mutil-select-div";
								var selectName = "<i class='itemName'>" + items[i].name + "</i>";
								var imageFont = "<i class='fa fa-close'></i>";
								activeSelect.insertAdjacentHTML("beforeEnd", imageFont + selectName);
								this.appendChild(activeSelect);

								//activeSelect.append(imageFont);
								//	activeSelect.append(selectName);

								u.on(activeSelect.querySelector(".fa-close"), 'mousedown', function () {

									//var $this = $(this);
									//var lis = self.oLis;
									//var lis = $(self.oDiv).find('li');
									var lis = self.oDiv.childNodes;
									for (var j = 0, len = lis.length; j < len; j++) {
										if (lis[j].item.name == this.nextSibling.innerHTML) {
											lis[j].style.display = 'block';

											for (var h = 0; h < self.mutilPks.length; h++) {
												if (self.mutilPks[h] == lis[j].item.pk) {
													self.mutilPks.splice(h, 1);
													h--;
												}
											}

											for (var b = 0; b < valueArr.length; b++) {
												if (valueArr[b] == lis[j].item.pk) {
													valueArr.splice(b, 1);
													b--;
												}
											}
										}
									}

									activeSelect.removeChild(this.parentNode);
									element.trueValue = '';
									element.trueValue = valueArr.toString();
									u.trigger(element, 'mutilSelect', valueArr.toString());
								});

								//	var selectName = $("<i class='itemName'>" + items[i].name + "</i>");

								//	var activeSelect = $("<div class='mutil-select-div'></div>")
							}
						}
					}

					this.trueValue = valueArr.toString();
				}
			}
		});
		//禁用下拉框
		if (this.options.readonly === "readonly") return;

		if (this.options.single == "true" || this.options.single == true) {
			this.singleSelect();
		}

		if (this.options.mutil == "true" || this.options.mutil == true) {
			this.mutilSelect();
		}

		this.clickEvent();

		this.blurEvent();

		this.comboFilter();

		this.comboFilterClean();
	}
});

u.Combobox.fn = u.Combobox.prototype;

u.Combobox.fn.createDom = function () {

	var data = this.options.dataSource;
	if (u.isEmptyObject(data)) {
		throw new Error("dataSource为空！");
	}

	var oDiv = document.createElement("div");
	oDiv.className = 'select-list-div';
	//this.oDiv
	this.oDiv = oDiv;
	//新增搜索框

	var searchDiv = document.createElement("div");
	searchDiv.className = 'select-search';
	var searchInput = document.createElement("input");
	searchDiv.appendChild(searchInput);
	oDiv.appendChild(searchDiv);
	//禁用搜索框
	if (this.options.readchange) {
		searchDiv.style.display = "none";
	}
	var oUl = document.createElement("ul");

	oUl.className = 'select-list-ul';

	for (var i = 0; i < data.length; i++) {
		var item = {
			pk: data[i].pk,
			name: data[i].name
		};
		this.items.push(item);
		var oLi = document.createElement("li");

		oLi.item = item;
		oLi.innerHTML = data[i]['name'];

		//this.oLis.push(oLi);

		oUl.appendChild(oLi);
	}

	oDiv.appendChild(oUl);
	oDiv.style.display = 'none';
	document.body.appendChild(oDiv);
};

u.Combobox.fn.focusEvent = function () {
	var self = this;
	u.on(this.element, 'click', function (e) {
		if (self.options.readchange == true) return;
		var returnValue = self.show();

		if (returnValue === 1) return;
		// self.show();

		self.floatLayer();

		self.floatLayerEvent();

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

//下拉图标的点击事件
u.Combobox.fn.clickEvent = function () {
	var self = this;
	//var caret = this.$element.next('.input-group-addon')[0] || this.$element.next(':button')[0];
	var caret = this.element.nextSibling;
	u.on(caret, 'click', function (e) {
		self.show();
		self.floatLayer();
		self.floatLayerEvent();
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

//tab键切换 下拉隐藏	
u.Combobox.fn.blurEvent = function () {
	var self = this;

	u.on(this.element, 'keyup', function (e) {
		var key = e.which || e.keyCode;
		if (key == 9) self.show();
	});
	u.on(this.element, 'keydown', function (e) {
		var key = e.which || e.keyCode;
		if (key == 9) self.hide();
	});
};

u.Combobox.fn.floatLayer = function () {

	if (!document.querySelector(".select-floatDiv")) {

		var oDivTwo = document.createElement("div");
		oDivTwo.className = 'select-floatDiv';
		document.body.appendChild(oDivTwo);
	}
};

u.Combobox.fn.floatLayerEvent = function () {
	var self = this;
	u.on(document.querySelector(".select-floatDiv"), "click", function (e) {

		self.hide();
		this.parentNode.removeChild(this);

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

u.Combobox.fn.show = function () {

	//var oLis = this.oLis;
	var oLis = this.oDiv.querySelector("ul").childNodes;
	var vote = 0;
	for (var i = 0, length = oLis.length; i < length; i++) {

		if (oLis[i].style.display == 'none') {
			vote++;
		}
	}

	if (vote === length) return 1;

	var left = this.element.offsetLeft;
	var top = this.element.offsetTop;

	var selectHeight = this.options.dataSource.length * 30 + 10 + 10;

	var differ = top + u.getStyle(this.element, "height") + selectHeight - (window.outerHeight + window.scrollY);
	var oDiv = this.oDiv;

	if (differ > 0) {

		oDiv.style.left = left + 'px';
		oDiv.style.top = top - selectHeight + 'px';
	} else {

		oDiv.style.left = left + 'px';
		oDiv.style.top = top + u.getStyle(this.element, "height") + 'px';
	}

	oDiv.style.display = 'block';
};

u.Combobox.fn.hide = function () {
	this.oDiv.style.display = 'none';
};

u.Combobox.fn.singleDivValue = function () {
	var self = this;
	//var oLis = this.oLis;
	var oLis = this.oDiv.querySelector("ul").childNodes;
	for (var i = 0; i < oLis.length; i++) {

		u.on(oLis[i], "click", function () {

			var item = this.item;
			self.element.value = item.pk;

			self.oDiv.style.display = 'none';

			self.options.onSelect(item);

			u.trigger(self.element, 'change');
		});
	}
};

u.Combobox.fn.mutilDivValue = function () {
	var self = this;
	//var oLis = this.oLis;
	var oLis = this.oDiv.querySelector("ul").childNodes;
	for (var i = 0; i < oLis.length; i++) {
		u.on(oLis[i], "click", function () {

			var pk = this.item.pk;
			var mutilpks = self.mutilPks;
			var mutilLenth = mutilpks.length;

			if (mutilLenth > 0) {

				for (var k = 0; k < mutilLenth; k++) {

					if (pk == mutilpks[k]) {

						mutilpks.splice(k, 1);
						k--;
					}
				}
			}

			mutilpks.push(pk);

			self.element.value = mutilpks;
			u.trigger(self.element, 'mutilSelect', mutilpks.toString());
			// element.trigger('mutilSelect',mutilpks.toString())

			self.oDiv.style.display = 'none';
			this.style.display = 'none';
			u.trigger(self.element, 'change');
		});
	}
};

u.Combobox.fn.singleSelect = function () {

	this.createDom();
	this.focusEvent();
	this.singleDivValue();
};

u.Combobox.fn.mutilSelect = function () {

	this.createDom();
	this.mutilDivValue();
	this.focusEvent();
};
//过滤下拉选项
u.Combobox.fn.comboFilter = function () {
	var self = this;
	u.on(this.oDiv, "keyup", function () {

		var content = this.querySelector('.select-search input').value;

		var oLis = this.oDiv.querySelector("ul").childNodes;
		for (var i = 0; i < oLis.length; i++) {
			if (oLis[i].item.name.indexOf(content) != -1) {
				oLis[i].style.display = 'block';
			} else {
				oLis[i].style.display = 'none';
			}
		}
	});
};

//过滤的后续处理
u.Combobox.fn.comboFilterClean = function () {
	var self = this;
	u.on(self.element, "click", function () {
		// $(this.$element).on('click',function(){
		// $(self.oDiv).find('.select-search input').val('')  	
		self.oDiv.querySelector('.select-search input').value = "";
		var oLis = this.oDiv.querySelector("ul").childNodes;
		if (self.options.single == "true" || self.options.single == true) {
			for (var i = 0; i < oLis.length; i++) {
				oLis[i].style.display = 'block';
			}
		} else if (self.options.mutil == "true" || self.options.mutil == true) {
			var selectLisIndex = [];
			var selectLisSpan = this.querySelector('.mutil-select-div .itemName');

			for (var i = 0; i < selectLisSpan.length; i++) {
				for (var k = 0; k < oLis.length; k++) {
					if (selectLisSpan[i].innerHTML == oLis[k].item.name) {
						//oLis[k].style.display = 'none';
						selectLisIndex.push(k);
					}
				}
			}

			for (var l = 0; l < oLis.length; l++) {
				oLis[l].style.display = 'block';
				for (var j = 0; j < selectLisIndex.length; j++) {
					if (l == selectLisIndex[j]) oLis[l].style.display = 'none';
				}
			}
		}
	});
};
// var Plugin = function(option) {

// var $this = $(this);
// var data = $this.data('s.select');
// var options = typeof option == 'object' && option

// if (!data) $this.data('s.select', (new Combobox(this, options)))

// }

//动态设置li值
// $.fn.setComboData = function(dataSourse) {
// var $this = $(this).data('s.select');
// if(!$this)return;
// var data = dataSourse;
// if (!$.isArray(data) || data.length == 0) return;

// $this.items.length = 0;

// var Olis = $($this.oDiv).find('li');

// if(data.length < Olis.length){

// for(var k=data.length;k<Olis.length;k++){
// $(Olis[k]).remove();
// }		

// }else if(data.length > Olis.length){
// var liTemplate = Olis[0]
// var oUl = $($this.oDiv).find('ul')
// for(var j=0;j<(data.length-Olis.length);j++){
// $(liTemplate).clone(true).appendTo(oUl)
// }
// }

// Olis = $($this.oDiv).find('li');

// for (var i = 0; i < data.length; i++) {
// var item = {
// pk: data[i].pk,
// name: data[i].name
// }
// $this.items.push(item)
// Olis[i].item = item;
// Olis[i].innerHTML = data[i]['name']
// }

// }

// $.fn.Combobox = Plugin;
if (u.compMgr) u.compMgr.regComp({
	comp: u.Combobox,
	compAsString: 'u.Combobox',
	css: 'u-combobox'
});
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

u.Multilang = u.BaseComponent.extend({
	DEFAULTS: {
		dataSource: {},
		onSelect: function onSelect() {}
	},
	init: function init() {
		var self = this;
		var element = this.element;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.multinfo(this.options.multinfo);
		this.addData(this.options.multidata);
	}
});
u.Multilang.fn = u.Multilang.prototype;
u.Multilang.fn.addData = function (val) {
	var target = this.element,
	    tmparray,
	    target_div = target.parentNode;
	if ((typeof val === "undefined" ? "undefined" : _typeof(val)) == "object") {
		tmparray = val;
	} else {
		tmparray = val.split(",");
	}
	target_div.value = tmparray;
	u.each(tmparray, function (i, node) {
		target_div.querySelectorAll(".m_context")[i].innerHTML = node;
	});
};
u.Multilang.fn.multinfo = function (sort) {

	var target = this.element,
	    me = this,
	    tmplabel = "",
	    close_menu = true,
	    tmpfield = "name";
	if (sort.lang_name) {
		tmpfield = sort.lang_name;
	}
	if (u.isArray(sort)) {

		u.wrap(target, "<div class='multilang_body'><input class='lang_value' contenteditable='true'><span class='fa fa-sort-desc lang_icon'><span class='m_icon'></span></span>");
		u.css(target, "display", "none");

		u.each(sort, function (i, node) {
			if (i) {
				tmplabel += "<label attr='" + tmpfield + (i + 1) + "'><span class='m_context'></span><span class='m_icon'>" + node + "</span></label>";
			} else {
				tmplabel += "<label attr='" + tmpfield + "'><span class='m_context'></span><span class='m_icon'>" + node + "</span></label>";
			}
		});
		var target_div = target.parentNode;

		target_div.insertAdjacentHTML("beforeEnd", "<div class='multilang_menu '>" + tmplabel + "</div>");
		var tmpIconv = target_div.querySelector(".lang_icon"),
		    target_menu = target_div.querySelector(".multilang_menu"),
		    tmpvaluebox = target_div.querySelector(".lang_value");
		u.on(tmpIconv, "click", function () {
			var target_icon = this;
			target_div.querySelector(".lang_value").focus();
			if (u.css(target_menu, "display") == "block") {
				u.css(target_menu, "display", "none");
			} else {
				u.css(target_menu, "display", "block");
			}
		});
		u.on(target_menu, "mouseenter", function () {
			close_menu = false;
		});
		u.on(target_menu, "mouseleave", function () {
			close_menu = true;
		});

		u.on(tmpvaluebox, "blur", function () {
			//this//
			//target_box = me.fixtarget(target_input),
			//target_div = target_input.parents(".multilang_body"),
			target = this;
			tmpkey = target.className.split(" ")[2], tmptext = target.value;

			if (u.hasClass(target, "ready_change")) {
				me.changeData(target_div, tmpkey, tmptext);
			}
			if (close_menu) {
				u.css(target_menu, "display", "none");
			}
		});
		u.on(target_menu, "click", "label", function () {
			var target_label = this,
			    tmpfield = target_label.getAttribute("attr"),
			    tmptext = target_label.querySelector(".m_context").innerHTML,
			    tmpicon = target_label.querySelector(".m_icon").cloneNode(true);

			tmpvaluebox.setAttribute("class", "ready_change lang_value " + tmpfield);
			tmpvaluebox.value = tmptext;
			tmpvaluebox.focus();
			var tmpicom = target_div.querySelector(".lang_icon"),
			    oldicon = target_div.querySelector(".m_icon");
			u.removeClass(tmpicom, "fa-sort-desc");
			tmpicom.replaceChild(tmpicon, oldicon);
		});
	} else {
		console.error('Not object');
	}
};
u.Multilang.fn.changeData = function (target_div, field, text) {
	var tmpdata = target_div.value;
	tmplabel = target_div.querySelector("label[attr='" + field + "']");
	tmpcontext = tmplabel.querySelector(".m_context");
	tmpcontext.innerHTML = text;
	tmpcontext.value = text;
	u.each(target_div.querySelectorAll(".m_context"), function (i, node) {
		tmpdata[i] = node.innerHTML;
	});

	u.trigger(this.element, 'change.u.multilang', { newValue: text, field: field });
};
u.Multilang.fn.getData = function () {
	var target = $(multilang.target).next(".multilang_body")[0],
	    multilang_data = target.value;
	return multilang_data;
};
if (u.compMgr) u.compMgr.regComp({
	comp: u.Multilang,
	compAsString: 'u.Multilang',
	css: 'u-multilang'
});
"use strict";

u.Autocomplete = u.BaseComponent.extend({
	defaults: {
		inputClass: "ac_input",
		resultsClass: "ac_results",
		lineSeparator: "\n",
		cellSeparator: "|",
		minChars: 1,
		delay: 400,
		matchCase: 0,
		matchSubset: 1,
		matchContains: 0,
		cacheLength: 1,
		mustMatch: 0,
		extraParams: {},
		loadingClass: "ac_loading",
		selectFirst: false,
		selectOnly: false,
		maxItemsToShow: -1,
		autoFill: false,
		width: 0,
		source: null,
		select: null,
		multiSelect: false
	},
	//moreClick:function(){},
	init: function init() {
		var self = this;
		this.options = u.extend({}, this.defaults, this.options);
		this.requestIndex = 0;
		this.pending = 0;
		if (this.options.inputClass) {
			u.addClass(this.element, this.options.inputClass);
		}
		this._results = document.querySelector('#autocompdiv');
		if (!this._results) {
			this._results = u.makeDOM('<div id="autocompdiv"></div>');
			document.body.appendChild(this._results);
		}
		this._results.style.display = 'none';
		this._results.style.position = 'absolute';
		u.addClass(this._results, this.options.resultsClass);
		if (this.options.width) {
			this._results.style.width = this.options.width;
		}
		this.timeout = null;
		this.prev = "";
		this.active = -1;
		this.cache = {};
		this.keyb = false;
		this.hasFocus = false;
		this.lastKeyPressCode = null;
		this._initSource();
		u.on(this.element, 'keydown', function (e) {
			self.lastKeyPressCode = e.keyCode;
			switch (e.keyCode) {
				case 38:
					// up
					u.stopEvent(e);
					self.moveSelect(-1);
					break;
				case 40:
					// down
					u.stopEvent(e);
					self.moveSelect(1);
					break;
				case 9: // tab
				case 13:
					// return
					if (self.selectCurrent()) {
						// make sure to blur off the current field
						// self.element.blur();
						u.stopEvent(e);
					}
					break;
				default:
					self.active = -1;
					if (self.timeout) clearTimeout(self.timeout);
					self.timeout = setTimeout(function () {
						self.onChange();
					}, self.options.delay);
					break;
			}
		});
		u.on(this.element, 'focus', function () {
			self.hasFocus = true;
		});
		u.on(this.element, 'blur', function () {
			self.hasFocus = false;
			self.hideResults();
		});
		this.hideResultsNow();
	},
	flushCache: function flushCache() {
		this.cache = {};
		this.cache.data = {};
		this.cache.length = 0;
	},
	_initSource: function _initSource() {
		var array,
		    url,
		    self = this;
		if (u.isArray(this.options.source)) {
			array = this.options.source;
			this.source = function (request, response) {
				//				response( $.ui.autocomplete.filter( array, request.term ) );
				response(self.filterData(request.term, array));
			};
		} else if (typeof this.options.source === "string") {
			url = this.options.source;
			this.source = function (request, response) {
				if (self.xhr) {
					self.xhr.abort();
				}
				self.xhr = u.ajax({
					url: url,
					data: request,
					dataType: "json",
					success: function success(data) {
						response(data);
					},
					error: function error() {
						response([]);
					}
				});
			};
		} else {
			this.source = this.options.source;
		}
	},
	_response: function _response() {
		var self = this;
		var index = ++this.requestIndex;

		return function (content) {
			if (index === self.requestIndex) {
				self.__response(content);
			}

			self.pending--;
			if (!self.pending) {}
		};
	},
	__response: function __response(content) {
		if (content) this.receiveData2(content);
		this.showResults();
	},
	onChange: function onChange() {
		// ignore if the following keys are pressed: [del] [shift] [capslock]
		if (this.lastKeyPressCode == 46 || this.lastKeyPressCode > 8 && this.lastKeyPressCode < 32) return this._results.style.disply = 'none';
		if (!this.element.value) return;
		var vs = this.element.value.split(','),
		    v = vs[vs.length - 1].trim();
		if (v == this.prev) return;
		this.prev = v;
		if (v.length >= this.options.minChars) {
			u.addClass(this.element, this.options.loadingClass);
			this.pending++;
			this.source({ term: v }, this._response());
		} else {
			u.removeClass(this.element, this.options.loadingClass);
			this._results.style.display = 'none';
		}
	},
	moveSelect: function moveSelect(step) {
		var lis = this._results.querySelectorAll('li');
		if (!lis) return;

		this.active += step;

		if (this.active < 0) {
			this.active = 0;
		} else if (this.active >= lis.length) {
			this.active = lis.length - 1;
		}
		lis.forEach(function (li) {
			u.removeClass(li, 'ac_over');
		});
		u.addClass(lis[this.active], 'ac_over');
	},
	selectCurrent: function selectCurrent() {
		var li = this._results.querySelector('li.ac_over'); //$("li.ac_over", this.$results[0])[0];
		if (!li) {
			var _li = this._results.querySelectorAll('li'); //$("li", this.$results[0]);
			if (this.options.selectOnly) {
				if (_li.length == 1) li = _li[0];
			} else if (this.options.selectFirst) {
				li = _li[0];
			}
		}
		if (li) {
			this.selectItem(li);
			return true;
		} else {
			return false;
		}
	},
	selectItem: function selectItem(li) {
		var self = this;
		if (!li) {
			li = document.createElement("li");
			li.selectValue = "";
		}
		var v = li.selectValue ? li.selectValue : li.innerHTML;
		this.lastSelected = v;
		this.prev = v;
		this._results.innerHTML = '';
		if (this.options.multiSelect) {

			if ((this.element.value + ',').indexOf(v + ',') != -1) return;
			var vs = this.element.value.split(',');
			var lastValue = this.element.value.substring(0, this.element.value.lastIndexOf(','));

			this.element.value = (lastValue ? lastValue + ', ' : lastValue) + v + ', ';
		} else {
			this.element.value = v;
		}

		this.hideResultsNow();

		this.element.focus();

		if (this.options.select) setTimeout(function () {
			self.options.select(li._item, self);
		}, 1);
	},
	createSelection: function createSelection(start, end) {
		// get a reference to the input element
		var field = this.element;
		if (field.createTextRange) {
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart("character", start);
			selRange.moveEnd("character", end);
			selRange.select();
		} else if (field.setSelectionRange) {
			field.setSelectionRange(start, end);
		} else {
			if (field.selectionStart) {
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
		field.focus();
	},
	// fills in the input box w/the first match (assumed to be the best match)
	autoFill: function autoFill(sValue) {
		// if the last user key pressed was backspace, don't autofill
		if (this.lastKeyPressCode != 8) {
			// fill in the value (keep the case the user has typed)
			this.element.value = this.element.value + sValue.substring(this.prev.length);
			// select the portion of the value not typed by the user (so the next character will erase)
			this.createSelection(this.prev.length, sValue.length);
		}
	},
	showResults: function showResults() {
		// get the position of the input field right now (in case the DOM is shifted)
		var pos = findPos(this.element);
		// either use the specified width, or autocalculate based on form element
		var iWidth = this.options.width > 0 ? this.options.width : this.element.offsetWidth;
		// reposition
		if ('100%' === this.options.width) {
			this._results.style.top = pos.y + this.element.offsetHeight + "px";
			this._results.style.left = pos.x + "px";
			this._results.style.display = 'block';
		} else {
			this._results.style.width = parseInt(iWidth) + "px";
			this._results.style.top = pos.y + this.element.offsetHeight + "px";
			this._results.style.left = pos.x + "px";
			this._results.style.display = 'block';
		}
	},
	hideResults: function hideResults() {
		var self = this;
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(function () {
			self.hideResultsNow();
		}, 200);
	},
	hideResultsNow: function hideResultsNow() {
		if (this.timeout) clearTimeout(this.timeout);
		u.removeClass(this.element, this.options.loadingClass);
		//if (this.$results.is(":visible")) {
		this._results.style.display = 'none';
		//}
		if (this.options.mustMatch) {
			var v = this.element.value;
			if (v != this.lastSelected) {
				this.selectItem(null);
			}
		}
	},
	receiveData: function receiveData(q, data) {
		if (data) {
			u.removeClass(this.element, this.options.loadingClass);
			this._results.innerHTML = '';

			if (!this.hasFocus || data.length == 0) return this.hideResultsNow();

			this._results.appendChild(this.dataToDom(data));
			// autofill in the complete box w/the first match as long as the user hasn't entered in more data
			if (this.options.autoFill && this.element.value.toLowerCase() == q.toLowerCase()) this.autoFill(data[0][0]);
			this.showResults();
		} else {
			this.hideResultsNow();
		}
	},
	filterData: function filterData(v, items) {
		if (!v) return items;
		var _items = [];
		for (var i = 0, count = items.length; i < count; i++) {
			var label = items[i].label;
			if (label.indexOf(v) > -1) _items.push(items[i]);
		}
		return _items;
	},
	receiveData2: function receiveData2(items) {
		if (items) {
			u.removeClass(this.element, this.options.loadingClass);
			this._results.innerHTML = '';

			// if the field no longer has focus or if there are no matches, do not display the drop down
			if (!this.hasFocus || items.length == 0) return this.hideResultsNow();

			this._results.appendChild(this.dataToDom2(items));
			this.showResults();
		} else {
			this.hideResultsNow();
		}
	},
	dataToDom2: function dataToDom2(items) {
		var ul = document.createElement("ul");
		var num = items.length;
		var me = this;
		var showMoreMenu = false;

		// limited results to a max number
		if (this.options.maxItemsToShow > 0 && this.options.maxItemsToShow < num) {
			num = this.options.maxItemsToShow;
			if (this.options.moreMenuClick) {
				showMoreMenu = true;
			}
		}

		for (var i = 0; i < num; i++) {
			var item = items[i];
			if (!item) continue;
			var li = document.createElement("li");
			if (this.options.formatItem) li.innerHTML = this.options.formatItem(item, i, num);else li.innerHTML = item.label;
			li.selectValue = item.label;
			li._item = item;
			ul.appendChild(li);
			u.on(li, 'mouseenter', function () {
				var _li = ul.querySelector('li.ac_over');
				if (_li) u.removeClass(_li, 'ac_over');;
				u.addClass(this, "ac_over");
				me.active = indexOf(ul.querySelectorAll('li'), this);
			});
			u.on(li, 'mouseleave', function () {
				u.removeClass(this, "ac_over");
			});
			u.on(li, 'mousedown', function (e) {
				u.stopEvent(e);
				me.selectItem(this);
			});
		}
		if (showMoreMenu) {
			var li = document.createElement("li");
			li.innerHTML = '更多';
			ul.appendChild(li);
			u.on(li, 'mouseenter', function () {
				var _li = ul.querySelector('li.ac_over');
				if (_li) u.removeClass(_li, 'ac_over');;
				u.addClass(this, "ac_over");
			});
			u.on(li, 'mouseleave', function () {
				u.removeClass(this, "ac_over");
			});
			u.on(li, 'mousedown', function (e) {
				u.stopEvent(e);
				me.options.moreMenuClick.call(me);
			});
		}
		return ul;
	},
	parseData: function parseData() {
		if (!data) return null;
		var parsed = [];
		var rows = data.split(this.options.lineSeparator);
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if (row) {
				parsed[parsed.length] = row.split(this.options.cellSeparator);
			}
		}
		return parsed;
	},
	dataToDom: function dataToDom(data) {
		var ul = document.createElement("ul");
		var num = data.length;
		var self = this;
		var showMoreMenu = false;

		// limited results to a max number
		if (this.options.maxItemsToShow > 0 && this.options.maxItemsToShow < num) {
			num = this.options.maxItemsToShow;
			if (this.options.moreMenuClick) {
				showMoreMenu = true;
			}
		}

		for (var i = 0; i < num; i++) {
			var row = data[i];
			if (!row) continue;
			var li = document.createElement("li");
			if (this.options.formatItem) {
				li.innerHTML = this.options.formatItem(row, i, num);
				li.selectValue = row[0];
			} else {
				li.innerHTML = row[0];
				li.selectValue = row[0];
			}
			var extra = null;
			if (row.length > 1) {
				extra = [];
				for (var j = 1; j < row.length; j++) {
					extra[extra.length] = row[j];
				}
			}
			li.extra = extra;
			ul.appendChild(li);
			u.on(li, 'mouseenter', function () {
				var _li = ul.querySelector('li.ac_over');
				if (_li) u.removeClass(_li, 'ac_over');;
				u.addClass(this, "ac_over");
				self.active = indexOf(ul.querySelectorAll('li'), this);
			});
			u.on(li, 'mouseleave', function () {
				u.removeClass(this, "ac_over");
			});
			u.on(li, 'mousedown', function () {
				u.stopEvent(e);
				self.selectItem(this);
			});
		}
		if (showMoreMenu) {
			var li = document.createElement("li");
			li.innerHTML = '更多';
			ul.appendChild(li);
			u.on(li, 'mouseenter', function () {
				var _li = ul.querySelector('li.ac_over');
				if (_li) u.removeClass(_li, 'ac_over');;
				u.addClass(this, "ac_over");
			});
			u.on(li, 'mouseleave', function () {
				u.removeClass(this, "ac_over");
			});
			u.on(li, 'mousedown', function (e) {
				u.stopEvent(e);
				self.options.moreMenuClick.call(self);
			});
		}
		return ul;
	},
	requestData: function requestData() {
		var self = this;
		if (!this.options.matchCase) q = q.toLowerCase();
		var data = this.options.cacheLength ? this.loadFromCache(q) : null;
		// recieve the cached data
		if (data) {
			this.receiveData(q, data);
			// if an AJAX url has been supplied, try loading the data now
		} else if (typeof this.options.url == "string" && this.options.url.length > 0) {
				u.ajax({
					url: this.makeUrl(q),
					success: function success(data) {
						data = self.parseData(data);
						self.addToCache(q, data);
						self.receiveData(q, data);
					}
				});
				// if there's been no data found, remove the loading class
			} else {
					u.removeClass(this.element, this.options.loadingClass);
				}
	},
	makeUrl: function makeUrl(q) {
		var url = this.options.url + "?q=" + encodeURI(q);
		for (var i in this.options.extraParams) {
			url += "&" + i + "=" + encodeURI(this.options.extraParams[i]);
		}
		return url;
	},
	loadFromCache: function loadFromCache() {
		if (!q) return null;
		if (this.cache.data[q]) return this.cache.data[q];
		if (this.options.matchSubset) {
			for (var i = q.length - 1; i >= this.options.minChars; i--) {
				var qs = q.substr(0, i);
				var c = this.cache.data[qs];
				if (c) {
					var csub = [];
					for (var j = 0; j < c.length; j++) {
						var x = c[j];
						var x0 = x[0];
						if (this.matchSubset(x0, q)) {
							csub[csub.length] = x;
						}
					}
					return csub;
				}
			}
		}
		return null;
	},
	matchSubset: function matchSubset(s, sub) {
		if (!this.options.matchCase) s = s.toLowerCase();
		var i = s.indexOf(sub);
		if (i == -1) return false;
		return i == 0 || this.options.matchContains;
	},
	addToCache: function addToCache(q, data) {
		if (!data || !q || !this.options.cacheLength) return;
		if (!this.cache.length || this.cache.length > this.options.cacheLength) {
			this.flushCache();
			this.cache.length++;
		} else if (!this.cache[q]) {
			this.cache.length++;
		}
		this.cache.data[q] = data;
	}
});

function findPos(obj) {
	var curleft = obj.offsetLeft || 0;
	var curtop = obj.offsetTop || 0;
	while (obj = obj.offsetParent) {
		curleft += obj.offsetLeft;
		curtop += obj.offsetTop;
	}
	return {
		x: curleft,
		y: curtop
	};
}

function indexOf(element, e) {
	for (var i = 0; i < element.length; i++) {
		if (element[i] == e) return i;
	}
	return -1;
};

u.compMgr.regComp({
	comp: u.Autocomplete,
	compAsString: 'u.Autocomplete',
	css: 'u-autocomplete'
});
'use strict';

u.DateTimePicker = u.BaseComponent.extend({});

u.DateTimePicker.fn = u.DateTimePicker.prototype;

u.DateTimePicker.fn.init = function () {

    var self = this,
        _fmt,
        _defaultFmt;
    this.enable = true;
    this._element = this.element;
    //this.type = 'datetime';
    //if (u.hasClass(this.element,'u-datepicker')){
    //    this.type = 'date';
    //}
    //u.addClass(this._element,'u-text')
    //this._element.style.display = "inline-table"; // 存在右侧图标，因此修改display
    //new UText(this._element);
    this._input = this._element.querySelector("input");

    if (u.isMobile) {
        this._input.setAttribute('readonly', 'readonly');
    }
    setTimeout(function () {
        self._input.setAttribute('readonly', 'readonly'); // 暂时不支持输入
    });
    u.on(this._input, 'focus', function (e) {
        // 用来关闭键盘
        if (u.isMobile) this.blur();
        self._inputFocus = true;
        if (self.isShow !== true) {
            self.show(e);
        }
        u.stopEvent(e);
    });
    u.on(this._input, 'blur', function (e) {
        self._inputFocus = false;
    });
    this._span = this._element.querySelector("span");
    if (this._span) {
        u.on(this._span, 'click', function (e) {
            if (self.isShow !== true) {
                self.show(e);
            }
            u.stopEvent(e);
        });
    }

    if (u.hasClass(this._element, 'time')) {
        this.type = 'datetime';
        _defaultFmt = 'YYYY-MM-DD hh:mm:ss';
    } else {
        this.type = 'date';
        _defaultFmt = 'YYYY-MM-DD';
    }
    _fmt = this._element.getAttribute("format");
    this.format = _fmt || this.options['format'] || _defaultFmt;
    this.isShow = false;
};

/**
 * 轮播动画效果
 * @private
 */
u.DateTimePicker.fn._carousel = function (newPage, direction) {
    if (direction == 'left') {
        u.addClass(newPage, 'right-page');
    } else {
        u.addClass(newPage, 'left-page');
    }
    this._dateContent.appendChild(newPage);
    if (u.isIE8 || u.isIE9 || u.isFF) {
        // this._dateContent.removeChild(this.contentPage);
        var pages = this._dateContent.querySelectorAll('.u-date-content-page');
        for (i = 0; i < pages.length; i++) {
            this._dateContent.removeChild(pages[i]);
        }
        this.contentPage = newPage;
        this._dateContent.appendChild(newPage);
        if (direction == 'left') {
            u.removeClass(newPage, 'right-page');
        } else {
            u.removeClass(newPage, 'left-page');
        }
    } else {

        var cleanup = function () {
            newPage.removeEventListener('transitionend', cleanup);
            newPage.removeEventListener('webkitTransitionEnd', cleanup);
            // this._dateContent.removeChild(this.contentPage);
            var pages = this._dateContent.querySelectorAll('.u-date-content-page');
            for (i = 0; i < pages.length; i++) {
                this._dateContent.removeChild(pages[i]);
            }
            this.contentPage = newPage;
            this._dateContent.appendChild(newPage);
        }.bind(this);

        newPage.addEventListener('transitionend', cleanup);
        newPage.addEventListener('webkitTransitionEnd', cleanup);
        if (window.requestAnimationFrame) window.requestAnimationFrame(function () {
            if (direction == 'left') {
                u.addClass(this.contentPage, 'left-page');
                u.removeClass(newPage, 'right-page');
            } else {
                u.addClass(this.contentPage, 'right-page');
                u.removeClass(newPage, 'left-page');
            }
        }.bind(this));
    }
};

/**
 * 淡入动画效果
 * @private
 */
u.DateTimePicker.fn._zoomIn = function (newPage) {
    if (!this.contentPage) {
        this._dateContent.appendChild(newPage);
        this.contentPage = newPage;
        return;
    }
    u.addClass(newPage, 'zoom-in');
    this._dateContent.appendChild(newPage);
    if (u.isIE8 || u.isIE9 || u.isFF) {
        var pages = this._dateContent.querySelectorAll('.u-date-content-page');
        for (i = 0; i < pages.length; i++) {
            this._dateContent.removeChild(pages[i]);
        }
        // this._dateContent.removeChild(this.contentPage);
        this.contentPage = newPage;
        this._dateContent.appendChild(newPage);
        u.removeClass(newPage, 'zoom-in');
    } else {
        var cleanup = function () {
            newPage.removeEventListener('transitionend', cleanup);
            newPage.removeEventListener('webkitTransitionEnd', cleanup);
            // this._dateContent.removeChild(this.contentPage);
            var pages = this._dateContent.querySelectorAll('.u-date-content-page');
            for (i = 0; i < pages.length; i++) {
                this._dateContent.removeChild(pages[i]);
            }
            this.contentPage = newPage;
            this._dateContent.appendChild(newPage);
        }.bind(this);
        if (this.contentPage) {
            newPage.addEventListener('transitionend', cleanup);
            newPage.addEventListener('webkitTransitionEnd', cleanup);
        }
        if (window.requestAnimationFrame) window.requestAnimationFrame(function () {
            u.addClass(this.contentPage, 'is-hidden');
            u.removeClass(newPage, 'zoom-in');
        }.bind(this));
    }
};

/**
 *填充年份选择面板
 * @private
 */
u.DateTimePicker.fn._fillYear = function (type) {
    var year,
        template,
        yearPage,
        titleDiv,
        yearDiv,
        _year,
        i,
        cell,
        language,
        year,
        month,
        date,
        time,
        self = this;
    template = ['<div class="u-date-content-page">', '<div class="u-date-content-title">',
    /*'<div class="u-date-content-title-year"></div>-',
    '<div class="u-date-content-title-month"></div>-',
    '<div class="u-date-content-title-date"></div>',
    '<div class="u-date-content-title-time"></div>',*/
    '</div>', '<div class="u-date-content-panel"></div>', '</div>'].join("");
    type = type || 'current';
    _year = this.pickerDate.getFullYear();
    if ('current' === type) {
        this.startYear = _year - _year % 10 - 1;
    } else if (type === 'preivous') {
        this.startYear = this.startYear - 10;
    } else {
        this.startYear = this.startYear + 10;
    }
    yearPage = u.makeDOM(template);
    // titleDiv = yearPage.querySelector('.u-date-content-title');
    // titleDiv.innerHTML = (this.startYear - 1) + '-' + (this.startYear + 11);
    language = u.core.getLanguages();
    year = u.date._formats['YYYY'](this.pickerDate);
    month = u.date._formats['MM'](this.pickerDate, language);
    date = u.date._formats['DD'](this.pickerDate, language);
    time = u.date._formats['HH'](this.pickerDate, language) + ':' + u.date._formats['mm'](this.pickerDate, language) + ':' + u.date._formats['ss'](this.pickerDate, language);

    this._yearTitle = yearPage.querySelector('.u-date-content-title');
    this._yearTitle.innerHTML = year;
    /*this._headerYear = yearPage.querySelector('.u-date-content-title-year');
    this._headerYear.innerHTML = year;
    this._headerMonth = yearPage.querySelector('.u-date-content-title-month');
    this._headerMonth.innerHTML = month;
    this._headerDate = yearPage.querySelector('.u-date-content-title-date');
    this._headerDate.innerHTML = date;
    this._headerTime = yearPage.querySelector('.u-date-content-title-time');
    this._headerTime.innerHTML = time;*/
    if (this.type == 'date') {
        this._headerTime.style.display = 'none';
    }

    /*u.on(this._headerYear, 'click', function(e){
        self._fillYear();
        u.stopEvent(e)
    });
      u.on(this._headerMonth, 'click', function(e){
        self._fillMonth();
        u.stopEvent(e)
    });    
      u.on(this._headerTime, 'click', function(e){
        self._fillTime();
        u.stopEvent(e)
    });*/

    yearDiv = yearPage.querySelector('.u-date-content-panel');
    for (i = 0; i < 12; i++) {

        cell = u.makeDOM('<div class="u-date-content-year-cell">' + (this.startYear + i) + '</div>');
        new URipple(cell);
        if (this.startYear + i == _year) {
            u.addClass(cell, 'current');
        }
        if (this.startYear + i < this.beginYear) {
            u.addClass(cell, 'u-disabled');
        }
        cell._value = this.startYear + i;
        yearDiv.appendChild(cell);
    }
    u.on(yearDiv, 'click', function (e) {
        if (u.hasClass(e.target, 'u-disabled')) return;
        var _y = e.target._value;
        this.pickerDate.setYear(_y);
        this._updateDate();
        this._fillMonth();
    }.bind(this));

    if (type === 'current') {
        this._zoomIn(yearPage);
    } else if (type === 'next') {
        this._carousel(yearPage, 'left');
    } else if (type === 'preivous') {
        this._carousel(yearPage, 'right');
    }
    this.currentPanel = 'year';
};

/**
 * 填充月份选择面板
 * @private
 */
u.DateTimePicker.fn._fillMonth = function () {
    var template,
        monthPage,
        _month,
        cells,
        i,
        language,
        year,
        month,
        date,
        time,
        self = this;
    template = ['<div class="u-date-content-page">', '<div class="u-date-content-title">',
    /*'<div class="u-date-content-title-year"></div>-',
    '<div class="u-date-content-title-month"></div>-',
    '<div class="u-date-content-title-date"></div>',
    '<div class="u-date-content-title-time"></div>',*/
    '</div>', '<div class="u-date-content-panel">', '<div class="u-date-content-year-cell">1月</div>', '<div class="u-date-content-year-cell">2月</div>', '<div class="u-date-content-year-cell">3月</div>', '<div class="u-date-content-year-cell">4月</div>', '<div class="u-date-content-year-cell">5月</div>', '<div class="u-date-content-year-cell">6月</div>', '<div class="u-date-content-year-cell">7月</div>', '<div class="u-date-content-year-cell">8月</div>', '<div class="u-date-content-year-cell">9月</div>', '<div class="u-date-content-year-cell">10月</div>', '<div class="u-date-content-year-cell">11月</div>', '<div class="u-date-content-year-cell">12月</div>', '</div>', '</div>'].join("");

    monthPage = u.makeDOM(template);
    language = u.core.getLanguages();
    year = u.date._formats['YYYY'](this.pickerDate);
    month = u.date._formats['MM'](this.pickerDate, language);
    date = u.date._formats['DD'](this.pickerDate, language);
    time = u.date._formats['HH'](this.pickerDate, language) + ':' + u.date._formats['mm'](this.pickerDate, language) + ':' + u.date._formats['ss'](this.pickerDate, language);

    this._monthTitle = monthPage.querySelector('.u-date-content-title');
    this._monthTitle.innerHTML = u.date._formats['MMM'](this.pickerDate, language);
    /*this._headerYear = monthPage.querySelector('.u-date-content-title-year');
    this._headerYear.innerHTML = year;
    this._headerMonth = monthPage.querySelector('.u-date-content-title-month');
    this._headerMonth.innerHTML = month;
    this._headerDate = monthPage.querySelector('.u-date-content-title-date');
    this._headerDate.innerHTML = date;
    this._headerTime = monthPage.querySelector('.u-date-content-title-time');
    this._headerTime.innerHTML = time;*/
    if (this.type == 'date') {
        this._headerTime.style.display = 'none';
    }

    /*u.on(this._headerYear, 'click', function(e){
        self._fillYear();
        u.stopEvent(e)
    });
      u.on(this._headerMonth, 'click', function(e){
        self._fillMonth();
        u.stopEvent(e)
    });    
      u.on(this._headerTime, 'click', function(e){
        self._fillTime();
        u.stopEvent(e)
    });*/

    cells = monthPage.querySelectorAll('.u-date-content-year-cell');
    for (i = 0; i < cells.length; i++) {
        if (_month - 1 == i) {
            u.addClass(cells[i], 'current');
        }
        if (this.pickerDate.getFullYear() == this.beginYear && i < this.beginMonth) {
            u.addClass(cells[i], 'u-disabled');
        }
        if (this.pickerDate.getFullYear() < this.beginYear) {
            u.addClass(cells[i], 'u-disabled');
        }
        cells[i]._value = i;
        new URipple(cells[i]);
    }
    u.on(monthPage, 'click', function (e) {
        if (u.hasClass(e.target, 'u-disabled')) return;
        if (u.hasClass(e.target, 'u-date-content-title')) return;
        var _m = e.target._value;
        this.pickerDate.setMonth(_m);
        this._updateDate();
        this._fillDate();
    }.bind(this));
    this._zoomIn(monthPage);
    this.currentPanel = 'month';
};

u.DateTimePicker.fn._getPickerStartDate = function (date) {
    var d = new Date(date);
    d.setDate(1);
    var day = d.getDay();
    d = u.date.sub(d, 'd', day);
    return d;
};

u.DateTimePicker.fn._getPickerEndDate = function (date) {
    var d = new Date(date);
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    var day = d.getDay();
    d = u.date.add(d, 'd', 6 - day);
    return d;
};

/**
 * 渲染日历
 * @param type : previous  current  next
 * @private
 */
u.DateTimePicker.fn._fillDate = function (type) {
    // if (u.isMobile){
    //     this._dateMobileScroll()
    //     return
    // }
    var year,
        month,
        day,
        time,
        template,
        datePage,
        titleDiv,
        dateDiv,
        weekSpans,
        language,
        tempDate,
        i,
        cell,
        self = this;
    type = type || 'current';
    if ('current' === type) {
        tempDate = this.pickerDate;
    } else if (type === 'preivous') {
        tempDate = u.date.sub(this.startDate, 'd', 1);
    } else {
        tempDate = u.date.add(this.endDate, 'd', 1);
    }
    this.startDate = this._getPickerStartDate(tempDate);
    this.endDate = this._getPickerEndDate(tempDate);

    language = u.core.getLanguages();
    year = u.date._formats['YYYY'](tempDate);
    month = u.date._formats['MM'](tempDate, language);
    date = u.date._formats['DD'](tempDate, language);
    time = u.date._formats['HH'](tempDate, language) + ':' + u.date._formats['mm'](tempDate, language) + ':' + u.date._formats['ss'](tempDate, language);
    template = ['<div class="u-date-content-page">', '<div class="u-date-content-title">', '<div class="u-date-content-title-year"></div>-', '<div class="u-date-content-title-month"></div>-', '<div class="u-date-content-title-date"></div>', '<div class="u-date-content-title-time"></div>', '</div>', '<div class="u-date-week"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>', '<div class="u-date-content-panel"></div>', '</div>'].join("");
    datePage = u.makeDOM(template);
    this._headerYear = datePage.querySelector('.u-date-content-title-year');
    this._headerYear.innerHTML = year;
    this._headerMonth = datePage.querySelector('.u-date-content-title-month');
    this._headerMonth.innerHTML = month;
    this._headerDate = datePage.querySelector('.u-date-content-title-date');
    this._headerDate.innerHTML = date;
    this._headerTime = datePage.querySelector('.u-date-content-title-time');
    this._headerTime.innerHTML = time;
    if (this.type == 'date') {
        this._headerTime.style.display = 'none';
    }

    u.on(this._headerYear, 'click', function (e) {
        self._fillYear();
        u.stopEvent(e);
    });

    u.on(this._headerMonth, 'click', function (e) {
        self._fillMonth();
        u.stopEvent(e);
    });

    u.on(this._headerTime, 'click', function (e) {
        self._fillTime();
        u.stopEvent(e);
    });

    weekSpans = datePage.querySelectorAll('.u-date-week span');

    for (i = 0; i < 7; i++) {
        weekSpans[i].innerHTML = u.date._dateLocale[language].weekdaysMin[i];
    }
    dateDiv = datePage.querySelector('.u-date-content-panel');
    tempDate = this.startDate;
    while (tempDate <= this.endDate) {
        cell = u.makeDOM('<div class="u-date-cell" unselectable="on" onselectstart="return false;">' + tempDate.getDate() + '</div>');
        if (tempDate.getFullYear() == this.pickerDate.getFullYear() && tempDate.getMonth() == this.pickerDate.getMonth() && tempDate.getDate() == this.pickerDate.getDate()) {
            u.addClass(cell, 'current');
        }

        if (tempDate.getFullYear() < this.beginYear || tempDate.getFullYear() == this.beginYear && tempDate.getMonth() < this.beginMonth) {
            u.addClass(cell, 'u-disabled');
            u.removeClass(cell, 'current');
        }

        if (tempDate.getFullYear() == this.beginYear && tempDate.getMonth() == this.beginMonth && tempDate.getDate() < this.beginDate) {
            u.addClass(cell, 'u-disabled');
            u.removeClass(cell, 'current');
        }
        cell._value = tempDate.getDate();
        cell._month = tempDate.getMonth();
        cell._year = tempDate.getFullYear();
        new URipple(cell);
        dateDiv.appendChild(cell);
        tempDate = u.date.add(tempDate, 'd', 1);
    }
    u.on(dateDiv, 'click', function (e) {
        if (u.hasClass(e.target, 'u-disabled')) return;
        var _d = e.target._value;
        if (!_d) return;
        this.pickerDate.setFullYear(e.target._year);
        this.pickerDate.setMonth(e.target._month);
        this.pickerDate.setDate(_d);
        var _cell = e.target.parentNode.querySelector('.u-date-cell.current');
        if (_cell) {
            u.removeClass(_cell, 'current');
            if (u.isIE8 || u.isIE9) _cell.style.backgroundColor = "#fff";
        }
        u.addClass(e.target, 'current');
        if (u.isIE8 || u.isIE9) e.target.style.backgroundColor = '#3f51b5';
        this._updateDate();
        if (this.type === 'date') {
            this.onOk();
        }
    }.bind(this));
    if (type === 'current') {
        this._zoomIn(datePage);
    } else if (type === 'next') {
        this._carousel(datePage, 'left');
    } else if (type === 'preivous') {
        this._carousel(datePage, 'right');
    }
    this.currentPanel = 'date';
};

/**
 * 填充时间选择面板
 * @private
 */
u.DateTimePicker.fn._fillTime = function (type) {
    // if (u.isMobile) {
    //     this._timeMobileScroll()
    //     return;
    // }
    var year, month, day, date, time, template, timePage, titleDiv, dateDiv, weekSpans, language, tempDate, i, cell;
    var self = this;
    type = type || 'current';
    if ('current' === type) {
        tempDate = this.pickerDate;
    } else if (type === 'preivous') {
        tempDate = u.date.sub(this.startDate, 'd', 1);
    } else {
        tempDate = u.date.add(this.endDate, 'd', 1);
    }
    this.startDate = this._getPickerStartDate(tempDate);
    this.endDate = this._getPickerEndDate(tempDate);

    language = u.core.getLanguages();
    year = u.date._formats['YYYY'](tempDate);
    month = u.date._formats['MM'](tempDate, language);
    date = u.date._formats['DD'](tempDate, language);
    time = u.date._formats['HH'](tempDate, language) + ':' + u.date._formats['mm'](tempDate, language) + ':' + u.date._formats['ss'](tempDate, language);

    template = ['<div class="u-date-content-page">', '<div class="u-date-content-title">', '<div class="u-date-content-title-year"></div>-', '<div class="u-date-content-title-month"></div>-', '<div class="u-date-content-title-date"></div>', '<div class="u-date-content-title-time"></div>', '</div>', '<div class="u-date-content-panel"></div>', '</div>'].join("");
    timePage = u.makeDOM(template);
    //    titleDiv = timePage.querySelector('.u-date-content-title');
    //    titleDiv.innerHTML = year + ' ' + month + ' ' +day ;
    this._headerYear = timePage.querySelector('.u-date-content-title-year');
    this._headerYear.innerHTML = year;
    this._headerMonth = timePage.querySelector('.u-date-content-title-month');
    this._headerMonth.innerHTML = month;
    this._headerDate = timePage.querySelector('.u-date-content-title-date');
    this._headerDate.innerHTML = date;
    this._headerTime = timePage.querySelector('.u-date-content-title-time');
    this._headerTime.innerHTML = time;
    if (this.type == 'date') {
        this._headerTime.style.display = 'none';
    }

    u.on(this._headerYear, 'click', function (e) {
        self._fillYear();
        u.stopEvent(e);
    });

    u.on(this._headerMonth, 'click', function (e) {
        self._fillMonth();
        u.stopEvent(e);
    });

    u.on(this._headerTime, 'click', function (e) {
        self._fillTime();
        u.stopEvent(e);
    });

    dateDiv = timePage.querySelector('.u-date-content-panel');
    // tempDate = this.startDate;
    // while(tempDate <= this.endDate){
    // cell = u.makeDOM('<div class="u-date-cell">'+ u.date._formats['HH'](tempDate,language) +'</div>');
    // if (tempDate.getFullYear() == this.pickerDate.getFullYear() && tempDate.getMonth() == this.pickerDate.getMonth()
    // && tempDate.getDate() == this.pickerDate.getDate()){
    // u.addClass(cell, 'current');
    // }
    // cell._value = tempDate.getDate();
    // new URipple(cell);
    // dateDiv.appendChild(cell);
    // tempDate = u.date.add(tempDate, 'd', 1);
    // }
    if (u.isIE8) {
        // IE8/IE9保持原来，非IE8/IE9使用clockpicker
        timetemplate = ['<div class="u_time_box">', '<div class="u_time_cell">',
        //'<div class="add_hour_cell"><i class="add_hour_cell icon-angle-up"></i></div>',
        '<div class="show_hour_cell">' + u.date._formats['HH'](tempDate) + '</div>',
        //'<div class="subtract_hour_cell"><i class="subtract_hour_cell icon-angle-down"></i></div>',
        '</div>', '<div class="u_time_cell">',
        //'<div class="add_min_cell"><i class="add_min_cell icon-angle-up"></i></div>',
        '<div class="show_min_cell">' + u.date._formats['mm'](tempDate) + '</div>',
        //'<div class="subtract_min_cell"><i class="subtract_min_cell icon-angle-down"></i></div>',
        '</div>', '<div class="u_time_cell">',
        //'<div class="add_sec_cell"><i class="add_sec_cell icon-angle-up"></i></div>',
        '<div class="show_sec_cell">' + u.date._formats['ss'](tempDate) + '</div>',
        //'<div class="subtract_sec_cell"><i class="subtract_sec_cell icon-angle-down"></i></div>',
        '</div>', '</div>'].join("");
        cell = u.makeDOM(timetemplate);
        dateDiv.appendChild(cell);
        u.on(dateDiv, 'click', function (e) {
            var _arrary = e.target.getAttribute("class").split("_");
            if (_arrary[0] == "add") {
                if (_arrary[1] == "hour") {
                    var tmph = Number(u.date._formats['HH'](this.pickerDate));
                    if (tmph < 23) {
                        tmph++;
                    } else {
                        tmph = 0;
                    }

                    this.pickerDate.setHours(tmph);
                    dateDiv.querySelector(".show_hour_cell").innerHTML = tmph;
                } else if (_arrary[1] == "min") {
                    var tmpm = Number(u.date._formats['mm'](this.pickerDate));
                    if (tmpm < 59) {
                        tmpm++;
                    } else {
                        tmpm = 0;
                    }
                    this.pickerDate.setMinutes(tmpm);
                } else if (_arrary[1] == "sec") {
                    var tmps = Number(u.date._formats['ss'](this.pickerDate));
                    if (tmps < 59) {
                        tmps++;
                    } else {
                        tmps = 0;
                    }
                    this.pickerDate.setSeconds(tmps);
                }
            } else if (_arrary[0] == "subtract") {
                if (_arrary[1] == "hour") {
                    var tmph = Number(u.date._formats['HH'](this.pickerDate));
                    if (tmph > 0) {
                        tmph--;
                    } else {
                        tmph = 23;
                    }
                    this.pickerDate.setHours(tmph);
                } else if (_arrary[1] == "min") {
                    var tmpm = Number(u.date._formats['mm'](this.pickerDate));
                    if (tmpm > 0) {
                        tmpm--;
                    } else {
                        tmpm = 59;
                    }
                    this.pickerDate.setMinutes(tmpm);
                } else if (_arrary[1] == "sec") {
                    var tmps = Number(u.date._formats['ss'](this.pickerDate));
                    if (tmps > 0) {
                        tmps--;
                    } else {
                        tmps = 59;
                    }
                    this.pickerDate.setSeconds(tmps);
                }
            } else if (_arrary[0] == "show") {
                var tmptarget = e.target;
                var tmpinput = u.makeDOM("<input type='text' class='u-input'>");
                if (tmptarget.querySelector('.u-input')) return;
                this._updateDate();
                tmpinput.value = tmptarget.innerHTML;
                tmptarget.innerHTML = "";
                tmptarget.appendChild(tmpinput);
                if (_arrary[1] == "hour") {
                    var vali = new u.Validate(tmpinput, { validType: "integer", minLength: 0, maxLength: 2, min: 0, max: 23 });
                    u.on(tmpinput, 'blur', function () {
                        if (vali.passed) {
                            self.pickerDate.setHours(tmpinput.value);
                            self._updateDate();
                        }
                    });
                } else if (_arrary[1] == "min") {
                    var vali = new u.Validate(tmpinput, { validType: "integer", minLength: 0, maxLength: 2, min: 0, max: 59 });
                    u.on(tmpinput, 'blur', function () {
                        if (vali.passed) {
                            self.pickerDate.setMinutes(tmpinput.value);
                            self._updateDate();
                        }
                    });
                } else if (_arrary[1] == "sec") {
                    var vali = new u.Validate(tmpinput, { validType: "integer", minLength: 0, maxLength: 2, min: 0, max: 59 });
                    u.on(tmpinput, 'blur', function () {
                        if (vali.passed) {
                            self.pickerDate.setSeconds(tmpinput.value);
                            self._updateDate();
                        }
                    });
                }

                tmpinput.focus();
                return;
            } else {
                return false;
            }

            this._updateDate();
        }.bind(this));
    } else {
        timetemplate = '<div class="u-combo-ul clockpicker-popover is-visible" style="width:100%;padding:0px;">';
        //        timetemplate += '<div class="popover-title"><span class="clockpicker-span-hours">02</span> : <span class="clockpicker-span-minutes text-primary">01</span><span class="clockpicker-span-am-pm"></span></div>';
        timetemplate += '<div class="popover-content">';
        timetemplate += '  <div class="clockpicker-plate data-clockpicker-plate">';
        timetemplate += '      <div class="clockpicker-canvas">';
        timetemplate += '          <svg class="clockpicker-svg">';
        timetemplate += '              <g transform="translate(100,100)">';
        timetemplate += '                  <circle class="clockpicker-canvas-bg clockpicker-canvas-bg-trans" r="13" cx="8.362277061412277" cy="-79.56175162946187"></circle>';
        timetemplate += '                  <circle class="clockpicker-canvas-fg" r="3.5" cx="8.362277061412277" cy="-79.56175162946187"></circle>';
        timetemplate += '                  <line x1="0" y1="0" x2="8.362277061412277" y2="-79.56175162946187"></line>';
        timetemplate += '                  <circle class="clockpicker-canvas-bearing" cx="0" cy="0" r="2"></circle>';
        timetemplate += '              </g>';
        timetemplate += '          </svg>';
        timetemplate += '      </div>';
        timetemplate += '      <div class="clockpicker-dial clockpicker-hours" style="visibility: visible;">';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-1" >00</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-2" >1</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-3" >2</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-4" >3</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-5" >4</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-6" >5</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-7" >6</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-8" >7</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-9" >8</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-10" >9</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-11" >10</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-12" >11</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-13" >12</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-14" >13</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-15" >14</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-16" >15</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-17" >16</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-18" >17</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-19" >18</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-20" >19</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-21" >20</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-22" >21</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-23" >22</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-24" >23</div>';
        timetemplate += '      </div>';
        timetemplate += '      <div class="clockpicker-dial clockpicker-minutes" style="visibility: hidden;">';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-25" >00</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-26" >05</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-27" >10</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-28" >15</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-29" >20</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-30" >25</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-31" >30</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-32" >35</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-33" >40</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-34" >45</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-35" >50</div>';
        timetemplate += '          <div class="clockpicker-tick clockpicker-tick-36" >55</div>';
        timetemplate += '      </div>';
        timetemplate += '  </div><span class="clockpicker-am-pm-block"></span></div>';
        timetemplate += '  </div>';
        cell = u.makeDOM(timetemplate);
        this.cell = cell;
        dateDiv.appendChild(cell);

        this.hand = cell.querySelector('line');
        this.bg = cell.querySelector('.clockpicker-canvas-bg');
        this.fg = cell.querySelector('.clockpicker-canvas-fg');
        this.titleHourSpan = cell.querySelector('.clockpicker-span-hours');
        this.titleMinSpan = cell.querySelector('.clockpicker-span-minutes');
        this.hourDiv = cell.querySelector('.clockpicker-hours');
        this.minDiv = cell.querySelector('.clockpicker-minutes');
        this.currentView = 'hours';
        this.hours = u.date._formats['HH'](tempDate);
        this.min = u.date._formats['mm'](tempDate);
        this.sec = u.date._formats['ss'](tempDate);
        //this.titleHourSpan.innerHTML = this.hours;
        //this.titleMinSpan.innerHTML = this.min;

        u.on(this.hourDiv, 'click', function (e) {
            var target = e.target;
            if (u.hasClass(target, 'clockpicker-tick')) {
                this.hours = target.innerHTML;
                this.hours = this.hours > 9 || this.hours == 0 ? '' + this.hours : '0' + this.hours;
                // this.titleHourSpan.innerHTML = this.hours;
                self.pickerDate.setHours(this.hours);
                var language = u.core.getLanguages();
                var time = u.date._formats['HH'](this.pickerDate, language) + ':' + u.date._formats['mm'](this.pickerDate, language) + ':' + u.date._formats['ss'](this.pickerDate, language);
                this._headerTime.innerHTML = time;
                this.hourDiv.style.visibility = 'hidden';
                this.minDiv.style.visibility = 'visible';
                this.currentView = 'min';
                this.setHand();
            }
        }.bind(this));

        u.on(this.minDiv, 'click', function (e) {
            var target = e.target;
            if (u.hasClass(target, 'clockpicker-tick')) {
                this.min = target.innerHTML;
                // this.min = this.min > 9 || this.min  == 00? '' + this.min:'0' + this.min;
                // this.titleMinSpan.innerHTML = this.min;
                self.pickerDate.setMinutes(this.min);
                var language = u.core.getLanguages();
                var time = u.date._formats['HH'](this.pickerDate, language) + ':' + u.date._formats['mm'](this.pickerDate, language) + ':' + u.date._formats['ss'](this.pickerDate, language);
                this._headerTime.innerHTML = time;
                this.minDiv.style.visibility = 'hidden';
                this.hourDiv.style.visibility = 'visible';
                this.currentView = 'hours';
                this.setHand();
            }
        }.bind(this));
    }

    this._zoomIn(timePage);
    if (!u.isIE8) this.setHand();
    this.currentPanel = 'time';
    dateDiv.onselectstart = new Function("return false");
};

u.DateTimePicker.fn.setHand = function () {
    var dialRadius = 100,
        innerRadius = 54,
        outerRadius = 80;
    var view = this.currentView,
        value = this[view],
        isHours = view === 'hours',
        unit = Math.PI / (isHours ? 6 : 30),
        radian = value * unit,
        radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
        x = Math.sin(radian) * radius,
        y = -Math.cos(radian) * radius;
    this.setHandFun(x, y);
};

u.DateTimePicker.fn.setHandFun = function (x, y, roundBy5, dragging) {
    var dialRadius = 100,
        innerRadius = 54,
        outerRadius = 80;

    var radian = Math.atan2(x, -y),
        isHours = this.currentView === 'hours',
        unit = Math.PI / (isHours ? 6 : 30),
        z = Math.sqrt(x * x + y * y),
        options = this.options,
        inner = isHours && z < (outerRadius + innerRadius) / 2,
        radius = inner ? innerRadius : outerRadius,
        value;

    if (this.twelvehour) {
        radius = outerRadius;
    }

    // Radian should in range [0, 2PI]
    if (radian < 0) {
        radian = Math.PI * 2 + radian;
    }

    // Get the round value
    value = Math.round(radian / unit);

    // Get the round radian
    radian = value * unit;

    // Correct the hours or minutes
    if (options.twelvehour) {
        if (isHours) {
            if (value === 0) {
                value = 12;
            }
        } else {
            if (roundBy5) {
                value *= 5;
            }
            if (value === 60) {
                value = 0;
            }
        }
    } else {
        if (isHours) {
            if (value === 12) {
                value = 0;
            }
            value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
        } else {
            if (roundBy5) {
                value *= 5;
            }
            if (value === 60) {
                value = 0;
            }
        }
    }

    // Set clock hand and others' position
    var w = this._panel.offsetWidth;
    var u = w / 294;
    var cx = Math.sin(radian) * radius * u,
        cy = -Math.cos(radian) * radius * u;
    var iu = 100 * u;
    this.cell.querySelector('g').setAttribute('transform', 'translate(' + iu + ',' + iu + ')');
    this.hand.setAttribute('x2', cx);
    this.hand.setAttribute('y2', cy);
    this.bg.setAttribute('cx', cx);
    this.bg.setAttribute('cy', cy);
    this.fg.setAttribute('cx', cx);
    this.fg.setAttribute('cy', cy);
};

/**
 * 重新渲染面板
 * @private
 */
u.DateTimePicker.fn._updateDate = function () {
    var year, month, week, date, time, hour, minute, seconds, language;

    language = u.core.getLanguages();
    year = u.date._formats['YYYY'](this.pickerDate);
    // week = u.date._formats['ddd'](this.pickerDate, language);
    month = u.date._formats['MM'](this.pickerDate, language);
    time = u.date._formats['HH'](this.pickerDate, language) + ':' + u.date._formats['mm'](this.pickerDate, language) + ':' + u.date._formats['ss'](this.pickerDate, language);

    //TODO 多语
    // date = u.date._formats['D'](this.pickerDate) + '日';
    date = u.date._formats['DD'](this.pickerDate, language);
    if (this._headerYear) {
        this._headerYear.innerHTML = '';
        this._headerYear.innerHTML = year;
    }
    // this._headerWeak.innerHTML = '';
    // this._headerWeak.innerHTML = week;
    if (this._headerMonth) {
        this._headerMonth.innerHTML = '';
        this._headerMonth.innerHTML = month;
    }
    if (this._headerDate) {
        this._headerDate.innerHTML = '';
        this._headerDate.innerHTML = date;
    }
    if (this._headerTime) {
        this._headerTime.innerHTML = '';
        this._headerTime.innerHTML = time;
    }
    if (this.currentPanel == 'time') {
        if (u.isIE8) {
            this._panel.querySelector(".show_hour_cell").innerHTML = u.date._formats['HH'](this.pickerDate, language);
            this._panel.querySelector(".show_min_cell").innerHTML = u.date._formats['mm'](this.pickerDate, language);
            this._panel.querySelector(".show_sec_cell").innerHTML = u.date._formats['ss'](this.pickerDate, language);
        }
    }
};

u.DateTimePicker.fn._response = function () {
    return;
    var bodyHeight = document.body.offsetHeight; //395
    var _height = 430;
    if (this.type === 'date' && !u.isMobile) _height = 395;
    if (bodyHeight > _height) {
        this._panel.style.height = _height;
    }
    //if (bodyHeight > 500){
    //    this._panel.style.height =  '500px';
    //}
    //this._dateContent.style.height =panelHeight - 158 + 'px';   // 106 52
};

u.dateTimePickerTemplateArr = ['<div class="u-date-panel">', '<div class="u-date-body">',
/*'<div class="u-date-header">',
    '<span class="u-date-header-year"></span>',
     '<div class="u-date-header-h3">',
        '<span class="u-date-header-week"></span>',
        '<span>,</span>',
        '<span class="u-date-header-month"></span>',
        '<span> </span>',
        '<span class="u-date-header-date"></span>',
        '<span> </span>',
        '<span class="u-date-header-time"></span>',
     '</div>',
'</div>',*/
'<div class="u-date-content"></div>', '</div>', '<div class="u-date-nav">', '<button class="u-button u-date-ok right primary">确定</button>', '<button class="u-button u-date-cancel right">取消</button>', '<button class="u-button u-date-clean">清空</button>', '</div>', '</div>'];

/******************************
 *  Public method
 ******************************/

u.DateTimePicker.fn.show = function (evt) {
    if (!this.enable) {
        return;
    }
    var inputValue = this._input.value;
    this.setDate(inputValue);

    var self = this;
    if (!this._panel) {
        this._panel = u.makeDOM(u.dateTimePickerTemplateArr.join(""));
        if (u.isMobile) {
            u.removeClass(this._panel, 'u-date-panel');
            u.addClass(this._panel, 'u-date-panel-mobile');
        }
        this._dateNav = this._panel.querySelector('.u-date-nav');
        if (this.type === 'date' && !u.isMobile) {
            this._dateNav.style.display = 'none';
        }
        this._dateContent = this._panel.querySelector('.u-date-content');
        if (this.type == 'datetime') {
            /*if(u.isMobile){
                this._dateContent.style.height = '226/16*2rem';
            }
            else{
                this._dateContent.style.height = '226px';
            }*/
        }
        this.btnOk = this._panel.querySelector('.u-date-ok');
        this.btnCancel = this._panel.querySelector('.u-date-cancel');
        this.btnClean = this._panel.querySelector('.u-date-clean');
        var rippleContainer = document.createElement('span');
        u.addClass(rippleContainer, 'u-ripple');
        this.btnOk.appendChild(rippleContainer);
        var rippleContainer = document.createElement('span');
        u.addClass(rippleContainer, 'u-ripple');
        this.btnCancel.appendChild(rippleContainer);
        var rippleContainer = document.createElement('span');
        u.addClass(rippleContainer, 'u-ripple');
        this.btnClean.appendChild(rippleContainer);
        new URipple(this.btnOk);
        new URipple(this.btnCancel);
        new URipple(this.btnClean);
        u.on(this.btnOk, 'click', function (e) {
            this.onOk();
            u.stopEvent(e);
        }.bind(this));
        u.on(this.btnCancel, 'click', function (e) {
            self.onCancel();
            u.stopEvent(e);
        });
        u.on(this.btnClean, 'click', function (e) {
            self.pickerDate = null;
            self.onOk();
            u.stopEvent(e);
        });

        // this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button flat floating mini">&lt;</button>');
        // this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button flat floating mini">&gt;</button>');
        this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button mini">&lt;</button>');
        this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button mini">&gt;</button>');
        // new u.Button(this.nextBtn);

        u.on(this.preBtn, 'click', function (e) {
            if (self.currentPanel == 'date') {
                self._fillDate('preivous');
            } else if (self.currentPanel == 'year') {
                self._fillYear('preivous');
            }
            u.stopEvent(e);
        });
        u.on(this.nextBtn, 'click', function (e) {
            if (self.currentPanel == 'date') {
                self._fillDate('next');
            } else if (self.currentPanel == 'year') {
                self._fillYear('next');
            }
            u.stopEvent(e);
        });
        // if(!u.isMobile){
        this._dateContent.appendChild(this.preBtn);
        this._dateContent.appendChild(this.nextBtn);
        // }

        //this._element.parentNode.appendChild(this._panel);
        document.body.appendChild(this._panel);
    }
    this.pickerDate = this.date || new Date();
    this._updateDate();
    this._fillDate();
    this._response();
    u.on(window, 'resize', function () {
        self._response();
    });
    if (u.isMobile) {
        this.overlayDiv = u.makeModal(this._panel);
        u.on(this.overlayDiv, 'click', function () {
            self.onCancel();
        });
    }
    u.addClass(this._panel, 'is-visible');
    if (!u.isMobile) {
        //调整left和top
        u.showPanelByEle({
            ele: this._input,
            panel: this._panel,
            position: "bottomLeft"
        });
        this._panel.style.marginLeft = '0px';
        var callback = function callback(e) {
            if (e !== evt && e.target !== self._input && !u.hasClass(e.target, 'u-date-content-year-cell') && !u.hasClass(e.target, 'u-date-content-year-cell') && u.closest(e.target, 'u-date-panel') !== self._panel && self._inputFocus != true) {
                u.off(document, 'click', callback);
                self.onCancel();
            }
        };
        u.on(document, 'click', callback);

        document.body.onscroll = function () {
            u.showPanelByEle({
                ele: self._input,
                panel: self._panel,
                position: "bottomLeft"
            });
        };
    }

    this.isShow = true;
};

/**
 * 确定事件
 */
u.DateTimePicker.fn.onOk = function () {
    this.setDate(this.pickerDate);
    this.isShow = false;
    u.removeClass(this._panel, 'is-visible');
    try {
        document.body.removeChild(this.overlayDiv);
    } catch (e) {}
    this.trigger('select', { value: this.pickerDate });
};

/**
 * 确定事件
 */
u.DateTimePicker.fn.onCancel = function () {
    this.isShow = false;
    u.removeClass(this._panel, 'is-visible');
    try {
        document.body.removeChild(this.overlayDiv);
    } catch (e) {}
};

u.DateTimePicker.fn.setDate = function (value) {
    if (!value) {
        this.date = null;
        this._input.value = '';
        return;
    }

    var _date = u.date.getDateObj(value);
    if (_date) {
        if (this.beginDateObj) {
            if (_date < this.beginDateObj) return;
        }
        this.date = _date;
        this._input.value = u.date.format(this.date, this.format);
    }
};
/**
 *设置format
 * @param format
 */
u.DateTimePicker.fn.setFormat = function (format) {
    this.format = format;
    this._input.value = u.date.format(this.date, this.format);
};

u.DateTimePicker.fn.setStartDate = function (startDate) {
    if (startDate) {
        this.beginDateObj = u.date.getDateObj(startDate);
        this.beginYear = this.beginDateObj.getFullYear();
        this.beginMonth = this.beginDateObj.getMonth();
        this.beginDate = this.beginDateObj.getDate();
    }
};
u.DateTimePicker.fn.setEnable = function (enable) {
    if (enable === true || enable === 'true') {
        this.enable = true;
    } else {
        this.enable = false;
    }
};

if (u.compMgr) u.compMgr.regComp({
    comp: u.DateTimePicker,
    compAsString: 'u.DateTimePicker',
    css: 'u-datepicker'
});

/*
移动端渲染暂时和pc保持一致 begin
u.DateTimePicker.fn._dateMobileScroll = function(type){
   var year,month,day,template,datePage,titleDiv,dateDiv,weekSpans,language,tempDate, i,cell,ddheight;
    var self = this;
    type = type || 'current';
    if ('current' === type) {
        tempDate = this.pickerDate;
    } else if (type === 'preivous') {
        tempDate = u.date.sub(this.startDate,'d', 1);
    } else {
        tempDate = u.date.add(this.endDate,'d', 1);
    }
    this.startDate = this._getPickerStartDate(tempDate);
    this.endDate = this._getPickerEndDate(tempDate);

    language = u.core.getLanguages();

    template = ['<div class="u-date-content-page">',
        '<div class="u-date-content-title"></div>',
        '<div class="u-date-content-panel"><div class="scroll-box"><div class="scroll-shadow"></div>',
        '<div class="scroll-touch"><div></div><dl time-change="setYear" class="u-date-year  u-scroll"></dl></div>',
        '<div class="scroll-touch"><div></div><dl time-change="setMonth" class="u-date-month u-scroll"></dl></div>',
        '<div class="scroll-touch"><div></div><dl time-change="setDate" class="u-date-day u-scroll"></dl></div>',
        '</div></div>'].join("");
    datePage = u.makeDOM(template);
    var srcollyear = datePage.querySelector('.u-date-year');
    var srcollmonth = datePage.querySelector('.u-date-month');
    var srcollday = datePage.querySelector('.u-date-day');
    this.startYear =  this.pickerDate.getFullYear() -10;
    for(i = 0; i < 20; i++){
        cell = u.makeDOM('<dd class="u-date-li">'+ (this.startYear + i) +'</dd>');

        if (this.startYear + i == this.pickerDate.getFullYear()){
            u.addClass(cell, 'current');
            current_postion(srcollyear,i)
        }
        cell._value = this.startYear + i;
        srcollyear.appendChild(cell);
    }
    for(i = 0; i < 12; i++){
        cell = u.makeDOM('<dd class="u-date-li">'+ (1 + i) + '月' +'</dd>');

        if (this.pickerDate.getMonth()  == i){
            u.addClass(cell, 'current');
            current_postion(srcollmonth,i)
        }
        cell._value = i;
        srcollmonth.appendChild(cell);
    }
    var pickerdayend = (new Date(this.pickerDate.getFullYear(),this.pickerDate.getMonth()+1, 0)).getDate();
    for(i = 1; i < (pickerdayend + 1); i++){
        cell = u.makeDOM('<dd class="u-date-li">'+ i +'日</dd>');
        if (i == this.pickerDate.getDate()) {
            u.addClass(cell, 'current');
            current_postion(srcollday,i-1)
        }
        cell._value = i;
        srcollday.appendChild(cell);

    }
    //current_postion(datePage)
    ddheight = 60
    u.on(datePage.querySelector(".scroll-shadow"),"touchstart",function(e){
         var tmpwidth = this.clientWidth
        var scrolltype,startp,offsetX ;
        console.dir()
        startp = e.touches[0].pageY;
        offsetX = e.touches[0].pageX - this.getClientRects()[0].left
        if(offsetX < tmpwidth * 0.33){
            scrolltype = datePage.querySelector(".u-date-year")
        }else if(tmpwidth * 0.33 < offsetX  && offsetX < tmpwidth * 0.66){
            scrolltype = datePage.querySelector(".u-date-month")
        }else if(tmpwidth * 0.66 < offsetX){
            scrolltype = datePage.querySelector(".u-date-day")
        }
        u.on(document.body,"touchmove",function(e){
            var scrollrange = e.touches[0].pageY - startp
            var oldtrans = parseInt(scrolltype.style.transform.match(/\((\S+)px\)/)[1])
            scrolltype.style.transform = "translateY("+(oldtrans + scrollrange)+"px)";
            startp = e.touches[0].pageY
        })
        var maxscroll = (scrolltype.querySelectorAll('dd').length - 3) * -ddheight
        u.on(document.body,"touchend",function(e){
            var oldtrans = parseInt(scrolltype.style.transform.match(/\((\S+)px\)/)[1])

            var remain = oldtrans-oldtrans%60

            if(remain > ddheight*2){
                remain = ddheight*2
            }else if(remain < maxscroll){
                remain = maxscroll
            }
            tmpdd = scrolltype.querySelectorAll("dd"),
            u.removeClass(scrolltype.querySelector(".current"),'current')
            u.addClass(tmpdd[2 - (remain/ddheight)],'current')
            scrolltype.style.transform = "translateY("+remain+"px)";
            scrollend_update(scrolltype,self)

            u.off(document.body,"touchmove")
            u.off(document.body,"touched")

        })
    })

   if (type === 'current'){
        this._zoomIn(datePage);
    }else if(type === 'next'){
        this._carousel(datePage, 'left');
    }else if(type === 'preivous'){
        this._carousel(datePage, 'right');
    }
    this.currentPanel = 'mobile_date';

}
u.DateTimePicker.fn._timeMobileScroll = function(type){
   var year,month,day,template,datePage,titleDiv,dateDiv,weekSpans,language,tempDate, i,cell,ddheight;
    var self = this;
    type = type || 'current';
    if ('current' === type) {
        tempDate = this.pickerDate;
    } else if (type === 'preivous') {
        tempDate = u.date.sub(this.startDate,'d', 1);
    } else {
        tempDate = u.date.add(this.endDate,'d', 1);
    }
    this.startDate = this._getPickerStartDate(tempDate);
    this.endDate = this._getPickerEndDate(tempDate);

    language = u.core.getLanguages();

    template = ['<div class="u-date-content-page">',
        '<div class="u-date-content-title"></div>',
        '<div class="u-date-content-panel"><div class="scroll-box"><div class="scroll-shadow"></div>',
        '<div class="scroll-touch"><div></div><dl time-change="setHours" class="u-date-hour  u-scroll"></dl></div>',
        '<div class="scroll-touch"><div></div><dl time-change="setMinutes" class="u-date-minute u-scroll"></dl></div>',
        '<div class="scroll-touch"><div></div><dl time-change="setSeconds" class="u-date-second u-scroll"></dl></div>',
        '</div></div>'].join("");
    datePage = u.makeDOM(template);
    var srcollhour = datePage.querySelector('.u-date-hour');
    var srcollminute = datePage.querySelector('.u-date-minute');
    var srcollsecond = datePage.querySelector('.u-date-second');
    for(i = 0; i < 24; i++){
        cell = u.makeDOM('<dd class="u-date-li">'+  (i<10? "0"+i:i) +'</dd>');

        if ( this.pickerDate.getHours() == i){
            u.addClass(cell, 'current');
            current_postion(srcollhour,i)
        }
        cell._value = i;
        srcollhour.appendChild(cell);
    }
    for(i = 0; i < 60; i++){
        cell = u.makeDOM('<dd class="u-date-li">'+ (i<10? "0"+i:i) + '</dd>');

        if (this.pickerDate.getMinutes()  == i){
            u.addClass(cell, 'current');
            current_postion(srcollminute,i)
        }
        cell._value = i;
        srcollminute.appendChild(cell);
    }
    for(i = 0; i < 60; i++){
        cell = u.makeDOM('<dd class="u-date-li">'+ (i<10? "0"+i:i) +'</dd>');

        if (this.pickerDate.getSeconds()  == i){
            u.addClass(cell, 'current');
            current_postion(srcollsecond,i)
        }
        cell._value = i;
        srcollsecond.appendChild(cell);
    }

    //current_postion(datePage)
    ddheight = 60
    u.on(datePage.querySelector(".scroll-shadow"),"touchstart",function(e){
         var tmpwidth = this.clientWidth
        var scrolltype,startp,offsetX ;

        startp = e.touches[0].pageY;
        offsetX = e.touches[0].pageX - this.getClientRects()[0].left
        if(offsetX < tmpwidth * 0.33){
            scrolltype = datePage.querySelector(".u-date-hour")
        }else if(tmpwidth * 0.33 < offsetX  && offsetX < tmpwidth * 0.66){
            scrolltype = datePage.querySelector(".u-date-minute")
        }else if(tmpwidth * 0.66 < offsetX){
            scrolltype = datePage.querySelector(".u-date-second")
        }
        u.on(document.body,"touchmove",function(e){
            var scrollrange = e.touches[0].pageY - startp
            var oldtrans = parseInt(scrolltype.style.transform.match(/\((\S+)px\)/)[1])
            scrolltype.style.transform = "translateY("+(oldtrans + scrollrange)+"px)";
            startp = e.touches[0].pageY
        })
        var maxscroll = (scrolltype.querySelectorAll('dd').length - 3) * -ddheight
        u.on(document.body,"touchend",function(e){
            var oldtrans = parseInt(scrolltype.style.transform.match(/\((\S+)px\)/)[1])

            var remain = oldtrans-oldtrans%60

            if(remain > ddheight*2){
                remain = ddheight*2
            }else if(remain < maxscroll){
                remain = maxscroll
            }
            tmpdd = scrolltype.querySelectorAll("dd"),
            u.removeClass(scrolltype.querySelector(".current"),'current')
            u.addClass(tmpdd[2 - (remain/ddheight)],'current')
            scrolltype.style.transform = "translateY("+remain+"px)";
            scrollend_update(scrolltype,self)

            u.off(document.body,"touchmove")
            u.off(document.body,"touched")

        })
    })

   if (type === 'current'){
        this._zoomIn(datePage);
    }else if(type === 'next'){
        this._carousel(datePage, 'left');
    }else if(type === 'preivous'){
        this._carousel(datePage, 'right');
    }
    this.currentPanel = 'mobile_time';

}
function scrollend_update(scrolltype,self){
    var tmpmod =  scrolltype.getAttribute("time-change"),
        tmpcurrent = scrolltype.querySelector(".current");
    self.pickerDate[tmpmod](tmpcurrent._value)
    self._updateDate();

}
function current_postion(dom,i){
   dom.style.transform = "translateY("+(120-i*60)+"px)";
}
移动端渲染暂时和pc保持一致 end
*/
'use strict';

u.Time = u.BaseComponent.extend({
	DEFAULTS: {},
	init: function init() {
		var self = this;
		var element = this.element;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.panelDiv = null;
		this.input = this.element.querySelector("input");
		u.addClass(this.element, 'u-text');

		u.on(this.input, 'blur', function (e) {
			this.setValue(this.input.value);
		}.bind(this));

		// 添加focus事件
		this.focusEvent();
		// 添加右侧图标click事件
		this.clickEvent();
	}
});

u.Time.fn = u.Time.prototype;

u.Time.fn.createPanel = function () {
	if (this.panelDiv) return;
	var oThis = this;
	this.panelDiv = u.makeDOM('<div class="u-combo-ul" style="padding:0px;"></div>');
	this.panelContentDiv = u.makeDOM('<div class="u-time-content"></div>');
	this.panelDiv.appendChild(this.panelContentDiv);
	this.panelHourDiv = u.makeDOM('<div class="u-time-cell"></div>');
	this.panelContentDiv.appendChild(this.panelHourDiv);
	this.panelHourInput = u.makeDOM('<input class="u-time-input">');
	this.panelHourDiv.appendChild(this.panelHourInput);
	this.panelMinDiv = u.makeDOM('<div class="u-time-cell"></div>');
	this.panelContentDiv.appendChild(this.panelMinDiv);
	this.panelMinInput = u.makeDOM('<input class="u-time-input">');
	this.panelMinDiv.appendChild(this.panelMinInput);
	this.panelSecDiv = u.makeDOM('<div class="u-time-cell"></div>');
	this.panelContentDiv.appendChild(this.panelSecDiv);
	this.panelSecInput = u.makeDOM('<input class="u-time-input">');
	this.panelSecDiv.appendChild(this.panelSecInput);
	this.panelNavDiv = u.makeDOM('<div class="u-time-nav"></div>');
	this.panelDiv.appendChild(this.panelNavDiv);
	this.panelOKButton = u.makeDOM('<button class="u-button" style="float:right;">OK</button>');
	this.panelNavDiv.appendChild(this.panelOKButton);
	u.on(this.panelOKButton, 'click', function () {
		var v = oThis.panelHourInput.value + ':' + oThis.panelMinInput.value + ':' + oThis.panelSecInput.value;
		oThis.setValue(v);
		oThis.hide();
	});
	this.panelCancelButton = u.makeDOM('<button class="u-button" style="float:right;">Cancel</button>');
	this.panelNavDiv.appendChild(this.panelCancelButton);
	u.on(this.panelCancelButton, 'click', function () {
		oThis.hide();
	});

	var d = new Date();
	this.panelHourInput.value = d.getHours() > 9 ? '' + d.getHours() : '0' + d.getHours();
	this.panelMinInput.value = d.getMinutes() > 9 ? '' + d.getMinutes() : '0' + d.getMinutes();
	this.panelSecInput.value = d.getSeconds() > 9 ? '' + d.getSeconds() : '0' + d.getSeconds();
	this.element.parentNode.appendChild(this.panelDiv);
};

u.Time.fn.setValue = function (value) {
	var hour = '',
	    min = '',
	    sec = '';
	value = value ? value : '';
	if (value == this.input.value) return;
	if (value && value.indexOf(':') > -1) {
		var vA = value.split(":");
		var hour = vA[0];
		hour = hour % 24;
		hour = hour > 9 ? '' + hour : '0' + hour;
		var min = vA[1];
		min = min % 60;
		min = min > 9 ? '' + min : '0' + min;
		var sec = vA[2];
		sec = sec % 60;
		sec = sec > 9 ? '' + sec : '0' + sec;

		value = hour + ':' + min + ':' + sec;
	}
	this.input.value = value;
	this.createPanel();

	this.panelHourInput.value = hour;
	this.panelMinInput.value = min;
	this.panelSecInput.value = sec;
	this.trigger('valueChange', { value: value });
};

u.Time.fn.focusEvent = function () {
	var self = this;
	u.on(this.element, 'click', function (e) {
		self.show(e);

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

//下拉图标的点击事件
u.Time.fn.clickEvent = function () {
	var self = this;
	var caret = this.element.nextSibling;
	u.on(caret, 'click', function (e) {
		self.show(e);
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

u.Time.fn.show = function (evt) {

	var inputValue = this.input.value;
	this.setValue(inputValue);

	var oThis = this;
	this.createPanel();

	/*因为元素可能变化位置，所以显示的时候需要重新计算*/
	this.width = this.element.offsetWidth;
	if (this.width < 300) this.width = 300;

	this.panelDiv.style.width = this.width + 'px';
	u.showPanelByEle({
		ele: this.input,
		panel: this.panelDiv,
		position: "bottomLeft"
	});
	this.panelDiv.style.zIndex = u.getZIndex();
	u.addClass(this.panelDiv, 'is-visible');

	document.body.onscroll = function () {
		u.showPanelByEle({
			ele: oThis.input,
			panel: oThis.panelDiv,
			position: "bottomLeft"
		});
	};

	var callback = function (e) {
		if (e !== evt && e.target !== this.input && !oThis.clickPanel(e.target)) {
			u.off(document, 'click', callback);
			// document.removeEventListener('click', callback);
			this.hide();
		}
	}.bind(this);
	u.on(document, 'click', callback);
	// document.addEventListener('click', callback);
};

u.Time.fn.clickPanel = function (dom) {
	while (dom) {
		if (dom == this.panelDiv) {
			return true;
		} else {
			dom = dom.parentNode;
		}
	}
	return false;
};

u.Time.fn.hide = function () {
	u.removeClass(this.panelDiv, 'is-visible');
	this.panelDiv.style.zIndex = -1;
};

if (u.compMgr) {
	u.compMgr.regComp({
		comp: u.Time,
		compAsString: 'u.Time',
		css: 'u-time'
	});
	if (u.isIE8) {
		u.compMgr.regComp({
			comp: u.Time,
			compAsString: 'u.ClockPicker',
			css: 'u-clockpicker'
		});
	}
}
'use strict';

u.YearMonth = u.BaseComponent.extend({
  DEFAULTS: {},
  init: function init() {
    var self = this;
    var element = this.element;
    this.options = u.extend({}, this.DEFAULTS, this.options);
    this.panelDiv = null;
    this.input = this.element.querySelector("input");
    //u.addClass(this.element,'u-text');

    var d = new Date();
    this.year = d.getFullYear();
    this.startYear = this.year - this.year % 10 - 1;
    this.month = d.getMonth() + 1;

    u.on(this.input, 'blur', function (e) {
      this.setValue(this.input.value);
    }.bind(this));

    // 添加focus事件
    this.focusEvent();
    // 添加右侧图标click事件
    this.clickEvent();
  }
});

u.YearMonth.fn = u.YearMonth.prototype;

u.YearMonth.fn.createPanel = function () {
  if (this.panelDiv) {
    this._fillYear();
    return;
  }
  var oThis = this;
  this.panelDiv = u.makeDOM('<div class="u-date-panel" style="padding:0px;margin:0px;"></div>');
  this.panelContentDiv = u.makeDOM('<div class="u-date-content"></div>');
  this.panelDiv.appendChild(this.panelContentDiv);

  // this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button flat floating mini" style="display:none;">&lt;</button>');
  // this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button flat floating mini" style="display:none;">&gt;</button>');
  this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button mini">&lt;</button>');
  this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button mini">&gt;</button>');

  u.on(this.preBtn, 'click', function (e) {
    oThis.startYear -= 10;
    oThis._fillYear();
  });
  u.on(this.nextBtn, 'click', function (e) {
    oThis.startYear += 10;
    oThis._fillYear();
  });
  this.panelContentDiv.appendChild(this.preBtn);
  this.panelContentDiv.appendChild(this.nextBtn);
  this._fillYear();
  this.element.parentNode.appendChild(this.panelDiv);
};

/**
 *填充年份选择面板
 * @private
 */
u.YearMonth.fn._fillYear = function (type) {
  var oldPanel, year, template, yearPage, titleDiv, yearDiv, i, cell;
  oldPanel = this.panelContentDiv.querySelector('.u-date-content-page');
  if (oldPanel) this.panelContentDiv.removeChild(oldPanel);
  template = ['<div class="u-date-content-page">', '<div class="u-date-content-title"></div>', '<div class="u-date-content-panel"></div>', '</div>'].join("");
  yearPage = u.makeDOM(template);
  titleDiv = yearPage.querySelector('.u-date-content-title');
  titleDiv.innerHTML = this.startYear + '-' + (this.startYear + 11);
  yearDiv = yearPage.querySelector('.u-date-content-panel');
  for (i = 0; i < 12; i++) {
    cell = u.makeDOM('<div class="u-date-content-year-cell">' + (this.startYear + i) + '</div>');
    new URipple(cell);
    if (this.startYear + i == this.year) {
      u.addClass(cell, 'current');
    }
    cell._value = this.startYear + i;
    yearDiv.appendChild(cell);
  }
  var oThis = this;
  u.on(yearDiv, 'click', function (e) {
    var _y = e.target._value;
    oThis.year = _y;
    oThis._fillMonth();
    u.stopEvent(e);
  });

  this.preBtn.style.display = 'block';
  this.nextBtn.style.display = 'block';
  // this._zoomIn(yearPage);
  this.panelContentDiv.appendChild(yearPage);
  this.contentPage = yearPage;
  this.currentPanel = 'year';
};

/**
 * 填充月份选择面板
 * @private
 */
u.YearMonth.fn._fillMonth = function () {
  var oldPanel, template, monthPage, _month, cells, i;
  oldPanel = this.panelContentDiv.querySelector('.u-date-content-page');
  if (oldPanel) this.panelContentDiv.removeChild(oldPanel);
  _month = this.month;
  template = ['<div class="u-date-content-page">', '<div class="u-date-content-title">' + _month + '月</div>', '<div class="u-date-content-panel">', '<div class="u-date-content-year-cell">1月</div>', '<div class="u-date-content-year-cell">2月</div>', '<div class="u-date-content-year-cell">3月</div>', '<div class="u-date-content-year-cell">4月</div>', '<div class="u-date-content-year-cell">5月</div>', '<div class="u-date-content-year-cell">6月</div>', '<div class="u-date-content-year-cell">7月</div>', '<div class="u-date-content-year-cell">8月</div>', '<div class="u-date-content-year-cell">9月</div>', '<div class="u-date-content-year-cell">10月</div>', '<div class="u-date-content-year-cell">11月</div>', '<div class="u-date-content-year-cell">12月</div>', '</div>', '</div>'].join("");

  monthPage = u.makeDOM(template);
  cells = monthPage.querySelectorAll('.u-date-content-year-cell');
  for (i = 0; i < cells.length; i++) {
    if (_month == i + 1) {
      u.addClass(cells[i], 'current');
    }
    cells[i]._value = i + 1;
    new URipple(cells[i]);
  }
  var oThis = this;
  u.on(monthPage, 'click', function (e) {
    var _m = e.target._value;
    oThis.month = _m;
    monthPage.querySelector('.u-date-content-title').innerHTML = _m + '月';
    oThis.setValue(oThis.year + '-' + oThis.month);
    oThis.hide();
  });

  this.preBtn.style.display = 'none';
  this.nextBtn.style.display = 'none';
  this._zoomIn(monthPage);
  this.currentPanel = 'month';
};

/**
 * 淡入动画效果
 * @private
 */
u.YearMonth.fn._zoomIn = function (newPage) {
  if (!this.contentPage) {
    this.panelContentDiv.appendChild(newPage);
    this.contentPage = newPage;
    return;
  }
  u.addClass(newPage, 'zoom-in');
  this.panelContentDiv.appendChild(newPage);
  if (u.isIE8) {
    this.contentPage = newPage;
  } else {
    var cleanup = function () {
      newPage.removeEventListener('transitionend', cleanup);
      newPage.removeEventListener('webkitTransitionEnd', cleanup);
      // this.panelContentDiv.removeChild(this.contentPage);
      this.contentPage = newPage;
    }.bind(this);
    if (this.contentPage) {
      newPage.addEventListener('transitionend', cleanup);
      newPage.addEventListener('webkitTransitionEnd', cleanup);
    }
    window.requestAnimationFrame(function () {
      u.addClass(this.contentPage, 'is-hidden');
      u.removeClass(newPage, 'zoom-in');
    }.bind(this));
  }
};

u.YearMonth.fn.setValue = function (value) {
  value = value ? value : '';
  if (value && value.indexOf('-') > -1) {
    var vA = value.split("-");
    this.year = vA[0];
    var month = vA[1];
    this.month = month % 12;
    if (this.month == 0) this.month = 12;

    value = this.year + '-' + this.month;
  }
  this.value = value;
  this.input.value = value;
  this.trigger('valueChange', { value: value });
};

u.YearMonth.fn.focusEvent = function () {
  var self = this;
  u.on(this.element, 'click', function (e) {
    self.show(e);

    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  });
};

//下拉图标的点击事件
u.YearMonth.fn.clickEvent = function () {
  var self = this;
  var caret = this.element.nextSibling;
  u.on(caret, 'click', function (e) {
    self.show(e);
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  });
};

u.YearMonth.fn.show = function (evt) {
  var oThis = this;
  if (this.value && this.value.indexOf('-') > -1) {
    var vA = this.value.split("-");
    this.year = vA[0];
    var month = vA[1];
    this.month = month % 12;
    if (this.month == 0) this.month = 12;
  }
  this.createPanel();
  /*因为元素可能变化位置，所以显示的时候需要重新计算*/
  this.width = this.element.offsetWidth;
  if (this.width < 300) this.width = 300;

  this.panelDiv.style.width = this.width + 'px';
  u.showPanelByEle({
    ele: this.input,
    panel: this.panelDiv,
    position: "bottomLeft"
  });

  document.body.onscroll = function () {
    u.showPanelByEle({
      ele: oThis.input,
      panel: oThis.panelDiv,
      position: "bottomLeft"
    });
  };
  this.panelDiv.style.zIndex = u.getZIndex();
  u.addClass(this.panelDiv, 'is-visible');
  var oThis = this;
  var callback = function callback(e) {
    if (e !== evt && e.target !== oThis.input && !oThis.clickPanel(e.target)) {
      // document.removeEventListener('click', callback);
      u.off(document, 'click', callback);
      oThis.hide();
    }
  };
  u.on(document, 'click', callback);
  // document.addEventListener('click', callback);
};

u.YearMonth.fn.clickPanel = function (dom) {
  while (dom) {
    if (dom == this.panelDiv) {
      return true;
    } else {
      dom = dom.parentNode;
    }
  }
  return false;
};

u.YearMonth.fn.hide = function () {
  u.removeClass(this.panelDiv, 'is-visible');
  this.panelDiv.style.zIndex = -1;
};

if (u.compMgr) u.compMgr.regComp({
  comp: u.YearMonth,
  compAsString: 'u.YearMonth',
  css: 'u-yearmonth'
});
'use strict';

u.Year = u.BaseComponent.extend({
	DEFAULTS: {},
	init: function init() {
		var self = this;
		var element = this.element;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.panelDiv = null;
		this.input = this.element.querySelector("input");
		//u.addClass(this.element,'u-text');

		var d = new Date();
		this.year = d.getFullYear();
		this.defaultYear = this.year;
		this.startYear = this.year - this.year % 10 - 1;

		u.on(this.input, 'blur', function (e) {
			this.setValue(this.input.value);
		}.bind(this));

		// 添加focus事件
		this.focusEvent();
		// 添加右侧图标click事件
		this.clickEvent();
	}
});

u.Year.fn = u.Year.prototype;

u.Year.fn.createPanel = function () {
	if (this.panelDiv) {
		this._fillYear();
		return;
	}
	var oThis = this;
	this.panelDiv = u.makeDOM('<div class="u-date-panel" style="padding:0px;margin:0px;"></div>');
	this.panelContentDiv = u.makeDOM('<div class="u-date-content"></div>');
	this.panelDiv.appendChild(this.panelContentDiv);

	// this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button flat floating mini" style="display:none;">&lt;</button>');
	//    this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button flat floating mini" style="display:none;">&gt;</button>');
	this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button mini">&lt;</button>');
	this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button mini">&gt;</button>');

	u.on(this.preBtn, 'click', function (e) {
		oThis.startYear -= 10;
		oThis._fillYear();
	});
	u.on(this.nextBtn, 'click', function (e) {
		oThis.startYear += 10;
		oThis._fillYear();
	});
	this.panelContentDiv.appendChild(this.preBtn);
	this.panelContentDiv.appendChild(this.nextBtn);
	this._fillYear();
	this.element.parentNode.appendChild(this.panelDiv);
};

/**
 *填充年份选择面板
 * @private
 */
u.Year.fn._fillYear = function (type) {
	var oldPanel, year, template, yearPage, titleDiv, yearDiv, i, cell;
	oldPanel = this.panelContentDiv.querySelector('.u-date-content-page');
	if (oldPanel) this.panelContentDiv.removeChild(oldPanel);
	template = ['<div class="u-date-content-page">', '<div class="u-date-content-title"></div>', '<div class="u-date-content-panel"></div>', '</div>'].join("");
	yearPage = u.makeDOM(template);
	titleDiv = yearPage.querySelector('.u-date-content-title');
	titleDiv.innerHTML = this.startYear + '-' + (this.startYear + 11);
	yearDiv = yearPage.querySelector('.u-date-content-panel');
	for (i = 0; i < 12; i++) {
		cell = u.makeDOM('<div class="u-date-content-year-cell">' + (this.startYear + i) + '</div>');
		new URipple(cell);
		if (this.startYear + i == this.year) {
			u.addClass(cell, 'current');
		}
		cell._value = this.startYear + i;
		yearDiv.appendChild(cell);
	}
	u.on(yearDiv, 'click', function (e) {
		var _y = e.target._value;
		this.year = _y;
		this.setValue(_y);
		this.hide();
		u.stopEvent(e);
	}.bind(this));

	this.preBtn.style.display = 'block';
	this.nextBtn.style.display = 'block';
	this.panelContentDiv.appendChild(yearPage);

	this.currentPanel = 'year';
};

u.Year.fn.setValue = function (value) {
	value = value ? value : '';
	this.value = value;
	if (value) {
		this.year = value;
	} else {
		this.year = this.defaultYear;
	}
	this.startYear = this.year - this.year % 10 - 1;
	this.input.value = value;
	this.trigger('valueChange', { value: value });
};

u.Year.fn.focusEvent = function () {
	var self = this;
	u.on(this.element, 'click', function (e) {
		self.show(e);

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

//下拉图标的点击事件
u.Year.fn.clickEvent = function () {
	var self = this;
	var caret = this.element.nextSibling;
	u.on(caret, 'click', function (e) {
		self.show(e);
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

u.Year.fn.show = function (evt) {
	var oThis = this;
	this.createPanel();

	this.width = this.element.offsetWidth;
	if (this.width < 300) this.width = 300;

	this.panelDiv.style.width = 152 + 'px';
	u.showPanelByEle({
		ele: this.input,
		panel: this.panelDiv,
		position: "bottomLeft"
	});
	document.body.onscroll = function () {
		u.showPanelByEle({
			ele: oThis.input,
			panel: oThis.panelDiv,
			position: "bottomLeft"
		});
	};
	this.panelDiv.style.zIndex = u.getZIndex();
	u.addClass(this.panelDiv, 'is-visible');

	var callback = function (e) {
		if (e !== evt && e.target !== this.input && !oThis.clickPanel(e.target)) {
			u.off(document, 'click', callback);
			// document.removeEventListener('click', callback);
			this.hide();
		}
	}.bind(this);
	u.on(document, 'click', callback);
	// document.addEventListener('click', callback);
};

u.Year.fn.clickPanel = function (dom) {
	while (dom) {
		if (dom == this.panelDiv) {
			return true;
		} else {
			dom = dom.parentNode;
		}
	}
	return false;
};

u.Year.fn.hide = function () {
	u.removeClass(this.panelDiv, 'is-visible');
	this.panelDiv.style.zIndex = -1;
};

if (u.compMgr) u.compMgr.regComp({
	comp: u.Year,
	compAsString: 'u.Year',
	css: 'u-year'
});
'use strict';

u.Month = u.BaseComponent.extend({
	DEFAULTS: {},
	init: function init() {
		var self = this;
		var element = this.element;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.panelDiv = null;
		this.input = this.element.querySelector("input");
		//u.addClass(this.element,'u-text');

		var d = new Date();
		this.month = d.getMonth() + 1;
		this.defaultMonth = this.month;

		u.on(this.input, 'blur', function (e) {
			this.setValue(this.input.value);
		}.bind(this));

		// 添加focus事件
		this.focusEvent();
		// 添加右侧图标click事件
		this.clickEvent();
	}
});

u.Month.fn = u.Month.prototype;

u.Month.fn.createPanel = function () {
	if (this.panelDiv) {
		this._fillMonth();
		return;
	}
	var oThis = this;
	this.panelDiv = u.makeDOM('<div class="u-date-panel" style="padding:0px;margin:0px;"></div>');
	this.panelContentDiv = u.makeDOM('<div class="u-date-content"></div>');
	this.panelDiv.appendChild(this.panelContentDiv);

	this.preBtn = u.makeDOM('<button class="u-date-pre-button u-button flat floating mini" style="display:none;">&lt;</button>');
	this.nextBtn = u.makeDOM('<button class="u-date-next-button u-button flat floating mini" style="display:none;">&gt;</button>');

	u.on(this.preBtn, 'click', function (e) {
		oThis.startYear -= 10;
		oThis._fillYear();
	});
	u.on(this.nextBtn, 'click', function (e) {
		oThis.startYear += 10;
		oThis._fillYear();
	});
	this.panelContentDiv.appendChild(this.preBtn);
	this.panelContentDiv.appendChild(this.nextBtn);
	this._fillMonth();
	this.element.parentNode.appendChild(this.panelDiv);
};

/**
 * 填充月份选择面板
 * @private
 */
u.Month.fn._fillMonth = function () {
	var oldPanel, template, monthPage, _month, cells, i;
	oldPanel = this.panelContentDiv.querySelector('.u-date-content-page');
	if (oldPanel) this.panelContentDiv.removeChild(oldPanel);
	_month = this.month;
	template = ['<div class="u-date-content-page">', '<div class="u-date-content-title">' + _month + '月</div>', '<div class="u-date-content-panel">', '<div class="u-date-content-year-cell">1月</div>', '<div class="u-date-content-year-cell">2月</div>', '<div class="u-date-content-year-cell">3月</div>', '<div class="u-date-content-year-cell">4月</div>', '<div class="u-date-content-year-cell">5月</div>', '<div class="u-date-content-year-cell">6月</div>', '<div class="u-date-content-year-cell">7月</div>', '<div class="u-date-content-year-cell">8月</div>', '<div class="u-date-content-year-cell">9月</div>', '<div class="u-date-content-year-cell">10月</div>', '<div class="u-date-content-year-cell">11月</div>', '<div class="u-date-content-year-cell">12月</div>', '</div>', '</div>'].join("");

	monthPage = u.makeDOM(template);
	cells = monthPage.querySelectorAll('.u-date-content-year-cell');
	for (i = 0; i < cells.length; i++) {
		if (_month == i + 1) {
			u.addClass(cells[i], 'current');
		}
		cells[i]._value = i + 1;
		new URipple(cells[i]);
	}
	u.on(monthPage, 'click', function (e) {
		var _m = e.target._value;
		this.month = _m;
		monthPage.querySelector('.u-date-content-title').innerHTML = _m + '月';
		this.setValue(_m);
		this.hide();
	}.bind(this));

	this.preBtn.style.display = 'none';
	this.nextBtn.style.display = 'none';
	this.panelContentDiv.appendChild(monthPage);
	this.currentPanel = 'month';
};

u.Month.fn.setValue = function (value) {
	value = value ? value : '';
	this.value = value;
	if (value) {
		this.month = value;
	} else {
		this.month = this.defaultMonth;
	}
	this.input.value = value;
	this.trigger('valueChange', { value: value });
};

u.Month.fn.focusEvent = function () {
	var self = this;
	u.on(this.element, 'click', function (e) {
		self.show(e);

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

//下拉图标的点击事件
u.Month.fn.clickEvent = function () {
	var self = this;
	var caret = this.element.nextSibling;
	u.on(caret, 'click', function (e) {
		self.show(e);
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

u.Month.fn.show = function (evt) {
	var oThis = this;
	this.createPanel();

	this.width = this.element.offsetWidth;
	if (this.width < 300) this.width = 300;
	u.showPanelByEle({
		ele: this.input,
		panel: this.panelDiv,
		position: "bottomLeft"
	});
	document.body.onscroll = function () {
		u.showPanelByEle({
			ele: oThis.input,
			panel: oThis.panelDiv,
			position: "bottomLeft"
		});
	};
	this.panelDiv.style.width = 152 + 'px';
	this.panelDiv.style.zIndex = u.getZIndex();
	u.addClass(this.panelDiv, 'is-visible');

	var callback = function (e) {
		if (e !== evt && e.target !== this.input && !oThis.clickPanel(e.target)) {
			u.off(document, 'click', callback);
			// document.removeEventListener('click', callback);
			this.hide();
		}
	}.bind(this);
	u.on(document, 'click', callback);
	// document.addEventListener('click', callback);
};

u.Month.fn.clickPanel = function (dom) {
	while (dom) {
		if (dom == this.panelDiv) {
			return true;
		} else {
			dom = dom.parentNode;
		}
	}
	return false;
};

u.Month.fn.hide = function () {
	u.removeClass(this.panelDiv, 'is-visible');
	this.panelDiv.style.zIndex = -1;
};

if (u.compMgr) u.compMgr.regComp({
	comp: u.Month,
	compAsString: 'u.Month',
	css: 'u-month'
});
'use strict';

u.ClockPicker = u.BaseComponent.extend({
	DEFAULTS: {},
	init: function init() {
		var self = this;
		var element = this.element;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.format = this.options['format'] || u.core.getMaskerMeta('time').format;
		this.panelDiv = null;
		this.input = this.element.querySelector("input");
		if (u.isMobile) {
			this.input.setAttribute('readonly', 'readonly');
		}
		u.addClass(this.element, 'u-text');

		this.template = '<div class="u-clock-ul popover clockpicker-popover" style="padding:0px;">';
		this.template += '<div class="popover-title"><button class="u-button u-date-clean u-clock-clean" >清空</button><span class="clockpicker-span-hours">02</span> : <span class="clockpicker-span-minutes text-primary">01</span><span class="clockpicker-span-am-pm"></span></div>';
		this.template += '<div class="popover-content">';
		this.template += '	<div class="clockpicker-plate">';
		this.template += '		<div class="clockpicker-canvas">';
		this.template += '			<svg class="clockpicker-svg">';
		this.template += '				<g transform="translate(100,100)">';
		this.template += '					<circle class="clockpicker-canvas-bg clockpicker-canvas-bg-trans" r="13" cx="8.362277061412277" cy="-79.56175162946187"></circle>';
		this.template += '					<circle class="clockpicker-canvas-fg" r="3.5" cx="8.362277061412277" cy="-79.56175162946187"></circle>';
		this.template += '					<line x1="0" y1="0" x2="8.362277061412277" y2="-79.56175162946187"></line>';
		this.template += '					<circle class="clockpicker-canvas-bearing" cx="0" cy="0" r="2"></circle>';
		this.template += '				</g>';
		this.template += '			</svg>';
		this.template += '		</div>';
		this.template += '		<div class="clockpicker-dial clockpicker-hours" style="visibility: visible;">';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-1" >00</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-2" >1</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-3" >2</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-4" >3</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-5" >4</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-6" >5</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-7" >6</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-8" >7</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-9" >8</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-10" >9</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-11" >10</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-12" >11</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-13" >12</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-14" >13</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-15" >14</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-16" >15</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-17" >16</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-18" >17</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-19" >18</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-20" >19</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-21" >20</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-22" >21</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-23" >22</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-24" >23</div>';
		this.template += '		</div>';
		this.template += '		<div class="clockpicker-dial clockpicker-minutes" style="visibility: hidden;">';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-25" >00</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-26" >05</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-27" >10</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-28" >15</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-29" >20</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-30" >25</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-31" >30</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-32" >35</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-33" >40</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-34" >45</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-35" >50</div>';
		this.template += '			<div class="clockpicker-tick clockpicker-tick-36" >55</div>';
		this.template += '		</div>';
		this.template += '	</div><span class="clockpicker-am-pm-block"></span></div>';
		this.template += '	</div>';
		u.on(this.input, 'blur', function (e) {
			this.setValue(this.input.value);
		}.bind(this));

		var d = new Date();
		this.defaultHour = d.getHours() > 9 ? '' + d.getHours() : '0' + d.getHours();
		this.defaultMin = d.getMinutes() > 9 ? '' + d.getMinutes() : '0' + d.getMinutes();
		this.defaultSec = d.getSeconds() > 9 ? '' + d.getSeconds() : '0' + d.getSeconds();

		this.hours = this.defaultHour;
		this.min = this.defaultMin;
		this.sec = this.defaultSec;
		// 添加focus事件
		this.focusEvent();
		// 添加右侧图标click事件
		this.clickEvent();
	}
});

u.ClockPicker.fn = u.ClockPicker.prototype;

/**
* 淡入动画效果
* @private
*/
u.ClockPicker.fn._zoomIn = function (newPage) {

	u.addClass(newPage, 'zoom-in');

	var cleanup = function () {
		u.off(newPage, 'transitionend', cleanup);
		u.off(newPage, 'webkitTransitionEnd', cleanup);
		// this.panelContentDiv.removeChild(this.contentPage);
		this.contentPage = newPage;
	}.bind(this);
	if (this.contentPage) {
		u.on(newPage, 'transitionend', cleanup);
		u.on(newPage, 'webkitTransitionEnd', cleanup);
	}
	setTimeout(function () {
		newPage.style.visibility = 'visible';
		u.removeClass(newPage, 'zoom-in');
	}, 150);
};

u.ClockPicker.fn.createPanel = function () {
	if (this.panelDiv) return;
	var oThis = this;
	this.panelDiv = u.makeDOM(this.template);

	this.hand = this.panelDiv.querySelector('line');
	this.bg = this.panelDiv.querySelector('.clockpicker-canvas-bg');
	this.fg = this.panelDiv.querySelector('.clockpicker-canvas-fg');
	this.titleHourSpan = this.panelDiv.querySelector('.clockpicker-span-hours');
	this.titleMinSpan = this.panelDiv.querySelector('.clockpicker-span-minutes');
	this.hourDiv = this.panelDiv.querySelector('.clockpicker-hours');
	this.minDiv = this.panelDiv.querySelector('.clockpicker-minutes');
	this.btnClean = this.panelDiv.querySelector('.u-date-clean');
	if (!u.isMobile) this.btnClean.style.display = 'none';
	this.currentView = 'hours';
	u.on(this.hourDiv, 'click', function (e) {
		var target = e.target;
		if (u.hasClass(target, 'clockpicker-tick')) {
			this.hours = target.innerHTML;
			this.hours = this.hours > 9 || this.hours == '00' ? '' + this.hours : '0' + this.hours;
			this.titleHourSpan.innerHTML = this.hours;
			this.hourDiv.style.visibility = 'hidden';
			// this.minDiv.style.visibility = 'visible';
			this._zoomIn(this.minDiv);
			this.currentView = 'min';
			this.setHand();
		}
	}.bind(this));

	u.on(this.minDiv, 'click', function (e) {
		var target = e.target;
		if (u.hasClass(target, 'clockpicker-tick')) {
			this.min = target.innerHTML;
			// this.min = this.min > 9 || this.min == 00? '' + this.min:'0' + this.min;
			this.titleMinSpan.innerHTML = this.min;
			this.minDiv.style.visibility = 'hidden';
			this.hourDiv.style.visibility = 'visible';
			this.currentView = 'hours';
			var v = this.hours + ':' + this.min + ':' + this.sec;
			this.setValue(v);
			this.hide();
		}
	}.bind(this));

	u.on(this.btnClean, 'click', function (e) {
		this.setValue("");
		this.hide();
	}.bind(this));

	document.body.appendChild(this.panelDiv);
};

u.ClockPicker.fn.setHand = function () {
	var dialRadius = 100,
	    innerRadius = 54,
	    outerRadius = 80;
	var view = this.currentView,
	    value = this[view],
	    isHours = view === 'hours',
	    unit = Math.PI / (isHours ? 6 : 30),
	    radian = value * unit,
	    radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
	    x = Math.sin(radian) * radius,
	    y = -Math.cos(radian) * radius;
	this.setHandFun(x, y);
};

u.ClockPicker.fn.setHandFun = function (x, y, roundBy5, dragging) {
	var dialRadius = 100,
	    innerRadius = 54,
	    outerRadius = 80;

	var radian = Math.atan2(x, -y),
	    isHours = this.currentView === 'hours',
	    unit = Math.PI / (isHours ? 6 : 30),
	    z = Math.sqrt(x * x + y * y),
	    options = this.options,
	    inner = isHours && z < (outerRadius + innerRadius) / 2,
	    radius = inner ? innerRadius : outerRadius,
	    value;

	if (this.twelvehour) {
		radius = outerRadius;
	}

	// Radian should in range [0, 2PI]
	if (radian < 0) {
		radian = Math.PI * 2 + radian;
	}

	// Get the round value
	value = Math.round(radian / unit);

	// Get the round radian
	radian = value * unit;

	// Correct the hours or minutes
	if (options.twelvehour) {
		if (isHours) {
			if (value === 0) {
				value = 12;
			}
		} else {
			if (roundBy5) {
				value *= 5;
			}
			if (value === 60) {
				value = 0;
			}
		}
	} else {
		if (isHours) {
			if (value === 12) {
				value = 0;
			}
			value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
		} else {
			if (roundBy5) {
				value *= 5;
			}
			if (value === 60) {
				value = 0;
			}
		}
	}

	// Set clock hand and others' position
	var w = this.panelDiv.querySelector('.clockpicker-plate').offsetWidth;
	var u = w / 200;
	var cx = Math.sin(radian) * radius * u,
	    cy = -Math.cos(radian) * radius * u;
	var iu = 100 * u;
	this.panelDiv.querySelector('g').setAttribute('transform', 'translate(' + iu + ',' + iu + ')');

	this.hand.setAttribute('x2', cx);
	this.hand.setAttribute('y2', cy);
	this.bg.setAttribute('cx', cx);
	this.bg.setAttribute('cy', cy);
	this.fg.setAttribute('cx', cx);
	this.fg.setAttribute('cy', cy);
};

u.ClockPicker.fn.setValue = function (value) {
	value = value ? value : '';

	if (value == '') {
		this.input.value = '';

		this.trigger('valueChange', { value: '' });
		return;
	}

	if (value && value.indexOf(':') > -1) {
		var vA = value.split(":");
		var hour = vA[0];
		hour = hour % 24;
		this.hours = hour > 9 ? '' + hour : '0' + hour;
		var min = vA[1];
		min = min % 60;
		this.min = min > 9 ? '' + min : '0' + min;
		var sec = vA[2] || 0;
		sec = sec % 60;
		this.sec = sec > 9 ? '' + sec : '0' + sec;

		value = this.hours + ':' + this.min + ':' + this.sec;
	} else {
		this.hours = this.defaultHour;
		this.min = this.defaultMin;
		this.sec = this.defaultSec;
	}
	var _date = new Date();
	_date.setHours(this.hours);
	_date.setMinutes(this.min);
	_date.setSeconds(this.sec);
	var showValue = u.date.format(_date, this.format);
	this.input.value = showValue;

	this.trigger('valueChange', { value: value });
};

u.ClockPicker.fn.focusEvent = function () {
	var self = this;
	u.on(this.element, 'click', function (e) {
		self.show(e);

		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

//下拉图标的点击事件
u.ClockPicker.fn.clickEvent = function () {
	var self = this;
	var caret = this.element.nextSibling;
	u.on(caret, 'click', function (e) {
		self.show(e);
		if (e.stopPropagation) {
			e.stopPropagation();
		} else {
			e.cancelBubble = true;
		}
	});
};

u.ClockPicker.fn.show = function (evt) {

	var inputValue = this.input.value;
	this.setValue(inputValue);

	var self = this;
	this.createPanel();
	this.minDiv.style.visibility = 'hidden';
	this.hourDiv.style.visibility = 'visible';
	this.currentView = 'hours';
	this.titleHourSpan.innerHTML = this.hours;
	this.titleMinSpan.innerHTML = this.min;

	/*因为元素可能变化位置，所以显示的时候需要重新计算*/
	if (u.isMobile) {
		this.panelDiv.style.position = 'fixed';
		this.panelDiv.style.top = '20%';
		var screenW = document.body.clientWidth;
		var l = (screenW - 226) / 2;
		this.panelDiv.style.left = l + 'px';
		this.overlayDiv = u.makeModal(this.panelDiv);
		u.on(this.overlayDiv, 'click', function () {
			self.hide();
		});
	} else {
		u.showPanelByEle({
			ele: this.input,
			panel: this.panelDiv,
			position: "bottomLeft"
		});
		document.body.onscroll = function () {
			u.showPanelByEle({
				ele: self.input,
				panel: self.panelDiv,
				position: "bottomLeft"
			});
		};
	}

	this.panelDiv.style.zIndex = u.getZIndex();
	u.addClass(this.panelDiv, 'is-visible');

	this.setHand();

	var callback = function (e) {
		if (e !== evt && e.target !== this.input && !self.clickPanel(e.target)) {
			u.off(document, 'click', callback);
			this.hide();
		}
	}.bind(this);
	u.on(document, 'click', callback);
};

u.ClockPicker.fn.clickPanel = function (dom) {
	while (dom) {
		if (dom == this.panelDiv) {
			return true;
		} else {
			dom = dom.parentNode;
		}
	}
	return false;
};

u.ClockPicker.fn.hide = function () {
	u.removeClass(this.panelDiv, 'is-visible');
	this.panelDiv.style.zIndex = -1;
	if (this.overlayDiv) {
		try {
			document.body.removeChild(this.overlayDiv);
		} catch (e) {}
	}
};

if (u.compMgr) if (!u.isIE8) {
	u.compMgr.regComp({
		comp: u.ClockPicker,
		compAsString: 'u.ClockPicker',
		css: 'u-clockpicker'
	});
}
'use strict';

/**
 * Created by dingrf on 2015-11-20.
 */

u.Combo = u.BaseComponent.extend({
    init: function init() {
        this.mutilSelect = this.options['mutilSelect'] || false;
        if (u.hasClass(this.element, 'mutil-select')) {
            this.mutilSelect = true;
        }

        this.onlySelect = this.options['onlySelect'] || false;
        if (this.mutilSelect) this.onlySelect = true;

        this.comboDatas = [];
        var i,
            option,
            datas = [],
            self = this;
        //u.addClass(this.element, 'u-text')
        new u.Text(this.element);
        var options = this.element.getElementsByTagName('option');
        for (i = 0; i < options.length; i++) {
            option = options[i];
            datas.push({ value: option.value, name: option.text });
        }

        this.setComboData(datas);
        this._input = this.element.querySelector("input");
        if (this.onlySelect || u.isMobile) {
            setTimeout(function () {
                self._input.setAttribute('readonly', 'readonly');
            }, 1000);
        } else {
            u.on(this._input, 'blur', function (e) {
                var v = this.value;
                /*校验数值是否存在于datasource的name中*/
                for (var i = 0; i < self.comboDatas.length; i++) {
                    if (v == self.comboDatas[i].name) {
                        v = self.comboDatas[i].value;
                        break;
                    }
                }
                self.setValue(v);
            });
        }
        this._combo_name_par = this.element.querySelector(".u-combo-name-par");
        u.on(this._input, 'focus', function (e) {
            self._inputFocus = true;
            self.show(e);
            u.stopEvent(e);
        });
        u.on(this._input, 'blur', function (e) {
            self._inputFocus = false;
        });
        this.iconBtn = this.element.querySelector("[data-role='combo-button']");
        if (this.iconBtn) {
            u.on(this.iconBtn, 'click', function (e) {
                self.show(e);
                u.stopEvent(e);
            });
        }
    },

    show: function show(evt) {
        var self = this,
            width = this.element.offsetWidth;
        u.showPanelByEle({
            ele: this._input,
            panel: this._ul,
            position: "bottomLeft"
        });
        document.body.onscroll = function () {
            u.showPanelByEle({
                ele: self._input,
                panel: self._ul,
                position: "bottomLeft"
            });
        };
        this._ul.style.width = width + 'px';
        u.addClass(this._ul, 'is-animating');
        this._ul.style.zIndex = u.getZIndex();
        u.addClass(this._ul, 'is-visible');

        var callback = function (e) {
            if (e === evt || e.target === this._input || self._inputFocus == true) return;
            if (this.mutilSelect && (u.closest(e.target, 'u-combo-ul') === self._ul || u.closest(e.target, 'u-combo-name-par') || u.closest(e.target, 'u-combo-name'))) return;
            u.off(document, 'click', callback);
            // document.removeEventListener('click', callback);
            this.hide();
        }.bind(this);
        u.on(document, 'click', callback);
        u.on(document.body, 'touchend', callback);
        // document.addEventListener('click', callback);
    },

    hide: function hide() {
        u.removeClass(this._ul, 'is-visible');
        this._ul.style.zIndex = -1;
        this.trigger('select', { value: this.value });
    },

    /**
     * 设置下拉数据
     * @param datas  数据项
     * @param options  指定name value对应字段 可以为空
     */
    setComboData: function setComboData(datas, options) {
        var i,
            li,
            self = this;
        if (!options) this.comboDatas = datas;else {
            this.comboDatas = [];
            for (var i = 0; i < datas.length; i++) {
                this.comboDatas.push({ name: datas[i][options.name], value: datas[i][options.value] });
            }
        }
        if (!this._ul) {
            this._ul = u.makeDOM('<ul class="u-combo-ul"></ul>');
            // this.element.parentNode.appendChild(this._ul);
            document.body.appendChild(this._ul);
        }
        this._ul.innerHTML = '';
        //TODO 增加filter
        for (i = 0; i < this.comboDatas.length; i++) {
            li = u.makeDOM('<li class="u-combo-li">' + this.comboDatas[i].name + '</li>'); //document.createElement('li');
            li._index = i;
            u.on(li, 'click', function () {
                self.selectItem(this._index);
            });
            var rippleContainer = document.createElement('span');
            u.addClass(rippleContainer, 'u-ripple');
            li.appendChild(rippleContainer);
            new URipple(li);
            this._ul.appendChild(li);
        }
    },

    selectItem: function selectItem(index) {
        var self = this;

        if (this.mutilSelect) {
            var val = this.comboDatas[index].value;
            var name = this.comboDatas[index].name;
            var index = (this.value + ',').indexOf(val + ',');
            var l = val.length + 1;
            var flag;
            if (index != -1) {
                // 已经选中
                this.value = this.value.substring(0, index) + this.value.substring(index + l);
                flag = '-';
            } else {
                this.value = !this.value ? val + ',' : this.value + val + ',';
                flag = '+';
            }

            if (flag == '+') {
                var nameDiv = u.makeDOM('<div class="u-combo-name" key="' + val + '">' + name + /*<a href="javascript:void(0)" class="remove">x</a>*/'</div>');
                var parNameDiv = u.makeDOM('<div class="u-combo-name-par" style="position:absolute"></div>');
                /*var _a = nameDiv.querySelector('a');
                u.on(_a, 'click', function(){
                    var values = self.value.split(',');
                    values.splice(values.indexOf(val),1);
                    self.value = values.join(',');
                    self._combo_name_par.removeChild(nameDiv);
                    self._updateItemSelect();
                    self.trigger('select', {value: self.value, name: name});
                });*/
                if (!this._combo_name_par) {
                    this._input.parentNode.insertBefore(parNameDiv, this._input);
                    this._combo_name_par = parNameDiv;
                }
                this._combo_name_par.appendChild(nameDiv);
            } else {
                if (this._combo_name_par) {
                    var comboDiv = this._combo_name_par.querySelector('[key="' + val + '"]');
                    if (comboDiv) this._combo_name_par.removeChild(comboDiv);
                }
            }

            this._updateItemSelect();

            // this.trigger('select', {value: this.value, name: name});
        } else {
                this.value = this.comboDatas[index].value;
                this._input.value = this.comboDatas[index].name;
                this._updateItemSelect();
                // this.trigger('select', {value: this.value, name: this._input.value});
            }
    },

    _updateItemSelect: function _updateItemSelect() {
        var lis = this._ul.querySelectorAll('.u-combo-li');
        if (this.mutilSelect) {
            var values = this.value.split(',');
            for (var i = 0; i < lis.length; i++) {
                if (values.indexOf(this.comboDatas[i].value) > -1) {
                    u.addClass(lis[i], 'is-selected');
                } else {
                    u.removeClass(lis[i], 'is-selected');
                }
            }
            /*根据多选区域div的高度调整input的高度*/
            var h = this._combo_name_par.offsetHeight;
            if (h < 25) h = 25;
            this._input.style.height = h + 'px';
        } else {
            for (var i = 0; i < lis.length; i++) {
                if (this.value == this.comboDatas[i].value) {
                    u.addClass(lis[i], 'is-selected');
                } else {
                    u.removeClass(lis[i], 'is-selected');
                }
            }
        }
    },

    /**
     *设置值
     * @param value
     */
    setValue: function setValue(value) {
        var self = this;
        value = value + '';
        value = value || '';

        var values = value.split(',');
        if (this.mutilSelect === true) {
            if (self._combo_name_par) self._combo_name_par.innerHTML = '';
            this.value = '';
        }
        if (!value) {
            this._input.value = '';
            this.value = '';
        }
        this.comboDatas.forEach(function (item, index) {
            if (this.mutilSelect === true) {
                if (values.indexOf(item.value) != -1) {
                    this.selectItem(index);
                }
            } else {
                if (item.value === value) {
                    this.selectItem(index);
                    return;
                }
            }
        }.bind(this));
        if (!this.onlySelect) {
            this.value = value;
            this._input.value = value;
            this.trigger('select', { value: this.value, name: this._input.value });
        }
    },

    /**
     * 设置显示名
     * @param name
     */
    setName: function setName(name) {
        this.comboDatas.forEach(function (item, index) {
            if (item.name === name) {
                this.selectItem(index);
                return;
            }
        }.bind(this));
    }

});

u.compMgr.regComp({
    comp: u.Combo,
    compAsString: 'u.Combo',
    css: 'u-combo'
});
'use strict';

u.Table = u.BaseComponent.extend({
    _CssClasses: {

        SELECTABLE: 'selectable',
        SELECT_ELEMENT: 'u-table-select',
        IS_SELECTED: 'is-selected',
        IS_UPGRADED: 'is-upgraded'
    },

    init: function init() {
        var self = this;
        this.element_ = this.element;
        if (this.element_) {
            var firstHeader = this.element_.querySelector('th');
            var bodyRows = Array.prototype.slice.call(this.element_.querySelectorAll('tbody tr'));
            var footRows = Array.prototype.slice.call(this.element_.querySelectorAll('tfoot tr'));
            var rows = bodyRows.concat(footRows);

            //if (this.element_.classList.contains(this._CssClasses.SELECTABLE)) {
            //    var th = document.createElement('th');
            //    var headerCheckbox = this._createCheckbox(null, rows);
            //    th.appendChild(headerCheckbox);
            //    firstHeader.parentElement.insertBefore(th, firstHeader);
            //
            //    for (var i = 0; i < rows.length; i++) {
            //        var firstCell = rows[i].querySelector('td');
            //        if (firstCell) {
            //            var td = document.createElement('td');
            //            if (rows[i].parentNode.nodeName.toUpperCase() === 'TBODY') {
            //                var rowCheckbox = this._createCheckbox(rows[i]);
            //                td.appendChild(rowCheckbox);
            //            }
            //            rows[i].insertBefore(td, firstCell);
            //        }
            //    }
            //    this.element_.classList.add(this._CssClasses.IS_UPGRADED);
            //}
        }
    },
    _selectRow: function _selectRow(checkbox, row, opt_rows) {
        if (row) {
            return function () {
                if (checkbox.checked) {
                    row.classList.add(this._CssClasses.IS_SELECTED);
                } else {
                    row.classList.remove(this._CssClasses.IS_SELECTED);
                }
            }.bind(this);
        }

        if (opt_rows) {
            return function () {
                var i;
                var el;
                if (checkbox.checked) {
                    for (i = 0; i < opt_rows.length; i++) {
                        el = opt_rows[i].querySelector('td').querySelector('.u-checkbox');
                        // el['MaterialCheckbox'].check();
                        opt_rows[i].classList.add(this._CssClasses.IS_SELECTED);
                    }
                } else {
                    for (i = 0; i < opt_rows.length; i++) {
                        el = opt_rows[i].querySelector('td').querySelector('.u-checkbox');
                        //el['MaterialCheckbox'].uncheck();
                        opt_rows[i].classList.remove(this._CssClasses.IS_SELECTED);
                    }
                }
            }.bind(this);
        }
    },
    _createCheckbox: function _createCheckbox(row, opt_rows) {
        var label = document.createElement('label');
        var labelClasses = ['u-checkbox', this._CssClasses.SELECT_ELEMENT];
        label.className = labelClasses.join(' ');
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('u-checkbox-input');

        if (row) {
            checkbox.checked = row.classList.contains(this._CssClasses.IS_SELECTED);
            checkbox.addEventListener('change', this._selectRow(checkbox, row));
        } else if (opt_rows) {
            checkbox.addEventListener('change', this._selectRow(checkbox, null, opt_rows));
        }

        label.appendChild(checkbox);
        new u.Checkbox(label);
        return label;
    }

});

if (u.compMgr) u.compMgr.regComp({
    comp: u.Table,
    compAsString: 'u.Table',
    css: 'u-table'
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

u.pagination = u.BaseComponent.extend({});

var PageProxy = function PageProxy(options, page) {
	this.isCurrent = function () {
		return page == options.currentPage;
	};

	this.isFirst = function () {
		return page == 1;
	};

	this.isLast = function () {
		return page == options.totalPages;
	};

	this.isPrev = function () {
		return page == options.currentPage - 1;
	};

	this.isNext = function () {
		return page == options.currentPage + 1;
	};

	this.isLeftOuter = function () {
		return page <= options.outerWindow;
	};

	this.isRightOuter = function () {
		return options.totalPages - page < options.outerWindow;
	};

	this.isInsideWindow = function () {
		if (options.currentPage < options.innerWindow + 1) {
			return page <= options.innerWindow * 2 + 1;
		} else if (options.currentPage > options.totalPages - options.innerWindow) {
			return options.totalPages - page <= options.innerWindow * 2;
		} else {
			return Math.abs(options.currentPage - page) <= options.innerWindow;
		}
	};

	this.number = function () {
		return page;
	};
	this.pageSize = function () {
		return options.pageSize;
	};
};

var View = {
	firstPage: function firstPage(pagin, options, currentPageProxy) {
		return '<li role="first"' + (currentPageProxy.isFirst() ? 'class="disabled"' : '') + '><a >' + options.first + '</a></li>';
	},

	prevPage: function prevPage(pagin, options, currentPageProxy) {
		return '<li role="prev"' + (currentPageProxy.isFirst() ? 'class="disabled"' : '') + '><a  rel="prev">' + options.prev + '</a></li>';
	},

	nextPage: function nextPage(pagin, options, currentPageProxy) {
		return '<li role="next"' + (currentPageProxy.isLast() ? 'class="disabled"' : '') + '><a  rel="next">' + options.next + '</a></li>';
	},

	lastPage: function lastPage(pagin, options, currentPageProxy) {

		return '<li role="last"' + (currentPageProxy.isLast() ? 'class="disabled"' : '') + '><a >' + options.last + '</a></li>';
	},

	gap: function gap(pagin, options) {
		return '<li role="gap" class="disabled"><a href="#">' + options.gap + '</a></li>';
	},

	page: function page(pagin, options, pageProxy) {
		return '<li role="page"' + (pageProxy.isCurrent() ? 'class="active"' : '') + '><a ' + (pageProxy.isNext() ? ' rel="next"' : '') + (pageProxy.isPrev() ? 'rel="prev"' : '') + '>' + pageProxy.number() + '</a></li>';
	}

};

//u.pagination.prototype.compType = 'u.pagination';
u.pagination.prototype.init = function (element, options) {
	var self = this;
	var element = this.element;
	this.$element = element;
	this.options = u.extend({}, this.DEFAULTS, this.options);
	this.$ul = this.$element; //.find("ul");
	this.render();
};

u.pagination.prototype.DEFAULTS = {
	currentPage: 1,
	totalPages: 1,
	pageSize: 10,
	pageList: [10, 20, 50, 100],
	innerWindow: 2,
	outerWindow: 0,
	first: '&laquo;',
	prev: '<i class="fa fa-chevron-left"></i>',
	next: '<i class="fa fa-chevron-right"></i>',
	last: '&raquo;',
	gap: '···',
	//totalText: '合计:',
	totalText: '共',
	truncate: false,
	showState: true,
	page: function page(_page) {
		return true;
	}
};

u.pagination.prototype.update = function (options) {
	this.$ul.innerHTML = "";
	this.options = u.extend({}, this.options, options);
	this.render();
};
u.pagination.prototype.render = function () {
	var a = new Date().valueOf();

	var options = this.options;

	if (!options.totalPages) {
		this.$element.style.display = "none";
		return;
	} else {
		this.$element.style.display = "block";
	}

	var htmlArr = [];
	var currentPageProxy = new PageProxy(options, options.currentPage);

	//update pagination by pengyic@yonyou.com
	//预设显示页码数
	var windows = 2;
	var total = options.totalPages - 0;
	var current = options.currentPage - 0;
	//预设显示页码数截断修正
	var fix = 0;
	var pageProxy;
	if (current - 2 <= windows) {
		for (var i = 1; i <= current; i++) {
			pageProxy = new PageProxy(options, i);
			htmlArr.push(View.page(this, options, pageProxy));
		}

		fix = windows - (current - 1) < 0 ? 0 : windows - (current - 1);

		if (total - current - fix <= windows + 1) {
			for (var i = current + 1; i <= total; i++) {
				pageProxy = new PageProxy(options, i);
				htmlArr.push(View.page(this, options, pageProxy));
			}
		} else {
			for (var i = current + 1; i <= current + windows + fix; i++) {
				pageProxy = new PageProxy(options, i);
				htmlArr.push(View.page(this, options, pageProxy));
			}
			//添加分割'...'
			htmlArr.push(View.gap(this, options));

			pageProxy = new PageProxy(options, total);
			htmlArr.push(View.page(this, options, pageProxy));
		}
	} else {
		if (total - current <= windows + 1) {
			fix = windows - (total - current) < 0 ? 0 : windows - (total - current);

			for (var i = current - windows - fix; i <= total; i++) {
				pageProxy = new PageProxy(options, i);
				htmlArr.push(View.page(this, options, pageProxy));
			}
			if (i >= 2) {
				//添加分割'...'
				htmlArr.unshift(View.gap(this, options));
				pageProxy = new PageProxy(options, 1);
				htmlArr.unshift(View.page(this, options, pageProxy));
			}
		} else {
			for (var i = current - windows; i <= current + windows; i++) {
				pageProxy = new PageProxy(options, i);
				htmlArr.push(View.page(this, options, pageProxy));
			}
			//添加分割'...'
			htmlArr.push(View.gap(this, options));

			pageProxy = new PageProxy(options, total);
			htmlArr.push(View.page(this, options, pageProxy));

			//添加分割'...'
			htmlArr.unshift(View.gap(this, options));
			pageProxy = new PageProxy(options, 1);
			htmlArr.unshift(View.page(this, options, pageProxy));
		}
	}
	htmlArr.unshift(View.prevPage(this, options, currentPageProxy));
	htmlArr.push(View.nextPage(this, options, currentPageProxy));
	/*
 if (!currentPageProxy.isFirst() || !options.truncate) {
 		if (options.first) {
 		htmlArr.push(View.firstPage(this, options, currentPageProxy))
 	}
 	if (options.prev) {
 		htmlArr.push(View.prevPage(this, options, currentPageProxy));
 	}
 }
 		var wasTruncated = false;
 	for (var i = 1, length = options.totalPages; i <= length; i++) {
 	var pageProxy = new PageProxy(options, i);
 	if (pageProxy.isLeftOuter() || pageProxy.isRightOuter() || pageProxy.isInsideWindow()) {
 		htmlArr.push(View.page(this, options, pageProxy));
 		wasTruncated = false;
 	} else {
 		if (!wasTruncated && options.outerWindow > 0) {
 			htmlArr.push(View.gap(this, options));
 			wasTruncated = true;
 		}
 	}
 }
 	if (!currentPageProxy.isLast() || !options.truncate) {
 	if (options.next) {
 		htmlArr.push(View.nextPage(this, options, currentPageProxy));
 	}
 		if (options.last) {
 		htmlArr.push(View.lastPage(this, options, currentPageProxy));
 	}
 }
 */
	if (options.totalCount === undefined || options.totalCount <= 0) {
		options.totalCount = 0;
	}
	if (options.showState) {
		var htmlStr = '<div class="pagination-state">' + options.totalText + '&nbsp;' + options.totalCount + '&nbsp;条</div>';
		htmlArr.push(htmlStr);

		if (options.jumppage || options.pageSize) {

			var pageOption = '';
			options.pageList.forEach(function (item) {
				if (options.pageSize - 0 == item) {
					pageOption += '<option selected>' + item + '</option>';
				} else {
					pageOption += '<option>' + item + '</option>';
				}
			});
			var jumppagehtml = '到<input class="page_j" value=' + options.currentPage + '>页<input class="pagination-jump" type="button" value="确定"/>';
			var sizehtml = '显示<select  class="page_z">' + pageOption + '</select>条&nbsp;&nbsp;';
			var tmpjump = "<div class='pagination-state'>" + (options.pageSize ? sizehtml : "") + (options.jumppage ? jumppagehtml : "") + "</div>";
			htmlArr.push(tmpjump);
			//<i class='jump_page fa fa-arrow-circle-right' style='margin-left: 8px; cursor: pointer;'></i>
		}
	}

	this.$ul.innerHTML = "";
	this.$ul.insertAdjacentHTML('beforeEnd', htmlArr.join(''));

	var me = this;
	u.on(this.$ul.querySelector(".pagination-jump"), "click", function () {
		var jp, pz;
		jp = me.$ul.querySelector(".page_j").value || options.currentPage;
		pz = me.$ul.querySelector(".page_z").value || options.pageSize;

		//if (pz != options.pageSize){
		//	me.$element.trigger('sizeChange', [pz, jp - 1])
		//}else{
		//	me.$element.trigger('pageChange', jp - 1)
		//}
		me.page(jp, options.totalPages, pz);
		//me.$element.trigger('pageChange', jp - 1)
		//me.$element.trigger('sizeChange', pz)
		return false;
	});

	u.on(this.$ul.querySelector('[role="first"] a'), 'click', function () {
		if (options.currentPage <= 1) return;
		me.firstPage();
		//me.$element.trigger('pageChange', 0)
		return false;
	});
	u.on(this.$ul.querySelector('[role="prev"] a'), 'click', function () {
		if (options.currentPage <= 1) return;
		me.prevPage();
		//me.$element.trigger('pageChange', options.currentPage - 1)
		return false;
	});
	u.on(this.$ul.querySelector('[role="next"] a'), 'click', function () {
		if (parseInt(options.currentPage) + 1 > options.totalPages) return;
		me.nextPage();
		//me.$element.trigger('pageChange', parseInt(options.currentPage) + 1)
		return false;
	});
	u.on(this.$ul.querySelector('[role="last"] a'), 'click', function () {
		if (options.currentPage == options.totalPages) return;
		me.lastPage();
		//me.$element.trigger('pageChange', options.totalPages - 1)
		return false;
	});
	u.each(this.$ul.querySelectorAll('[role="page"] a'), function (i, node) {
		u.on(node, 'click', function () {
			var pz = me.$element.querySelector(".page_z") && me.$element.querySelector(".page_z").value || options.pageSize;
			me.page(parseInt(this.innerHTML), options.totalPages, pz);
			//me.$element.trigger('pageChange', parseInt($(this).html()) - 1)

			return false;
		});
	});
	u.on(this.$ul.querySelector('.page_z'), 'change', function () {
		var pz = me.$element.querySelector(".page_z") && me.$element.querySelector(".page_z").value || options.pageSize;
		me.trigger('sizeChange', pz);
	});
};

u.pagination.prototype.page = function (pageIndex, totalPages, pageSize) {

	var options = this.options;

	if (totalPages === undefined) {
		totalPages = options.totalPages;
	}
	if (pageSize === undefined) {
		pageSize = options.pageSize;
	}
	var oldPageSize = options.pageSize;
	// if (pageIndex > 0 && pageIndex <= totalPages) {
	// 	if (options.page(pageIndex)) {

	// 		this.$ul.innerHTML="";
	// 		options.pageSize = pageSize;
	// 		options.currentPage = pageIndex;
	// 		options.totalPages = totalPages;
	// 		this.render();

	// 	}
	// }else{
	// 	return false;
	// }

	if (options.page(pageIndex)) {
		if (pageIndex < 0) {
			pageIndex = 0;
		}

		if (pageIndex > totalPages) {
			pageIndex = totalPages;
		}
		this.$ul.innerHTML = "";
		options.pageSize = pageSize;
		options.currentPage = pageIndex;
		options.totalPages = totalPages;
		this.render();
	}
	if (pageSize != oldPageSize) {
		this.trigger('sizeChange', [pageSize, pageIndex - 1]);
	} else {
		this.trigger('pageChange', pageIndex - 1);
	}

	//this.$element.trigger('pageChange', pageIndex)

	return false;
};

u.pagination.prototype.firstPage = function () {
	return this.page(1);
};

u.pagination.prototype.lastPage = function () {
	return this.page(this.options.totalPages);
};

u.pagination.prototype.nextPage = function () {
	return this.page(parseInt(this.options.currentPage) + 1);
};

u.pagination.prototype.prevPage = function () {
	return this.page(this.options.currentPage - 1);
};

u.pagination.prototype.disableChangeSize = function () {
	this.$element.querySelector('.page_z').setAttribute('readonly', true);
};

u.pagination.prototype.enableChangeSize = function () {
	this.$element.querySelector('.page_z').removeAttribute('readonly');
};

function Plugin(option) {
	return this.each(function () {
		var $this = $(this);
		var data = $this.data('u.pagination');
		var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

		if (!data) $this.data('u.pagination', data = new Pagination(this, options));else data.update(options);
	});
}

// var old = $.fn.pagination;

// $.fn.pagination = Plugin
// $.fn.pagination.Constructor = Pagination

if (u.compMgr) u.compMgr.regComp({
	comp: u.pagination,
	compAsString: 'u.pagination',
	css: 'u-pagination'
});
'use strict';

u.Tooltip = function (element, options) {
    this.init(element, options);
    //this.show()
};

u.Tooltip.prototype = {
    defaults: {
        animation: true,
        placement: 'top',
        //selector: false,
        template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" ></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
            selector: 'body',
            padding: 0
        }
    },
    init: function init(element, options) {
        this.element = element;
        this.options = u.extend({}, this.defaults, options);
        this._viewport = this.options.viewport && document.querySelector(this.options.viewport.selector || this.options.viewport);

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];
            if (trigger == 'click') {
                u.on(this.element, 'click', this.toggle.bind(this));
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
                u.on(this.element, eventIn, this.enter.bind(this));
                u.on(this.element, eventOut, this.leave.bind(this));
            }
        }
        this.options.title = this.options.title || this.element.getAttribute('title');
        this.element.removeAttribute('title');
        if (this.options.delay && typeof this.options.delay == 'number') {
            this.options.delay = {
                show: this.options.delay,
                hide: this.options.delay
            };
        };
        //tip模板对应的dom
        this.tipDom = u.makeDOM(this.options.template);
        u.addClass(this.tipDom, this.options.placement);
        if (this.options.colorLevel) {
            u.addClass(this.tipDom, this.options.colorLevel);
        }
        this.arrrow = this.tipDom.querySelector('.tooltip-arrow');

        // tip容器,默认为当前元素的parent
        this.container = this.options.container ? document.querySelector(this.options.container) : this.element.parentNode;
    },
    enter: function enter() {
        var self = this;
        clearTimeout(this.timeout);
        this.hoverState = 'in';
        if (!this.options.delay || !this.options.delay.show) return this.show();

        this.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show();
        }, this.options.delay.show);
    },
    leave: function leave() {
        var self = this;
        clearTimeout(this.timeout);
        self.hoverState = 'out';
        if (!self.options.delay || !self.options.delay.hide) return self.hide();
        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide();
        }, self.options.delay.hide);
    },
    show: function show() {
        var self = this;
        this.tipDom.querySelector('.tooltip-inner').innerHTML = this.options.title;
        this.tipDom.style.zIndex = u.getZIndex();
        this.container.appendChild(this.tipDom);
        /*var placement = this.options.placement;
        var pos = this.getPosition()
        var actualWidth = this.tipDom.offsetWidth
        var actualHeight = this.tipDom.offsetHeight
        var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
          this.applyPlacement(calculatedOffset, placement)*/
        u.addClass(this.tipDom, 'active');
        u.showPanelByEle({
            ele: this.element,
            panel: this.tipDom,
            position: this.options.placement
        });
        document.body.onscroll = function () {
            u.showPanelByEle({
                ele: self.element,
                panel: self.tipDom,
                position: self.options.placement
            });
        };
    },
    hide: function hide() {
        if (this.container.contains(this.tipDom)) {
            u.removeClass(this.tipDom, 'active');
            this.container.removeChild(this.tipDom);
        }
    },
    applyPlacement: function applyPlacement(offset, placement) {
        var width = this.tipDom.offsetWidth;
        var height = this.tipDom.offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt(this.tipDom.style.marginTop, 10);
        var marginLeft = parseInt(this.tipDom.style.marginTop, 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) marginTop = 0;
        if (isNaN(marginLeft)) marginLeft = 0;

        offset.top = offset.top + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        this.tipDom.style.left = offset.left + 'px';
        this.tipDom.style.top = offset.top + 'px';

        u.addClass(this.tipDom, 'active');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth = this.tipDom.offsetWidth;
        var actualHeight = this.tipDom.offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight;
        }
        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

        if (delta.left) offset.left += delta.left;else offset.top += delta.top;

        var isVertical = /top|bottom/.test(placement);
        var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

        //$tip.offset(offset)
        this.tipDom.style.left = offset.left + 'px';
        this.tipDom.style.top = offset.top - 4 + 'px';

        // this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
    },
    getCalculatedOffset: function getCalculatedOffset(placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'top' ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'left' ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */{
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
        };
    },
    getPosition: function getPosition(el) {
        el = el || this.element;
        var isBody = el.tagName == 'BODY';
        var elRect = el.getBoundingClientRect();
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = u.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top });
        }
        var elOffset = isBody ? { top: 0, left: 0 } : { top: el.offsetTop, left: el.offsetLeft };
        var scroll = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : el.scrollTop };
        var outerDims = isBody ? { width: window.innerWidth || document.body.clientWidth, height: window.innerHeight || document.body.clientHeight } : null;
        //return u.extend({}, elRect, scroll, outerDims, elOffset)
        return u.extend({}, elRect, scroll, outerDims);
    },
    getViewportAdjustedDelta: function getViewportAdjustedDelta(placement, pos, actualWidth, actualHeight) {
        var delta = { top: 0, left: 0 };
        if (!this._viewport) return delta;

        var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
        var viewportDimensions = this.getPosition(this._viewport);

        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
            if (topEdgeOffset < viewportDimensions.top) {
                // top overflow
                delta.top = viewportDimensions.top - topEdgeOffset;
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                // bottom overflow
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding;
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
            if (leftEdgeOffset < viewportDimensions.left) {
                // left overflow
                delta.left = viewportDimensions.left - leftEdgeOffset;
            } else if (rightEdgeOffset > viewportDimensions.width) {
                // right overflow
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
            }
        }

        return delta;
    },
    replaceArrow: function replaceArrow(delta, dimension, isHorizontal) {
        if (isHorizontal) {
            this.arrow.style.left = 50 * (1 - delta / dimension) + '%';
            this.arrow.style.top = '';
        } else {
            this.arrow.style.top = 50 * (1 - delta / dimension) + '%';
            this.arrow.style.left = '';
        }
    },
    destory: function destory() {},
    setTitle: function setTitle(title) {
        this.options.title = title;
    }

};
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*!
 * jQuery Raty - A Star Rating Plugin
 *
 * The MIT License
 *
 * @author  : Washington Botelho
 * @doc     : http://wbotelhos.com/raty
 * @version : 2.7.0
 *
 */

;
(function ($) {
  'use strict';

  var methods = {
    init: function init(options) {
      return this.each(function () {
        this.self = $(this);

        methods.destroy.call(this.self);

        this.opt = $.extend(true, {}, $.fn.raty.defaults, options);

        methods._adjustCallback.call(this);
        methods._adjustNumber.call(this);
        methods._adjustHints.call(this);

        this.opt.score = methods._adjustedScore.call(this, this.opt.score);

        if (this.opt.starType !== 'img') {
          methods._adjustStarType.call(this);
        }

        methods._adjustPath.call(this);
        methods._createStars.call(this);

        if (this.opt.cancel) {
          methods._createCancel.call(this);
        }

        if (this.opt.precision) {
          methods._adjustPrecision.call(this);
        }

        methods._createScore.call(this);
        methods._apply.call(this, this.opt.score);
        methods._setTitle.call(this, this.opt.score);
        methods._target.call(this, this.opt.score);

        if (this.opt.readOnly) {
          methods._lock.call(this);
        } else {
          this.style.cursor = 'pointer';

          methods._binds.call(this);
        }
      });
    },

    _adjustCallback: function _adjustCallback() {
      var options = ['number', 'readOnly', 'score', 'scoreName', 'target', 'path'];

      for (var i = 0; i < options.length; i++) {
        if (typeof this.opt[options[i]] === 'function') {
          this.opt[options[i]] = this.opt[options[i]].call(this);
        }
      }
    },

    _adjustedScore: function _adjustedScore(score) {
      if (!score) {
        return score;
      }

      return methods._between(score, 0, this.opt.number);
    },

    _adjustHints: function _adjustHints() {
      if (!this.opt.hints) {
        this.opt.hints = [];
      }

      if (!this.opt.halfShow && !this.opt.half) {
        return;
      }

      var steps = this.opt.precision ? 10 : 2;

      for (var i = 0; i < this.opt.number; i++) {
        var group = this.opt.hints[i];

        if (Object.prototype.toString.call(group) !== '[object Array]') {
          group = [group];
        }

        this.opt.hints[i] = [];

        for (var j = 0; j < steps; j++) {
          var hint = group[j],
              last = group[group.length - 1];

          if (last === undefined) {
            last = null;
          }

          this.opt.hints[i][j] = hint === undefined ? last : hint;
        }
      }
    },

    _adjustNumber: function _adjustNumber() {
      this.opt.number = methods._between(this.opt.number, 1, this.opt.numberMax);
    },

    _adjustPath: function _adjustPath() {
      this.opt.path = this.opt.path || '';

      if (this.opt.path && this.opt.path.charAt(this.opt.path.length - 1) !== '/') {
        this.opt.path += '/';
      }
    },

    _adjustPrecision: function _adjustPrecision() {
      this.opt.half = true;
    },

    _adjustStarType: function _adjustStarType() {
      var replaces = ['cancelOff', 'cancelOn', 'starHalf', 'starOff', 'starOn'];

      this.opt.path = '';

      for (var i = 0; i < replaces.length; i++) {
        this.opt[replaces[i]] = this.opt[replaces[i]].replace('.', '-');
      }
    },

    _apply: function _apply(score) {
      methods._fill.call(this, score);

      if (score) {
        if (score > 0) {
          this.score.val(score);
        }

        methods._roundStars.call(this, score);
      }
    },

    _between: function _between(value, min, max) {
      return Math.min(Math.max(parseFloat(value), min), max);
    },

    _binds: function _binds() {
      if (this.cancel) {
        methods._bindOverCancel.call(this);
        methods._bindClickCancel.call(this);
        methods._bindOutCancel.call(this);
      }

      methods._bindOver.call(this);
      methods._bindClick.call(this);
      methods._bindOut.call(this);
    },

    _bindClick: function _bindClick() {
      var that = this;

      that.stars.on('click.raty', function (evt) {
        var execute = true,
            score = that.opt.half || that.opt.precision ? that.self.data('score') : this.alt || $(this).data('alt');

        if (that.opt.click) {
          execute = that.opt.click.call(that, +score, evt);
        }

        if (execute || execute === undefined) {
          if (that.opt.half && !that.opt.precision) {
            score = methods._roundHalfScore.call(that, score);
          }

          methods._apply.call(that, score);
        }
      });
    },

    _bindClickCancel: function _bindClickCancel() {
      var that = this;

      that.cancel.on('click.raty', function (evt) {
        that.score.removeAttr('value');

        if (that.opt.click) {
          that.opt.click.call(that, null, evt);
        }
      });
    },

    _bindOut: function _bindOut() {
      var that = this;

      that.self.on('mouseleave.raty', function (evt) {
        var score = +that.score.val() || undefined;

        methods._apply.call(that, score);
        methods._target.call(that, score, evt);
        methods._resetTitle.call(that);

        if (that.opt.mouseout) {
          that.opt.mouseout.call(that, score, evt);
        }
      });
    },

    _bindOutCancel: function _bindOutCancel() {
      var that = this;

      that.cancel.on('mouseleave.raty', function (evt) {
        var icon = that.opt.cancelOff;

        if (that.opt.starType !== 'img') {
          icon = that.opt.cancelClass + ' ' + icon;
        }

        methods._setIcon.call(that, this, icon);

        if (that.opt.mouseout) {
          var score = +that.score.val() || undefined;

          that.opt.mouseout.call(that, score, evt);
        }
      });
    },

    _bindOver: function _bindOver() {
      var that = this,
          action = that.opt.half ? 'mousemove.raty' : 'mouseover.raty';

      that.stars.on(action, function (evt) {
        var score = methods._getScoreByPosition.call(that, evt, this);

        methods._fill.call(that, score);

        if (that.opt.half) {
          methods._roundStars.call(that, score, evt);
          methods._setTitle.call(that, score, evt);

          that.self.data('score', score);
        }

        methods._target.call(that, score, evt);

        if (that.opt.mouseover) {
          that.opt.mouseover.call(that, score, evt);
        }
      });
    },

    _bindOverCancel: function _bindOverCancel() {
      var that = this;

      that.cancel.on('mouseover.raty', function (evt) {
        var starOff = that.opt.path + that.opt.starOff,
            icon = that.opt.cancelOn;

        if (that.opt.starType === 'img') {
          that.stars.attr('src', starOff);
        } else {
          icon = that.opt.cancelClass + ' ' + icon;

          that.stars.attr('class', starOff);
        }

        methods._setIcon.call(that, this, icon);
        methods._target.call(that, null, evt);

        if (that.opt.mouseover) {
          that.opt.mouseover.call(that, null);
        }
      });
    },

    _buildScoreField: function _buildScoreField() {
      return $('<input />', { name: this.opt.scoreName, type: 'hidden' }).appendTo(this);
    },

    _createCancel: function _createCancel() {
      var icon = this.opt.path + this.opt.cancelOff,
          cancel = $('<' + this.opt.starType + ' />', { title: this.opt.cancelHint, 'class': this.opt.cancelClass });

      if (this.opt.starType === 'img') {
        cancel.attr({ src: icon, alt: 'x' });
      } else {
        // TODO: use $.data
        cancel.attr('data-alt', 'x').addClass(icon);
      }

      if (this.opt.cancelPlace === 'left') {
        this.self.prepend('&#160;').prepend(cancel);
      } else {
        this.self.append('&#160;').append(cancel);
      }

      this.cancel = cancel;
    },

    _createScore: function _createScore() {
      var score = $(this.opt.targetScore);

      this.score = score.length ? score : methods._buildScoreField.call(this);
    },

    _createStars: function _createStars() {
      for (var i = 1; i <= this.opt.number; i++) {
        var name = methods._nameForIndex.call(this, i),
            attrs = { alt: i, src: this.opt.path + this.opt[name] };

        if (this.opt.starType !== 'img') {
          attrs = { 'data-alt': i, 'class': attrs.src }; // TODO: use $.data.
        }

        attrs.title = methods._getHint.call(this, i);

        $('<' + this.opt.starType + ' />', attrs).appendTo(this);

        if (this.opt.space) {
          this.self.append(i < this.opt.number ? '&#160;' : '');
        }
      }

      this.stars = this.self.children(this.opt.starType);
    },

    _error: function _error(message) {
      $(this).text(message);

      $.error(message);
    },

    _fill: function _fill(score) {
      var hash = 0;

      for (var i = 1; i <= this.stars.length; i++) {
        var icon,
            star = this.stars[i - 1],
            turnOn = methods._turnOn.call(this, i, score);

        if (this.opt.iconRange && this.opt.iconRange.length > hash) {
          var irange = this.opt.iconRange[hash];

          icon = methods._getRangeIcon.call(this, irange, turnOn);

          if (i <= irange.range) {
            methods._setIcon.call(this, star, icon);
          }

          if (i === irange.range) {
            hash++;
          }
        } else {
          icon = this.opt[turnOn ? 'starOn' : 'starOff'];

          methods._setIcon.call(this, star, icon);
        }
      }
    },

    _getFirstDecimal: function _getFirstDecimal(number) {
      var decimal = number.toString().split('.')[1],
          result = 0;

      if (decimal) {
        result = parseInt(decimal.charAt(0), 10);

        if (decimal.slice(1, 5) === '9999') {
          result++;
        }
      }

      return result;
    },

    _getRangeIcon: function _getRangeIcon(irange, turnOn) {
      return turnOn ? irange.on || this.opt.starOn : irange.off || this.opt.starOff;
    },

    _getScoreByPosition: function _getScoreByPosition(evt, icon) {
      var score = parseInt(icon.alt || icon.getAttribute('data-alt'), 10);

      if (this.opt.half) {
        var size = methods._getWidth.call(this),
            percent = parseFloat((evt.pageX - $(icon).offset().left) / size);

        score = score - 1 + percent;
      }

      return score;
    },

    _getHint: function _getHint(score, evt) {
      if (score !== 0 && !score) {
        return this.opt.noRatedMsg;
      }

      var decimal = methods._getFirstDecimal.call(this, score),
          integer = Math.ceil(score),
          group = this.opt.hints[(integer || 1) - 1],
          hint = group,
          set = !evt || this.move;

      if (this.opt.precision) {
        if (set) {
          decimal = decimal === 0 ? 9 : decimal - 1;
        }

        hint = group[decimal];
      } else if (this.opt.halfShow || this.opt.half) {
        decimal = set && decimal === 0 ? 1 : decimal > 5 ? 1 : 0;

        hint = group[decimal];
      }

      return hint === '' ? '' : hint || score;
    },

    _getWidth: function _getWidth() {
      var width = this.stars[0].width || parseFloat(this.stars.eq(0).css('font-size'));

      if (!width) {
        methods._error.call(this, 'Could not get the icon width!');
      }

      return width;
    },

    _lock: function _lock() {
      var hint = methods._getHint.call(this, this.score.val());

      this.style.cursor = '';
      this.title = hint;

      this.score.prop('readonly', true);
      this.stars.prop('title', hint);

      if (this.cancel) {
        this.cancel.hide();
      }

      this.self.data('readonly', true);
    },

    _nameForIndex: function _nameForIndex(i) {
      return this.opt.score && this.opt.score >= i ? 'starOn' : 'starOff';
    },

    _resetTitle: function _resetTitle(star) {
      for (var i = 0; i < this.opt.number; i++) {
        this.stars[i].title = methods._getHint.call(this, i + 1);
      }
    },

    _roundHalfScore: function _roundHalfScore(score) {
      var integer = parseInt(score, 10),
          decimal = methods._getFirstDecimal.call(this, score);

      if (decimal !== 0) {
        decimal = decimal > 5 ? 1 : 0.5;
      }

      return integer + decimal;
    },

    _roundStars: function _roundStars(score, evt) {
      var decimal = (score % 1).toFixed(2),
          name;

      if (evt || this.move) {
        name = decimal > 0.5 ? 'starOn' : 'starHalf';
      } else if (decimal > this.opt.round.down) {
        // Up:   [x.76 .. x.99]
        name = 'starOn';

        if (this.opt.halfShow && decimal < this.opt.round.up) {
          // Half: [x.26 .. x.75]
          name = 'starHalf';
        } else if (decimal < this.opt.round.full) {
          // Down: [x.00 .. x.5]
          name = 'starOff';
        }
      }

      if (name) {
        var icon = this.opt[name],
            star = this.stars[Math.ceil(score) - 1];

        methods._setIcon.call(this, star, icon);
      } // Full down: [x.00 .. x.25]
    },

    _setIcon: function _setIcon(star, icon) {
      star[this.opt.starType === 'img' ? 'src' : 'className'] = this.opt.path + icon;
    },

    _setTarget: function _setTarget(target, score) {
      if (score) {
        score = this.opt.targetFormat.toString().replace('{score}', score);
      }

      if (target.is(':input')) {
        target.val(score);
      } else {
        target.html(score);
      }
    },

    _setTitle: function _setTitle(score, evt) {
      if (score) {
        var integer = parseInt(Math.ceil(score), 10),
            star = this.stars[integer - 1];

        star.title = methods._getHint.call(this, score, evt);
      }
    },

    _target: function _target(score, evt) {
      if (this.opt.target) {
        var target = $(this.opt.target);

        if (!target.length) {
          methods._error.call(this, 'Target selector invalid or missing!');
        }

        var mouseover = evt && evt.type === 'mouseover';

        if (score === undefined) {
          score = this.opt.targetText;
        } else if (score === null) {
          score = mouseover ? this.opt.cancelHint : this.opt.targetText;
        } else {
          if (this.opt.targetType === 'hint') {
            score = methods._getHint.call(this, score, evt);
          } else if (this.opt.precision) {
            score = parseFloat(score).toFixed(1);
          }

          var mousemove = evt && evt.type === 'mousemove';

          if (!mouseover && !mousemove && !this.opt.targetKeep) {
            score = this.opt.targetText;
          }
        }

        methods._setTarget.call(this, target, score);
      }
    },

    _turnOn: function _turnOn(i, score) {
      return this.opt.single ? i === score : i <= score;
    },

    _unlock: function _unlock() {
      this.style.cursor = 'pointer';
      this.removeAttribute('title');

      this.score.removeAttr('readonly');

      this.self.data('readonly', false);

      for (var i = 0; i < this.opt.number; i++) {
        this.stars[i].title = methods._getHint.call(this, i + 1);
      }

      if (this.cancel) {
        this.cancel.css('display', '');
      }
    },

    cancel: function cancel(click) {
      return this.each(function () {
        var self = $(this);

        if (self.data('readonly') !== true) {
          methods[click ? 'click' : 'score'].call(self, null);

          this.score.removeAttr('value');
        }
      });
    },

    click: function click(score) {
      return this.each(function () {
        if ($(this).data('readonly') !== true) {
          score = methods._adjustedScore.call(this, score);

          methods._apply.call(this, score);

          if (this.opt.click) {
            this.opt.click.call(this, score, $.Event('click'));
          }

          methods._target.call(this, score);
        }
      });
    },

    destroy: function destroy() {
      return this.each(function () {
        var self = $(this),
            raw = self.data('raw');

        if (raw) {
          self.off('.raty').empty().css({ cursor: raw.style.cursor }).removeData('readonly');
        } else {
          self.data('raw', self.clone()[0]);
        }
      });
    },

    getScore: function getScore() {
      var score = [],
          value;

      this.each(function () {
        value = this.score.val();

        score.push(value ? +value : undefined);
      });

      return score.length > 1 ? score : score[0];
    },

    move: function move(score) {
      return this.each(function () {
        var integer = parseInt(score, 10),
            decimal = methods._getFirstDecimal.call(this, score);

        if (integer >= this.opt.number) {
          integer = this.opt.number - 1;
          decimal = 10;
        }

        var width = methods._getWidth.call(this),
            steps = width / 10,
            star = $(this.stars[integer]),
            percent = star.offset().left + steps * decimal,
            evt = $.Event('mousemove', { pageX: percent });

        this.move = true;

        star.trigger(evt);

        this.move = false;
      });
    },

    readOnly: function readOnly(readonly) {
      return this.each(function () {
        var self = $(this);

        if (self.data('readonly') !== readonly) {
          if (readonly) {
            self.off('.raty').children('img').off('.raty');

            methods._lock.call(this);
          } else {
            methods._binds.call(this);
            methods._unlock.call(this);
          }

          self.data('readonly', readonly);
        }
      });
    },

    reload: function reload() {
      return methods.set.call(this, {});
    },

    score: function score() {
      var self = $(this);

      return arguments.length ? methods.setScore.apply(self, arguments) : methods.getScore.call(self);
    },

    set: function set(options) {
      return this.each(function () {
        $(this).raty($.extend({}, this.opt, options));
      });
    },

    setScore: function setScore(score) {
      return this.each(function () {
        if ($(this).data('readonly') !== true) {
          score = methods._adjustedScore.call(this, score);

          methods._apply.call(this, score);
          methods._target.call(this, score);
        }
      });
    }
  };

  $.fn.raty = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if ((typeof method === 'undefined' ? 'undefined' : _typeof(method)) === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist!');
    }
  };

  $.fn.raty.defaults = {
    cancel: false,
    cancelClass: 'raty-cancel',
    cancelHint: 'Cancel this rating!',
    cancelOff: 'cancel-off.png',
    cancelOn: 'cancel-on.png',
    cancelPlace: 'left',
    click: undefined,
    half: false,
    halfShow: true,
    hints: ['bad', 'poor', 'regular', 'good', 'gorgeous'],
    iconRange: undefined,
    mouseout: undefined,
    mouseover: undefined,
    noRatedMsg: 'Not rated yet!',
    number: 5,
    numberMax: 20,
    path: undefined,
    precision: false,
    readOnly: false,
    round: { down: 0.25, full: 0.6, up: 0.76 },
    score: undefined,
    scoreName: 'score',
    single: false,
    space: true,
    starHalf: 'star-half.png',
    starOff: 'star-off.png',
    starOn: 'star-on.png',
    starType: 'img',
    target: undefined,
    targetFormat: '{score}',
    targetKeep: false,
    targetScore: undefined,
    targetText: '',
    targetType: 'hint'
  };
})(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

u.Validate = u.BaseComponent.extend({

	init: function init() {
		var self = this;
		this.$element = this.element;
		this.$form = this.form;
		this.options = u.extend({}, this.DEFAULTS, this.options);
		this.required = false;
		this.timeout = null;
		//所有属性优先级 ：  options参数  > attr属性  > 默认值
		this.required = this.options['required'] ? this.options['required'] : false;
		this.validType = this.options['validType'] ? this.options['validType'] : null;
		//校验模式  blur  submit
		this.validMode = this.options['validMode'] ? this.options['validMode'] : u.Validate.DEFAULTS.validMode;
		//空提示
		this.nullMsg = this.options['nullMsg'] ? this.options['nullMsg'] : u.Validate.NULLMSG[this.validType];
		//是否必填
		if (this.required && !this.nullMsg) this.nullMsg = u.Validate.NULLMSG['required'];
		//错误必填
		this.errorMsg = this.options['errorMsg'] ? this.options['errorMsg'] : u.Validate.ERRORMSG[this.validType];
		//正则校验
		this.regExp = this.options['reg'] ? this.options['reg'] : u.Validate.REG[this.validType];
		try {
			if (typeof this.regExp == 'string') this.regExp = eval(this.regExp);
		} catch (e) {}

		this.notipFlag = this.options['notipFlag']; // 错误信息提示方式是否为tip，默认为true
		this.hasSuccess = this.options['hasSuccess']; //是否含有正确提示

		//提示div的id 为空时使用tooltop来提示
		this.tipId = this.options['tipId'] ? this.options['tipId'] : null;
		//校验成功提示信息的div
		this.successId = this.options['successId'] ? this.options['successId'] : null;

		// 要求显示成功提示，并没有成功提示dom的id时，则创建成功提示dom
		if (this.hasSuccess && !this.successId) {
			this.successId = u.makeDOM('<span class="u-form-control-success fa fa-check-circle" ></span>');

			if (this.$element.nextSibling) {
				this.$element.parentNode.insertBefore(this.successId, this.$element.nextSibling);
			} else {
				this.$element.parentNode.appendChild(this.successId);
			}
		}
		//不是默认的tip提示方式并且tipId没有定义时创建默认tipid	
		if (this.notipFlag && !this.tipId) {
			this.tipId = u.makeDOM('<span class="u-form-control-info fa fa-exclamation-circle "></span>');
			this.$element.parentNode.appendChild(this.tipId);

			if (this.$element.nextSibling) {
				this.$element.parentNode.insertBefore(this.tipId, this.$element.nextSibling);
			} else {
				this.$element.parentNode.appendChild(this.tipId);
			}
		}
		//提示框位置
		this.placement = this.options['placement'] ? this.options['placement'] : u.Validate.DEFAULTS.placement;
		//
		this.minLength = this.options['minLength'] > 0 ? this.options['minLength'] : null;
		this.maxLength = this.options['maxLength'] > 0 ? this.options['maxLength'] : null;
		this.min = this.options['min'] !== undefined ? this.options['min'] : null;
		this.max = this.options['max'] !== undefined ? this.options['max'] : null;
		this.minNotEq = this.options['minNotEq'] !== undefined ? this.options['minNotEq'] : null;
		this.maxNotEq = this.options['maxNotEq'] !== undefined ? this.options['maxNotEq'] : null;
		this.min = u.isNumber(this.min) ? this.min : null;
		this.max = u.isNumber(this.max) ? this.max : null;
		this.minNotEq = u.isNumber(this.minNotEq) ? this.minNotEq : null;
		this.maxNotEq = u.isNumber(this.maxNotEq) ? this.maxNotEq : null;
		this.create();
	}
});

u.Validate.fn = u.Validate.prototype;
//u.Validate.tipTemplate = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow tooltip-arrow-c"></div><div class="tooltip-arrow"></div><div class="tooltip-inner" style="color:#ed7103;border:1px solid #ed7103;background-color:#fff7f0;"></div></div>'

u.Validate.DEFAULTS = {
	validMode: 'blur',
	placement: "top"
};

u.Validate.NULLMSG = {
	"required": trans('validate.required', "不能为空！"),
	"integer": trans('validate.integer', "请填写整数！"),
	"float": trans('validate.float', "请填写数字！"),
	"zipCode": trans('validate.zipCode', "请填写邮政编码！"),
	"phone": trans('validate.phone', "请填写手机号码！"),
	"landline": trans('validate.landline', "请填写座机号码！"),
	"email": trans('validate.email', "请填写邮箱地址！"),
	"url": trans('validate.url', "请填写网址！"),
	"datetime": trans('validate.datetime', "请填写日期！")

};

u.Validate.ERRORMSG = {
	"integer": trans('validate.error_integer', "整数格式不对！"),
	"float": trans('validate.error_float', "数字格式不对！"),
	"zipCode": trans('validate.error_zipCode', "邮政编码格式不对！"),
	"phone": trans('validate.error_phone', "手机号码格式不对！"),
	"landline": trans('validate.error_landline', "座机号码格式不对！"),
	"email": trans('validate.error_email', "邮箱地址格式不对！"),
	"url": trans('validate.error_url', "网址格式不对！"),
	"datetime": trans('validate.error_datetime', "日期格式不对！")
};

u.Validate.REG = {
	"integer": /^-?\d+$/,
	"float": /^-?\d+(\.\d+)?$/,
	"zipCode": /^[0-9]{6}$/,
	"phone": /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/,
	"landline": /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/,
	"email": /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
	"url": /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
	"datetime": /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/
};

u.Validate.fn.create = function () {
	var self = this;
	u.on(this.element, 'blur', function (e) {
		if (self.validMode == 'blur') {
			self.passed = self.doValid();
		}
	});
	u.on(this.element, 'focus', function (e) {
		//隐藏错误信息
		self.hideMsg();
	});
	u.on(this.element, 'change', function (e) {
		//隐藏错误信息
		self.hideMsg();
	});
	u.on(this.element, 'keydown', function (e) {
		var event = window.event || e;
		if (self["validType"] == "float") {
			var tmp = self.element.value;
			if (event.shiftKey) {
				event.returnValue = false;
				return false;
			} else if (event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {
				// tab键 左箭头 右箭头 delete键
				return true;
			} else if (event.ctrlKey && (event.keyCode == 67 || event.keyCode == 86)) {
				//复制粘贴
				return true;
			} else if (!(event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 96 && event.keyCode <= 105 || u.inArray(event.keyCode, [8, 110, 190, 189, 109]) > -1)) {
				event.returnValue = false;
				return false;
			} else if ((!tmp || tmp.indexOf(".") > -1) && (event.keyCode == 190 || event.keyCode == 110)) {
				event.returnValue = false;
				return false;
			}

			if (tmp && (tmp + '').split('.')[0].length >= 25) {
				return false;
			}
		}
		if (self["validType"] == "integer") {
			var tmp = self.element.value;

			if (event.shiftKey) {
				event.returnValue = false;
				return false;
			} else if (event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 46) {
				// tab键 左箭头 右箭头 delete键
				return true;
			} else if (event.ctrlKey && (event.keyCode == 67 || event.keyCode == 86)) {
				//复制粘贴
				return true;
			} else if (!(event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode >= 96 && event.keyCode <= 105 || u.inArray(event.keyCode, [8, 109, 189]) > -1)) {
				event.returnValue = false;
				return false;
			}

			if (tmp && (tmp + '').split('.')[0].length >= 25) {
				return false;
			}
		}
	});
};

u.Validate.fn.updateOptions = function (options) {};

u.Validate.fn.doValid = function (options) {
	var self = this;
	var pValue;
	this.showMsgFlag = true;
	if (options) {
		pValue = options.pValue;
		this.showMsgFlag = options.showMsg;
	}
	this.needClean = false;
	if (this.element && this.element.getAttribute("readonly")) return { passed: true };
	var value = null;
	if (typeof pValue != 'undefined') value = pValue;else if (this.element) value = this.element.value;

	if (this.isEmpty(value) && this.required) {
		this.showMsg(this.nullMsg);
		return { passed: false, Msg: this.nullMsg };
	} else if (this.isEmpty(value) && !this.required) {
		return { passed: true };
	}
	if (this.regExp) {
		var reg = new RegExp(this.regExp);
		if (typeof value == 'number') value = value + "";
		var r = value.match(reg);
		if (r === null || r === false) {
			this.showMsg(this.errorMsg);
			this.needClean = true;
			return { passed: false, Msg: this.errorMsg };
		}
	}
	if (this.minLength) {
		if (value.lengthb() < this.minLength) {
			var Msg = "输入长度不能小于" + this.minLength + "位";
			this.showMsg(Msg);
			return { passed: false, Msg: Msg };
		}
	}
	if (this.maxLength) {
		if (value.lengthb() > this.maxLength) {
			var Msg = "输入长度不能大于" + this.maxLength + "位";
			this.showMsg(Msg);
			return { passed: false, Msg: Msg };
		}
	}
	if (this.max != undefined && this.max != null) {
		if (parseFloat(value) > this.max) {
			var Msg = "输入值不能大于" + this.max;
			this.showMsg(Msg);
			return { passed: false, Msg: Msg };
		}
	}
	if (this.min != undefined && this.min != null) {
		if (parseFloat(value) < this.min) {
			var Msg = "输入值不能小于" + this.min;
			this.showMsg(Msg);
			return { passed: false, Msg: Msg };
		}
	}
	if (this.maxNotEq != undefined && this.maxNotEq != null) {
		if (parseFloat(value) >= this.maxNotEq) {
			var Msg = "输入值不能大于或等于" + this.maxNotEq;
			this.showMsg(Msg);
			return { passed: false, Msg: Msg };
		}
	}
	if (this.minNotEq != undefined && this.minNotEq != null) {
		if (parseFloat(value) <= this.minNotEq) {
			var Msg = "输入值不能小于或等于" + this.minNotEq;
			this.showMsg(Msg);
			return { passed: false, Msg: Msg };
		}
	}
	//succes时，将成功信息显示
	if (this.successId) {
		// u.addClass(this.element.parentNode,'u-has-success');
		var successDiv = this.successId;
		var successleft = this.$element.offsetLeft + this.$element.offsetWidth + 5;
		var successtop = this.$element.offsetTop + 10;
		if (typeof successDiv === 'string') successDiv = document.getElementById(successDiv);
		successDiv.style.display = 'inline-block';
		successDiv.style.top = successtop + 'px';
		successDiv.style.left = successleft + 'px';
		clearTimeout(this.timeout);
		this.timeout = setTimeout(function () {
			// self.tooltip.hide();
			successDiv.style.display = 'none';
		}, 3000);
	}
	return { passed: true };
};

u.Validate.fn.check = u.Validate.fn.doValid;

//	Validate.fn.getValue = function() {
//		var inputval
//		if (this.$element.is(":radio")) {
//			inputval = this.$form.find(":radio[name='" + this.$element.attr("name") + "']:checked").val();
//		} else if (this.$element.is(":checkbox")) {
//			inputval = "";
//			this.$form.find(":checkbox[name='" + obj.attr("name") + "']:checked").each(function() {
//				inputval += $(this).val() + ',';
//			})
//		} else if (this.$element.is('div')) {
//			inputval = this.$element[0].trueValue;
//		} else {
//			inputval = this.$element.val();
//		}
//		inputval = $.trim(inputval);
//		return this.isEmpty(inputval) ? "" : inputval;
//	}

u.Validate.fn.some = Array.prototype.some ? Array.prototype.some : function () {
	var flag;
	for (var i = 0; i < this.length; i++) {
		if (typeof arguments[0] == "function") {
			flag = arguments[0](this[i]);
			if (flag) break;
		}
	}
	return flag;
};

u.Validate.fn.getValue = function () {
	var inputval = '';
	//checkbox、radio为u-meta绑定时
	var bool = this.some.call(this.$element.querySelectorAll('[type="checkbox"],[type="radio"]'), function (ele) {
		return ele.type == "checkbox" || ele.type == "radio";
	});
	if (this.$element.childNodes.length > 0 && bool) {
		var eleArr = this.$element.querySelectorAll('[type="checkbox"],[type="radio"]');
		var ele = eleArr[0];
		if (ele.type == "checkbox") {
			this.$element.querySelectorAll(":checkbox[name='" + $(ele).attr("name") + "']:checked").each(function () {
				inputval += $(this).val() + ',';
			});
		} else if (ele.type == "radio") {
			inputval = this.$element.querySelectorAll(":radio[name='" + $(ele).attr("name") + "']:checked").value;
		}
	} else if (this.$element.is(":radio")) {
		//valid-type 绑定
		inputval = this.$element.parent().querySelectorAll(":radio[name='" + this.$element.attr("name") + "']:checked").val();
	} else if (this.$element.is(":checkbox")) {
		inputval = "";
		this.$element.parent().find(":checkbox[name='" + this.$element.attr("name") + "']:checked").each(function () {
			inputval += $(this).val() + ',';
		});
	} else if (this.$element.find('input').length > 0) {
		inputval = this.$element.find('input').val();
	} else {
		inputval = this.$element.val();
	}
	inputval = inputval.trim;
	return this.isEmpty(inputval) ? "" : inputval;
};

u.Validate.fn.isEmpty = function (val) {
	return val === "" || val === undefined || val === null; //|| val === $.trim(this.$element.attr("tip"));
};

u.Validate.fn.showMsg = function (msg) {

	if (this.showMsgFlag == false || this.showMsgFlag == 'false') {
		return;
	}
	var self = this;
	if (this.tipId) {
		this.$element.style.borderColor = 'rgb(241,90,74)';
		var tipdiv = this.tipId;
		var left = this.$element.offsetLeft;
		var top = this.$element.offsetTop + this.$element.offsetHeight + 4;
		if (typeof tipdiv === 'string') {
			tipdiv = document.getElementById(tipdiv);
		}
		tipdiv.innerHTML = msg;
		tipdiv.style.left = left + 'px';
		tipdiv.style.top = top + 'px';
		tipdiv.style.display = 'block';
		// u.addClass(tipdiv.parentNode,'u-has-error');
		// $('#' + this.tipId).html(msg).show()
	} else {
			var tipOptions = {
				"title": msg,
				"trigger": "manual",
				"selector": "validtip",
				"placement": this.placement,
				"container": "body"
			};
			if (this.options.tipTemplate) tipOptions.template = this.options.tipTemplate;
			if (!this.tooltip) this.tooltip = new u.Tooltip(this.element, tipOptions);
			this.tooltip.setTitle(msg);
			this.tooltip.show();
		}
	clearTimeout(this.timeout);
	this.timeout = setTimeout(function () {
		// self.tooltip.hide();
		self.hideMsg();
	}, 3000);
};
u.Validate.fn.hideMsg = function () {
	//隐藏成功信息
	// if(this.successId||this.tipId){
	// 	document.getElementById(this.successId).style.display='none';
	// 	document.getElementById(this.tipId).style.display='none';
	// }

	// u.removeClass(this.element.parentNode,'u-has-error');
	// u.removeClass(this.element.parentNode,'u-has-success');

	if (this.tipId) {
		var tipdiv = this.tipId;
		if (typeof tipdiv === 'string') {
			tipdiv = document.getElementById(tipdiv);
		}
		tipdiv.style.display = 'none';
		this.$element.style.borderColor = '';
		// u.removeClass(tipdiv.parentNode,'u-has-error');
	} else {
			if (this.tooltip) this.tooltip.hide();
		}
};

/**
 * 只有单一元素时使用
 */
u.Validate.fn._needClean = function () {
	return true; //this.validates[0].needClean
};

u.validate = function (element) {
	var self = this,
	    options,
	    childEle;
	if (typeof element === 'string') {
		element = document.querySelector(element);
	}
	//element本身需要校验
	if (element.attributes["validate"]) {
		options = element.attributes["validate"] ? JSON.parse(element.attributes["validate"].value) : {};
		options = u.extend({ el: element }, options);
		element['u.Validate'] = new u.Validate(options);
	}

	//element是个父元素，校验子元素
	childEle = element.querySelectorAll('[validate]');
	u.each(childEle, function (i, child) {
		if (!child['u.Validate']) {
			//如果该元素上没有校验
			options = child.attributes["validate"] ? JSON.parse(child.attributes["validate"].value) : {};
			options = u.extend({ el: child }, options);
			child['u.Validate'] = new u.Validate(options);
		}
	});
};

// 对某个dom容器内的元素进行校验
u.doValidate = function (element) {
	var passed = true,
	    childEle,
	    result;
	if (typeof element === 'string') {
		element = document.querySelector(element);
	}
	childEle = element.querySelectorAll('input');
	u.each(childEle, function (i, child) {
		if (child['u.Validate'] && child['u.Validate'].check) {
			result = child['u.Validate'].check({ trueValue: true, showMsg: true });
			if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') passed = result['passed'] && passed;else passed = result && passed;
		}
	});
	return passed;
};
if (u.compMgr) u.compMgr.regComp({
	comp: u.Validate,
	compAsString: 'u.Validate',
	css: 'u-validate'
});
'use strict';

/* ========================================================================
 * UUI: refer.js v 1.0.0
 *
 * ========================================================================
 * Copyright 2015 yonyou, Inc.
 *
 * ======================================================================== */

/**
 * u.refer({
* contentId: 'mycontent' //内容区id，如果不提供，创建弹出框口div，以弹出方式打开参照
* pageUrl:'xxxx' //自定义参照需要设置此属性
* dataUrl:'yyyyy' //标准参照需要设置此属性
* isPOPMode: false,
* module:  {template:'<div></div>', init：function(){}}    //js模块
* params{}
* onOk: function(data){
*
* },
* onCancel: function(){
*
* }
* })
 */

var Refer = function Refer(options) {
    var contentId = options['contentId'];
    if (u.isEmptyObject(contentId)) throw new Error('contentId is null');
    this.options = u.extend({}, Refer.DEFAULTS, options);
    this.params = this.options['params'];
    this.create();
    this.loaded = false;
};

Refer.DEFAULTS = {
    isPOPMode: false,
    searchInput: null,
    contentId: null,
    okId: 'okBtn',
    cancelId: 'cancelBtn',
    width: null,
    height: null,
    title: '参照',
    setVal: function setVal() {},
    onOk: function onOk() {},
    onCancel: function onCancel() {}
};

Refer.fn = Refer.prototype;

Refer.fn.create = function () {
    var self = this;
    self.setVal = this.options.setVal;
    self.searchInput = this.options.searchInput;

    var prefixID = this.options.contentId.replace(/[^\w\s]/gi, '\\$&');
    if (!this.options.isPOPMode) {
        //TODO 后续支持非弹窗模式

        //if ($('#' + this.options.contentId).length === 0) {
        //    $('body').append($('<div>').attr('id', this.options.contentId));
        //}
        //this.$contentEle = $('#' + prefixID)
        //this.$okBtn = $('#' + prefixID + this.options.okId)
        //this.$cancelBtn = $('#' + prefixID + this.options.cancelId)
    } else {
            var dialog = document.querySelector('#' + prefixID);
            self.isDefaultDialog = true;
            if (dialog == null) {
                //var d = document.createElement('DIV')
                //d.innerHTML = '<div class="modal" id="' + prefixID + '"><div class="modal-dialog"><div class="modal-content">' + '<div class="modal-header"><h4 class="modal-title">Modal title</h4></div>' + '<div class="modal-body"></div><div class="modal-footer">' + '<button   type="button" class="btn btn-primary okBtn">确定</button>' + '<button  type="button" class="btn btn-default cancelBtn" data-dismiss="modal">取消</button></div></div></div></div>'
                dialog = u.makeDOM('	<div style="display:none;height:100%" id="' + prefixID + '">' + '<div class="u-msg-title"><h4 class="title">单据名称</h4></div>' + '<div class="u-msg-content">' + '<div class="content"></div>' + '</div>' + '<div class="u-msg-footer">' + '<button class="u-msg-ok u-button">保存<span class="u-button-container"><span class="u-ripple"></span></span></button>' + '<button class="u-msg-cancel u-button">取消<span class="u-button-container"><span class="u-ripple"></span></span></button>' + '</div>' + '</div>');
                document.body.appendChild(dialog);
                //dialog = document.body.querySelector('#' + prefixID);
            }
            //this.$contentEle = dialog.find('.modal-body');
            this.titleDiv = dialog.querySelector('.title');
            this.contentDiv = dialog.querySelector('.content');
            this.okBtn = dialog.querySelector('.u-msg-ok');
            this.cancelBtn = dialog.querySelector('.u-msg-cancel');
            this.dialog = dialog;
            //if (this.options.width)
            //    dialog.find('.modal-content').css('width', this.options.width)
            //if (this.options.height)
            //    this.$contentEle.css('height', this.options.height)
            //this.dialog.find('.modal-title').html(this.options.title)
            this.titleDiv.innerHTML = this.options.title;
        }
    u.on(this.okBtn, 'click', function () {
        self.submit();
    });

    u.on(this.cancelBtn, 'click', function () {
        self.cancel();
    });
};

Refer.fn.submit = function () {
    var data = this.submitData();
    this.options.onOk(data);
    Plugin.destroy(this);
};

Refer.fn.cancel = function () {
    this.options.onCancel();
    Plugin.destroy(this);
};

Refer.fn.open = function () {
    var self = this;
    if (self.isDefaultDialog) {
        var opt = { id: this.options.contentId, content: '#' + this.options.contentId, hasCloseMenu: true };
        if (this.options.height) opt.height = this.options.height;
        if (this.options.width) opt.width = this.options.width;
        self.modalDialog = u.dialog(opt);
        //self.dialog.modal('show')
    }
    if (this.options['module']) {
        self.contentDiv.innerHTML = this.options['module'].template;
        this.options['module'].init(self);
    }
    //else if(require && require.amd){
    //    require([this.options.pageUrl], function(module) {
    //        self.contentDiv.innerHTML =  module.template;
    //        module.init(self);
    //        self.loaded = true;
    //    })
    //}
};

/**
 * 参照页面中需注册此方法
 */
Refer.fn.registerSubmitFunc = function (func) {
    this.submitData = func;
};

Refer.fn.submitData = function () {};

var Plugin = function Plugin(options) {
    var r = new Refer(options);

    Plugin.addRefer(r);
    r.open();
    return r;
};

Refer.fn.destroy = function () {
    if (this.dialog) {
        if (this.isDefaultDialog) {
            //this.dialog.modal('hide');
            //	            this.dialog.modal('removeBackdrop');
            this.modalDialog.close();
        }
        //this.dialog.parent().remove();
        this.dialog.parentElement.removeChild(this.dialog);
    }
    delete this.options;
};

/**
 * 参照实列
 */
Plugin.instances = {};

Plugin.openRefer = function (options) {
    var r = new Refer(options);
    Plugin.addRefer(r);
    r.open();
};

Plugin.getRefer = function (id) {
    return Plugin.instances[id];
};

Plugin.addRefer = function (refer) {
    Plugin.instances[refer.options.id] = refer;
};

Plugin.destroy = function (refer) {
    var r = Plugin.instances[refer.options.id];
    delete Plugin.instances[refer.options.id];
    r.destroy();
};

u.refer = Plugin;
'use strict';

u.slidePanelTemplate = ['<div class="slidePanel slidePanel-right  slidePanel-show slidePanel-dragging" style="transform:translate3d(100%,0,0);">', '<div class="slidePanel-content site-sidebar-content"></div>', '<div class="slidePanel-handler"></div>', '</div>'];

u.slidePanel = function (options) {
    var url = options['url'],
        width = options['width'] || '700px',
        callback = options['callback'] || function () {},
        slideDom = u.makeDOM(u.slidePanelTemplate.join('')),
        overlayDiv = u.makeModal(slideDom);
    slideDom.style.width = width;
    overlayDiv.style.opacity = 0;
    document.body.appendChild(slideDom);
    //overlayDiv.style.opacity = 0.5;
    u.ajax({
        type: 'get',
        url: url,
        success: function success(data) {
            var content = slideDom.querySelector('.slidePanel-content');
            content.innerHTML = data;
            callback();
            setTimeout(function () {
                slideDom.style.transform = 'translate3d(0,0,0)';
                overlayDiv.style.opacity = 0.5;
            }, 1);
        }
    });

    u.on(overlayDiv, 'click', function () {
        u.on(slideDom, 'transitionend', function () {
            document.body.removeChild(slideDom);
            document.body.removeChild(overlayDiv);
        });
        u.on(slideDom, 'webkitTransitionEnd', function () {
            document.body.removeChild(slideDom);
            document.body.removeChild(overlayDiv);
        });
        slideDom.style.transform = 'translate3d(100%,0,0)';
        overlayDiv.style.opacity = 0;
        if (u.isIE8) {
            document.body.removeChild(slideDom);
            document.body.removeChild(overlayDiv);
        }
    });

    return {
        close: function close() {
            overlayDiv.click();
        }
    };
};
'use strict';

/**
 * Created by dingrf on 2016/3/4.
 */

/**
 * 加载控件
 */

if (document.readyState && document.readyState === 'complete') {
    u.compMgr.updateComp();
} else {
    u.on(window, 'load', function () {

        //扫描并生成控件
        u.compMgr.updateComp();
    });
}
'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};/*!
 * Mobiscroll v2.13.2
 * http://mobiscroll.com
 *
 * Copyright 2010-2014, Acid Media
 * Licensed under the MIT license.
 *
 */(function($,undefined){function testProps(props){var i;for(i in props){if(mod[props[i]]!==undefined){return true;}}return false;}function testPrefix(){var prefixes=['Webkit','Moz','O','ms'],p;for(p in prefixes){if(testProps([prefixes[p]+'Transform'])){return'-'+prefixes[p].toLowerCase()+'-';}}return'';}function init(that,options,args){var ret=that;// Init
if((typeof options==='undefined'?'undefined':_typeof(options))==='object'){return that.each(function(){if(!this.id){this.id='mobiscroll'+ ++id;}if(instances[this.id]){instances[this.id].destroy();}new $.mobiscroll.classes[options.component||'Scroller'](this,options);});}// Method call
if(typeof options==='string'){that.each(function(){var r,inst=instances[this.id];if(inst&&inst[options]){r=inst[options].apply(this,Array.prototype.slice.call(args,1));if(r!==undefined){ret=r;return false;}}});}return ret;}var id=+new Date(),touches={},instances={},extend=$.extend,mod=document.createElement('modernizr').style,has3d=testProps(['perspectiveProperty','WebkitPerspective','MozPerspective','OPerspective','msPerspective']),hasFlex=testProps(['flex','msFlex','WebkitBoxDirection']),prefix=testPrefix(),pr=prefix.replace(/^\-/,'').replace(/\-$/,'').replace('moz','Moz');$.fn.mobiscroll=function(method){extend(this,$.mobiscroll.components);return init(this,method,arguments);};$.mobiscroll=$.mobiscroll||{version:'2.13.2',util:{prefix:prefix,jsPrefix:pr,has3d:has3d,hasFlex:hasFlex,testTouch:function testTouch(e){if(e.type=='touchstart'){touches[e.target]=true;}else if(touches[e.target]){delete touches[e.target];return false;}return true;},isNumeric:function isNumeric(a){return a-parseFloat(a)>=0;},getCoord:function getCoord(e,c){var ev=e.originalEvent||e;return ev.changedTouches?ev.changedTouches[0]['page'+c]:e['page'+c];},constrain:function constrain(val,min,max){return Math.max(min,Math.min(val,max));}},tapped:false,presets:{scroller:{},numpad:{}},themes:{listview:{}},i18n:{},instances:instances,classes:{},components:{},defaults:{theme:'mobiscroll',context:'body'},userdef:{},setDefaults:function setDefaults(o){extend(this.userdef,o);},presetShort:function presetShort(name,c,p){this.components[name]=function(s){return init(this,extend(s,{component:c,preset:p===false?undefined:name}),arguments);};}};$.scroller=$.scroller||$.mobiscroll;$.fn.scroller=$.fn.scroller||$.fn.mobiscroll;})(jQuery);(function($){$.mobiscroll.i18n.zh=$.extend($.mobiscroll.i18n.zh,{// Core
setText:'确定',cancelText:'取消',clearText:'明确',selectedText:'选',// Datetime component
dateFormat:'yy/mm/dd',dateOrder:'yymmdd',dayNames:['周日','周一','周二','周三','周四','周五','周六'],dayNamesShort:['日','一','二','三','四','五','六'],dayNamesMin:['日','一','二','三','四','五','六'],dayText:'日',hourText:'时',minuteText:'分',monthNames:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],monthNamesShort:['一','二','三','四','五','六','七','八','九','十','十一','十二'],monthText:'月',secText:'秒',timeFormat:'HH:ii',timeWheels:'HHii',yearText:'年',nowText:'当前',pmText:'下午',amText:'上午',// Calendar component
dateText:'日',timeText:'时间',calendarText:'日历',closeText:'关闭',// Daterange component
fromText:'开始时间',toText:'结束时间',// Measurement components
wholeText:'合计',fractionText:'分数',unitText:'单位',// Time / Timespan component
labels:['年','月','日','小时','分钟','秒',''],labelsShort:['年','月','日','点','分','秒',''],// Timer component
startText:'开始',stopText:'停止',resetText:'重置',lapText:'圈',hideText:'隐藏'});})(jQuery);// theme : android
(function($){$.mobiscroll.themes.android={dateOrder:'Mddyy',mode:'clickpick',height:50,showLabel:false,btnStartClass:'mbsc-ic mbsc-ic-play3',btnStopClass:'mbsc-ic mbsc-ic-pause2',btnResetClass:'mbsc-ic mbsc-ic-stop2',btnLapClass:'mbsc-ic mbsc-ic-loop2'};})(jQuery);// theme : android-holo
(function($){var themes=$.mobiscroll.themes,theme={dateOrder:'Mddyy',//mode: 'mixed',
rows:5,minWidth:76,height:36,showLabel:false,selectedLineHeight:true,selectedLineBorder:2,useShortLabels:true,icon:{filled:'star3',empty:'star'},btnPlusClass:'mbsc-ic mbsc-ic-arrow-down6',btnMinusClass:'mbsc-ic mbsc-ic-arrow-up6',// @deprecated since 2.12.0, backward compatibility code
// ---
onThemeLoad:function onThemeLoad(lang,s){if(s.theme){s.theme=s.theme.replace('android-ics','android-holo').replace(' light','-light');}},// ---
onMarkupReady:function onMarkupReady(markup){markup.addClass('mbsc-android-holo');}};themes['android-holo']=theme;themes['android-holo-light']=theme;// @deprecated since 2.12.0, backward compatibility code
themes['android-ics']=theme;themes['android-ics light']=theme;themes['android-holo light']=theme;})(jQuery);// theme : ios
(function($){$.mobiscroll.themes.ios={display:'bottom',dateOrder:'MMdyy',rows:5,height:30,minWidth:60,headerText:false,showLabel:false,btnWidth:false,selectedLineHeight:true,selectedLineBorder:2,useShortLabels:true};})(jQuery);// theme : ios7
(function($){$.mobiscroll.themes.ios7={display:'bottom',dateOrder:'MMdyy',rows:5,height:34,minWidth:55,headerText:false,showLabel:false,btnWidth:false,selectedLineHeight:true,selectedLineBorder:1,useShortLabels:true,deleteIcon:'backspace3',checkIcon:'ion-ios7-checkmark-empty',btnCalPrevClass:'mbsc-ic mbsc-ic-arrow-left5',btnCalNextClass:'mbsc-ic mbsc-ic-arrow-right5',btnPlusClass:'mbsc-ic mbsc-ic-arrow-down5',btnMinusClass:'mbsc-ic mbsc-ic-arrow-up5'};})(jQuery);// theme : jquery mobile
(function($){var ver=$.mobile&&$.mobile.version.match(/1\.4/);$.mobiscroll.themes.jqm={jqmBorder:'a',jqmBody:ver?'a':'c',jqmHeader:'b',jqmWheel:'d',jqmLine:'b',jqmClickPick:'c',jqmSet:'b',jqmCancel:'c',disabledClass:'ui-disabled',activeClass:'ui-btn-active',activeTabInnerClass:'ui-btn-active',btnCalPrevClass:'',btnCalNextClass:'',selectedLineHeight:true,selectedLineBorder:1,onThemeLoad:function onThemeLoad(lang,s){var cal=s.jqmBody||'c',txt=s.jqmEventText||'b',bubble=s.jqmEventBubble||'a';s.dayClass='ui-body-a ui-body-'+cal;s.innerDayClass='ui-state-default ui-btn ui-btn-up-'+cal;s.calendarClass='ui-body-a ui-body-'+cal;s.weekNrClass='ui-body-a ui-body-'+cal;s.eventTextClass='ui-btn-up-'+txt;s.eventBubbleClass='ui-body-'+bubble;},onEventBubbleShow:function onEventBubbleShow(evd,evc){$('.dw-cal-event-list',evc).attr('data-role','listview');evc.page().trigger('create');},onMarkupInserted:function onMarkupInserted(elm,inst){var s=inst.settings;if(ver){elm.addClass('mbsc-jqm14');$('.mbsc-np-btn, .dwwb, .dw-cal-sc-m-cell .dw-i',elm).addClass('ui-btn');$('.dwbc div.dwb, .dw-dr',elm).addClass('ui-btn ui-mini ui-corner-all');$('.dw-cal-prev .dw-cal-btn-txt',elm).addClass('ui-btn ui-icon-arrow-l ui-btn-icon-notext ui-shadow ui-corner-all');$('.dw-cal-next .dw-cal-btn-txt',elm).addClass('ui-btn ui-icon-arrow-r ui-btn-icon-notext ui-shadow ui-corner-all');}$('.dw',elm).removeClass('dwbg').addClass('ui-selectmenu ui-overlay-shadow ui-corner-all ui-body-'+s.jqmBorder);$('.dwbc .dwb',elm).attr('data-role','button').attr('data-mini','true').attr('data-theme',s.jqmCancel);$('.dwb-s .dwb',elm).addClass('ui-btn-'+s.jqmSet).attr('data-theme',s.jqmSet);$('.dwwb',elm).attr('data-role','button').attr('data-theme',s.jqmClickPick);$('.dwv',elm).addClass('ui-header ui-bar-'+s.jqmHeader);$('.dwwr',elm).addClass('ui-corner-all ui-body-'+s.jqmBody);$('.dwwl',elm).addClass('ui-body-'+s.jqmWheel);$('.dwwol',elm).addClass('ui-body-'+s.jqmLine);$('.dwl',elm).addClass('ui-body-'+s.jqmBody);// Calendar base
$('.dw-cal-tabs',elm).attr('data-role','navbar');$('.dw-cal-prev .dw-cal-btn-txt',elm).attr('data-role','button').attr('data-icon','arrow-l').attr('data-iconpos','notext');$('.dw-cal-next .dw-cal-btn-txt',elm).attr('data-role','button').attr('data-icon','arrow-r').attr('data-iconpos','notext');// Calendar events
$('.dw-cal-events',elm).attr('data-role','page');// Rangepicker
$('.dw-dr',elm).attr('data-role','button').attr('data-mini','true');// Numpad
$('.mbsc-np-btn',elm).attr('data-role','button').attr('data-corners','false');elm.trigger('create');}};})(jQuery);// theme : sense-ui
(function($){$.mobiscroll.themes['sense-ui']={btnStartClass:'mbsc-ic mbsc-ic-play3',btnStopClass:'mbsc-ic mbsc-ic-pause2',btnResetClass:'mbsc-ic mbsc-ic-stop2',btnLapClass:'mbsc-ic mbsc-ic-loop2'};})(jQuery);// theme : windows phone
(function($){var themes=$.mobiscroll.themes,theme={minWidth:76,height:76,accent:'none',dateOrder:'mmMMddDDyy',headerText:false,showLabel:false,deleteIcon:'backspace4',icon:{filled:'star3',empty:'star'},btnWidth:false,btnStartClass:'mbsc-ic mbsc-ic-play3',btnStopClass:'mbsc-ic mbsc-ic-pause2',btnResetClass:'mbsc-ic mbsc-ic-stop2',btnLapClass:'mbsc-ic mbsc-ic-loop2',btnHideClass:'mbsc-ic mbsc-ic-close',btnCalPrevClass:'mbsc-ic mbsc-ic-arrow-left2',btnCalNextClass:'mbsc-ic mbsc-ic-arrow-right2',btnPlusClass:'mbsc-ic mbsc-ic-plus',btnMinusClass:'mbsc-ic mbsc-ic-minus',onMarkupInserted:function onMarkupInserted(elm,inst){var click,touch,active;elm.addClass('mbsc-wp');$('.dw',elm).addClass('mbsc-wp-'+inst.settings.accent);$('.dwb-s .dwb',elm).addClass('mbsc-ic mbsc-ic-checkmark');$('.dwb-c .dwb',elm).addClass('mbsc-ic mbsc-ic-close');$('.dwb-cl .dwb',elm).addClass('mbsc-ic mbsc-ic-close');$('.dwb-n .dwb',elm).addClass('mbsc-ic mbsc-ic-loop2');$('.dwwl',elm).on('touchstart mousedown DOMMouseScroll mousewheel',function(e){if(e.type==='mousedown'&&touch){return;}touch=e.type==='touchstart';click=true;active=$(this).hasClass('wpa');$('.dwwl',elm).removeClass('wpa');$(this).addClass('wpa');}).on('touchmove mousemove',function(){click=false;}).on('touchend mouseup',function(e){if(click&&active&&$(e.target).closest('.dw-li').hasClass('dw-sel')){$(this).removeClass('wpa');}if(e.type==='mouseup'){touch=false;}click=false;});},onThemeLoad:function onThemeLoad(lang,s){if(lang&&lang.dateOrder&&!s.dateOrder){var ord=lang.dateOrder;ord=ord.match(/mm/i)?ord.replace(/mmMM|mm|MM/,'mmMM'):ord.replace(/mM|m|M/,'mM');ord=ord.match(/dd/i)?ord.replace(/ddDD|dd|DD/,'ddDD'):ord.replace(/dD|d|D/,'dD');s.dateOrder=ord;}// @deprecated since 2.12.0, backward compatibility code
// ---
if(s.theme){s.theme=s.theme.replace(' light','-light');}// ---
}};themes.wp=theme;themes['wp-light']=theme;// @deprecated since 2.12.0, backward compatibility code
themes['wp light']=theme;})(jQuery);(function($,undefined){var ms=$.mobiscroll;ms.datetime={defaults:{shortYearCutoff:'+10',monthNames:['January','February','March','April','May','June','July','August','September','October','November','December'],monthNamesShort:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],dayNames:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],dayNamesShort:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],dayNamesMin:['S','M','T','W','T','F','S'],monthText:'Month',amText:'am',pmText:'pm',getYear:function getYear(d){return d.getFullYear();},getMonth:function getMonth(d){return d.getMonth();},getDay:function getDay(d){return d.getDate();},getDate:function getDate(y,m,d,h,i,s){return new Date(y,m,d,h||0,i||0,s||0);},getMaxDayOfMonth:function getMaxDayOfMonth(y,m){return 32-new Date(y,m,32).getDate();},getWeekNumber:function getWeekNumber(d){// Copy date so don't modify original
d=new Date(d);d.setHours(0,0,0);// Set to nearest Thursday: current date + 4 - current day number
// Make Sunday's day number 7
d.setDate(d.getDate()+4-(d.getDay()||7));// Get first day of year
var yearStart=new Date(d.getFullYear(),0,1);// Calculate full weeks to nearest Thursday
return Math.ceil(((d-yearStart)/86400000+1)/7);}},/**
        * Format a date into a string value with a specified format.
        * @param {String} format Output format.
        * @param {Date} date Date to format.
        * @param {Object} [settings={}] Settings.
        * @return {String} Returns the formatted date string.
        */formatDate:function formatDate(format,date,settings){if(!date){return null;}var s=$.extend({},ms.datetime.defaults,settings),look=function look(m){// Check whether a format character is doubled
var n=0;while(i+1<format.length&&format.charAt(i+1)==m){n++;i++;}return n;},f1=function f1(m,val,len){// Format a number, with leading zero if necessary
var n=''+val;if(look(m)){while(n.length<len){n='0'+n;}}return n;},f2=function f2(m,val,s,l){// Format a name, short or long as requested
return look(m)?l[val]:s[val];},i,year,output='',literal=false;for(i=0;i<format.length;i++){if(literal){if(format.charAt(i)=="'"&&!look("'")){literal=false;}else{output+=format.charAt(i);}}else{switch(format.charAt(i)){case'd':output+=f1('d',s.getDay(date),2);break;case'D':output+=f2('D',date.getDay(),s.dayNamesShort,s.dayNames);break;case'o':output+=f1('o',(date.getTime()-new Date(date.getFullYear(),0,0).getTime())/86400000,3);break;case'm':output+=f1('m',s.getMonth(date)+1,2);break;case'M':output+=f2('M',s.getMonth(date),s.monthNamesShort,s.monthNames);break;case'y':year=s.getYear(date);output+=look('y')?year:(year%100<10?'0':'')+year%100;//output += (look('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
break;case'h':var h=date.getHours();output+=f1('h',h>12?h-12:h===0?12:h,2);break;case'H':output+=f1('H',date.getHours(),2);break;case'i':output+=f1('i',date.getMinutes(),2);break;case's':output+=f1('s',date.getSeconds(),2);break;case'a':output+=date.getHours()>11?s.pmText:s.amText;break;case'A':output+=date.getHours()>11?s.pmText.toUpperCase():s.amText.toUpperCase();break;case"'":if(look("'")){output+="'";}else{literal=true;}break;default:output+=format.charAt(i);}}}return output;},/**
        * Extract a date from a string value with a specified format.
        * @param {String} format Input format.
        * @param {String} value String to parse.
        * @param {Object} [settings={}] Settings.
        * @return {Date} Returns the extracted date.
        */parseDate:function parseDate(format,value,settings){var s=$.extend({},ms.datetime.defaults,settings),def=s.defaultValue||new Date();if(!format||!value){return def;}// If already a date object
if(value.getTime){return value;}value=(typeof value==='undefined'?'undefined':_typeof(value))=='object'?value.toString():value+'';var shortYearCutoff=s.shortYearCutoff,year=s.getYear(def),month=s.getMonth(def)+1,day=s.getDay(def),doy=-1,hours=def.getHours(),minutes=def.getMinutes(),seconds=0,//def.getSeconds(),
ampm=-1,literal=false,// Check whether a format character is doubled
lookAhead=function lookAhead(match){var matches=iFormat+1<format.length&&format.charAt(iFormat+1)==match;if(matches){iFormat++;}return matches;},getNumber=function getNumber(match){// Extract a number from the string value
lookAhead(match);var size=match=='@'?14:match=='!'?20:match=='y'?4:match=='o'?3:2,digits=new RegExp('^\\d{1,'+size+'}'),num=value.substr(iValue).match(digits);if(!num){return 0;}iValue+=num[0].length;return parseInt(num[0],10);},getName=function getName(match,s,l){// Extract a name from the string value and convert to an index
var names=lookAhead(match)?l:s,i;for(i=0;i<names.length;i++){if(value.substr(iValue,names[i].length).toLowerCase()==names[i].toLowerCase()){iValue+=names[i].length;return i+1;}}return 0;},checkLiteral=function checkLiteral(){iValue++;},iValue=0,iFormat;for(iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)=="'"&&!lookAhead("'")){literal=false;}else{checkLiteral();}}else{switch(format.charAt(iFormat)){case'd':day=getNumber('d');break;case'D':getName('D',s.dayNamesShort,s.dayNames);break;case'o':doy=getNumber('o');break;case'm':month=getNumber('m');break;case'M':month=getName('M',s.monthNamesShort,s.monthNames);break;case'y':year=getNumber('y');break;case'H':hours=getNumber('H');break;case'h':hours=getNumber('h');break;case'i':minutes=getNumber('i');break;case's':seconds=getNumber('s');break;case'a':ampm=getName('a',[s.amText,s.pmText],[s.amText,s.pmText])-1;break;case'A':ampm=getName('A',[s.amText,s.pmText],[s.amText,s.pmText])-1;break;case"'":if(lookAhead("'")){checkLiteral();}else{literal=true;}break;default:checkLiteral();}}}if(year<100){year+=new Date().getFullYear()-new Date().getFullYear()%100+(year<=(typeof shortYearCutoff!='string'?shortYearCutoff:new Date().getFullYear()%100+parseInt(shortYearCutoff,10))?0:-100);}if(doy>-1){month=1;day=doy;do{var dim=32-new Date(year,month-1,32).getDate();if(day<=dim){break;}month++;day-=dim;}while(true);}hours=ampm==-1?hours:ampm&&hours<12?hours+12:!ampm&&hours==12?0:hours;var date=s.getDate(year,month-1,day,hours,minutes,seconds);if(s.getYear(date)!=year||s.getMonth(date)+1!=month||s.getDay(date)!=day){return def;// Invalid date
}return date;}};// @deprecated since 2.11.0, backward compatibility code
// ---
ms.formatDate=ms.datetime.formatDate;ms.parseDate=ms.datetime.parseDate;// ---
})(jQuery);(function($,window,document,undefined){var $activeElm,preventShow,extend=$.extend,ms=$.mobiscroll,instances=ms.instances,userdef=ms.userdef,util=ms.util,pr=util.jsPrefix,has3d=util.has3d,getCoord=util.getCoord,constrain=util.constrain,isOldAndroid=/android [1-3]/i.test(navigator.userAgent),animEnd='webkitAnimationEnd animationend',empty=function empty(){},prevdef=function prevdef(ev){ev.preventDefault();};ms.classes.Widget=function(el,settings,inherit){var $ariaDiv,$ctx,$header,$markup,$overlay,$persp,$popup,$wnd,$wrapper,buttons,btn,doAnim,hasButtons,isModal,lang,modalWidth,modalHeight,posEvents,preset,preventPos,s,scrollLock,setReadOnly,theme,wasReadOnly,wndWidth,wndHeight,that=this,$elm=$(el),elmList=[],posDebounce={};function onBtnStart(ev){// Can't call preventDefault here, it kills page scroll
if(btn){btn.removeClass('dwb-a');}btn=$(this);// Active button
if(!btn.hasClass('dwb-d')&&!btn.hasClass('dwb-nhl')){btn.addClass('dwb-a');}if(ev.type==='mousedown'){$(document).on('mouseup',onBtnEnd);}}function onBtnEnd(ev){if(btn){btn.removeClass('dwb-a');btn=null;}if(ev.type==='mouseup'){$(document).off('mouseup',onBtnEnd);}}function onShow(prevFocus){if(!prevFocus){$popup.focus();}that.ariaMessage(s.ariaMessage);}function onHide(prevAnim){var activeEl,value,type,focus=s.focusOnClose;$markup.remove();if($activeElm&&!prevAnim){setTimeout(function(){if(focus===undefined){preventShow=true;activeEl=$activeElm[0];type=activeEl.type;value=activeEl.value;try{activeEl.type='button';}catch(ex){}$activeElm.focus();activeEl.type=type;activeEl.value=value;}else if(focus){// If a mobiscroll field is focused, allow show
if(instances[$(focus).attr('id')]){ms.tapped=false;}$(focus).focus();}},200);}that._isVisible=false;event('onHide',[]);}function onPosition(ev){clearTimeout(posDebounce[ev.type]);posDebounce[ev.type]=setTimeout(function(){var isScroll=ev.type=='scroll';if(isScroll&&!scrollLock){return;}that.position(!isScroll);},200);}function event(name,args){var ret;args.push(that);$.each([userdef,theme,preset,settings],function(i,v){if(v&&v[name]){// Call preset event
ret=v[name].apply(el,args);}});return ret;}/**
        * Positions the scroller on the screen.
        */that.position=function(check){var w,l,t,anchor,aw,// anchor width
ah,// anchor height
ap,// anchor position
at,// anchor top
al,// anchor left
arr,// arrow
arrw,// arrow width
arrl,// arrow left
dh,scroll,sl,// scroll left
st,// scroll top
totalw=0,minw=0,css={},nw=Math.min($wnd[0].innerWidth||$wnd.innerWidth(),$persp.width()),//$persp.width(), // To get the width without scrollbar
nh=$wnd[0].innerHeight||$wnd.innerHeight();if(wndWidth===nw&&wndHeight===nh&&check||preventPos){return;}if(isModal&&that._isLiquid&&s.display!=='bubble'){// Set width, if document is larger than viewport, needs to be set before onPosition (for calendar)
$popup.width(nw);}if(event('onPosition',[$markup,nw,nh])===false||!isModal){return;}sl=$wnd.scrollLeft();st=$wnd.scrollTop();anchor=s.anchor===undefined?$elm:$(s.anchor);// Set / unset liquid layout based on screen width, but only if not set explicitly by the user
if(that._isLiquid&&s.layout!=='liquid'){if(nw<400){$markup.addClass('dw-liq');}else{$markup.removeClass('dw-liq');}}if(/modal|bubble/.test(s.display)){$wrapper.width('');$('.mbsc-w-p',$markup).each(function(){w=$(this).outerWidth(true);totalw+=w;minw=w>minw?w:minw;});w=totalw>nw?minw:totalw;$wrapper.width(w).css('white-space',totalw>nw?'':'nowrap');}modalWidth=$popup.outerWidth();modalHeight=$popup.outerHeight(true);scrollLock=modalHeight<=nh&&modalWidth<=nw;that.scrollLock=scrollLock;if(s.display=='modal'){l=Math.max(0,sl+(nw-modalWidth)/2);t=st+(nh-modalHeight)/2;}else if(s.display=='bubble'){scroll=true;arr=$('.dw-arrw-i',$markup);ap=anchor.offset();at=Math.abs($ctx.offset().top-ap.top);al=Math.abs($ctx.offset().left-ap.left);// horizontal positioning
aw=anchor.outerWidth();ah=anchor.outerHeight();l=constrain(al-($popup.outerWidth(true)-aw)/2,sl+3,sl+nw-modalWidth-3);// vertical positioning
t=at-modalHeight;// above the input
if(t<st||at>st+nh){// if doesn't fit above or the input is out of the screen
$popup.removeClass('dw-bubble-top').addClass('dw-bubble-bottom');t=at+ah;// below the input
}else{$popup.removeClass('dw-bubble-bottom').addClass('dw-bubble-top');}// Calculate Arrow position
arrw=arr.outerWidth();arrl=constrain(al+aw/2-(l+(modalWidth-arrw)/2),0,arrw);// Limit Arrow position
$('.dw-arr',$markup).css({left:arrl});}else{l=sl;if(s.display=='top'){t=st;}else if(s.display=='bottom'){t=st+nh-modalHeight;}}t=t<0?0:t;css.top=t;css.left=l;$popup.css(css);// If top + modal height > doc height, increase doc height
$persp.height(0);dh=Math.max(t+modalHeight,s.context=='body'?$(document).height():$ctx[0].scrollHeight);$persp.css({height:dh});// Scroll needed
if(scroll&&(t+modalHeight>st+nh||at>st+nh)){preventPos=true;setTimeout(function(){preventPos=false;},300);$wnd.scrollTop(Math.min(t+modalHeight-nh,dh-nh));}wndWidth=nw;wndHeight=nh;};/**
        * Show mobiscroll on focus and click event of the parameter.
        * @param {jQuery} $elm - Events will be attached to this element.
        * @param {Function} [beforeShow=undefined] - Optional function to execute before showing mobiscroll.
        */that.attachShow=function($elm,beforeShow){elmList.push($elm);if(s.display!=='inline'){$elm.on('mousedown.dw',function(ev){if(setReadOnly){// Prevent input to get focus on tap (virtual keyboard pops up on some devices)
ev.preventDefault();}}).on((s.showOnFocus?'focus.dw':'')+(s.showOnTap?' click.dw':''),function(ev){if((ev.type!=='focus'||ev.type==='focus'&&!preventShow)&&!ms.tapped){if(beforeShow){beforeShow();}// Hide virtual keyboard
if($(document.activeElement).is('input,textarea')){$(document.activeElement).blur();}$activeElm=$elm;that.show();}setTimeout(function(){preventShow=false;},300);// With jQuery < 1.9 focus is fired twice in IE
});}};/**
        * Set button handler.
        */that.select=function(){if(!isModal||that.hide(false,'set')!==false){that._fillValue();event('onSelect',[that.val]);}};/**
        * Cancel and hide the scroller instance.
        */that.cancel=function(){if(!isModal||that.hide(false,'cancel')!==false){event('onCancel',[that.val]);}};/**
        * Clear button handler.
        */that.clear=function(){event('onClear',[$markup]);if(isModal&&!that.live){that.hide(false,'clear');}that.setValue(null,true);};/**
        * Enables the scroller and the associated input.
        */that.enable=function(){s.disabled=false;if(that._isInput){$elm.prop('disabled',false);}};/**
        * Disables the scroller and the associated input.
        */that.disable=function(){s.disabled=true;if(that._isInput){$elm.prop('disabled',true);}};/**
        * Shows the scroller instance.
        * @param {Boolean} prevAnim - Prevent animation if true
        * @param {Boolean} prevFocus - Prevent focusing if true
        */that.show=function(prevAnim,prevFocus){// Create wheels
var html;if(s.disabled||that._isVisible){return;}if(doAnim!==false){if(s.display=='top'){doAnim='slidedown';}if(s.display=='bottom'){doAnim='slideup';}}// Parse value from input
that._readValue();event('onBeforeShow',[]);// Create wheels containers
html='<div lang="'+s.lang+'" class="mbsc-'+s.theme+' dw-'+s.display+' '+(s.cssClass||'')+(that._isLiquid?' dw-liq':'')+(isOldAndroid?' mbsc-old':'')+(hasButtons?'':' dw-nobtn')+'">'+'<div class="dw-persp">'+(isModal?'<div class="dwo"></div>':'')+// Overlay
'<div'+(isModal?' role="dialog" tabindex="-1"':'')+' class="dw'+(s.rtl?' dw-rtl':' dw-ltr')+'">'+(// Popup
s.display==='bubble'?'<div class="dw-arrw"><div class="dw-arrw-i"><div class="dw-arr"></div></div></div>':'')+// Bubble arrow
'<div class="dwwr">'+// Popup content
'<div aria-live="assertive" class="dw-aria dw-hidden"></div>'+(s.headerText?'<div class="dwv">'+s.headerText+'</div>':'')+// Header
'<div class="dwcc">';// Wheel group container
html+=that._generateContent();html+='</div>';if(hasButtons){html+='<div class="dwbc">';$.each(buttons,function(i,b){b=typeof b==='string'?that.buttons[b]:b;html+='<div'+(s.btnWidth?' style="width:'+100/buttons.length+'%"':'')+' class="dwbw '+b.css+'"><div tabindex="0" role="button" class="dwb dwb'+i+' dwb-e">'+b.text+'</div></div>';});html+='</div>';}html+='</div></div></div></div>';$markup=$(html);$persp=$('.dw-persp',$markup);$overlay=$('.dwo',$markup);$wrapper=$('.dwwr',$markup);$header=$('.dwv',$markup);$popup=$('.dw',$markup);$ariaDiv=$('.dw-aria',$markup);that._markup=$markup;that._header=$header;that._isVisible=true;posEvents='orientationchange resize';that._markupReady();event('onMarkupReady',[$markup]);// Show
if(isModal){// Enter / ESC
$(window).on('keydown.dw',function(ev){if(ev.keyCode==13){that.select();}else if(ev.keyCode==27){that.cancel();}});// Prevent scroll if not specified otherwise
if(s.scrollLock){$markup.on('touchstart touchmove',function(ev){if(scrollLock){ev.preventDefault();}});}// Disable inputs to prevent bleed through (Android bug)
if(pr!=='Moz'){$('input,select,button',$ctx).each(function(){if(!this.disabled){$(this).addClass('dwtd').prop('disabled',true);}});}posEvents+=' scroll';ms.activeInstance=that;$markup.appendTo($ctx);if(has3d&&doAnim&&!prevAnim){$markup.addClass('dw-in dw-trans').on(animEnd,function(){$markup.removeClass('dw-in dw-trans').find('.dw').removeClass('dw-'+doAnim);onShow(prevFocus);}).find('.dw').addClass('dw-'+doAnim);}}else if($elm.is('div')){$elm.html($markup);}else{$markup.insertAfter($elm);}event('onMarkupInserted',[$markup]);// Set position
that.position();$wnd.on(posEvents,onPosition);// Events
$markup.on('selectstart mousedown',prevdef)// Prevents blue highlight on Android and text selection in IE
.on('click','.dwb-e',prevdef).on('keydown','.dwb-e',function(ev){if(ev.keyCode==32){// Space
ev.preventDefault();ev.stopPropagation();$(this).click();}});setTimeout(function(){// Init buttons
$.each(buttons,function(i,b){that.tap($('.dwb'+i,$markup),function(ev){b=typeof b==='string'?that.buttons[b]:b;b.handler.call(this,ev,that);},true);});if(s.closeOnOverlay){that.tap($overlay,function(){that.cancel();});}if(isModal&&!doAnim){onShow(prevFocus);}$markup.on('touchstart mousedown','.dwb-e',onBtnStart).on('touchend','.dwb-e',onBtnEnd);that._attachEvents($markup);},300);event('onShow',[$markup,that._valueText]);};/**
        * Hides the scroller instance.
        */that.hide=function(prevAnim,btn,force){// If onClose handler returns false, prevent hide
if(!that._isVisible||!force&&!that._isValid&&btn=='set'||!force&&event('onClose',[that._valueText,btn])===false){return false;}// Hide wheels and overlay
if($markup){// Re-enable temporary disabled fields
if(pr!=='Moz'){$('.dwtd',$ctx).each(function(){$(this).prop('disabled',false).removeClass('dwtd');});}if(has3d&&isModal&&doAnim&&!prevAnim&&!$markup.hasClass('dw-trans')){// If dw-trans class was not removed, means that there was no animation
$markup.addClass('dw-out dw-trans').find('.dw').addClass('dw-'+doAnim).on(animEnd,function(){onHide(prevAnim);});}else{onHide(prevAnim);}// Stop positioning on window resize
$wnd.off(posEvents,onPosition);}delete ms.activeInstance;};that.ariaMessage=function(txt){$ariaDiv.html('');setTimeout(function(){$ariaDiv.html(txt);},100);};/**
        * Return true if the scroller is currently visible.
        */that.isVisible=function(){return that._isVisible;};// Protected functions to override
that.setValue=empty;that._generateContent=empty;that._attachEvents=empty;that._readValue=empty;that._fillValue=empty;that._markupReady=empty;that._processSettings=empty;// Generic widget functions
/**
        * Attach tap event to the given element.
        */that.tap=function(el,handler,prevent){var startX,startY,moved;if(s.tap){el.on('touchstart.dw',function(ev){// Can't always call preventDefault here, it kills page scroll
if(prevent){ev.preventDefault();}startX=getCoord(ev,'X');startY=getCoord(ev,'Y');moved=false;}).on('touchmove.dw',function(ev){// If movement is more than 20px, don't fire the click event handler
if(Math.abs(getCoord(ev,'X')-startX)>20||Math.abs(getCoord(ev,'Y')-startY)>20){moved=true;}}).on('touchend.dw',function(ev){var that=this;if(!moved){// preventDefault and setTimeout are needed by iOS
ev.preventDefault();setTimeout(function(){handler.call(that,ev);},isOldAndroid?400:10);}// Prevent click events to happen
ms.tapped=true;setTimeout(function(){ms.tapped=false;},500);});}el.on('click.dw',function(ev){if(!ms.tapped){// If handler was not called on touchend, call it on click;
handler.call(this,ev);}ev.preventDefault();});};/**
        * Sets one ore more options.
        */that.option=function(opt,value){var obj={};if((typeof opt==='undefined'?'undefined':_typeof(opt))==='object'){obj=opt;}else{obj[opt]=value;}that.init(obj);};/**
        * Destroys the mobiscroll instance.
        */that.destroy=function(){// Force hide without animation
that.hide(true,false,true);// Remove all events from elements
$.each(elmList,function(i,v){v.off('.dw');});// Reset original readonly state
if(that._isInput&&setReadOnly){el.readOnly=wasReadOnly;}event('onDestroy',[]);// Delete scroller instance
delete instances[el.id];};/**
        * Returns the mobiscroll instance.
        */that.getInst=function(){return that;};/**
        * Triggers a mobiscroll event.
        */that.trigger=event;/**
        * Scroller initialization.
        */that.init=function(ss){that.settings=s={};// Update original user settings
extend(settings,ss);extend(s,ms.defaults,that._defaults,userdef,settings);// Get theme defaults
theme=ms.themes[s.theme]||ms.themes.mobiscroll;// Get language defaults
lang=ms.i18n[s.lang];event('onThemeLoad',[lang,settings]);extend(s,theme,lang,userdef,settings);preset=ms.presets[that._class][s.preset];// Add default buttons
s.buttons=s.buttons||(s.display!=='inline'?['set','cancel']:[]);// Hide header text in inline mode by default
s.headerText=s.headerText===undefined?s.display!=='inline'?'{value}':false:s.headerText;if(preset){preset=preset.call(el,that);extend(s,preset,settings);// Load preset settings
}if(!ms.themes[s.theme]){s.theme='mobiscroll';}that._isLiquid=(s.layout||(/top|bottom/.test(s.display)?'liquid':''))==='liquid';that._processSettings();// Unbind all events (if re-init)
$elm.off('.dw');doAnim=isOldAndroid?false:s.animate;buttons=s.buttons;isModal=s.display!=='inline';setReadOnly=s.showOnFocus||s.showOnTap;$wnd=$(s.context=='body'?window:s.context);$ctx=$(s.context);// @deprecated since 2.8.0, backward compatibility code
// ---
if(!s.setText){buttons.splice($.inArray('set',buttons),1);}if(!s.cancelText){buttons.splice($.inArray('cancel',buttons),1);}if(s.button3){buttons.splice($.inArray('set',buttons)+1,0,{text:s.button3Text,handler:s.button3});}// ---
that.context=$wnd;that.live=$.inArray('set',buttons)==-1;that.buttons.set={text:s.setText,css:'dwb-s',handler:that.select};that.buttons.cancel={text:that.live?s.closeText:s.cancelText,css:'dwb-c',handler:that.cancel};that.buttons.clear={text:s.clearText,css:'dwb-cl',handler:that.clear};that._isInput=$elm.is('input');hasButtons=buttons.length>0;if(that._isVisible){that.hide(true,false,true);}if(isModal){that._readValue();if(that._isInput&&setReadOnly){// Set element readonly, save original state
if(wasReadOnly===undefined){wasReadOnly=el.readOnly;}el.readOnly=true;}that.attachShow($elm);}else{that.show();}if(that._isInput){$elm.on('change.dw',function(){if(!that._preventChange){that.setValue($elm.val(),false);}that._preventChange=false;});}};that.val=null;that.buttons={};that._isValid=true;// Constructor
if(!inherit){instances[el.id]=that;that.init(settings);}};ms.classes.Widget.prototype._defaults={// Localization
lang:'zh',setText:'Set',selectedText:'Selected',closeText:'Close',cancelText:'Cancel',clearText:'Clear',// Options
disabled:false,closeOnOverlay:true,showOnFocus:true,showOnTap:true,display:'modal',scrollLock:true,tap:true,btnWidth:true,focusOnClose:false// Temporary for iOS8
};ms.themes.mobiscroll={rows:5,showLabel:false,headerText:false,btnWidth:false,selectedLineHeight:true,selectedLineBorder:1,dateOrder:'MMddyy',weekDays:'min',checkIcon:'ion-ios7-checkmark-empty',btnPlusClass:'mbsc-ic mbsc-ic-arrow-down5',btnMinusClass:'mbsc-ic mbsc-ic-arrow-up5',btnCalPrevClass:'mbsc-ic mbsc-ic-arrow-left5',btnCalNextClass:'mbsc-ic mbsc-ic-arrow-right5'};// Prevent re-show on window focus
$(window).on('focus',function(){if($activeElm){preventShow=true;}});// Prevent standard behaviour on body click
$(document).on('mouseover mouseup mousedown click',function(ev){if(ms.tapped){ev.stopPropagation();ev.preventDefault();return false;}});})(jQuery,window,document);(function($,window,document,undefined){var move,ms=$.mobiscroll,classes=ms.classes,instances=ms.instances,util=ms.util,pr=util.jsPrefix,has3d=util.has3d,hasFlex=util.hasFlex,getCoord=util.getCoord,constrain=util.constrain,testTouch=util.testTouch;/**
     * @deprecated since 2.6.0, backward compatibility code
     */function convert(w){var ret={values:[],keys:[]};$.each(w,function(k,v){ret.keys.push(k);ret.values.push(v);});return ret;}classes.Scroller=function(el,settings,inherit){var $markup,btn,isScrollable,itemHeight,s,trigger,valueText,click,moved,start,startTime,stop,p,min,max,target,index,lines,timer,that=this,$elm=$(el),iv={},pos={},pixels={},wheels=[];// Event handlers
function onStart(ev){/* TRIALCOND */// Scroll start
if(testTouch(ev)&&!move&&!click&&!btn&&!isReadOnly(this)){// Prevent touch highlight
ev.preventDefault();// Better performance if there are tap events on document
ev.stopPropagation();move=true;isScrollable=s.mode!='clickpick';target=$('.dw-ul',this);setGlobals(target);moved=iv[index]!==undefined;// Don't allow tap, if still moving
p=moved?getCurrentPosition(target):pos[index];start=getCoord(ev,'Y');startTime=new Date();stop=start;scroll(target,index,p,0.001);if(isScrollable){target.closest('.dwwl').addClass('dwa');}if(ev.type==='mousedown'){$(document).on('mousemove',onMove).on('mouseup',onEnd);}}}function onMove(ev){if(move){if(isScrollable){// Prevent scroll
ev.preventDefault();ev.stopPropagation();stop=getCoord(ev,'Y');if(Math.abs(stop-start)>3||moved){scroll(target,index,constrain(p+(start-stop)/itemHeight,min-1,max+1));moved=true;}}}}function onEnd(ev){if(move){var time=new Date()-startTime,val=constrain(p+(start-stop)/itemHeight,min-1,max+1),speed,dist,tindex,ttop=target.offset().top;// Better performance if there are tap events on document
ev.stopPropagation();if(has3d&&time<300){speed=(stop-start)/time;dist=speed*speed/s.speedUnit;if(stop-start<0){dist=-dist;}}else{dist=stop-start;}tindex=Math.round(p-dist/itemHeight);if(!moved){// this is a "tap"
var idx=Math.floor((stop-ttop)/itemHeight),li=$($('.dw-li',target)[idx]),valid=li.hasClass('dw-v'),hl=isScrollable;if(trigger('onValueTap',[li])!==false&&valid){tindex=idx;}else{hl=true;}if(hl&&valid){li.addClass('dw-hl');// Highlight
setTimeout(function(){li.removeClass('dw-hl');},100);}}if(isScrollable){calc(target,tindex,0,true,Math.round(val));}if(ev.type==='mouseup'){$(document).off('mousemove',onMove).off('mouseup',onEnd);}move=false;}}function onBtnStart(ev){btn=$(this);// +/- buttons
if(btn.hasClass('dwwb')){if(testTouch(ev)){step(ev,btn.closest('.dwwl'),btn.hasClass('dwwbp')?plus:minus);}}if(ev.type==='mousedown'){$(document).on('mouseup',onBtnEnd);}}function onBtnEnd(ev){btn=null;if(click){clearInterval(timer);click=false;}if(ev.type==='mouseup'){$(document).off('mouseup',onBtnEnd);}}function onKeyDown(ev){if(ev.keyCode==38){// up
step(ev,$(this),minus);}else if(ev.keyCode==40){// down
step(ev,$(this),plus);}}function onKeyUp(){if(click){clearInterval(timer);click=false;}}function onScroll(ev){if(!isReadOnly(this)){ev.preventDefault();ev=ev.originalEvent||ev;var delta=ev.wheelDelta?ev.wheelDelta/120:ev.detail?-ev.detail/3:0,t=$('.dw-ul',this);setGlobals(t);calc(t,Math.round(pos[index]-delta),delta<0?1:2);}}// Private functions
function step(ev,w,func){ev.stopPropagation();ev.preventDefault();if(!click&&!isReadOnly(w)&&!w.hasClass('dwa')){click=true;// + Button
var t=w.find('.dw-ul');setGlobals(t);clearInterval(timer);timer=setInterval(function(){func(t);},s.delay);func(t);}}function isReadOnly(wh){if($.isArray(s.readonly)){var i=$('.dwwl',$markup).index(wh);return s.readonly[i];}return s.readonly;}function generateWheelItems(i){var html='<div class="dw-bf">',ww=wheels[i],// @deprecated since 2.6.0, backward compatibility code
// ---
w=ww.values?ww:convert(ww),// ---
l=1,labels=w.labels||[],values=w.values,keys=w.keys||values;$.each(values,function(j,v){if(l%20===0){html+='</div><div class="dw-bf">';}html+='<div role="option" aria-selected="false" class="dw-li dw-v" data-val="'+keys[j]+'"'+(labels[j]?' aria-label="'+labels[j]+'"':'')+' style="height:'+itemHeight+'px;line-height:'+itemHeight+'px;">'+'<div class="dw-i"'+(lines>1?' style="line-height:'+Math.round(itemHeight/lines)+'px;font-size:'+Math.round(itemHeight/lines*0.8)+'px;"':'')+'>'+v/* TRIAL */+'</div></div>';l++;});html+='</div>';return html;}function setGlobals(t){var multiple=t.closest('.dwwl').hasClass('dwwms');min=$('.dw-li',t).index($(multiple?'.dw-li':'.dw-v',t).eq(0));max=Math.max(min,$('.dw-li',t).index($(multiple?'.dw-li':'.dw-v',t).eq(-1))-(multiple?s.rows-1:0));index=$('.dw-ul',$markup).index(t);}function formatHeader(v){var t=s.headerText;return t?typeof t==='function'?t.call(el,v):t.replace(/\{value\}/i,v):'';}function getCurrentPosition(t){var style=window.getComputedStyle?getComputedStyle(t[0]):t[0].style,matrix,px;if(has3d){$.each(['t','webkitT','MozT','OT','msT'],function(i,v){if(style[v+'ransform']!==undefined){matrix=style[v+'ransform'];return false;}});matrix=matrix.split(')')[0].split(', ');px=matrix[13]||matrix[5];}else{px=style.top.replace('px','');}return Math.round(-px/itemHeight);}function ready(t,i){clearTimeout(iv[i]);delete iv[i];t.closest('.dwwl').removeClass('dwa');}function scroll(t,index,val,time,active){var px=-val*itemHeight,style=t[0].style;if(px==pixels[index]&&iv[index]){return;}//if (time && px != pixels[index]) {
// Trigger animation start event
//trigger('onAnimStart', [$markup, index, time]);
//}
pixels[index]=px;style[pr+'Transition']='all '+(time?time.toFixed(3):0)+'s ease-out';if(has3d){style[pr+'Transform']='translate3d(0,'+px+'px,0)';}else{style.top=px+'px';}if(iv[index]){ready(t,index);}if(time&&active){t.closest('.dwwl').addClass('dwa');iv[index]=setTimeout(function(){ready(t,index);},time*1000);}pos[index]=val;}function getValid(val,t,dir,multiple){var cell=$('.dw-li[data-val="'+val+'"]',t),cells=$('.dw-li',t),v=cells.index(cell),l=cells.length;if(multiple){setGlobals(t);}else if(!cell.hasClass('dw-v')){// Scroll to a valid cell
var cell1=cell,cell2=cell,dist1=0,dist2=0;while(v-dist1>=0&&!cell1.hasClass('dw-v')){dist1++;cell1=cells.eq(v-dist1);}while(v+dist2<l&&!cell2.hasClass('dw-v')){dist2++;cell2=cells.eq(v+dist2);}// If we have direction (+/- or mouse wheel), the distance does not count
if((dist2<dist1&&dist2&&dir!==2||!dist1||v-dist1<0||dir==1)&&cell2.hasClass('dw-v')){cell=cell2;v=v+dist2;}else{cell=cell1;v=v-dist1;}}return{cell:cell,v:multiple?constrain(v,min,max):v,val:cell.hasClass('dw-v')?cell.attr('data-val'):null};}function scrollToPos(time,index,manual,dir,active){// Call validation event
if(trigger('validate',[$markup,index,time,dir])!==false){// Set scrollers to position
$('.dw-ul',$markup).each(function(i){var t=$(this),multiple=t.closest('.dwwl').hasClass('dwwms'),sc=i==index||index===undefined,res=getValid(that.temp[i],t,dir,multiple),cell=res.cell;if(!cell.hasClass('dw-sel')||sc){// Set valid value
that.temp[i]=res.val;if(!multiple){$('.dw-sel',t).removeAttr('aria-selected');cell.attr('aria-selected','true');}// Add selected class to cell
$('.dw-sel',t).removeClass('dw-sel');cell.addClass('dw-sel');// Scroll to position
scroll(t,i,res.v,sc?time:0.1,sc?active:false);}});// Reformat value if validation changed something
that._valueText=valueText=s.formatResult(that.temp);if(that.live){that._hasValue=manual||that._hasValue;setValue(manual,manual,0,true);}that._header.html(formatHeader(valueText));if(manual){trigger('onChange',[valueText]);}trigger('onValidated',[]);}}function calc(t,val,dir,anim,orig){val=constrain(val,min,max);var cell=$('.dw-li',t).eq(val),o=orig===undefined?val:orig,active=orig!==undefined,idx=index,dist=Math.abs(val-o),time=anim?val==o?0.1:dist*s.timeUnit*Math.max(0.5,(100-dist)/100):0;// Set selected scroller value
that.temp[idx]=cell.attr('data-val');scroll(t,idx,val,time,active);setTimeout(function(){// Validate
scrollToPos(time,idx,true,dir,active);},10);}function plus(t){var val=pos[index]+1;calc(t,val>max?min:val,1,true);}function minus(t){var val=pos[index]-1;calc(t,val<min?max:val,2,true);}function setValue(fill,change,time,noscroll,temp){if(that._isVisible&&!noscroll){scrollToPos(time);}that._valueText=valueText=s.formatResult(that.temp);if(!temp){that.values=that.temp.slice(0);that.val=that._hasValue?valueText:null;}if(fill){trigger('onValueFill',[that._hasValue?valueText:'',change]);if(that._isInput){$elm.val(that._hasValue?valueText:'');if(change){that._preventChange=true;$elm.change();}}}}// Call the parent constructor
classes.Widget.call(this,el,settings,true);// Public functions
/**
        * Gets the selected wheel values, formats it, and set the value of the scroller instance.
        * If input parameter is true, populates the associated input element.
        * @param {Array} values Wheel values.
        * @param {Boolean} [fill=false] Also set the value of the associated input element.
        * @param {Number} [time=0] Animation time
        * @param {Boolean} [temp=false] If true, then only set the temporary value.(only scroll there but not set the value)
        */that.setValue=function(values,fill,time,temp,change){that._hasValue=values!==null&&values!==undefined;that.temp=$.isArray(values)?values.slice(0):s.parseValue.call(el,values,that);setValue(fill,change===undefined?fill:change,time,false,temp);};/**
        * Return the selected wheel values.
        */that.getValue=function(){return that._hasValue?that.values:null;};/**
        * Return selected values, if in multiselect mode.
        */that.getValues=function(){var ret=[],i;for(i in that._selectedValues){ret.push(that._selectedValues[i]);}return ret;};/**
        * Changes the values of a wheel, and scrolls to the correct position
        * @param {Array} idx Indexes of the wheels to change.
        * @param {Number} [time=0] Animation time when scrolling to the selected value on the new wheel.
        * @param {Boolean} [manual=false] Indicates that the change was triggered by the user or from code.
        */that.changeWheel=function(idx,time,manual){if($markup){var i=0,nr=idx.length;$.each(s.wheels,function(j,wg){$.each(wg,function(k,w){if($.inArray(i,idx)>-1){wheels[i]=w;$('.dw-ul',$markup).eq(i).html(generateWheelItems(i));nr--;if(!nr){that.position();scrollToPos(time,undefined,manual);return false;}}i++;});if(!nr){return false;}});}};/**
        * Returns the closest valid cell.
        */that.getValidCell=getValid;// Protected overrides
that._generateContent=function(){var lbl,html='',l=0;$.each(s.wheels,function(i,wg){// Wheel groups
html+='<div class="mbsc-w-p dwc'+(s.mode!='scroller'?' dwpm':' dwsc')+(s.showLabel?'':' dwhl')+'">'+'<div class="dwwc"'+(s.maxWidth?'':' style="max-width:600px;"')+'>'+(hasFlex?'':'<table class="dw-tbl" cellpadding="0" cellspacing="0"><tr>');$.each(wg,function(j,w){// Wheels
wheels[l]=w;lbl=w.label!==undefined?w.label:j;html+='<'+(hasFlex?'div':'td')+' class="dwfl"'+' style="'+(s.fixedWidth?'width:'+(s.fixedWidth[l]||s.fixedWidth)+'px;':(s.minWidth?'min-width:'+(s.minWidth[l]||s.minWidth)+'px;':'min-width:'+s.width+'px;')+(s.maxWidth?'max-width:'+(s.maxWidth[l]||s.maxWidth)+'px;':''))+'">'+'<div class="dwwl dwwl'+l+(w.multiple?' dwwms':'')+'">'+(s.mode!='scroller'?'<div class="dwb-e dwwb dwwbp '+(s.btnPlusClass||'')+'" style="height:'+itemHeight+'px;line-height:'+itemHeight+'px;"><span>+</span></div>'+// + button
'<div class="dwb-e dwwb dwwbm '+(s.btnMinusClass||'')+'" style="height:'+itemHeight+'px;line-height:'+itemHeight+'px;"><span>&ndash;</span></div>':'')+// - button
'<div class="dwl">'+lbl+'</div>'+// Wheel label
'<div tabindex="0" aria-live="off" aria-label="'+lbl+'" role="listbox" class="dwww">'+'<div class="dww" style="height:'+s.rows*itemHeight+'px;">'+'<div class="dw-ul" style="margin-top:'+(w.multiple?0:s.rows/2*itemHeight-itemHeight/2)+'px;">';// Create wheel values
html+=generateWheelItems(l)+'</div></div><div class="dwwo"></div></div><div class="dwwol"'+(s.selectedLineHeight?' style="height:'+itemHeight+'px;margin-top:-'+(itemHeight/2+(s.selectedLineBorder||0))+'px;"':'')+'></div></div>'+(hasFlex?'</div>':'</td>');l++;});html+=(hasFlex?'':'</tr></table>')+'</div></div>';});return html;};that._attachEvents=function($markup){$markup.on('DOMMouseScroll mousewheel','.dwwl',onScroll).on('keydown','.dwwl',onKeyDown).on('keyup','.dwwl',onKeyUp).on('touchstart mousedown','.dwwl',onStart).on('touchmove','.dwwl',onMove).on('touchend','.dwwl',onEnd).on('touchstart mousedown','.dwb-e',onBtnStart).on('touchend','.dwb-e',onBtnEnd);};that._markupReady=function(){$markup=that._markup;scrollToPos();};that._fillValue=function(){that._hasValue=true;setValue(true,true,0,true);};that._readValue=function(){var v=$elm.val()||'';that._hasValue=v!=='';that.temp=that.values?that.values.slice(0):s.parseValue(v,that);setValue();};that._processSettings=function(){s=that.settings;trigger=that.trigger;itemHeight=s.height;lines=s.multiline;that._isLiquid=(s.layout||(/top|bottom/.test(s.display)&&s.wheels.length==1?'liquid':''))==='liquid';that.values=null;that.temp=null;if(lines>1){s.cssClass=(s.cssClass||'')+' dw-ml';}};// Properties
that._selectedValues={};// Constructor
if(!inherit){instances[el.id]=that;that.init(settings);}};// Extend defaults
classes.Scroller.prototype._class='scroller';classes.Scroller.prototype._defaults=$.extend({},classes.Widget.prototype._defaults,{// Options
minWidth:80,height:40,rows:3,multiline:1,delay:300,readonly:false,showLabel:true,wheels:[],mode:'scroller',preset:'',speedUnit:0.0012,timeUnit:0.08,formatResult:function formatResult(d){return d.join(' ');},parseValue:function parseValue(value,inst){var val=value.split(' '),ret=[],i=0,keys;$.each(inst.settings.wheels,function(j,wg){$.each(wg,function(k,w){// @deprecated since 2.6.0, backward compatibility code
// ---
w=w.values?w:convert(w);// ---
keys=w.keys||w.values;if($.inArray(val[i],keys)!==-1){ret.push(val[i]);}else{ret.push(keys[0]);}i++;});});return ret;}});})(jQuery,window,document);(function($,undefined){var ms=$.mobiscroll,datetime=ms.datetime,date=new Date(),defaults={startYear:date.getFullYear()-100,endYear:date.getFullYear()+1,showNow:false,stepHour:1,stepMinute:1,stepSecond:1,separator:' ',// Localization
dateFormat:'mm/dd/yy',dateOrder:'mmddy',timeWheels:'hhiiA',timeFormat:'hh:ii A',dayText:'Day',yearText:'Year',hourText:'Hours',minuteText:'Minutes',ampmText:'&nbsp;',secText:'Seconds',nowText:'Now'},/**
         * @class Mobiscroll.datetime
         * @extends Mobiscroll
         * Mobiscroll Datetime component
         */preset=function preset(inst){var that=$(this),html5def={},format;// Force format for html5 date inputs (experimental)
if(that.is('input')){switch(that.attr('type')){case'date':format='yy-mm-dd';break;case'datetime':format='yy-mm-ddTHH:ii:ssZ';break;case'datetime-local':format='yy-mm-ddTHH:ii:ss';break;case'month':format='yy-mm';html5def.dateOrder='mmyy';break;case'time':format='HH:ii:ss';break;}// Check for min/max attributes
var min=that.attr('min'),max=that.attr('max');if(min){html5def.minDate=datetime.parseDate(format,min);}if(max){html5def.maxDate=datetime.parseDate(format,max);}}// Set year-month-day order
var i,k,keys,values,wg,start,end,hasTime,mins,maxs,orig=$.extend({},inst.settings),s=$.extend(inst.settings,ms.datetime.defaults,defaults,html5def,orig),offset=0,validValues=[],wheels=[],ord=[],o={},f={y:getYear,m:getMonth,d:getDay,h:getHour,i:getMinute,s:getSecond,a:getAmPm},invalid=s.invalid,valid=s.valid,p=s.preset,dord=s.dateOrder,tord=s.timeWheels,regen=dord.match(/D/),ampm=tord.match(/a/i),hampm=tord.match(/h/),hformat=p=='datetime'?s.dateFormat+s.separator+s.timeFormat:p=='time'?s.timeFormat:s.dateFormat,defd=new Date(),stepH=s.stepHour,stepM=s.stepMinute,stepS=s.stepSecond,mind=s.minDate||new Date(s.startYear,0,1),maxd=s.maxDate||new Date(s.endYear,11,31,23,59,59),minH=mind.getHours()%stepH,minM=mind.getMinutes()%stepM,minS=mind.getSeconds()%stepS,maxH=getMax(stepH,minH,hampm?11:23),maxM=getMax(stepM,minM,59),maxS=getMax(stepM,minM,59);format=format||hformat;if(p.match(/date/i)){// Determine the order of year, month, day wheels
$.each(['y','m','d'],function(j,v){i=dord.search(new RegExp(v,'i'));if(i>-1){ord.push({o:i,v:v});}});ord.sort(function(a,b){return a.o>b.o?1:-1;});$.each(ord,function(i,v){o[v.v]=i;});wg=[];for(k=0;k<3;k++){if(k==o.y){offset++;values=[];keys=[];start=s.getYear(mind);end=s.getYear(maxd);for(i=start;i<=end;i++){keys.push(i);values.push((dord.match(/yy/i)?i:(i+'').substr(2,2))+(s.yearSuffix||''));}addWheel(wg,keys,values,s.yearText);}else if(k==o.m){offset++;values=[];keys=[];for(i=0;i<12;i++){var str=dord.replace(/[dy]/gi,'').replace(/mm/,(i<9?'0'+(i+1):i+1)+(s.monthSuffix||'')).replace(/m/,i+1+(s.monthSuffix||''));keys.push(i);values.push(str.match(/MM/)?str.replace(/MM/,'<span class="dw-mon">'+s.monthNames[i]+'</span>'):str.replace(/M/,'<span class="dw-mon">'+s.monthNamesShort[i]+'</span>'));}addWheel(wg,keys,values,s.monthText);}else if(k==o.d){offset++;values=[];keys=[];for(i=1;i<32;i++){keys.push(i);values.push((dord.match(/dd/i)&&i<10?'0'+i:i)+(s.daySuffix||''));}addWheel(wg,keys,values,s.dayText);}}wheels.push(wg);}if(p.match(/time/i)){hasTime=true;// Determine the order of hours, minutes, seconds wheels
ord=[];$.each(['h','i','s','a'],function(i,v){i=tord.search(new RegExp(v,'i'));if(i>-1){ord.push({o:i,v:v});}});ord.sort(function(a,b){return a.o>b.o?1:-1;});$.each(ord,function(i,v){o[v.v]=offset+i;});wg=[];for(k=offset;k<offset+4;k++){if(k==o.h){offset++;values=[];keys=[];for(i=minH;i<(hampm?12:24);i+=stepH){keys.push(i);values.push(hampm&&i===0?12:tord.match(/hh/i)&&i<10?'0'+i:i);}addWheel(wg,keys,values,s.hourText);}else if(k==o.i){offset++;values=[];keys=[];for(i=minM;i<60;i+=stepM){keys.push(i);values.push(tord.match(/ii/)&&i<10?'0'+i:i);}addWheel(wg,keys,values,s.minuteText);}else if(k==o.s){offset++;values=[];keys=[];for(i=minS;i<60;i+=stepS){keys.push(i);values.push(tord.match(/ss/)&&i<10?'0'+i:i);}addWheel(wg,keys,values,s.secText);}else if(k==o.a){offset++;var upper=tord.match(/A/);addWheel(wg,[0,1],upper?[s.amText.toUpperCase(),s.pmText.toUpperCase()]:[s.amText,s.pmText],s.ampmText);}}wheels.push(wg);}function get(d,i,def){if(o[i]!==undefined){return+d[o[i]];}if(def!==undefined){return def;}return f[i](defd);}function addWheel(wg,k,v,lbl){wg.push({values:v,keys:k,label:lbl});}function step(v,st,min,max){return Math.min(max,Math.floor(v/st)*st+min);}function getYear(d){return s.getYear(d);}function getMonth(d){return s.getMonth(d);}function getDay(d){return s.getDay(d);}function getHour(d){var hour=d.getHours();hour=hampm&&hour>=12?hour-12:hour;return step(hour,stepH,minH,maxH);}function getMinute(d){return step(d.getMinutes(),stepM,minM,maxM);}function getSecond(d){return step(d.getSeconds(),stepS,minS,maxS);}function getAmPm(d){return ampm&&d.getHours()>11?1:0;}function getDate(d){if(d===null){return d;}var hour=get(d,'h',0);return s.getDate(get(d,'y'),get(d,'m'),get(d,'d'),get(d,'a',0)?hour+12:hour,get(d,'i',0),get(d,'s',0));}function getMax(step,min,max){return Math.floor((max-min)/step)*step+min;}function getClosestValidDate(d,dir){var next,prev,nextValid=false,prevValid=false,up=0,down=0;if(isValid(d)){return d;}if(d<mind){d=mind;}if(d>maxd){d=maxd;}next=d;prev=d;if(dir!==2){nextValid=isValid(next);while(!nextValid&&next<maxd){next=new Date(next.getTime()+1000*60*60*24);nextValid=isValid(next);up++;}}if(dir!==1){prevValid=isValid(prev);while(!prevValid&&prev>mind){prev=new Date(prev.getTime()-1000*60*60*24);prevValid=isValid(prev);down++;}}if(dir===1&&nextValid){return next;}if(dir===2&&prevValid){return prev;}return down<up&&prevValid?prev:next;}function isValid(d){if(d<mind){return false;}if(d>maxd){return false;}if(isInObj(d,valid)){return true;}if(isInObj(d,invalid)){return false;}return true;}function isInObj(d,obj){var curr,j,v;if(obj){for(j=0;j<obj.length;j++){curr=obj[j];v=curr+'';if(!curr.start){if(curr.getTime){// Exact date
if(d.getFullYear()==curr.getFullYear()&&d.getMonth()==curr.getMonth()&&d.getDate()==curr.getDate()){return true;}}else if(!v.match(/w/i)){// Day of month
v=v.split('/');if(v[1]){if(v[0]-1==d.getMonth()&&v[1]==d.getDate()){return true;}}else if(v[0]==d.getDate()){return true;}}else{// Day of week
v=+v.replace('w','');if(v==d.getDay()){return true;}}}}}return false;}function validateDates(obj,y,m,first,maxdays,idx,val){var j,d,v;if(obj){for(j=0;j<obj.length;j++){d=obj[j];v=d+'';if(!d.start){if(d.getTime){// Exact date
if(s.getYear(d)==y&&s.getMonth(d)==m){idx[s.getDay(d)-1]=val;}}else if(!v.match(/w/i)){// Day of month
v=v.split('/');if(v[1]){if(v[0]-1==m){idx[v[1]-1]=val;}}else{idx[v[0]-1]=val;}}else{// Day of week
v=+v.replace('w','');for(k=v-first;k<maxdays;k+=7){if(k>=0){idx[k]=val;}}}}}}}function validateTimes(vobj,i,v,temp,y,m,d,target,valid){var dd,ss,str,parts1,parts2,prop1,prop2,v1,v2,j,i1,i2,add,remove,all,hours1,hours2,hours3,spec={},steps={h:stepH,i:stepM,s:stepS,a:1},day=s.getDate(y,m,d),w=['a','h','i','s'];if(vobj){$.each(vobj,function(i,obj){if(obj.start){obj.apply=false;dd=obj.d;ss=dd+'';str=ss.split('/');if(dd&&(dd.getTime&&y==s.getYear(dd)&&m==s.getMonth(dd)&&d==s.getDay(dd)||// Exact date
!ss.match(/w/i)&&(str[1]&&d==str[1]&&m==str[0]-1||!str[1]&&d==str[0])||// Day of month
ss.match(/w/i)&&day.getDay()==+ss.replace('w','')// Day of week
)){obj.apply=true;spec[day]=true;// Prevent applying generic rule on day, if specific exists
}}});$.each(vobj,function(x,obj){add=0;remove=0;i1=0;i2=undefined;prop1=true;prop2=true;all=false;if(obj.start&&(obj.apply||!obj.d&&!spec[day])){// Define time parts
parts1=obj.start.split(':');parts2=obj.end.split(':');for(j=0;j<3;j++){if(parts1[j]===undefined){parts1[j]=0;}if(parts2[j]===undefined){parts2[j]=59;}parts1[j]=+parts1[j];parts2[j]=+parts2[j];}parts1.unshift(parts1[0]>11?1:0);parts2.unshift(parts2[0]>11?1:0);if(hampm){if(parts1[1]>=12){parts1[1]=parts1[1]-12;}if(parts2[1]>=12){parts2[1]=parts2[1]-12;}}// Look behind
for(j=0;j<i;j++){if(validValues[j]!==undefined){v1=step(parts1[j],steps[w[j]],mins[w[j]],maxs[w[j]]);v2=step(parts2[j],steps[w[j]],mins[w[j]],maxs[w[j]]);hours1=0;hours2=0;hours3=0;if(hampm&&j==1){hours1=parts1[0]?12:0;hours2=parts2[0]?12:0;hours3=validValues[0]?12:0;}if(!prop1){v1=0;}if(!prop2){v2=maxs[w[j]];}if((prop1||prop2)&&v1+hours1<validValues[j]+hours3&&validValues[j]+hours3<v2+hours2){all=true;}if(validValues[j]!=v1){prop1=false;}if(validValues[j]!=v2){prop2=false;}}}// Look ahead
if(!valid){for(j=i+1;j<4;j++){if(parts1[j]>0){add=steps[v];}if(parts2[j]<maxs[w[j]]){remove=steps[v];}}}if(!all){// Calculate min and max values
v1=step(parts1[i],steps[v],mins[v],maxs[v])+add;v2=step(parts2[i],steps[v],mins[v],maxs[v])-remove;if(prop1){i1=getValidIndex(target,v1,maxs[v],0);}if(prop2){i2=getValidIndex(target,v2,maxs[v],1);}}// Disable values
if(prop1||prop2||all){if(valid){$('.dw-li',target).slice(i1,i2).addClass('dw-v');}else{$('.dw-li',target).slice(i1,i2).removeClass('dw-v');}}}});}}function getIndex(t,v){return $('.dw-li',t).index($('.dw-li[data-val="'+v+'"]',t));}function getValidIndex(t,v,max,add){if(v<0){return 0;}if(v>max){return $('.dw-li',t).length;}return getIndex(t,v)+add;}function getArray(d){var i,ret=[];if(d===null||d===undefined){return d;}for(i in o){ret[o[i]]=f[i](d);}return ret;}function convertRanges(arr){var i,v,start,ret=[];if(arr){for(i=0;i<arr.length;i++){v=arr[i];if(v.start&&v.start.getTime){start=new Date(v.start);while(start<=v.end){ret.push(new Date(start.getFullYear(),start.getMonth(),start.getDate()));start.setDate(start.getDate()+1);}}else{ret.push(v);}}return ret;}return arr;}// Extended methods
// ---
/**
             * Sets the selected date
             *
             * @param {Date} d Date to select.
             * @param {Boolean} [fill=false] Also set the value of the associated input element. Default is true.
             * @param {Number} [time=0] Animation time to scroll to the selected date.
             * @param {Boolean} [temp=false] Set temporary value only.
             * @param {Boolean} [change=fill] Trigger change on input element.
             */inst.setDate=function(d,fill,time,temp,change){inst.temp=getArray(d);inst.setValue(inst.temp,fill,time,temp,change);};/**
             * Returns the currently selected date.
             *
             * @param {Boolean} [temp=false] If true, return the currently shown date on the picker, otherwise the last selected one.
             * @return {Date}
             */inst.getDate=function(temp){return getDate(temp?inst.temp:inst.values);};/**
             * @deprecated since 2.7.0, backward compatibility code
             */inst.convert=function(obj){var x=obj;if(!$.isArray(obj)){// Convert from old format
x=[];$.each(obj,function(i,o){$.each(o,function(j,o){if(i==='daysOfWeek'){if(o.d){o.d='w'+o.d;}else{o='w'+o;}}x.push(o);});});}return x;};// ---
// Initializations
// --- 
inst.format=hformat;inst.order=o;inst.buttons.now={text:s.nowText,css:'dwb-n',handler:function handler(){inst.setDate(new Date(),false,0.3,true,true);}};// @deprecated since 2.8.0, backward compatibility code
// ---
if(s.showNow){s.buttons.splice($.inArray('set',s.buttons)+1,0,'now');}invalid=invalid?inst.convert(invalid):false;// ---
invalid=convertRanges(invalid);valid=convertRanges(valid);// Normalize min and max dates for comparing later (set default values where there are no values from wheels)
mind=getDate(getArray(mind));maxd=getDate(getArray(maxd));mins={y:mind.getFullYear(),m:0,d:1,h:minH,i:minM,s:minS,a:0};maxs={y:maxd.getFullYear(),m:11,d:31,h:maxH,i:maxM,s:maxS,a:1};// ---
return{wheels:wheels,headerText:s.headerText?function(){return datetime.formatDate(hformat,getDate(inst.temp),s);}:false,formatResult:function formatResult(d){return datetime.formatDate(format,getDate(d),s);},parseValue:function parseValue(val){return getArray(val?datetime.parseDate(format,val,s):s.defaultValue||new Date());},validate:function validate(dw,i,time,dir){var validated=getClosestValidDate(getDate(inst.temp),dir),temp=getArray(validated),//inst.temp,//.slice(0),
y=get(temp,'y'),m=get(temp,'m'),minprop=true,maxprop=true;$.each(['y','m','d','a','h','i','s'],function(x,i){if(o[i]!==undefined){var min=mins[i],max=maxs[i],maxdays=31,val=get(temp,i),t=$('.dw-ul',dw).eq(o[i]);if(i=='d'){maxdays=s.getMaxDayOfMonth(y,m);max=maxdays;if(regen){$('.dw-li',t).each(function(){var that=$(this),d=that.data('val'),w=s.getDate(y,m,d).getDay(),str=dord.replace(/[my]/gi,'').replace(/dd/,(d<10?'0'+d:d)+(s.daySuffix||'')).replace(/d/,d+(s.daySuffix||''));$('.dw-i',that).html(str.match(/DD/)?str.replace(/DD/,'<span class="dw-day">'+s.dayNames[w]+'</span>'):str.replace(/D/,'<span class="dw-day">'+s.dayNamesShort[w]+'</span>'));});}}if(minprop&&mind){min=f[i](mind);}if(maxprop&&maxd){max=f[i](maxd);}if(i!='y'){var i1=getIndex(t,min),i2=getIndex(t,max);$('.dw-li',t).removeClass('dw-v').slice(i1,i2+1).addClass('dw-v');if(i=='d'){// Hide days not in month
$('.dw-li',t).removeClass('dw-h').slice(maxdays).addClass('dw-h');}}if(val<min){val=min;}if(val>max){val=max;}if(minprop){minprop=val==min;}if(maxprop){maxprop=val==max;}// Disable some days
if(i=='d'){var first=s.getDate(y,m,1).getDay(),idx={};// Set invalid indexes
validateDates(invalid,y,m,first,maxdays,idx,1);// Delete indexes which are valid 
validateDates(valid,y,m,first,maxdays,idx,0);$.each(idx,function(i,v){if(v){$('.dw-li',t).eq(i).removeClass('dw-v');}});}}});// Invalid times
if(hasTime){$.each(['a','h','i','s'],function(i,v){var val=get(temp,v),d=get(temp,'d'),t=$('.dw-ul',dw).eq(o[v]);if(o[v]!==undefined){validateTimes(invalid,i,v,temp,y,m,d,t,0);validateTimes(valid,i,v,temp,y,m,d,t,1);// Get valid value
validValues[i]=+inst.getValidCell(val,t,dir).val;}});}inst.temp=temp;}};};$.each(['date','time','datetime'],function(i,v){ms.presets.scroller[v]=preset;ms.presetShort(v);});})(jQuery);(function($,undefined){var defaults={inputClass:'',invalid:[],rtl:false,showInput:true,group:false,groupLabel:'Groups',checkIcon:'checkmark'};$.mobiscroll.presetShort('select');$.mobiscroll.presets.scroller.select=function(inst){var change,grIdx,gr,group,input,optIdx,option,prev,prevent,timer,w,orig=$.extend({},inst.settings),s=$.extend(inst.settings,defaults,orig),layout=s.layout||(/top|bottom/.test(s.display)?'liquid':''),isLiquid=layout=='liquid',elm=$(this),multiple=elm.prop('multiple'),id=this.id+'_dummy',lbl=$('label[for="'+this.id+'"]').attr('for',id),label=s.label!==undefined?s.label:lbl.length?lbl.text():elm.attr('name'),selectedClass='dw-msel mbsc-ic mbsc-ic-'+s.checkIcon,groupHdr=$('optgroup',elm).length&&!s.group,invalid=[],origValues=[],main={},roPre=s.readonly;function genValues(cont,keys,values){$('option',cont).each(function(){values.push(this.text);keys.push(this.value);if(this.disabled){invalid.push(this.value);}});}function genWheels(){var cont,wheel,wg=0,values=[],keys=[],w=[[]];if(s.group){$('optgroup',elm).each(function(i){values.push(this.label);keys.push(i);});wheel={values:values,keys:keys,label:s.groupLabel};if(isLiquid){w[0][wg]=wheel;}else{w[wg]=[wheel];}cont=group;wg++;}else{cont=elm;}values=[];keys=[];if(groupHdr){$('optgroup',elm).each(function(i){values.push(this.label);keys.push('__group'+i);invalid.push('__group'+i);genValues(this,keys,values);});}else{genValues(cont,keys,values);}wheel={multiple:multiple,values:values,keys:keys,label:label};if(isLiquid){w[0][wg]=wheel;}else{w[wg]=[wheel];}return w;}function getOption(v){var def=$('option',elm).attr('value');option=multiple?v?v[0]:def:v===undefined||v===null?def:v;if(s.group){group=elm.find('option[value="'+option+'"]').parent();gr=group.index();//prev = gr;
}}function setVal(v,fill,change){var value=[];if(multiple){var sel=[],i=0;for(i in inst._selectedValues){sel.push(main[i]);value.push(i);}input.val(sel.join(', '));}else{input.val(v);value=fill?inst.temp[optIdx]:null;}if(fill){elm.val(value);if(change){prevent=true;elm.change();}}}function onTap(li){var val=li.attr('data-val'),selected=li.hasClass('dw-msel');if(multiple&&li.closest('.dwwl').hasClass('dwwms')){if(li.hasClass('dw-v')){if(selected){li.removeClass(selectedClass).removeAttr('aria-selected');delete inst._selectedValues[val];}else{li.addClass(selectedClass).attr('aria-selected','true');inst._selectedValues[val]=val;}if(inst.live){setVal(val,true,true);}}return false;}}// If groups is true and there are no groups fall back to no grouping
if(s.group&&!$('optgroup',elm).length){s.group=false;}if(!s.invalid.length){s.invalid=invalid;}if(s.group){grIdx=0;optIdx=1;}else{grIdx=-1;optIdx=0;}$('option',elm).each(function(){main[this.value]=this.text;});getOption(elm.val());$('#'+id).remove();input=$('<input type="text" id="'+id+'" class="'+s.inputClass+'" placeholder="'+(s.placeholder||'')+'" readonly />');if(s.showInput){input.insertBefore(elm);}inst.attachShow(input);var v=elm.val()||[],i=0;for(i;i<v.length;i++){inst._selectedValues[v[i]]=v[i];}setVal(main[option]);elm.off('.dwsel').on('change.dwsel',function(){if(!prevent){inst.setValue(multiple?elm.val()||[]:[elm.val()],true);}prevent=false;}).addClass('dw-hsel').attr('tabindex',-1).closest('.ui-field-contain').trigger('create');// Extended methods
// ---
if(!inst._setValue){inst._setValue=inst.setValue;}inst.setValue=function(d,fill,time,temp,change){var i,value,v=$.isArray(d)?d[0]:d;option=v!==undefined&&v!==null?v:$('option',elm).attr('value');if(multiple){inst._selectedValues={};if(d){// Can be null
for(i=0;i<d.length;i++){inst._selectedValues[d[i]]=d[i];}}}if(v===null){value=null;}else if(s.group){group=elm.find('option[value="'+option+'"]').parent();gr=group.index();value=[gr,option];}else{value=[option];}inst._setValue(value,fill,time,temp,change);// Set input/select values
if(fill){var changed=multiple?true:option!==elm.val();setVal(main[option],changed,change===undefined?fill:change);}};inst.getValue=function(temp,group){var val=temp?inst.temp:inst._hasValue?inst.values:null;return val?s.group&&group?val:val[optIdx]:null;};// ---
return{width:50,wheels:w,layout:layout,headerText:false,anchor:input,formatResult:function formatResult(d){return main[d[optIdx]];},parseValue:function parseValue(val){var v=elm.val()||[],i=0;if(multiple){inst._selectedValues={};for(i;i<v.length;i++){inst._selectedValues[v[i]]=v[i];}}getOption(val===undefined?elm.val():val);return s.group?[gr,option]:[option];},onBeforeShow:function onBeforeShow(){if(multiple&&s.counter){s.headerText=function(){var length=0;$.each(inst._selectedValues,function(){length++;});return length+' '+s.selectedText;};}//if (option === undefined) {
getOption(elm.val());//}
if(s.group){prev=gr;inst.temp=[gr,option];}s.wheels=genWheels();},onMarkupReady:function onMarkupReady(dw){dw.addClass('dw-select');$('.dwwl'+grIdx,dw).on('mousedown touchstart',function(){clearTimeout(timer);});if(groupHdr){$('.dw',dw).addClass('dw-select-gr');$('.dw-li[data-val^="__group"]',dw).addClass('dw-w-gr');}if(multiple){dw.addClass('dwms');$('.dwwl',dw).on('keydown',function(e){if(e.keyCode==32){// Space
e.preventDefault();e.stopPropagation();onTap($('.dw-sel',this));}}).eq(optIdx).addClass('dwwms').attr('aria-multiselectable','true');origValues=$.extend({},inst._selectedValues);}},validate:function validate(dw,i,time){var j,v,t=$('.dw-ul',dw).eq(optIdx);if(i===undefined&&multiple){v=inst._selectedValues;j=0;$('.dwwl'+optIdx+' .dw-li',dw).removeClass(selectedClass).removeAttr('aria-selected');for(j in v){$('.dwwl'+optIdx+' .dw-li[data-val="'+v[j]+'"]',dw).addClass(selectedClass).attr('aria-selected','true');}}if(s.group&&(i===undefined||i===grIdx)){gr=+inst.temp[grIdx];if(gr!==prev){group=elm.find('optgroup').eq(gr);option=group.find('option').not('[disabled]').eq(0).val();option=option||elm.val();s.wheels=genWheels();if(!change){inst.temp=[gr,option];s.readonly=[false,true];clearTimeout(timer);timer=setTimeout(function(){change=true;prev=gr;inst.changeWheel([optIdx],undefined,true);s.readonly=roPre;},time*1000);return false;}}else{s.readonly=roPre;}}else{option=inst.temp[optIdx];}$.each(s.invalid,function(i,v){$('.dw-li[data-val="'+v+'"]',t).removeClass('dw-v');});change=false;},onClear:function onClear(dw){inst._selectedValues={};input.val('');$('.dwwl'+optIdx+' .dw-li',dw).removeClass(selectedClass).removeAttr('aria-selected');},onValueTap:onTap,onSelect:function onSelect(v){setVal(v,true,true);},onCancel:function onCancel(){if(!inst.live&&multiple){inst._selectedValues=$.extend({},origValues);}},onChange:function onChange(v){if(inst.live&&!multiple){input.val(v);prevent=true;elm.val(inst.temp[optIdx]).change();}},onDestroy:function onDestroy(){input.remove();elm.removeClass('dw-hsel').removeAttr('tabindex');}};};})(jQuery);