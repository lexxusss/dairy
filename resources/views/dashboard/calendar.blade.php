@extends('layouts.app')

@section('pre_dashboard_header')
    <link href='{{ asset('assets/js/vendor/@fortawesome/fontawesome-free/css/all.min.css') }}' rel='stylesheet'>
@endsection

@section('post_dashboard_header')
    <link href='{{ asset('assets/js/vendor/@fullcalendar/core/main.css') }}' rel='stylesheet' />
    <link href='{{ asset('assets/js/vendor/@fullcalendar/daygrid/main.css') }}' rel='stylesheet' />
    <link href='{{ asset('assets/js/vendor/@fullcalendar/timegrid/main.css') }}' rel='stylesheet' />
    <link href='{{ asset('assets/js/vendor/@fullcalendar/bootstrap/main.css') }}' rel='stylesheet' />
    <link href='{{ asset('assets/styles/app/calendar.css') }}' rel='stylesheet' />

    <link href='{{ asset('assets/js/vendor/@fullcalendar/yeargrid/main.css') }}' rel='stylesheet' />
    <link href='{{ asset('assets/styles/app/calendar.css') }}' rel='stylesheet' />
@endsection

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Dashboard</div>

                    <div class="card-body">
                        @if (session('status'))
                            <div class="alert alert-success" role="alert">
                                {{ session('status') }}
                            </div>
                        @endif

                        <div id='calendar'></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
