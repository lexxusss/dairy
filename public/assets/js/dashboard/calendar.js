$(document).ready(function () {
    let eventsApi = '/api/get-calendar-events/'+_teamId+'?api_token='+__API_TOKEN__;

    let Calendar = window['FullCalendar']['Calendar'];

    let calendarEl = document.getElementById('calendar');

    let props = {
        plugins: ['dayGrid', 'timeGrid', 'bootstrap'],
        eventLimit: true,
        themeSystem: 'bootstrap',
        bootstrapFontAwesome: {
            close: 'fa-times',
            prev: 'fa-chevron-left',
            next: 'fa-chevron-right',
            prevYear: 'fa-angle-double-left',
            nextYear: 'fa-angle-double-right'
        },
        defaultView: 'dayGridMonth',
        header: {
            left: 'title',
            right: 'prev,today,next dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: 'auto',
        contentHeight: 'auto',
        events: eventsApi,
        eventMouseEnter: function(event) {
            let eventBlock = $(event.jsEvent.target).closest('td').find('.fc-event');
            eventBlock.popover({html:true, title: event.event.extendedProps.mouseoverInfo, placement:'top'}).popover('show');
        },
        eventMouseLeave: function(event) {
            let eventBlock = $(event.jsEvent.target).closest('td').find('.fc-event');
            eventBlock.popover('hide');
        }
    };

    let calendar = new Calendar(calendarEl, props);

    calendar.render();

    $('#resource_type_id, #user_requested_id').on('change',function() {
        let resourceTypes = $('#resource_type_id').val();
        let requesters = $('#user_requested_id').val();

        calendar.removeAllEvents();
        calendar.addEventSource(eventsApi+'&resource_type_id='+resourceTypes+'&user_requested_id='+requesters);
    })

});
