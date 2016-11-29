// copyright 2016 pixie-grasper
// License: MIT

(function($) {
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
            left: this.$.offset().left - $('body').offset().left,
            top: this.$.offset().top - $('body').offset().top,
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
              $: $('<div></div>')
                .css({
                  backgroundColor: this.options.color,
                  cursor: 'col-resize',
                }).mousedown(function(event) {
                  this_.dragging = true;
                  this_.dragging_mouse_relative_pos = event.clientX - box.left;
                  this_.dragging_initial_pos = this_.options.pos;
                }),
            };
            this.$.mousemove(function(event) {
              if (this_.dragging != false) {
                let delta = event.clientX
                          - box.left
                          - this_.dragging_mouse_relative_pos;
                this_.options.pos = this_.dragging_initial_pos + delta;
                this_.show.call(this_);
              }
            });
          }
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
          }).mouseup(function(event) {
            let delta = event.clientX
                      - box.left
                      - this_.dragging_mouse_relative_pos;
            this_.options.pos = this_.dragging_initial_pos + delta;
            this_.show.call(this_);
            this_.dragging = false;
            this_.$.mousedown(function(event) {
              this_.dragging = true;
              this_.dragging_mouse_relative_pos = event.clientX - box.left;
              this_.dragging_initial_pos = this_.options.pos;
            });
          });
          this.children[0].$.appendTo(this.$);
          this.bar.$.appendTo(this.$);
          this.children[1].$.appendTo(this.$);
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
            left: this.$.offset().left - $('body').offset().left,
            top: this.$.offset().top - $('body').offset().top,
            width: this.$.width(),
            height: this.$.height(),
          };
          if (typeof this.options.pos === 'string' && this.options.pos.match(/%/)) {
            this.options.pos = eval(
              this.options.pos.replace(/%/, ' / 100 * ' + box.height)
            );
          }
          let this_ = this;
          if (this.bar == undefined) {
            this.bar = {
              $: $('<div></div>')
                .css({
                  backgroundColor: this.options.color,
                  cursor: 'row-resize',
                }).mousedown(function(event) {
                  this_.dragging = true;
                  this_.dragging_mouse_relative_pos = event.clientY - box.top;
                  this_.dragging_initial_pos = this_.options.pos;
                }),
            };
            this.$.mousemove(function(event) {
              if (this_.dragging != false) {
                let delta = event.clientY
                          - box.top
                          - this_.dragging_mouse_relative_pos;
                this_.options.pos = this_.dragging_initial_pos + delta;
                this_.show.call(this_);
              }
            });
          }
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
          this.bar.$.css({
            left: box.left,
            top: box.top + this.options.pos,
            width: box.width,
            height: this.options.border,
            position: 'absolute',
          }).mouseup(function(event) {
            let delta = event.clientY
                      - box.top
                      - this_.dragging_mouse_relative_pos;
            this_.options.pos = this_.dragging_initial_pos + delta;
            this_.show.call(this_);
            this_.dragging = false;
            this_.$.mousedown(function(event) {
              this_.dragging = true;
              this_.dragging_mouse_relative_pos = event.clientY - box.top;
              this_.dragging_initial_pos = this_.options.pos;
            });
          });
          this.children[0].$.appendTo(this.$);
          this.bar.$.appendTo(this.$);
          this.children[1].$.appendTo(this.$);
          return this;
        },
        bar: undefined,
        dragging: false,
      };

      const paned = {
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
          this.children[0] = {
            $: $(element),
          };
          return this;
        },
        add2: function(element) {
          this.children[1] = {
            $: $(element),
          };
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
        initialize: function() {
          return {
            $: this,
            children: [],
          };
        },
      };

      return function(...args) {
        return container.initialize.apply(this, args);
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
