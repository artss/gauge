# Gauge

## Installation

```sh
bower install gauge-svg
```

## Usage

```js
// VanillaJS

var el = document.getElementById('gauge');

var gauge = new Gauge(el, {
  label: 'VanillaJS',
  angle: 270,
  segments: [40, 80],
  value: 20
});

gauge.setValue(100);

// jQuery

var $gauge = $('#gauge-jquery').gauge({
  label: 'jQuery',
  angle: 180,
  from: 1,
  to: -1,
  step: 0.2,
  markFormat: function(v) {
    return Math.round(v * 100) / 100;
  },
  segments: [0.2, 0.4, 0.6],
  inset: true
});

$gauge.gauge(-0.7);
```

## Options

* angle — arc angle in degrees (270).
* from — start value (0).
* to — end value (100).
* step — the interval at which marks will be placed (20).
* markFormat — function to format mark string (see the example above).
* inset — the flag to specify whether marks are inside the arc (false).
* segments — arc segments boundaries.
* value — value. Can be set later using `.setValue` method.

