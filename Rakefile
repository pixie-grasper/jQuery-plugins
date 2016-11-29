task :default => :build

task :build do
  `mkdir -p build`
  File.open('build/jquery-pixie.js', 'w') do |file|
    file.write <<-EOJ
// copyright 2016 pixie-grasper
// License: MIT

(function($) {
  const plugins = {
    EOJ
    `find ./pixie/ -name '*.js'`.split($/).each do |path|
      next if File.basename(path) =~ /^\./
      basename = File.basename path, '.js'
      file.write <<-EOJ
    #{basename}: (function() {
      EOJ
      file.write(File.open(path).read.split($/).collect{ |line|
        if line.length == 0 then ''
        else ' ' * 6 + line
        end
      }.join($/))
      file.write <<-EOJ

    })(),
      EOJ
    end
    file.write <<-EOJ
  };

  $.fn.pixie = function(widget_name, ...args) {
    if (plugins[widget_name]) {
      plugins[widget_name].apply(this, args);
    } else {
      $.error('Widget named ' + widget_name + ' not found.');
    }
  };
})(jQuery);
    EOJ
  end
end
