
let collaborator_ToEdit_Email = null;

buildTableCollaborators();

/**
 * bind click on add/edit collaborator
 * fill in form by collaborator data
 */
$(document).on('click', '.'+editCollaborator_Class, function () {
    initCollaborator_Supervisors_Select();

    collaborator_ToEdit_Email = $(this).data('collaboratoremail');

    let collaborator = collaborators[collaborator_ToEdit_Email];
    let title = $(this).data('title');

    collaboratorsModal.find('.modal-title').text(title);
    collaboratorsForm.find('#add_new_collaborator_email').val(collaborator.email);
    collaboratorsForm.find('#add_new_collaborator_is_admin')
        .prop('checked', collaborator.is_owner || collaborator.is_admin === 'yes')
        .prop('disabled', collaborator.is_owner);
    collaboratorsForm.find('#add_new_collaborator_supervisor').val(collaborator.supervisor);

    // disable edit email of user or removing if User has requests - show message: Not editable - user already has requests
    let elDisable = collaboratorsForm.find('#add_new_collaborator_email');
    if (collaborator.hasRequests) {
        disableElementWithTooltip(elDisable, elDisable, collaborator);
    } else {
        enableElementWithoutTooltip(elDisable, elDisable);
        collaboratorsForm.find('[type="hidden"][name="email"]').remove();
    }
});
$(document).on('click', '.'+addNewCollaborator_Class, function () {
    initCollaborator_Supervisors_Select();

    collaborator_ToEdit_Email = null;

    collaboratorsModal.find('.modal-title').text('Add new collaborator');
    collaboratorsForm.find('#add_new_collaborator_email').val('');
    collaboratorsForm.find('#add_new_collaborator_is_admin').prop('checked', false);

    // enable edit email of user or removing
    let elDisable = collaboratorsForm.find('#add_new_collaborator_email');
    enableElementWithoutTooltip(elDisable, elDisable);
    collaboratorsForm.find('[type="hidden"][name="email"]').remove();
});
function initCollaborator_Supervisors_Select() {
    let options = '<option value="'+_user.email+'">'+_user.email+' (You)</option>';

    $.each(collaborators, function (email, collaborator) {
        options += '<option value="'+collaborator.email+'">'+collaborator.email+'</option>';
    });

    collaboratorsForm.find('#add_new_collaborator_supervisor').html(options);
}
// / bind click on add/edit collaborator


/**
 * Add/edit collaborator engine
 */
collaboratorsModal.on('click', '.button-save', function () {
    $('#save_collaborator').click();
});
collaboratorsForm.on('submit', addCollaborator);
function addCollaborator(e) {
    e.preventDefault();

    let formData = collaboratorsForm.serializeArray();
    let data = {};
    formData.forEach(function (datum) {
        data[datum.name] = datum.value;
    });

    if (!collaborators.hasOwnProperty(data.email)) {
        data['status'] = 'pending';
    }

    if (collaborator_ToEdit_Email) {
        data.is_owner = collaborators[collaborator_ToEdit_Email].is_owner;
        data.hasRequests = collaborators[collaborator_ToEdit_Email].hasRequests;
        data.tooltipProps = collaborators[collaborator_ToEdit_Email].tooltipProps;
        data.status = collaborators[collaborator_ToEdit_Email].status;

        // if User has requests - do not let to change "email" options
        if (collaborators[collaborator_ToEdit_Email].hasRequests) {
            data.email = collaborator_ToEdit_Email;
        }

        collaborators[collaborator_ToEdit_Email] = data;
    } else {
        collaborators[data.email] = data;
    }

    buildTableCollaborators();

    _CHANGES.applied = checkIfDataChanged();

    collaboratorsModal.modal('hide');
}

/**
 * Remove collaborator engine
 * @param email
 */
function removeCollaborator(email) {
    delete collaborators[email];

    _CHANGES.applied = checkIfDataChanged();

    storeCollaborators();
}

/**
 * Build collaborators table
 */
function buildTableCollaborators() {
    let dataTable_Array = [];

    $.each(collaborators, function (email, collaborator) {
        dataTable_Array.push(addRowCollaborator(email, collaborator));
    });

    drawTable(collaboratorsTable, table_titles_collaborators, dataTable_Array);
}

/**
 *
 * @param email
 * @param collaborator
 * @returns {[]}
 */
function addRowCollaborator(email, collaborator) {
    let collaboratorArray = [];

    collaboratorArray.push(collaborator.email);
    collaboratorArray.push(collaborator.is_admin + (collaborator.is_owner ? ' (owner)' : ''));
    collaboratorArray.push(collaborator.supervisor);

    let status = collaborator.status;
    if (status !== COLLABORATOR_STATUS_PENDING) {
        status += '<form method="POST" action="/send_invitation/'+_teamId+'" accept-charset="UTF-8" style="display:inline">' +
            '<input name="_token" type="hidden" value="'+__CSRF_TOKEN__+'">\n' +
            '<input name="email" type="hidden" value="'+email+'">\n' +
            '<a href="javascript:void(0);" class="text-primary mr-2 alert-custom" data-type="warning" data-title="Are you sure ?" data-text="you are going to send invitation to user: '+email+'" data-showcancelbutton="true" data-confirmbuttoncolor="#3085d6" data-cancelbuttoncolor="#d33" data-confirmbuttontext="Yes, send it!" data-callback="$(this).closest(\'form\').submit()">\n' +
            '<i class="nav-icon i-Refresh font-weight-bold"></i>\n' +
            '</a>\n' +
            '</form>';
    }
    collaboratorArray.push(status);

    // push actions
    let editButton =
        '<a href="javascript:void(0);" class="text-success mr-2 ' + editCollaborator_Class + '"' +
        ' data-toggle="modal"' +
        ' data-target=".' + collaboratorModal_Class + '"' +
        ' data-title="Edit collaborator ' + collaborator.email + '"' +
        " data-collaborator='" + JSON.stringify(collaborator) + "'\n" +
        " data-collaboratoremail='" + collaborator.email + "'" +
        '>\n' +
        '<i class="nav-icon i-Pen-2 font-weight-bold"></i>\n' +
        '</a>\n';

    let removeButton = '';
    if (!collaborator.is_owner && !collaborator.hasRequests) {
        removeButton =
            '</a>\n' +
            '<a href="javascript:void(0);" class="text-danger mr-2 alert-custom"\n' +
            'data-type="warning"\n' +
            'data-title="Are you sure ?"\n' +
            'data-text="you are going to delete collaborator ' + collaborator.email + '"\n' +
            'data-showCancelButton=true\n' +
            'data-confirmButtonColor="#3085d6"\n' +
            'data-cancelButtonColor="#d33"\n' +
            'data-confirmButtonText="Yes, delete it!"\n' +
            'data-successtext="Collaborator ' + collaborator.email + ' has been deleted."\n' +
            'data-callback="removeCollaborator"\n' +
            "data-callbackargs='" + JSON.stringify([collaborator.email]) + "'\n>" +
            '<i class="nav-icon i-Close-Window font-weight-bold"></i>' +
            '</a>';
    }

    collaboratorArray.push(editButton+removeButton);

    return collaboratorArray;
}
