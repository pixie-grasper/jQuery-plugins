// jQuery Plugin: pixie::atlas

const default_options = {
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

const atlas_init = function() {
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
  this.svg._.appendTo(this.$);
  const this_ = this;
  let dragging = false;
  let drag_start_pos_x = null;
  let drag_start_pos_y = null;
  let init_pos_x = null;
  let init_pos_y = null;
  $(this.svg._._).mousedown(function(event) {
    drag_start_pos_x = event.clientX;
    drag_start_pos_y = event.clientY;
    init_pos_x = this_.x;
    init_pos_y = this_.y;
    dragging = true;
  });
  $(document).mousemove(function(event) {
    if (dragging) {
      const delta_x = event.clientX - drag_start_pos_x;
      const delta_y = event.clientY - drag_start_pos_y;
      this_.x = init_pos_x - delta_x;
      this_.y = init_pos_y + delta_y;
      this_.show();
    }
  }).mouseup(function(event) {
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
    let rendering = [
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
            svg._.appendTo(this.g._);
            break;
          }
          default: {
            $.error('unknown type ' + item.type + ' detected.');
            break;
          }
        }
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
  x: 0,
  y: 0,
  scale: 1,
};

return function(...args) {
  return atlas.initialize.apply(this, args);
};
