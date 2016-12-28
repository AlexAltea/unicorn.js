$(document).ready(function () {
    Split(['#a', '#b'], {
      gutterSize: 8,
      sizes: [65, 35],
      cursor: 'col-resize'
    });
    Split(['#c', '#d'], {
      direction: 'vertical',
      sizes: [65, 35],
      gutterSize: 8,
      cursor: 'row-resize'
    });
    Split(['#e', '#f'], {
      direction: 'vertical',
      sizes: [65, 35],
      gutterSize: 8,
      cursor: 'row-resize'
    });
});
