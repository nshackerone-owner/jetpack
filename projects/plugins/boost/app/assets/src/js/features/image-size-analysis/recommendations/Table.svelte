<script lang="ts">
	import { __ } from '@wordpress/i18n';
	import { type ISA_Data } from '../lib/stores/isa-data';
	import { ISAStatus, type ISASummary } from '../lib/stores/isa-summary';
	import BrokenDataRow from './row-types/BrokenDataRow.svelte';
	import ImageMissingRow from './row-types/ImageMissingRow.svelte';
	import ImageSizeRow from './row-types/ImageSizeRow.svelte';
	import LoadingRow from './row-types/LoadingRow.svelte';
	import Spinner from '$features/ui/Spinner.svelte';
	import TemplatedString from '$features/TemplatedString.svelte';
	import actionLinkTemplateVar from '$lib/utils/action-link-template-var';

	export let needsRefresh: boolean;
	export let refresh: () => Promise< void >;
	export let isaDataLoading: boolean;
	export let activeGroup: string;
	export let images: ISA_Data[];
	export let isaSummary: ISASummary | null;

	let isLoading = false;
	let ignoreStatusUpdated = false;
	async function delayedLoadingUpdate( loading: boolean ) {
		if ( ignoreStatusUpdated ) {
			ignoreStatusUpdated = false;
			return;
		}
		isLoading = loading;
	}
	$: delayedLoadingUpdate( isaDataLoading );

	function getActiveImages( _images: ISA_Data[], loading: boolean ) {
		// Return no rows while loading. The UI will auto-pad it with loading rows.
		if ( loading ) {
			return [];
		}

		// If the user is switching between tabs, we want to show the images that are already loaded
		const filteredImages = _images.filter( image => image.status === activeFilter );
		if ( filteredImages.length === 0 && loading ) {
			return _images;
		}

		// Show filtered images
		return filteredImages;
	}

	$: activeImages = getActiveImages( images, isLoading );
	$: jobFinished = isaSummary?.status === ISAStatus.Completed;
	$: activeFilter = activeGroup === 'ignored' ? 'ignored' : 'active';
</script>

<div class="jb-loading-spinner" class:active={isLoading}>
	<Spinner size="3rem" lineWidth="4px" />
</div>

{#if ! isLoading && activeImages.length === 0}
	<h1>
		{#if needsRefresh}
			<TemplatedString
				template={__(
					'<refresh>Refresh</refresh> to see the latest recommendations.',
					'jetpack-boost'
				)}
				vars={actionLinkTemplateVar( () => refresh(), 'refresh' )}
			/>
		{:else}
			{jobFinished
				? __( '🥳 No image size issues found!', 'jetpack-boost' )
				: __( 'No image size issues found yet…', 'jetpack-boost' )}
		{/if}
	</h1>
{:else}
	<div class="jb-table" class:jb-loading={isLoading}>
		<div class="jb-table-header jb-recommendation-page-grid">
			<div class="jb-table-header__image">Image</div>
			<div class="jb-table-header__potential-size">Potential Size</div>
			<div class="jb-table-header__device">Device</div>
			<div class="jb-table-header__page">Page/Post</div>
		</div>

		{#if isLoading}
			{#each Array( 10 ) as _, i}
				<LoadingRow />
			{/each}
		{:else}
			{#each activeImages as image (image.id)}
				{#if image.type === 'image_size'}
					<ImageSizeRow enableTransition={images.length > 0} details={image} />
				{:else if image.type === 'image_missing'}
					<ImageMissingRow enableTransition={images.length > 0} details={image} />
				{:else}
					<BrokenDataRow />
				{/if}
			{/each}
		{/if}
	</div>
{/if}
