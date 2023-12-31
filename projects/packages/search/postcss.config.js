// Uses Jetpack plugin's postcss config.
module.exports = () => ( {
	plugins: [
		require( 'postcss-custom-properties' )( {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
			// @TODO: Drop `preserve: false` workaround if possible
			// See https://github.com/Automattic/jetpack/pull/13854#issuecomment-550898168
			preserve: false,
			disableDeprecationNotice: true,
		} ),
		require( 'autoprefixer' ),
	],
} );
