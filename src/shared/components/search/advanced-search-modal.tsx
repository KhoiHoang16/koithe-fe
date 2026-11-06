import { useState } from 'react';
import {
  Filter,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
  HelpCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import type {
  AdvancedSearchFilter,
  FieldDefinition,
  OperatorType,
  SearchRule,
} from './advanced-search-types';
import {
  OPERATOR_LABELS,
  NUMBER_OPERATORS,
  STRING_OPERATORS,
  SELECT_OPERATORS,
  DATE_OPERATORS,
} from './advanced-search-types';

interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FieldDefinition[];
  currentFilter: AdvancedSearchFilter | null;
  onApply: (filter: AdvancedSearchFilter | null) => void;
  presets?: {
    name: string;
    filter: AdvancedSearchFilter;
  }[];
}

export function AdvancedSearchModal({
  open,
  onOpenChange,
  fields,
  currentFilter,
  onApply,
  presets = [],
}: AdvancedSearchModalProps) {
  const [filter, setFilter] = useState<AdvancedSearchFilter>(() => {
    return (
      currentFilter || {
        combiner: 'AND',
        globalNot: false,
        rules: [
          {
            id: '1',
            field: fields[0]?.id || '',
            operator: fields[0]?.type === 'number' ? 'GREATER_THAN' : 'CONTAINS',
            value: '',
          },
        ],
      }
    );
  });

  const getOperatorsForField = (fieldId: string): OperatorType[] => {
    const f = fields.find((item) => item.id === fieldId);
    if (!f) return STRING_OPERATORS;
    switch (f.type) {
      case 'number':
        return NUMBER_OPERATORS;
      case 'date':
        return DATE_OPERATORS;
      case 'select':
        return SELECT_OPERATORS;
      default:
        return STRING_OPERATORS;
    }
  };

  const handleAddRule = () => {
    const defaultField = fields[0]?.id || '';
    const defaultOps = getOperatorsForField(defaultField);
    setFilter((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          id: String(Date.now()),
          field: defaultField,
          operator: defaultOps[0],
          value: '',
        },
      ],
    }));
  };

  const handleRemoveRule = (id: string) => {
    setFilter((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== id),
    }));
  };

  const handleUpdateRule = (id: string, updates: Partial<SearchRule>) => {
    setFilter((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        // Nếu đổi field, tự reset operator tương ứng
        if (updates.field && updates.field !== r.field) {
          const ops = getOperatorsForField(updates.field);
          updated.operator = ops[0];
          updated.value = '';
          updated.valueTo = undefined;
        }
        return updated;
      }),
    }));
  };

  const handleApply = () => {
    const validRules = filter.rules.filter((r) => r.field && r.value.trim() !== '');
    if (validRules.length === 0) {
      onApply(null);
    } else {
      onApply({ ...filter, rules: validRules });
    }
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilter({
      combiner: 'AND',
      globalNot: false,
      rules: [
        {
          id: '1',
          field: fields[0]?.id || '',
          operator: fields[0]?.type === 'number' ? 'GREATER_THAN' : 'CONTAINS',
          value: '',
        },
      ],
    });
    onApply(null);
    onOpenChange(false);
  };

  const handleSelectPreset = (p: { name: string; filter: AdvancedSearchFilter }) => {
    setFilter(p.filter);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg">
                Tìm kiếm nâng cao & Bộ lọc đa tiêu chí
              </DialogTitle>
              <DialogDescription className="text-xs">
                Sử dụng các toán tử so sánh (&gt;, &lt;, =, !=, BETWEEN) và logic kết hợp (AND, OR, NOT)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quick Presets */}
        {presets.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Gợi ý bộ lọc nhanh (Presets):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 rounded-md text-xs bg-background border hover:bg-muted text-stone-700 transition-colors font-medium"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Combiner Switch (AND / OR) & Global NOT */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">Quy tắc kết hợp:</span>
            <div className="inline-flex rounded-lg border bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, combiner: 'AND' }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filter.combiner === 'AND'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                VÀ (AND)
              </button>
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, combiner: 'OR' }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  filter.combiner === 'OR'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                HOẶC (OR)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <input
              type="checkbox"
              checked={filter.globalNot || false}
              onChange={(e) => setFilter((prev) => ({ ...prev, globalNot: e.target.checked }))}
              className="rounded accent-rose-600"
            />
            <span>Toán tử NOT (Phủ định tất cả)</span>
          </label>
        </div>

        {/* Dynamic Rules List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              Danh sách điều kiện ({filter.rules.length})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRule}
              className="h-7 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/5"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm điều kiện
            </Button>
          </div>

          <div className="space-y-2.5">
            {filter.rules.map((rule, idx) => {
              const currentField = fields.find((f) => f.id === rule.field) || fields[0];
              const operators = getOperatorsForField(rule.field);

              return (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl border bg-card hover:border-primary/40 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">
                      Điều kiện #{idx + 1}
                      {idx > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                          {filter.combiner}
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] text-rose-600 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={rule.isNot || false}
                          onChange={(e) =>
                            handleUpdateRule(rule.id, { isNot: e.target.checked })
                          }
                          className="rounded accent-rose-600"
                        />
                        <span>NOT</span>
                      </label>

                      {filter.rules.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveRule(rule.id)}
                          className="h-6 w-6 text-stone-400 hover:text-destructive"
                          title="Xóa điều kiện"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    {/* 1. Field Selector */}
                    <div className="sm:col-span-4">
                      <select
                        value={rule.field}
                        onChange={(e) => handleUpdateRule(rule.id, { field: e.target.value })}
                        className="w-full h-9 rounded-lg border bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                      >
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Operator Selector */}
                    <div className="sm:col-span-4">
                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            operator: e.target.value as OperatorType,
                          })
                        }
                        className="w-full h-9 rounded-lg border bg-background px-2.5 text-xs font-semibold text-primary focus:ring-1 focus:ring-primary"
                      >
                        {operators.map((op) => (
                          <option key={op} value={op}>
                            {OPERATOR_LABELS[op]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Value Input(s) */}
                    <div className="sm:col-span-4 flex items-center gap-1.5">
                      {currentField?.type === 'select' && currentField.options ? (
                        <select
                          value={rule.value}
                          onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                          className="w-full h-9 rounded-lg border bg-background px-2.5 text-xs"
                        >
                          <option value="">-- Chọn giá trị --</option>
                          {currentField.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : rule.operator === 'BETWEEN' ? (
                        <div className="flex items-center gap-1 w-full">
                          <Input
                            type={currentField?.type === 'number' ? 'number' : 'text'}
                            placeholder="Từ..."
                            value={rule.value}
                            onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                            className="h-9 text-xs"
                          />
                          <span className="text-xs text-muted-foreground">-</span>
                          <Input
                            type={currentField?.type === 'number' ? 'number' : 'text'}
                            placeholder="Đến..."
                            value={rule.valueTo || ''}
                            onChange={(e) =>
                              handleUpdateRule(rule.id, { valueTo: e.target.value })
                            }
                            className="h-9 text-xs"
                          />
                        </div>
                      ) : (
                        <Input
                          type={
                            currentField?.type === 'number'
                              ? 'number'
                              : currentField?.type === 'date'
                                ? 'date'
                                : 'text'
                          }
                          placeholder={
                            currentField?.type === 'number'
                              ? 'Nhập số tiền / số lượng...'
                              : 'Nhập giá trị...'
                          }
                          value={rule.value}
                          onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                          className="h-9 text-xs"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explain footer */}
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5" /> Giải thích cú pháp logic:
          </div>
          <p>
            - <strong>VÀ (AND)</strong>: Chỉ hiện các kết quả thỏa mãn cùng lúc tất cả điều kiện.
            <br />
            - <strong>HOẶC (OR)</strong>: Hiện kết quả nếu thỏa mãn ít nhất một trong các điều kiện.
            <br />
            - <strong>NOT</strong>: Đảo ngược điều kiện (ví dụ: NOT &gt; 100k tương đương &le; 100k).
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1 text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Xóa bộ lọc
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button type="button" size="sm" onClick={handleApply} className="text-xs gap-1 font-bold">
              <Check className="h-3.5 w-3.5" /> Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hiển thị các tag điều kiện đang lọc dưới thanh tìm kiếm để người dùng bấm 'X' xóa nhanh
 */
export function ActiveFilterBadges({
  filter,
  fields,
  onRemoveRule,
  onClearAll,
}: {
  filter: AdvancedSearchFilter | null;
  fields: FieldDefinition[];
  onRemoveRule: (id: string) => void;
  onClearAll: () => void;
}) {
  if (!filter || !filter.rules || filter.rules.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
        <Filter className="h-3 w-3 text-primary" /> Đang lọc:
      </span>

      {filter.globalNot && (
        <Badge variant="destructive" className="text-[10px] font-bold">
          NOT ALL
        </Badge>
      )}

      {filter.rules.map((rule, idx) => {
        const f = fields.find((item) => item.id === rule.field);
        const opLabel = OPERATOR_LABELS[rule.operator] || rule.operator;
        const valText =
          rule.operator === 'BETWEEN' ? `${rule.value} – ${rule.valueTo || '...'}` : rule.value;

        return (
          <span
            key={rule.id}
            className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-medium"
          >
            {idx > 0 && <span className="font-extrabold text-[10px] opacity-70">[{filter.combiner}]</span>}
            {rule.isNot && <strong className="text-rose-600">NOT</strong>}
            <span>{f?.label || rule.field}</span>
            <span className="font-bold">{opLabel.split(' ')[0]}</span>
            <span className="font-semibold underline underline-offset-2">{valText}</span>
            <button
              type="button"
              onClick={() => onRemoveRule(rule.id)}
              className="ml-1 hover:text-rose-600 font-bold"
              title="Xóa điều kiện này"
            >
              ×
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] text-rose-600 hover:underline font-semibold ml-1"
      >
        Xóa tất cả
      </button>
    </div>
  );
}

