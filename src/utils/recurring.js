import { getRecurringExpenses, saveRecurringExpenses, addExpense, getExpenses } from './storage';

export const processDueRecurringExpenses = async () => {
  const recurringItems = await getRecurringExpenses();
  const currentExpenses = await getExpenses();
  const todayStr = new Date().toISOString().split('T')[0];
  let updatedExpenses = [...currentExpenses];
  let updatedRecurring = [];
  let addedCount = 0;

  for (const item of recurringItems) {
    if (!item.active) {
      updatedRecurring.push(item);
      continue;
    }

    if (item.nextDueDate <= todayStr) {
      // Add automated expense entry
      const newExpense = {
        amount: item.amount,
        category: item.category,
        date: item.nextDueDate,
        paymentMethod: item.paymentMethod,
        note: `[Recurring] ${item.note}`,
        member: item.member || 'Self',
        isShared: Boolean(item.isShared)
      };

      updatedExpenses = await addExpense(newExpense);
      addedCount++;

      // Compute next due date based on frequency
      const d = new Date(item.nextDueDate + 'T00:00:00');
      if (item.frequency === 'Daily') {
        d.setDate(d.getDate() + 1);
      } else if (item.frequency === 'Weekly') {
        d.setDate(d.getDate() + 7);
      } else if (item.frequency === 'Monthly') {
        d.setMonth(d.getMonth() + 1);
      } else if (item.frequency === 'Yearly') {
        d.setFullYear(d.getFullYear() + 1);
      }

      const nextYear = d.getFullYear();
      const nextMonth = String(d.getMonth() + 1).padStart(2, '0');
      const nextDay = String(d.getDate()).padStart(2, '0');

      updatedRecurring.push({
        ...item,
        nextDueDate: `${nextYear}-${nextMonth}-${nextDay}`
      });
    } else {
      updatedRecurring.push(item);
    }
  }

  if (addedCount > 0) {
    await saveRecurringExpenses(updatedRecurring);
  }

  return { updatedExpenses, addedCount };
};
