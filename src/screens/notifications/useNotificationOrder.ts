import { useEffect, useState } from 'react';
import { useOrders, type Order } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';

type State = {
  order: Order | undefined;
  loading: boolean;
  error: string | null;
};

/** Resolves the real order behind a notification: cached from the list, else fetched by Mongo id. */
export function useNotificationOrder(orderId: string | undefined): State {
  const { getOrder, fetchOrder } = useOrders();
  const cached = orderId ? getOrder(orderId) : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || cached) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOrder(orderId)
      .catch(err => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load this order.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `cached` becoming defined after the fetch merges into OrdersContext must not re-trigger a fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, fetchOrder]);

  return { order: cached, loading, error };
}
