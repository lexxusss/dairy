let errorsBlock = $('.errors-block');
window.pusher
    .subscribe('invoice-subscription-create.' + __USER_ID__)
    .bind('invoice-subscription-created-event', function(result) {
        generateFlashMessages(result, 'success');
        fetchTeamPlans();
    });

window.pusher.subscribe('invoice-subscription-abort.' + __USER_ID__)
    .bind('invoice-subscription-aborted-event', function(result) {
        generateFlashMessages(result, 'danger');
        fetchTeamPlans();
    });

function generateFlashMessages(result, flashClass) {
    let errorsHtml = errorsBlock.html();
    errorsBlock.html(errorsHtml + '<div class="alert alert-'+flashClass+' alert-block">\n' +
        '    <button type="button" class="close" data-dismiss="alert">×</button>\n' +
        '    <strong>' + result.data.message + '</strong>\n' +
        '</div>');

    $.get('/api/get-header-notifications',  function (resp) {
        $('#header_notifications_html').html(resp.html);
    });
}

function fetchTeamPlans() {
    if (_teamId) {
        $.get('/api/wizard/get-team-plans/' + _teamId, function (result2) {
            $('.team-plans').html(result2.html);
        });
    }
}

