<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class EarningsController extends Controller
{
    public function overview(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();

        // MongoDB doesn't support DB::raw SQL expressions.
        // Pull relevant records and aggregate in PHP instead.

        $baseQuery = fn() => Payment::where('user_id', (string) $user->_id)
            ->where('status', 'success');

        // 1. All-Time Earnings
        $totalAllTime = $baseQuery()->sum('amount');

        // 2. This Month
        $totalThisMonth = $baseQuery()
            ->whereBetween('paid_at', [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
            ])
            ->sum('amount');

        // 3. Last Month
        $lastMonth = $now->copy()->subMonth();
        $totalLastMonth = $baseQuery()
            ->whereBetween('paid_at', [
                $lastMonth->copy()->startOfMonth(),
                $lastMonth->copy()->endOfMonth(),
            ])
            ->sum('amount');

        // 4. Growth percentage
        $growth = $totalLastMonth > 0
            ? (($totalThisMonth - $totalLastMonth) / $totalLastMonth) * 100
            : 0;

        // 5. Recent transactions
        $recentPayments = $baseQuery()
            ->with('subscription')
            ->orderBy('paid_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status'  => 'success',
            'summary' => [
                'total_all_time'    => (float) $totalAllTime,
                'this_month'        => (float) $totalThisMonth,
                'last_month'        => (float) $totalLastMonth,
                'growth_percentage' => round($growth, 2),
                'currency'          => 'NGN',
            ],
            'recent_history' => $recentPayments->map(fn($payment) => [
                'reference' => $payment->reference,
                'amount'    => $payment->amount,
                'status'    => $payment->status,
                'date'      => Carbon::parse($payment->paid_at)->toFormattedDateString(),
                'plan'      => $payment->subscription->name ?? 'N/A',
            ]),
        ]);
    }

    public function statistics(Request $request)
    {
        $user = Auth::user();
        $year = (int) $request->query('year', now()->year);

        $startOfYear = Carbon::create($year)->startOfYear();
        $endOfYear   = Carbon::create($year)->endOfYear();

        // Fetch all matching payments for the year, aggregate in PHP
        // MongoDB's $group with $month is available via raw aggregation,
        // but laravel-mongodb's fluent builder handles this more reliably
        // via PHP-side grouping for cross-driver compatibility.
        $payments = Payment::where('user_id', (string) $user->_id)
            ->where('status', 'success')
            ->whereBetween('paid_at', [$startOfYear, $endOfYear])
            ->get(['paid_at', 'amount']);

        // Group by month number in PHP
        $monthlyEarnings = [];
        foreach ($payments as $payment) {
            $month = Carbon::parse($payment->paid_at)->month;
            $monthlyEarnings[$month] = ($monthlyEarnings[$month] ?? 0) + $payment->amount;
        }

        // Ensure all 12 months are represented
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $chartData[] = [
                'label' => Carbon::create()->month($m)->format('M'),
                'value' => $monthlyEarnings[$m] ?? 0,
            ];
        }

        return response()->json([
            'status'     => 'success',
            'year'       => $year,
            'chart_data' => $chartData,
        ]);
    }
}