// jQuery Plugin: pixie::pane
const default_options = {
  mode: null,
  border: 5,
  pos: '50%',
  color: 'lightgray',
};

const resize_vertical = function() {
  const settings = this.settings;
  const this_ = this;
  const box = {
    left: this.offset().left - $('body').offset().left,
    top: this.offset().top - $('body').offset().top,
    width: this.width(),
    height: this.height(),
  };
  const left = $(settings.left).css({
    left: box.left,
    top: box.top,
    width: settings.pos,
    height: box.height,
    position: 'absolute',
  });
  settings.bar = $('<div></div>').css({
    left: box.left + settings.pos,
    top: box.top,
    width: settings.border,
    height: box.height,
    position: 'absolute',
    backgroundColor: settings.color,
  }).draggable({
    axis: 'x',
    start: function(event, ui) {
      move_vertical.call(this_, event, ui);
    },
    drag: function(event, ui) {
      move_vertical.call(this_, event, ui);
    },
    stop: function(event, ui) {
      move_vertical.call(this_, event, ui);
    },
  });
  const right = $(settings.right).css({
    left: box.left + settings.pos + settings.border,
    top: box.top,
    width: box.width - settings.pos - settings.border,
    height: box.height,
    position: 'absolute',
  });
  this.html('');
  left.appendTo(this);
  settings.bar.appendTo(this);
  right.appendTo(this);
};

const move_vertical = function(event, ui) {
  const settings = this.settings;
  settings.pos = ui.offset.left;
  const box = {
    left: this.offset().left - $('body').offset().left,
    top: this.offset().top - $('body').offset().top,
    width: this.width(),
    height: this.height(),
  };
  $(settings.left).css({
    width: settings.pos,
  });
  settings.bar.css({
    left: box.left + settings.pos,
  });
  $(settings.right).css({
    left: box.left + settings.pos + settings.border,
    width: box.width - settings.pos - settings.border,
  });
};

const resize_horizontal = function() {
  const settings = this.settings;
  const this_ = this;
  const box = {
    left: this.offset().left - $('body').offset().left,
    top: this.offset().top - $('body').offset().top,
    width: this.width(),
    height: this.height(),
  };
  const top = $(settings.top).css({
    left: box.left,
    top: box.top,
    width: box.width,
    height: settings.pos,
    position: 'absolute',
  });
  settings.bar = $('<div></div>').css({
    left: box.left,
    top: box.top + settings.pos,
    width: box.width,
    height: settings.border,
    position: 'absolute',
    backgroundColor: settings.color,
  }).draggable({
    axis: 'y',
    start: function(event, ui) {
      move_horizontal.call(this_, event, ui);
    },
    drag: function(event, ui) {
      move_horizontal.call(this_, event, ui);
    },
    stop: function(event, ui) {
      move_horizontal.call(this_, event, ui);
    },
  });
  const bottom = $(settings.bottom).css({
    left: box.left,
    top: box.top + settings.pos + settings.border,
    width: box.width,
    height: box.height - settings.pos - settings.border,
    position: 'absolute',
  });
  this.empty();
  top.appendTo(this);
  settings.bar.appendTo(this);
  bottom.appendTo(this);
};

const move_horizontal = function(event, ui) {
  const settings = this.settings;
  settings.pos = ui.offset.top;
  const box = {
    left: this.offset().left - $('body').offset().left,
    top: this.offset().top - $('body').offset().top,
    width: this.width(),
    height: this.height(),
  };
  $(settings.top).css({
    width: box.width,
    height: settings.pos,
  });
  settings.bar.css({
    top: box.top + settings.pos,
    width: box.width,
  });
  $(settings.bottom).css({
    top: box.top + settings.pos + settings.border,
    width: box.width,
    height: box.height - settings.pos - settings.border,
  });
};

const methods = {
  init: function(given_options) {
    const this_ = this;
    this.settings = $.extend(true, {}, default_options, given_options);
    const settings = this.settings;
    if (settings.mode == 'vertical') {
      settings.pos = eval(
        settings.pos.replace(/%/, ' / 100 * ' + this.width())
      );
      resize_vertical.call(this);
      $(window).on('load resize', function() {
        resize_vertical.call(this_);
      });
    } else if (settings.mode == 'horizontal') {
      settings.pos = eval(
        settings.pos.replace(/%/, ' / 100 * ' + this.height())
      );
      resize_horizontal.call(this);
      $(window).on('load resize', function() {
        resize_horizontal.call(this_);
      });
    } else {
      $.error('required options: mode =' +
          ' [\'vertical\', \'horizontal\'].select_one();');
    }
    return this;
  },
};

return function(method, ...rest) {
  if (methods[method]) {
    return methods[method].apply(this, rest);
  } else if (typeof method === 'object' || !method) {
    return methods.init.apply(this, [method].concat(rest));
  } else {
    $.error('Method ' + method + ' does not exist on jQuery.pixie::pane');
  }
};
