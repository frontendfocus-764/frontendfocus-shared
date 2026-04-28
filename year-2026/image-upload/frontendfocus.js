
$('input[name="upload-img"]').on('change', function(){
  readURL(this, $('.file-wrapper'));  //Change the image
});

$('.close-btn').on('click', function(){ //Unset the image
   let file = $('input[name="upload-img"]');
   $('.file-wrapper').css('background-image', 'unset');
   $('.file-wrapper').removeClass('file-set');
   file.replaceWith( file = file.clone( true ) );
});

//FILE
function readURL(input, obj){
  if(input.files && input.files[0]){
    var reader = new FileReader();
    reader.onload = function(e){
      obj.css('background-image', 'url('+e.target.result+')');
      obj.addClass('file-set');
    }
    reader.readAsDataURL(input.files[0]);
  }
};