import { auth } from "@clerk/nextjs/server";
import { isMatch } from "date-fns";
import { redirect } from "next/navigation";
import { AdBannerGate } from "../_ads/_components/ad-banner-gate";
import NavBar from "../shared/_components/common/nav-bar";
import { SelectTransaction } from "../shared/_components/common/select-transaction";
import { Badge } from "../shared/_components/ui/badge";

import { canUserAddTransaction } from "../subscription/_helpers/can-user-add-transaciton";
import AddTransactionManualButton from "../transaction/_components/add-transaction-manual-button";
import { ClerkPremiumPlan } from "../transaction/clerk-premium-plan";
import AiReportButton from "./_components/ai-report-button";
import { CardTransactions } from "./_components/card-transactions";
import { ChartCategory } from "./_components/chaste-category";
import { SelectDate } from "./_components/select-date";
import { TransactionSummary } from "./_components/Transaction-summary";
import { TransactionChart } from "./_components/transaction-chart";
import { WelcomeToast } from "./_components/welcome-tost";
import { getDashboard } from "./_db/get-dashboard";

interface DashboardProps {
  searchParams: Promise<{ month?: string }>;
  currentMonthTransactionLimit?: boolean;
}

const Dashboard = async ({ searchParams }: DashboardProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const { month } = await searchParams;
  const selectedMonth = month ?? String(new Date().getMonth() + 1);

  const monthIsInvalid = !selectedMonth || !isMatch(selectedMonth, "MM");
  if (monthIsInvalid) {
    return redirect("/dashboard?month=1");
  }

  const currentYear = new Date().getFullYear();
  const monthIndex = Number(selectedMonth) - 1;

  const where = {
    date: {
      gte: new Date(currentYear, monthIndex, 1),
      lt: new Date(currentYear, monthIndex + 1, 1),
    },
  };

  const dashboardData = await getDashboard({ userId, where });
  const { balance, depositsTotal, investmentsTotal, expensesTotal } = dashboardData;
  const userCanAddTransaction = await canUserAddTransaction();
  const subscriptionPlan = await ClerkPremiumPlan();
  const hasPremiumPlan = subscriptionPlan === "premium";
  return (
    <div className="h-full overflow-y-auto p-6">
      <WelcomeToast />
      <div className="flex flex-col gap-6">
        <NavBar />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <AiReportButton month={selectedMonth} hasPremiumPlan={hasPremiumPlan} />
            <SelectDate month={selectedMonth} />
            <SelectTransaction />
            <AddTransactionManualButton userCanAddTransaction={userCanAddTransaction} />
          </div>
        </div>
        <AdBannerGate />
        <TransactionSummary
          balance={balance}
          depositsTotal={depositsTotal}
          investmentsTotal={investmentsTotal}
          expensesTotal={expensesTotal}
        />
        {dashboardData.lastTransactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <TransactionChart
              typesPercentage={dashboardData.typesPercentage}
              depositsTotal={depositsTotal}
              investmentsTotal={investmentsTotal}
              expensesTotal={expensesTotal}
            />
            <ChartCategory expensesPerCategory={dashboardData.totalExpensePerCategory} />
          </div>
        ) : (
          <Badge variant="outline" className="w-full">
            Faça sua primeira transação para ver o dashboard com percentual de receita, despesas e
            investimentos.
          </Badge>
        )}
        <CardTransactions lastTransactions={dashboardData.lastTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
