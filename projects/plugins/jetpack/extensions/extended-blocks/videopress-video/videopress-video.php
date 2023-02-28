<?php
/**
 * Register VideoPress Video block.
 *
 * @package automattic/jetpack
 **/

namespace Automattic\Jetpack\Extensions\VideoPress_Video;

use Automattic\Jetpack\VideoPress\Initializer as VideoPress_Pkg_Initializer;

// Register the videopress/video block.
add_action(
	'init',
	function () {
		$availability                  = \Jetpack_Gutenberg::get_availability();
		$is_videopress_video_available = isset( $availability['videopress/video']['available'] ) && $availability['videopress/video']['available'] === true;

		if (
			$is_videopress_video_available &&
			method_exists( 'Automattic\Jetpack\VideoPress\Initializer', 'register_videopress_video_block' )
		) {
			VideoPress_Pkg_Initializer::register_videopress_video_block();
		}
	}
);
