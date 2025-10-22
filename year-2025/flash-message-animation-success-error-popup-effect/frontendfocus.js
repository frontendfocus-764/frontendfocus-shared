var success = false;
var message;

function connect() {
    $('.btn').addClass('loading');
    $('.btn').off('click', connect);
    setTimeout(misteryMessage, 2000);
}

function misteryMessage() {
    message = (success) ? 'success' : 'error';
    $('.message-' + message).addClass('active');
    setTimeout(function () {
        $('.btn').removeClass('loading');
    }, 500);
    success = !success;
}

function closeMessage() {
    $('.message-' + message).removeClass('active');
    $('.btn').on('click', connect);
}

$('.btn').on('click', connect);
$('.close').click(closeMessage);