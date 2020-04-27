let resourceType_ToEdit_Name = null;
let resource_ToEdit_Name = null;
let resource_ToEdit_ResourceTypeName = null;

let timeBasedCheckbox_Selector = 'input[name="time_based"][type="checkbox"]';

buildTableResourceTypes();

/**
 * bind click on add/edit resourceType
 * fill in form by resourceType data
 */
$(document).on('click', '.'+editResourceType_Class, function () {
    init_ResourceType_Supervisors_Select_Approvers_Select();

    resourceType_ToEdit_Name = $(this).data('resourcetypename');
    let resourceType = resourceTypes[resourceType_ToEdit_Name];
    let title = $(this).data('title');

    resourceTypeModal.find('.modal-title').text(title);
    resourceTypeForm.find('#add_new_resource_type-name').val(resourceType.name);
    resourceTypeForm.find('#add_new_resource_type-time_based').prop('checked', resourceType.time_based === 'yes');
    resourceTypeForm.find('#add_new_resource_type-approver').val(resourceType.approver);
    resourceTypeForm.find('#add_new_resource_type-supervisor').val(resourceType.supervisor ? resourceType.supervisor : _user.email);
    resourceTypeForm.find('#add_new_resource_type-parallel').prop('checked', resourceType.parallel === 'yes');

    // disable editing timebased/paralell or removing instance for ResourceType after it has request assigned - show message: Not editable - process type already has requests
    let elDisable = resourceTypeForm.find('#add_new_resource_type-time_based, #add_new_resource_type-parallel');
    let elTooltip = elDisable.parent().find('.checkmark');
    if (resourceType.hasRequests) {
        disableElementWithTooltip(elDisable, elTooltip, resourceType);
        resourceTypeForm.append('<input type="hidden" name="__time_based" value="'+resourceType.time_based+'">');
        resourceTypeForm.append('<input type="hidden" name="__parallel" value="'+resourceType.parallel+'">');
    } else {
        enableElementWithoutTooltip(elDisable, elTooltip);
        resourceTypeForm.find('[name="__time_based"]').remove();
        resourceTypeForm.find('[name="__parallel"]').remove();
    }

    // toggle time-based
    isTimeBasedToggle.apply(resourceTypeForm.find(timeBasedCheckbox_Selector));
});
$(document).on('click', '.'+addNewResourceType_Class, function () {
    init_ResourceType_Supervisors_Select_Approvers_Select();

    resourceType_ToEdit_Name = null;

    resourceTypeModal.find('.modal-title').text('Add new process type');
    resourceTypeForm.find('#add_new_resource_type-name').val('');
    resourceTypeForm.find('#add_new_resource_type-time_based').prop('checked', false);
    resourceTypeForm.find('#add_new_resource_type-parallel').prop('checked', false);

    // enable editing timebased/paralell or removing instance for ResourceType
    let elDisable = resourceTypeForm.find('#add_new_resource_type-time_based, #add_new_resource_type-parallel');
    let elTooltip = elDisable.parent().find('.checkmark');
    enableElementWithoutTooltip(elDisable, elTooltip);
    resourceTypeForm.find('[name="__time_based"]').remove();
    resourceTypeForm.find('[name="__parallel"]').remove();

    // toggle time-based
    isTimeBasedToggle.apply(resourceTypeForm.find(timeBasedCheckbox_Selector));
});
function init_ResourceType_Supervisors_Select_Approvers_Select() {
    let options = '<option value="'+_user.email+'">'+_user.email+' (You)</option>';

    $.each(collaborators, function (email, collaborator) {
        if (collaborator.email !== _user.email) {
            options += '<option value="'+collaborator.email+'">'+collaborator.email+'</option>';
        }
    });

    resourceTypeForm.find('#add_new_resource_type-approver, #add_new_resource_type-supervisor').html(options);
    resourceTypeForm.find('#add_new_resource_type-approver').prepend("<b><option value=0>Requester's supervisor</option></b>");
}
// / bind click on add/edit resourceType

// bind click on time-based checkbox
resourceTypeForm.on('change', timeBasedCheckbox_Selector, isTimeBasedToggle);
function isTimeBasedToggle() {
    resourceTypeForm.find('.is-parallel-block').toggle($(this).is(':checked'));
}
// bind click on time-based checkbox

/**
 * bind click on add/edit resource
 * fill in form by resource data
 */
$(document).on('click', '.'+editResource_Class, function () {
    initResource_ResourceTypes_Select();

    resource_ToEdit_Name = $(this).data('resourcename');
    resource_ToEdit_ResourceTypeName = $(this).data('resourcetypename');

    let resourceType = resourceTypes[resource_ToEdit_ResourceTypeName];
    let resource = resourceType.resources[resource_ToEdit_Name];
    let title = $(this).data('title');

    resourceModal.find('.modal-title').text(title);
    resourceForm.find('#add_new_resource-name').val(resource.name);
    resourceForm.find('#add_new_resource-description').val(resource.description);
    resourceForm.find('#add_new_resource-resource_type').val(resourceType.name);
    resourceForm.find('#add_new_resource-exists').val(resource.exists ? 1 : 0);

    // disable moving Resource to another ResourceType or removing if Resource has requests - show message: Not editable - process already has requests
    let elDisable = resourceForm.find('#add_new_resource-resource_type');
    if (resource.hasRequests) {
        disableElementWithTooltip(elDisable, elDisable, resource);
        resourceForm.append('<input type="hidden" name="resource_type" value="'+resourceType.name+'">');
    } else {
        enableElementWithoutTooltip(elDisable, elDisable);
        resourceForm.find('[type="hidden"][name="resource_type"]').remove();
    }
});
$(document).on('click', '.'+addNewResource_Class, function () {
    initResource_ResourceTypes_Select();

    let resourceTypeName = $(this).data('resourcetypename');

    resource_ToEdit_Name = null;
    resource_ToEdit_ResourceTypeName = null;

    resourceModal.find('.modal-title').text('Add new item');
    resourceForm.find('#add_new_resource-name').val('');
    resourceForm.find('#add_new_resource-description').val('');
    resourceForm.find('#add_new_resource-resource_type').val(resourceTypeName);

    // enable moving Resource to another ResourceType or removing
    let elDisable = resourceForm.find('#add_new_resource-resource_type');
    enableElementWithoutTooltip(elDisable, elDisable);
    resourceForm.find('[type="hidden"][name="resource_type"]').remove();
});
function initResource_ResourceTypes_Select() {
    resourceForm.find('#add_new_resource-resource_type').html('');
    $.each(resourceTypes, function (name, resourceType) {
        resourceForm.find('#add_new_resource-resource_type').append(
            '<option value="'+name+'">'+resourceType.name+'</option>'
        );
    });
}
// / bind click on add/edit resource

/**
 * Add/edit resourceType engine
 */
resourceTypeModal.on('click', '.button-save', function () {
    $('#save_resource_type').click();
});
resourceTypeForm.on('submit', addResourceType);
function addResourceType(e) {
    e.preventDefault();

    let formData = resourceTypeForm.serializeArray();
    let data = {};
    formData.forEach(function (datum) {
        data[datum.name] = datum.value;
    });

    if (resourceType_ToEdit_Name) {
        let resources = resourceTypes[resourceType_ToEdit_Name].resources;

        data.hasRequests = resourceTypes[resourceType_ToEdit_Name].hasRequests;
        data.tooltipProps = resourceTypes[resourceType_ToEdit_Name].tooltipProps;

        // if resourceType has requests - do not let to change "time_based", "parallel" options
        if (resourceTypes[resourceType_ToEdit_Name].hasRequests) {
            data.time_based = data.__time_based;
            data.parallel = data.__parallel;
        }

        resourceTypes[resourceType_ToEdit_Name] = data;
        resourceTypes[resourceType_ToEdit_Name].resources = resources;
    } else {
        resourceTypes[data.name] = data;
    }

    buildTableResourceTypes();

    _CHANGES.applied = checkIfDataChanged();

    resourceTypeModal.modal('hide');
}

/**
 * Add/edit resource engine
 */
resourceModal.on('click', '.button-save', function () {
    $('#save_resource').click();
});
resourceForm.on('submit', addResource);
function addResource(e) {
    e.preventDefault();

    let formData = resourceForm.serializeArray();
    let data = {};
    formData.forEach(function (datum) {
        data[datum.name] = datum.value;
    });

    let resourceType = resourceTypes[data.resource_type];
    if (!resourceType.hasOwnProperty('resources') || resourceType.resources.length === 0) {
        resourceType.resources = {};
    }

    if (resource_ToEdit_Name) {
        let oldResourceType = resourceTypes[resource_ToEdit_ResourceTypeName];
        let resource = oldResourceType.resources[resource_ToEdit_Name];

        // if resourceType has been changed and Resource has requests
        if (resource.hasRequests && oldResourceType.name !== resourceType.name) {
            Swal.fire({
                title: 'Error',
                html: resource.tooltipProps.title,
                type: 'error',
                confirmButtonText: 'Dismiss',
                buttonsStyling: false,
                confirmButtonClass: 'btn btn-lg btn-danger'
            })
        } else {
            // remove resource from old resource type
            delete oldResourceType.resources[resource_ToEdit_Name];

            // move resource to new resource type
            resourceType.resources[resource_ToEdit_Name] = data;
        }
    } else {
        resourceType.resources[data.name] = data;
    }

    buildTableResourceTypes();

    _CHANGES.applied = checkIfDataChanged();

    resourceModal.modal('hide');
}

/**
 * Remove resourceType engine
 * @param name
 */
function removeResourceType(name) {
    delete resourceTypes[name];

    _CHANGES.applied = checkIfDataChanged();

    storeResourceTypes();
}

/**
 * Remove resourceType engine
 *
 * @param resourceTypeName
 * @param resourceName
 */
function removeResource(resourceTypeName, resourceName) {
    delete resourceTypes[resourceTypeName].resources[resourceName];

    _CHANGES.applied = checkIfDataChanged();

    storeResourceTypes();
}

/**
 * Build resourceTypes table
 */
function buildTableResourceTypes() {
    let dataTable_Array = [];
    $.each(resourceTypes, function (resourceTypeName, resourceType) {
        dataTable_Array.push(getResourceTypeRaw_HTML(resourceType, resourceTypeName));

        // push resources of this resource type
        $.each(resourceType.resources, function (resourceName, resource) {
            dataTable_Array.push(getResourceRaw_HTML(resource, resourceName, resourceTypeName));
        });
        // /push resources of this resource type

        // push add new resource button
        dataTable_Array.push([
            '<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\n' +
            '<a href="javascript:void(0);" class="'+addNewResource_Class+'"\n' +
            ' data-toggle="modal"\n' +
            ' data-target=".'+resourceModal_Class+'"\n' +
            ' data-resourcetypename="'+resourceTypeName+'"' +
            ' data-toggledby="'+resourceTypeName+'">' +
                '<span class="badge badge-pill badge-outline-info p-2 m-1">Add new item</span>\n' +
            '</a>',
            null,null,null,null,null
        ]);
        // /push add new resource button
    });

    drawTable(resourceTypesTable, table_titles_resourceTypes, dataTable_Array);
}

function getResourceRaw_HTML(resource, resourceName, resourceTypeName) {
    let resourceArray = [];

    resourceArray.push('<span data-toggledby="'+resourceTypeName+'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'+resource.name);
    resourceArray.push(resource.description);
    resourceArray.push(null);
    resourceArray.push(null);
    resourceArray.push(null);
    resourceArray.push(null);

    // push actions - resource
    let actions_Resource =
        '<a href="javascript:void(0);" class="text-success mr-2 ' + editResource_Class + '"' +
        ' data-toggle="modal"' +
        ' data-target=".' + resourceModal_Class + '"' +
        " data-resourcename='" + resourceName + "'" +
        " data-resourcetypename='" + resourceTypeName + "'" +
        ' data-title="Edit item \'' + resource.name + '\'"' +
        '>\n' +
        '<i class="nav-icon i-Pen-2 font-weight-bold"></i>\n' +
        '</a>\n';
    if (!resource.hasRequests) {
        actions_Resource +=
            '<a href="javascript:void(0);" class="text-danger mr-2 alert-custom"\n' +
            'data-type="warning"\n' +
            'data-title="Are you sure ?"\n' +
            'data-text="you are going to delete resource ' + resource.name + '"\n' +
            'data-showCancelButton=true\n' +
            'data-confirmButtonColor="#3085d6"\n' +
            'data-cancelButtonColor="#d33"\n' +
            'data-confirmButtonText="Yes, delete it!"\n' +
            'data-successtext="Resource ' + resource.name + ' has been deleted."\n' +
            'data-callback="removeResource"\n' +
            "data-callbackargs='" + JSON.stringify([resourceTypeName, resourceName]) + "'\n>" +
            '<i class="nav-icon i-Close-Window font-weight-bold"></i>' +
            '</a>';
    }
    // /push actions - resource

    resourceArray.push(actions_Resource);

    return resourceArray;
}

function getResourceTypeRaw_HTML(resourceType, resourceTypeName) {
    let resourceTypeArray = [];

    resourceTypeArray.push('' +
        '<a class="consists_of" href="javascript:void(0);" onclick="toggleTr(this, \''+resourceTypeName+'\');" data-name="'+resourceType.name+'">\n' +
        '<span><i class="i-Reset"></i>  '+resourceType.name+'   </span><i class="i-Arrow-Right"></i>\n' +
        '</a>'
    );
    resourceTypeArray.push(null);
    resourceTypeArray.push(resourceType.time_based);
    resourceTypeArray.push(resourceType.parallel);
    resourceTypeArray.push(resourceType.approver);
    resourceTypeArray.push(resourceType.supervisor);

    // push actions - resourceType
    let actions_ResourceType =
        '<a href="javascript:void(0);" class="text-success mr-2 ' + editResourceType_Class + '"' +
        ' data-toggle="modal"' +
        ' data-target=".' + resourceTypeModal_Class + '"' +
        ' data-title="Edit process type ' + resourceType.name + '"' +
        " data-resourcetypename='" + resourceTypeName + "'" +
        '>\n' +
        '<i class="nav-icon i-Pen-2 font-weight-bold"></i>\n' +
        '</a>\n';
    if (!resourceType.hasRequests) {
        actions_ResourceType +=
            '<a href="javascript:void(0);" class="text-danger mr-2 alert-custom"\n' +
            'data-type="warning"\n' +
            'data-title="Are you sure ?"\n' +
            'data-text="you are going to delete resource type ' + resourceType.name + '"\n' +
            'data-showCancelButton=true\n' +
            'data-confirmButtonColor="#3085d6"\n' +
            'data-cancelButtonColor="#d33"\n' +
            'data-confirmButtonText="Yes, delete it!"\n' +
            'data-successtext="Resource type ' + resourceType.name + ' has been deleted."\n' +
            'data-callback="removeResourceType"\n' +
            "data-callbackargs='" + JSON.stringify([resourceTypeName]) + "'\n>" +
            '<i class="nav-icon i-Close-Window font-weight-bold"></i>' +
            '</a>';
    }
    resourceTypeArray.push(actions_ResourceType);
    // /push actions - resourceType

    return resourceTypeArray;
}

