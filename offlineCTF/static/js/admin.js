$(document).ready(function(){
    var frame = $(".frame")
    var categories = frame.find(".cats-list")
    var catsLinks = categories.find(".cats-btn").children(".cats-link")
    var catsSimple = categories.find(".cats-btn.category-simple")
    var catsCats = categories.find(".cats-btn.category-cats")
    var contents = frame.find(".content")

    var message = $("#admin-message")

    categories.find(".cats-link#category-add").click(function(){
        var activeLink = categories.find(".cats-btn").children(".cats-link.active")
        setupMessage("добавление", "добавить категорию", [
            {
                type: "label",
                id: "label-name",
                label: "название:"
            },
            {
                type: "input",
                name: "name",
            },
            {
                type: "submit",
                id: "submit-btn",
                label: "добавить"
            },
            {
                type: "btn",
                id: "cancel-btn",
                label: "отменить",
                onClick: closeMessage
            }
        ], "/addcat/")
        openMessage()
    })

    categories.find(".cats-link#category-delete").click(function(e){
        var activeLink = categories.find(".cats-btn").children(".cats-link.active")
        setupMessage("удаление", "вы точно уверены?", [
            {
                type: "linkbtn",
                id: "yes-btn",
                label: "да",
                link: "/editcat/" + activeLink.attr('id').substring(9) + "/delete"
            },
            {
                type: "btn",
                id: "no-btn",
                label: "нет",
                onClick: closeMessage
            }
        ])
        openMessage()
    })

    categories.find(".cats-link#category-edit").click(function(){
        var activeLink = categories.find(".cats-btn").children(".cats-link.active")
        setupMessage("изменение", "изменить категорию", [
            {
                type: "label",
                id: "label-name",
                label: "название:"
            },
            {
                type: "input",
                name: "name",
                value: activeLink.text()
            },
            {
                type: "submit",
                id: "submit-btn",
                label: "изменить"
            },
            {
                type: "btn",
                id: "cancel-btn",
                label: "отменить",
                onClick: closeMessage
            }
        ], "/editcat/" + activeLink.attr('id').substring(9) + "/")
        openMessage()
    })

    categories.find(".cats-link#category-add-task").click(function(){
        var activeLink = categories.find(".cats-btn").children(".cats-link.active")
        setupMessage("добавление", "добавить таск в категорию", [
            {
                type: "label",
                id: "label-name",
                label: "название:"
            },
            {
                type: "input",
                name: "name",
            },
            {
                type: "label",
                id: "label-description",
                label: "описание:"
            },
            {
                type: "textarea",
                name: "desc",
            },
            {
                type: "label",
                id: "label-file",
                label: "файл:"
            },
            {
                type: "file",
                name: "file",
            },
            {
                type: "label",
                id: "label-score",
                label: "очки:"
            },
            {
                type: "input",
                name: "score",
            },
            {
                type: "label",
                id: "label-flag",
                label: "флаг:"
            },
            {
                type: "input",
                name: "flag",
            },
            {
                type: "submit",
                id: "submit-btn",
                label: "добавить"
            },
            {
                type: "btn",
                id: "cancel-btn",
                label: "отменить",
                onClick: closeMessage
            }
        ], "/addtask/" + activeLink.attr('id').substring(9) + "/")
        openMessage()
    })

    categories.find(".cats-link#category-delete-task").click(function(e){
        var activeTask = frame.find(".content.active")
        setupMessage("удаление", "вы точно уверены?", [
            {
                type: "linkbtn",
                id: "yes-btn",
                label: "да",
                link: "/tasks/" + activeTask.data("task").substring(7) + "/delete/"
            },
            {
                type: "btn",
                id: "no-btn",
                label: "нет",
                onClick: closeMessage
            }
        ])
        openMessage()
    })

    categories.find(".cats-link#category-edit-task").click(function(){
        var activeTask = frame.find(".content.active")
        var title = activeTask.find(".task-title")
        var description = activeTask.find(".task-description")
        var score = activeTask.find(".task-score")

        setupMessage("изменение", "изменить таск", [
            {
                type: "label",
                id: "label-name",
                label: "название:"
            },
            {
                type: "input",
                name: "name",
                value: title.text()
            },
            {
                type: "label",
                id: "label-description",
                label: "описание:"
            },
            {
                type: "textarea",
                name: "desc",
                value: description.text()
            },
            {
                type: "label",
                id: "label-file",
                label: "файл:"
            },
            {
                type: "file",
                name: "file"
            },
            {
                type: "label",
                id: "label-score",
                label: "очки:"
            },
            {
                type: "input",
                name: "score",
                value: score.text()
            },
            {
                type: "label",
                id: "label-flag",
                label: "флаг:"
            },
            {
                type: "input",
                name: "flag",
            },
            {
                type: "submit",
                id: "submit-btn",
                label: "изменить"
            },
            {
                type: "btn",
                id: "cancel-btn",
                label: "отменить",
                onClick: closeMessage
            }
        ], "/tasks/" + activeTask.data("task").substring(7) + "/edit/")
        openMessage()
    })

    function openMessage() {
        message.addClass("active")
    }

    function closeMessage() {
        message.removeClass("active")
    }

    /** Установка сообщения для администраторских нужд */
    function setupMessage(_title, _text, ctrls, action) {
        var title = message.children(".message-title")
        var text = message.children(".message-text")
        var form = message.children("#message-form").empty();
        form.attr("enctype", "")
        
        if (action) form.attr("action", action)

        title.text(_title)
        text.text(_text)

        ctrls.forEach(ctrl => {
            var label = ctrl.label
            var id = ctrl.id
            var link = ctrl.link
            var name = ctrl.name
            var onClick = ctrl.onClick
            var value = ctrl.value

            var control = null

            switch (ctrl.type) {
                case "label":
                    control = $("<label id=\"" + id + "\" class=\"ctrl-" + id + "\">" + label + "</label>")
                    break
                case "linkbtn":
                    control = $("<a href=\"" + link + "\" id=\"" + id + "\"  class=\"btn-inline ctrl-" + id + "\">" + label + "</a>")
                    break
                case "btn":
                    control = $("<a id=\"" + id + "\" class=\"btn-inline ctrl-" + id + "\">" + label + "</a>").click(onClick)
                    break
                case "input":
                    control = $("<input name=\"" + name + "\" class=\"ctrl-" + name + "\" type=\"text\" required=\"required\"" + (value ? " value=\"" + value + "\"" : "") + " />")
                    break
                case "textarea":
                    control = $("<textarea name=\"" + name + "\" class=\"ctrl-" + name + "\">" + (value ? value : "") + "</textarea>")
                    break
                case "submit":
                    control = $("<input type=\"submit\" id=\"" + id + "\" class=\"btn-inline ctrl-" + id + "\" value=\"" + label + "\" />")
                    break
                case "file":
                    form.attr("enctype", "multipart/form-data")
                    control = $("<input type=\"file\" name=\"" + name + "\" class=\"ctrl-" + name + "\" />")
                    break
            }

            if (control) control.appendTo(form)
        })
    }

    
})