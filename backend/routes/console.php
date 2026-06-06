<?php

use App\Jobs\ProcessarAlertasJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(ProcessarAlertasJob::class)->daily()->at('06:00');
