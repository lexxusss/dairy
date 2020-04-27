let revokesChosen = {};
let grantsChosen = {};

let dashboardTable = $('.dashboard-table');
let requestsForm = $('#requests_form');
let grantsForm = $('#multi_grants_form');

dashboardTable.find('.grant_type').each(function () {
    trackGrant.apply(this);
});
checkGrantsButton();

dashboardTable.on('click', '.grant_type', function () {
    trackGrant.apply(this);
    checkGrantsButton();
});

grantsForm.on('submit', function (e) {
    e.preventDefault();

    $(this).closest('.modal').modal('hide');

    let form = $(this);
    let data = form.serializeObject();
    data.grants = grantsChosen;

    disableForm(requestsForm);
    $.post(form.data('api-action'), data, function (result) {
        let errorsBlock = $('.errors-block');
        errorsBlock.html(errorsBlock.html() + result.errors);

        enableForm(requestsForm);

        console.log(result);
    });
});

function trackGrant() {
    let grant = $(this);

    let type = grant.attr('type'),
        checked = grant.is(':checked'),
        requester = grant.val(),
        resource = grant.attr('name');

    grantsChosen[resource] = (grantsChosen[resource] && type !== 'radio')
        ? grantsChosen[resource]
        : {};

    if (checked) {
        grantsChosen[resource][requester] = 1;
    } else {
        delete grantsChosen[resource][requester];
    }
}

function checkGrantsButton() {
    grantsChosen = Object.filter(grantsChosen);

    grantsForm.find('[name="grants"]').val(JSON.stringify(grantsChosen));

    $('.multi-grant-button').prop('disabled', !$.isNotEmpty(grantsChosen));
}
