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
    var catsSimple = categories.find(".cats-btn.category-simple")
    var catsCats = categories.find(".cats-btn.category-cats")
    var contents = frame.find(".content")

    catsLinks.click(function(){
        var catsLink = $(this)
        if (catsLink.hasClass("blocked")) return;

        catsLinks.removeClass("active")
        catsLink.addClass("active")
        contents.each(function(){
            var content = $(this)

            content.removeClass("active")

            if (content.data("cat") == catsLink.attr("id")) {
                content.addClass("active")
            }
        })
    })

    categories.find(".cats-link#category-back").click(function(){
        frame.find(".content.content-task").removeClass("active")
        
        catsLinks.removeClass("active")
        catsCats.removeClass("hidden")
        catsSimple.removeClass("hidden")
        categories.find(".cats-btn.category-task").removeClass("visible")
        catsLinks.first().trigger("click")
    })

    contents.find(".flag-submission").click(function() {
        var activeTask = frame.find(".content.active")

        var flag = activeTask.find(".flag-input").val();

        $.ajax({
            url: "/submit/" + activeTask.data("task").substring(7) + "/" + btoa(flag)
        }).done(function(data) {
            console.log(data);
            if (data["success"]) {
                $(".flag-input").val("Решено");
                $(".flag-submission").removeClass("btn-primary");
                $(".flag-submission").addClass("btn-success");
                $(".flag-submission").attr('disabled','disabled');
            } else {
                $(".flag-input").val($(".lang").data("failure"));
            }
        })
    })

    var tasks = $(".task-link")
    if (tasks.length > 0) {
        tasks.click(function(){
            var task = $(this)
            catsLinks.removeClass("active")

            catsSimple.addClass("hidden")
            catsCats.addClass("hidden")
            categories.find(".cats-btn.category-task").addClass("visible")

            contents.each(function(){
                var content = $(this)
    
                content.removeClass("active")
    
                if (content.data("task") == task.attr("id")) {
                    content.addClass("active")
                }
            })
        })
    }
})