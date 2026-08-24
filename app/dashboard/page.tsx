import { auth } from "@clerk/nextjs/server";
import { isMatch } from "date-fns";
import { redirect } from "next/navigation";
import NavBar from "../shared/_components/common/nav-bar";
import { Button } from "../shared/_components/ui/button";
import { canUserAddTransaction } from "../subscription/_helpers/can-user-add-transaciton";
import AddTransactionManualButton from "../transaction/_components/add-transaction-manual-button";
import { CardTransactions } from "./_components/card-transactions";
import { ChartCategory } from "./_components/chaste-category";
import { SelectDate } from "./_components/select-date";
import { TransactionSummary } from "./_components/Transaction-summary";
import { TransactionChart } from "./_components/transaction-chart";
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

  return (
    <div className="space-y-4 p-6">
      <NavBar />
      <div className="flex items-center justify-between">
        <h1 className="pt-4 text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button>Relatório IA</Button>
          <SelectDate month={selectedMonth} />
          <AddTransactionManualButton userCanAddTransaction={userCanAddTransaction} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-6">
          <TransactionSummary
            balance={balance}
            depositsTotal={depositsTotal}
            investmentsTotal={investmentsTotal}
            expensesTotal={expensesTotal}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <TransactionChart
              typesPercentage={dashboardData.typesPercentage}
              depositsTotal={depositsTotal}
              investmentsTotal={investmentsTotal}
              expensesTotal={expensesTotal}
            />

            <ChartCategory expensesPerCategory={dashboardData.totalExpensePerCategory} />
          </div>
        </div>

        <CardTransactions lastTransactions={dashboardData.lastTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;
