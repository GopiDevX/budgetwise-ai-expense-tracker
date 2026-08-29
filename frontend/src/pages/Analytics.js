import React, { useState } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiCalendar, FiDownload } from 'react-icons/fi';
import usePageTitle from '../hooks/usePageTitle';
import transactionService from '../services/transactionService';
import { useCurrency } from '../contexts/CurrencyContext';
import { exportToCSV } from '../utils/csvExport';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
`;

const DateFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  color: #0f172a;
  font-weight: 500;
  cursor: pointer;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
`;

const StatLabel = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 0.5rem 0;
`;

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrendBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  background: ${props => props.positive ? '#ecfdf5' : '#fef2f2'};
  color: ${props => props.positive ? '#059669' : '#dc2626'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
    usePageTitle('Analytics | BudgetWise');

    const { format: formatCurrency } = useCurrency();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await transactionService.getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    // Helper functions
    const getMonthName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'short' });
    };

    // Calculate Stats
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
        
    const netSavings = totalIncome - totalExpenses;
    
    // Process Data for Area Chart (Income vs Expense over months)
    const monthlyDataMap = {};
    transactions.forEach(t => {
        const month = getMonthName(t.date);
        if (!monthlyDataMap[month]) {
            monthlyDataMap[month] = { name: month, income: 0, expense: 0, order: new Date(t.date).getMonth() };
        }
        if (t.type === 'income') {
            monthlyDataMap[month].income += parseFloat(t.amount);
        } else {
            monthlyDataMap[month].expense += Math.abs(parseFloat(t.amount));
        }
    });
    
    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.order - b.order);

    // Process Data for Pie Chart (Expense Distribution)
    const categoryDataMap = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const cat = t.category || 'Other';
            categoryDataMap[cat] = (categoryDataMap[cat] || 0) + Math.abs(parseFloat(t.amount));
        });
        
    const categoryData = Object.keys(categoryDataMap)
        .map(key => ({ name: key, value: categoryDataMap[key] }))
        .sort((a, b) => b.value - a.value); // Sort descending

    // Process Data for Bar Chart (Weekly/Monthly Savings)
    const trendData = monthlyData.map(m => ({
        name: m.name,
        savings: m.income - m.expense
    }));

    // Calculate Avg Monthly Spend
    const numMonths = monthlyData.length || 1;
    const avgMonthlySpend = totalExpenses / numMonths;

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    Loading analytics...
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <TitleSection>
                    <PageTitle>Analytics</PageTitle>
                    <PageSubtitle>Deep dive into your financial patterns</PageSubtitle>
                </TitleSection>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <DateFilter onClick={() => exportToCSV(transactions)}>
                        <FiDownload size={16} />
                        Export CSV
                    </DateFilter>
                </div>
            </PageHeader>

            <StatsRow>
                <StatCard>
                    <StatLabel>Total Income</StatLabel>
                    <StatValue>
                        {formatCurrency(totalIncome)}
                    </StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Total Expenses</StatLabel>
                    <StatValue>
                        {formatCurrency(totalExpenses)}
                    </StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Net Savings</StatLabel>
                    <StatValue style={{ color: netSavings >= 0 ? '#059669' : '#dc2626' }}>
                        {formatCurrency(netSavings)}
                    </StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Avg Monthly Spend</StatLabel>
                    <StatValue>{formatCurrency(avgMonthlySpend)}</StatValue>
                </StatCard>
            </StatsRow>

            <ChartsGrid>
                <ChartCard>
                    <ChartHeader>
                        <ChartTitle>Income vs Expenses Trend</ChartTitle>
                    </ChartHeader>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard>
                    <ChartHeader>
                        <ChartTitle>Expense Distribution</ChartTitle>
                    </ChartHeader>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </ChartsGrid>

            <ChartCard>
                <ChartHeader>
                    <ChartTitle>Monthly Savings Trend</ChartTitle>
                </ChartHeader>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="savings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </PageContainer>
    );
};

export default Analytics;
