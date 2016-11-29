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
