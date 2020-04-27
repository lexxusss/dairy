
const __API_TOKEN__ = $('meta[name="_api_token"]').attr('content');
const __CSRF_TOKEN__ = $('meta[name="csrf-token"]').attr('content');
const __URL__ = $('meta[name="_URL"]').attr('content');
const __STRIPE_API_KEY__ = $('meta[name="_STRIPE_API_KEY"]').attr('content');
const __USER_ID__ = $('meta[name="__USER_ID"]').attr('content');

$.ajaxSetup({
    headers: {
        'Authorization': 'Bearer ' + __API_TOKEN__,
        'Cache-control': 'no-store',
    }
});

Object.equals = function( x, y ) {
    if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

    if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for ( var p in x ) {
        if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor

        if ( ! y.hasOwnProperty( p ) ) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal

        if ( typeof( x[ p ] ) !== "object" ) return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
        // Objects and Arrays must be tested recursively
    }

    for ( p in y ) {
        if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
        // allows x[ p ] to be set to undefined
    }
    return true;
};

$(document).ready(function () {
    // enable tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // popover
    $("[data-toggle=popover]").popover({
        html: true
    });

    // date/time range settings
    $('.date-range, .date-range-infinite').each(function () {
        return initDateRangePicker($(this));
    });

    // page preloader
    $('.page-preloader').hide();
    $('.app-admin-wrap').show();
});


$(document).on('click', '.modal-request .button-save', function () {
    $(this).closest('.modal-content').find('form').submit();
});


$(document).on('click', '.alert-custom', function () {
    let el = $(this);

    Swal.fire({
        title: el.data('title'),
        text: el.data('text'),
        type: el.data('type'),
        showCancelButton: el.data('showcancelbutton'),
        confirmButtonColor: el.data('confirmbuttoncolor'),
        cancelButtonColor: el.data('cancelbuttoncolor'),
        confirmButtonText: el.data('confirmbuttontext')
    }).then((result) => {
        if (result.value) {
            if (el.data('callback')) {
                let callback = el.data('callback');

                if (window[callback]) {
                    window[callback].apply(null, el.data('callbackargs'));
                } else {
                    eval(callback);
                }
            }
        }
    });
});

$(document).on('click', '#timerange-switcher', trackTimeRangeSwitcher);

function trackTimeRangeSwitcher() {
    let checkbox = $(this);
    let formGroup = checkbox.closest('.form-group');

    let dateRange = formGroup.find('#add_new_request_date_range'),
        dateRangeInfinite = formGroup.find('#add_new_request_date_range_infinite');

    if (!checkbox.is(':checked')) {
        dateRange.hide();
        dateRangeInfinite.show();

        initDateRangePicker(dateRangeInfinite);
    } else {
        dateRangeInfinite.hide();
        dateRange.show();

        initDateRangePicker(dateRange);
    }
}

function initDateRangePicker(dateRangeInput, disabledDates = {}) {
    return dateRangeInput.daterangepicker(
        {
            singleDatePicker: dateRangeInput.data('single') ? dateRangeInput.data('single') : false,
            timePicker: dateRangeInput.data('disable-time') ? !dateRangeInput.data('disable-time') : true,
            minDate: moment(),
            startDate: dateRangeInput.data('value-from') ? moment(dateRangeInput.data('value-from')) : moment(),
            endDate: dateRangeInput.data('value-to') ? moment(dateRangeInput.data('value-to')) : moment().endOf('day'),
            opens: 'left',
            locale: {
                format: dateRangeInput.data('locale-format') ? dateRangeInput.data('locale-format') : 'DD.MM.YYYY HH:mm'
            },
            timePicker24Hour: true,
            timePickerIncrement: 15,
            isInvalidDate: function(date) {
                let _isInvalid = false;

                $.each(disabledDates, function (key, disabledDateRange) {
                    _isInvalid |= date.isBetween(disabledDateRange.time_from, disabledDateRange.time_to);
                });

                return _isInvalid;
            }
        },
        function(start, end) {
            dateRangeInput.parent().find('input[name="timestamp_from_toUnix"]').val(start.unix());
            dateRangeInput.parent().find('input[name="timestamp_to_toUnix"]').val(end.unix());
            dateRangeInput.parent().find('.add_new_request_use_old_timerange').val(0);
        }
    );
}


/**
 *
 * @returns {{search: string, params: any, url: string}}
 */
function parseUrl() {
    let url = location.href.split('?')[0];
    let search = _trim(location.search.substring(1), '&');
    let params = search
        ? JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })
        : {};

    return {
        url: url,
        search: search,
        params: params
    };
}

/**
 *
 * @param s
 * @param mask
 * @returns {*}
 * @private
 */
function _trim(s, mask) {
    while (~mask.indexOf(s[0])) {
        s = s.slice(1);
    }
    while (~mask.indexOf(s[s.length - 1])) {
        s = s.slice(0, -1);
    }
    return s;
}

/**
 *
 * @returns {{search: string, params: any, url: string}}
 */
function buildUrl(url, params) {
    if (!$.isEmptyObject(params)) {
        url += '?';
        $.each(params, function (key, param) {
            url += key+'='+param+'&';
        });
        url = _trim(url, '&');
    }

    return url;
}

function disableForm(form) {
    form.css('opacity', '0.5').find(':input').each(function () {
        $(this).prop('disabled', true);
    });
}

function enableForm(form) {
    form.css('opacity', '1').find(':input').each(function () {
        $(this).prop('disabled', false);
    });
}

/**
 * Toggle tr
 *
 * @param el
 * @param toggleName
 */
function toggleTr(el ,toggleName)  {
    $('[data-toggledby="'+toggleName+'"]').closest('tr').toggle(150);

    let arrows = $(el).find('.i-Arrow-Down');
    if (arrows.length) {
        arrows.removeClass('i-Arrow-Down').addClass('i-Arrow-Right');
    } else {
        arrows = $(el).find('.i-Arrow-Right');
        arrows.removeClass('i-Arrow-Right').addClass('i-Arrow-Down');
    }
}

function disableElementWithTooltip(elDisable, elTooltip, ob) {
    elDisable.prop('disabled', true);

    elTooltip.tooltip(ob.tooltipProps);
}

function enableElementWithoutTooltip(elDisable, elTooltip) {
    elDisable.prop('disabled', false);

    elTooltip.off('.tooltip');
}
