$(document).ready(function(){
    $("#btn-open-register").click(function(){
        $("#modal-autorization").toggleClass("visible")
    })

    $("#modal-autorization").children("#bg-back").click(function(){
        $("#modal-autorization").removeClass("visible")
    })
})