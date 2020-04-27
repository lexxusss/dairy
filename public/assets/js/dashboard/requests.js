
let multirevokes = [];

/*--- actions ---*/
$(document).on('shown.bs.modal', '.modal-request', function () {
    let modal = $(this);
    let modalTitle = modal.find('.modal-title');

    if (modal.find('.add_new_request_resource_type').length) {
        changeResourceSelectOptions($(this).find('.add_new_request_resource_type'));
    }
    if (modal.hasClass('multi-revoke')) {
        $.post('/api/get_requests', {ids: multirevokes}, function (forRequests) {
            let title = 'Revoke multiple for:';
            forRequests.forEach(function (forRequest) {
                title += '<br/><b>'+forRequest['name_by_resource']+'</b>';
            });
            modalTitle.html(title);

            modal.find('[name="ids"]').val(multirevokes);
        });
    }
});

$(document).on('click', '.multirevoke-input', function () {
    multirevokes = [];

    $(document).find('.multirevoke-input').each(function () {
        if ($(this).prop('checked')) {
            multirevokes.push($(this).val());
        }
    });

    if (multirevokes.length) {
        $('.multi-revoke-button').prop('disabled', false);
    } else {
        $('.multi-revoke-button').prop('disabled', true);
    }
});

$(document).on('change', '#add_new_request_requester', function () {
    changeResourceSelectOptions($(this).closest('.modal').find('.add_new_request_resource_type'));
});
/*--- /actions ---*/


/*--- FUNCTIONS ---*/
/**
 * Change resources list on change resource type
 */
function changeResourceSelectOptions(el) {
    let form = $(el).closest('form');
    let resourceType = $(el).val();

    form.find('.add_new_request_resource_block').find('select').hide();
    form.find('.add_new_request_resource_block').find('select[data-resourcetype="'+resourceType+'"]').show();

    toggleTimeRange(el);
}

/**
 * Toggle timerange on change resource
 */
function toggleTimeRange(el) {
    let form = $(el).closest('form');

    let val_resourceType = form.find('.add_new_request_resource_type').val();
    let option_ResourceType = form.find('.add_new_request_resource_type').find('option[value="'+val_resourceType+'"]');

    let add_new_request_resource = form.find('.add_new_request_resource_block').find('select[data-resourcetype="'+val_resourceType+'"]');
    let requester = form.find('#add_new_request_requester').val();

    let val_Resource = add_new_request_resource.val();
    let option_Resource = add_new_request_resource.find('option[value="'+val_Resource+'"]');
    let showTimeRange = option_Resource.data('show-timerange');

    // calendar - fetch disabled dates according to used resources by chosen requesters
    let timeRangeBlock = $('.time_range_block');
    if (showTimeRange) {
        disableForm(form);
        $.get('/api/get_disabled_dates/'+val_Resource+'/'+requester, function (disabledDates) {
            enableForm(form);

            timeRangeBlock.show(100);

            return initDateRangePicker(timeRangeBlock.find('.date-range'), disabledDates);
        });
    } else {
        timeRangeBlock.hide(100);
    }

    // requesters
    let requestersMultiple = true;
    if (option_ResourceType.data('is-timebased') && !option_ResourceType.data('is-parallel')) {
        requestersMultiple = false;
    }
    form.find('[name="requester_id[]"]').prop('multiple', requestersMultiple);
}

function updateStatePending(teamId, requestId) {
    $.post('/api/update_state_pending/'+teamId+'/'+requestId,  function (resp) {
        $('#request_state_'+requestId).text(resp.request.state);
        $('#header_notifications_html').html(resp.header_notifications_html);
    });
}
/*--- /FUNCTIONS ---*/
