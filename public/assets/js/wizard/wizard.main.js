
window.onbeforeunload = confirmExit;
function confirmExit(e) {
    if (_CHANGES.applied) {
        e.preventDefault();

        let message = "Please save changes first!";
        e.returnValue = message;

        return message;
    }
}

$(document).ready(function () {
    $(window).scrollTop(0);
});

let team = null;
let collaborators = JSON.parse(JSON.stringify(_collaborators));
let resourceTypes = JSON.parse(JSON.stringify(_resourceTypes));

// init changes listener
let _CHANGES = {
    internal: false,

    removeButtonClass: null,
    addButtonClass: null,

    set applied(val) {
        this.internal = val;

        this.removeButtonClass = val ? 'btn-default' : 'btn-info';
        this.addButtonClass = val ? 'btn-info' : 'btn-default';

        $('.save-changes-wizard').removeClass(this.removeButtonClass).addClass(this.addButtonClass);
    },

    get applied() {
        return this.internal;
    }
};

function checkIfDataChanged() {
    return team !== _team ||
        !Object.equals(collaborators, _collaborators) ||
        !Object.equals(resourceTypes, _resourceTypes);
}

// /init changes listener

const MIN_LENGTH_TEAM_NAME = 3;

const table_titles_collaborators = [
    {title: "Email"},
    {title: "Is Admin"},
    {title: "Supervisor"},
    {title: "Status"},
    {title: "Action"},
];

let table_titles_resourceTypes = [
    {title: "Name"},
    {title: "Description"},
    {title: "Is time based"},
    {title: "Is parallel"},
    {title: "Approver"},
    {title: "Supervisor"},
    {title: "Action"},
];


let input_team = $('#teamName');
input_team.on('input', function () {
    trackTeamName();
});

let addNewCollaborator_Class = 'add-new-collaborator';
let editCollaborator_Class = 'edit-collaborator';
let collaboratorModal_Class = 'modal-add-new-collaborator';
let collaboratorsModal = $('.'+collaboratorModal_Class);
let collaboratorsForm = $('#add_new_collaborator_form');
let collaboratorsTable = $('#colaborators_table');

let addNewResourceType_Class = 'add-new-resource-type';
let editResourceType_Class = 'edit-resource-type';
let resourceTypeModal_Class = 'modal-add-new-resource-type';
let resourceTypeModal = $('.'+resourceTypeModal_Class);
let resourceTypeForm = $('#add_new_resource_type_form');
let resourceTypesTable = $('#resource_type_table');

let addNewResource_Class = 'add-new-resource';
let editResource_Class = 'edit-resource';
let resourceModal_Class = 'modal-add-new-resource';
let resourceModal = $('.'+resourceModal_Class);
let resourceForm = $('#add_new_resource_form');

// setup wizard
let wizard = $("#smartwizard");
$(document).ready(function () {
    let smartWizardSettings = {
        selected: _step,
        theme: 'dots',
        transitionEffect: 'fade',
        transitionSpeed: '400',
        showStepURLhash: true,
        useURLhash: false,
        toolbarSettings: {
            toolbarPosition: 'bottom',
            toolbarButtonPosition: 'center',
            showPreviousButton: !_wizardFinished,
            showNextButton: !_wizardFinished,
            toolbarExtraButtons: [
                $('<button></button>').text('Go to App')
                    .addClass('btn btn-lg btn-info ladda-button go-to-app')
                    .attr('data-style', 'expand-left')
                    .on('click', function(e) {
                        let l = Ladda.create(e.currentTarget);
                        l.start();
                        storeResourceTypes(function () {
                            l.stop;
                            window.location = '/granted_requests/'+_teamId
                        });
                    })
            ].concat(!_wizardFinished ? [] : [
                $('<button></button>').text('Save changes')
                    .addClass('btn btn-lg btn-default ladda-button save-changes-wizard')
                    .attr('data-style', 'expand-left')
                    .on('click', function(e) {
                        let l = Ladda.create(e.currentTarget);
                        l.start();
                        saveAllChanges(function() {
                            l.stop();
                            _CHANGES.applied = checkIfDataChanged();
                        });
                    })
            ])
        },
        anchorSettings: {
            anchorClickable: true, // Enable/Disable anchor navigation
            enableAllAnchors: true, // Activates all anchors clickable all times
        },
        lang: { // Language variables for button
            next: 'Save and Next',
            previous: 'Previous'
        }
    };

    wizard.smartWizard(smartWizardSettings);

    /*--- set up wizard step and fill in forms from user's wizard ---*/
    // fill in team
    team = _team;
    input_team.val(team);
    trackTeamName();

    // fill in collaborators
    collaborators = JSON.parse(JSON.stringify(_collaborators));
    buildTableCollaborators();

    // fill in resourceTypes
    resourceTypes = JSON.parse(JSON.stringify(_resourceTypes));
    buildTableResourceTypes();

    // store data on each step
    if (!_wizardFinished) {
        wizard.on("leaveStep", function (e, anchorObject, stepNumber) {
            wizard_LeaveStep_Trigger(stepNumber);
        });
    }

    // show/hide finish button
    wizard_ShowStep_Trigger(_step);
    wizard.on("showStep", function(e, anchorObject, stepNumber) {
        wizard_ShowStep_Trigger(stepNumber);
    });

    /*--- /set up wizard step and fill in forms from user's wizard ---*/
});
// /setup wizard

/**
 *
 * @param stepNumber
 */
function wizard_LeaveStep_Trigger(stepNumber) {
    if (!isTeamValid()) {
        wizard.trigger('goToStep', 0);
        wizard.trigger('showStep', 0);
    } else {
        if (stepNumber === 0) {
            storeTeam();
        } else if (stepNumber === 1) {
            storeCollaborators();
        } else if (stepNumber === 2) {
            storeResourceTypes();
        }
    }
}

/**
 *
 * @param stepNumber
 */
function wizard_ShowStep_Trigger(stepNumber) {
    _step = stepNumber;

    trackTeamName();

    let prev = $(".sw-btn-prev"),
        next = $(".sw-btn-next"),
        goToApp = $('.go-to-app'),
        saveChanges = $('.save-changes-wizard');

    saveChanges.show();
    goToApp.hide();
    prev.hide();
    next.hide().removeClass().addClass('btn btn-secondary sw-btn-next').text('Save and next');

    if (isTeamValid()) {
        if (stepNumber === 0) {
            next.show();
        } else if (stepNumber === 1) {
            prev.show();
            next.show();
        } else if (stepNumber === 2) {
            prev.show();
            next.show().text('Finish').removeClass().addClass('btn btn-lg btn-info sw-btn-next');
        } else if (stepNumber === 3) {
            saveChanges.hide();
            goToApp.show();
        }
    }
}


/**
 *
 * @param callback
 */
function storeTeam(callback = null) {
    $.post('/api/wizard/store-team'+(_teamId ? '/'+_teamId : ''), {team: team}, function (result) {
        // if new team is creating - redirect to TeamWizard after storing the team
        if (!_teamId) {
            _CHANGES.applied = false;

            return window.location = '/team_wizard/'+result.id;
        }

        _team = result.name;

        input_team.val(team);
        trackTeamName(_step);

        if (callback) {
            callback();
        }
    });
}

/**
 *
 */
function storeCollaborators(callback = null) {
    $.post('/api/wizard/store-collaborators/'+_teamId, {team: team, collaborators: collaborators ? collaborators : {}}, function (result) {
        let errorsBlock = $('.errors-block');
        errorsBlock.html(errorsBlock.html() + result.errors);

        $.get('/api/wizard/get-collaborators/'+_teamId, function (result2) {
            _collaborators = result2;
            collaborators = JSON.parse(JSON.stringify(_collaborators));
            buildTableCollaborators();
        });

        _CHANGES.applied = checkIfDataChanged();

        if (callback) {
            callback();
        }
    });
}

/**
 *
 * @param callback
 */
function storeResourceTypes(callback = null) {
    $.post('/api/wizard/store-resource-types/'+_teamId, {team: team, resource_types: resourceTypes ? resourceTypes : {}}, function (result) {
        let errorsBlock = $('.errors-block');
        errorsBlock.html(errorsBlock.html() + result.errors);

        $.get('/api/wizard/get-resource-types/'+_teamId, function (result2) {
            _resourceTypes = result2;
            resourceTypes = JSON.parse(JSON.stringify(_resourceTypes));
            buildTableResourceTypes();

            _CHANGES.applied = checkIfDataChanged();

            if (callback) {
                callback();
            }
        });
    });
}

/**
 *
 * @param callback
 */
function saveAllChanges(callback = null) {
    storeTeam(function (res) {
        storeCollaborators(function () {
            storeResourceTypes(callback);
        });
    });
}
// /store data on each step

/**
 * Draw the table
 *
 * @param table
 * @param columns
 * @param data
 */
function drawTable(table, columns, data) {
    table.html('');
    table.html('<thead></thead><tbody></tbody>');

    let thead = table.find('thead');
    let tbody = table.find('tbody');

    // build thead
    thead.append('<tr>');
    $.each(columns, function (k, column) {
        thead.append('<th>'+column.title+'</th>');
    });
    thead.append('</tr>');
    // /build thead

    // build tbody
    let body = '';
    $.each(data, function (k, tr_data) {
        body += '<tr>';
        $.each(tr_data,  function (k, td_data) {
            body += '<td>'+(td_data!==null?td_data:'')+'</td>';
        });
        body += '</tr>';
    });
    tbody.html(body);
    // /build tbody
}
