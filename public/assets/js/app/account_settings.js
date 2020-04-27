let setNewPassCheckbox = $('#set_new_password');
let setNewPassBlock = $('.set-new-password-block');

toggleSetNewPass.apply(setNewPassCheckbox);

setNewPassCheckbox.on('change', function () {
    toggleSetNewPass.apply(this);
});

function toggleSetNewPass() {
    setNewPassBlock.toggle($(this).is(':checked'), );
}

// replace photo
let img = $('#photo_view');
let imgInput = $('#photo_replace');
imgInput.change(function () {
    let file = this.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        img.attr('src', e.target.result);
    };
    reader.readAsDataURL(file);
});
// /replace photo

