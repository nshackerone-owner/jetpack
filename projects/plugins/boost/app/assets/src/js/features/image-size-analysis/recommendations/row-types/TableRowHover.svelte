<script lang="ts">
	import { __ } from '@wordpress/i18n';
	import Button from '../../Button.svelte';
	import { recordBoostEvent, recordBoostEventAndRedirect } from '$lib/utils/analytics';
	import type { ImageDataType } from '$lib/store/zod-types';
	import api from '$lib/api/api';
	import config from '$lib/stores/config';
	export let edit_url: string | null = null;
	export let instructions: string;
	export let device_type: string | null = null;
	export let details: ImageDataType;

	async function fixImageSize() {
		let post_id = '0';
		if ( details.page.edit_url ) {
			const url = new URL( details.page.edit_url );
			post_id = new URLSearchParams( url.search ).get( 'post' );
		} else {
			post_id = '0';
		}

		const data = {
			image_url: details.image.url,
			image_width: details.image.dimensions.expected.width.toString(),
			image_height: details.image.dimensions.expected.height.toString(),
			post_id,
			nonce: Jetpack_Boost.fixImageNonce,
			fix: ! details.image.fixed,
		};
		const response = await api.post( '/image-size-analysis/fix', data );
		if ( response.status === 'success' ) {
			if ( response.changed === 'fix' ) {
				recordBoostEvent( 'isa_fix_image_success', {} );
				details.image.fixed = true;
			} else {
				recordBoostEvent( 'isa_undo_fix_image_success', {} );
				details.image.fixed = false;
			}
		} else {
			recordBoostEvent( 'isa_fix_image_failure', {} );
		}
	}

	function handleFixClick() {
		recordBoostEvent( 'isa_fix_image', {} );
		return fixImageSize();
	}
</script>

<div class="jb-row-hover">
	<p class="jb-row-hover__instruction">{instructions}</p>

	{#if edit_url}
		<div class="jb-row-hover__button-container">
			{#if $config.isaFixButton && device_type === 'desktop'}
				<Button width="auto" fill on:click={() => handleFixClick()}>
					{details.image.fixed ? __( 'Undo Fix', 'jetpack-boost' ) : __( 'Fix', 'jetpack-boost' )}
				</Button>
			{:else}
				<Button
					small
					fill
					on:click={() =>
						recordBoostEventAndRedirect( edit_url, 'clicked_edit_page_on_isa_report', {
							device_type,
						} )}
				>
					{__( 'Edit Page', 'jetpack-boost' )}
				</Button>
			{/if}
		</div>
	{/if}
</div>
