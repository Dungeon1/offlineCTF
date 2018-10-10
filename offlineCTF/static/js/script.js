$(document).ready(function(){
    /** Для стилей */
    $(".w-bg").hover(function(){
        $(this).closest(".parent-bg").addClass("hovered")
    }, function(){
        $(this).closest(".parent-bg").removeClass("hovered")
    })

    /** Скрипт для шаблона header */
    // Время
    function getCurrentTime(){
        var currentdate = new Date();
        $("#nav-clock").text(currentdate.getHours() + ":" + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + ":" + (currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds()) + "")
    }
    getCurrentTime()
    setInterval(getCurrentTime, 1000)

    /** Скрипт для переключения категорий */
    var frame = $(".frame")
    var categories = frame.find(".cats-list")
    var catsLinks = categories.find(".cats-btn").children(".cats-link")
    var contents = frame.find(".content")

    catsLinks.click(function(){
        catsLinks.removeClass("active")

        var catsLink = $(this)
        catsLink.addClass("active")
        contents.each(function(){
            var content = $(this)

            content.removeClass("active")

            if (content.data("cat") == catsLink.attr("id")) {
                content.addClass("active")
            }
        })
    })
})