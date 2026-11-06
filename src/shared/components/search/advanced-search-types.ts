export type OperatorType =
  | 'EQUALS' // =
  | 'NOT_EQUALS' // !=
  | 'GREATER_THAN' // >
  | 'GREATER_EQUAL' // >=
  | 'LESS_THAN' // <
  | 'LESS_EQUAL' // <=
  | 'CONTAINS' // Chứa
  | 'NOT_CONTAINS' // Không chứa
  | 'BETWEEN'; // Trong khoảng

export type LogicCombiner = 'AND' | 'OR';

export interface FieldDefinition {
  id: string;
  label: string;
  type: 'number' | 'string' | 'date' | 'select';
  options?: { label: string; value: string }[];
}

export interface SearchRule {
  id: string;
  field: string;
  operator: OperatorType;
  value: string;
  valueTo?: string; // Dùng cho toán tử BETWEEN
  isNot?: boolean; // Toán tử phủ định NOT
}

export interface AdvancedSearchFilter {
  combiner: LogicCombiner; // 'AND' hoặc 'OR'
  globalNot?: boolean; // Phủ định toàn bộ kết quả
  rules: SearchRule[];
}

export const OPERATOR_LABELS: Record<OperatorType, string> = {
  EQUALS: '= (Bằng)',
  NOT_EQUALS: '!= (Khác)',
  GREATER_THAN: '> (Lớn hơn)',
  GREATER_EQUAL: '>= (Lớn hơn hoặc bằng)',
  LESS_THAN: '< (Nhỏ hơn)',
  LESS_EQUAL: '<= (Nhỏ hơn hoặc bằng)',
  CONTAINS: 'Chứa (LIKE)',
  NOT_CONTAINS: 'Không chứa (NOT LIKE)',
  BETWEEN: 'Trong khoảng (BETWEEN)',
};

export const NUMBER_OPERATORS: OperatorType[] = [
  'GREATER_THAN',
  'GREATER_EQUAL',
  'LESS_THAN',
  'LESS_EQUAL',
  'EQUALS',
  'NOT_EQUALS',
  'BETWEEN',
];

export const STRING_OPERATORS: OperatorType[] = [
  'CONTAINS',
  'NOT_CONTAINS',
  'EQUALS',
  'NOT_EQUALS',
];

export const SELECT_OPERATORS: OperatorType[] = ['EQUALS', 'NOT_EQUALS'];

export const DATE_OPERATORS: OperatorType[] = [
  'EQUALS',
  'GREATER_THAN',
  'LESS_THAN',
  'BETWEEN',
];
