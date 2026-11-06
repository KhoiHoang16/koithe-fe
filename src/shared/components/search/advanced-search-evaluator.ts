import type { AdvancedSearchFilter, SearchRule } from './advanced-search-types';

export function evaluateRule(itemValue: any, rule: SearchRule): boolean {
  if (itemValue === undefined || itemValue === null) {
    return false;
  }

  const { operator, value, valueTo, isNot } = rule;
  let matches = false;

  // Numeric comparisons
  if (typeof itemValue === 'number' || (!isNaN(Number(itemValue)) && !isNaN(Number(value)))) {
    const numItem = Number(itemValue);
    const numVal = Number(value);
    const numTo = valueTo ? Number(valueTo) : numVal;

    switch (operator) {
      case 'EQUALS':
        matches = numItem === numVal;
        break;
      case 'NOT_EQUALS':
        matches = numItem !== numVal;
        break;
      case 'GREATER_THAN':
        matches = numItem > numVal;
        break;
      case 'GREATER_EQUAL':
        matches = numItem >= numVal;
        break;
      case 'LESS_THAN':
        matches = numItem < numVal;
        break;
      case 'LESS_EQUAL':
        matches = numItem <= numVal;
        break;
      case 'BETWEEN':
        matches = numItem >= numVal && numItem <= numTo;
        break;
      default:
        matches = String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    }
  } else if (itemValue instanceof Date || (typeof itemValue === 'string' && !isNaN(Date.parse(itemValue)) && value.includes('-'))) {
    // Date comparisons
    const dateItem = new Date(itemValue).getTime();
    const dateVal = new Date(value).getTime();
    const dateTo = valueTo ? new Date(valueTo).getTime() : dateVal;

    switch (operator) {
      case 'EQUALS': {
        const d1 = new Date(itemValue).toDateString();
        const d2 = new Date(value).toDateString();
        matches = d1 === d2;
        break;
      }
      case 'GREATER_THAN':
        matches = dateItem > dateVal;
        break;
      case 'LESS_THAN':
        matches = dateItem < dateVal;
        break;
      case 'BETWEEN':
        matches = dateItem >= dateVal && dateItem <= dateTo;
        break;
      default:
        matches = true;
    }
  } else {
    // String comparisons
    const strItem = String(itemValue).toLowerCase().trim();
    const strVal = String(value).toLowerCase().trim();

    switch (operator) {
      case 'EQUALS':
        matches = strItem === strVal;
        break;
      case 'NOT_EQUALS':
        matches = strItem !== strVal;
        break;
      case 'CONTAINS':
        matches = strItem.includes(strVal);
        break;
      case 'NOT_CONTAINS':
        matches = !strItem.includes(strVal);
        break;
      default:
        matches = strItem.includes(strVal);
    }
  }

  // Áp dụng toán tử phủ định NOT nếu được tick chọn
  return isNot ? !matches : matches;
}

export function evaluateAdvancedFilter<T extends Record<string, any>>(
  item: T,
  filter: AdvancedSearchFilter | null,
): boolean {
  if (!filter || !filter.rules || filter.rules.length === 0) {
    return true;
  }

  const validRules = filter.rules.filter((r) => r.field && r.value.trim() !== '');
  if (validRules.length === 0) {
    return true;
  }

  let result = false;
  if (filter.combiner === 'AND') {
    result = validRules.every((rule) => {
      const itemValue = item[rule.field];
      return evaluateRule(itemValue, rule);
    });
  } else {
    // OR combiner
    result = validRules.some((rule) => {
      const itemValue = item[rule.field];
      return evaluateRule(itemValue, rule);
    });
  }

  return filter.globalNot ? !result : result;
}
