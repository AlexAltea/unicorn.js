$(document).ready(function () {
  Split(['#pane-l', '#pane-r'], {
    gutterSize: 8,
    sizes: [65, 35],
    cursor: 'col-resize'
  });
  Split(['#pane-lt', '#pane-lb'], {
    direction: 'vertical',
    sizes: [65, 35],
    gutterSize: 8,
    cursor: 'row-resize'
  });
  Split(['#pane-rt', '#pane-rb'], {
    direction: 'vertical',
    sizes: [65, 35],
    gutterSize: 8,
    cursor: 'row-resize'
  });
});
