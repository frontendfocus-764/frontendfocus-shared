$(document).ready(function(){

	  $("#btn1").click(function(){
	  	var username=$(".uname").val();
	  	if(username.length >= 3 && username.match(/^[a-zA-Z0-9]*$/) && username.length <= 20){
	  		$(".error").hide();
	    	$(".myform").addClass('button_spin1');
		}
		else{
			$(".error").text("Invalid Username").show();
	    }
	  });

	  $("#btn2").click(function(){
	  	var email=$(".email").val();

		if(email.length != 0 && email.match(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)){
			$(".error").hide();
	    	$(".myform").addClass('button_spin2');
		}
		else{
			$(".error").text("Invalid Email").show();
	    }
	  });

	  $("#btn3").click(function(){
	  	var password=$(".password").val();
		if(password.length >= 2){
			$(".error").hide();
	    	$(".myform").addClass('button_spin3');
		}
		else{
			$(".error").text("Invalid Password").show();
	    }
	  });
	});