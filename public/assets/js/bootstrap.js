
$.fn.serializeObject = function() {
    let o = {};
    let a = this.serializeArray();

    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }

            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$.extend({
    isNotEmpty: function(el) {
        switch (typeof el) {
            case 'string':
            case 'array':
                return !! el.length;
            case 'object':
                return !$.isEmptyObject(el);
            case 'number':
                return !! el;
            case 'undefined':
            default:
                return false;
        }
    }
});

Object.filter = (obj, predicate = null) =>
    Object.keys(obj)
        .filter( key => predicate ? predicate(obj[key]) : $.isNotEmpty(obj[key]) )
        .reduce( (res, key) => (res[key] = obj[key], res), {} );

