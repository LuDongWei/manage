$(function () {

    resizeLayout();
    $(window).on('resize', function () {
        resizeLayout();
    });


    initMenu();


});


// 布局垂直自适应
function resizeLayout() {
    $('#baseLayout').layout('resize', {
        height: $(window).height() - 52
    });

    $('#base-tabs').tabs("resize");
}


function initMenu() {

    var baseTabs = $('#base-tabs');

    // 视窗变化时让panel里的iframe也跟随变化
    baseTabs.tabs({
        'onAdd': function (title, index) {
            var panel = baseTabs.tabs('getTab', index);

            panel.panel({
                'onResize': function (w, h) {
                    panel.find('iframe').css({
                        width: w,
                        height: h
                    });
                }
            })
        }
    });


    $(".sub-menu").find('li').on('click', function () {
        var menu = $(this).find('a');
        var title = menu.html();
        var url = menu.attr('href');

        if (baseTabs.tabs('exists', title)) {
            baseTabs.tabs('select', title);
        } else {
            baseTabs.tabs('add', {
                title: title,
                content: iframe(url),
                closable: true
            });
        }

        return false;
    });
}


function iframe(url) {
    return '<iframe src="' + url + '" style="width:100%;height:100%;border:0;" frameborder="no"></iframe>';
}