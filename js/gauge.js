/* global module, $ */

(function() {
  'use strict';

  /**
   * Extend object
   */
  function extend(defaults, options) {
    var out = {};

    if (!options) {
      options = {};
    }

    var keys = Object.keys(defaults).concat(Object.keys(options));

    for (var i = 0; i < keys.length; i++) {
      out[keys[i]] = options.hasOwnProperty(keys[i]) ? options[keys[i]] : defaults[keys[i]];
    }

    return out;
  }

  /**
   * Covert degrees to radians
   */
  function rad(value) {
    return Math.PI / 180 * value;
  }

  /**
   * Default values
   */
  var defaults = {
    from: 0,
    to: 100,
    angle: 270,
    segments: [],
    step: 20,
    inset: false
  };

  /*
   * Gauge constructor
   *
   * @param el Container
   * @param options
   *    angle
   *    from
   *    to
   *    step
   *    markFormat
   *    segments
   *    inset
   *    value
   */
  function Gauge(el, options) {
    this.el = el;
    this.options = extend(defaults, options);

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'gauge');

    if (this.options.from === this.options.to) {
      throw new Error('"from" and "to" values cannot be equal');
    }

    this.delta = this.options.to - this.options.from;

    var size = this.size();
    var minSize = size.width >= size.height ? size.height : size.width;

    var arcRadius, innerRadius, outerRadius, textRadius;

    if (this.options.inset) {
      arcRadius = 0.97;
      innerRadius = 0.93;
      outerRadius = 0.95;
      textRadius = 0.85;
    } else {
      arcRadius = 0.75;
      innerRadius = 0.78;
      outerRadius = 0.8;
      textRadius = 0.85;
    }

    var radius = minSize / 2 * arcRadius;

    var startAngle = rad((360 - this.options.angle) / 2);
    var endAngle = startAngle + rad(this.options.angle);

    var i, sx, sy, ex, ey;

    // Render marks

    var marks = [];
    var stepAngle = rad(this.options.step / Math.abs(this.delta) * this.options.angle);

    if (this.delta < 0 && this.options.step > 0) {
      this.options.step = -this.options.step;
    }

    var cvalue = this.options.from;

    for (i = startAngle; i <= endAngle; i += stepAngle) {
      var sin = Math.sin(i);
      var cos = Math.cos(i);
      sx = minSize / 2 * (1 - sin * innerRadius);
      sy = minSize / 2 * (1 + cos * innerRadius);
      ex = minSize / 2 * (1 - sin * outerRadius);
      ey = minSize / 2 * (1 + cos * outerRadius);

      marks.push('M' + sx + ',' + sy + ' L' + ex + ',' + ey);

      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'gauge-marks-text');
      text.setAttribute('x', minSize / 2 * (1 - sin * textRadius));
      text.setAttribute('y', minSize / 2 * (1 + cos * textRadius));

      text.appendChild(document.createTextNode(this.options.markFormat ? this.options.markFormat(cvalue) : cvalue));

      this.svg.appendChild(text);

      cvalue += this.options.step;
    }

    var marksPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    marksPath.setAttribute('class', 'gauge-marks');
    marksPath.setAttribute('d', marks.join(' '));
    this.svg.appendChild(marksPath);

    // Render segments

    var segments = this.options.segments.slice();

    segments.sort(function(a, b) {
      return this.delta > 0 ? a - b : b - a;
    }.bind(this));

    if (segments[0] !== this.options.from) {
      segments.unshift(this.options.from);
    }

    if (segments[segments.length - 1] !== this.options.to) {
      segments.push(this.options.to);
    }

    sx = size.width / 2 - radius * Math.sin(startAngle);
    sy = size.height / 2 + radius * Math.cos(startAngle);

    var angle, path, large;

    for (i = 1; i < segments.length; i++) {
      angle = rad(Math.abs(segments[i] - segments[i - 1]) * this.options.angle / Math.abs(this.delta));

      large = Number(angle > rad(180));

      angle += startAngle;

      ex = size.width / 2 - radius * Math.sin(angle);
      ey = size.height / 2 + radius * Math.cos(angle);

      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M' + sx +' ' + sy + ' A' + radius + ',' + radius + ' 0 ' + large + ',1  ' + ex + ',' + ey);
      path.setAttribute('class', 'gauge-arc gauge-segment-' + i);
      this.svg.appendChild(path);

      sx = ex;
      sy = ey;
      startAngle = angle;
    }

    this.el.appendChild(this.svg);

    // Render arrow

    var arrowSize = minSize * 0.3;
    sx = size.width / 2;
    sy = size.height / 2 - arrowSize;
    this.arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.arrow.setAttribute('class', 'gauge-arrow');
    this.arrow.setAttribute('stroke-linecap', 'round');
    this.arrow.setAttribute('d', 'M' + sx + ',' + sy + ' l' + (size.width * 0.02) + ',' + arrowSize + ' l' + (-size.width * 0.04) + ',0 z');
    this.svg.appendChild(this.arrow);

    // Render label

    if (this.options.label) {
      var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'gauge-label');
      label.setAttribute('x', size.width / 2);
      label.setAttribute('y', size.height / 1.5);
      label.appendChild(document.createTextNode(this.options.label));
      this.svg.appendChild(label);
    }

    this.setValue(isFinite(this.options.value) ? this.options.value : this.options.from);
  }

  /**
   * Get gauge size
   */
  Gauge.prototype.size = function() {
    return {
      width: this.el.offsetWidth,
      height: this.el.offsetHeight
    };
  };

  /**
   * Set value
   */
  Gauge.prototype.setValue = function(value) {
    // Check whether the value is valid

    if (this.delta > 0) {
      if (value < this.options.from) {
        value = this.options.from;
      } else if (value > this.options.to) {
        value = this.options.to;
      }
    }

    if (this.delta < 0) {
      if (value > this.options.from) {
        value = this.options.from;
      } else if (value < this.options.to) {
        value = this.options.to;
      }
    }

    var angle = (Math.abs((value - this.options.from) / this.delta) - 0.5) * this.options.angle;

    this.arrow.style.transform = 'rotate(' + angle + 'deg)';

    return this.value;
  };

  /**
   * jQuery plugin
   */
  if ($) {
    $.fn.gauge = function(options) {
      console.log('options', options);

      var $el = $(this);

      var gauge = $el.data('gauge');

      if (!gauge) {
        gauge = new Gauge(this, options);
        $el.data('gauge', gauge);
      }

      if (isFinite(options)) {
        gauge.setValue(options);
      }

      return $el;
    };
  }

  // Export

  if (typeof window.define === 'function' && window.define.amd) {
    window.define('gauge', [], function() { return Gauge; });
  } else if (typeof module === 'object') {
    module.exports = Gauge;
  } else {
    window.Gauge = Gauge;
  }
})();

