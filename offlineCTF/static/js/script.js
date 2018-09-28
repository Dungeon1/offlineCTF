$(document).ready(function(){
    $("#btn-open-register").click(openRegisterForm)

    $("#btn-open-login").click(openLoginForm)

    $("#modal-authorization").children("#bg-back").click(clearAll)

    $("#toggler-register").click(function(){
        clearAll();

        openRegisterForm();
    })

    $("#toggler-login").click(function(){
        clearAll();

        openLoginForm();
    })

    $("#modal-authorization").find(".forgot-password").click(function(){
        $("#modal-authorization").find(".authorization-form-forgot").toggleClass("visible")
    })

    function openRegisterForm() {
        $("#modal-authorization")
        .toggleClass("visible")
        .find(".authorization-form-register")
        .addClass("visible")

        $("#authorization-toggler").children("#toggler-register").addClass("active")
        
    }

    function openLoginForm() {
        $("#modal-authorization")
        .toggleClass("visible")
        .find(".authorization-form-login")
        .addClass("visible")

        $("#authorization-toggler").children("#toggler-login").addClass("active")
        
    }

    function clearAll() {
        $("#modal-authorization").find(".authorization-form-forgot").removeClass("visible")
        $("#modal-authorization").removeClass("visible")
        .find("#authorization-toggler").children(".toggler-btn")
        .removeClass("active")

        $("#modal-authorization").find(".authorization-content")
        .children(".authorization-form")
        .removeClass("visible")
    }
})