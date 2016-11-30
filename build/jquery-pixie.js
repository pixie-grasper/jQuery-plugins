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
        color: 'lightgray',
      };

      const vpaned = {
        show: function() {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].$.detach();
          }
          this.$.empty();
          const box = {
            left: 0,
            top: 0,
            width: this.$.width(),
            height: this.$.height(),
          };
          if (typeof this.options.pos === 'string' && this.options.pos.match(/%/)) {
            this.options.pos = eval(
              this.options.pos.replace(/%/, ' / 100 * ' + box.width)
            );
          }
          let this_ = this;
          if (this.bar == undefined) {
            this.bar = {
              $: $('<div></div>').css({
                backgroundColor: this.options.color,
                cursor: 'col-resize',
              }),
            };
          }
          this.$.off('mousemove');
          this.bar.$.off('mousedown').off('mouseup');
          this.children[0].$.css({
            left: box.left,
            top: box.top,
            width: this.options.pos,
            height: box.height,
            position: 'absolute',
          });
          this.children[1].$.css({
            left: box.left + this.options.pos + this.options.border,
            top: box.top,
            width: box.width - this.options.pos - this.options.border,
            height: box.height,
            position: 'absolute',
          });
          this.bar.$.css({
            left: box.left + this.options.pos,
            top: box.top,
            width: this.options.border,
            height: box.height,
            position: 'absolute',
          }).mousedown(function(event) {
            this_.dragging = true;
            this_.dragging_mouse_relative_pos = event.clientX - box.left;
            this_.dragging_initial_pos = this_.options.pos;
          }).mouseup(function(event) {
            let delta = event.clientX
                      - box.left
                      - this_.dragging_mouse_relative_pos;
            this_.options.pos = this_.dragging_initial_pos + delta;
            this_.show.call(this_);
            this_.dragging = false;
            this_.bar.$
              .off('mousedown')
              .mousedown(function(event) {
                this_.dragging = true;
                this_.dragging_mouse_relative_pos = event.clientX - box.left;
                this_.dragging_initial_pos = this_.options.pos;
              });
          });
          this.$.mousemove(function(event) {
            if (this_.dragging) {
              let delta = event.clientX
                        - box.left
                        - this_.dragging_mouse_relative_pos;
              this_.options.pos = this_.dragging_initial_pos + delta;
              this_.show.call(this_);
            }
          });
          this.children[0].$.appendTo(this.$);
          this.bar.$.appendTo(this.$);
          this.children[1].$.appendTo(this.$);
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].is_pixie) {
              this.children[i].$.pixie('emit', 'showAll');
            }
          }
          return this;
        },
        bar: undefined,
        dragging: false,
      };

      const hpaned = {
        show: function() {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].$.detach();
          }
          this.$.empty();
          const box = {
            left: 0,
            top: 0,
            width: this.$.width(),
            height: this.$.height(),
          };
          if (typeof this.options.pos === 'string' && this.options.pos.match(/%/)) {
            this.options.pos = eval(
              this.options.pos.replace(/%/, ' / 100 * ' + box.height)
            );
          }
          if (this.bar == undefined) {
            this.bar = {
              $: $('<div></div>').css({
                backgroundColor: this.options.color,
                cursor: 'row-resize',
              }),
            };
          }
          this.$.off('mousemove');
          this.bar.$.off('mousedown').off('mouseup');
          this.children[0].$.css({
            left: box.left,
            top: box.top,
            width: box.width,
            height: this.options.pos,
            position: 'absolute',
          });
          this.children[1].$.css({
            left: box.left,
            top: box.top + this.options.pos + this.options.border,
            width: box.width,
            height: box.height - this.options.pos - this.options.border,
            position: 'absolute',
          });
          let this_ = this;
          this.bar.$.css({
            left: box.left,
            top: box.top + this.options.pos,
            width: box.width,
            height: this.options.border,
            position: 'absolute',
          }).mousedown(function(event) {
            this_.dragging = true;
            this_.dragging_mouse_relative_pos = event.clientY - box.top;
            this_.dragging_initial_pos = this_.options.pos;
          }).mouseup(function(event) {
            let delta = event.clientY
                      - box.top
                      - this_.dragging_mouse_relative_pos;
            this_.options.pos = this_.dragging_initial_pos + delta;
            this_.show.call(this_);
            this_.dragging = false;
            this_.bar.$
              .off('mousedown')
              .mousedown(function(event) {
                this_.dragging = true;
                this_.dragging_mouse_relative_pos = event.clientY - box.top;
                this_.dragging_initial_pos = this_.options.pos;
              });
          });
          this.$.mousemove(function(event) {
            if (this_.dragging) {
              let delta = event.clientY
                        - box.top
                        - this_.dragging_mouse_relative_pos;
              this_.options.pos = this_.dragging_initial_pos + delta;
              this_.show.call(this_);
            }
          });
          this.children[0].$.appendTo(this.$);
          this.bar.$.appendTo(this.$);
          this.children[1].$.appendTo(this.$);
          for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].is_pixie) {
              this.children[i].$.pixie('emit', 'showAll');
            }
          }
          return this;
        },
        bar: undefined,
        dragging: false,
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
        showAll: function() {
          this.show();
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
            pixie.showAll();
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
