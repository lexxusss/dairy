

input_team.on('keydown', hitNextOnEnter);

function hitNextOnEnter(e) {
    let char = e.keyCode || e.which;

    if (char === 13 && isTeamValid()) {
        $(".sw-btn-next").click();
    }
}

$(document).on('click', ".sw-btn-next", function () {
    if (!_teamId) {
        storeTeam();
    }
});

function trackTeamName() {
    team = input_team.val();

    if (!isTeamValid()) {
        $(".sw-btn-next, .save-changes-wizard").hide();
        $("#teamNameAlert").show();
    } else {
        if (_step !== 2) {
            $(".sw-btn-next, .save-changes-wizard").show().prop('disabled', false).removeClass('disabled');
        }
        $("#teamNameAlert").hide();
    }

    _CHANGES.applied = checkIfDataChanged();
}

function isTeamValid() {
    return input_team.val() && input_team.val().length >= MIN_LENGTH_TEAM_NAME;
}
