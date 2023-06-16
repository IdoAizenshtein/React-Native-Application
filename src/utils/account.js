export function getAccountIdForSelection (
  currency,
  accountId,
  selectedAccountIds,
  selectedGroup,
) {
  const hasSelected = selectedAccountIds.includes(accountId)
  if (selectedGroup !== null && selectedGroup !== currency) {
    return
  }

  if (hasSelected) {
    const newSelectedIds = selectedAccountIds.filter((s) => s !== accountId)
    return {
      selectedAccountIds: newSelectedIds,
      selectedGroup: newSelectedIds.length ? currency : null,
    }
  }

  return {
    selectedAccountIds: [...selectedAccountIds, accountId],
    selectedGroup: currency,
  }
}
