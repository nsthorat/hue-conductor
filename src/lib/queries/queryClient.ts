import { QueryClient } from '@tanstack/svelte-query';
import { writable } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiErrors = writable<any[]>([]);

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Dont refetch on window focus
			refetchOnWindowFocus: false,
			// Treat data as never stale, avoiding repeated fetches
			staleTime: Infinity,
			retry: false,
			onError: (err) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				console.error((err as any).body?.detail);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				apiErrors.update((errs) => [...errs, err as any]);
			}
		},
		mutations: {
			onError: (err) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				console.error((err as any).body?.detail);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				apiErrors.update((errs) => [...errs, err as any]);
			}
		}
	}
});
