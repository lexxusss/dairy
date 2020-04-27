
$(document).ready(function() {
    /*--- init tables ---*/
    let SHOW_ALL_BUTTON = {
        text: SHOW_ALL_REQUESTS ? 'Show my requests' : 'Show all',
        className: 'btn btn-outline-secondary m-1',
        action: function(e, dt, node, config) {
            let urlParsed = parseUrl();
            urlParsed.params.view_all = (SHOW_ALL_REQUESTS ? 0 : 1);
            let url = buildUrl(urlParsed.url, urlParsed.params);

            console.log(urlParsed);
            console.log(url);
            location.href = url;
        },
        header: true
    };
    let CSV_BUTTON = {
        extend: 'csv',
        text: 'Export CSV',
        className: 'btn btn-outline-primary m-1',
        filename: 'dashboard',
        extension: 'csv',
        header: true
    };
    let buttons = [];
    if (USER_IS_ADMIN_OF_TEAM) {
        buttons.push(SHOW_ALL_BUTTON);
    }
    buttons.push(CSV_BUTTON);

    // table settings
    /*--- dashboard table ---*/
    let dashboardTableDom = $('#dashboard_table');
    let dashboardTable = dashboardTableDom.DataTable({
        dom: 'Bftlip',
        buttons: buttons,
        columnDefs: [
            { "orderable": false, "targets": 0 }
        ]
    });
    /*--- /dashboard table ---*/

    /*--- revokes table ---*/
    const groupColumn = 0;
    const ASC = 'asc';
    const DESC = 'desc';

    let currentOrder = ASC;
    let upArrStyle_Opacity = '0.5';
    let downArrStyle_Opacity = '1';

    let revokedDashboardTable = $('#revoked_requests_table').DataTable({
        dom: 'Bftlip',
        buttons: buttons,

        columnDefs: [
            {visible: false, targets: groupColumn}
        ],
        order: [[groupColumn, ASC]],
        displayLength: 10,
        drawCallback: function (settings) {
            let api = this.api();
            let rows = api.rows( {page:'current'} ).nodes();
            let last=null;

            api.column(groupColumn, {page:'current'}).data().each(function (group, i) {
                if (last !== group) {
                    $(rows).eq(i).before(
                        '<tr class="group">' +
                            '<td colspan="8">' +
                                '<span>'+group+'</span>' +
                            '</td>' +
                        '</tr>'
                    );

                    last = group;
                }
            } );
        }
    });
    /*--- /revokes table ---*/

    $('.dataTables_wrapper .dt-buttons').css('float', 'right');


    // tables filtering
    $('.dataTables_wrapper tfoot th').each( function () {
        if (!$(this).data('disabled')) {
            let title = $(this).text();
            $(this).html('<input type="text" placeholder="Search '+title+'" />');
        }
    } );
    revokedDashboardTable.columns().every(filterByColumn);
    dashboardTable.columns().every(filterByColumn);
    function filterByColumn() {
        let that = this;

        $('input', this.footer()).on('keyup change clear', function () {
            if (that.search() !== this.value) {
                that.search(this.value).draw();
            }
        });
    }
    /*--- /init tables ---*/
});
