$("#flag-submission").click(function() {
	var flag = $("#flag-input").val();

	var id = $("#task-id").val()
    $.ajax({
        url: "/submit/" + id + "/" + btoa(flag)
    }).done(function(data) {
        console.log(data);
        if (data["success"]) {
            $("#flag-input").val($(".lang").data("success"));
            $("#flag-submission").removeClass("btn-primary");
            $("#flag-submission").addClass("btn-success");
            $("#flag-submission").attr('disabled','disabled');
        } else {
            $("#flag-input").val($(".lang").data("failure"));
        }
    });
});

/** 
var captcha = grecaptcha.getResponse();
 
if (!captcha.length) {
  $('#recaptchaError').text('* Вы не прошли проверку "Я не робот"');
} else {
  $('#recaptchaError').text('');
}
 
if ((formValid) && (captcha.length)) {
  formData.append('g-recaptcha-response', captcha);
}  
grecaptcha.reset();
if ($data.msg) {
  $('#recaptchaError').text($data.msg);
}*/
