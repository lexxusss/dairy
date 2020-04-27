
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
