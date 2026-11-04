import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Skeleton } from '../../components/common/Skeleton';
import { describeError, ErrorState, SlowNetworkNotice } from '../../components/states/UiStates';
import { useSlowNetwork } from '../../hooks/useNetworkStatus';
import styles from './DataTable.module.css';

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading: boolean;
  error?: unknown;
  onRetry?: () => void;
  /** Shown when the server returns no rows. Pass EmptyState or NoResults. */
  empty: React.ReactNode;
  caption: string;
  /** Zero-based. The caller fetches each page from the server. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function DataTable<T>({
  columns, rows, rowKey, loading, error, onRetry, empty, caption, page, pageSize, total, onPageChange,
}: DataTableProps<T>) {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const slow = useSlowNetwork(loading);

  if (error && rows.length === 0) return <ErrorState error={error} onRetry={onRetry} />;
  if (!loading && rows.length === 0) return <>{empty}</>;

  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div>
      {slow && <SlowNetworkNotice />}
      {/* A failed refresh leaves the rows already on screen in place. */}
      {error != null && (
        <div className={styles.inlineError} role="alert">
          {describeError(error, language).what}{' '}
          {onRetry && <button type="button" onClick={onRetry}>{mr ? 'पुन्हा प्रयत्न करा' : 'Try again'}</button>}
        </div>
      )}
      <div className={styles.scroller}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>{caption}</caption>
          <thead>
            <tr>{columns.map((c) => <th key={c.key} scope="col" style={{ width: c.width }}>{c.header}</th>)}</tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading && rows.length === 0
              ? Array.from({ length: Math.min(pageSize, 6) }, (_, i) => (
                  <tr key={i}>
                    {columns.map((c) => <td key={c.key}><Skeleton height={16} borderRadius={4} /></td>)}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)} className={loading ? styles.stale : undefined}>
                    {columns.map((c) => <td key={c.key} data-label={c.header}>{c.render(row)}</td>)}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        <span>{mr ? `${total} पैकी ${from}–${to}` : `${from}–${to} of ${total}`}</span>
        <div className={styles.pager}>
          <button type="button" disabled={loading || page <= 0} onClick={() => onPageChange(page - 1)} aria-label={mr ? 'मागील पान' : 'Previous page'}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" disabled={loading || page >= lastPage} onClick={() => onPageChange(page + 1)} aria-label={mr ? 'पुढील पान' : 'Next page'}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
