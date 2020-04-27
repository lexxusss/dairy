$(document).ready(function () {

    let smartWizard = $("#smartwizard");

    // Step show event
    smartWizard.on("showStep", function (e, anchorObject, stepNumber, stepDirection, stepPosition) {
        alert("You are on step "+stepNumber+" now");
        if (stepPosition === 'first') {
            $("#prev-btn").addClass('disabled');
        } else if (stepPosition === 'final') {
            $("#next-btn").addClass('disabled');
        } else {
            $("#prev-btn").removeClass('disabled');
            $("#next-btn").removeClass('disabled');
        }
    });

    // Toolbar extra buttons
    var btnFinish = $('<button></button>').text('Finish')
        .addClass('btn btn-info')
        .on('click', function () { alert('Finish Clicked'); });
    var btnCancel = $('<button></button>').text('Cancel')
        .addClass('btn btn-danger')
        .on('click', function () { smartWizard.smartWizard("reset"); });


    // Smart Wizard
    smartWizard.smartWizard({
        selected: 0,
        theme: 'dots',
        transitionEffect: 'fade',
        showStepURLhash: true,
        toolbarSettings: {
            toolbarPosition: 'bottom',
            toolbarButtonPosition: 'center'
        },
        lang: { // Language variables for button
            next: 'Save and Next',
            previous: 'Previous'
        },
    });


    // External Button Events
    $("#reset-btn").on("click", function () {
        // Reset wizard
        smartWizard.smartWizard("reset");
        return true;
    });

    $("#prev-btn").on("click", function () {
        // Navigate previous
        smartWizard.smartWizard("prev");
        return true;
    });

    $("#next-btn").on("click", function () {
        // Navigate next
        smartWizard.smartWizard("next");
        return true;
    });

    $("#theme_selector").on("change", function () {
        // Change theme
        smartWizard.smartWizard("theme", $(this).val());
        return true;
    });

    // Set selected theme on page refresh
    $("#theme_selector").change();
});
