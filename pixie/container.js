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
  showAll: function() {
    this.show();
    return this;
  },
  children: [],
};

return function(...args) {
  return container.initialize.apply(this, args);
};
