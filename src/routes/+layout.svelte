<script>
	import { queryClient } from '$lib/queries/queryClient';
	import { QueryClientProvider } from '@tanstack/svelte-query';

	import '../app.postcss';
</script>

<QueryClientProvider client={queryClient}>
	<slot />
</QueryClientProvider>
