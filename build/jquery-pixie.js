// copyright 2016 pixie-grasper
// License: MIT

(function($) {
  const to_pixie = function(element) {
    if (typeof element === 'string') {
      element = $(element);
    }
    if (element.length == 0) {
      $.error('bad selector (selected no elements).');
    } else if (element.length > 1) {
      $.error('bad selector (selected two or more elements).');
    }
    if (element[0].as_pixie) {
      return element[0].as_pixie;
    }
    let ret = {
      $: element,
      kind_of: {},
    };
    element[0].as_pixie = ret;
    return ret;
  };

  const as_pixie = function(element) {
    if (element.length == 0) {
      $.error('bad selector (selected no elements).');
    } else if (element.length > 1) {
      $.error('bad selector (selected two or more elements).');
    }
    return element[0].as_pixie;
  };

  const plugins = {
    paned: (function() {
      // jQuery Plugin: pixie::paned

      const default_options = {
        border: 5,
        pos: '50%',
        pos_min: '10%',
        pos_max: '90% - 5',
        color: 'lightgray',
      };

      const detach_children = function(children) {
        for (let i = 0; i < children.length; i++) {
          children[i].$.detach();
        }
      };

      const pos_normalize = function(options, length) {
        if (typeof options.pos === 'string' && options.pos.match(/%/)) {
          options.true_pos = eval(
            options.pos.replace(/%/, ' / 100 * ' + length)
          );
        } else {
          options.true_pos = options.pos;
        }
        if (typeof options.pos_min === 'string' && options.pos_min.match(/%/)) {
          options.true_pos_min = eval(
            options.pos_min.replace(/%/, ' / 100 * ' + length)
          );
        } else {
          options.true_pos_min = options.pos_min;
        }
        if (typeof options.pos_max === 'string' && options.pos_max.match(/%/)) {
          options.true_pos_max = eval(
            options.pos_max.replace(/%/, ' / 100 * ' + length)
          );
        } else {
          options.true_pos_max = options.pos_max;
        }
      };

      const create_box = function($) {
        return {
          width: $.width(),
          height: $.height(),
        };
      };

      const paned_init = function() {
        this.bar = {
          $: $('<div></div>').css({
            backgroundColor: this.options.color,
            position: 'absolute',
          }),
        };
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].$.css({
            position: 'absolute',
          });
        }
      };

      const vpaned_resize = function() {
        const height = this.$.height();
        this.bar.$.css({
          cursor: 'col-resize',
          width: this.options.border,
          height: height,
        });
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].$.css({
            height: height,
          });
        }
      };

      const vpaned_init = function() {
        vpaned_resize.call(this);
        let dragging = false;
        const this_ = this;
        this.bar.$.mousedown(function(event) {
          this_.drag_start_pos_x = event.clientX;
          this_.options_pos_init = this_.options.true_pos;
          dragging = true;
          $('body').css({
            cursor: 'col-resize',
          });
        });
        $(document).mousemove(function(event) {
          if (dragging) {
            const delta = event.clientX - this_.drag_start_pos_x;
            this_.options.true_pos = this_.options_pos_init + delta;
            if (this_.options.true_pos < this_.options.true_pos_min) {
              this_.options.true_pos = this_.options.true_pos_min;
            } else if (this_.options.true_pos > this_.options.true_pos_max) {
              this_.options.true_pos = this_.options.true_pos_max;
            }
            this_.$.pixie('emit', 'resize');
          }
        }).mouseup(function(event) {
          dragging = false;
          $('body').css({
            cursor: '',
          });
        });
      };

      const vpaned = {
        initialized: false,
        show: function() {
          const box = create_box(this.$);
          if (!this.initialized) {
            paned_init.call(this);
            vpaned_init.call(this);
            detach_children(this.children);
            pos_normalize(this.options, box.width);
            this.children[0].$.appendTo(this.$);
            this.bar.$.appendTo(this.$);
            this.children[1].$.appendTo(this.$);
            this.initialized = true;
          }
          this.children[0].$.css({
            width: this.options.true_pos,
          });
          this.children[1].$.css({
            left: this.options.true_pos + this.options.border,
            width: box.width - this.options.true_pos - this.options.border,
          });
          this.bar.$.css({
            left: this.options.true_pos,
          });
          return this;
        },
        resize: function() {
          vpaned_resize.call(this);
          this.show();
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].is_pixie) {
              this.children[i].$.pixie('emit', 'resize');
            }
          }
          return this;
        },
      };

      const hpaned_resize = function() {
        const width = this.$.width();
        this.bar.$.css({
          cursor: 'row-resize',
          width: width,
          height: this.options.border,
        });
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].$.css({
            width: width,
          });
        }
      };

      const hpaned_init = function() {
        hpaned_resize.call(this);
        let dragging = false;
        const this_ = this;
        this.bar.$.mousedown(function(event) {
          this_.drag_start_pos_y = event.clientY;
          this_.options_pos_init = this_.options.true_pos;
          dragging = true;
          $('body').css({
            cursor: 'row-resize',
          });
        });
        $(document).mousemove(function(event) {
          if (dragging) {
            const delta = event.clientY - this_.drag_start_pos_y;
            this_.options.true_pos = this_.options_pos_init + delta;
            if (this_.options.true_pos < this_.options.true_pos_min) {
              this_.options.true_pos = this_.options.true_pos_min;
            } else if (this_.options.true_pos > this_.options.true_pos_max) {
              this_.options.true_pos = this_.options.true_pos_max;
            }
            this_.show();
          }
        }).mouseup(function(event) {
          dragging = false;
          $('body').css({
            cursor: '',
          });
        });
      };

      const hpaned = {
        show: function() {
          const box = create_box(this.$);
          if (!this.initialized) {
            paned_init.call(this);
            hpaned_init.call(this);
            detach_children(this.children);
            pos_normalize(this.options, box.height);
            this.children[0].$.appendTo(this.$);
            this.bar.$.appendTo(this.$);
            this.children[1].$.appendTo(this.$);
            this.initialized = true;
          }
          this.children[0].$.css({
            height: this.options.true_pos,
          });
          this.children[1].$.css({
            top: this.options.true_pos + this.options.border,
            height: box.height - this.options.true_pos - this.options.border,
          });
          this.bar.$.css({
            top: this.options.true_pos,
          });
          return this;
        },
        resize: function() {
          hpaned_resize.call(this);
          this.show();
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].is_pixie) {
              this.children[i].$.pixie('emit', 'resize');
            }
          }
          return this;
        },
        initialized: false,
      };

      const paned = {
        type_of: 'paned',
        kind_of: {'paned': true},
        initialize: function(options) {
          // /* global plugins */
          let ret = plugins.container.apply(this);
          $.extend(true, ret, paned);
          ret.options = $.extend(true, {}, default_options, options);
          if (ret.options.orientation == 'vertical') {
            $.extend(true, ret, vpaned);
          } else if (ret.options.orientation == 'horizontal') {
            $.extend(true, ret, hpaned);
          } else {
            $.error('bad orientation');
          }
          $(window).resize(function() {
            ret.resize();
          });
          return ret;
        },
        add1: function(element) {
          // /* global to_pixie */
          this.children[0] = to_pixie(element);
          return this;
        },
        add2: function(element) {
          this.children[1] = to_pixie(element);
          return this;
        },
        position: function(pos) {
          this.options.pos = pos;
          return this;
        },
      };

      return function(...args) {
        return paned.initialize.apply(this, args);
      };
    })(),
    container: (function() {
      // jQuery Plugin: pixie::container

      const container = {
        is_pixie: true,
        type_of: 'container',
        kind_of: {'container': true},
        initialize: function() {
          // /* global to_pixie */
          let ret = to_pixie(this);
          $.extend(true, ret, container);
          return ret;
        },
        signal_showAll: function() {
          this.show();
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].$.pixie('emit', 'showAll');
          }
          return this;
        },
        signal_resize: function() {
          this.resize();
          return this;
        },
        children: [],
      };

      return function(...args) {
        return container.initialize.apply(this, args);
      };
    })(),
    emit: (function() {
      // jQuery Plugin: pixie::emit

      const handler = {
        showAll: function() {
          // /* global as_pixie */
          const pixie = as_pixie(this);
          if (pixie.kind_of['container']) {
            pixie.signal_showAll();
          }
          return this;
        },
        resize: function() {
          const pixie = as_pixie(this);
          if (pixie.kind_of['container']) {
            pixie.signal_resize();
          }
          return this;
        },
      };

      const emit = {
        initialize: function(signal, ...args) {
          if (handler[signal]) {
            handler[signal].apply(this, args);
          } else {
            $.error('Signal named ' + signal + ' not found.');
          }
          return this;
        },
      };

      return function(...args) {
        return emit.initialize.apply(this, args);
      };
    })(),
    atlas: (function() {
      // jQuery Plugin: pixie::atlas

      const default_options = {
        overlap_elements: function(width, height) {
          return [];
        },
        update_overlaps: function(x, y, scale) {
        },
        initial: {
          scale: undefined,
          center: {
            x: undefined,
            y: undefined,
          },
          left: undefined,
          top: undefined,
          right: undefined,
          bottom: undefined,
        },
      };

      const create_box = function($) {
        return {
          width: $.width(),
          height: $.height(),
        };
      };

      const SVG = function(tagname) {
        const xmlns = 'http://www.w3.org/2000/svg';
        this._ = document.createElementNS(xmlns, tagname);
        this.attr = function(hash) {
          let _ = this._;
          Object.keys(hash).forEach(function(key) {
            _.setAttribute(key, hash[key]);
          });
          return this;
        };
        this.css = function(hash) {
          let _ = this._;
          Object.keys(hash).forEach(function(key) {
            _.style[key] = hash[key];
          });
          return this;
        };
        this.appendTo = function(target) {
          if (target instanceof jQuery) {
            target[0].appendChild(this._);
          } else if (target instanceof SVG) {
            target._.appendChild(this._);
          }
          return this;
        };
        this.append = function(element) {
          if (element instanceof jQuery) {
            this._.appendChild(element[0]);
          } else if (element instanceof SVG) {
            this._.appendChild(element._);
          } else {
            this._.appendChild(element);
          }
          return this;
        };
        this.empty = function() {
          let _ = this._;
          while (_.firstChild) {
            _.removeChild(_.firstChild);
          }
          return this;
        };
      };

      const _ = function(tagname) {
        return new SVG(tagname);
      };

      const wheel_event_name = function() {
        if ('onwheel' in document) {
          return 'wheel';
        } else if ('onmousewheel' in document) {
          return 'mousewheel';
        } else {
          return 'DOMMouseScroll';
        }
      };

      const wheel_direction = function(event) {
        if (event.originalEvent.deltaY) {
          return -event.originalEvent.deltaY;
        } else if (event.originalEvent.wheelDelta) {
          return event.originalEvent.wheelDelta;
        } else {
          return event.originalEvent.detail;
        }
      };

      const count_well_defined = function(...args) {
        let c = 0;
        for (let i = 0; i < args.length; i++) {
          if (typeof args[i] !== 'undefined') {
            c++;
          }
        }
        return c;
      };

      const set_initial_parameters = function() {
        const box = create_box(this.$);
        const initial = this.options.initial;
        const xd = count_well_defined(
          initial.scale,
          initial.left,
          initial.right,
          initial.center.x
        );
        const yd = count_well_defined(
          initial.scale,
          initial.top,
          initial.bottom,
          initial.center.y
        );
        if (xd > 2 || yd > 2) {
          $.error('too many initial parameter detected.');
        } else if (xd == 2 && yd == 2) {
          if (initial.scale) {
            this.scale = initial.scale;
            if (initial.left) {
              this.x = initial.left;
            } else if (initial.center.x) {
              this.x = initial.center.x - box.width * initial.scale / 2;
            } else {
              this.x = initial.right - box.width * initial.scale;
            }
            if (initial.top) {
              this.y = initial.top - box.height * initial.scale;
            } else if (initial.center.y) {
              this.y = initial.center.y - box.height * initial.scale / 2;
            } else {
              this.y = initial.bottom;
            }
          } else {
            let left;
            let top;
            let right;
            let bottom;
            let center_x;
            let center_y;
            let scale_x;
            let scale_y;
            if (initial.left && initial.right) {
              left = initial.left;
              right = initial.right;
            } else if (initial.left && initial.center.x) {
              left = initial.left;
              right = initial.center.x * 2 - initial.left;
            } else {
              left = initial.center.x * 2 - initial.right;
              right = initial.right;
            }
            scale_x = box.width / (right - left);
            center_x = (left + right) / 2;
            if (initial.top && initial.bottom) {
              top = initial.top;
              bottom = initial.bottom;
            } else if (initial.top && initial.center.y) {
              top = initial.top;
              bottom = initial.center * 2 - initial.top;
            } else {
              top = initial.center * 2 - initial.bottom;
              bottom = initial.bottom;
            }
            scale_y = box.height / (top - bottom);
            center_y = (top + bottom) / 2;
            this.scale = Math.min(scale_x, scale_y);
            const scale_inv = 1 / this.scale;
            this.x = center_x - box.width * scale_inv / 2;
            this.y = center_y - box.height * scale_inv / 2;
          }
        } else if (xd == 1 && yd == 2 && typeof initial.scale === 'undefined') {
          let top;
          let bottom;
          if (initial.top && initial.bottom) {
            top = initial.top;
            bottom = initial.bottom;
          } else if (initial.top && initial.center.y) {
            top = initial.top;
            bottom = initial.center * 2 - initial.top;
          } else {
            top = initial.center * 2 - initial.bottom;
            bottom = initial.bottom;
          }
          this.scale = box.height / (top - bottom);
          if (initial.left) {
            this.x = initial.left;
          } else if (initial.center.x) {
            this.x = initial.center.x - box.width * this.scale / 2;
          } else {
            this.x = initial.right - box.width * this.scale;
          }
        } else if (xd == 2 && yd == 1 && typeof initial.scale === 'undefined') {
          let left;
          let right;
          if (initial.left && initial.right) {
            left = initial.left;
            right = initial.right;
          } else if (initial.left && initial.center.x) {
            left = initial.left;
            right = initial.center.x * 2 - initial.left;
          } else {
            left = initial.center.x * 2 - initial.right;
            right = initial.right;
          }
          this.scale = box.width / (right - left);
          if (initial.top) {
            this.y = initial.top - box.height * this.scale;
          } else if (initial.center.y) {
            this.y = initial.center.y - box.height * this.scale / 2;
          } else {
            this.y = initial.bottom;
          }
        } else if (xd == 0 && yd == 0) {
          this.x = 0;
          this.y = 0;
          this.scale = 1;
        } else {
          $.error('too few initial parameter detected.');
        }
      };

      const atlas_init = function() {
        set_initial_parameters.call(this);
        const box = create_box(this.$);
        this.svg = {
          _: _('svg').attr({
            viewBox: '0 0 ' + box.width + ' ' + box.height,
            xmlns: 'http://www.w3.org/2000/svg',
          }).css({
            position: 'absolute',
            width: box.width,
            height: box.height,
          }),
        };
        this.svg.$ = $(this.svg._._).appendTo(this.$);
        this.overlap_elements = this.options.overlap_elements(box.width, box.height);
        const this_ = this;
        let dragging = false;
        let drag_start_pos_x = null;
        let drag_start_pos_y = null;
        let init_pos_x = null;
        let init_pos_y = null;
        this.svg.$.mousedown(function(event) {
          drag_start_pos_x = event.clientX;
          drag_start_pos_y = event.clientY;
          init_pos_x = this_.x;
          init_pos_y = this_.y;
          dragging = true;
        }).on(wheel_event_name(), function(event) {
          const box = create_box(this_.$);
          const scale = this_.scale;
          const scale_inv = 1 / scale;
          const scale_base = this_.scale_base;
          const scale_base_inv = 1 / scale_base;
          const x = this_.x + event.clientX * scale_inv;
          const y = this_.y + (box.height - event.clientY) * scale_inv;
          if (wheel_direction(event) < 0) {
            this_.scale *= scale_base_inv;
            this_.x = x - (x - this_.x) * scale_base;
            this_.y = y - (y - this_.y) * scale_base;
          } else {
            this_.scale *= scale_base;
            this_.x = x - (x - this_.x) * scale_base_inv;
            this_.y = y - (y - this_.y) * scale_base_inv;
          }
          this_.show();
          this_.options.update_overlaps(x, y, this_.scale);
        });
        $(document).mousemove(function(event) {
          if (dragging) {
            const delta_x = event.clientX - drag_start_pos_x;
            const delta_y = event.clientY - drag_start_pos_y;
            this_.x = init_pos_x - delta_x / this_.scale;
            this_.y = init_pos_y + delta_y / this_.scale;
            this_.show();
          }
          const box = create_box(this_.$);
          const scale = this_.scale;
          const scale_inv = 1 / scale;
          const x = this_.x + event.clientX * scale_inv;
          const y = this_.y + (box.height - event.clientY) * scale_inv;
          this_.options.update_overlaps(x, y, scale);
        }).mouseup(function(event) {
          dragging = false;
        });
      };

      const atlas = {
        is_pixie: true,
        type_of: 'atlas',
        kind_of: {'atlas': true},
        initialize: function(options) {
          // /* global plugins */
          let ret = plugins.container.apply(this);
          $.extend(true, ret, atlas);
          ret.options = $.extend(true, {}, default_options, options);
          $(window).resize(function() {
            ret.resize();
            return true;
          });
          return ret;
        },
        show: function() {
          if (!this.initialized) {
            atlas_init.call(this);
            this.initialized = true;
          }
          const box = create_box(this.$);
          const scale = this.scale;
          const scale_inv = 1 / scale;
          const rendering = [
            this.x,
            this.y,
            this.x + box.width * scale_inv,
            this.y + box.height * scale_inv,
          ];
          let cache_refreshed = false;
          if (this.cached_box_size == null) {
            this.cached_box_size = rendering;
            cache_refreshed = true;
          } else if (rendering[0] < this.cached_box_size[0] ||
                     rendering[1] < this.cached_box_size[1] ||
                     rendering[2] > this.cached_box_size[2] ||
                     rendering[3] > this.cached_box_size[3]) {
            const f = [Math.min, Math.min, Math.max, Math.max];
            for (let i = 0; i < 4; i++) {
              this.cached_box_size[i] = f[i](rendering[i], this.cached_box_size[i]);
            }
            cache_refreshed = true;
          }
          if (cache_refreshed) {
            this.cache_id_list =
              this.options.listup.call(this, ...this.cached_box_size);
            this.g = {
              _: _('g'),
            };
            this.g.$ = $(this.g._._);
            this.g._.appendTo(this.svg._.empty());
            this.cache_SVG_list = [];
            const list = this.cache_id_list;
            for (let i = 0; i < list.length; i++) {
              const item = this.options.fetch.call(this, list[i]);
              switch (item.type) {
                case 'circle': {
                  const svg = {
                    _: _('circle').attr({
                      stroke: item.stroke || '',
                      fill: item.fill || '',
                    }),
                    type: 'circle',
                    cx: item.cx,
                    cy: item.cy,
                    r: item.r,
                  };
                  this.cache_SVG_list[i] = svg;
                  svg._.appendTo(this.g.$);
                  break;
                }
                default: {
                  $.error('unknown type ' + item.type + ' detected.');
                  break;
                }
              }
            }
            for (let i = 0; i < this.overlap_elements.length; i++) {
              this.g._.append(this.overlap_elements[i]);
            }
          }
          const svg_list = this.cache_SVG_list;
          for (let i = 0; i < svg_list.length; i++) {
            switch (svg_list[i].type) {
              case 'circle': {
                svg_list[i]._.attr({
                  cx: (svg_list[i].cx - rendering[0]) * scale,
                  cy: box.height - (svg_list[i].cy - rendering[1]) * scale,
                  r: svg_list[i].r * scale,
                });
                break;
              }
            }
          }
          return this;
        },
        drop_cache: function() {
          this.cached_box_size = null;
          this.cache_id_list = null;
          this.cache_SVG_list = null;
          return this;
        },
        resize: function() {
          const box = create_box(this.$);
          this.svg._.attr({
            viewBox: '0 0 ' + box.width + ' ' + box.height,
          }).css({
            width: box.width,
            height: box.height,
          });
          this.show.call(this);
          return this;
        },
        initialized: false,
        cached_box_size: null,
        scale_base: 1.3,
      };

      return function(...args) {
        return atlas.initialize.apply(this, args);
      };
    })(),
  };

  $.fn.pixie = function(widget_name, ...args) {
    if (plugins[widget_name]) {
      return plugins[widget_name].apply(this, args);
    } else {
      $.error('Widget named ' + widget_name + ' not found.');
    }
  };

  $('.pixie-widget').hide();
})(jQuery);
