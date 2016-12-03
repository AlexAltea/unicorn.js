$(document).ready(function () {
    Split(['#pane-v1', '#pane-v2'], {
        sizes: [70, 30],
        direction: 'vertical'
    });
    Split(['#pane-v1-h1', '#pane-v1-h2'], {
        sizes: [70, 30]
    });
    Split(['#pane-v2-h1', '#pane-v2-h2'], {
        sizes: [70, 30]
    });
});
