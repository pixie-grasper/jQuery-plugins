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
          this.show.call(this);
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
            this_.show.call(this_);
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
          this.show.call(this);
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
