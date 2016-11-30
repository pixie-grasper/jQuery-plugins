// jQuery Plugin: pixie::emit

const handler = {
  showAll: function() {
    /* global as_pixie */
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
