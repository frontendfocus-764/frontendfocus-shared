var values = document.getElementById("colorscontent");
var reverse = document.getElementById("reverser");
var transition = document.getElementById("gradient-stop");
var startColors = [
	"rgb(255, 195, 0)",
	"rgb(107, 0, 205)",
	];
var gradientTransition = 100;

document.body.style.background = "linear-gradient(90deg, rgba(255,195,0,1) 0%, rgba(107,0,205,1) " + gradientTransition + "%)";

var colorPicker = new iro.ColorPicker("#picker", {
  width: 250,
  colors: startColors,
	borderWidth: 1,
  borderColor: "#fff",
});

colorPicker.on('color:change', function(color) {
	var gradientStr = "linear-gradient(90deg";
	
	gradientStr = recalcColor(gradientStr);

	values.innerHTML = gradientStr;
	if(color.hsl.l < 25 || (color.hsl.l < 60 && (color.hsl.h < 45 || color.hsl.h > 180))) {
		document.getElementById('colorscontent').style.color = '#fff';
	} else {
		document.getElementById('colorscontent').style.color = '#2f3640';
	}
	document.body.style.background = gradientStr;
});

// Reverse the gradient colors when the button is clicked
reverse.addEventListener('click', function(e) {
	var colorZero = colorPicker.colors[0].rgbString;
	var colorOne = colorPicker.colors[1].rgbString;
	colorPicker.colors[0].rgbString = colorOne;
	colorPicker.colors[1].rgbString = colorZero;
});

// Recalculate the gradient string using the selected colors from the color picker
function recalcColor(gradientStr) {
	//var gradientStop = 100/(this.colors.length-1);
	var gradientStop = gradientTransition;
	var gradientStopCount = 0;
	var colorIndex = 0;

	colorPicker.colors.forEach(function (singleCcolor) {
		colorIndex++;
		if(colorIndex <= 1 ) {
			gradientStr += ','+singleCcolor.hexString+' '+gradientStopCount+'0%';
		} else {
			gradientStr += ','+singleCcolor.hexString+' '+gradientStopCount+'%';
		}
		gradientStopCount = gradientStopCount + Math.round(gradientStop);
		console.log(gradientTransition);
		console.log(gradientStopCount);
	})
	gradientStr += ')';
	return gradientStr;
}

// Get the value of the transition slider and update the background gradeint and text
transition.addEventListener('change', function(e) {
	var gradientStr = "linear-gradient(90deg";
	
	gradientTransition = transition.innerHTML = this.value;
	gradientStr = recalcColor(gradientStr);
	values.innerHTML = gradientStr;
	document.body.style.background = gradientStr;
});