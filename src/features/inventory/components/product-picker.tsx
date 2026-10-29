import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { purchaseOrderApi } from '../api/purchase-order-api';
import { ErrorNotice, Pager } from './shared';
import { control } from '../lib/presentation';

// Không dùng adapter catalog hiện tại vì adapter đó loại bỏ số lượng tồn kho.
export function ProductPicker({
  scope,
  choose,
  stock = false,
}: {
  scope: number | undefined;
  choose?: (id: string) => void;
  stock?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [product, setProduct] = useState('');
  const [variant, setVariant] = useState('');
  useEffect(() => {
    const timeout = setTimeout(() => {
      setKeyword(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);
  const products = useQuery({
    queryKey: ['inventory', scope, 'products', keyword, page],
    queryFn: () => purchaseOrderApi.products(keyword, page),
    retry: false,
  });
  const variants = useQuery({
    queryKey: ['inventory', scope, 'variants', product],
    queryFn: () => purchaseOrderApi.variants(Number(product)),
    enabled: !!product,
    retry: false,
  });
  return (
    <div className="space-y-2">
      <label className="block">
        Tìm sản phẩm
        <input
          className={control}
          value={search}
          placeholder="Nhập tên sản phẩm"
          onChange={(e) => {
            setSearch(e.target.value);
            setProduct('');
            setVariant('');
            choose?.('');
          }}
        />
      </label>
      {products.isPending ? (
        <p role="status">Đang tải sản phẩm...</p>
      ) : products.isError ? (
        <ErrorNotice error={products.error} retry={() => void products.refetch()} />
      ) : (
        <>
          <label className="block">
            Sản phẩm
            <select
              className={control}
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                setVariant('');
                choose?.('');
              }}
            >
              <option value="">Chọn sản phẩm</option>
              {products.data.content.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.tenSanPham}
                </option>
              ))}
            </select>
          </label>
          {!products.data.content.length && <p>Không có sản phẩm phù hợp.</p>}
          <Pager
            page={page}
            total={products.data.totalPages}
            pending={products.isFetching}
            change={(next) => {
              setPage(next);
              setProduct('');
              setVariant('');
              choose?.('');
            }}
          />
        </>
      )}
      {product &&
        (variants.isPending ? (
          <p role="status">Đang tải biến thể...</p>
        ) : variants.isError ? (
          <ErrorNotice error={variants.error} retry={() => void variants.refetch()} />
        ) : !variants.data?.length ? (
          <p>Sản phẩm chưa có biến thể.</p>
        ) : stock ? (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Biến thể</th>
                <th>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {variants.data.map((v) => (
                <tr key={v.id}>
                  <td className="py-2">{v.kichCo}</td>
                  <td>{v.soLuongTon ?? 'Chưa có dữ liệu'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <label className="block">
            Biến thể *
            <select
              required
              className={control}
              value={variant}
              onChange={(e) => {
                setVariant(e.target.value);
                choose?.(e.target.value);
              }}
            >
              <option value="">Chọn biến thể</option>
              {variants.data.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.kichCo} — Tồn: {v.soLuongTon ?? 'chưa có dữ liệu'}
                </option>
              ))}
            </select>
          </label>
        ))}
    </div>
  );
}
