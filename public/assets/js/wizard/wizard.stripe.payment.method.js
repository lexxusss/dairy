/*--- toggle switcher ---*/
let updatePaymentMethodCheckbox = $('#update_payment_method');
let updatePaymentMethodBlock = $('.update-payment-method-form');
toggleSwitcher.apply(updatePaymentMethodCheckbox);
updatePaymentMethodCheckbox.on('change', function () {
    toggleSwitcher.apply(this);
});
function toggleSwitcher() {
    updatePaymentMethodBlock.toggle($(this).is(':checked'), );
}
/*--- /toggle switcher ---*/



/*--- payment method ---*/
const stripe = Stripe(__STRIPE_API_KEY__);

const elements = stripe.elements();
// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
let style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};
const cardElement = elements.create('card', {style: style});

cardElement.mount('#card_element');



const cardHolderName = document.getElementById('card_holder_name');
const cardButton = document.getElementById('card_button');
const clientSecret = cardButton.dataset.secret;
const paymentMethodForm = $('.payment-method-form');


$(document).bind('keydown', function (e) {
    let txtArea = /textarea/i.test((e.target || e.srcElement).tagName);

    return txtArea || (e.keyCode || e.which || e.charCode || 0) !== 13;
});

cardButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const { setupIntent, error } = await stripe.handleCardSetup(
        clientSecret, cardElement, {
            payment_method_data: {
                billing_details: { name: cardHolderName.value }
            }
        }
    );

    if (error) {
        Swal.fire({
            text: error.message,
            type: 'error',
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Ok",
        }).then((result) => {
            location.reload();
        });
    } else {
        Swal.fire({
            title: 'Success',
            text: 'The card has been verified successfully',
            type: 'success',
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Ok, update my default payment method",
            cancelButtonColor: "#d33",
        }).then((result) => {
            if (result.value) {
                paymentMethodForm.find('[name="payment_method_id"]').val(setupIntent.payment_method);

                paymentMethodForm.submit();
            }
        });
    }
});
/*--- /payment method ---*/
