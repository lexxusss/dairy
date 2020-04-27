const stripe = Stripe(__STRIPE_API_KEY__);

$(document).on('click', '.checkout-button-plan', function () {
    let plan = $(this).data('stripe-hash');
    stripe.redirectToCheckout({
        items: [{plan: plan, quantity: 1}],

        // Do not rely on the redirect to the successUrl for fulfilling
        // purchases, customers may not always reach the success_url after
        // a successful payment.
        // Instead use one of the strategies described in
        // https://stripe.com/docs/payments/checkout/fulfillment
        successUrl: __URL__+'/team_wizard/'+_teamId+'?stripe_status=success',
        cancelUrl: __URL__+'/team_wizard/'+_teamId+'?stripe_status=canceled',
    })
        .then(function (result) {
            if (result.error) {
                $('#error-message').text(result.error.message);
            }
        });
});
