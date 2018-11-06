$(document).ready(function () {
    var crtAnimation = Cookies.get("crt_animation")
    if (crtAnimation == null || crtAnimation == "") {
        Cookies.set("crt_animation", "true")
    }

    if (crtAnimation == 'true') {
        $(".main-wrapper").addClass("crt")
    }

    /** Футер */
    var currentDir = $(".cd-path").children(".text-path").children(".current-dir")
    

    /** Скрипт для шаблона header */
    // Время
    function getCurrentTime() {
        var currentdate = new Date();
        $("#nav-clock").text(currentdate.getHours() + ":" + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + ":" + (currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds()) + "")
    }
    getCurrentTime()
    setInterval(getCurrentTime, 1000)

    /** Скрипт для переключения категорий */
    var frame = $(".frame")
    var contents = frame.find(".column-contents").children(".content")
    var categories = frame.find(".cats-list")

    var simpleCategories = categories.children(".category-simple")
    var simpleCatsLinks = simpleCategories.children(".cats-link")
    var lastActiveSimpleCatsLink = null

    var backCategory = categories.children(".category-back")
    var backCategoryLink = backCategory.children(".cats-link")

    var tasksContents = frame.find(".column-contents").children(".content-tasks")
    var taskContent = frame.find(".column-contents").children(".content-task")

    /** Для админов */
    var isAdmin = false
    if ($("#admin-message").length > 0) isAdmin = true

    if (isAdmin) {
        var adminCategories = categories.children(".category-admin")
        var adminTaskCategories = categories.children(".category-admin.admin-task")
    }

    /** Обработчик нажатия на одну из ссылок категорий */
    simpleCatsLinks.click(function () {
        var simpleCatsLink = $(this)

        simpleCatsLinks.removeClass("active")
        simpleCatsLink.addClass("active")

        contents.each(function () {
            var content = $(this)

            content.removeClass("active")

            if (content.data("cat") == simpleCatsLink.attr("id")) {
                content.addClass("active")
            }
        })
    })

    /** Обработчик кнопки назад */
    backCategoryLink.click(function () {
        taskContent.removeClass("active")

        simpleCategories.removeClass("hidden")
        simpleCatsLinks.removeClass("active")

        if (isAdmin) {
            adminCategories.removeClass("hidden")
            adminTaskCategories.removeClass("visible")
        }

        if (lastActiveSimpleCatsLink)
            lastActiveSimpleCatsLink.trigger("click")
        else simpleCatsLinks.first().trigger("click")

        backCategory.removeClass("visible")

        currentDir.text("")
    })

    /** Код для работы таблицы тасков */
    var tableTasks = tasksContents.find(".tasks-table")
    var tableTasksLinks = tableTasks.find(".row-link:not(.row-info)")

    if (tableTasksLinks.length > 0)
        tableTasksLinks.click(function () {
            if (tasks_info == null) return

            var taskLink = $(this)
            var taskInfo = null

            tasks_info.forEach(task => {
                if (task['id'] == taskLink.data("task_id") && task['category'] == taskLink.data("task_category")) {
                    taskInfo = task
                }
            })
            lastActiveSimpleCatsLink = simpleCategories.children(".cats-link.active")
            
            simpleCategories.addClass("hidden")

            if (isAdmin) {
                adminCategories.addClass("hidden")
                adminTaskCategories.addClass("visible")
            }

            backCategory.addClass("visible")

            contents.removeClass("active")
            taskContent.addClass("active")

            var title = taskContent.find(".task-title")
            var description = taskContent.find(".task-description")
            var score = taskContent.find(".task-score")
            var solved = taskContent.find(".task-solved")
            var file = taskContent.find(".task-file")
            var input = taskContent.find(".flag-input")
            var submission = taskContent.find(".flag-submission")
            var block = taskContent.find(".task-block")

            title.text(taskInfo.name)
            description.text(taskInfo.desc)
            score.text(taskInfo.score)
            solved.text(taskInfo.userCount)
            file.text(taskInfo.file).attr("href", "/files/" + taskInfo.file)

            block.attr("data-task_id", taskInfo.id)

            if (taskInfo.isDone) {
                input.attr("disabled", "").attr("placeholder", $(".lang-tasks").data("already_solved")).val("")
                submission.attr("disabled", "").text($(".lang-tasks").data("already_solved_short"))
            } else {
                input.removeAttr("disabled").attr("placeholder", $(".lang-tasks").data("flag")).val("")
                submission.removeAttr("disabled").text($(".lang-tasks").data("send"))
            }

            currentDir.text(simpleCategories.children(".cats-link.active").text() + "\\")

            simpleCatsLinks.removeClass("active")
        })

    /** Проверка и утверждение флага */
    taskContent.find(".flag-submission").click(function () {
        var flag = taskContent.find(".flag-input").val();
        var btoa = ""

        try {
            var btoa = window.btoa(flag)

            $.ajax({
                url: "/submit/" + taskContent.find(".task-block").data("task_id") + "/" + btoa
            }).done(function (data) {
                console.log(data)
                if (data["success"]) {
                    $(".flag-input").val($(".lang-tasks").data("success")).attr("disabled", "")
                    $(".flag-submission").attr("disabled", "").text($(".lang-tasks").data("already_solved_short"))

                    tasks_info.forEach(task => {
                        if (task['id'] == taskContent.find(".task-block").data("task_id")) {
                            taskInfo = task
                        }
                    })
                    taskInfo.isDone = true
                } else {
                    $(".flag-input").val($(".lang-tasks").data("failure"))
                }
            }).fail(function () {

            })
        } catch (error) {
            console.log("Скорее всего ошибка из-за введеных русских символов или отсутствия каких-либо вообще...")
            $(".flag-input").val($(".lang-tasks").data("failure"));
        }
    })

    /** Настройки */
    var settings = $("#settings")

    if (settings.length > 0) {
        var crtAnimationButton = settings.find(".crt-animation")
        crtAnimationButton.click(function(){
            $(".main-wrapper").toggleClass("crt")
                
            if ($(".main-wrapper").hasClass("crt")) {
                crtAnimationButton.text($(".lang-settings").data("turn_off"))
                Cookies.set("crt_animation", "true")
            } else {
                crtAnimationButton.text($(".lang-settings").data("turn_on"))
                Cookies.set("crt_animation", "false")
            }
        })

        var butterflyButton = settings.find(".butterfly_button")
        var i = 0;

        butterflyButton.click(function(){
            i++;

            if (i > 3) {
                window.location = "https://www.youtube.com/watch?v=6FEDrU85FLE"
            }
        })

        var superhotButton = settings.find(".superhot_button")
        var superhotState = 0
        var hotOGG = new Audio("sounds/hot.ogg")
        var superOGG = new Audio("sounds/super.ogg")
        var superHotText = $('<h1 class="SUPERHOT"></h1>').appendTo('body')
        var time = null
        var works = false

        superhotButton.click(function(){
            if (works) {
                superhotButton.text($(".lang-settings").data("superhot_button"))
            } else {
                superhotButton.text($(".lang-settings").data("press_space"))
            }
            works = !works
        })

        $('body').keyup(function(e){
            if(e.keyCode != 32 || !works) return

            clearTimeout(time)

            superHotText.removeClass('active').removeClass("hidden")

            if (superhotState == 0) {
                superOGG.play()
                superhotState = 1

                superHotText.text("Super").removeClass("hot")
            } else {
                hotOGG.play()
                superhotState = 0
                superHotText.text("Hot").addClass("hot")
            }

            setTimeout(function(){
                superHotText.addClass('active')
            }, 100)

            time = setTimeout(function(){
                superHotText.addClass("hidden")
            }, 1000)
        })
    }
})