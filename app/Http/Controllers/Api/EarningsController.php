<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EarningsController extends Controller
{
    public function overview(Request $request)
    {
        $user = Auth::user();
        $now = Carbon::now();

        // 1. Calculate All-Time Earnings
        $totalAllTime = Payment::where('user_id', $user->id)
            ->where('status', 'success')
            ->sum('amount');

        // 2. Calculate This Month's Earnings
        $totalThisMonth = Payment::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereYear('paid_at', $now->year)
            ->whereMonth('paid_at', $now->month)
            ->sum('amount');

        // 3. Calculate Last Month (for growth percentage)
        $totalLastMonth = Payment::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereYear('paid_at', $now->copy()->subMonth()->year)
            ->whereMonth('paid_at', $now->copy()->subMonth()->month)
            ->sum('amount');

        // 4. Calculate Percentage Growth
        $growth = 0;
        if ($totalLastMonth > 0) {
            $growth = (($totalThisMonth - $totalLastMonth) / $totalLastMonth) * 100;
        }

        // 5. Recent Transaction History (Last 5)
        $recentPayments = Payment::where('user_id', $user->id)
            ->with('subscription') // Load the relation you defined
            ->latest('paid_at')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_all_time' => (float) $totalAllTime,
                'this_month' => (float) $totalThisMonth,
                'last_month' => (float) $totalLastMonth,
                'growth_percentage' => round($growth, 2),
                'currency' => 'NGN',
            ],
            'recent_history' => $recentPayments->map(function ($payment) {
                return [
                    'reference' => $payment->reference,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'date' => $payment->paid_at->toFormattedDateString(),
                    'plan' => $payment->subscription->name ?? 'N/A',
                ];
            }),
        ]);
    }

    public function statistics(Request $request)
    {
        $user = Auth::user();
        $year = $request->query('year', now()->year);

        // Fetch monthly sums for the chosen year
        $monthlyEarnings = Payment::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereYear('paid_at', $year)
            ->select(
                DB::raw('MONTH(paid_at) as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month') // Creates [month_id => total]
            ->all();

        // Ensure all 12 months are represented, even if 0
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthName = Carbon::create()->month($m)->format('M');
            $chartData[] = [
                'label' => $monthName,
                'value' => $monthlyEarnings[$m] ?? 0,
            ];
        }

        return response()->json([
            'status' => 'success',
            'year' => $year,
            'chart_data' => $chartData
        ]);
    }
}