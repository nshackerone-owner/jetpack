<script lang="ts">
	import { __ } from '@wordpress/i18n';
	import CriticalCssShowStopperError from './CriticalCssShowStopperError.svelte';
	import CriticalCssStatus from './CriticalCssStatus.svelte';
	import ProgressActivityLabel from './ProgressActivityLabel.svelte';
	import ProgressBar from '$features/ui/ProgressBar.svelte';
	import { CriticalCssState } from '$features/critical-css-state-types';

	export let cssState: CriticalCssState;
	export let isCloudCssAvailable: boolean;
	export let criticalCssProgress: number;
	export let issues: CriticalCssState[ 'providers' ] = [];
	export let isFatalError: boolean;
	export let primaryErrorSet;
	export let suggestRegenerate;
	export let regenerateCriticalCss;

	$: successCount = cssState.providers.filter( provider => provider.status === 'success' ).length;
</script>

{#if cssState.status === 'pending'}
	<div class="jb-critical-css-progress">
		<ProgressActivityLabel>
			{__(
				'Generating Critical CSS. Please don’t leave this page until completed.',
				'jetpack-boost'
			)}
		</ProgressActivityLabel>
		<ProgressBar progress={criticalCssProgress} />
	</div>
{:else if isFatalError}
	<CriticalCssShowStopperError
		status={cssState.status}
		{primaryErrorSet}
		statusError={cssState.status_error}
		{regenerateCriticalCss}
	/>
{:else}
	<CriticalCssStatus
		{isCloudCssAvailable}
		status={cssState.status}
		{successCount}
		updated={cssState.updated}
		{issues}
		progress={criticalCssProgress}
		{suggestRegenerate}
	/>
{/if}
