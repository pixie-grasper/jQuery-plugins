// jQuery Plugin: pixie::atlas

const default_options = {
  overlap_elements: function(area) {
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
  scale_base: 1.3,
};

const Area = function() {
  let command_list = [];
  const commands = [
    'vss', 'vskip', 'vkern',
    'hss', 'hskip', 'hkern',
    'box',
  ];
  for (let i = 0; i < commands.length; i++) {
    this[commands[i]] = (function(i) {
      return function(...args) {
        command_list.push({
          command: commands[i],
          args: args,
        });
        return this;
      };
    })(i);
  }

  let vboxes;
  let boxes;
  this.load = function() {
    vboxes = [];
    boxes = [];
    let hboxes = [];
    for (let i = 0; i < command_list.length; i++) {
      switch (command_list[i].command) {
        case 'vss':
        case 'vskip':
        case 'vkern':
          if (hboxes.length != 0) {
            vboxes.push([0, hboxes]);
            hboxes = [];
          }
          vboxes.push([1, command_list[i]]);
          break;
        case 'hss':
        case 'hskip':
        case 'hkern':
          hboxes.push(command_list[i]);
          break;
        case 'box':
          hboxes.push(command_list[i]);
          boxes.push(command_list[i]);
          break;
      }
    }
    if (hboxes.length != 0) {
      vboxes.push([0, hboxes]);
    }
    return this;
  };

  this.show = function(g, width, height) {
    if (!g._.firstChild) {
      if (!boxes) {
        this.load();
      }
      for (let i = 0; i < boxes.length; i++) {
        g.append(boxes[i].args[0]);
      }
    }
    let normal_height = 0;
    let count_vss = 0;
    let count_vskip = 0;
    for (let i = 0; i < vboxes.length; i++) {
      const vbox = vboxes[i];
      if (vbox[0] == 0) {
        const hboxes = vbox[1];
        let normal_width = 0;
        let hbox_height = 0;
        let count_hss = 0;
        let count_hskip = 0;
        for (let j = 0; j < hboxes.length; j++) {
          const hbox = hboxes[j];
          switch (hbox.command) {
            case 'hss':
              count_hss++;
              break;
            case 'hskip':
              count_hskip++;
              normal_width += hbox.args[0];
              break;
            case 'hkern':
              normal_width += hbox.args[0];
              break;
            case 'box':
              normal_width += hbox.args[0].prop('scrollWidth');
              hbox_height = Math.max(
                hbox_height,
                hbox.args[0].prop('scrollHeight')
              );
              break;
          }
        }
        if (count_hss != 0) {
          count_hskip = 0;
        }
        vbox[2] = {
          badness: width - normal_width,
          height: hbox_height,
          count_hss: count_hss,
          count_hskip: count_hskip,
        };
        normal_height += hbox_height;
      } else {
        switch (vbox[1].command) {
          case 'vss':
            count_vss++;
            break;
          case 'vskip':
            count_vskip++;
            normal_height += vbox[1].args[0];
            break;
          case 'vkern':
            normal_height += vbox[1].args[0];
            break;
        }
      }
    }
    if (count_vss != 0) {
      count_vskip = 0;
    }
    const badness = height - normal_height;
    let y = 0;
    for (let i = 0; i < vboxes.length; i++) {
      const vbox = vboxes[i];
      if (vbox[0] == 0) {
        let x = 0;
        const hboxes = vbox[1];
        const parameter = vbox[2];
        for (let j = 0; j < hboxes.length; j++) {
          const hbox = hboxes[j];
          switch (hbox.command) {
            case 'hss':
              if (parameter.count_hss != 0) {
                x += parameter.badness / parameter.count_hss;
              }
              break;
            case 'hskip':
              if (parameter.count_hskip != 0) {
                x += parameter.badness / parameter.count_hskip;
              }
              x += hbox.args[0];
              break;
            case 'hkern':
              x += hbox.args[0];
              break;
            case 'box':
              hbox.args[0].attr({
                x: x,
                y: y + parameter.height,
              });
              x += hbox.args[0].prop('scrollWidth');
              break;
          }
        }
      } else {
        switch (vbox[1].command) {
          case 'vss':
            if (count_vss != 0) {
              y += badness / count_vss;
            }
            break;
          case 'vskip':
            if (count_vskip != 0) {
              y += badness / count_vskip;
            }
            y += vbox[1].args[0];
            break;
          case 'vkern':
            y += vbox[1].args[0];
            break;
        }
      }
    }
    return this;
  };
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
      if (!hash[key] || hash[key] == '') {
        _.removeAttribute(key);
      } else {
        _.setAttribute(key, hash[key]);
      }
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
  this.overlap_elements = new Area();
  this.options.overlap_elements(this.overlap_elements);
  this.overlap_elements.load();
  const this_ = this;
  let dragging = false;
  let drag_start_pos_x = null;
  let drag_start_pos_y = null;
  let init_center_x = null;
  let init_center_y = null;
  this.svg.$.mousedown(function(event) {
    const box = create_box(this_.$);
    const scale = this_.scale;
    const scale_inv = 1 / scale;
    drag_start_pos_x = event.clientX;
    drag_start_pos_y = event.clientY;
    init_center_x = this_.x + box.width * scale_inv;
    init_center_y = this_.y + box.height * scale_inv;
    const style = $('body')[0].style;
    style.cursor = 'grabbing';
    if (style.cursor == '') {
      style.cursor = '-moz-grabbing';
      if (style.cursor == '') {
        style.cursor = '-webkit-grabbing';
      }
    }
    dragging = true;
  }).on(wheel_event_name(), function(event) {
    const box = create_box(this_.$);
    const scale = this_.scale;
    const scale_inv = 1 / scale;
    const scale_base = this_.options.scale_base;
    const scale_base_inv = 1 / scale_base;
    const x = this_.x + event.clientX * scale_inv;
    const y = this_.y + (box.height - event.clientY) * scale_inv;
    if (wheel_direction(event) < 0) {
      this_.zoom(x, y, scale_base);
    } else {
      this_.zoom(x, y, scale_base_inv);
    }
    this_.show();
    this_.update_overlaps(x, y);
  });
  $(document).mousemove(function(event) {
    const scale = this_.scale;
    const scale_inv = 1 / scale;
    if (dragging) {
      const delta_x = event.clientX - drag_start_pos_x;
      const delta_y = event.clientY - drag_start_pos_y;
      const center_x = init_center_x - delta_x * scale_inv;
      const center_y = init_center_y + delta_y * scale_inv;
      this_.moveto(center_x, center_y);
    }
    const box = create_box(this_.$);
    const x = this_.x + event.clientX * scale_inv;
    const y = this_.y + (box.height - event.clientY) * scale_inv;
    this_.update_overlaps(x, y);
  }).mouseup(function(event) {
    $('body').css({
      cursor: '',
    });
    dragging = false;
  });
};

const atlas = {
  is_pixie: true,
  type_of: 'atlas',
  kind_of: {'atlas': true},
  initialize: function(options) {
    /* global plugins */
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
        this.cached_box_size[i] =
          f[i](rendering[i], this.cached_box_size[i]);
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
                stroke: item.stroke,
                fill: item.fill,
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
      this.g2 = {
        _: _('g'),
      };
      this.g2._.appendTo(this.svg._);
      this.overlap_elements.show(this.g2._, box.width, box.height);
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
  zoom: function(center_x, center_y, ratio) {
    this.scale /= ratio;
    this.x = center_x - (center_x - this.x) * ratio;
    this.y = center_y - (center_y - this.y) * ratio;
    return this;
  },
  moveto: function(center_x, center_y) {
    const box = create_box(this.$);
    const scale = this.scale;
    const scale_inv = 1 / scale;
    this.x = center_x - box.width * scale_inv;
    this.y = center_y - box.height * scale_inv;
    this.show();
    return this;
  },
  update_overlaps: function(x, y) {
    const box = create_box(this.$);
    this.options.update_overlaps(x, y, this.scale);
    this.overlap_elements.show(this.g2._, box.width, box.height);
    return this;
  },
  initialized: false,
  cached_box_size: null,
};

return function(...args) {
  return atlas.initialize.apply(this, args);
};
