// jQuery Plugin: pixie::container

const container = {
  is_pixie: true,
  type_of: 'container',
  kind_of: {'container': true},
  initialize: function() {
    /* global to_pixie */
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
