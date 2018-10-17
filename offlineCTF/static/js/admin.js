$(document).ready(function(){
    var frame = $(".frame")
    var categories = frame.find(".cats-list")
    
    var simpleCategories = categories.children(".category-simple")
    var adminCategories = categories.children(".category-admin")

    var taskContent = frame.find(".content-task")
    var taskBlock = taskContent.children(".task-block")

    var message = $("#admin-message")

    adminCategories.children(".cats-link#category-add").click(function(){
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

    adminCategories.children(".cats-link#category-edit").click(function(){
        var activeLink = simpleCategories.children(".cats-link.active")
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

    adminCategories.children(".cats-link#category-delete").click(function(e){
        var activeLink = simpleCategories.children(".cats-link.active")
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

    adminCategories.children(".cats-link#category-add-task").click(function(){
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
        ], "/addtask/" + taskBlock.data("task_id") + "/")
        openMessage()
    })

    adminCategories.children(".cats-link#category-delete-task").click(function(e){
        setupMessage("удаление", "вы точно уверены?", [
            {
                type: "linkbtn",
                id: "yes-btn",
                label: "да",
                link: "/tasks/" + taskBlock.data("task_id") + "/delete/"
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

    adminCategories.children(".cats-link#category-edit-task").click(function(){
        var title = taskContent.find(".task-title")
        var description = taskContent.find(".task-description")
        var score = taskContent.find(".task-score")

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
        ], "/tasks/" + taskBlock.data("task_id") + "/edit/")
        openMessage()
    })

    function openMessage() {
        message.addClass("active")
    }

    function closeMessage() {
        message.removeClass("active")
    }

    /** Установка сообщения для администраторских нужд */
    function setupMessage(_title, _text, _ctrls, _action) {
        message.children(".message-title").text(_title)
        message.children(".message-text").text(_text)

        var form = message.children("#message-form").empty().removeAttr("enctype");
        if (_action) form.attr("action", _action)

        _ctrls.forEach(ctrl => {
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
                    control = $("<input name=\"" + name + "\" class=\"ctrl-" + name + "\" type=\"text\"" + (value ? " value=\"" + value + "\"" : "") + " />")
                    break
                case "textarea":
                    control = $("<textarea name=\"" + name + "\" class=\"ctrl-" + name + "\">" + (value ? value : "") + "</textarea>")
                    break
                case "submit":
                    control = $("<input type=\"submit\" id=\"" + id + "\" class=\"btn-inline ctrl-" + id + "\" value=\"" + label + "\" />")
                    break
                case "file":
                    form.attr("enctype", "multipart/form-data")
                    control = $("<label class=\"custom-file-upload\"><input type=\"file\" name=\"" + name + "\" class=\"ctrl-" + name + "\" />" + $(".lang-admin").data("add_file") + "</label>")
                    break
            }

            if (control) control.appendTo(form)
        })
    }

    
})