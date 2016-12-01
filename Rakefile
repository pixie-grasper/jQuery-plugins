task :default => :build

task :build do
  `mkdir -p build`
  File.open('build/jquery-pixie.js', 'w') do |file|
    file.write <<-EOJ
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
      kind_of: {},
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
    EOJ
    `find ./pixie/ -name '*.js'`.split($/).each do |path|
      next if File.basename(path) =~ /^\./
      basename = File.basename path, '.js'
      file.write <<-EOJ
    #{basename}: (function() {
      EOJ
      file.write(File.open(path).read.split($/).collect{ |line|
        if line.length == 0 then ''
        elsif line =~ /^( *)(\/\* *global .*)$/ then ' ' * 6 + $1 + '// ' + $2
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
      return plugins[widget_name].apply(this, args);
    } else {
      $.error('Widget named ' + widget_name + ' not found.');
    }
  };

  $('.pixie-widget').hide();
})(jQuery);
    EOJ
  end
end

task :release => :build
task :release do
  `java -jar external/closure/closure-compiler-v20161024.jar --js_output_file build/jquery-pixie.min.js build/jquery-pixie.js`
end
