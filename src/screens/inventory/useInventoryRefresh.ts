import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { useInventory } from '../../context/InventoryContext';
import { getApiErrorMessage } from '../../services/api';

/** Pull-to-refresh handler that reloads products and stock history from the backend. */
export function useInventoryRefresh() {
  const { refreshProducts } = useProductCatalog();
  const { refreshEvents } = useInventory();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProducts(), refreshEvents()]);
    } catch (err) {
      Alert.alert('Could not refresh', getApiErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [refreshProducts, refreshEvents]);

  return { refreshing, onRefresh };
}
