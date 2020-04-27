<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $user = $this->user;
        $title = "Calendar";

        $selectedUsers = ($usersIds = $httpRequest->get('user_requested_id'))
            ? $team->getActiveMembers()->whereIn('id', $usersIds)
            : $team->getActiveMembers();
        $selectedResourceTypes = $httpRequest->get('resource_type_id')
            ? $team->timeBasedResourceTypes()->whereIn('id', $httpRequest->get('resource_type_id'))->get()
            : $team->timeBasedResourceTypes;
        $requestersSelectOptions = $team->getPossibleRequesters_SelectOptions();

        return view('dashboard.calendar', compact('user', 'team', 'title', 'selectedUsers', 'selectedResourceTypes', 'requestersSelectOptions'));
        return view('home');
    }
}
