# Gauge

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

